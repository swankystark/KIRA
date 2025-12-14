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

# Image Validation Models
class EXIFData(BaseModel):
    has_gps: bool
    location_valid: bool
    timestamp: Optional[str] = None
    distance_km: Optional[float] = None
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None

class HashMatch(BaseModel):
    is_duplicate: bool
    similarity_score: float
    original_issue_id: Optional[str] = None

class VisionAnalysis(BaseModel):
    visual_summary: str
    detected_objects: List[str]
    issue_type_detected: str
    issue_match_status: str  # "MATCH" | "PARTIAL_MATCH" | "MISMATCH"
    severity: str  # "LOW" | "MEDIUM" | "HIGH"
    confidence_score: int  # 0-100
    final_flag: str  # "VALID_ISSUE" | "IMAGE_ISSUE_MISMATCH" | "INSUFFICIENT_VISUAL_EVIDENCE"
    reasoning: str
    skipped: bool = False
    error: Optional[str] = None

# Image Forensics Models
class ForensicsAnalysis(BaseModel):
    source_type: str  # "ORIGINAL_PHONE_PHOTO" | "WHATSAPP_IMAGE" | "SCREENSHOT_IMAGE" | "UNKNOWN"
    confidence_score: float  # 0.0 to 1.0
    evidence: List[str]
    byte_analysis: dict
    metadata_analysis: dict
    compression_analysis: dict
    filename_analysis: dict
    forensics_version: str = "1.0"

class ForensicsUIFeedback(BaseModel):
    show_feedback: bool
    icon: str
    message: str
    confidence: int
    recommendation: str
    type: str  # "success" | "info" | "warning" | "neutral"
    technical_details: Optional[str] = None

class ImageValidationResult(BaseModel):
    status: str  # "accepted" | "rejected"
    reason_codes: List[str] = []
    ai_generated_score: float
    exif_status: EXIFData
    hash_match: HashMatch
    vision_analysis: Optional[VisionAnalysis] = None
    forensics_analysis: Optional[ForensicsAnalysis] = None
    forensics_ui_feedback: Optional[ForensicsUIFeedback] = None  # NEW: UI feedback
    confidence_score: float
    message: Optional[str] = None

class Supervisor(BaseModel):
    supervisor_id: str
    name: str
    department: str  # Supervises a specific department
    ward: Optional[int] = None  # Supervises a specific ward (or None for all wards)
    password: str

# Complaint Models (Phase 1)
class AssignedOfficer(BaseModel):
    officer_id: str
    name: str
    title: str
    department: str
    ward: Optional[int] = None
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class ComplaintTimelineEvent(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actor: str  # Name or ID of who performed action
    role: str   # 'citizen', 'system', 'officer', 'supervisor'
    action: str # 'created', 'assigned', 'sent_to_supervisor', 'approved', 'rejected'
    details: Optional[str] = None

class ComplaintCreate(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = None
    category: str
    severity: str
    description: str
    ward: int  # Citizen-selected ward
    location: str  # Formatted address
    coordinates: Coordinates
    image_filename: Optional[str] = None
    validation_record_id: Optional[str] = None  # Link to validation record

class Complaint(BaseModel):
    complaint_id: str  # e.g., "GG-00045"
    citizen: dict  # {name, phone}
    category: str
    severity: str
    description: str
    location: dict  # {lat, lng, address, ward}
    image_url: Optional[str] = None
    assigned_officer: Optional[AssignedOfficer] = None
    status: str = "pending"  # pending | assigned | in_progress | resolved | unassigned | awaiting_supervisor | closed
    needs_manual_routing: bool = False  # True if no officer could be auto-assigned
    validation_record_id: Optional[str] = None
    
    # Escalation / Timeline Fields (Phase 4)
    supervisor_id: Optional[str] = None # ID of supervisor assigned for review
    supervisor_status: Optional[str] = None # PENDING | APPROVED | REJECTED
    supervisor_deadline: Optional[datetime] = None # Deadline for supervisor review
    timeline: List[ComplaintTimelineEvent] = [] # Complete history of actions
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ComplaintResponse(BaseModel):
    complaint_id: str
    assigned_officer: Optional[dict] = None  # {id, name, title, department, ward}
    status: str
    message: str

