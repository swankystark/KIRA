"""
Decision Engine - Image Validation Decision Logic

This service aggregates all validation results and makes final accept/reject decisions.
"""

import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

# Flag severity levels
CRITICAL_FLAGS = ["AI_GENERATED", "SUSPECTED_AI_GENERATED", "RESUBMITTED_IMAGE", "NO_EXIF_DATA", "IMAGE_CONTENT_MISMATCH"]
WARNING_FLAGS = ["LOCATION_NOT_AVAILABLE", "LOCATION_MISMATCH", "IMAGE_ISSUE_MISMATCH", "LOW_VISION_CONFIDENCE", "FORENSICS_REVIEW_REQUIRED"]
INFO_FLAGS = ["WHATSAPP_FORWARDED_IMAGE", "SCREENSHOT_DETECTED", "ORIGINAL_PHOTO_VERIFIED"]  # NEW: Informational flags


def make_decision(validation_results: Dict) -> Dict:
    """
    Make final accept/reject decision based on all validation results.
    
    Args:
        validation_results: Dictionary containing all validation data:
            - ai_detection: dict from sightengine_service
            - exif_data: dict from exif_service  
            - hash_match: dict from hash_service
            - issue_match: dict from issue classification (optional)
            - vision_analysis: dict from vision_service
            - forensics_analysis: dict from forensics_service (NEW)
            
    Returns:
        dict: Final decision with structure:
            {
                "status": "accepted" | "rejected",
                "reason_codes": [...],
                "ai_generated_score": float,
                "exif_status": {...},
                "hash_match": {...},
                "vision_analysis": {...},
                "forensics_analysis": {...},
                "confidence_score": float
            }
    """
    reason_codes = []
    status = "accepted"  # Default to accepted
    
    # Extract validation data
    ai_detection = validation_results.get("ai_detection", {})
    exif_data = validation_results.get("exif_data", {})
    hash_match = validation_results.get("hash_match", {})
    issue_match = validation_results.get("issue_match", {})
    vision_analysis = validation_results.get("vision_analysis", {})
    forensics_analysis = validation_results.get("forensics_analysis", {})
    
    # Check AI-generated flag (CRITICAL)
    ai_probability = ai_detection.get("ai_probability", 0.0)
    if ai_detection.get("is_ai_generated", False):
        reason_codes.append("AI_GENERATED")
        status = "rejected"
        logger.warning(
            f"Image rejected: AI-generated probability {ai_probability:.2%}"
        )
    
    # ENHANCED: Secondary AI detection check using forensics evidence
    elif ai_probability >= 0.3:  # Lower threshold for secondary check
        # Look for suspicious patterns in forensics
        forensics_suspicious = False
        
        if forensics_analysis and forensics_analysis.get("source_type") == "UNKNOWN":
            forensics_confidence = forensics_analysis.get("confidence_score", 0.0)
            if forensics_confidence < 0.3:  # Very low forensics confidence
                forensics_suspicious = True
        
        # If AI probability is moderate (30-80%) AND forensics is suspicious
        if forensics_suspicious and ai_probability >= 0.4:
            reason_codes.append("SUSPECTED_AI_GENERATED")
            status = "rejected"
            logger.warning(
                f"Image rejected: Suspected AI-generated (AI: {ai_probability:.2%}, "
                f"Forensics: suspicious patterns)"
            )
    
    # Check duplicate/resubmission (CRITICAL)
    if hash_match.get("is_duplicate", False):
        reason_codes.append("RESUBMITTED_IMAGE")
        status = "rejected"
        logger.warning(
            f"Image rejected: Duplicate of issue {hash_match.get('original_issue_id')}"
        )
    
    # Check EXIF requirement (CRITICAL if REQUIRE_EXIF is enabled)
    import os
    require_exif = os.environ.get("REQUIRE_EXIF", "false").lower() == "true"
    has_any_exif = exif_data.get("has_gps") or exif_data.get("timestamp") or exif_data.get("camera_make")
    
    if require_exif and not has_any_exif:
        reason_codes.append("NO_EXIF_DATA")
        status = "rejected"
        logger.warning(
            "⚠️  Image rejected: No EXIF data found (STRICT MODE enabled)"
        )
        print(f"\n⚠️  STRICT MODE: Image rejected - No EXIF data")
        print(f"   This will reject WhatsApp photos, screenshots, social media images!")
    
    # Check GPS availability (WARNING - unless in strict mode where it's already rejected)
    if status != "rejected" and not exif_data.get("has_gps", False):
        reason_codes.append("LOCATION_NOT_AVAILABLE")
        logger.info("Warning: Image does not contain GPS data")
    
    # Check location mismatch (WARNING)
    elif not exif_data.get("location_valid", True):
        reason_codes.append("LOCATION_MISMATCH")
        logger.info(
            f"Warning: GPS location mismatch (distance: {exif_data.get('distance_km', 'N/A')}km)"
        )
    
    # Check issue-image consistency (WARNING)
    if not issue_match.get("is_match", True):
        reason_codes.append("IMAGE_ISSUE_MISMATCH")
        logger.info(
            f"Warning: Image may not match issue type '{issue_match.get('expected_type')}'"
        )
    
    # NEW: Check vision analysis results (CRITICAL if high-confidence mismatch)
    if vision_analysis and not vision_analysis.get("skipped", False):
        final_flag = vision_analysis.get("final_flag")
        match_status = vision_analysis.get("issue_match_status")
        vision_confidence = vision_analysis.get("confidence_score", 0)
        
        # Critical: High-confidence content mismatch (only reject if completely wrong)
        # Only reject if it's clearly not a civic issue at all
        if final_flag == "IMAGE_ISSUE_MISMATCH" and vision_confidence >= 95 and vision_analysis.get('issue_type_detected') == 'unknown':
            reason_codes.append("IMAGE_CONTENT_MISMATCH")
            status = "rejected"
            logger.warning(
                f"Image rejected: Vision analysis detected content mismatch "
                f"(detected: {vision_analysis.get('issue_type_detected')}, confidence: {vision_confidence}%)"
            )
        
        # Warning: Low confidence in vision analysis
        elif vision_confidence < 50 and final_flag != "VALID_ISSUE":
            reason_codes.append("LOW_VISION_CONFIDENCE")
            logger.info(
                f"Warning: Low confidence in image content analysis ({vision_confidence}%)"
            )
        
        # Warning: Partial match or mismatch with lower confidence
        elif match_status == "MISMATCH" and vision_confidence >= 60:
            reason_codes.append("IMAGE_ISSUE_MISMATCH")
            logger.info(
                f"Warning: Vision detected different issue type "
                f"(detected: {vision_analysis.get('issue_type_detected')})"
            )
    
    # NEW: Check forensics analysis results
    if forensics_analysis and forensics_analysis.get("source_type") != "UNKNOWN":
        source_type = forensics_analysis.get("source_type")
        forensics_confidence = forensics_analysis.get("confidence_score", 0.0)
        
        # Log forensics findings for transparency
        logger.info(
            f"Forensics v{forensics_analysis.get('forensics_version', '1.0')}: "
            f"Detected {source_type} with {forensics_confidence:.2%} confidence"
        )
        
        # Log evidence for debugging
        evidence = forensics_analysis.get('evidence', [])
        if evidence:
            logger.debug(f"Forensics evidence: {', '.join(evidence[:3])}{'...' if len(evidence) > 3 else ''}")
        
        # Apply forensics-based logic (more nuanced than before)
        if source_type == "WHATSAPP_IMAGE" and forensics_confidence >= 0.7:
            # WhatsApp images are now ACCEPTED but flagged for review
            reason_codes.append("WHATSAPP_FORWARDED_IMAGE")
            logger.info("Info: WhatsApp forwarded image detected - accepted but flagged")
            
        elif source_type == "SCREENSHOT_IMAGE" and forensics_confidence >= 0.8:
            # Screenshots are ACCEPTED but flagged (could be legitimate screenshots of issues)
            reason_codes.append("SCREENSHOT_DETECTED")
            logger.info("Info: Screenshot detected - accepted but flagged for review")
            
        elif source_type == "ORIGINAL_PHONE_PHOTO" and forensics_confidence >= 0.7:
            # Original photos get a confidence boost - highest authenticity
            reason_codes.append("ORIGINAL_PHOTO_VERIFIED")
            logger.info("Info: Original phone photo verified - highest authenticity confidence")
            
        # Check for low confidence requiring review
        classification_result = forensics_analysis.get('classification_result', {})
        if classification_result.get('recommendation') == 'REVIEW':
            reason_codes.append("FORENSICS_REVIEW_REQUIRED")
            logger.info("Info: Forensics analysis requires manual review")
            
        # Only reject if forensics indicates potential fraud with very high confidence
        # This is reserved for future sophisticated fraud detection
        # For now, we accept all sources but flag them appropriately
    
    # Calculate confidence score
    confidence_score = calculate_confidence_score(validation_results, reason_codes)
    
    # Prepare response
    decision = {
        "status": status,
        "reason_codes": reason_codes,
        "ai_generated_score": ai_detection.get("ai_probability", 0.0),
        "exif_status": {
            "has_gps": exif_data.get("has_gps", False),
            "gps_coordinates": exif_data.get("gps_coordinates"),
            "gps_address": exif_data.get("gps_address"),
            "gps_city": exif_data.get("gps_city"),
            "gps_state": exif_data.get("gps_state"),
            "gps_country": exif_data.get("gps_country"),
            "location_valid": exif_data.get("location_valid", False),
            "timestamp": exif_data.get("timestamp"),
            "distance_km": exif_data.get("distance_km"),
            "camera_make": exif_data.get("camera_make"),
            "camera_model": exif_data.get("camera_model")
        },
        "hash_match": {
            "is_duplicate": hash_match.get("is_duplicate", False),
            "similarity_score": hash_match.get("similarity_score", 0.0),
            "original_issue_id": hash_match.get("original_issue_id"),
        },
        "vision_analysis": {
            "visual_summary": vision_analysis.get("visual_summary", ""),
            "detected_objects": vision_analysis.get("detected_objects", []),
            "issue_type_detected": vision_analysis.get("issue_type_detected", "unknown"),
            "issue_match_status": vision_analysis.get("issue_match_status", "MISMATCH"),
            "severity": vision_analysis.get("severity", "MEDIUM"),
            "confidence_score": vision_analysis.get("confidence_score", 0),
            "final_flag": vision_analysis.get("final_flag", "INSUFFICIENT_VISUAL_EVIDENCE"),
            "reasoning": vision_analysis.get("reasoning", ""),
            "skipped": vision_analysis.get("skipped", False),
            "error": vision_analysis.get("error")
        } if vision_analysis and not vision_analysis.get("skipped", False) else None,
        "forensics_analysis": {
            "source_type": forensics_analysis.get("source_type", "UNKNOWN"),
            "confidence_score": forensics_analysis.get("confidence_score", 0.0),
            "evidence": forensics_analysis.get("evidence", []),
            "byte_analysis": forensics_analysis.get("byte_analysis", {}),
            "metadata_analysis": forensics_analysis.get("metadata_analysis", {}),
            "compression_analysis": forensics_analysis.get("compression_analysis", {}),
            "filename_analysis": forensics_analysis.get("filename_analysis", {}),
            "forensics_version": forensics_analysis.get("forensics_version", "1.0")
        } if forensics_analysis and forensics_analysis.get("source_type") != "UNKNOWN" else None,
        "confidence_score": confidence_score
    }
    
    logger.info(
        f"Decision: {status.upper()} | "
        f"Confidence: {confidence_score:.2%} | "
        f"Flags: {', '.join(reason_codes) if reason_codes else 'None'}"
    )
    
    return decision


def calculate_confidence_score(validation_results: Dict, reason_codes: List[str]) -> float:
    """
    Calculate confidence score (0-1) based on validation results.
    
    Higher score = more confident the image is authentic.
    
    Args:
        validation_results: All validation data
        reason_codes: List of reason codes/flags
        
    Returns:
        float: Confidence score between 0.0 and 1.0
    """
    score = 1.0  # Start with perfect score
    
    ai_detection = validation_results.get("ai_detection", {})
    exif_data = validation_results.get("exif_data", {})
    hash_match = validation_results.get("hash_match", {})
    forensics_analysis = validation_results.get("forensics_analysis", {})
    
    # Deduct for critical flags
    if "AI_GENERATED" in reason_codes:
        # Deduct based on AI probability
        ai_prob = ai_detection.get("ai_probability", 0.8)
        score -= ai_prob  # Full deduction if 100% AI-generated
    
    if "RESUBMITTED_IMAGE" in reason_codes:
        # Deduct heavily for duplicates
        similarity = hash_match.get("similarity_score", 1.0)
        score -= (0.7 * similarity)  # Up to 70% deduction
    
    if "NO_EXIF_DATA" in reason_codes:
        # Heavy penalty for missing EXIF (strict mode)
        score -= 0.9  # 90% deduction - almost certain reject
    
    # Deduct for warning flags (smaller penalties)
    if "LOCATION_NOT_AVAILABLE" in reason_codes:
        score -= 0.15  # 15% penalty for missing GPS
    
    if "LOCATION_MISMATCH" in reason_codes:
        # Penalty based on distance
        distance = exif_data.get("distance_km")
        max_allowed = exif_data.get("max_allowed_km", 10)
        
        # Only apply penalty if distance is available
        if distance is not None and max_allowed > 0:
            penalty = min(0.25, (distance / max_allowed) * 0.1)
            score -= penalty
        else:
            # Default penalty if distance not available
            score -= 0.15
    
    if "IMAGE_ISSUE_MISMATCH" in reason_codes:
        score -= 0.10  # 10% penalty for type mismatch
    
    # NEW: Vision analysis penalties
    if "IMAGE_CONTENT_MISMATCH" in reason_codes:
        # Heavy penalty for high-confidence content mismatch
        vision_analysis = validation_results.get("vision_analysis", {})
        vision_confidence = vision_analysis.get("confidence_score", 70) / 100.0
        score -= (0.6 * vision_confidence)  # Up to 60% deduction
    
    if "LOW_VISION_CONFIDENCE" in reason_codes:
        score -= 0.15  # 15% penalty for unclear images
    
    # NEW: Forensics-based adjustments
    if forensics_analysis and forensics_analysis.get("source_type") != "UNKNOWN":
        source_type = forensics_analysis.get("source_type")
        forensics_confidence = forensics_analysis.get("confidence_score", 0.0)
        
        if source_type == "ORIGINAL_PHONE_PHOTO" and forensics_confidence >= 0.7:
            # Significant boost for verified original photos - highest authenticity
            if "ORIGINAL_PHOTO_VERIFIED" in reason_codes:
                score += 0.15 * forensics_confidence  # Up to 15% boost
            
        elif source_type == "WHATSAPP_IMAGE":
            # Small penalty for WhatsApp (but still accepted)
            if "WHATSAPP_FORWARDED_IMAGE" in reason_codes:
                score -= 0.05  # 5% penalty - minor concern
                
        elif source_type == "SCREENSHOT_IMAGE":
            # Small penalty for screenshots (but still accepted)
            if "SCREENSHOT_DETECTED" in reason_codes:
                score -= 0.08  # 8% penalty - slightly more concern than WhatsApp
        
        # Penalty for requiring manual review
        if "FORENSICS_REVIEW_REQUIRED" in reason_codes:
            score -= 0.12  # 12% penalty for low confidence classification
    
    # Ensure score stays in valid range
    score = max(0.0, min(1.0, score))
    
    return score


def should_auto_reject(reason_codes: List[str]) -> bool:
    """
    Determine if image should be automatically rejected based on reason codes.
    
    Args:
        reason_codes: List of validation flags
        
    Returns:
        bool: True if should auto-reject
    """
    # Auto-reject if any critical flag is present
    for code in reason_codes:
        if code in CRITICAL_FLAGS:
            return True
    
    return False


def get_rejection_message(reason_codes: List[str]) -> str:
    """
    Generate human-readable rejection message.
    
    Args:
        reason_codes: List of reason codes
        
    Returns:
        str: User-friendly rejection message
    """
    messages = {
        "AI_GENERATED": "This image appears to be AI-generated or synthetic. Please upload a genuine photograph of the issue.",
        "SUSPECTED_AI_GENERATED": "This image shows patterns consistent with AI-generated content. Please upload a genuine photograph taken with your camera.",
        "RESUBMITTED_IMAGE": "This image has already been submitted for a resolved complaint. Please upload a new photo.",
        "NO_EXIF_DATA": "This image does not contain EXIF metadata. Please upload a photo taken directly from your camera with location services enabled. Note: WhatsApp and social media images are not accepted.",
        "LOCATION_MISMATCH": "The GPS location in the image does not match your reported location. This may indicate the photo was taken elsewhere.",
        "LOCATION_NOT_AVAILABLE": "No GPS data found in the image. For verification, please ensure location services are enabled when taking photos.",
        "IMAGE_ISSUE_MISMATCH": "The image content may not match the selected issue type. Please verify you've selected the correct category.",
        "IMAGE_CONTENT_MISMATCH": "Our AI analysis detected that the image content does not match the reported issue type. Please upload a relevant photo or select the correct category.",
        "LOW_VISION_CONFIDENCE": "The image quality is too low or unclear for proper analysis. Please upload a clearer photo taken in good lighting.",
        "WHATSAPP_FORWARDED_IMAGE": "This appears to be a WhatsApp forwarded image. While accepted, please note that original photos provide better verification.",
        "SCREENSHOT_DETECTED": "This appears to be a screenshot. While accepted, please note that original photos of the issue provide better verification.",
        "ORIGINAL_PHOTO_VERIFIED": "This appears to be an original phone photo with full metadata. Excellent authenticity verification.",
        "FORENSICS_REVIEW_REQUIRED": "The image source could not be determined with high confidence. Manual review may be required."
    }
    
    # Get messages for all reason codes
    result_messages = []
    for code in reason_codes:
        if code in messages:
            result_messages.append(messages[code])
    
    if not result_messages:
        return "Image validation passed."
    
    return " | ".join(result_messages)
