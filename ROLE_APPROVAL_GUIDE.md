# Role Approval Guide

## How the Approval System Works

### For Users (Students, Lecturers, Managers)

1. **Registration**: When you register, you start as a "student" by default.

2. **Role Selection**:
   - **Student**: Can be set immediately - no approval needed
   - **Lecturer**: Requires admin approval - creates a pending request
   - **Manager**: Requires admin approval - creates a pending request

3. **After Requesting Lecturer/Manager Role**:
   - Your role request is submitted
   - You remain as "student" until approved
   - You can still use the system as a student
   - You'll see a message: "Your role request is pending admin approval"

4. **After Approval**:
   - An admin approves your request
   - Your role is automatically updated
   - You can now access lecturer/manager features
   - You may need to log out and log back in to see the changes

### For Admins

1. **Viewing Role Requests**:
   - Log in as admin (`admin@campus.edu` / `admin123`)
   - Go to "User Management" page
   - Click on "Role Requests" tab
   - You'll see all pending, approved, and rejected requests

2. **Approving a Request**:
   - Find the pending request
   - Click "Approve" button
   - The user's role will be updated immediately
   - The request status changes to "approved"

3. **Rejecting a Request**:
   - Find the pending request
   - Click "Reject" button
   - Optionally provide a rejection reason
   - The request status changes to "rejected"
   - The user remains as "student"

## Step-by-Step: Testing the Approval Flow

### Test 1: Register as Manager

1. Go to http://localhost:5173/register
2. Register with email: `manager@test.com`, password: `test123456`
3. Select "Manager" role
4. Choose manager type (e.g., "Librarian")
5. Provide reason (optional)
6. Submit
7. ✅ You should see: "Your role request is pending admin approval"
8. ✅ You're redirected to dashboard as "student"

### Test 2: Admin Approves Manager Request

1. Log out (if logged in as the manager)
2. Log in as admin: `admin@campus.edu` / `admin123`
3. Go to "User Management" page
4. Click "Role Requests" tab
5. You should see the pending request from `manager@test.com`
6. Click "Approve" button
7. ✅ Request status changes to "approved"
8. ✅ User's role is now "manager"

### Test 3: Manager Can Now Add Libraries

1. Log out as admin
2. Log in as `manager@test.com` / `test123456`
3. Go to "Library Status" page
4. Click "Add Library" button
5. ✅ You should be able to add libraries now!

### Test 4: Register as Lecturer

1. Register with email: `lecturer@test.com`, password: `test123456`
2. Select "Lecturer" role
3. Provide reason (optional)
4. Submit
5. ✅ Request is created, user remains as "student"

### Test 5: Admin Approves Lecturer Request

1. Log in as admin
2. Go to User Management → Role Requests
3. Find the lecturer request
4. Click "Approve"
5. ✅ Lecturer can now access lecturer features (room requests, etc.)

## Important Notes

- **Manager Type**: When requesting manager role, you must select a manager type (Librarian, IT Manager, etc.). This is saved and shown to the admin.
- **Pending Status**: While your request is pending, you can still use the system as a student.
- **Role Updates**: After approval, you may need to refresh the page or log out/in to see your new role reflected in the UI.
- **Multiple Requests**: If you request a role change multiple times, each request is tracked separately.

## Troubleshooting

### Issue: Can't see role requests as admin
- Make sure you're logged in as admin
- Check that the user actually submitted a role request
- Refresh the page

### Issue: Approval doesn't update user role
- Check backend terminal for errors
- Verify the user exists in the database
- Try refreshing the admin page

### Issue: Manager can't add libraries after approval
- Make sure the role was actually updated (check User Management → All Users)
- Try logging out and logging back in
- Check browser console for errors

## Database Check

To verify role requests in the database:

```bash
cd backend
python manage.py shell
```

```python
from accounts.models import RoleRequest, Profile
from django.contrib.auth.models import User

# View all pending requests
pending = RoleRequest.objects.filter(status='pending')
for req in pending:
    print(f"{req.user.email} - {req.requested_role} - {req.status}")

# Check user's current role
user = User.objects.get(email='manager@test.com')
profile = Profile.objects.get(user=user)
print(f"Current role: {profile.role}")
print(f"Manager type: {profile.manager_type}")
```
