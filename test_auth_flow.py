#!/usr/bin/env python3
"""
Test script to verify authentication and role selection flow
Run this from the project root directory
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_registration():
    """Test user registration"""
    print("\n=== TEST 1: User Registration ===")
    email = f"test_{hash(str(__import__('time').time()))}@test.com"
    password = "test123456"
    
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Registration successful!")
        print(f"   Email: {email}")
        print(f"   Token received: {bool(data.get('token'))}")
        print(f"   User role: {data.get('user', {}).get('role')}")
        return data.get('token'), email
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None, None

def test_me_endpoint(token):
    """Test /api/auth/me endpoint"""
    print("\n=== TEST 2: Verify Token (GET /api/auth/me) ===")
    if not token:
        print("❌ No token to test")
        return None
    
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token is valid!")
        print(f"   User: {data.get('user', {}).get('email')}")
        print(f"   Role: {data.get('user', {}).get('role')}")
        return data.get('user')
    else:
        print(f"❌ Token verification failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_set_role_student(token):
    """Test setting role to student"""
    print("\n=== TEST 3: Set Role to Student ===")
    if not token:
        print("❌ No token to test")
        return False
    
    response = requests.post(
        f"{BASE_URL}/api/auth/set-role",
        json={"role": "student"},
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Role set to student!")
        print(f"   User role: {data.get('user', {}).get('role')}")
        print(f"   Pending request: {data.get('pending_request', False)}")
        return True
    else:
        print(f"❌ Failed to set role: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_set_role_lecturer(token):
    """Test setting role to lecturer"""
    print("\n=== TEST 4: Set Role to Lecturer ===")
    if not token:
        print("❌ No token to test")
        return False
    
    response = requests.post(
        f"{BASE_URL}/api/auth/set-role",
        json={"role": "lecturer", "reason": "I am a lecturer"},
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Lecturer role request submitted!")
        print(f"   User role: {data.get('user', {}).get('role')}")
        print(f"   Pending request: {data.get('pending_request', False)}")
        return True
    else:
        print(f"❌ Failed to set role: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_set_role_manager(token):
    """Test setting role to manager"""
    print("\n=== TEST 5: Set Role to Manager ===")
    if not token:
        print("❌ No token to test")
        return False
    
    response = requests.post(
        f"{BASE_URL}/api/auth/set-role",
        json={
            "role": "manager",
            "manager_type": "librarian",
            "reason": "I need to manage libraries"
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Manager role request submitted!")
        print(f"   User role: {data.get('user', {}).get('role')}")
        print(f"   Manager type: {data.get('user', {}).get('manager_type')}")
        print(f"   Pending request: {data.get('pending_request', False)}")
        return True
    else:
        print(f"❌ Failed to set role: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_create_library(token, user_role):
    """Test creating a library"""
    print("\n=== TEST 6: Create Library ===")
    if not token:
        print("❌ No token to test")
        return False
    
    response = requests.post(
        f"{BASE_URL}/api/library/create",
        json={
            "name": "Test Library",
            "max_capacity": 100,
            "current_occupancy": 0,
            "is_open": True
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Library created successfully!")
        print(f"   Library name: {data.get('library', {}).get('name')}")
        return True
    elif response.status_code == 403:
        print(f"⚠️  Permission denied (expected if role is not manager/admin)")
        print(f"   Current role: {user_role}")
        print(f"   Response: {response.json().get('message')}")
        return False
    else:
        print(f"❌ Failed to create library: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def main():
    print("=" * 60)
    print("AUTHENTICATION AND ROLE SELECTION TEST SUITE")
    print("=" * 60)
    
    # Test 1: Registration
    token, email = test_registration()
    if not token:
        print("\n❌ Registration failed. Cannot continue tests.")
        sys.exit(1)
    
    # Test 2: Verify token
    user = test_me_endpoint(token)
    if not user:
        print("\n❌ Token verification failed. Cannot continue tests.")
        sys.exit(1)
    
    # Test 3: Set role to student
    test_set_role_student(token)
    
    # Verify user after role change
    user = test_me_endpoint(token)
    
    # Test 4: Set role to lecturer
    test_set_role_lecturer(token)
    
    # Test 5: Set role to manager
    test_set_role_manager(token)
    
    # Verify user after role change
    user = test_me_endpoint(token)
    
    # Test 6: Try to create library (will fail if not manager/admin)
    test_create_library(token, user.get('role') if user else None)
    
    print("\n" + "=" * 60)
    print("TEST SUITE COMPLETE")
    print("=" * 60)
    print("\nNote: Manager and Lecturer roles require admin approval.")
    print("      Users remain as 'student' until approved.")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend server!")
        print("   Make sure the Django server is running on http://127.0.0.1:8000")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
