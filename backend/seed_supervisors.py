import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URL") or "mongodb://localhost:27017"
DB_NAME = os.getenv("DB_NAME") or "grievance_genie"

# Mock supervisors - 1 per department
SUPERVISORS = [
    {
        "supervisor_id": "sup_electrical_01",
        "name": "Arun Kumar",
        "department": "electrical",
        "ward": None, # Supervises entire department
        "password": "admin"
    },
    {
        "supervisor_id": "sup_water_01",
        "name": "Meera Redding",
        "department": "water",
        "ward": None,
        "password": "admin"
    },
    {
        "supervisor_id": "sup_roads_01",
        "name": "Sanjay Gupta",
        "department": "roads",
        "ward": None,
        "password": "admin"
    },
    {
        "supervisor_id": "sup_garbage_01",
        "name": "Priya Sharma",
        "department": "garbage",
        "ward": None,
        "password": "admin"
    },
    {
        "supervisor_id": "sup_drainage_01",
        "name": "Vikram Singh",
        "department": "drainage",
        "ward": None,
        "password": "admin"
    }
]

async def seed_supervisors():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    print(f"🌱 Seeding supervisors into {DB_NAME}...")
    
    # Check if we successfully connected
    try:
        await client.admin.command('ping')
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return

    collection = db.supervisors
    
    # Clear existing
    await collection.delete_many({})
    print("🗑️ Cleared existing supervisors")
    
    # Insert new
    result = await collection.insert_many(SUPERVISORS)
    print(f"✅ Created {len(result.inserted_ids)} supervisors")
    print("📋 Sample credentials: sup_garbage_01 / admin")

if __name__ == "__main__":
    asyncio.run(seed_supervisors())
