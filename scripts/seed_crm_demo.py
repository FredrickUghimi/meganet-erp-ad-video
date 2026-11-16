"""Seeds a LOCAL demo tenant for the Sales & CRM ad, through the app's real API.
Never point this at production: it only talks to the URL given (default
http://localhost:8000/api/v1/) and registers a fresh invented organisation.

usage: python3 -I scripts/seed_crm_demo.py [api-base]
Writes the owner's token and ids to <scratch>/seed.json (path from argv[2])."""
import json, sys, datetime as dt
import requests

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api/v1/").rstrip("/") + "/"
OUT = sys.argv[2] if len(sys.argv) > 2 else "seed.json"
PW = "S3cure-Pass!23"
S = requests.Session()


def call(method, path, token=None, **kw):
    h = {"Authorization": f"Token {token}"} if token else {}
    r = S.request(method, BASE + path.lstrip("/"), headers=h, **kw)
    if r.status_code >= 300:
        raise SystemExit(f"{method} {path} -> {r.status_code} {r.text[:400]}")
    return r.json() if r.content else {}


def results(x):
    return x["results"] if isinstance(x, dict) and "results" in x else x


reg = call("POST", "auth/register/", json={
    "organization_name": "Brightway Business Services", "email": "chidi@brightway-demo.example",
    "password": PW, "first_name": "Chidi", "last_name": "Okafor"})
OWNER = reg["token"]
roles = {r["name"]: r["id"] for r in results(call("GET", "roles/", OWNER))}
print("roles", list(roles))

reps = {}
for first, last, email in [("Amaka", "Eze", "amaka@brightway-demo.example"), ("Tunde", "Bello", "tunde@brightway-demo.example")]:
    call("POST", "users/", OWNER, json={"email": email, "password": PW, "first_name": first, "last_name": last, "role": roles["sales_staff"]})
    import subprocess, os
    subprocess.check_call([sys.executable, "manage.py", "shell", "-c", f"from apps.accounts.models import User; User.objects.filter(email='{email}').update(must_change_password=False)"],
                          cwd="/home/user/mega-net-erp-cloud", env={**os.environ, "DATABASE_URL": "postgres://postgres:postgres@localhost:5432/demo_crm"})
    from_login = call("POST", "auth/login/", json={"email": email, "password": PW, "role": "sales_staff"})
    reps[first] = from_login["token"]
print("reps ok")

src = {s["name"]: s["id"] for s in results(call("GET", "crm/lead-sources/", OWNER))}
lost = {s["name"]: s["id"] for s in results(call("GET", "crm/lost-reasons/", OWNER))}
stages = {s["name"]: s["id"] for s in results(call("GET", "crm/pipelines/", OWNER))[0]["stages"]}
print(src.keys())

# 12 leads, mixed sources. (token, contact, company, email, phone, source)
LEADS = [
    (OWNER, "Dr. Emeka Nwosu", "Harmony Specialist Hospital", "emeka@harmonyhospital.example", "0803 412 7781", "Referral"),
    (OWNER, "Ifeoma Chukwu", "Greenleaf Pharmacy", "ifeoma@greenleafpharm.example", "0805 220 1943", "Walk-in"),
    (reps["Amaka"], "Bola Adewale", "Palmview Hotel & Suites", "bola@palmviewhotel.example", "0813 556 0092", "Website"),
    (reps["Amaka"], "Segun Afolabi", "Orchid Diagnostics Centre", "segun@orchiddiag.example", "0809 118 3347", "Social media"),
    (reps["Tunde"], "Halima Danjuma", "Sunrise Medical Equipment", "halima@sunrisemed.example", "0802 774 6150", "Phone call"),
    (OWNER, "Kelechi Obi", "Cedar Court Hotel", "kelechi@cedarcourt.example", "0815 903 2268", "Event or exhibition"),
    (reps["Tunde"], "Yetunde Alabi", "Evergreen Pharmacy", "", "0807 331 8854", "Walk-in"),
    (OWNER, "Musa Garba", "Lakeshore Specialist Clinic", "musa@lakeshoreclinic.example", "", "Referral"),
    (reps["Amaka"], "Ngozi Eze", "Northgate Catering Equipment", "ngozi@northgatecatering.example", "0812 640 7719", "Website"),
    (reps["Tunde"], "Femi Ogunleye", "Pinnacle Facility Services", "femi@pinnaclefacility.example", "0806 285 4402", "Referral"),
    (OWNER, "Aisha Lawal", "Marina Bay Suites", "aisha@marinabay.example", "0818 477 1360", "Social media"),
    (reps["Amaka"], "Chinedu Okeke", "Kingsway Laboratory Services", "chinedu@kingswaylab.example", "0810 592 3086", "Phone call"),
]
leads = []
for tok, name, comp, email, phone, source in LEADS:
    body = {"contact_name": name, "company_name": comp, "phone": phone, "source": src[source]}
    if email:
        body["email"] = email
    leads.append((tok, call("POST", "crm/leads/", tok, json=body)))
print("leads", len(leads))

# mark a few as contacted / qualified so scores differ
for i, status in [(8, "qualified"), (11, "qualified"), (0, "qualified"), (1, "contacted"), (2, "qualified"), (4, "contacted"), (5, "qualified"), (7, "contacted"), (9, "qualified")]:
    tok, l = leads[i]
    call("POST", f"crm/leads/{l['id']}/{'contact' if status=='contacted' else 'qualify'}/", tok, json={})

today = dt.date.today()
exp = lambda d: (today + dt.timedelta(days=d)).isoformat()

# Convert 5 leads (customer + contact + deal in one step); amounts in naira.
CONVERT = [  # lead idx, deal name, amount, expected close days
    (0, "Hospital front-desk system", "4850000.00", 21),
    (2, "Hotel reservations and billing setup", "3200000.00", 14),
    (3, "Diagnostics centre billing", "1750000.00", 30),
    (5, "Hotel accounts and stock control", "2400000.00", 10),
    (9, "Facility services invoicing", "980000.00", 18),
]
deals = {}
for idx, name, amount, days in CONVERT:
    tok, l = leads[idx]
    r = call("POST", f"crm/leads/{l['id']}/convert/", tok, json={"mode": "create", "opportunity": {"name": name, "amount": amount, "expected_close_date": exp(days)}})
    deals[idx] = r
print("converted", len(deals))
opps = results(call("GET", "crm/opportunities/?page_size=100", OWNER))
byname = {o["name"]: o for o in opps}
print({n: o["stage_name"] for n, o in byname.items()})

# 3 more deals for existing-style customers
def new_customer(name, email, phone, tok):
    return call("POST", "customers/", tok, json={"name": name, "email": email, "phone_number": phone, "account_type": "company"})

extra = []
for tok, cname, email, phone, dname, amount, days in [
    (reps["Tunde"], "Riverside General Hospital", "info@riversidehospital.example", "0807 119 3340", "Pharmacy and ward billing", "3600000.00", 25),
    (reps["Amaka"], "Savannah Pharmacy Group", "accounts@savannahpharm.example", "0803 661 9025", "Multi-branch stock control", "1250000.00", 12),
    (OWNER, "Crestview Equipment Ltd", "sales@crestviewequip.example", "0809 507 2214", "Service jobs and invoicing", "2150000.00", 35),
]:
    c = new_customer(cname, email, phone, tok)
    o = call("POST", "crm/opportunities/", tok, json={"name": dname, "customer": c["id"], "amount": amount, "expected_close_date": exp(days)})
    extra.append(o)
opps = results(call("GET", "crm/opportunities/?page_size=100", OWNER))
byname = {o["name"]: o for o in opps}

def move(name, stage, tok=OWNER):
    call("POST", f"crm/opportunities/{byname[name]['id']}/move/", tok, json={"stage": stages[stage]})

# Pipeline spread (8 deals): Qualification 1, Proposal 2, Quotation sent 1 (+1 via real quotation in advance step), Negotiation 1, Won 2, Lost 1
move("Diagnostics centre billing", "Proposal")
move("Hospital front-desk system", "Proposal")
move("Hotel accounts and stock control", "Quotation sent")
move("Hotel reservations and billing setup", "Negotiation")
call("POST", f"crm/opportunities/{byname['Multi-branch stock control']['id']}/win/", reps["Amaka"])
call("POST", f"crm/opportunities/{byname['Service jobs and invoicing']['id']}/win/", OWNER)
call("POST", f"crm/opportunities/{byname['Pharmacy and ward billing']['id']}/lose/", reps["Tunde"],
     json={"lost_reason": lost["Chose a competitor"], "lost_note": "Went with a supplier already used by the group."})
print("won 2, lost 1")

# Follow-ups (owner's My Day): overdue, due today, next 7 days. Times in Lagos (UTC+1).
now = dt.datetime.now(dt.timezone(dt.timedelta(hours=1)))
at = lambda days, hour: (now.replace(hour=hour, minute=0, second=0, microsecond=0) + dt.timedelta(days=days)).isoformat()
cust = lambda idx: deals[idx]["customer"]["id"]
ACT = [
    (OWNER, "call", "Call Harmony Hospital about the quotation", at(-2, 10), {"customer": cust(0)}),
    (OWNER, "task", "Send Palmview Hotel the revised scope", at(-1, 15), {"customer": cust(2)}),
    (OWNER, "meeting", "Walk-through with Cedar Court Hotel", at(0, 11), {"customer": cust(5)}),
    (OWNER, "call", "Follow up with Greenleaf Pharmacy", at(0, 14), {"lead": leads[1][1]["id"]}),
    (OWNER, "task", "Confirm demo date with Lakeshore Clinic", at(0, 16), {"lead": leads[7][1]["id"]}),
    (OWNER, "appointment", "Site visit: Orchid Diagnostics", at(2, 10), {"customer": cust(3)}),
    (OWNER, "call", "Check in with Marina Bay Suites", at(3, 12), {"lead": leads[10][1]["id"]}),
    (OWNER, "meeting", "Review proposal with Pinnacle Facility", at(5, 9), {"customer": cust(9)}),
    (reps["Amaka"], "call", "Call Northgate Catering Equipment", at(0, 13), {"lead": leads[8][1]["id"]}),
    (reps["Tunde"], "task", "Send price list to Sunrise Medical", at(-1, 9), {"lead": leads[4][1]["id"]}),
]
for tok, typ, subj, due, link in ACT:
    me = call("GET", "auth/me/", tok)
    call("POST", "crm/activities/", tok, json={"activity_type": typ, "subject": subj, "due_at": due, "is_follow_up": True,
                                                 "assignee": me["id"], **link})
print("activities", len(ACT))

prod = call("POST", "products/", OWNER, json={"item_type": "service", "name": "Front-desk system setup and training", "unit_price": "4850000.00"})
json.dump({"owner": OWNER, "reps": reps, "converted_customers": {k: v["customer"]["id"] for k, v in deals.items()}, "opps": {n: o["id"] for n, o in byname.items()},
           "stages": stages, "product": prod["id"], "leads": [l["id"] for _, l in leads]}, open(OUT, "w"))
print("seed written")
