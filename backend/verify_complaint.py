"""
Quick script to verify complaints in MongoDB
Run: python verify_complaint.py
"""
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Connect to MongoDB
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.getenv('DB_NAME', 'grievance_genie')

client = MongoClient(mongo_url)
db = client[db_name]

print("\n" + "="*60)
print("📋 COMPLAINT VERIFICATION")
print("="*60)

# Get latest complaints
complaints = list(db.complaints.find().sort('created_at', -1).limit(5))

if not complaints:
    print("❌ No complaints found in database")
else:
    print(f"✅ Found {len(complaints)} recent complaint(s):\n")
    
    for i, c in enumerate(complaints, 1):
        print(f"📌 Complaint {i}:")
        print(f"   ID: {c.get('complaint_id', 'N/A')}")
        print(f"   Citizen: {c.get('citizen', {}).get('name', 'N/A')}")
        print(f"   Category: {c.get('category', 'N/A')}")
        print(f"   Severity: {c.get('severity', 'N/A')}")
        print(f"   Ward: {c.get('location', {}).get('ward', 'N/A')}")
        print(f"   Status: {c.get('status', 'N/A')}")
        
        officer = c.get('assigned_officer')
        if officer:
            print(f"   👮 Assigned Officer: {officer.get('name', 'N/A')}")
            print(f"      Title: {officer.get('title', 'N/A')}")
            print(f"      Department: {officer.get('department', 'N/A')}")
        else:
            print(f"   ⚠️ No officer assigned (needs manual routing)")
        
        print(f"   Created: {c.get('created_at', 'N/A')}")
        print("-" * 40)

print("\n" + "="*60)
print("📊 Database Stats:")
print(f"   Total complaints: {db.complaints.count_documents({})}")
print(f"   Assigned: {db.complaints.count_documents({'status': 'assigned'})}")
print(f"   Unassigned: {db.complaints.count_documents({'status': 'unassigned'})}")
print(f"   Total officers: {db.officers.count_documents({})}")
print("="*60 + "\n")

client.close()
