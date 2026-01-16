# Campus Infrastructure Management System - User Guide

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [How to Join/Register](#how-to-joinregister)
3. [How to Log In](#how-to-log-in)
4. [Accessing as Admin](#accessing-as-admin)
5. [Accessing as Librarian/Manager](#accessing-as-librarianmanager)
6. [Test User Credentials](#test-user-credentials)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

### Initial Setup

1. **Navigate to the project directory:**
   ```bash
   cd "C:\Users\Mohamd badhe\Desktop\project_ysodot123"
   ```

2. **Set up the backend (Django):**
   ```bash
   cd backend
   # Activate virtual environment (if it exists)
   venv\Scripts\activate  # On Windows
   
   # Install Django and dependencies (if not already installed)
   pip install django djangorestframework django-cors-headers PyJWT
   
   # Run migrations
   python manage.py migrate
   
   # Create test users
   python manage.py create_test_users
   ```

3. **Set up the frontend (React):**
   ```bash
   cd ..  # Go back to project root
   npm install
   ```

4. **Start the servers:**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```
   The backend will run on `http://127.0.0.1:8000`

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or the port shown in terminal)

---

## 👤 How to Join/Register

### Step 1: Open the Application
1. Open your web browser
2. Navigate to `http://localhost:5173` (or the port shown when you run `npm run dev`)
3. You will see the **Login** page

### Step 2: Go to Registration
1. Click on the **"Sign Up"** or **"Don't have an account? Register"** link at the bottom of the login page
2. You will be redirected to the **Register** page

### Step 3: Fill in Registration Form
1. **Email:** Enter your email address (e.g., `yourname@campus.edu`)
2. **Password:** Create a strong password
3. **Confirm Password:** Re-enter your password to confirm
4. Click the **"Register"** button

### Step 4: Select Your Role
After successful registration, you will be redirected to the **Role Selection** page:

- **Student:** For regular students
- **Lecturer:** For teachers/lecturers
- **Manager:** For librarians, IT managers, facilities managers, etc.
  - If you select Manager, you'll need to:
    - Choose a manager type (Librarian, IT, Facilities, etc.)
    - Provide a reason for your request
    - Wait for admin approval (you can use the system as a student in the meantime)

**Note:** Admin role cannot be selected during registration. Admin accounts must be created by existing admins or through the management command.

### Step 5: Access Your Dashboard
Once you've selected your role (or if it's pending approval), you'll be redirected to your **Dashboard** where you can:
- View library status
- Check lab availability
- View classrooms (students only)
- Make fault reports
- And more based on your role

---

## 🔐 How to Log In

### For Regular Users (Students, Lecturers, Managers)

1. **Open the Application**
   - Navigate to `http://localhost:5173` in your browser

2. **Enter Your Credentials**
   - **Email:** Enter the email you used during registration
   - **Password:** Enter your password

3. **Click "Log In"**
   - You will be redirected to your dashboard based on your role

4. **If You Forgot Your Password**
   - Currently, password reset functionality is not implemented
   - Contact an administrator for password reset

---

## 👨‍💼 Accessing as Admin

### Method 1: Using Test Admin Account

1. **Log In with Test Credentials:**
   - **Email:** `admin@campus.edu`
   - **Password:** `admin123`

2. **Direct Access:**
   - Admin users are automatically redirected to the dashboard
   - No role selection is required for admins

3. **Admin Features:**
   - View all users in the system
   - Approve/reject role requests (lecturer, manager)
   - Manage all fault reports
   - Access all system features

### Method 2: Create a New Admin Account

**Using Django Management Command:**
```bash
cd backend
python manage.py shell
```

Then in the Python shell:
```python
from django.contrib.auth.models import User
from accounts.models import Profile

# Create admin user
user = User.objects.create_user(
    username='newadmin@campus.edu',
    email='newadmin@campus.edu',
    password='your_password_here'
)
user.is_staff = True
user.is_superuser = True
user.save()

# Create profile with admin role
profile = Profile.objects.create(user=user, role='admin')
print("Admin user created successfully!")
```

**Or using Django Admin Panel:**
1. Log in to Django admin: `http://127.0.0.1:8000/admin`
2. Go to "Users" section
3. Create a new user
4. Set `is_staff` and `is_superuser` to True
5. Create a Profile for the user with role='admin'

---

## 📚 Accessing as Librarian/Manager

### Method 1: Using Test Manager Account

1. **Log In with Test Credentials:**
   - **Email:** `manager@campus.edu`
   - **Password:** `manager123`

2. **If Role is Pending:**
   - If your manager role is pending approval, you can still use the system as a student
   - Once approved by an admin, your role will be updated automatically

### Method 2: Register and Request Manager Role

1. **Register a New Account** (see [How to Join/Register](#how-to-joinregister))

2. **Select "Manager" Role:**
   - Choose your manager type (Librarian, IT, Facilities, etc.)
   - Provide a reason for your request
   - Submit the request

3. **Wait for Admin Approval:**
   - An admin will review your request
   - You'll receive notification when approved/rejected
   - Check the "Role Requests" section in User Management (admin only)

4. **Access Manager Features:**
   - Once approved, you can:
     - Update library status
     - Update lab and classroom occupancy
     - Manage fault reports
     - Change report statuses
     - Assign technicians to reports

### Manager Types Available:
- **Librarian:** Manages library resources and status
- **IT Manager:** Handles IT-related issues
- **Facilities Manager:** Manages building and facilities
- **Other:** Custom manager type

---

## 🧪 Test User Credentials

For testing purposes, the following test users are available:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@campus.edu` | `admin123` | Full system access |
| **Student** | `student@campus.edu` | `student123` | Regular student access |
| **Lecturer** | `lecturer@campus.edu` | `lecturer123` | Teacher access |
| **Manager** | `manager@campus.edu` | `manager123` | Manager/Librarian access |

### To Create Test Users:

Run this command in the backend directory:
```bash
cd backend
python manage.py create_test_users
```

This will create all test users with the credentials listed above.

---

## 🔧 Troubleshooting

### Problem: Cannot connect to the server

**Solution:**
1. Make sure the backend server is running (`python manage.py runserver`)
2. Make sure the frontend server is running (`npm run dev`)
3. Check that both servers are running on the correct ports
4. Clear your browser cache and try again

### Problem: Login not working

**Solutions:**
1. Verify you're using the correct email and password
2. Check browser console for error messages
3. Ensure the backend server is running
4. Try using test credentials to verify the system is working
5. Check that CORS is properly configured in backend settings

### Problem: Role selection not working

**Solutions:**
1. Make sure you've completed registration successfully
2. Check that your role request was submitted
3. For manager/lecturer roles, wait for admin approval
4. Contact an admin if your role request is stuck

### Problem: Cannot see certain pages/features

**Solutions:**
1. Verify your role has permission for that feature:
   - **Students:** Can view library, labs, classrooms, and make reports
   - **Lecturers:** Same as students, plus can view all reports
   - **Managers:** Can update statuses and manage reports
   - **Admins:** Full access to everything
2. Make sure you're logged in with the correct account
3. Try logging out and logging back in

### Problem: Database errors

**Solutions:**
1. Run migrations: `python manage.py migrate`
2. Create test users: `python manage.py create_test_users`
3. Check that the database file exists: `backend/db.sqlite3`
4. If issues persist, delete `db.sqlite3` and run migrations again (⚠️ This will delete all data)

### Problem: Frontend not loading

**Solutions:**
1. Make sure `npm install` was run successfully
2. Check that `npm run dev` is running without errors
3. Verify Node.js version is 16 or higher
4. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📞 Support

If you encounter any issues not covered in this guide:

1. Check the browser console for error messages (F12 → Console tab)
2. Check the terminal where the servers are running for backend errors
3. Verify all prerequisites are installed correctly
4. Ensure both frontend and backend servers are running

---

## 🎯 Quick Reference

### Starting the Application:
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
npm run dev
```

### Access URLs:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://127.0.0.1:8000`
- **Django Admin:** `http://127.0.0.1:8000/admin`

### Default Admin Login:
- **Email:** `admin@campus.edu`
- **Password:** `admin123`

---

**Last Updated:** 2024
**Version:** 1.0
