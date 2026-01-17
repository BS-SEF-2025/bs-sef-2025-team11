# Campus Navigator

A comprehensive campus management system for tracking library, lab, and classroom availability with room request functionality.

## Features

- **Library Management**: Track library occupancy and status
- **Lab Management**: View and manage computer labs
- **Classroom Management**: Track classroom availability
- **Room Requests**: Lecturers can request rooms, managers approve them
- **Update Approvals**: Students can update room status, managers approve changes
- **Real-time Filters**: Filter by building, status, and search
- **Role-based Access**: Different features for students, lecturers, managers, and admins

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Django 6.0, Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: JWT tokens

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### One-Click Start (Recommended)
1. Double-click the `start_app.bat` file in the main folder.
2. It will open two server windows (do not close them!).
3. It will automatically open your browser to the correct page.

### Manual Start
If you prefer to run commands manually:

1. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Setup Frontend** (in a new terminal)
   ```bash
   npm install
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:8000

## Default Test Users

Create test users with:
```bash
cd backend
python manage.py create_test_users
```

This creates:
- Admin: `admin@test.com` / `admin123`
- Manager: `manager@test.com` / `manager123`
- Lecturer: `lecturer@test.com` / `lecturer123`
- Student: `student@test.com` / `student123`

## Testing Online with Team

### Step 1: Deploy Backend

1. Choose a hosting service (Heroku, Railway, Render, etc.)
2. Push backend code to the service
3. Run migrations on the deployed server
4. Note the backend URL (e.g., `https://your-app.herokuapp.com`)

### Step 2: Deploy Frontend

1. Choose a hosting service (Vercel, Netlify, etc.)
2. Update `src/state/AuthContext.jsx` to use the deployed backend URL
3. Deploy the frontend
4. Share the frontend URL with your team

### Step 3: Test Together

1. **Create a test library** (as manager):
   - Login as manager
   - Go to Library Status
   - Click "Add Library"
   - Add "Science Library" with capacity 150
   - Verify it appears for all users

2. **Test real-time updates**:
   - User A updates library occupancy
   - User B refreshes and sees the update
   - Verify filters work correctly

3. **Test room requests**:
   - Lecturer creates a room request
   - Manager sees it in Room Approvals
   - Manager approves and assigns room
   - Verify room becomes unavailable

## Project Structure

```
project_ysodot123/
├── backend/                 # Django backend
│   ├── accounts/           # Main app (users, rooms, requests)
│   ├── campus_infra/       # Django settings
│   ├── manage.py
│   └── requirements.txt
├── src/                     # React frontend
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── state/             # State management
│   └── main.jsx           # Entry point
├── package.json           # Frontend dependencies
└── README.md
```

## Key Features by Role

### Students
- View library, lab, and classroom status
- Update occupancy (requires manager approval)
- Report faults
- Filter and search rooms

### Lecturers
- All student features
- Request classrooms/labs for teaching
- View request status

### Managers
- All lecturer features
- Approve/reject room requests
- Approve/reject status updates
- Add/edit libraries, labs, classrooms
- View all requests and updates

### Admins
- All manager features
- User management
- Role request approvals

## API Documentation

See `SETUP_GUIDE.md` for detailed API endpoint documentation.

## Development

### Running in Development

```bash
# Backend (Terminal 1)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver

# Frontend (Terminal 2)
npm run dev
```

### Making Changes

1. Create a new branch: `git checkout -b feature-name`
2. Make your changes
3. Test locally
4. Commit and push: `git push origin feature-name`
5. Create a pull request

## Troubleshooting

### Backend Issues
- **Migration errors**: Run `python manage.py migrate`
- **Port in use**: Change port with `python manage.py runserver 8001`
- **Module not found**: Activate virtual environment and install requirements

### Frontend Issues
- **Build errors**: Delete `node_modules` and run `npm install`
- **CORS errors**: Ensure backend is running and CORS is configured
- **API errors**: Check backend URL in `AuthContext.jsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_START.md** - Quick start guide
- **DEPLOYMENT_GUIDE.md** - How to deploy online for team testing
- **GITHUB_SETUP.md** - How to share code on GitHub
- **TESTING_CHECKLIST.md** - Comprehensive testing checklist
- **USER_GUIDE.md** - User documentation

## Quick Test: Add Library Example

After setup, test by adding a library:

1. Login as manager: `manager@campus.edu` / `manager123`
2. Go to "Library Status" page
3. Click "Add Library"
4. Fill in:
   - Name: "Science Library"
   - Max Capacity: 150
   - Current Occupancy: 0
   - Check "Open"
5. Click "Add Library"
6. Verify it appears in the list
7. Test filters and search

## Support

For issues or questions, check the documentation files above.
