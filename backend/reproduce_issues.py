
import os
import django
import json
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_api.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile, FaultReport, RoomRequest, ClassroomStatus, LabStatus

def run_diagnostics():
    print("--- DIAGNOSTICS START ---")

    # 1. Check Users
    print("\n[1] Check Users:")
    users = User.objects.all()
    for u in users:
        try:
            profile = u.profile
            print(f"User: {u.email}, Role: {profile.role}")
        except:
            print(f"User: {u.email}, No Profile")

    # 2. Check Rooms (for 'Manager cannot find any room')
    print("\n[2] Check Classrooms:")
    classrooms = ClassroomStatus.objects.all()
    for c in classrooms:
        print(f"Classroom: {c.name}, Building: {c.building}, Capacity: {c.max_capacity}, Available: {c.is_available}")
    
    print("\n[2b] Check Labs:")
    labs = LabStatus.objects.all()
    for l in labs:
        print(f"Lab: {l.name}, Building: {l.building}, Capacity: {l.max_capacity}, Available: {l.is_available}")

    # 3. Test Fault Report Creation (Frontend payload simulation)
    print("\n[3] Test Fault Report Creation:")
    # Simulated frontend payload
    frontend_data = {
        "title": "Test Fault",
        "description": "Testing fault submission",
        "building": "Test Building",  # Frontend sends this
        "room_number": "101",         # Frontend sends this
        "category": "electrical",
        "severity": "medium",
        "location_type": "classroom"  # Frontend sends this
    }
    
    # Simulate what the view does
    # The view (create_fault) uses data.get("location", "") and IGNORES building/room_number
    # It also ignores location_type
    
    user = User.objects.first() # specific user doesn't matter for this logic test
    if user:
        try:
            # Manually replicating view logic to confirm suspicion
            fault = FaultReport.objects.create(
                reported_by=user,
                title=frontend_data.get("title", ""),
                description=frontend_data.get("description", ""),
                location=frontend_data.get("location", ""), # This will be empty!
                severity=frontend_data.get("severity", "medium"),
                category=frontend_data.get("category", "other"),
                status="open",
            )
            print(f"Created Fault ID: {fault.id}")
            print(f"Title: {fault.title}")
            print(f"Saved Location: '{fault.location}' (Expected empty if bug exists)")
            print(f"Saved Building: '{fault.building}' (Expected empty if bug exists)")
            print(f"Saved Room Number: '{fault.room_number}' (Expected empty if bug exists)")
            
            # Save the fault for inspection, or delete it? Let's keep it to verify.
        except Exception as e:
            print(f"Error creating fault: {e}")

    print("\n--- DIAGNOSTICS END ---")

if __name__ == "__main__":
    run_diagnostics()
