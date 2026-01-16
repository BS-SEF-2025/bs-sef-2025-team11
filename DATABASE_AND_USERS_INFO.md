# Database and Users Information

## Response Guide for Teacher Questions

---

## Question 1: "Where is the database?"

### Answer:

**"The database is a SQLite file located at: `backend/db.sqlite3`"**

**Technical Details:**

- **Database Type:** SQLite 3
- **File Location:** `backend/db.sqlite3` (relative to project root)
- **Full Path:** `c:\Users\Mohamd badhe\Desktop\project_ysodot123\backend\db.sqlite3`
- **Configuration:** Defined in `backend/campus_api/settings.py` (lines 54-59)

**Settings Configuration:**
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

**Why SQLite:**
- Used for development (easy to set up, no server required)
- Single file contains all database data
- Can be easily backed up or shared
- For production, we would switch to PostgreSQL or MySQL

**How to Access:**
- Use Django admin panel at `http://127.0.0.1:8000/admin`
- Use SQLite browser tools (DB Browser for SQLite)
- Use Django shell: `python manage.py shell`
- Command line: `sqlite3 backend/db.sqlite3`

---

## Question 2: "Where are all the users stored?"

### Answer:

**"Users are stored in two related tables in the SQLite database:"**

1. **`auth_user` table** (Django's built-in User model)
   - Stores basic authentication information
   - Fields: `id`, `username`, `email`, `password`, `first_name`, `last_name`, `is_active`, `is_staff`, `is_superuser`, `date_joined`

2. **`accounts_profile` table** (Custom Profile model)
   - Stores additional user information and roles
   - Fields: `id`, `user_id` (ForeignKey to auth_user), `role` (student, lecturer, manager, admin)

**User Model Structure:**

**Django's Built-in User** (`django.contrib.auth.models.User`):
- Used for authentication and login
- Stored in `auth_user` table
- Contains username, email, password (hashed), and basic info

**Custom Profile Model** (`accounts.models.Profile`):
```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=[
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('manager', 'Manager'),
        ('admin', 'Admin')
    ])
```

**How Users are Created:**
1. **Registration:** Users register through the frontend (`src/pages/Register.jsx`)
2. **Django Admin:** Can be created through Django admin panel
3. **Management Commands:**
   - `python manage.py create_admin` - Creates admin user
   - `python manage.py create_test_users` - Creates test users (admin, student, lecturer)

**Accessing Users:**

**Through Django Admin:**
- Go to `http://127.0.0.1:8000/admin`
- Login with admin credentials
- Navigate to "Users" section under "Authentication and Authorization"
- Navigate to "Profiles" section under "Accounts"

**Through Django Shell:**
```python
python manage.py shell

# Get all users
from django.contrib.auth.models import User
users = User.objects.all()

# Get all profiles with roles
from accounts.models import Profile
profiles = Profile.objects.all()

# Get user with role
user = User.objects.get(email='student@campus.edu')
role = user.profile.role  # Access profile via related_name
```

**Database Tables Summary:**

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `auth_user` | User authentication | id, username, email, password |
| `accounts_profile` | User roles and additional info | id, user_id, role |
| `accounts_faultreport` | Fault reports (US-7) | id, title, description, status, severity, category |
| `accounts_labstatus` | Lab availability (US-2) | id, name, building, current_occupancy, max_capacity |
| `accounts_librarystatus` | Library status (US-1) | id, name, current_occupancy, max_capacity |

**Note about Room Requests (US-5):**
- Room requests are stored in **base44 entities** (external API)
- NOT stored in the SQLite database
- Accessible through base44 API client (`src/api/base44Client.js`)

---

## Quick Reference Commands

**View Database:**
```bash
cd backend
sqlite3 db.sqlite3
.tables  # Show all tables
.schema auth_user  # Show user table structure
.schema accounts_profile  # Show profile table structure
SELECT * FROM auth_user;  # View all users
SELECT * FROM accounts_profile;  # View all profiles
```

**Through Django:**
```bash
python manage.py dbshell  # Opens SQLite shell
python manage.py shell  # Opens Django Python shell
python manage.py showmigrations  # Show migration status
```

**Create Admin User:**
```bash
python manage.py create_admin --email admin@campus.edu --password admin123
```

**View Users Programmatically:**
```python
# In Django shell
from django.contrib.auth.models import User
from accounts.models import Profile

# Count users
User.objects.count()

# Get users by role
admin_users = Profile.objects.filter(role='admin')
student_users = Profile.objects.filter(role='student')

# Get user details
user = User.objects.get(email='student@campus.edu')
print(f"Username: {user.username}")
print(f"Role: {user.profile.role}")
```

---

## Summary for Teacher

**Database:**
- **Type:** SQLite 3
- **Location:** `backend/db.sqlite3`
- **Configuration:** `backend/campus_api/settings.py`

**Users:**
- **Authentication:** Django's `auth_user` table
- **Roles/Profile:** `accounts_profile` table (linked via OneToOne relationship)
- **All user data:** Stored in these two related tables in the SQLite database
- **Access:** Django admin panel or Django shell
