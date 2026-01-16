#!/usr/bin/env python3
"""
Quick test to verify token encoding/decoding works
Run this while Django server is running to test the token flow
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_registration_and_role():
    print("=" * 60)
    print("Testing Registration → Role Selection Flow")
    print("=" * 60)
    
    # Step 1: Register
    print("\n1. Registering new user...")
    email = f"test_{hash('test') % 10000}@example.com"
    password = "testpass123"
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password
        })
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ✗ Registration failed: {response.text}")
            return
        
        data = response.json()
        token = data.get("token")
        user = data.get("user")
        
        print(f"   ✓ Registration successful")
        print(f"   Token received: {bool(token)}")
        print(f"   Token length: {len(token) if token else 0}")
        print(f"   User email: {user.get('email') if user else 'None'}")
        print(f"   User role: {user.get('role') if user else 'None'}")
        
        if not token:
            print("   ✗ No token received!")
            return
        
    except Exception as e:
        print(f"   ✗ Registration error: {e}")
        return
    
    # Step 2: Test /api/auth/me endpoint
    print("\n2. Testing /api/auth/me endpoint...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Token is valid")
            print(f"   User: {data.get('user', {}).get('email', 'None')}")
        else:
            print(f"   ✗ Token validation failed: {response.text}")
            return
    except Exception as e:
        print(f"   ✗ Error testing /api/auth/me: {e}")
        return
    
    # Step 3: Test set-role endpoint
    print("\n3. Testing /api/auth/set-role endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/auth/set-role", 
            headers=headers,
            json={"role": "student"}
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Role set successfully")
            print(f"   User role: {data.get('user', {}).get('role', 'None')}")
        else:
            print(f"   ✗ Role set failed")
            try:
                error = response.json()
                print(f"   Error message: {error.get('message', 'Unknown')}")
            except:
                print(f"   Error text: {response.text}")
    except Exception as e:
        print(f"   ✗ Error setting role: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)
    print(f"\nTest user: {email}")
    print(f"Password: {password}")
    print(f"Token: {token[:50]}...")

if __name__ == "__main__":
    test_registration_and_role()
