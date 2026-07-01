from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AL SUWEIDI ERP", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "message": "AL SUWEIDI ERP API is running"}

@app.get("/")
async def root():
    return {"message": "AL SUWEIDI ERP API v3"}

# Auth endpoint
@app.post("/api/auth/login")
async def login(username: str, password: str):
    USERS = {
        "sales": {"password": "password123", "role": "sales"},
        "marketing": {"password": "password123", "role": "marketing"},
        "pm": {"password": "password123", "role": "pm"},
        "management": {"password": "password123", "role": "management"},
        "admin": {"password": "password123", "role": "admin"},
    }
    user = USERS.get(username)
    if not user or user["password"] != password:
        return {"error": "Invalid credentials"}, 401
    return {"access_token": "dummy-token", "token_type": "bearer", "role": user["role"]}

# CRM endpoints
@app.get("/api/crm/companies")
async def get_companies():
    return [
        {"id": 1, "name": "TechCorp", "industry": "IT", "location": "Dubai"},
        {"id": 2, "name": "BuildCo", "industry": "Construction", "location": "Abu Dhabi"}
    ]

@app.get("/api/crm/contacts")
async def get_contacts():
    return [
        {"id": 1, "company_id": 1, "name": "Ahmed Al Mansoori", "title": "CEO", "email": "ahmed@techcorp.ae"},
        {"id": 2, "company_id": 1, "name": "Fatima Al Ketbi", "title": "CTO", "email": "fatima@techcorp.ae"}
    ]

@app.get("/api/crm/deals")
async def get_deals():
    return [
        {"id": 1, "company_id": 1, "title": "Website Redesign", "value": 50000, "stage": "proposal"},
        {"id": 2, "company_id": 2, "title": "Infrastructure", "value": 150000, "stage": "prospecting"}
    ]

# Analytics endpoints
@app.get("/api/analytics/linkedin/current")
async def get_linkedin():
    return {
        "total_followers": 180500,
        "new_followers": 2500,
        "seniority_breakdown": {"entry": 61652, "senior": 49644, "manager": 10841, "director": 7273}
    }

@app.get("/api/analytics/dashboard")
async def get_dashboard():
    return {
        "total_followers": 180500,
        "new_followers_this_month": 2500,
        "follower_growth_pct": 1.4,
        "quality_score": 10.9
    }

# Content endpoints
@app.get("/api/content/calendar")
async def get_calendar():
    return [
        {"id": 1, "date": "2026-07-10", "channel": "linkedin", "title": "New Project", "status": "planned"},
        {"id": 2, "date": "2026-07-15", "channel": "website", "title": "Blog Post", "status": "draft"}
    ]

@app.get("/api/content/templates")
async def get_templates():
    return [
        {"id": 1, "name": "LinkedIn Post", "type": "linkedin_post"},
        {"id": 2, "name": "Blog Template", "type": "blog_post"}
    ]
