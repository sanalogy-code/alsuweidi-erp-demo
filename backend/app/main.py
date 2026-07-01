from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AL SUWEIDI ERP", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://alsuweidi-erp-demo.pages.dev",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client (lazy initialization)
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://ybxwoasgiozifzwuijtg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "sb_secret_kxNZTmuLT1kxLhuNqf-yHQ_4cxjrK9x"
_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

@app.get("/health")
async def health():
    return {"status": "ok", "message": "AL SUWEIDI ERP API is running"}

@app.get("/")
async def root():
    return {"message": "AL SUWEIDI ERP API v3"}

class LoginRequest(BaseModel):
    username: str
    password: str

# Auth endpoint
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    USERS = {
        "sales": {"password": "password123", "role": "sales"},
        "marketing": {"password": "password123", "role": "marketing"},
        "pm": {"password": "password123", "role": "pm"},
        "management": {"password": "password123", "role": "management"},
        "admin": {"password": "password123", "role": "admin"},
    }
    user = USERS.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": "dummy-token", "token_type": "bearer", "role": user["role"]}

# CRM endpoints
@app.get("/api/crm/companies")
async def get_companies():
    try:
        client = get_supabase()
        response = client.table("companies").select("*").execute()
        print(f"Companies query returned: {len(response.data or [])} rows")
        return response.data if response.data else []
    except Exception as e:
        print(f"ERROR fetching companies: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return []

@app.get("/api/crm/companies/{company_id}")
async def get_company(company_id: int):
    try:
        response = get_supabase().table("companies").select("*").eq("id", company_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Company not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/crm/contacts")
async def get_contacts():
    try:
        response = get_supabase().table("contacts").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching contacts: {e}")
        return []

@app.get("/api/crm/contacts/{contact_id}")
async def get_contact(contact_id: int):
    try:
        response = get_supabase().table("contacts").select("*").eq("id", contact_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Contact not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching contact {contact_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/crm/deals")
async def get_deals():
    try:
        response = get_supabase().table("deals").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching deals: {e}")
        return []

# Analytics endpoints
@app.get("/api/analytics/linkedin/current")
async def get_linkedin():
    try:
        response = get_supabase().table("linkedin_metrics").select("*").order("snapshot_date", desc=True).limit(1).execute()
        if not response.data:
            return {"total_followers": 0, "new_followers": 0}
        data = response.data[0]
        return {
            "total_followers": data.get("total_followers", 0),
            "new_followers": data.get("new_followers", 0),
            "seniority_breakdown": data.get("seniority_breakdown", {}),
            "industry_breakdown": data.get("industry_breakdown", {}),
            "location_breakdown": data.get("location_breakdown", {}),
        }
    except Exception as e:
        print(f"Error fetching LinkedIn: {e}")
        return {"total_followers": 0, "new_followers": 0}

@app.get("/api/analytics/dashboard")
async def get_dashboard():
    try:
        linkedin = await get_linkedin()
        companies_response = get_supabase().table("companies").select("id").execute()
        deals_response = get_supabase().table("deals").select("value, stage").execute()

        total_deal_value = sum([d.get("value", 0) for d in (deals_response.data or []) if d.get("stage") != "lost"])

        return {
            "total_followers": linkedin.get("total_followers", 0),
            "new_followers_this_month": linkedin.get("new_followers", 0),
            "total_companies": len(companies_response.data or []),
            "total_deal_value": total_deal_value,
        }
    except Exception as e:
        print(f"Error fetching dashboard: {e}")
        return {"total_followers": 0, "new_followers_this_month": 0, "total_companies": 0, "total_deal_value": 0}

# Content endpoints
@app.get("/api/content/calendar")
async def get_calendar():
    try:
        response = get_supabase().table("content_calendar").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching calendar: {e}")
        return []

@app.get("/api/content/templates")
async def get_templates():
    try:
        response = get_supabase().table("content_templates").select("*").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching templates: {e}")
        return []
