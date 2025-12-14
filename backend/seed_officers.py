"""
Seed sample officers into MongoDB for testing officer auto-assignment
"""
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "grievance_db")

# Sample officers data
SAMPLE_OFFICERS = [
    # Ward 1
    {
        "officer_id": "officer_elec_w1",
        "name": "Amit Sharma",
        "title": "Electrical Engineer",
        "department": "electricity",
        "wards": [1],
        "phone": "+91-9876543201",
        "email": "amit.sharma@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_roads_w1",
        "name": "Priya Singh",
        "title": "Civil Engineer",
        "department": "roads",
        "wards": [1],
        "phone": "+91-9876543202",
        "email": "priya.singh@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_gen_w1",
        "name": "Ravi Kumar",
        "title": "Ward Officer",
        "department": "general",
        "wards": [1],
        "phone": "+91-9876543203",
        "email": "ravi.kumar@city.gov.in",
        "active": True
    },
    
    # Ward 12 (detailed)
    {
        "officer_id": "officer_raj_elec_12",
        "name": "Rajesh Kumar",
        "title": "Senior Electrical Engineer",
        "department": "electricity",
        "wards": [12],
        "phone": "+91-9876543210",
        "email": "rajesh.kumar@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_priya_civil_12",
        "name": "Priya Deshmukh",
        "title": "Senior Civil Engineer",
        "department": "roads",
        "wards": [12],
        "phone": "+91-9876543211",
        "email": "priya.deshmukh@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_amit_drain_12",
        "name": "Amit Patel",
        "title": "Drainage Supervisor",
        "department": "drainage",
        "wards": [12],
        "phone": "+91-9876543212",
        "email": "amit.patel@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_anita_waste_12",
        "name": "Anita Verma",
        "title": "Sanitation Inspector",
        "department": "garbage",
        "wards": [12],
        "phone": "+91-9876543213",
        "email": "anita.verma@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_sanjay_water_12",
        "name": "Sanjay Reddy",
        "title": "Water Supply Engineer",
        "department": "water",
        "wards": [12],
        "phone": "+91-9876543214",
        "email": "sanjay.reddy@city.gov.in",
        "active": True
    },
    {
        "officer_id": "officer_general_12",
        "name": "Vikram Malhotra",
        "title": "Ward 12 Officer",
        "department": "general",
        "wards": [12],
        "phone": "+91-9876543215",
        "email": "vikram.malhotra@city.gov.in",
        "active": True
    },
    
    # City-level department heads
    {
        "officer_id": "dept_head_elec",
        "name": "Dr. Suresh Iyer",
        "title": "Chief Electrical Engineer",
        "department": "electricity",
        "wards": [],  # City-wide
        "phone": "+91-9876543220",
        "email": "suresh.iyer@city.gov.in",
        "active": True
    },
    {
        "officer_id": "dept_head_civil",
        "name": "Meena Krishnan",
        "title": "Chief Civil Engineer",
        "department": "roads",
        "wards": [],
        "phone": "+91-9876543221",
        "email": "meena.krishnan@city.gov.in",
        "active": True
    },
    {
        "officer_id": "dept_head_drain",
        "name": "Ramesh Gupta",
        "title": "Chief Drainage Officer",
        "department": "drainage",
        "wards": [],
        "phone": "+91-9876543222",
        "email": "ramesh.gupta@city.gov.in",
        "active": True
    },
    {
        "officer_id": "dept_head_waste",
        "name": "Kavita Nair",
        "title": "Chief Sanitation Officer",
        "department": "garbage",
        "wards": [],
        "phone": "+91-9876543223",
        "email": "kavita.nair@city.gov.in",
        "active": True
    },
    {
        "officer_id": "dept_head_water",
        "name": "Anil Joshi",
        "title": "Chief Water Supply Engineer",
        "department": "water",
        "wards": [],
        "phone": "+91-9876543224",
        "email": "anil.joshi@city.gov.in",
        "active": True
    },
    {
        "officer_id": "city_admin",
        "name": "Sunita Rao",
        "title": "City Administrator",
        "department": "general",
        "wards": [],
        "phone": "+91-9876543225",
        "email": "sunita.rao@city.gov.in",
        "active": True
    }
]

async def seed_officers():
    """Seed sample officers into MongoDB"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        print(f"\n{'='*60}")
        print("SEEDING SAMPLE OFFICERS")
        print(f"{'='*60}")
        
        # Clear existing officers (for testing)
        result = await db.officers.delete_many({})
        print(f"Cleared {result.deleted_count} existing officers")
        
        # Insert sample officers
        result = await db.officers.insert_many(SAMPLE_OFFICERS)
        print(f"✅ Inserted {len(result.inserted_ids)} officers")
        
        # Create indexes
        await db.officers.create_index("officer_id", unique=True)
        await db.officers.create_index("department")
        await db.officers.create_index("wards")
        print("✅ Created indexes on officers collection")
        
        # Display summary
        print(f"\n{'='*60}")
        print("OFFICERS BY DEPARTMENT")
        print(f"{'='*60}")
        
        for dept in ["electricity", "roads", "drainage", "garbage", "water", "general"]:
            count = await db.officers.count_documents({"department": dept})
            print(f"{dept.capitalize()}: {count} officers")
        
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Error seeding officers: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_officers())
