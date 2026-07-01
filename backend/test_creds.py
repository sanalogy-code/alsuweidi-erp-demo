from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f"URL: {url}")
print(f"Key first 30 chars: {key[:30] if key else 'MISSING'}")
print(f"Full key length: {len(key) if key else 0}")

try:
    client = create_client(url, key)
    print("Client created successfully")
    result = client.table('companies').select('*').limit(1).execute()
    print(f"Query SUCCESS: Got {len(result.data)} rows")
except Exception as e:
    print(f"FAILED: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
