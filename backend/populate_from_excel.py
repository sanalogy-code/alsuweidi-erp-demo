import pandas as pd
from datetime import datetime
import json

# Read Excel file
excel_file = r"C:\Users\sdiab\OneDrive - ALSUWEIDI\Marketing Team - Documents\02 - Content\Contacts_CRM.xlsx"
df = pd.read_excel(excel_file)

print(f"Loaded {len(df)} records from Excel")

# Extract unique companies
companies_list = df['Company'].dropna().unique().tolist()
print(f"Found {len(companies_list)} unique companies: {companies_list}")

# Prepare company data
companies_data = []
for company in companies_list:
    if pd.isna(company) or company == '':
        continue
    companies_data.append({
        'name': str(company),
        'industry': df[df['Company'] == company]['Sector'].iloc[0] if len(df[df['Company'] == company]) > 0 else '',
        'location': df[df['Company'] == company]['Location / City'].iloc[0] if len(df[df['Company'] == company]) > 0 else '',
    })

# Prepare contacts
contacts_data = []
for _, row in df.iterrows():
    if pd.isna(row.get('Name')) or row.get('Name') == '':
        continue

    contacts_data.append({
        'company': str(row.get('Company', '')),
        'name': str(row.get('Name', '')),
        'title': str(row.get('Role / Title', '')),
        'email': str(row.get('Email', '')),
        'phone': str(row.get('Mobile', '')),
        'location': str(row.get('Location / City', '')),
    })

print(f"\nCompanies to insert: {len(companies_data)}")
print(f"Contacts to insert: {len(contacts_data)}")

# Write to CSV for manual Supabase import
import csv

out_dir = r"G:\My Drive\Personal\Documents\Sanaa\alsuweidi-erp-demo\backend"

with open(f'{out_dir}/companies.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'industry', 'location'])
    writer.writeheader()
    writer.writerows(companies_data)

with open(f'{out_dir}/contacts.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['company', 'name', 'title', 'email', 'phone', 'location'])
    writer.writeheader()
    writer.writerows(contacts_data)

print(f"\nExported to {out_dir}/companies.csv and {out_dir}/contacts.csv")
print("You can now import these to Supabase via the dashboard")
