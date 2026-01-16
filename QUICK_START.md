# 🚀 Quick Start Guide

## For First-Time Users

### 1. Start the Application

**Open two terminal windows:**

**Terminal 1 - Start Backend:**
```bash
cd "C:\Users\Mohamd badhe\Desktop\project_ysodot123\backend"
python manage.py runserver
```
✅ Backend running on `http://127.0.0.1:8000`

**Terminal 2 - Start Frontend:**
```bash
cd "C:\Users\Mohamd badhe\Desktop\project_ysodot123"
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

### 2. Access the Application

Open your browser and go to: **http://localhost:5173**

---

### 3. Log In as Admin

**Use these credentials:**
- **Email:** `admin@campus.edu`
- **Password:** `admin123`

Click **"Log In"** → You'll be taken directly to the Admin Dashboard

---

### 4. Log In as Librarian/Manager

**Use these credentials:**
- **Email:** `manager@campus.edu`
- **Password:** `manager123`

Click **"Log In"** → You'll see the Manager Dashboard

---

### 5. Register a New Account

1. Click **"Sign Up"** or **"Don't have an account? Register"**
2. Enter your email and password
3. Click **"Register"**
4. Select your role:
   - **Student** - Immediate access
   - **Lecturer** - Requires admin approval
   - **Manager** - Requires admin approval (select manager type and reason)

---

## 📋 All Test User Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@campus.edu` | `admin123` |
| Student | `student@campus.edu` | `student123` |
| Lecturer | `lecturer@campus.edu` | `lecturer123` |
| Manager | `manager@campus.edu` | `manager123` |

---

## ⚠️ Troubleshooting

**Can't connect?**
- Make sure both servers are running
- Check the terminal for error messages
- Try refreshing the browser

**Login not working?**
- Verify you're using the correct credentials
- Check that the backend server is running
- Clear browser cache and try again

**Need to create test users?**
```bash
cd backend
python manage.py create_test_users
```

---

## 📚 More Information

For detailed documentation, see **USER_GUIDE.md**

---

**Happy Testing! 🎉**
