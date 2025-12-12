from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CategoryEnum(str, Enum):
    water = "water"
    drainage = "drainage"
    roads = "roads"
    garbage = "garbage"
    electricity = "electricity"
    infrastructure = "infrastructure"
    others = "others"

class SeverityEnum(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class StatusEnum(str, Enum):
    reported = "reported"
    verifying = "verifying"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    unverified = "unverified"

class VerificationResponseEnum(str, Enum):
    yes = "yes"
    no = "no"
    not_sure = "not_sure"

class Coordinates(BaseModel):
    lat: float
    lng: float

class TimelineItem(BaseModel):
    status: str
    date: datetime

class IssueCreate(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = None
    category: CategoryEnum
    category_name: str
    severity: SeverityEnum
    description: str
    location: str
    coordinates: Coordinates
    location_text: Optional[str] = None

class Issue(BaseModel):
    id: str
    citizen_name: str
    citizen_phone: Optional[str] = None
    category: str
    category_name: str
    severity: str
    description: str
    location: str
    coordinates: Coordinates
    photos: List[str] = []
    status: str = "verifying"
    department: str
    reported_at: datetime
    updated_at: datetime
    timeline: List[TimelineItem] = []
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class IssueStatusUpdate(BaseModel):
    status: StatusEnum
    notes: Optional[str] = None

class VerificationCreate(BaseModel):
    issue_id: str
    response: VerificationResponseEnum

class Verification(BaseModel):
    id: str
    issue_id: str
    verifier_phone: Optional[str] = None
    response: str
    verified_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class VerificationStats(BaseModel):
    yes: int = 0
    no: int = 0
    not_sure: int = 0
    total: int = 0

class Stats(BaseModel):
    new_today: int = 0
    verifying: int = 0
    in_progress: int = 0
    resolved_this_week: int = 0
    unverified: int = 0

class ExtractedData(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    severity: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    success: bool
    conversationId: str
    response: str
    needsMoreInfo: bool
    extractedData: Optional[ExtractedData] = None
    nextQuestion: Optional[str] = None
    canSubmit: bool = False

class AnalyzeRequest(BaseModel):
    description: str

class AnalysisData(BaseModel):
    category: str
    severity: str
    department: str
    location: str
    summary: str

class AnalyzeResponse(BaseModel):
    success: bool
    data: AnalysisData

