# Campus Navigator - Setup Guide

This guide will help you and your teammates set up the project locally and test it online.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- Git installed

## Quick Setup

### 1. Clone the Repository

```bash
git clone <your-github-repo-url>
cd project_ysodot123
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (optional, for admin access)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The backend will run on `http://127.0.0.1:8000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to project root
cd project_ysodot123

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Testing the Application

### 1. Create Test Users

You can use the management command to create test users:

```bash
cd backend
python manage.py create_test_users
```

This creates:
- Admin user: `admin@test.com` / `admin123`
- Manager user: `manager@test.com` / `manager123`
- Lecturer user: `lecturer@test.com` / `lecturer123`
- Student user: `student@test.com` / `student123`

### 2. Test Adding a Library (Example)

1. **Login as Manager or Admin**
   - Go to `http://localhost:5173`
   - Login with manager credentials
   - Navigate to "Library Status" page

2. **Add a New Library**
   - Click "Add Library" button
   - Fill in the form:
     - Name: "Science Library"
     - Max Capacity: 150
     - Current Occupancy: 0
     - Check "Open"
   - Click "Add Library"

3. **Verify the Library Appears**
   - The new library should appear in the list
   - You can filter by status
   - You can edit the library name and properties

### 3. Test Room Request Flow

1. **As a Lecturer:**
   - Login as lecturer
   - Go to "Room Requests" page
   - Click "New Request"
   - Fill in the form and submit

2. **As a Manager:**
   - Login as manager
   - Go to "Room Approvals" page
   - See pending requests
   - Select a room and approve
   - Verify the room becomes unavailable

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can register a new user
- [ ] Can login with test credentials
- [ ] Can view library status
- [ ] Manager can add a new library
- [ ] Manager can edit library name
- [ ] Can view labs list
- [ ] Manager can add a new lab
- [ ] Can view classrooms list
- [ ] Manager can add a new classroom
- [ ] Filters work on all pages (search, building, status)
- [ ] Lecturer can create room request
- [ ] Manager can approve room request
- [ ] Approved room becomes unavailable
- [ ] Student can update library/lab (creates pending request)
- [ ] Manager can approve/reject student updates

## Common Issues

### Backend won't start
- Make sure virtual environment is activated
- Check if port 8000 is already in use
- Run `python manage.py migrate` if you see migration errors

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is already in use

### CORS errors
- Make sure backend is running on port 8000
- Check `backend/campus_infra/settings.py` has CORS configured

### Database errors
- Run `python manage.py migrate` to apply migrations
- If issues persist, delete `db.sqlite3` and run migrations again

## Project Structure

```
project_ysodot123/
├── backend/              # Django backend
│   ├── accounts/         # User accounts and room management
│   ├── campus_infra/     # Django settings
│   └── manage.py
├── src/                  # React frontend
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   └── state/           # State management
├── package.json         # Frontend dependencies
└── requirements.txt     # Backend dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Libraries
- `GET /api/libraries/list` - List all libraries
- `POST /api/library/create` - Create library (manager/admin)
- `POST /api/library/update` - Update library

### Labs
- `GET /api/labs/list` - List all labs
- `POST /api/labs/create` - Create lab (manager/admin)
- `POST /api/labs/<id>/update` - Update lab

### Classrooms
- `GET /api/classrooms/list` - List all classrooms
- `POST /api/classrooms/create` - Create classroom (manager/admin)
- `POST /api/classrooms/<id>/update` - Update classroom

### Room Requests
- `POST /api/room-requests/create` - Create request (lecturer)
- `GET /api/room-requests/list` - List requests
- `POST /api/room-requests/<id>/approve` - Approve request (manager)
- `POST /api/room-requests/<id>/reject` - Reject request (manager)

## Next Steps for Online Testing

1. **Deploy Backend** (e.g., Heroku, Railway, Render)
2. **Deploy Frontend** (e.g., Vercel, Netlify)
3. **Update API_BASE** in frontend to point to deployed backend
4. **Test with teammates** using the deployed URLs

## Support

If you encounter issues, check:
- Browser console for frontend errors
- Terminal for backend errors
- Network tab for API errors
