# Debugging Guide - Signup & Role Selection Issues

## Current Problem
Users get "Unable to verify your session" or "Unable to set role" errors when trying to select a role after registration.

## What to Check

### 1. Backend Console (Django Server)
When you try to set a role, check the backend console for these debug messages:

**Expected messages:**
```
DEBUG: get_user_from_request called
DEBUG: Authorization header present: True
DEBUG: Authorization header (first 50 chars): Bearer eyJ...
DEBUG: Token extracted, length: XXX
DEBUG: Token (first 30 chars): eyJ...
DEBUG: Decoding token (first 20 chars): eyJ...
DEBUG: Using SECRET_KEY: change-me...
DEBUG: Token decoded successfully. Payload: {'sub': X, 'exp': ..., 'iat': ...}
DEBUG: Extracted user_id from token: X
DEBUG: Successfully authenticated user: user@example.com (id: X)
DEBUG: require_auth passed for set_role, user: user@example.com
DEBUG: /api/auth/set-role called for user: user@example.com
```

**If you see errors like:**
- `DEBUG: Token validation error (ValueError): ...` → Token decoding failed
- `DEBUG: User with id X not found in database` → User doesn't exist
- `DEBUG: require_auth failed for set_role` → Authentication failed

### 2. Browser Console (F12)
Check for these messages:

**During Registration:**
```
Attempting registration: user@example.com
Response status: 200
Token stored after registration
Token value (first 30 chars): eyJ...
User state set after registration: user@example.com
```

**During Role Selection:**
```
🔑 setRole called - role: student
🔑 Token exists: true
🔑 Token (first 30 chars): eyJ...
🔑 Calling set-role endpoint: /api/auth/set-role
📡 set-role Response status: 200 (or 401)
```

### 3. Network Tab (F12 → Network)
Check the actual HTTP requests:

1. **Registration request:**
   - URL: `POST /api/auth/register`
   - Status: Should be 200
   - Response: Should have `token` and `user` fields

2. **Set-role request:**
   - URL: `POST /api/auth/set-role`
   - Headers: Should have `Authorization: Bearer <token>`
   - Status: Check if it's 200, 401, or 400
   - Response: Check the error message

## Common Issues & Fixes

### Issue 1: Token not being sent
**Symptom:** Backend shows "No Authorization header found"
**Fix:** Check that token is in localStorage and being sent in headers

### Issue 2: Token decoding fails
**Symptom:** Backend shows "Token validation error"
**Possible causes:**
- SECRET_KEY mismatch
- Token format issue
- Token expired (unlikely right after registration)

### Issue 3: User not found
**Symptom:** Backend shows "User with id X not found in database"
**Fix:** User might have been deleted or ID mismatch

## Quick Test

1. Open browser console (F12)
2. Register a new user
3. Check console for token storage
4. Try to select a role
5. Check both browser console AND backend console
6. Share the error messages you see

## What Information I Need

Please share:
1. **Backend console output** when you try to set role
2. **Browser console output** (especially the setRole logs)
3. **Network tab** - the actual HTTP request/response for set-role
4. **The exact error message** you see in the UI

This will help me identify exactly where the authentication is failing.
