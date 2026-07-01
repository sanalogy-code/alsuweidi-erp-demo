from supabase import create_client
from datetime import datetime, timedelta
import json

SUPABASE_URL = "https://ybxwoasgiozifzwuijtg.supabase.co"
SUPABASE_KEY = "sb_secret_kxNZTmuLT1kxLhuNqf-yHQ_4cxjrK9x"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Insert companies
companies = [
    {"name": "TechCorp UAE", "industry": "IT Services", "location": "Dubai", "website": "https://techcorp.ae", "notes": "Leading tech consulting firm"},
    {"name": "BuildCo Consulting", "industry": "Construction", "location": "Abu Dhabi", "website": "https://buildco.ae", "notes": "Engineering & construction services"},
    {"name": "DesignHub", "industry": "Creative Services", "location": "Dubai", "website": "https://designhub.ae", "notes": "Digital design agency"},
    {"name": "DataViz Solutions", "industry": "Analytics", "location": "Dubai", "website": "https://dataviz.ae", "notes": "Business intelligence platform"},
]

company_response = supabase.table("companies").insert(companies).execute()
company_ids = [c["id"] for c in company_response.data]

# Insert contacts
contacts = [
    {"company_id": company_ids[0], "name": "Ahmed Al Mansoori", "title": "CEO", "email": "ahmed@techcorp.ae", "phone": "+971501234567", "linkedin_url": "https://linkedin.com/in/ahmed"},
    {"company_id": company_ids[0], "name": "Fatima Al Ketbi", "title": "CTO", "email": "fatima@techcorp.ae", "phone": "+971502345678", "linkedin_url": "https://linkedin.com/in/fatima"},
    {"company_id": company_ids[1], "name": "Mohammed Al Mazrouei", "title": "Project Director", "email": "m.mazrouei@buildco.ae", "phone": "+971503456789", "linkedin_url": "https://linkedin.com/in/mohammed"},
    {"company_id": company_ids[2], "name": "Sara Al Suwaidi", "title": "Design Lead", "email": "sara@designhub.ae", "phone": "+971504567890", "linkedin_url": "https://linkedin.com/in/sara"},
    {"company_id": company_ids[3], "name": "Khalid Al Dhaheri", "title": "VP Analytics", "email": "khalid@dataviz.ae", "phone": "+971505678901", "linkedin_url": "https://linkedin.com/in/khalid"},
]

supabase.table("contacts").insert(contacts).execute()

# Insert deals
deals = [
    {"company_id": company_ids[0], "title": "ERP Implementation", "value": 450000, "stage": "proposal", "probability": 0.7, "close_date": (datetime.now() + timedelta(days=30)).isoformat()},
    {"company_id": company_ids[1], "title": "Data Analytics Platform", "value": 280000, "stage": "prospecting", "probability": 0.3, "close_date": (datetime.now() + timedelta(days=60)).isoformat()},
    {"company_id": company_ids[2], "title": "Brand Redesign Project", "value": 95000, "stage": "negotiation", "probability": 0.85, "close_date": (datetime.now() + timedelta(days=15)).isoformat()},
    {"company_id": company_ids[3], "title": "Custom BI Dashboard", "value": 320000, "stage": "proposal", "probability": 0.6, "close_date": (datetime.now() + timedelta(days=45)).isoformat()},
]

supabase.table("deals").insert(deals).execute()

# Insert LinkedIn metrics
linkedin_metrics = {
    "snapshot_date": datetime.now().isoformat(),
    "total_followers": 180500,
    "new_followers": 2500,
    "seniority_breakdown": json.dumps({"entry": 61652, "senior": 49644, "manager": 10841, "director": 35821, "vp": 16542, "cxo": 6000}),
    "industry_breakdown": json.dumps({"IT": 45000, "Finance": 28000, "Consulting": 22000, "Engineering": 18000, "Marketing": 15000}),
    "location_breakdown": json.dumps({"UAE": 65000, "Saudi": 32000, "Egypt": 28000, "Kuwait": 15000, "Bahrain": 12000}),
}

supabase.table("linkedin_metrics").insert([linkedin_metrics]).execute()

print("✓ Database populated with dummy data")
