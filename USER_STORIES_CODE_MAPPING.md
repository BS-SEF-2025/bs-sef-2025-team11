# User Stories Code Mapping

This document maps each user story and subtask to the specific code files in the project.

---

## 🟦 EPIC 1: Real-Time Occupancy Monitoring

### 🔹 US-1 – Library Occupancy

#### 1.1 Backend – Define library occupancy data model
**Files:**
- `backend/accounts/models.py` (lines 86-98)
  - `LibraryStatus` model with fields: `name`, `current_occupancy`, `max_capacity`, `is_open`, `last_updated`, `updated_by`

#### 1.2 Backend – Determine library occupancy data source
**Files:**
- `backend/accounts/views.py` (lines 316-330)
  - `get_library_status()` function - retrieves library status from database
- `backend/accounts/views.py` (lines 333-374)
  - `update_library_status()` function - allows managers to update occupancy manually

#### 1.3 Frontend – Design library occupancy display
**Files:**
- `src/pages/LibraryStatus.jsx` (entire file)
  - Main component displaying library occupancy with visual indicators
- `src/components/occupancy/OccupancyBadge.jsx`
- `src/components/occupancy/OccupancyBar.jsx`
- `src/components/cards/LibraryCard.jsx`

#### 1.4 Test – Validate occupancy value ranges
**Files:**
- `backend/accounts/views.py` (lines 333-374)
  - Validation logic in `update_library_status()` - ensures occupancy doesn't exceed max_capacity
- Note: Frontend validation in `src/pages/LibraryStatus.jsx` (lines 56-61) maps status to occupancy percentages

---

### 🔹 US-2 – Find Available Lab

#### 2.1 Backend – Define lab availability rules
**Files:**
- `backend/accounts/models.py` (lines 101-117)
  - `LabStatus` model with `is_available` field and occupancy tracking
- `backend/accounts/views.py` (lines 379-399)
  - `list_labs()` function - returns labs with availability status

#### 2.2 Backend – Maintain lab metadata (location, capacity)
**Files:**
- `backend/accounts/models.py` (lines 101-117)
  - `LabStatus` model fields: `name`, `building`, `room_number`, `current_occupancy`, `max_capacity`, `equipment_status`
- `backend/accounts/views.py` (lines 445-467)
  - `create_lab()` function - creates new lab entries
- `backend/accounts/views.py` (lines 402-442)
  - `update_lab_status()` function - updates lab metadata

#### 2.3 Frontend – Display available labs list
**Files:**
- `src/pages/FindLabs.jsx` (entire file)
  - Main component showing list of labs with filters and availability status
- `src/components/cards/LabCard.jsx`

#### 2.4 Test – Handle no available labs scenario
**Files:**
- `src/pages/FindLabs.jsx` (lines 218-226)
  - Empty state handling when no labs match filters

---

### 🔹 US-3 – Global Occupancy View

#### 3.1 Backend – Aggregate occupancy data from all spaces
**Files:**
- `backend/accounts/views.py` (lines 316-330)
  - `get_library_status()` - library data
- `backend/accounts/views.py` (lines 379-399)
  - `list_labs()` - lab data
- Note: Room data would come from base44 entities (see frontend)

#### 3.2 Backend – Define overload thresholds
**Files:**
- `src/pages/OccupancyOverview.jsx` (line 27)
  - `OVERLOAD_THRESHOLD = 80` constant
- `src/pages/OccupancyOverview.jsx` (line 70)
  - Filter logic for overloaded spaces

#### 3.3 Frontend – Design manager occupancy dashboard
**Files:**
- `src/pages/OccupancyOverview.jsx` (entire file)
  - Dashboard showing aggregated occupancy across all spaces
- `src/components/occupancy/OccupancyBar.jsx`
- `src/components/occupancy/OccupancyBadge.jsx`

#### 3.4 Test – Validate overload detection logic
**Files:**
- `src/pages/OccupancyOverview.jsx` (lines 70, 144-153)
  - Overload detection and visual indicators

---

## 🟥 EPIC 2: Room and Lab Allocation

### 🔹 US-4 – Request Room / Lab

#### 4.1 Backend – Define room request data structure
**Files:**
- `src/api/entities.js` (line 10)
  - `RoomRequest` entity from base44
- Note: Backend structure defined in base44, not Django models

#### 4.2 Backend – Define request workflow states
**Files:**
- `src/pages/RoomRequests.jsx` (lines 147-157)
  - Status filtering: `pending`, `approved`, `rejected`
- `src/pages/RequestApprovals.jsx` (line 53)
  - Filter for pending requests

#### 4.3 Frontend – Design room request form
**Files:**
- `src/pages/RoomRequests.jsx` (entire file)
  - Complete form for submitting room/lab requests
  - Lines 221-361: Dialog form with all required fields

#### 4.4 Test – Validate required request fields
**Files:**
- `src/pages/RoomRequests.jsx` (lines 99-102)
  - Form validation before submission

---

### 🔹 US-5 – Approve Room Allocation

#### 5.1 Backend – Define approval decision rules
**Files:**
- `src/pages/RequestApprovals.jsx` (lines 81-106)
  - `handleApprove()` function - approval logic
- `src/pages/RequestApprovals.jsx` (lines 108-131)
  - `handleReject()` function - rejection logic

#### 5.2 Backend – Implement conflict detection logic
**Files:**
- `src/pages/RequestApprovals.jsx` (lines 68-79)
  - `checkConflicts()` function - detects time overlaps with approved requests

#### 5.3 Frontend – Design request approval screen
**Files:**
- `src/pages/RequestApprovals.jsx` (entire file)
  - Manager interface for reviewing and approving/rejecting requests
- `src/components/cards/RequestCard.jsx`

#### 5.4 Test – Validate conflict detection scenarios
**Files:**
- `src/pages/RequestApprovals.jsx` (lines 68-79, 287-292)
  - Conflict detection and warning display

---

## 🟩 EPIC 3: Fault and Maintenance Reporting

### 🔹 US-6 – Report Classroom Fault

#### 6.1 Backend – Define fault categories and severity
**Files:**
- `backend/accounts/models.py` (lines 47-64)
  - `SEVERITY_CHOICES`: low, medium, high, critical
  - `CATEGORY_CHOICES`: projector, ac, lighting, furniture, computer, network, plumbing, electrical, other

#### 6.2 Backend – Store fault report details
**Files:**
- `backend/accounts/models.py` (lines 38-83)
  - `FaultReport` model with all required fields
- `backend/accounts/views.py` (lines 199-225)
  - `create_fault_report()` function - saves fault reports

#### 6.3 Frontend – Design fault reporting form
**Files:**
- `src/pages/ReportFault.jsx` (entire file)
  - Complete form for reporting faults
  - Lines 19-29: Category options
  - Lines 38-43: Severity levels
  - Lines 84-115: Form submission logic

#### 6.4 Test – Confirm fault submission handling
**Files:**
- `src/pages/ReportFault.jsx` (lines 87-90, 117-150)
  - Form validation and success confirmation

---

### 🔹 US-7 – Track and Manage Faults

#### 7.1 Backend – Define fault status lifecycle
**Files:**
- `backend/accounts/models.py` (lines 39-45)
  - `STATUS_CHOICES`: open, in_progress, done, resolved, closed
- `backend/accounts/views.py` (lines 269-311)
  - `update_fault_report()` function - updates fault status

#### 7.2 Backend – Implement fault prioritization rules
**Files:**
- `backend/accounts/models.py` (lines 47-52)
  - Severity levels used for prioritization
- `src/pages/FaultManagement.jsx` (lines 149-154)
  - Severity configuration for display

#### 7.3 Frontend – Design fault tracking dashboard
**Files:**
- `src/pages/FaultManagement.jsx` (entire file)
  - Manager dashboard for tracking and managing faults
- `src/components/cards/FaultCard.jsx`
- `src/pages/Reports.jsx` (entire file)
  - View-only reports page

#### 7.4 Test – Validate fault status transitions
**Files:**
- `src/pages/FaultManagement.jsx` (lines 89-114, 333-387)
  - Status update functionality and form

---

## 🟪 EPIC 4: User Management and Access

### 🔹 US-8 – Manage User Roles

#### 8.1 Backend – Define system user roles
**Files:**
- `backend/accounts/models.py` (lines 5-10)
  - `ROLE_CHOICES`: student, lecturer, manager, admin

#### 8.2 Backend – Define permissions per role
**Files:**
- `backend/accounts/views.py` (lines 236-242)
  - Role-based filtering in `list_fault_reports()` - students/lecturers see own, managers see all
- `backend/accounts/views.py` (lines 279-280, 343-344, 412-413)
  - Manager-only endpoints for updates
- `src/pages/UserManagement.jsx` (lines 42-47)
  - `rolePermissions` object defining permissions per role

#### 8.3 Frontend – Design role management interface
**Files:**
- `src/pages/UserManagement.jsx` (entire file)
  - Admin interface for managing role requests
- `src/components/RoleGate.jsx`
  - Component for role-based access control

#### 8.4 Test – Validate access restrictions per role
**Files:**
- `src/state/ProtectedRoute.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/RoleGate.jsx`
  - All role-based access control components

---

### 🔹 US-9 – User Login

#### 9.1 Backend – Define authentication flow
**Files:**
- `backend/accounts/views.py` (lines 72-88)
  - `login()` function - authentication endpoint
- `backend/accounts/views.py` (lines 28-37)
  - `_auth_user()` helper - validates JWT tokens
- `backend/accounts/jwt.py`
  - JWT token creation and validation

#### 9.2 Backend – Validate user credentials
**Files:**
- `backend/accounts/views.py` (lines 81-83)
  - `authenticate()` call - validates username/password
- `backend/accounts/auth.py`
  - Authentication utilities

#### 9.3 Frontend – Design login screen
**Files:**
- `src/pages/Login.jsx` (entire file)
  - Login form with email/password and Google OAuth option
- `src/state/AuthContext.jsx`
  - Authentication context and state management

#### 9.4 Test – Validate login and logout scenarios
**Files:**
- `src/pages/Login.jsx` (lines 17-30)
  - Login submission and error handling
- `src/state/AuthContext.jsx`
  - Logout functionality

---

## 🟧 EPIC 5: Reports and Insights

### 🔹 US-10 – Utilization Reports

#### 10.1 Backend – Define utilization metrics
**Files:**
- `backend/accounts/models.py` (lines 86-98)
  - Library occupancy percentage calculation
- `backend/accounts/models.py` (lines 101-117)
  - Lab occupancy percentage calculation
- `backend/accounts/views.py` (lines 328, 394)
  - `occupancy_percentage` calculated in API responses

#### 10.2 Backend – Aggregate utilization data
**Files:**
- `src/pages/OccupancyOverview.jsx` (lines 64-74)
  - Aggregation logic combining libraries, labs, and rooms
- `src/pages/Dashboard.jsx` (lines 38-70)
  - Dashboard aggregating library, labs, and faults data
- `src/pages/Dashboard.jsx` (lines 97-99)
  - Library occupancy percentage calculation

#### 10.3 Frontend – Design utilization report view
**Files:**
- `src/pages/Reports.jsx` (entire file)
  - Reports view showing fault statistics
- `src/pages/OccupancyOverview.jsx` (lines 168-189)
  - Chart visualization of occupancy data
- `src/pages/Dashboard.jsx` (entire file)
  - Main dashboard with utilization stats cards and summaries

#### 10.4 Test – Validate report calculations
**Files:**
- `src/pages/OccupancyOverview.jsx` (lines 76-80)
  - Chart data calculation
- `src/pages/Dashboard.jsx` (lines 97-99, 126-160)
  - Dashboard statistics calculations and display

---

### 🔹 US-11 – Recurring Problems Report

#### 11.1 Backend – Identify recurring fault patterns
**Files:**
- `src/pages/Reports.jsx` (entire file)
  - Fault reports listing (can be extended for pattern detection)
- `backend/accounts/models.py` (lines 38-83)
  - `FaultReport` model stores category, location, severity for pattern analysis

#### 11.2 Backend – Identify recurring overload patterns
**Files:**
- `src/pages/OccupancyOverview.jsx` (lines 70, 200-237)
  - Overload detection (can be extended for pattern tracking)
- `backend/accounts/models.py` (lines 86-98, 101-117)
  - Historical data models for tracking patterns

#### 11.3 Frontend – Design recurring issues report
**Files:**
- Note: This feature appears to be partially implemented or planned
- `src/pages/Reports.jsx` can be extended for recurring issues view

#### 11.4 Test – Validate recurring pattern detection
**Files:**
- Note: Pattern detection logic would need to be implemented
- Current code provides data structure but not pattern analysis

---

## 📋 Additional Supporting Files

### API Integration
- `src/api/base44Client.js` - Base44 API client setup
- `src/api/entities.js` - Entity definitions
- `src/api/integrations.js` - Integration utilities

### Authentication & Authorization
- `backend/accounts/jwt.py` - JWT token handling
- `backend/accounts/auth.py` - Authentication utilities
- `src/state/AuthContext.jsx` - Frontend auth state
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/components/RoleGate.jsx` - Role-based access

### URL Routing
- `backend/accounts/urls.py` - Backend API routes
- `backend/campus_api/urls.py` - Main URL configuration

### Settings
- `backend/campus_api/settings.py` - Django settings

---

## 📝 Notes

1. **Base44 Integration**: Some features (Room Requests, Room entities) use base44 entities rather than Django models. Check `src/api/entities.js` for these.

2. **Missing Implementations**: 
   - US-11 (Recurring Problems Report) appears to have data structures but may need pattern detection logic
   - Room allocation conflict detection is in frontend but may need backend validation

3. **Testing**: Test files are referenced but actual test implementations should be verified in:
   - `backend/accounts/tests.py`

4. **Admin Interface**: Django admin is configured in:
   - `backend/accounts/admin.py`
