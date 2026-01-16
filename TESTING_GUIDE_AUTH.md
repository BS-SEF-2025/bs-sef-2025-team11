# Testing Guide: Authentication and Role Selection

## Quick Test Steps

### 1. Start Backend Server
```bash
cd backend
python manage.py runserver
```

### 2. Start Frontend Server
```bash
npm run dev
```

### 3. Test Registration and Role Selection

#### Test Student Role:
1. Go to http://localhost:5173/register
2. Register with email: `student@test.com`, password: `test123456`
3. After registration, you should be redirected to `/role-selection`
4. Click "Select Student"
5. Should redirect to dashboard with student role

#### Test Lecturer Role:
1. Register with email: `lecturer@test.com`, password: `test123456`
2. Select "Lecturer" role
3. Should show message: "Role request submitted for approval"
4. User remains as "student" until admin approves
5. Can still use system as student

#### Test Manager Role:
1. Register with email: `manager@test.com`, password: `test123456`
2. Select "Manager" role
3. Choose manager type (e.g., "Librarian")
4. Provide reason (optional)
5. Submit
6. Should show message: "Role request submitted for approval"
7. User remains as "student" until admin approves

### 4. Test Adding Library (Requires Manager/Admin Role)

#### As Admin:
1. Login as admin: `admin@campus.edu` / `admin123`
2. Go to Library Status page
3. Click "Add Library"
4. Fill in details and submit
5. Should successfully create library

#### As Manager (After Approval):
1. Login as admin
2. Go to User Management → Role Requests
3. Approve the manager role request
4. Logout
5. Login as the manager user
6. Go to Library Status page
7. Click "Add Library"
8. Should successfully create library

#### As Pending Manager (Before Approval):
1. Register and request manager role
2. Try to add library
3. Should show error: "Only managers and admins can add libraries"
4. This is expected - role needs admin approval first

## Running Automated Tests

### Option 1: Python Test Script
```bash
# Make sure backend is running first
python test_auth_flow.py
```

### Option 2: Manual Browser Testing
1. Open browser DevTools (F12)
2. Go to Console tab
3. Register a new account
4. Watch for console logs:
   - `=== REGISTER ATTEMPT ===`
   - `Token stored after registration`
   - `🔑 AuthProvider: Starting to load user...`
5. Check for any errors

## Common Issues and Fixes

### Issue: "Your session has expired"
**Cause**: Token not being stored or validated correctly
**Check**:
- Browser console for token storage logs
- Backend terminal for DEBUG messages
- localStorage in DevTools → Application → Local Storage

### Issue: Can't add library as manager
**Cause**: Manager role not approved yet
**Fix**: Admin needs to approve role request first

### Issue: Role selection shows "Unauthorized"
**Cause**: Token lost or user not loaded
**Check**:
- Is token in localStorage?
- Are there any network errors?
- Is backend server running?

## Debugging

### Frontend Debugging:
1. Open DevTools (F12)
2. Check Console for logs
3. Check Application → Local Storage → `token`
4. Check Network tab for API calls

### Backend Debugging:
1. Check terminal where Django is running
2. Look for DEBUG messages:
   - `DEBUG: /api/auth/me called`
   - `DEBUG: Decoding token`
   - `DEBUG: Successfully authenticated user`

## Expected Behavior

### Registration Flow:
1. User registers → Token stored → User state set
2. Navigate to role-selection → User should be loaded
3. Select role → Role request created (for lecturer/manager)
4. Navigate to dashboard → User can use system

### Role Approval Flow:
1. User requests manager/lecturer role
2. Admin sees request in User Management
3. Admin approves request
4. User's role is updated
5. User can now access manager/lecturer features
