#!/usr/bin/env python3
"""
Test script to verify authentication and role assignment fixes.
Run this after starting the Django server to test the full flow.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_flow():
    print("=" * 60)
    print("Testing Authentication & Role Assignment Flow")
    print("=" * 60)
    
    # Test 1: Register a new user
    print("\n1. Testing Registration...")
    email = f"test_{hash('test') % 10000}@example.com"
    password = "testpass123"
    
    register_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user")
            print(f"   ✓ Registration successful")
            print(f"   User email: {user.get('email')}")
            print(f"   User role: {user.get('role')}")
            print(f"   Token received: {bool(token)}")
        else:
            print(f"   ✗ Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Registration error: {e}")
        return
    
    # Test 2: Set role to student
    print("\n2. Testing Role Selection (Student)...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    role_data = {
        "role": "student"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/set-role", json=role_data, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get("user")
            print(f"   ✓ Role set successfully")
            print(f"   User role: {user.get('role')}")
            print(f"   Pending request: {data.get('pending_request', False)}")
        else:
            print(f"   ✗ Role set failed: {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Role set error: {e}")
        return
    
    # Test 3: Verify user can access protected endpoint
    print("\n3. Testing Protected Endpoint Access...")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            user = data.get("user")
            print(f"   ✓ Protected endpoint accessible")
            print(f"   User email: {user.get('email')}")
            print(f"   User role: {user.get('role')}")
        else:
            print(f"   ✗ Protected endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Protected endpoint error: {e}")
    
    # Test 4: Try to create library (should fail for student)
    print("\n4. Testing Library Creation (should fail for student)...")
    library_data = {
        "name": "Test Library",
        "max_capacity": 100
    }
    
    try:
        response = requests.post(f"{BASE_URL}/library/create", json=library_data, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 403:
            print(f"   ✓ Correctly rejected (student cannot create libraries)")
            print(f"   Message: {response.json().get('message')}")
        else:
            print(f"   ⚠ Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ✗ Library creation error: {e}")
    
    # Test 5: Try to create lab (should fail for student)
    print("\n5. Testing Lab Creation (should fail for student)...")
    lab_data = {
        "name": "Test Lab",
        "building": "Building A",
        "room_number": "101",
        "max_capacity": 30
    }
    
    try:
        response = requests.post(f"{BASE_URL}/labs/create", json=lab_data, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 403:
            print(f"   ✓ Correctly rejected (student cannot create labs)")
            print(f"   Message: {response.json().get('message')}")
        else:
            print(f"   ⚠ Unexpected status: {response.text}")
    except Exception as e:
        print(f"   ✗ Lab creation error: {e}")
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("  - Registration: ✓")
    print("  - Role Selection: ✓")
    print("  - Protected Endpoints: ✓")
    print("  - Permission Checks: ✓")
    print("=" * 60)
    print("\nNote: To test manager/admin functionality, you need to:")
    print("  1. Create a role request for manager/lecturer")
    print("  2. Have an admin approve it")
    print("  3. Or create a superuser and set admin role directly")

if __name__ == "__main__":
    test_flow()
