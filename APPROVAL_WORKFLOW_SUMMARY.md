# Role Approval Workflow Summary

## ✅ How It Works

### 1. User Registration & Role Selection

**Student Role:**
- ✅ Set immediately - no approval needed
- ✅ User can use system right away

**Lecturer Role:**
- ⏳ Creates a pending role request
- ⏳ User remains as "student" until approved
- ⏳ User can still use system as student
- ✅ Admin must approve to grant lecturer access

**Manager Role:**
- ⏳ Creates a pending role request
- ⏳ User must select manager type (Librarian, IT, Facilities, etc.)
- ⏳ Manager type is saved to user's profile
- ⏳ User remains as "student" until approved
- ⏳ User can still use system as student
- ✅ Admin must approve to grant manager access

### 2. Admin Approval Process

**Viewing Requests:**
1. Admin logs in (`admin@campus.edu` / `admin123`)
2. Goes to "User Management" page
3. Clicks "Role Requests" tab
4. Sees all pending requests with:
   - User email
   - Requested role
   - Manager type (if manager)
   - Reason (if provided)
   - Request date

**Approving a Request:**
1. Admin clicks "Approve" button
2. Backend updates user's role in database
3. Request status changes to "approved"
4. User can now access role-specific features
5. User may need to log out/in to see changes

**Rejecting a Request:**
1. Admin clicks "Reject" button
2. Optionally provides rejection reason
3. Request status changes to "rejected"
4. User remains as "student"

### 3. After Approval

**For Lecturer:**
- ✅ Can create room requests
- ✅ Can request classrooms/labs
- ✅ Can view their own requests

**For Manager:**
- ✅ Can add/edit libraries
- ✅ Can add/edit labs
- ✅ Can add/edit classrooms
- ✅ Can approve update requests
- ✅ Can approve room requests
- ✅ Can manage fault reports
- ✅ Manager type is preserved

## 🔧 Technical Details

### Backend Flow:

1. **Role Request Creation** (`set_role` endpoint):
   ```python
   if role in ["lecturer", "manager"]:
       RoleRequest.objects.create(...)  # Creates pending request
       # User role stays as "student"
   ```

2. **Role Approval** (`admin_approve_role` endpoint):
   ```python
   user_prof.role = req.requested_role  # Updates role
   user_prof.save()  # Saves to database
   req.status = "approved"  # Updates request status
   ```

3. **Manager Type Handling**:
   - Saved to Profile when role request is created
   - Preserved when role is approved
   - Displayed in admin UI

### Frontend Flow:

1. **Role Selection**:
   - User selects role
   - If manager/lecturer → shows "pending approval" message
   - User redirected to dashboard as "student"

2. **Admin View**:
   - Shows all role requests
   - Pending requests have Approve/Reject buttons
   - Shows manager type for manager requests

3. **After Approval**:
   - User's role is updated in database
   - User may need to refresh or log out/in
   - User can now access role-specific features

## 📋 Testing Checklist

- [ ] Register as student → Should work immediately
- [ ] Register as lecturer → Should create pending request
- [ ] Register as manager → Should create pending request with manager type
- [ ] Admin can see pending requests
- [ ] Admin can approve requests
- [ ] Admin can reject requests
- [ ] After approval, user role is updated
- [ ] Manager can add libraries after approval
- [ ] Lecturer can create room requests after approval
- [ ] Manager type is preserved after approval

## 🐛 Common Issues

**Issue**: Manager can't add libraries after approval
- **Fix**: Make sure role was actually updated (check User Management → All Users)
- **Fix**: User may need to log out and log back in

**Issue**: Manager type not showing in admin UI
- **Fix**: Make sure manager type was selected during role request
- **Fix**: Check that manager_type is saved in Profile model

**Issue**: Approval doesn't update role
- **Fix**: Check backend terminal for errors
- **Fix**: Verify user exists in database
- **Fix**: Check that RoleRequest status is "pending" before approval
