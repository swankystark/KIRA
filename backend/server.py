from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query, Request, Form
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
import shutil
import json
import google.generativeai as genai
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)

from models import (
    IssueCreate, Issue, IssueStatusUpdate,
    VerificationCreate, Verification, VerificationStats,
    Stats, TimelineItem, ChatRequest, ChatResponse, ExtractedData,
    AnalyzeRequest, AnalyzeResponse, AnalysisData,
    ImageValidationResult, EXIFData, HashMatch,
    ComplaintCreate, Complaint, ComplaintResponse, AssignedOfficer,
    Supervisor, ComplaintTimelineEvent
)

# Import image validation services (AFTER load_dotenv)
from services import sightengine_service, exif_service, hash_service, decision_engine, vision_service, officer_routing

# Debug: Print environment variables
print("\n" + "="*60)
print("🔧 ENVIRONMENT VARIABLES CHECK")
print("="*60)
print(f"SIGHTENGINE_API_USER: {os.environ.get('SIGHTENGINE_API_USER')}")
print(f"SIGHTENGINE_API_SECRET: {'***' + os.environ.get('SIGHTENGINE_API_SECRET', '')[-4:] if os.environ.get('SIGHTENGINE_API_SECRET') else 'None'}")
print(f"AI_GENERATION_THRESHOLD: {os.environ.get('AI_GENERATION_THRESHOLD', '0.8')}")
print("="*60 + "\n")


# Initialize Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables")

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
if not mongo_url:
      mongo_url = 'mongodb://localhost:27017' # Fallback
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'grievance_genie')]

# In-memory conversation storage
conversations: Dict[str, List[dict]] = {}

# Create the FastAPI app with lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Test MongoDB connection
    print("\n" + "="*60)
    print("🚀 Starting GrievanceGenie Backend")
    print("="*60)
    
    try:
        # Test MongoDB connection
        print(f"\n📡 Connecting to MongoDB...")
        print(f"   URL: {mongo_url[:50]}{'...' if len(mongo_url) > 50 else ''}")
        print(f"   Database: {os.environ.get('DB_NAME', 'grievance_genie')}")
        
        # Ping the database
        await client.admin.command('ping')
        
        # Get server info
        server_info = await client.server_info()
        
        print(f"\n✅ MongoDB Connected Successfully!")
        print(f"   Version: {server_info.get('version', 'Unknown')}")
        
        # Count existing collections
        db_name = os.environ.get('DB_NAME', 'grievance_genie')
        collections = await db.list_collection_names()
        if collections:
            print(f"   Collections: {len(collections)} found")
            for coll in collections:
                count = await db[coll].count_documents({})
                print(f"      - {coll}: {count} document(s)")
        else:
            print(f"   Collections: None (database is empty)")
        
        print("\n" + "="*60)
        print("✅ Backend Ready!")
        print("="*60)
        print(f"📍 API: http://localhost:5000/api")
        print(f"📍 Health: http://localhost:5000/api/health")
        print(f"📍 Docs: http://localhost:5000/docs")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ MongoDB Connection Failed!")
        print(f"   Error: {str(e)}")
        print(f"\n💡 Troubleshooting:")
        print(f"   1. Check if MongoDB is running: net start MongoDB")
        print(f"   2. Verify MONGO_URL in .env file")
        print(f"   3. For Atlas: Check network access settings")
        print("="*60 + "\n")
    
    yield
    
    # Shutdown: close the database client
    print("\n🔌 Closing MongoDB connection...")
    client.close()  # Synchronous method, no await needed
    print("✅ Backend shutdown complete.\n")

# Create the main app with lifespan handler
app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow frontend requests
# Get allowed origins from environment variable or use defaults
cors_origins = os.environ.get('CORS_ORIGINS', '').split(',') if os.environ.get('CORS_ORIGINS') else []
cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]

# Add default development origins
default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
cors_origins = list(set(cors_origins + default_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper functions
def generate_issue_id():
    """Generate unique issue ID in format GG-YYYY-NNNNN"""
    year = datetime.utcnow().year
    random_num = str(uuid.uuid4().int)[:5]
    return f"GG-{year}-{random_num.zfill(5)}"

def get_department_for_category(category: str) -> str:
    """Map category to department"""
    department_map = {
        "water": "Water Supply",
        "drainage": "Water & Sanitation",
        "roads": "Roads & Infrastructure",
        "garbage": "Sanitation",
        "electricity": "Electricity",
        "infrastructure": "Public Works",
        "others": "General Administration"
    }
    return department_map.get(category.lower() if category else "others", "General Administration")

def fallback_analysis(text: str) -> dict:
    """Simple fallback logic when AI fails"""
    lower = text.lower()
    category = 'others'
    severity = 'Medium'
    department = 'General Administration'
    
    if any(x in lower for x in ['water', 'leak', 'drainage']):
        category = 'drainage'
        department = 'Water & Sanitation'
    elif any(x in lower for x in ['road', 'pothole']):
        category = 'roads'
        department = 'Roads & Infrastructure'
    elif any(x in lower for x in ['garbage', 'trash']):
        category = 'garbage'
        department = 'Sanitation'
    elif any(x in lower for x in ['light', 'electricity']):
        category = 'electricity'
        department = 'Electricity'
        
    return {
        "category": category,
        "severity": severity,
        "department": department,
        "location": "Unknown Location"
    }

def _map_vision_to_user_category(vision_category: str) -> str:
    """Map vision category back to user category"""
    mapping = {
        "streetlight": "electricity",
        "garbage": "garbage",
        "pothole": "roads",
        "water_leak": "water",
        "sewage_overflow": "drainage",
        "road_damage": "roads",
        "drain_block": "drainage",
        "public_safety_other": "others",
        "unknown": "others"
    }
    return mapping.get(vision_category, "others")

def _generate_forensics_ui_feedback(forensics_analysis: Dict) -> Dict:
    """
    Generate non-blocking UI feedback for forensics classification
    
    STEP 7: UI FEEDBACK (NON-BLOCKING)
    Examples:
    • "📷 Original photo detected (95% confidence)"
    • "💬 WhatsApp image detected (89% confidence)" 
    • "📱 Screenshot detected (92% confidence)"
    If confidence < 70: "Image source unclear — may require review"
    """
    try:
        classification = forensics_analysis.get('classification_result', {})
        source = classification.get('source', 'UNKNOWN')
        confidence = classification.get('confidence', 0)
        recommendation = classification.get('recommendation', 'ACCEPT')
        
        # Generate user-friendly feedback
        feedback = {
            'show_feedback': True,
            'icon': '🔍',
            'message': 'Image source analysis completed',
            'confidence': confidence,
            'recommendation': recommendation,
            'technical_details': None
        }
        
        if source == 'ORIGINAL_PHOTO' and confidence >= 70:
            feedback.update({
                'icon': '📷',
                'message': f'Original photo detected ({confidence}% confidence)',
                'type': 'success',
                'technical_details': 'High authenticity - contains full camera metadata'
            })
        elif source == 'WHATSAPP' and confidence >= 70:
            feedback.update({
                'icon': '💬', 
                'message': f'WhatsApp image detected ({confidence}% confidence)',
                'type': 'info',
                'technical_details': 'Forwarded image - acceptable for reporting'
            })
        elif source == 'SCREENSHOT' and confidence >= 70:
            feedback.update({
                'icon': '📱',
                'message': f'Screenshot detected ({confidence}% confidence)', 
                'type': 'info',
                'technical_details': 'Screenshot image - acceptable for reporting'
            })
        elif confidence < 70:
            feedback.update({
                'icon': '⚠️',
                'message': 'Image source unclear — may require review',
                'type': 'warning',
                'technical_details': f'Low confidence classification ({confidence}%)'
            })
        else:
            feedback.update({
                'icon': '❓',
                'message': 'Image source could not be determined',
                'type': 'neutral',
                'technical_details': 'Unable to classify image source'
            })
        
        return feedback
        
    except Exception as e:
        logger.debug(f"UI feedback generation failed: {e}")
        return {
            'show_feedback': False,
            'icon': '🔍',
            'message': 'Image analysis completed',
            'confidence': 0,
            'recommendation': 'ACCEPT',
            'type': 'neutral'
        }

def _map_vision_severity(vision_severity: str) -> str:
    """Map vision severity to user severity format"""
    mapping = {
        "LOW": "Low",
        "MEDIUM": "Medium",
        "HIGH": "High"
    }
    return mapping.get(vision_severity, "Medium")

def fallback_conversation(user_message: str, conversation_history: List[dict]) -> dict:
    """Fallback conversation logic"""
    message_count = len(conversation_history)
    lower = user_message.lower()
    
    extracted_data = {
        "description": None,
        "category": None,
        "location": None,
        "severity": None
    }
    
    # Simple pattern matching
    if any(x in lower for x in ['drainage', 'water', 'leak']):
        extracted_data["category"] = 'drainage'
        extracted_data["description"] = 'Drainage/water related issue'
    if any(x in lower for x in ['road', 'pothole']):
        extracted_data["category"] = 'roads'
        extracted_data["description"] = 'Road related issue'
        
    # Extract location patterns
    location_patterns = [
        r"(?:no\.?\s*\d+|#\d+)", # House numbers
        r"(?:street|road|avenue|lane)",
        r"(?:chennai|bangalore|mumbai|delhi)"
    ]
    
    if any(re.search(pattern, user_message, re.IGNORECASE) for pattern in location_patterns):
        extracted_data["location"] = user_message # Use full message as location for now
        
    response = ''
    needs_more_info = True
    
    if message_count == 0:
        response = "Hello! I'm here to help you report civic issues. What problem are you facing?"
    elif not extracted_data["category"]:
        response = "I understand you have an issue. Could you tell me what type of problem it is? (water, roads, garbage, electricity, etc.)"
    elif not extracted_data["location"]:
        response = f"I see this is a {extracted_data['category']} issue. Could you please provide the specific location or address?"
    else:
        response = f"Thank you! I have the details about your {extracted_data['category']} issue at {extracted_data['location']}. Is there anything else you'd like to add?"
        needs_more_info = False
        
    return {
        "response": response,
        "needsMoreInfo": needs_more_info,
        "extractedData": extracted_data,
        "nextQuestion": "Please provide more details." if needs_more_info else None
    }

async def handle_conversation(conversation_id: str, user_message: str, conversation_history: List[dict] = []) -> dict:
    """Handle conversation with Gemini AI"""
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    for model_name in models_to_try:
        try:
            print(f"Attempting conversation with model: {model_name}")
            if not GEMINI_API_KEY:
                raise Exception("API Key missing")
            
            model = genai.GenerativeModel(model_name)
            
            # Build conversation context
            conversation_context = "\n".join([
                f"{msg.get('role', 'user')}: {msg.get('content', '')}" 
                for msg in conversation_history
            ])
            
            prompt = f"""You are a helpful civic issue reporting assistant. Your job is to have a natural conversation with citizens to collect information about civic problems like water leaks, potholes, garbage issues, etc.

IMPORTANT RULES:
1. Have a natural conversation - don't immediately ask for all details at once
2. Ask ONE question at a time to gather information gradually
3. Be empathetic and helpful
4. Only provide a final JSON summary when you have enough information AND the user seems ready to submit
5. Required information: issue description, category, location, severity (optional)
6. Categories: water, drainage, roads, garbage, electricity, infrastructure, others

Current conversation:
{conversation_context}

User's latest message: "{user_message}"

Respond in this JSON format:
{{
  "response": "Your conversational response to the user",
  "needsMoreInfo": true/false,
  "extractedData": {{
    "description": "extracted description or null",
    "category": "extracted category or null", 
    "location": "extracted location or null",
    "severity": "extracted severity or null"
  }},
  "nextQuestion": "What to ask next, or null if ready to submit"
}}

Be conversational and natural. Don't sound robotic."""

            response = await model.generate_content_async(prompt)
            text_str = response.text
            print(f"Success with {model_name}. Response length: {len(text_str)}")
            
            # Clean up potential markdown code blocks
            clean_json = text_str.replace('```json', '').replace('```', '').strip()
            
            return json.loads(clean_json)
            
        except Exception as e:
            print(f"Failed with model {model_name}: {str(e)}")
            if model_name == models_to_try[-1]:
                print("All models failed. Using fallback conversation system.")
                return fallback_conversation(user_message, conversation_history)
    
    return fallback_conversation(user_message, conversation_history)


# Routes
@api_router.get("/health")
async def health_check():
    return {"status": "ok", "message": "GrievanceGenie Backend is running"}

@api_router.get("/")
async def root():
    return {"message": "GrievanceGenie API v1.0"}

# Chat Endpoint
@api_router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    try:
        # Generate or use existing conversation ID
        conv_id = request.conversationId or f"conv_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:8]}"
        
        # Get conversation history
        # Prioritize request history, then memory, then empty
        history = request.history or conversations.get(conv_id, [])
        
        # Add user message to history
        # We need to adapt the structure to what our handle_conversation expects
        # and what the frontend expects.
        # Frontend sends: { role: 'user', content: message }
        
        # We'll use a local history compatible with the AI prompt
        prompt_history = history.copy()
        
        # Run AI
        ai_response = await handle_conversation(conv_id, request.message, prompt_history)
        
        # Update history with user message and AI response for storage
        new_history = prompt_history.copy()
        new_history.append({"role": "user", "content": request.message})
        new_history.append({
            "role": "assistant",
            "content": ai_response.get("response"),
            "extractedData": ai_response.get("extractedData")
        })
        
        conversations[conv_id] = new_history
        
        extracted_data = ai_response.get("extractedData", {})
        
        # Check submission readiness
        can_submit = (
            not ai_response.get("needsMoreInfo") and
            extracted_data.get("description") and
            extracted_data.get("category") and
            extracted_data.get("location")
        )
        
        return ChatResponse(
            success=True,
            conversationId=conv_id,
            response=ai_response.get("response"),
            needsMoreInfo=ai_response.get("needsMoreInfo"),
            extractedData=ExtractedData(**extracted_data) if extracted_data else None,
            nextQuestion=ai_response.get("nextQuestion"),
            canSubmit=can_submit
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Analyze Endpoint
@api_router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(request: AnalyzeRequest):
    if not request.description:
        raise HTTPException(status_code=400, detail="Description is required")
        
    try:
        # Use single-turn conversation for analysis
        ai_response = await handle_conversation("single_analysis", request.description, [])
        extracted = ai_response.get("extractedData", {})
        
        category = extracted.get("category") or 'others'
        severity = extracted.get("severity") or 'Medium'
        department = get_department_for_category(category)
        location = extracted.get("location") or 'Unknown Location'
        
        return AnalyzeResponse(
            success=True,
            data=AnalysisData(
                category=category,
                severity=severity,
                department=department,
                location=location,
                summary=f"Identified {severity} priority {category} issue."
            )
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        fallback = fallback_analysis(request.description)
        return AnalyzeResponse(
            success=True,
            data=AnalysisData(
                category=fallback["category"],
                severity=fallback["severity"],
                department=fallback["department"],
                location=fallback["location"],
                summary=f"Identified {fallback['severity']} priority {fallback['category']} issue."
            )
        )

# Image Validation Endpoint
@api_router.post("/validate-image", response_model=ImageValidationResult)
async def validate_image(
    image: UploadFile = File(...),
    issue_type: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None)
):
    """
    Validate uploaded image for authenticity and misuse detection.
    
    Pipeline:
    1. File format and size validation
    2. AI-generated image detection (Sightengine)
    3. EXIF metadata extraction and GPS validation
    4. Perceptual hash generation and duplicate detection
    5. Issue-image consistency check (placeholder)
    6. Final decision from decision engine
    """
    temp_file_path = None
    
    try:
        # STEP 1: Validate file format and size
        allowed_formats = os.environ.get("ALLOWED_IMAGE_FORMATS", "jpg,jpeg,png,webp").split(",")
        max_size_mb = int(os.environ.get("MAX_IMAGE_SIZE_MB", "10"))
        
        # Check file extension
        file_ext = image.filename.split(".")[-1].lower()
        if file_ext not in allowed_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Allowed formats: {', '.join(allowed_formats)}"
            )
        
        # Save to temporary location
        temp_filename = f"temp_{uuid.uuid4().hex}.{file_ext}"
        temp_file_path = UPLOAD_DIR / temp_filename
        
        # Save and check file size
        with open(temp_file_path, "wb") as buffer:
            content = await image.read()
            size_mb = len(content) / (1024 * 1024)
            
            if size_mb > max_size_mb:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size ({size_mb:.2f}MB) exceeds limit of {max_size_mb}MB"
                )
            
            buffer.write(content)
        
        logger.info(f"Validating image: {image.filename} ({size_mb:.2f}MB)")
        
        # STEP 2: AI-Generated Image Detection
        logger.info("Step 2: AI-generated image detection")
        ai_detection = sightengine_service.detect_ai_generated(str(temp_file_path))
        
        # STEP 3: EXIF Metadata Analysis
        logger.info("Step 3: EXIF metadata extraction")
        image_gps = exif_service.extract_gps_coordinates(str(temp_file_path))
        image_timestamp = exif_service.extract_timestamp(str(temp_file_path))
        camera_info = exif_service.extract_camera_info(str(temp_file_path))
        
        # Validate location if both GPS data and user location are available
        location_valid = False
        distance_km = None
        gps_address = None
        
        if image_gps and latitude is not None and longitude is not None:
            user_coords = (latitude, longitude)
            location_valid = exif_service.validate_location(image_gps, user_coords)
            distance_km = exif_service.calculate_distance(image_gps, user_coords)
        
        # Get human-readable address from GPS coordinates
        if image_gps:
            gps_address = exif_service.reverse_geocode(image_gps[0], image_gps[1])
        
        exif_data = {
            "has_gps": image_gps is not None,
            "gps_coordinates": {
                "latitude": image_gps[0] if image_gps else None,
                "longitude": image_gps[1] if image_gps else None
            } if image_gps else None,
            "gps_address": gps_address.get("address") if gps_address else None,
            "gps_city": gps_address.get("city") if gps_address else None,
            "gps_state": gps_address.get("state") if gps_address else None,
            "gps_country": gps_address.get("country") if gps_address else None,
            "location_valid": location_valid if image_gps else False,
            "timestamp": image_timestamp.isoformat() if image_timestamp else None,
            "distance_km": distance_km,
            "camera_make": camera_info.get("camera_make"),
            "camera_model": camera_info.get("camera_model"),
            "max_allowed_km": float(os.environ.get("LOCATION_RADIUS_KM", "10"))
        }
        
        # STEP 4: Perceptual Hash and Duplicate Detection
        logger.info("Step 4: Perceptual hash generation and duplicate check")
        image_phash = hash_service.generate_phash(str(temp_file_path))
        similar_hashes = await hash_service.find_similar_hashes(image_phash)
        
        hash_match_data = {
            "is_duplicate": len(similar_hashes) > 0,
            "similarity_score": similar_hashes[0]["similarity_score"] if similar_hashes else 0.0,
            "original_issue_id": similar_hashes[0]["issue_id"] if similar_hashes else None
        }
        
        # STEP 5: Image Source Forensics (AFTER AI detection, BEFORE issue classification)
        logger.info("Step 5: Image source forensics classification")
        try:
            from utils.imageForensics import ImageSourceForensics
            
            # Read image buffer for forensics
            with open(temp_file_path, 'rb') as f:
                image_buffer = f.read()
            
            # Run complete forensics classification
            forensics = ImageSourceForensics()
            classification_result = forensics.classify_image(image_buffer, str(temp_file_path), image.filename)
            
            # Create forensics analysis for backward compatibility
            source_mapping = {
                'WHATSAPP': 'WHATSAPP_IMAGE',
                'SCREENSHOT': 'SCREENSHOT_IMAGE', 
                'ORIGINAL_PHOTO': 'ORIGINAL_PHONE_PHOTO',
                'UNKNOWN': 'UNKNOWN'
            }
            
            forensics_analysis = {
                'source_type': source_mapping.get(classification_result['source'], 'UNKNOWN'),
                'confidence_score': classification_result['confidence'] / 100.0,
                'evidence': [],
                'classification_result': classification_result,
                'forensics_version': '3.0'
            }
            
            # Extract evidence from best match
            if classification_result['source'] != 'UNKNOWN':
                breakdown = classification_result['breakdown']
                best_source = classification_result['source'].lower()
                if best_source in breakdown:
                    forensics_analysis['evidence'] = breakdown[best_source].get('evidence', [])
            
            logger.info(f"Forensics: {classification_result['source']} "
                       f"({classification_result['confidence']}% confidence, "
                       f"{classification_result['recommendation']})")
            
            # SAFETY: Never reject based solely on image source
            # This is for confidence scoring, audit trail, and user feedback only
            
        except Exception as e:
            logger.warning(f"Forensics analysis failed gracefully: {str(e)}")
            # Graceful fallback - never block submission due to forensics failure
            forensics_analysis = {
                'source_type': 'UNKNOWN',
                'confidence_score': 0.0,
                'evidence': [f'Analysis failed: {str(e)}'],
                'classification_result': {
                    'source': 'UNKNOWN',
                    'confidence': 0,
                    'recommendation': 'ACCEPT',  # Default to accept on failure
                    'breakdown': {},
                    'error': str(e)
                },
                'forensics_version': '3.0'
            }

        # STEP 6: Image Content Understanding & Issue Extraction (Gemini Vision)
        logger.info("Step 6: Vision analysis - content understanding")
        vision_analysis = vision_service.analyze_image_content(
            image_path=str(temp_file_path),
            user_issue_type=issue_type,
            additional_context={
                "latitude": latitude,
                "longitude": longitude
            }
        )
        
        # Legacy issue_match for backward compatibility
        issue_match = {
            "is_match": vision_analysis.get("issue_match_status") == "MATCH" if not vision_analysis.get("skipped") else True,
            "expected_type": issue_type,
            "detected_type": vision_analysis.get("issue_type_detected") if not vision_analysis.get("skipped") else None
        }
        
        # STEP 7: Decision Engine
        logger.info("Step 7: Running decision engine")
        validation_results = {
            "ai_detection": ai_detection,
            "exif_data": exif_data,
            "hash_match": hash_match_data,
            "issue_match": issue_match,
            "vision_analysis": vision_analysis,
            "forensics_analysis": forensics_analysis  # NEW
        }
        
        decision = decision_engine.make_decision(validation_results)
        
        # Generate user-friendly message
        if decision["status"] == "rejected":
            message = decision_engine.get_rejection_message(decision["reason_codes"])
        else:
            message = "Image validation passed successfully."
            if decision["reason_codes"]:
                # Warnings present but not rejected
                message += " Note: " + decision_engine.get_rejection_message(decision["reason_codes"])
        
        # Add message and vision analysis to decision
        decision["message"] = message
        
        # STEP 7: Add UI feedback for forensics (non-blocking)
        decision["forensics_ui_feedback"] = _generate_forensics_ui_feedback(forensics_analysis)
        
        # Add extracted issue data for auto-fill (if vision analysis succeeded)
        # Include even for rejected images so user can review and correct
        if vision_analysis and not vision_analysis.get("skipped", False):
            extracted_data = {
                "category": _map_vision_to_user_category(vision_analysis.get("issue_type_detected")),
                "severity": _map_vision_severity(vision_analysis.get("severity")),
                "description": vision_analysis.get("visual_summary"),
                "detected_objects": vision_analysis.get("detected_objects", []),
                "confidence": vision_analysis.get("confidence_score", 0)
            }
            decision["extracted_issue_data"] = extracted_data
            
            # Console log for debugging
            print("\n" + "="*60)
            print("🎯 EXTRACTED ISSUE DATA FROM VISION ANALYSIS")
            print("="*60)
            print(f"Status: {decision['status']}")
            print(f"Category: {extracted_data['category']}")
            print(f"Severity: {extracted_data['severity']}")
            print(f"Description: {extracted_data['description']}")
            print(f"Objects: {extracted_data['detected_objects']}")
            print(f"Confidence: {extracted_data['confidence']}%")
            print("="*60 + "\n")
        else:
            print("\n⚠️  Vision analysis skipped - no extracted data available\n")
        
        # SAVE TO DATABASE - Store complete validation record
        try:
            validation_id = f"VAL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            
            # Prepare validation record
            validation_record = {
                "validation_id": validation_id,
                "created_at": datetime.utcnow(),
                
                # Image info
                "image": {
                    "filename": image.filename,
                    "path": str(temp_file_path) if temp_file_path else None,
                    "url": None,  # Will be set when moved to permanent location
                    "size_bytes": size_mb * 1024 * 1024,
                    "format": image.content_type
                },
                
                # Validation results
                "validation": {
                    "status": decision["status"],
                    "confidence_score": decision["confidence_score"],
                    "reason_codes": decision["reason_codes"],
                    "message": decision["message"]
                },
                
                # AI detection
                "ai_detection": {
                    "ai_probability": ai_detection.get("ai_probability", 0.0),
                    "is_ai_generated": ai_detection.get("is_ai_generated", False),
                    "threshold": float(os.environ.get("AI_GENERATION_THRESHOLD", "0.8")),
                    "service": "sightengine",
                    "skipped": ai_detection.get("skipped", False),
                    "error": ai_detection.get("error")
                },
                
                # EXIF data
                "exif": {
                    "has_data": exif_data.get("has_gps") or exif_data.get("camera_make") is not None,
                    "camera": {
                        "make": exif_data.get("camera_make"),
                        "model": exif_data.get("camera_model")
                    },
                    "timestamp": image_timestamp.isoformat() if image_timestamp else None,
                    "gps": {
                        "has_gps": exif_data.get("has_gps", False),
                        "coordinates": exif_data.get("gps_coordinates"),
                        "address": {
                            "formatted": exif_data.get("gps_address"),
                            "city": exif_data.get("gps_city"),
                            "state": exif_data.get("gps_state"),
                            "country": exif_data.get("gps_country"),
                            "postcode": None  # Can be extracted from address if needed
                        } if exif_data.get("has_gps") else None,
                        "location_valid": exif_data.get("location_valid", False),
                        "distance_km": exif_data.get("distance_km"),
                        "user_location": {
                            "latitude": latitude,
                            "longitude": longitude
                        } if latitude and longitude else None
                    } if exif_data.get("has_gps") else None
                },
                
                # Hash data
                "hash": {
                    "perceptual_hash": hash_match_data.get("hash_value"),
                    "algorithm": "pHash",
                    "is_duplicate": hash_match_data.get("is_duplicate", False),
                    "similarity_score": hash_match_data.get("similarity_score", 0),
                    "original_issue_id": hash_match_data.get("original_issue_id"),
                    "matched_hash_id": hash_match_data.get("matched_hash_id")
                },
                
                # Vision Analysis (NEW)
                "vision": {
                    "enabled": not vision_analysis.get("skipped", False),
                    "visual_summary": vision_analysis.get("visual_summary"),
                    "detected_objects": vision_analysis.get("detected_objects", []),
                    "issue_type_detected": vision_analysis.get("issue_type_detected"),
                    "issue_match_status": vision_analysis.get("issue_match_status"),
                    "severity": vision_analysis.get("severity"),
                    "confidence_score": vision_analysis.get("confidence_score", 0),
                    "final_flag": vision_analysis.get("final_flag"),
                    "reasoning": vision_analysis.get("reasoning"),
                    "model": "gemini-vision",
                    "error": vision_analysis.get("error")
                } if vision_analysis else None,
                
                # Image Source Forensics (NEW)
                "forensics": {
                    "enabled": forensics_analysis.get("source_type") != "UNKNOWN",
                    "source_type": forensics_analysis.get("source_type"),
                    "confidence_score": forensics_analysis.get("confidence_score", 0.0),
                    "evidence": forensics_analysis.get("evidence", []),
                    "byte_analysis": forensics_analysis.get("byte_analysis", {}),
                    "metadata_analysis": forensics_analysis.get("metadata_analysis", {}),
                    "compression_analysis": forensics_analysis.get("compression_analysis", {}),
                    "filename_analysis": forensics_analysis.get("filename_analysis", {}),
                    "forensics_version": forensics_analysis.get("forensics_version", "1.0")
                } if forensics_analysis else None,
                
                # Issue association (if provided)
                "issue": {
                    "issue_id": issue_id if 'issue_id' in locals() else None,
                    "issue_type": issue_type if 'issue_type' in locals() else None
                },
                
                # Metadata
                "metadata": {
                    "validation_version": "4.0"  # Updated to 4.0 with complete forensics classification
                }
            }
            
            # Insert into MongoDB
            result = await db.image_validations.insert_one(validation_record)
            logger.info(f"✅ Validation record saved: {validation_id} (MongoDB ID: {result.inserted_id})")
            print(f"\n💾 Saved to database: {validation_id}")
            
        except Exception as e:
            logger.error(f"Failed to save validation record to database: {str(e)}")
            print(f"⚠️  Database save failed: {str(e)}")
            # Don't fail the entire validation if database save fails
        
        # Clean up temporary file if rejected
        if decision["status"] == "rejected" and temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
            logger.info("Removed temporary file for rejected image")
        
        logger.info(f"Validation complete: {decision['status'].upper()}")
        
        # Console log the complete response for debugging
        print("\n" + "="*60)
        print("📤 SENDING RESPONSE TO FRONTEND")
        print("="*60)
        print(f"Status: {decision['status']}")
        print(f"Confidence: {decision['confidence_score']:.2%}")
        print(f"Reason Codes: {decision['reason_codes']}")
        
        # Forensics results
        if decision.get('forensics_analysis'):
            forensics = decision['forensics_analysis']
            version = forensics_analysis.get('forensics_version', '1.0')
            print(f"\n🔍 Forensics Analysis v{version}:")
            print(f"   Source: {forensics['source_type']}")
            print(f"   Confidence: {forensics['confidence_score']:.2%}")
            print(f"   Evidence: {', '.join(forensics['evidence'][:3])}{'...' if len(forensics['evidence']) > 3 else ''}")
            
            # Show classification details if available (v3.0+)
            if 'classification_result' in forensics_analysis:
                classification = forensics_analysis['classification_result']
                print(f"   Classification: {classification['source']} ({classification['confidence']}%)")
                print(f"   Recommendation: {classification['recommendation']}")
                
                # Show breakdown
                breakdown = classification.get('breakdown', {})
                if breakdown:
                    print(f"   Breakdown:")
                    for source, details in breakdown.items():
                        if details['confidence'] > 0:
                            markers = details.get('active_markers', 0)
                            print(f"     {source}: {details['confidence']}% ({markers} markers)")
        else:
            print(f"\n⚠️  Forensics analysis failed or unavailable")
        
        if decision.get('extracted_issue_data'):
            print("\n✅ Extracted Issue Data:")
            print(f"   Category: {decision['extracted_issue_data']['category']}")
            print(f"   Severity: {decision['extracted_issue_data']['severity']}")
            print(f"   Description: {decision['extracted_issue_data']['description'][:100]}...")
        else:
            print("\n⚠️  No extracted issue data (vision analysis skipped)")
        print("="*60 + "\n")
        
        return ImageValidationResult(**decision)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        raise
    except Exception as e:
        # Clean up on error
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        
        logger.error(f"Image validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image validation failed: {str(e)}")

# Complaint Creation Endpoint (Phase 1)
@api_router.post("/complaints/create", response_model=ComplaintResponse)
async def create_complaint(
    citizen_name: str = Form(...),
    citizen_phone: Optional[str] = Form(None),
    category: str = Form(...),
    severity: str = Form(...),
    description: str = Form(...),
    ward: int = Form(...),
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: UploadFile = File(...),
    validation_record_id: Optional[str] = Form(None)
):
    """
    Create a new complaint with automatic officer assignment.
    
    Flow:
    1. Save image to permanent storage
    2. Assign officer based on ward + department
    3. Create complaint in MongoDB
    4. Return complaint ID + officer details
    """
    try:
        logger.info(f"\n{'='*60}")
        logger.info(f"CREATING COMPLAINT")
        logger.info(f"{'='*60}")
        logger.info(f"Citizen: {citizen_name}")
        logger.info(f"Category: {category}, Severity: {severity}")
        logger.info(f"Ward: {ward}, Location: {location}")
        
        # STEP 1: Save image to permanent storage
        file_ext = image.filename.split(".")[-1].lower()
        complaint_id = generate_issue_id()  # Reuse existing function
        image_filename = f"{complaint_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
        
        # Create complaints directory if it doesn't exist
        complaints_dir = UPLOAD_DIR / "complaints"
        complaints_dir.mkdir(parents=True, exist_ok=True)
        
        image_path = complaints_dir / image_filename
        
        # Save image
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        image_url = f"/uploads/complaints/{image_filename}"
        logger.info(f"✅ Image saved: {image_url}")
        
        # STEP 2: Assign officer based on ward + department
        officer_id = officer_routing.assign_officer(ward, category)
        
        assigned_officer_data = None
        needs_manual_routing = False
        status = "pending"
        
        if officer_id:
            # Fetch officer details from MongoDB
            officer_details = await officer_routing.get_officer_details(db, officer_id)
            
            if officer_details:
                assigned_officer_data = AssignedOfficer(
                    officer_id=officer_details["officer_id"],
                    name=officer_details["name"],
                    title=officer_details["title"],
                    department=officer_details["department"],
                    ward=officer_details.get("ward")
                )
                status = "assigned"
                logger.info(f"✅ Officer assigned: {officer_details['name']} ({officer_details['title']})")
            else:
                logger.warning(f"⚠️ Officer ID {officer_id} not found in database")
                needs_manual_routing = True
        else:
            logger.warning(f"⚠️ No officer found for Ward {ward}, Category {category}")
            needs_manual_routing = True
            status = "unassigned"
        
        # STEP 3: Create complaint in MongoDB
        complaint_doc = {
            "complaint_id": complaint_id,
            "citizen": {
                "name": citizen_name,
                "phone": citizen_phone
            },
            "category": category,
            "severity": severity,
            "description": description,
            "location": {
                "lat": latitude,
                "lng": longitude,
                "address": location,
                "ward": ward
            },
            "image_url": image_url,
            "assigned_officer": assigned_officer_data.dict() if assigned_officer_data else None,
            "status": status,
            "needs_manual_routing": needs_manual_routing,
            "validation_record_id": validation_record_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.complaints.insert_one(complaint_doc)
        logger.info(f"✅ Complaint created: {complaint_id} (MongoDB ID: {result.inserted_id})")
        
        # STEP 4: Prepare response
        response_message = f"Complaint {complaint_id} created successfully"
        
        if assigned_officer_data:
            response_message += f" and assigned to {assigned_officer_data.name}"
        elif needs_manual_routing:
            response_message += " - awaiting manual officer assignment"
        
        logger.info(f"{'='*60}\n")
        
        return ComplaintResponse(
            complaint_id=complaint_id,
            assigned_officer={
                "id": assigned_officer_data.officer_id,
                "name": assigned_officer_data.name,
                "title": assigned_officer_data.title,
                "department": assigned_officer_data.department,
                "ward": assigned_officer_data.ward
            } if assigned_officer_data else None,
            status=status,
            message=response_message
        )
        
    except Exception as e:
        logger.error(f"Complaint creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create complaint: {str(e)}")

# ================================================================
# PHASE 2: OFFICER DASHBOARD ENDPOINTS
# ================================================================

@api_router.post("/officer/login")
async def officer_login(
    officer_id: str = Form(...),
    password: str = Form(...)
):
    """
    Simple officer login for demo.
    Validates officer_id and password, returns officer details.
    """
    logger.info(f"Officer login attempt: {officer_id}")
    
    # Find officer
    officer = await db.officers.find_one({"officer_id": officer_id})
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    # Check password (simple plaintext for demo)
    stored_password = officer.get("password", "officer123")  # Default password
    if password != stored_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    logger.info(f"✅ Officer logged in: {officer['name']}")
    
    return {
        "success": True,
        "officer": {
            "officer_id": officer["officer_id"],
            "name": officer["name"],
            "title": officer["title"],
            "department": officer["department"],
            "wards": officer.get("wards", []),
            "email": officer.get("email"),
            "phone": officer.get("phone")
        }
    }

@api_router.get("/officer/complaints")
async def get_officer_complaints(officer_id: str = Query(...)):
    """
    Get all complaints assigned to a specific officer.
    """
    logger.info(f"Fetching complaints for officer: {officer_id}")
    
    # Find complaints assigned to this officer
    cursor = db.complaints.find(
        {"assigned_officer.officer_id": officer_id}
    ).sort("created_at", -1)
    
    complaints = await cursor.to_list(length=100)
    
    # Convert ObjectId to string
    for c in complaints:
        c["_id"] = str(c["_id"])
    
    logger.info(f"Found {len(complaints)} complaints for {officer_id}")
    
    return {
        "officer_id": officer_id,
        "total": len(complaints),
        "complaints": complaints
    }

@api_router.get("/complaints/{complaint_id}")
async def get_complaint_detail(complaint_id: str):
    """
    Get full details of a single complaint.
    """
    logger.info(f"Fetching complaint: {complaint_id}")
    
    complaint = await db.complaints.find_one({"complaint_id": complaint_id})
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Convert ObjectId to string
    complaint["_id"] = str(complaint["_id"])
    
    return complaint

@api_router.put("/complaints/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: str,
    status: str = Form(...),
    notes: Optional[str] = Form(None)
):
    """
    Update complaint status.
    """
    logger.info(f"Updating complaint {complaint_id} status to: {status}")
    
    result = await db.complaints.update_one(
        {"complaint_id": complaint_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            },
            "$push": {
                "status_history": {
                    "status": status,
                    "notes": notes,
                    "timestamp": datetime.utcnow()
                }
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return {"success": True, "message": f"Status updated to {status}"}

# Issue Management
@api_router.post("/issues", response_model=Issue)
@api_router.post("/report", response_model=Issue) # Alias for compatibility
async def create_issue(issue_data: IssueCreate):
    """Create a new civic issue"""
    issue_id = generate_issue_id()
    department = get_department_for_category(issue_data.category)
    
    now = datetime.utcnow()
    issue_dict = issue_data.dict()
    issue_dict.update({
        "id": issue_id,
        "department": department,
        "status": "verifying",
        "photos": [],
        "reported_at": now,
        "updated_at": now,
        "timeline": [
            {"status": "Reported", "date": now},
            {"status": "Being verified", "date": now}
        ]
    })
    
    await db.issues.insert_one(issue_dict)
    logger.info(f"Created issue: {issue_id}")
    
    return Issue(**issue_dict)

@api_router.post("/issues/{issue_id}/photos")
async def upload_issue_photos(issue_id: str, photos: List[UploadFile] = File(...)):
    """Upload photos for an issue with validation"""
    # Check if issue exists
    issue = await db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    photo_urls = []
    validation_results = []
    backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000')
    
    # Get issue details for validation
    issue_type = issue.get("category", "others")
    issue_coords = issue.get("coordinates", {})
    user_lat = issue_coords.get("lat") if isinstance(issue_coords, dict) else None
    user_lng = issue_coords.get("lng") if isinstance(issue_coords, dict) else None
    
    for photo in photos:
        try:
            # STEP 1: Save to temporary location first
            allowed_formats = os.environ.get("ALLOWED_IMAGE_FORMATS", "jpg,jpeg,png,webp").split(",")
            file_ext = photo.filename.split(".")[-1].lower()
            
            if file_ext not in allowed_formats:
                validation_results.append({
                    "filename": photo.filename,
                    "status": "rejected",
                    "reason": f"Invalid format. Allowed: {', '.join(allowed_formats)}"
                })
                continue
            
            # Save temporarily
            temp_filename = f"temp_{uuid.uuid4().hex}.{file_ext}"
            temp_file_path = UPLOAD_DIR / temp_filename
            
            with open(temp_file_path, "wb") as buffer:
                content = await photo.read()
                size_mb = len(content) / (1024 * 1024)
                max_size_mb = int(os.environ.get("MAX_IMAGE_SIZE_MB", "10"))
                
                if size_mb > max_size_mb:
                    temp_file_path.unlink() if temp_file_path.exists() else None
                    validation_results.append({
                        "filename": photo.filename,
                        "status": "rejected",
                        "reason": f"File too large ({size_mb:.2f}MB > {max_size_mb}MB)"
                    })
                    continue
                
                buffer.write(content)
            
            logger.info(f"Validating photo: {photo.filename} for issue {issue_id}")
            
            # STEP 2: Run validation pipeline
            # AI Detection
            ai_detection = sightengine_service.detect_ai_generated(str(temp_file_path))
            
            # EXIF Analysis
            image_gps = exif_service.extract_gps_coordinates(str(temp_file_path))
            image_timestamp = exif_service.extract_timestamp(str(temp_file_path))
            camera_info = exif_service.extract_camera_info(str(temp_file_path))
            
            location_valid = False
            distance_km = None
            
            if image_gps and user_lat is not None and user_lng is not None:
                user_coords = (user_lat, user_lng)
                location_valid = exif_service.validate_location(image_gps, user_coords)
                distance_km = exif_service.calculate_distance(image_gps, user_coords)
            
            exif_data = {
                "has_gps": image_gps is not None,
                "location_valid": location_valid if image_gps else False,
                "timestamp": image_timestamp.isoformat() if image_timestamp else None,
                "distance_km": distance_km,
                "camera_make": camera_info.get("camera_make"),
                "camera_model": camera_info.get("camera_model"),
                "max_allowed_km": float(os.environ.get("LOCATION_RADIUS_KM", "10"))
            }
            
            # Perceptual Hash & Duplicate Check
            image_phash = hash_service.generate_phash(str(temp_file_path))
            similar_hashes = await hash_service.find_similar_hashes(image_phash)
            
            hash_match_data = {
                "is_duplicate": len(similar_hashes) > 0,
                "similarity_score": similar_hashes[0]["similarity_score"] if similar_hashes else 0.0,
                "original_issue_id": similar_hashes[0]["issue_id"] if similar_hashes else None
            }
            
            # Image Source Forensics (AFTER AI detection, BEFORE issue classification)
            logger.info(f"Running forensics classification for {photo.filename}")
            try:
                from utils.imageForensics import ImageSourceForensics
                
                # Read image buffer for forensics
                with open(temp_file_path, 'rb') as f:
                    image_buffer = f.read()
                
                # Run complete forensics classification
                forensics = ImageSourceForensics()
                classification_result = forensics.classify_image(image_buffer, str(temp_file_path), photo.filename)
                
                # Create forensics analysis for backward compatibility
                source_mapping = {
                    'WHATSAPP': 'WHATSAPP_IMAGE',
                    'SCREENSHOT': 'SCREENSHOT_IMAGE', 
                    'ORIGINAL_PHOTO': 'ORIGINAL_PHONE_PHOTO',
                    'UNKNOWN': 'UNKNOWN'
                }
                
                forensics_analysis = {
                    'source_type': source_mapping.get(classification_result['source'], 'UNKNOWN'),
                    'confidence_score': classification_result['confidence'] / 100.0,
                    'evidence': [],
                    'classification_result': classification_result,
                    'forensics_version': '3.0'
                }
                
                # Extract evidence from best match
                if classification_result['source'] != 'UNKNOWN':
                    breakdown = classification_result['breakdown']
                    best_source = classification_result['source'].lower()
                    if best_source in breakdown:
                        forensics_analysis['evidence'] = breakdown[best_source].get('evidence', [])
                
                logger.info(f"Forensics: {classification_result['source']} "
                           f"({classification_result['confidence']}% confidence)")
                
                # SAFETY: Never reject based solely on image source
                
            except Exception as e:
                logger.warning(f"Forensics analysis failed gracefully: {str(e)}")
                # Graceful fallback - never block submission
                forensics_analysis = {
                    'source_type': 'UNKNOWN',
                    'confidence_score': 0.0,
                    'evidence': [f'Analysis failed: {str(e)}'],
                    'classification_result': {
                        'source': 'UNKNOWN',
                        'confidence': 0,
                        'recommendation': 'ACCEPT',
                        'breakdown': {},
                        'error': str(e)
                    },
                    'forensics_version': '3.0'
                }

            # Vision Analysis - Content Understanding (NEW)
            logger.info(f"Running vision analysis for {photo.filename}")
            vision_analysis = vision_service.analyze_image_content(
                image_path=str(temp_file_path),
                user_issue_type=issue_type,
                additional_context={
                    "latitude": user_lat,
                    "longitude": user_lng,
                    "issue_id": issue_id
                }
            )
            
            # Legacy issue_match for backward compatibility
            issue_match = {
                "is_match": vision_analysis.get("issue_match_status") == "MATCH" if not vision_analysis.get("skipped") else True,
                "expected_type": issue_type,
                "detected_type": vision_analysis.get("issue_type_detected") if not vision_analysis.get("skipped") else None
            }
            
            # STEP 3: Decision Engine
            validation_data = {
                "ai_detection": ai_detection,
                "exif_data": exif_data,
                "hash_match": hash_match_data,
                "issue_match": issue_match,
                "vision_analysis": vision_analysis,
                "forensics_analysis": forensics_analysis  # NEW
            }
            
            decision = decision_engine.make_decision(validation_data)
            
            # STEP 4: Handle decision
            if decision["status"] == "rejected":
                # Delete temporary file
                temp_file_path.unlink() if temp_file_path.exists() else None
                
                message = decision_engine.get_rejection_message(decision["reason_codes"])
                validation_results.append({
                    "filename": photo.filename,
                    "status": "rejected",
                    "reason": message,
                    "details": decision
                })
                logger.warning(f"Photo rejected: {photo.filename} - {message}")
                continue
            
            # STEP 5: Photo accepted - move to permanent location
            unique_filename = f"{issue_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
            final_file_path = UPLOAD_DIR / unique_filename
            
            # Rename temp file to final
            temp_file_path.rename(final_file_path)
            
            photo_url = f"{backend_url}/uploads/{unique_filename}"
            photo_urls.append(photo_url)
            
            # Store hash for future duplicate detection
            await hash_service.store_hash(
                issue_id=issue_id,
                phash=image_phash,
                image_path=str(final_file_path),
                status="pending"  # Will be updated to 'resolved' when issue is resolved
            )
            
            validation_results.append({
                "filename": photo.filename,
                "status": "accepted",
                "url": photo_url,
                "confidence_score": decision["confidence_score"],
                "warnings": decision["reason_codes"] if decision["reason_codes"] else []
            })
            
            logger.info(f"Photo accepted: {photo.filename} - Confidence: {decision['confidence_score']:.2%}")
            
        except Exception as e:
            logger.error(f"Error processing photo {photo.filename}: {str(e)}")
            validation_results.append({
                "filename": photo.filename,
                "status": "error",
                "reason": str(e)
            })
    
    # Update issue with accepted photo URLs only
    if photo_urls:
        await db.issues.update_one(
            {"id": issue_id},
            {"$push": {"photos": {"$each": photo_urls}}}
        )
    
    # Return comprehensive results
    accepted_count = len([r for r in validation_results if r["status"] == "accepted"])
    rejected_count = len([r for r in validation_results if r["status"] == "rejected"])
    
    logger.info(
        f"Photo upload complete for issue {issue_id}: "
        f"{accepted_count} accepted, {rejected_count} rejected"
    )
    
    return {
        "photos": photo_urls,
        "validation_results": validation_results,
        "summary": {
            "total": len(validation_results),
            "accepted": accepted_count,
            "rejected": rejected_count
        }
    }

@api_router.get("/issues", response_model=List[Issue])
async def get_issues(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    verification: Optional[str] = Query(None)
):
    """Get all issues with optional filters"""
    query = {}
    
    if status and status != "all":
        query["status"] = status
    
    if category and category != "all":
        query["category"] = category
    
    issues = await db.issues.find(query).sort("reported_at", -1).to_list(1000)
    
    # Filter by verification if needed
    if verification and verification != "all":
        filtered_issues = []
        for issue in issues:
            # Get verification stats
            verifications = await db.verifications.find({"issue_id": issue["id"]}).to_list(1000)
            yes_count = sum(1 for v in verifications if v["response"] == "yes")
            
            if verification == "verified" and yes_count >= 3:
                filtered_issues.append(issue)
            elif verification == "unverified" and yes_count < 3:
                filtered_issues.append(issue)
        
        issues = filtered_issues
    
    # Add verification counts to each issue
    result_issues = []
    for issue in issues:
        verifications = await db.verifications.find({"issue_id": issue["id"]}).to_list(1000)
        issue["verifications"] = {
            "yes": sum(1 for v in verifications if v["response"] == "yes"),
            "no": sum(1 for v in verifications if v["response"] == "no"),
            "not_sure": sum(1 for v in verifications if v["response"] == "not_sure"),
            "total": len(verifications)
        }
        result_issues.append(Issue(**issue))
    
    return result_issues

@api_router.get("/issues/{issue_id}", response_model=Issue)
async def get_issue(issue_id: str):
    """Get single issue details"""
    issue = await db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Add verification stats
    verifications = await db.verifications.find({"issue_id": issue_id}).to_list(1000)
    issue["verifications"] = {
        "yes": sum(1 for v in verifications if v["response"] == "yes"),
        "no": sum(1 for v in verifications if v["response"] == "no"),
        "not_sure": sum(1 for v in verifications if v["response"] == "not_sure"),
        "total": len(verifications)
    }
    
    return Issue(**issue)

@api_router.put("/issues/{issue_id}/status", response_model=Issue)
async def update_issue_status(issue_id: str, update_data: IssueStatusUpdate):
    """Update issue status (officer only)"""
    issue = await db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    now = datetime.utcnow()
    
    # Map status to timeline label
    status_label_map = {
        "reported": "Reported",
        "verifying": "Being verified",
        "assigned": "Assigned",
        "in_progress": "In Progress",
        "resolved": "Resolved"
    }
    
    # Add to timeline if status is changing
    if issue["status"] != update_data.status:
        timeline = issue.get("timeline", [])
        timeline.append({
            "status": status_label_map.get(update_data.status, update_data.status),
            "date": now
        })
        
        await db.issues.update_one(
            {"id": issue_id},
            {
                "$set": {
                    "status": update_data.status,
                    "updated_at": now,
                    "timeline": timeline
                }
            }
        )
    
    # Update hash status if issue is being resolved
    if update_data.status == "resolved":
        await hash_service.update_hash_status(issue_id, "resolved")
        logger.info(f"Updated hash status to 'resolved' for issue {issue_id}")
    
    # Get updated issue
    updated_issue = await db.issues.find_one({"id": issue_id})
    
    # Add verification stats
    verifications = await db.verifications.find({"issue_id": issue_id}).to_list(1000)
    updated_issue["verifications"] = {
        "yes": sum(1 for v in verifications if v["response"] == "yes"),
        "no": sum(1 for v in verifications if v["response"] == "no"),
        "not_sure": sum(1 for v in verifications if v["response"] == "not_sure"),
        "total": len(verifications)
    }
    
    logger.info(f"Updated issue {issue_id} status to {update_data.status}")
    return Issue(**updated_issue)

# Verification Management
@api_router.post("/verifications", response_model=Verification)
async def create_verification(verification_data: VerificationCreate):
    """Submit community verification"""
    # Check if issue exists
    issue = await db.issues.find_one({"id": verification_data.issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    verification_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    verification_dict = verification_data.dict()
    verification_dict.update({
        "id": verification_id,
        "verified_at": now
    })
    
    await db.verifications.insert_one(verification_dict)
    logger.info(f"Added verification for issue {verification_data.issue_id}")
    
    return Verification(**verification_dict)

@api_router.get("/issues/{issue_id}/verifications", response_model=VerificationStats)
async def get_issue_verifications(issue_id: str):
    """Get verification stats for an issue"""
    verifications = await db.verifications.find({"issue_id": issue_id}).to_list(1000)
    
    stats = VerificationStats(
        yes=sum(1 for v in verifications if v["response"] == "yes"),
        no=sum(1 for v in verifications if v["response"] == "no"),
        not_sure=sum(1 for v in verifications if v["response"] == "not_sure"),
        total=len(verifications)
    )
    
    return stats

# Statistics
@api_router.get("/stats", response_model=Stats)
async def get_stats():
    """Get dashboard statistics"""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    # New today
    new_today = await db.issues.count_documents({
        "reported_at": {"$gte": today}
    })
    
    # In verification
    verifying = await db.issues.count_documents({"status": "verifying"})
    
    # In progress
    in_progress = await db.issues.count_documents({"status": "in_progress"})
    
    # Resolved this week
    resolved_this_week = await db.issues.count_documents({
        "status": "resolved",
        "updated_at": {"$gte": week_ago}
    })
    
    # Unverified (no verifications yet)
    # This is inefficient for large datasets but works for now; can be optimized with aggregation
    all_issues = await db.issues.find().to_list(1000)
    unverified = 0
    for issue in all_issues:
        verification_count = await db.verifications.count_documents({"issue_id": issue["id"]})
        if verification_count == 0:
            unverified += 1
    
    return Stats(
        new_today=new_today,
        verifying=verifying,
        in_progress=in_progress,
        resolved_this_week=resolved_this_week,
        unverified=unverified
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# PHASE 4: SUPERVISOR & ESCALATION ENDPOINTS
# ------------------------------------------------------------------

@app.post("/api/supervisor/login")
async def supervisor_login(credentials: dict):
    supervisor_id = credentials.get("supervisor_id")
    password = credentials.get("password")
    
    supervisor = await db.supervisors.find_one({
        "supervisor_id": supervisor_id,
        "password": password
    })
    
    if not supervisor:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {
        "success": True,
        "supervisor": {
            "supervisor_id": supervisor["supervisor_id"],
            "name": supervisor["name"],
            "department": supervisor["department"],
            "ward": supervisor.get("ward")
        }
    }

@app.get("/api/supervisor/complaints")
async def get_supervisor_complaints(
    supervisor_id: str,
    filter: str = Query("pending", enum=["pending", "overdue", "all"])
):
    # Verify supervisor exists
    supervisor = await db.supervisors.find_one({"supervisor_id": supervisor_id})
    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor not found")
    
    # Base query: Complaints escalated to this supervisor
    query = {"supervisor_id": supervisor_id}
    
    # Get current time for deadline checks
    now = datetime.utcnow()
    
    # Calculate stats first (for dashboard cards)
    all_assigned = await db.complaints.find({"supervisor_id": supervisor_id}).to_list(length=1000)
    
    pending_count = 0
    overdue_count = 0
    new_today_count = 0
    
    for c in all_assigned:
        s_status = c.get("supervisor_status")
        deadline = c.get("supervisor_deadline")
        
        # Pending logic: Status is PENDING or None
        if not s_status or s_status == "PENDING":
            pending_count += 1
            
            # Overdue logic
            # Handle string vs datetime mismatch if any
            if isinstance(deadline, str):
                try:
                    deadline = datetime.fromisoformat(deadline)
                except ValueError:
                    pass
            
            if isinstance(deadline, datetime) and now > deadline:
                overdue_count += 1
        
        # New today logic (escalated today)
        timeline = c.get("timeline", [])
        for event in timeline:
            if event.get("action") == "sent_to_supervisor":
                ts = event.get("timestamp") or event.get("datetime")
                if isinstance(ts, str):
                    try:
                        ts = datetime.fromisoformat(ts)
                    except ValueError:
                        continue
                if isinstance(ts, datetime) and (now - ts).days < 1:
                    new_today_count += 1
                    break
    
    # Filter for the list
    if filter == "pending":
        query["$or"] = [{"supervisor_status": "PENDING"}, {"supervisor_status": None}]
    elif filter == "overdue":
        query["$or"] = [{"supervisor_status": "PENDING"}, {"supervisor_status": None}]
        query["supervisor_deadline"] = {"$lt": now}
    # "all" includes everything (resolved etc)
    
    complaints = await db.complaints.find(query).sort("supervisor_deadline", 1).to_list(length=100)
    
    return {
        "stats": {
            "new_today": new_today_count,
            "pending": pending_count,
            "overdue": overdue_count
        },
        "complaints": complaints
    }

@app.post("/api/complaints/{complaint_id}/escalate")
async def escalate_complaint(complaint_id: str, data: dict):
    """
    Escalate a complaint to a supervisor for review.
    
    Flow:
    1. Find complaint by ID
    2. Find supervisor based on department (category)
    3. Update complaint status and assign supervisor
    4. Add timeline event
    """
    try:
        complaint = await db.complaints.find_one({"complaint_id": complaint_id})
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
            
        # Logic to find supervisor based on department/ward
        # Using category as department for now
        department = complaint.get("category", "").lower()
        
        # Try to find supervisor for this department
        supervisor = await db.supervisors.find_one({"department": department})
        
        if not supervisor:
            # Fallback to any available supervisor
            supervisor = await db.supervisors.find_one({})
            
        if not supervisor:
            # No supervisors in system - return helpful error
            logger.warning(f"No supervisors found in system for escalation of {complaint_id}")
            return {
                "success": False,
                "error": "No supervisors available",
                "message": "No supervisors are configured in the system. Please run seed_supervisors.py to add supervisors."
            }
        
        # Calculate deadline
        is_high_severity = complaint.get("severity", "Low") in ["High", "Critical"]
        hours = 24 if is_high_severity else 72
        deadline = datetime.utcnow() + timedelta(hours=hours)
        
        # Update timeline
        new_event = {
            "timestamp": datetime.utcnow(),
            "actor": data.get("officer_name", "Officer"),
            "role": "officer",
            "action": "sent_to_supervisor",
            "details": f"Escalated to {supervisor['name']}"
        }
        
        update_data = {
            "status": "awaiting_supervisor",
            "supervisor_id": supervisor["supervisor_id"],
            "supervisor_status": "PENDING",
            "supervisor_deadline": deadline,
            "updated_at": datetime.utcnow()
        }
        
        await db.complaints.update_one(
            {"complaint_id": complaint_id},
            {
                "$set": update_data,
                "$push": {"timeline": new_event}
            }
        )
        
        return {"success": True, "deadline": deadline.isoformat(), "supervisor": supervisor["name"]}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Escalation failed for {complaint_id}: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to escalate complaint: {str(e)}"
        }

@app.post("/api/complaints/{complaint_id}/review")
async def review_complaint(complaint_id: str, review_data: dict):
    # action: "APPROVE" | "REJECT"
    # notes: str
    action = review_data.get("action")
    notes = review_data.get("notes", "")
    supervisor_name = review_data.get("supervisor_name", "Supervisor")
    
    if action not in ["APPROVE", "REJECT", "ESCALATE"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    update_data = {}
    new_status = ""
    
    if action == "APPROVE":
        new_status = "resolved"
        update_data = {
            "status": "resolved",
            "supervisor_status": "APPROVED",
            "updated_at": datetime.utcnow()
        }
    elif action == "REJECT":
        new_status = "in_progress" # Send back to officer
        update_data = {
            "status": "in_progress",
            "supervisor_status": "REJECTED",
            "updated_at": datetime.utcnow()
        }
    elif action == "ESCALATE":
        new_status = "escalated_hod"
        update_data = {
            "status": "escalated_hod",
            "supervisor_status": "ESCALATED",
            "updated_at": datetime.utcnow()
        }

    # Timeline event
    new_event = {
        "timestamp": datetime.utcnow(),
        "actor": supervisor_name,
        "role": "supervisor",
        "action": action.lower(),
        "details": notes
    }
    
    await db.complaints.update_one(
        {"complaint_id": complaint_id},
        {
            "$set": update_data,
            "$push": {"timeline": new_event}
        }
    )
    
    return {"success": True, "new_status": new_status}