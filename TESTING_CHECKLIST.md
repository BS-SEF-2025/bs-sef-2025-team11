# Testing Checklist for Online Collaboration

Use this checklist to verify everything works when testing with your team online.

## Pre-Deployment Checklist

- [ ] `.gitignore` is properly configured (excludes `node_modules`, `venv`, `db.sqlite3`)
- [ ] `requirements.txt` exists with all Python dependencies
- [ ] `package.json` has all frontend dependencies
- [ ] No sensitive data (passwords, API keys) in code
- [ ] Database migrations are up to date
- [ ] README.md has setup instructions

## Backend Testing

### Basic Functionality
- [ ] Backend server starts successfully
- [ ] All migrations applied without errors
- [ ] API endpoints respond correctly
- [ ] CORS is configured properly
- [ ] JWT authentication works

### API Endpoints
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login
- [ ] `GET /api/auth/me` - Get current user
- [ ] `GET /api/libraries/list` - List libraries
- [ ] `POST /api/library/create` - Create library (manager only)
- [ ] `POST /api/library/update` - Update library
- [ ] `GET /api/labs/list` - List labs
- [ ] `POST /api/labs/create` - Create lab (manager only)
- [ ] `GET /api/classrooms/list` - List classrooms
- [ ] `POST /api/classrooms/create` - Create classroom (manager only)
- [ ] `POST /api/room-requests/create` - Create room request (lecturer only)
- [ ] `GET /api/room-requests/list` - List room requests
- [ ] `POST /api/room-requests/<id>/approve` - Approve request (manager only)
- [ ] `POST /api/room-requests/<id>/reject` - Reject request (manager only)

## Frontend Testing

### Authentication
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can logout
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login

### Library Management
- [ ] View library status page
- [ ] See list of libraries
- [ ] Manager can add new library
- [ ] Manager can edit library name
- [ ] Manager can update library properties
- [ ] Student can update occupancy (creates pending request)
- [ ] Filters work (search, status)
- [ ] Statistics show correctly

### Lab Management
- [ ] View labs list
- [ ] Manager can add new lab
- [ ] Manager can update lab availability
- [ ] Filters work (search, building, status)
- [ ] Statistics show correctly

### Classroom Management
- [ ] View classrooms list
- [ ] Manager can add new classroom
- [ ] Manager can update classroom availability
- [ ] Filters work (search, building, status)
- [ ] Statistics show correctly

### Room Requests (Lecturer)
- [ ] Can create room request
- [ ] Can select room type (classroom/lab)
- [ ] Can optionally select preferred room
- [ ] Can view all own requests
- [ ] Can see request status (pending/approved/rejected)
- [ ] Can see assigned room when approved

### Room Approvals (Manager)
- [ ] Can view all pending requests
- [ ] Can see request details
- [ ] Can select room to assign
- [ ] Can approve request
- [ ] Can reject request with reason
- [ ] Approved room becomes unavailable
- [ ] Statistics show correctly

### Update Approvals (Manager)
- [ ] Can view pending library updates
- [ ] Can view pending lab updates
- [ ] Can approve updates
- [ ] Can reject updates with reason
- [ ] Approved updates apply to rooms

## Online Testing Scenarios

### Scenario 1: Add Library (Team Test)
1. [ ] Manager A logs in
2. [ ] Manager A adds "Science Library"
3. [ ] Manager B logs in and sees the new library
4. [ ] Student logs in and sees the new library
5. [ ] All users can filter and search for it

### Scenario 2: Real-time Updates
1. [ ] User A updates library occupancy to 50
2. [ ] User B refreshes page and sees updated occupancy
3. [ ] Filters still work correctly
4. [ ] Statistics update correctly

### Scenario 3: Room Request Flow
1. [ ] Lecturer creates room request for tomorrow
2. [ ] Manager sees request in Room Approvals
3. [ ] Manager selects available room and approves
4. [ ] Room becomes unavailable
5. [ ] Lecturer sees approved status and assigned room
6. [ ] Other users see room as unavailable

### Scenario 4: Student Update Approval
1. [ ] Student updates lab occupancy
2. [ ] Student sees "pending approval" message
3. [ ] Manager sees update in Pending Updates
4. [ ] Manager approves the update
5. [ ] Lab occupancy updates for all users

## Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

## Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Filters respond quickly
- [ ] No console errors
- [ ] No network errors

## Security Testing

- [ ] Cannot access manager endpoints as student
- [ ] Cannot create room requests as student
- [ ] JWT tokens work correctly
- [ ] CORS configured properly
- [ ] No sensitive data exposed

## Data Persistence

- [ ] Created libraries persist after refresh
- [ ] Created labs persist after refresh
- [ ] Created classrooms persist after refresh
- [ ] Room requests persist after refresh
- [ ] Approvals persist after refresh

## Mobile Responsiveness

- [ ] Works on mobile devices
- [ ] Filters accessible on mobile
- [ ] Forms usable on mobile
- [ ] Cards display correctly

## Final Verification

- [ ] All team members can access the deployed site
- [ ] All team members can login
- [ ] Data updates are visible to all users
- [ ] No critical errors in console
- [ ] All features work as expected

## Notes for Team Testing

1. **Coordinate Testing**: Have one person add a library, others verify they see it
2. **Test Simultaneously**: Have multiple users online at once
3. **Check Real-time Updates**: Update data and verify others see changes
4. **Test Edge Cases**: Try invalid inputs, empty states, etc.
5. **Document Issues**: Keep track of any bugs found

## Common Issues to Watch For

- **CORS errors**: Backend CORS settings
- **404 errors**: API endpoint URLs
- **Authentication errors**: JWT token handling
- **Database errors**: Migration issues
- **Filter not working**: Check filter logic
- **Room not becoming unavailable**: Check approval endpoint
