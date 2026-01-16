# US-8: User Management

This branch contains ONLY the implementation for **US-8: User Management**.

Allows admins to manage users, roles, and role requests. Users can register and request role changes.

## Files Included

### US-8 Specific Files
- `src/pages/UserManagement.jsx` - Admin user management dashboard
- `src/pages/Register.jsx` - User registration page
- `src/pages/RoleSelect.jsx` - Role selection after registration

### Backend Files (Relevant Sections)
- `backend/accounts/models.py` (lines ~4-47) - `Profile` and `RoleRequest` models
- `backend/accounts/views.py` (lines ~50-150, ~800-1100) - User management endpoints:
  - `register()` - User registration
  - `admin_users()` - List all users
  - `admin_role_requests()` - List role requests
  - `admin_approve_role()` - Approve role request
  - `admin_reject_role()` - Reject role request
  - `admin_stats()` - Admin dashboard statistics
- `backend/accounts/urls.py` - URL routing for user management endpoints

### Shared Dependencies
- `src/state/AuthContext.jsx` - Authentication context with `register()` and `setRole()` functions
- `src/components/ui/*` - UI components (card, button, input, badge, etc.)

## Subtasks

### 8.1 Backend – Define system user roles
- Files: `backend/accounts/models.py` (Profile model with ROLE_CHOICES), `backend/accounts/views.py` (role management)

### 8.2 Backend – Define permissions per role
- Files: `backend/accounts/views.py` (role-based access control), `src/pages/UserManagement.jsx` (rolePermissions)

### 8.3 Frontend – Design role management interface
- Files: `src/pages/UserManagement.jsx`, `src/pages/Register.jsx`, `src/pages/RoleSelect.jsx`

### 8.4 Test – Validate access restrictions per role
- Files: `src/pages/UserManagement.jsx` (lines 128-138) - Admin-only access check

## Key Features

### User Registration
- Email and password registration
- Password confirmation
- Automatic redirect to role selection

### Role Selection
- Student role (immediate access)
- Lecturer role (requires approval)
- Manager role (requires approval with manager type and reason)

### Admin Dashboard
- View all users with roles
- Approve/reject role requests
- View system statistics
- User distribution by role
- Pending requests count

### Role Request Management
- View pending role requests
- Approve requests (automatic role assignment)
- Reject requests with optional reason
- View request history

## Notes

- This branch contains ONLY files for US-8
- Backend files contain multiple models/views; only US-8 relevant sections are used
- Shared UI components are included as dependencies
- Admin-only access enforced in UserManagement.jsx
- Role selection flow: Register → Role Selection → Dashboard (or pending approval)
