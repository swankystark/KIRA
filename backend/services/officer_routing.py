"""
Officer Routing Service

Assigns complaints to appropriate officers based on ward and department
using a routing configuration with deterministic fallback logic.

Fallback sequence:
1. routing[ward][department] - Exact match
2. routing[ward]["general"] - Ward general officer  
3. routing["default_city"][department] - Department head (city-level)
4. null - Mark as UNASSIGNED for manual routing
"""

import json
import logging
from pathlib import Path
from typing import Optional, Dict

logger = logging.getLogger(__name__)

# Load routing configuration
CONFIG_PATH = Path(__file__).parent.parent / "config" / "routing_config.json"

def load_routing_config() -> Dict:
    """Load routing configuration from JSON file"""
    try:
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)
        logger.info(f"Loaded routing config with {len(config)} wards")
        return config
    except FileNotFoundError:
        logger.error(f"Routing config not found at {CONFIG_PATH}")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in routing config: {e}")
        return {}

# Global routing config (loaded once)
ROUTING_CONFIG = load_routing_config()


def assign_officer(ward: int, department: str) -> Optional[str]:
    """
    Assign officer based on ward and department with fallback logic.
    
    Args:
        ward: Ward number (e.g., 12)
        department: Department name (e.g., "electricity", "roads", "garbage")
        
    Returns:
        officer_id: Officer ID string, or None if no match found
        
    Fallback sequence:
        1. routing[ward][department] - Exact match
        2. routing[ward]["general"] - Ward general officer
        3. routing["default_city"][department] - City-level department head
        4. None - Mark as UNASSIGNED
    """
    ward_key = f"ward_{ward}"
    
    logger.info(f"Routing complaint: Ward {ward}, Department {department}")
    
    # 1. Try exact match: ward + department
    if ward_key in ROUTING_CONFIG:
        ward_config = ROUTING_CONFIG[ward_key]
        if department in ward_config:
            officer_id = ward_config[department]
            logger.info(f"✅ Exact match: {officer_id}")
            return officer_id
        
        # 2. Try ward general officer
        if "general" in ward_config:
            officer_id = ward_config["general"]
            logger.info(f"⚠️ Fallback to ward general: {officer_id}")
            return officer_id
    
    # 3. Try city-level department head
    if "default_city" in ROUTING_CONFIG:
        city_config = ROUTING_CONFIG["default_city"]
        if department in city_config:
            officer_id = city_config[department]
            logger.info(f"⚠️ Fallback to city-level department head: {officer_id}")
            return officer_id
        
        # Last resort: city admin
        if "general" in city_config:
            officer_id = city_config["general"]
            logger.info(f"⚠️ Fallback to city admin: {officer_id}")
            return officer_id
    
    # 4. No match found - mark as unassigned
    logger.warning(f"❌ No officer found for Ward {ward}, Department {department}")
    return None


async def get_officer_details(db, officer_id: str) -> Optional[Dict]:
    """
    Fetch officer details from MongoDB.
    
    Args:
        db: MongoDB database instance
        officer_id: Officer ID to lookup
        
    Returns:
        dict: Officer details or None if not found
    """
    if not officer_id:
        return None
    
    try:
        officer = await db.officers.find_one({"officer_id": officer_id})
        
        if officer:
            logger.info(f"Found officer: {officer.get('name')} ({officer.get('title')})")
            return {
                "officer_id": officer.get("officer_id"),
                "name": officer.get("name"),
                "title": officer.get("title"),
                "department": officer.get("department"),
                "ward": officer.get("wards", [])[0] if officer.get("wards") else None,
                "phone": officer.get("phone"),
                "email": officer.get("email")
            }
        else:
            logger.warning(f"Officer ID {officer_id} not found in database")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching officer details: {e}")
        return None


def reload_routing_config():
    """Reload routing configuration (useful for testing/updates)"""
    global ROUTING_CONFIG
    ROUTING_CONFIG = load_routing_config()
    logger.info("Routing configuration reloaded")
