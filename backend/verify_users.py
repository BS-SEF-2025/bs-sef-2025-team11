import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_api.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

users = [
    ('admin@campus.edu', 'admin123'),
    ('student@campus.edu', 'student123'),
    ('lecturer@campus.edu', 'lecturer123'),
    ('manager@campus.edu', 'manager123')
]

print("--- User Verification ---")
for email, password in users:
    exists = User.objects.filter(username=email).exists()
    auth_success = authenticate(username=email, password=password) is not None
    print(f"Email: {email}, Exists: {exists}, Auth Success: {auth_success}")

print("\n--- All Users in DB ---")
for u in User.objects.all():
    print(f"Username: {u.username}, Email: {u.email}")
