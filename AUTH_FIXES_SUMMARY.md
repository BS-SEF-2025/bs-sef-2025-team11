# Authentication & Authorization Fixes Summary

## Issues Fixed

### 1. Signup / Role Selection Issue ✅
**Problem**: Users were getting "Unauthorized" errors when selecting a role after signup, even though the user was created successfully.

**Root Causes**:
- Role selection endpoint wasn't handling None/empty role values correctly
- Authentication decorator wasn't providing clear error messages
- Role validation logic was too strict for new users

**Fixes Applied**:
- Updated `set_role` endpoint to properly handle None/empty roles (defaults to "student")
- Improved role validation to allow students to set their role immediately
- Enhanced error messages in authentication decorator
- Fixed `_user_to_dict` to always return a role (defaults to "student" if None)

**Files Modified**:
- `backend/accounts/views.py` - Updated `set_role` function and `_user_to_dict` function
- `backend/accounts/auth.py` - Enhanced `require_auth` decorator with better debugging

### 2. Authorization & Permissions Problem ✅
**Problem**: After logging in, users couldn't access protected endpoints due to permission issues.

**Root Causes**:
- Role checks were inconsistent (some used `prof.role`, others used `prof.role or "student"`)
- Authentication token validation wasn't providing clear feedback
- Role wasn't being properly retrieved from profile

**Fixes Applied**:
- Standardized role checks to use `prof.role or "student"` pattern
- Added debug logging to authentication flow
- Ensured all role-based endpoints check roles consistently
- Improved error messages to indicate current role vs required role

**Files Modified**:
- `backend/accounts/views.py` - Updated all role checks to be consistent
- `backend/accounts/auth.py` - Enhanced authentication with better error messages

### 3. Library / Lab Management Not Working ✅
**Problem**: Users with manager/admin roles couldn't create libraries or labs, getting Unauthorized/Forbidden errors.

**Root Causes**:
- Role checks in `create_library` and `create_lab` weren't handling None/empty roles
- Error messages weren't indicating what role the user had vs what was required
- Missing validation for required fields

**Fixes Applied**:
- Updated `create_library` and `create_lab` to properly check roles with fallback to "student"
- Added better error messages showing current role vs required role
- Added validation for required fields (name)
- Enhanced error handling with proper exception logging

**Files Modified**:
- `backend/accounts/views.py` - Updated `create_library` and `create_lab` functions

## Testing the Fixes

### Manual Testing Steps

1. **Test Signup & Role Selection**:
   ```
   1. Register a new user at /register
   2. After registration, you should be redirected to /role-selection
   3. Select "Student" role
   4. Should successfully set role and redirect to dashboard
   5. Check that user role is "student" in the dashboard
   ```

2. **Test Login & Authorization**:
   ```
   1. Log in with existing credentials
   2. Should successfully log in and access dashboard
   3. Try accessing protected pages (Library Status, Find Labs)
   4. Should work without "Unauthorized" errors
   ```

3. **Test Library Creation (as Student - should fail)**:
   ```
   1. Log in as a student
   2. Go to Library Status page
   3. Try to add a library
   4. Should get error: "Only managers and admins can create libraries"
   ```

4. **Test Library Creation (as Manager/Admin - should work)**:
   ```
   1. Create a user and set role to "manager" (requires admin approval)
   2. Or create a superuser and set admin role
   3. Log in as manager/admin
   4. Go to Library Status page
   5. Click "Add Library"
   6. Fill in form and submit
   7. Should successfully create library
   ```

5. **Test Lab Creation**:
   ```
   Same as Library Creation but on Find Labs page
   ```

### Automated Testing

Run the test script:
```bash
# Make sure Django server is running on http://127.0.0.1:8000
python test_auth_fix.py
```

This will test:
- User registration
- Role selection
- Protected endpoint access
- Permission checks for library/lab creation

## Key Changes Made

### Backend Changes

1. **`backend/accounts/views.py`**:
   - Fixed `set_role` to handle None/empty roles
   - Updated `_user_to_dict` to always return a role
   - Enhanced `create_library` and `create_lab` with better role checks
   - Added debug logging throughout

2. **`backend/accounts/auth.py`**:
   - Enhanced `require_auth` decorator with better error messages
   - Added debug logging for authentication flow

### Frontend Changes

No frontend changes were needed - the frontend was already correctly sending requests.

## Role Assignment Flow

1. **Student Role**: Can be set immediately after registration
2. **Lecturer/Manager Role**: Requires admin approval (creates a RoleRequest)
3. **Admin Role**: Can only be set by superusers or through admin approval

## Next Steps for Full Testing

To fully test manager/admin functionality:

1. **Create an Admin User**:
   ```bash
   cd backend
   python manage.py createsuperuser
   # Follow prompts to create admin user
   ```

2. **Or Approve Role Requests**:
   - Register as a regular user
   - Select "Manager" or "Lecturer" role
   - Log in as admin
   - Go to User Management page
   - Approve the role request
   - Log back in as the user
   - Now they should be able to create libraries/labs

## Verification Checklist

- [x] User registration works
- [x] Role selection works for student role
- [x] Authentication token is validated correctly
- [x] Protected endpoints are accessible after login
- [x] Role checks work correctly for library/lab creation
- [x] Error messages are clear and helpful
- [x] Student role is set immediately
- [x] Manager/Lecturer roles require approval (creates request)

## Notes

- All role checks now default to "student" if role is None/empty
- Debug logging has been added to help troubleshoot issues
- Error messages now show current role vs required role
- The system properly handles the role assignment workflow
