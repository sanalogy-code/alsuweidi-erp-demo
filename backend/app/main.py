from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests
import json

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

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://ybxwoasgiozifzwuijtg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "sb_secret_kxNZTmuLT1kxLhuNqf-yHQ_4cxjrK9x"

def query_supabase(table, select="*", filters=None, limit=None, order_by=None):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    params = {"select": select}
    if limit:
        params["limit"] = limit
    if order_by:
        params["order"] = order_by
    if filters:
        for key, val in filters.items():
            params[f"{key}=eq.{val}"] = True

    resp = requests.get(url, headers=headers, params=params)
    if resp.status_code == 200:
        return resp.json()
    return []

@app.get("/health")
async def health():
    return {"status": "ok", "message": "AL SUWEIDI ERP API is running"}

@app.get("/")
async def root():
    return {"message": "AL SUWEIDI ERP API v3"}

@app.get("/diagnostic")
async def diagnostic():
    try:
        companies = query_supabase("companies", select="id", limit=1)
        return {
            "status": "ok",
            "supabase_url": SUPABASE_URL,
            "api_key_set": bool(SUPABASE_KEY),
            "companies_count": len(companies),
            "sample_row": companies[0] if companies else None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

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
        data = query_supabase("companies", select="*")
        print(f"Companies query returned: {len(data)} rows")
        return data
    except Exception as e:
        print(f"ERROR fetching companies: {e}")
        return []

@app.get("/api/crm/companies/{company_id}")
async def get_company(company_id: int):
    try:
        url = f"{SUPABASE_URL}/rest/v1/companies?id=eq.{company_id}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200 and resp.json():
            return resp.json()[0]
        raise HTTPException(status_code=404, detail="Company not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/crm/contacts")
async def get_contacts():
    try:
        data = query_supabase("contacts", select="*")
        return data
    except Exception as e:
        print(f"Error fetching contacts: {e}")
        return []

@app.get("/api/crm/contacts/{contact_id}")
async def get_contact(contact_id: int):
    try:
        url = f"{SUPABASE_URL}/rest/v1/contacts?id=eq.{contact_id}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200 and resp.json():
            return resp.json()[0]
        raise HTTPException(status_code=404, detail="Contact not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching contact {contact_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/crm/deals")
async def get_deals():
    try:
        data = query_supabase("deals", select="*")
        return data
    except Exception as e:
        print(f"Error fetching deals: {e}")
        return []

# Analytics endpoints
@app.get("/api/analytics/linkedin/current")
async def get_linkedin():
    try:
        url = f"{SUPABASE_URL}/rest/v1/linkedin_metrics?select=*&order=snapshot_date.desc&limit=1"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200 and resp.json():
            data = resp.json()[0]
            return {
                "total_followers": data.get("total_followers", 0),
                "new_followers": data.get("new_followers", 0),
                "seniority_breakdown": data.get("seniority_breakdown", {}),
                "industry_breakdown": data.get("industry_breakdown", {}),
                "location_breakdown": data.get("location_breakdown", {}),
            }
        return {"total_followers": 0, "new_followers": 0}
    except Exception as e:
        print(f"Error fetching LinkedIn: {e}")
        return {"total_followers": 0, "new_followers": 0}

@app.get("/api/analytics/dashboard")
async def get_dashboard():
    try:
        linkedin = await get_linkedin()
        companies = query_supabase("companies", select="id")
        deals = query_supabase("deals", select="value,stage")

        total_deal_value = sum([d.get("value", 0) for d in deals if d.get("stage") != "lost"])

        return {
            "total_followers": linkedin.get("total_followers", 0),
            "new_followers_this_month": linkedin.get("new_followers", 0),
            "total_companies": len(companies),
            "total_deal_value": total_deal_value,
        }
    except Exception as e:
        print(f"Error fetching dashboard: {e}")
        return {"total_followers": 0, "new_followers_this_month": 0, "total_companies": 0, "total_deal_value": 0}

# Content endpoints
@app.get("/api/content/calendar")
async def get_calendar():
    try:
        data = query_supabase("content_calendar", select="*")
        return data
    except Exception as e:
        print(f"Error fetching calendar: {e}")
        return []

@app.get("/api/content/templates")
async def get_templates():
    try:
        data = query_supabase("content_templates", select="*")
        return data
    except Exception as e:
        print(f"Error fetching templates: {e}")
        return []
