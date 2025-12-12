from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query, Request
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

from models import (
    IssueCreate, Issue, IssueStatusUpdate,
    VerificationCreate, Verification, VerificationStats,
    Stats, TimelineItem, ChatRequest, ChatResponse, ExtractedData,
    AnalyzeRequest, AnalyzeResponse, AnalysisData
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    # Startup: nothing to do
    yield
    # Shutdown: close the database client
    await client.close()

# Create the main app with lifespan handler
app = FastAPI(lifespan=lifespan)

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
    """Upload photos for an issue"""
    # Check if issue exists
    issue = await db.issues.find_one({"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    photo_urls = []
    backend_url = os.environ.get('BACKEND_URL', 'http://localhost:5000') # Updated port
    
    for photo in photos:
        # Generate unique filename
        file_ext = photo.filename.split('.')[-1]
        unique_filename = f"{issue_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        photo_url = f"{backend_url}/uploads/{unique_filename}"
        photo_urls.append(photo_url)
    
    # Update issue with photo URLs
    await db.issues.update_one(
        {"id": issue_id},
        {"$push": {"photos": {"$each": photo_urls}}}
    )
    
    logger.info(f"Uploaded {len(photo_urls)} photos for issue {issue_id}")
    return {"photos": photo_urls}

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