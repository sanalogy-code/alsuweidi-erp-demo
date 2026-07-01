import csv
import requests
import json

SUPABASE_URL = "https://ybxwoasgiozifzwuijtg.supabase.co"
SUPABASE_KEY = "sb_secret_kxNZTmuLT1kxLhuNqf-yHQ_4cxjrK9x"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Read companies
companies = []
with open('companies.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        companies.append({
            'name': row['name'],
            'industry': row['industry'] if row['industry'] != 'nan' else '',
            'location': row['location'] if row['location'] != 'nan' else '',
        })

# Insert companies in batches
print(f"Inserting {len(companies)} companies...")
for i in range(0, len(companies), 10):
    batch = companies[i:i+10]
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/companies",
        headers=headers,
        json=batch
    )
    if response.status_code not in [200, 201]:
        print(f"Error inserting batch {i}: {response.text}")
    else:
        print(f"  Inserted batch {i//10 + 1}")

# Get company IDs
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/companies?select=id,name",
    headers=headers
)
company_map = {c['name']: c['id'] for c in response.json()}
print(f"Got {len(company_map)} company IDs")

# Read and insert contacts
contacts = []
with open('contacts.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        company_id = company_map.get(row['company'])
        if not company_id:
            continue
        contacts.append({
            'company_id': company_id,
            'name': row['name'],
            'title': row['title'] if row['title'] != 'nan' else '',
            'email': row['email'] if row['email'] != 'nan' else '',
            'phone': row['phone'] if row['phone'] != 'nan' else '',
        })

print(f"Inserting {len(contacts)} contacts...")
for i in range(0, len(contacts), 10):
    batch = contacts[i:i+10]
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/contacts",
        headers=headers,
        json=batch
    )
    if response.status_code not in [200, 201]:
        print(f"Error inserting batch {i}: {response.text}")
    else:
        print(f"  Inserted batch {i//10 + 1}")

print("\nDone!")
