import os
import sys
import django
import pandas as pd

sys.path.append('C:/coding projects/maps-app/BACKEND/db')  # Use forward slashes or raw string for path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'db.settings')
django.setup()

from data.models import BranchData  # Replace with your actual model

# Load the Excel file
file_path = 'C:/coding projects/maps-app/BACKEND/db/db/utils/BRANCHES AND LOCATION.xlsx'
sheet_name = 'BRANCH DETAILS'

# Read the Excel sheet into a pandas DataFrame
df = pd.read_excel(file_path, sheet_name=sheet_name)

# Assuming the column names in the Excel file match the field names of the Django model
# Iterate over the DataFrame and create Django model instances
for _, row in df.iterrows():
    obj, created = BranchData.objects.update_or_create(
        code=row['code'],  # 'code' is the field that must be unique
        defaults={
            'branchName': row['branchName'],
            'branchCity': row['branchCity'],
            'details': row['details'],
            'contact': row['contact'],
            'timeZone': row['timeZone'],
            'coordinates': row['coordinates']
        }
    )
    print(f"{'Created' if created else 'Updated'}: {obj.code}")

print("Data imported successfully into PostgreSQL database!")
