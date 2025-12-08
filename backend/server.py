from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import shutil

from models import (
    IssueCreate, Issue, IssueStatusUpdate,
    VerificationCreate, Verification, VerificationStats,
    Stats, TimelineItem
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

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
    return department_map.get(category, "General Administration")

# Routes
@api_router.get("/")
async def root():
    return {"message": "GrievanceGenie API v1.0"}

# Issue Management
@api_router.post("/issues", response_model=Issue)
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
    backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8001')
    
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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()