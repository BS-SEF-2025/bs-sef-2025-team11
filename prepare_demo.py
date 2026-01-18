
import os
import django
import sys
from datetime import date, time, timedelta

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_api.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile, FaultReport, RoomRequest, Notification, ClassroomStatus, LabStatus

def create_demo_data():
    print("🚀 Preparing Demo Data...")

    # 1. Create Users
    manager, _ = User.objects.get_or_create(username='demo_manager@test.com', email='demo_manager@test.com')
    manager.set_password('password123')
    manager.save()
    Profile.objects.update_or_create(user=manager, defaults={'role': 'manager'})
    print("✅ Manager created: demo_manager@test.com / password123")

    lecturer, _ = User.objects.get_or_create(username='demo_lecturer@test.com', email='demo_lecturer@test.com')
    lecturer.set_password('password123')
    lecturer.save()
    Profile.objects.update_or_create(user=lecturer, defaults={'role': 'lecturer'})
    print("✅ Lecturer created: demo_lecturer@test.com / password123")

    # 2. Populate Charts (Fault Reports)
    # Clear existing to ensure clean charts? Maybe not, just add more.
    print("📊 Generating Analytics Data...")
    FaultReport.objects.create(reported_by=manager, title="Broken Projector", building="Engineering Block", room_number="101", category="projector", status="open")
    FaultReport.objects.create(reported_by=manager, title="Another Projector", building="Engineering Block", room_number="102", category="projector", status="open")
    FaultReport.objects.create(reported_by=manager, title="WiFi Down", building="Science Hall", room_number="Lab 1", category="network", status="in_progress")
    FaultReport.objects.create(reported_by=manager, title="AC Leaking", building="Science Hall", room_number="Lab 2", category="ac", status="open")
    FaultReport.objects.create(reported_by=manager, title="Broken Chair", building="Library", room_number="Main Hall", category="furniture", status="resolved")
    
    # 3. Populate Calendar (Room Requests)
    print("📅 Populating Schedule...")
    c1, _ = ClassroomStatus.objects.get_or_create(name="Lecture Hall A", building="Engineering", room_number="101")
    
    today = date.today()
    # Request for today at 10 AM (Approved)
    RoomRequest.objects.create(
        requested_by=lecturer,
        room_type="classroom",
        classroom=c1,
        purpose="Intro to Demo 101",
        expected_attendees=30,
        requested_date=today,
        start_time=time(10, 0),
        end_time=time(12, 0),
        status="approved"
    )
    # Request for tomorrow at 2 PM (Pending)
    RoomRequest.objects.create(
        requested_by=lecturer,
        room_type="classroom",
        purpose="Advanced Python",
        expected_attendees=20,
        requested_date=today + timedelta(days=1),
        start_time=time(14, 0),
        end_time=time(16, 0),
        status="pending"
    )

    # 4. Create Notifications
    print("🔔 Sending Notifications...")
    Notification.objects.create(
        user=lecturer,
        title="Welcome to Premium",
        message="Your new dashboard features are ready! Check out the interactive calendar.",
        is_read=False
    )
    Notification.objects.create(
        user=manager,
        title="System Update",
        message="Analytics dashboard has been updated with real-time data.",
        is_read=False,
        action_link="/recurring-issues"
    )

    print("✨ Demo Preparation Complete!")

if __name__ == '__main__':
    create_demo_data()
