import boto3
import csv
import os
import urllib3
from datetime import datetime

# --- FIX: Disable SSL Warnings for Corporate Proxies ---
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# This tells boto3 not to verify the SSL certificate
os.environ['AWS_CA_BUNDLE'] = '' 

# --- Configuration ---
TABLE_NAME = "sigma-workstack-requests"
REGION = "us-east-1"
CSV_FILE_PATH = r"C:\Users\steve.oates\OneDrive - Sage Software, Inc\Documents\06. AI Projects\sigma-workstack\csv files\all_requests_20220202.csv"

def upload_data():
    # 1. Connect to DynamoDB with verify=False (Bypasses the SSL error)
    # We create a custom 'session' to inject the config
    session = boto3.Session(region_name=REGION)
    dynamodb = session.resource('dynamodb', verify=False) 
    table = dynamodb.Table(TABLE_NAME)

    print(f"📖 Reading CSV file...")

    success_count = 0
    error_count = 0

    try:
        with open(CSV_FILE_PATH, mode='r', encoding='cp1252', errors='replace') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                if not row.get('Ref') or not row.get('Title'):
                    continue

                try:
                    item = {
                        'PK': "ORG#SAGE",              
                        'SK': f"TICKET#{row['Ref']}",  
                        'Ref': row['Ref'],
                        'Title': row['Title'],
                        'Team': row.get('Team', 'Unassigned'),
                        'Status': row.get('Status', 'New'),
                        'Priority': row.get('Priority', 'Medium'),
                        'Description': row.get('Description', ''),
                        'BusinessValue': row.get('Business Value', 'No value provided'),
                        'DateAdded': row.get('Date Added', datetime.now().strftime('%Y-%m-%d')),
                        'EndDate': row.get('End Date', '')
                    }

                    table.put_item(Item=item)
                    print(f"🚀 Uploaded: {row['Ref']} - {row['Title'][:30]}...")
                    success_count += 1

                except Exception as e:
                    print(f"❌ Error uploading {row.get('Ref')}: {e}")
                    error_count += 1

    except FileNotFoundError:
        print(f"❌ Error: The file was not found at:\n{CSV_FILE_PATH}")
        return

    print("\n" + "="*30)
    print(f"🎉 Migration Complete!")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed:  {error_count}")
    print("="*30)

if __name__ == "__main__":
    upload_data()