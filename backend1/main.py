from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import datetime, random, uuid

app = FastAPI(title="POS Machine Tracking System")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ─── MODELS ───────────────────────────────────────────────────────────
class AdminLogin(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    employee_id: str
    domain: str
    password: str

class AdminSignup(BaseModel):
    name: str
    employee_id: str
    username: str
    department: str
    password: str

class UserCreate(BaseModel):
    name: str
    employee_id: str
    username: str
    department: str
    domain: str  # scan_warehouse | app_load | key_inject | dispatch
    password: Optional[str] = "1234"

class POSCreate(BaseModel):
    serial_number: str
    model: str
    terminal_id: str
    merchant: str
    location: str

class StatusUpdate(BaseModel):
    field: str
    value: bool

class PageAccessUpdate(BaseModel):
    dashboard: bool = True
    inward_entry: bool = True
    reports: bool = True

DOMAIN_LABELS = {
    "scan_warehouse": "Scan & Warehouse",
    "app_load": "App Load",
    "key_inject": "Key Inject",
    "dispatch": "Dispatch",
}

# ─── MOCK DATA ────────────────────────────────────────────────────────
def gen_machines():
    machines = []
    models   = ["Hitachi TP-V7000","Hitachi TP-V5000","Hitachi TP-V3000","Hitachi VT-100","Hitachi PAX-920"]
    locs     = ["Delhi","Mumbai","Bangalore","Chennai","Kolkata","Pune","Hyderabad"]
    merchants= ["RetailMart","QuickShop","MegaMall","CityStore","FreshMart","TechHub","PayEasy","ShopNow"]
    for _ in range(50):
        days   = random.randint(0, 14)
        hours  = random.randint(0, 23)
        dt     = datetime.datetime.now() - datetime.timedelta(days=days, hours=hours)
        lvl    = random.choices([1,2,3,4], weights=[15,30,25,30])[0]
        now    = datetime.datetime.now()
        machines.append({
            "id": str(uuid.uuid4()),
            "serial_number": f"HIT{random.randint(10000000,99999999)}",
            "model": random.choice(models),
            "terminal_id": f"TID{random.randint(10000,99999)}",
            "merchant": random.choice(merchants),
            "location": random.choice(locs),
            "warehouse_status": True,
            "warehouse_at": (dt).isoformat(),
            "app_load_status": lvl >= 2,
            "app_load_at": (dt + datetime.timedelta(hours=2)).isoformat() if lvl >= 2 else None,
            "key_injection_status": lvl >= 3,
            "key_injection_at": (dt + datetime.timedelta(hours=5)).isoformat() if lvl >= 3 else None,
            "dispatch_status": lvl >= 4,
            "dispatch_at": (dt + datetime.timedelta(hours=8)).isoformat() if lvl >= 4 else None,
            "scanned_at": dt.isoformat(),
            "scanned_by": random.choice(["EMP001","EMP002","EMP003"]),
        })
    return machines

pos_machines = gen_machines()

users_db = [
    {
        "id": "usr_admin_001",
        "name": "System Admin",
        "employee_id": "EMP000",
        "username": "admin",
        "department": "IT",
        "domain": None,
        "role": "admin",
        "password": "1234",
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":True},
        "created_at": "2024-01-01",
    },
    {
        "id": "usr_002",
        "name": "Rahul Sharma",
        "employee_id": "EMP001",
        "username": "rahul",
        "department": "Warehouse",
        "domain": "scan_warehouse",
        "role": "user",
        "password": "1234",
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
        "created_at": "2024-02-01",
    },
    {
        "id": "usr_003",
        "name": "Priya Mehta",
        "employee_id": "EMP002",
        "username": "priya",
        "department": "Tech",
        "domain": "app_load",
        "role": "user",
        "password": "1234",
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
        "created_at": "2024-02-15",
    },
    {
        "id": "usr_004",
        "name": "Amit Kumar",
        "employee_id": "EMP003",
        "username": "amit",
        "department": "Tech",
        "domain": "key_inject",
        "role": "user",
        "password": "1234",
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
        "created_at": "2024-03-01",
    },
    {
        "id": "usr_005",
        "name": "Sneha Patel",
        "employee_id": "EMP004",
        "username": "sneha",
        "department": "Logistics",
        "domain": "dispatch",
        "role": "user",
        "password": "1234",
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
        "created_at": "2024-03-15",
    },
]

def safe_user(u): return {k:v for k,v in u.items() if k!="password"}

# ─── AUTH ─────────────────────────────────────────────────────────────
@app.post("/api/auth/admin/login")
async def admin_login(req: AdminLogin):
    if req.password != "1234":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    u = next((u for u in users_db if u["username"]==req.username and u["role"]=="admin"), None)
    if not u:
        # auto create admin for demo
        u = {
            "id": str(uuid.uuid4()),
            "name": req.username.title(),
            "employee_id": f"EMP{random.randint(100,999)}",
            "username": req.username,
            "department": "Administration",
            "domain": None,
            "role": "admin",
            "password": "1234",
            "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":True},
            "created_at": datetime.datetime.now().isoformat()[:10],
        }
        users_db.append(u)
    return {"success":True,"user":safe_user(u)}

@app.post("/api/auth/admin/signup")
async def admin_signup(req: AdminSignup):
    if next((u for u in users_db if u["username"]==req.username), None):
        raise HTTPException(status_code=400, detail="Username already exists")
    u = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "employee_id": req.employee_id,
        "username": req.username,
        "department": req.department,
        "domain": None,
        "role": "admin",
        "password": req.password,
        "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":True},
        "created_at": datetime.datetime.now().isoformat()[:10],
    }
    users_db.append(u)
    return {"success":True,"user":safe_user(u)}

@app.post("/api/auth/user/login")
async def user_login(req: UserLogin):
    if req.password != "1234":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    u = next((u for u in users_db if u["employee_id"]==req.employee_id and u.get("domain")==req.domain), None)
    if not u:
        # auto-create for demo
        label = DOMAIN_LABELS.get(req.domain, req.domain)
        u = {
            "id": str(uuid.uuid4()),
            "name": f"User {req.employee_id}",
            "employee_id": req.employee_id,
            "username": req.employee_id.lower(),
            "department": label,
            "domain": req.domain,
            "role": "user",
            "password": "1234",
            "page_access": {"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
            "created_at": datetime.datetime.now().isoformat()[:10],
        }
        users_db.append(u)
    return {"success":True,"user":safe_user(u)}

# ─── MACHINES ─────────────────────────────────────────────────────────
@app.get("/api/machines")
async def get_machines():
    return {"machines": pos_machines, "total": len(pos_machines)}

@app.post("/api/machines")
async def create_machine(m: POSCreate):
    now = datetime.datetime.now().isoformat()
    nm = {
        "id": str(uuid.uuid4()),
        "serial_number": m.serial_number, "model": m.model,
        "terminal_id": m.terminal_id, "merchant": m.merchant, "location": m.location,
        "warehouse_status": True, "warehouse_at": now,
        "app_load_status": False, "app_load_at": None,
        "key_injection_status": False, "key_injection_at": None,
        "dispatch_status": False, "dispatch_at": None,
        "scanned_at": now, "scanned_by": "current_user",
    }
    pos_machines.append(nm)
    return {"success":True,"machine":nm}

@app.put("/api/machines/{mid}")
async def update_machine(mid: str, upd: StatusUpdate):
    m = next((x for x in pos_machines if x["id"]==mid), None)
    if not m: raise HTTPException(404,"Not found")
    m[upd.field] = upd.value
    if upd.value:
        ts_map = {"warehouse_status":"warehouse_at","app_load_status":"app_load_at","key_injection_status":"key_injection_at","dispatch_status":"dispatch_at"}
        if upd.field in ts_map: m[ts_map[upd.field]] = datetime.datetime.now().isoformat()
    return {"success":True,"machine":m}

@app.delete("/api/machines/{mid}")
async def delete_machine(mid: str):
    global pos_machines
    pos_machines = [x for x in pos_machines if x["id"]!=mid]
    return {"success":True}

# ─── DASHBOARD ────────────────────────────────────────────────────────
@app.get("/api/dashboard/stats")
async def stats():
    today = datetime.datetime.now().date()
    total       = len(pos_machines)
    dispatched  = sum(1 for m in pos_machines if m["dispatch_status"])
    key_inj     = sum(1 for m in pos_machines if m["key_injection_status"] and not m["dispatch_status"])
    app_loaded  = sum(1 for m in pos_machines if m["app_load_status"] and not m["key_injection_status"])
    in_wh       = sum(1 for m in pos_machines if m["warehouse_status"] and not m["app_load_status"])
    today_scan  = sum(1 for m in pos_machines if datetime.datetime.fromisoformat(m["scanned_at"]).date()==today)
    daily = []
    for i in range(7):
        d = today - datetime.timedelta(days=6-i)
        dm = [m for m in pos_machines if datetime.datetime.fromisoformat(m["scanned_at"]).date()==d]
        daily.append({"date":d.strftime("%d %b"),"scanned":len(dm),
                      "dispatched":sum(1 for m in dm if m["dispatch_status"]),
                      "appLoaded":sum(1 for m in dm if m["app_load_status"]),
                      "keyInjected":sum(1 for m in dm if m["key_injection_status"])})
    return {"total":total,"todayScanned":today_scan,"inWarehouse":in_wh,"appLoaded":app_loaded,
            "keyInjected":key_inj,"dispatched":dispatched,"terminalCount":total,"dailyData":daily,
            "statusBreakdown":[
                {"name":"Warehouse","value":in_wh,"color":"#F59E0B"},
                {"name":"App Load","value":app_loaded,"color":"#3B82F6"},
                {"name":"Key Inject","value":key_inj,"color":"#8B5CF6"},
                {"name":"Dispatched","value":dispatched,"color":"#10B981"},
            ]}

# ─── USERS ────────────────────────────────────────────────────────────
@app.get("/api/users")
async def get_users():
    return {"users":[safe_user(u) for u in users_db]}

@app.post("/api/users")
async def create_user(u: UserCreate):
    if next((x for x in users_db if x["employee_id"]==u.employee_id), None):
        raise HTTPException(400,"Employee ID already exists")
    nu = {
        "id":str(uuid.uuid4()),"name":u.name,"employee_id":u.employee_id,
        "username":u.username,"department":u.department,"domain":u.domain,
        "role":"user","password":u.password or "1234",
        "page_access":{"dashboard":True,"inward_entry":True,"reports":True,"user_management":False},
        "created_at":datetime.datetime.now().isoformat()[:10],
    }
    users_db.append(nu)
    return {"success":True,"user":safe_user(nu)}

@app.delete("/api/users/{uid}")
async def delete_user(uid: str):
    global users_db
    users_db=[u for u in users_db if u["id"]!=uid]
    return {"success":True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
