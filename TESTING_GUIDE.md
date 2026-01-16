# Campus Navigator - Testing Guide

## ✅ System Setup Complete

### Admin User Created
- **Email**: admin@campus.edu
- **Password**: admin123
- **Role**: Admin

## 🧪 End-to-End Testing Flow

### 1. Login as Admin
1. Go to http://localhost:5173/login
2. Login with: `admin@campus.edu` / `admin123`
3. Select role: Student (will be overridden by admin role)
4. Should redirect to Dashboard

### 2. Create Test Users
**Student User:**
- Email: student@campus.edu
- Password: student123
- Role: Student (immediate)

**Manager Request User:**
- Email: manager@campus.edu  
- Password: manager123
- Role: Manager (needs approval)

### 3. Test Student Fault Report
1. Login as student@campus.edu
2. Go to "Report Fault" page
3. Fill out form:
   - Location: Classroom, Science Building, Room 301
   - Category: Computer / Hardware
   - Title: "Projector not working"
   - Description: "The projector in room 301 is not displaying"
   - Severity: High
4. Submit report
5. ✅ Report should be saved to database

### 4. Test Manager View Faults
1. Login as admin@campus.edu
2. Go to "Fault Management" page
3. ✅ Should see all fault reports including student's report
4. Click on a fault to view details
5. Update status to "In Progress"
6. Add resolution notes
7. ✅ Changes should be saved

### 5. Test Library Status (Live)
1. Login as any user
2. Go to "Library Status" page
3. ✅ Should see current occupancy (starts at 0/100)
4. As manager/admin, update status:
   - Click "Moderate" button
   - ✅ Should update to ~50/100
5. Refresh page
6. ✅ Status should persist

### 6. Test Lab Status (Live)
1. Go to "Find Labs" page
2. ✅ Should see list of labs (empty initially)
3. As manager/admin, create a lab:
   - Use API: POST /api/labs/create
   - Or create via Django admin
4. ✅ Labs should appear with live status
5. Update lab occupancy
6. ✅ Status should update in real-time

### 7. Test Role Approval System
1. Login as manager@campus.edu (or create new user)
2. Select "Manager" role
3. ✅ Should show message: "Request submitted, waiting for approval"
4. Login as admin@campus.edu
5. Go to "User Management" page
6. ✅ Should see pending role request
7. Click "Approve" button
8. ✅ Request should move to "Approved" tab
9. Logout and login as manager@campus.edu again
10. ✅ User should now have manager role

### 8. Test Dashboard Live Data
1. Login as any user
2. Go to Dashboard
3. ✅ Should see:
   - Library occupancy percentage
   - Available labs count
   - Open faults (if manager/admin)
4. Data should auto-refresh every 30 seconds

## 📊 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/set-role` - Set/request role

### Fault Reports
- POST `/api/faults/create` - Create fault report (students)
- GET `/api/faults/list` - List faults (students see own, managers see all)
- PUT `/api/faults/{id}/update` - Update fault (managers only)

### Library Status
- GET `/api/library/status` - Get library status
- POST `/api/library/update` - Update library status (managers only)

### Lab Status
- GET `/api/labs/list` - List all labs
- POST `/api/labs/create` - Create lab (managers only)
- PUT `/api/labs/{id}/update` - Update lab status (managers only)

### Role Requests
- GET `/api/role-requests/list` - List role requests
- POST `/api/role-requests/{id}/approve` - Approve request (admin only)
- POST `/api/role-requests/{id}/reject` - Reject request (admin only)

### Admin
- GET `/api/admin/dashboard` - Admin dashboard stats
- GET `/api/admin/activities` - Manager activities log

## ✅ Features Verified

- [x] Student can create fault reports
- [x] Reports saved to database
- [x] Managers can see all student reports
- [x] Library status is live and updatable
- [x] Lab status is live and updatable
- [x] Dashboard shows live data
- [x] Role approval system works
- [x] Admin can approve/reject role requests
- [x] Manager activities are logged
- [x] Multi-manager support (Library manager, IT manager, etc.)

## 🚀 Quick Start Commands

```bash
# Create admin user
cd backend
python manage.py create_admin --email admin@campus.edu --password admin123

# Run migrations
python manage.py migrate

# Start backend
python manage.py runserver

# Start frontend (in another terminal)
npm run dev
```

## 📝 Notes

- All data is stored in SQLite database (`backend/db.sqlite3`)
- Frontend auto-refreshes every 30 seconds for live data
- Role requests require admin approval for lecturer/manager roles
- Students get immediate role assignment
- Manager activities are automatically logged for admin review
