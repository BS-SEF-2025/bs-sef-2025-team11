# Comprehensive Documentation: User Stories 2, 5, and 7

## Table of Contents
1. [User Story 2: Find Available Lab](#user-story-2-find-available-lab)
2. [User Story 5: Approve Room Allocation](#user-story-5-approve-room-allocation)
3. [User Story 7: Track and Manage Faults](#user-story-7-track-and-manage-faults)

---

# User Story 2: Find Available Lab

## Overview
**User Story 2** enables students to quickly locate available computer labs on campus. The system displays real-time lab availability, allows filtering by location and capacity, and shows detailed lab information including equipment status.

---

## Subtasks and Implementation

### Subtask 2.1: Backend – Define Lab Availability Rules

#### Backend Model

**Model: `LabStatus`** (`backend/accounts/models.py`, lines 101-117)

**Purpose:**
- Stores lab metadata including location, capacity, and current occupancy
- Tracks availability status (available/unavailable)
- Records equipment status for maintenance purposes
- Maintains audit trail with `last_updated` and `updated_by` fields

**Key Fields:**
- `name`: Lab name (e.g., "Computer Lab A")
- `building`: Building name
- `room_number`: Room number
- `current_occupancy`: Current number of users
- `max_capacity`: Maximum capacity
- `is_available`: Availability flag (Boolean)
- `equipment_status`: Equipment condition
- `last_updated`: Last update timestamp
- `updated_by`: User who made the update

---

### Subtask 2.2: Backend – Maintain Lab Metadata (Location, Capacity)

#### Backend Functions

**Function: `list_labs()`** (`backend/accounts/views.py`, lines 379-399)
- **What it does:** Retrieves all labs from the database with their current status and availability
- **Returns:** JSON response with array of lab objects including occupancy percentage
- **Access:** Public endpoint (no authentication required)
- **Features:** Calculates occupancy percentage, orders labs by building and room number

**Function: `update_lab_status()`** (`backend/accounts/views.py`, lines 402-442)
- **What it does:** Updates lab occupancy, availability, and equipment status in real-time
- **Validation:** Ensures occupancy doesn't exceed maximum capacity
- **Access:** Requires manager or admin authentication
- **Features:** Records who made the update for audit purposes, returns error for invalid operations

**Function: `create_lab()`** (`backend/accounts/views.py`, lines 445-467)
- **What it does:** Creates new lab entries in the campus system
- **Access:** Requires manager or admin authentication
- **Features:** Sets default values for optional fields, returns newly created lab ID

---

### Subtask 2.3: Frontend – Display Available Labs List

#### Frontend Components

**Component: `FindLabs.jsx`**

**Visual Design:**
- **Layout:** Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- **Color Scheme:**
  - Available labs: Green badges and accents
  - Partially occupied: Amber/yellow indicators
  - Fully occupied: Gray/slate indicators
  - Unavailable: Red badges
- **Icons:** Monitor/computer icons for each lab card
- **Typography:** Clear headings with building and room numbers

**Key Features:**
1. **Real-time Lab Status Display** - Shows availability, occupancy percentage bars, visual indicators
2. **Filtering System** - Filter by building, availability status, capacity range, search by name
3. **Sorting Options** - Sort by availability, building name, or capacity
4. **Auto-refresh** - Updates every 30 seconds for live data

**Functions:**
- **`loadLabs()`** - Fetches labs from API and applies filters
- **`getLabStatus()`** - Calculates status (available/occupied/partial/unavailable) based on occupancy
- **`applyFilters()`** - Filters labs by building, status, and search query

**Component: `LabCard.jsx`**

**Visual Design:**
- Card-based layout with hover effects
- Status badge in top-right corner
- Occupancy progress bar
- Equipment status indicator
- Building and room number prominently displayed

**Displayed Information:**
- Lab name
- Building and room number
- Availability status badge
- Current occupancy / Maximum capacity
- Occupancy percentage bar
- Equipment status

---

### Subtask 2.4: Test – Handle No Available Labs Scenario

#### Testing Implementation

**Frontend Test:**
- **Empty State Handling:** Displays friendly message when no labs match filters
- **Scenario:** Shows "No Labs Available" card with icon when filtered results are empty

**Backend Test Cases:**
1. **Empty Response:** Verify API returns empty array when no labs exist
2. **Filtering:** Verify filters correctly exclude unavailable labs
3. **Capacity Validation:** Ensure occupancy cannot exceed max_capacity
4. **Real-time Updates:** Verify status updates reflect immediately

---

## API Endpoints (US-2)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/labs/list` | Get all labs with status | Public |
| PUT | `/api/labs/<lab_id>/update` | Update lab status | Manager/Admin |
| POST | `/api/labs/create` | Create new lab | Manager/Admin |

---

# User Story 5: Approve Room Allocation

## Overview
**User Story 5** provides managers with a comprehensive interface to review, approve, or reject room allocation requests from students and lecturers. The system includes conflict detection to prevent double bookings and allows managers to assign specific rooms to approved requests.

---

## Subtasks and Implementation

### Subtask 5.1: Backend – Define Approval Decision Rules

#### Approval Logic

**Decision Rules:**
1. **Approval Requirements:**
   - Room must match requested type (classroom, lecture hall, lab, etc.)
   - Room capacity must meet expected attendees
   - No time conflicts with existing approved requests
   - Manager must assign a specific room

2. **Rejection Requirements:**
   - Manager must provide a rejection reason
   - All rejection reasons are logged with timestamps

**Note:** US-5 primarily uses **base44 entities** for room requests, not Django models. The backend logic is handled through base44 API calls.

---

### Subtask 5.2: Backend – Implement Conflict Detection Logic

#### Frontend Conflict Detection

**Function: `checkConflicts()`** (`src/pages/RequestApprovals.jsx`, lines 68-79)
- **What it does:** Detects time conflicts between a pending request and already approved requests
- **Conflict Conditions:**
  - Same room (`approved_room_id`)
  - Same date
  - Overlapping time slots
- **Time Overlap Logic:** Checks if request start/end times fall within approved request's time window
- **Returns:** Boolean indicating if conflicts exist
- **Purpose:** Prevents double bookings by detecting conflicts before approval

---

### Subtask 5.3: Frontend – Design Request Approval Screen

#### Frontend Components

**Component: `RequestApprovals.jsx`**

**Visual Design:**
- **Layout:** Single-column list of pending requests
- **Color Scheme:**
  - Pending requests: Amber/yellow accents
  - Approve button: Emerald/green
  - Reject button: Red
  - Cards: White with subtle borders
- **Icons:** Clock icon for pending status, Building icon for room types

**Key UI Elements:**

1. **Header Section:**
   - Page title: "Request Approvals"
   - Counter: Displays number of pending requests
   - Subtitle showing count

2. **Request Cards:**
   - Room type (Classroom, Lecture Hall, Lab, etc.)
   - Purpose of the request
   - Date and time slot
   - Expected number of attendees
   - Requester name/email
   - Equipment needed (if any)
   - Status badge (always "Pending" in this view)

3. **Action Buttons:**
   - **Approve Button:** Green/emerald color, Check icon
   - **Reject Button:** Red color, X icon

**Functions:**

**Function: `loadData()`** (lines 48-66)
- **What it does:** Loads all data required for the approval interface
- **Fetches:** Current user data, pending room requests, available rooms, available labs
- **Features:** Parallel API calls for efficiency, handles authentication, updates loading states

**Function: `handleApprove()`** (lines 81-106)
- **What it does:** Approves a pending room request and assigns a room
- **Validation:** Ensures a room has been selected for assignment
- **Updates:** RoomRequest entity with status='approved', assigned room, reviewer info, timestamp
- **Features:** Shows success toast, closes dialog, refreshes request list

**Function: `handleReject()`** (lines 108-131)
- **What it does:** Rejects a pending room request with a reason
- **Validation:** Requires rejection reason (cannot be empty)
- **Updates:** RoomRequest entity with status='rejected', rejection reason, reviewer info, timestamp
- **Features:** Stores rejection reason for record-keeping, provides feedback, refreshes interface

**Function: `getAvailableSpaces()`** (lines 133-139)
- **What it does:** Filters available rooms/labs based on request requirements
- **Filters by:** Room type match, capacity requirement (room capacity >= expected attendees)
- **Returns:** Array of spaces (rooms or labs) that match criteria
- **Purpose:** Ensures managers only see suitable spaces for assignment

**Dialog Components:**
- **Approval Dialog:** Shows request details, room selection dropdown, capacity information, conflict warnings
- **Rejection Dialog:** Textarea for rejection reason (required), validation, cancel/reject buttons

**Component: `RequestCard.jsx`**

**Visual Design:**
- Card layout with hover shadow effects
- Status badge in top-right corner
- Icons for calendar, clock, and user
- Conditional styling for different statuses

**Displayed Information:**
- Room type with icon
- Request purpose
- Date (formatted: "MMM D, YYYY")
- Time range (start - end)
- Expected attendees count
- Requester name/email
- Equipment needed (if any)
- Status badge (Pending, Approved, Rejected)
- Approved room assignment (if approved)
- Rejection reason (if rejected)

---

### Subtask 5.4: Test – Validate Conflict Detection Scenarios

#### Testing Scenarios

**Test Case 1: No Conflict**
- Same room, different times → No conflict

**Test Case 2: Exact Time Overlap**
- Same room, same date, same time → Conflict detected

**Test Case 3: Partial Overlap (Start Time)**
- Request start time falls within approved request time → Conflict detected

**Test Case 4: Partial Overlap (End Time)**
- Request end time falls within approved request time → Conflict detected

**Test Case 5: Different Rooms**
- Different rooms, same time → No conflict

**Test Case 6: Different Dates**
- Same room, different dates → No conflict

---

## API Endpoints (US-5)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `base44.entities.RoomRequest.filter({status: 'pending'})` | Get pending requests | Manager/Admin |
| PUT | `base44.entities.RoomRequest.update(id, {...})` | Approve/reject request | Manager/Admin |
| GET | `base44.entities.Room.list()` | Get available rooms | Manager/Admin |
| GET | `base44.entities.Lab.list()` | Get available labs | Manager/Admin |

---

# User Story 7: Track and Manage Faults

## Overview
**User Story 7** provides infrastructure managers with a comprehensive dashboard to track, prioritize, and manage facility maintenance issues. The system supports multiple fault statuses, severity levels, and categories, enabling efficient maintenance workflows.

---

## Subtasks and Implementation

### Subtask 7.1: Backend – Define Fault Status Lifecycle

#### Backend Model

**Model: `FaultReport`** (`backend/accounts/models.py`, lines 38-83)

**Status Lifecycle:**
1. **`open`** - Initial state when fault is reported
2. **`in_progress`** - Manager assigns technician and work begins
3. **`done`** - Work completed, awaiting verification
4. **`resolved`** - Verified as fixed by manager/reporter
5. **`closed`** - Archived status for completed faults

**Key Fields:**
- `title`: Brief description of the fault
- `description`: Detailed description
- `building`: Building name
- `room_number`: Room number
- `category`: Type of fault (projector, ac, lighting, etc.)
- `severity`: Priority level (low, medium, high, critical)
- `status`: Current status in lifecycle
- `reporter_name`: Name of person who reported
- `reporter_email`: Email of reporter
- `assigned_to`: Technician/team assigned
- `resolution_notes`: Notes about the resolution
- `image_url`: Photo of the fault
- `created_at`: When fault was reported
- `updated_at`: Last update timestamp
- `resolved_at`: When fault was resolved

---

### Subtask 7.2: Backend – Implement Fault Prioritization Rules

#### Severity Levels

**Severity Hierarchy:**
- **`critical`** - Emergency issues (electrical hazards, major structural problems) - Highest priority (Red)
- **`high`** - Significant impact (broken AC in summer, network outage) - High priority (Orange)
- **`medium`** - Moderate impact (broken projector, faulty lighting) - Medium priority (Amber)
- **`low`** - Minor issues (wobbly chair, small cosmetic damage) - Low priority (Gray)

**Category Types:**
- Projector, Air Conditioning, Lighting, Furniture, Computer, Network, Plumbing, Electrical, Other

---

### Subtask 7.3: Frontend – Design Fault Tracking Dashboard

#### Frontend Components

**Component 1: `FaultManagement.jsx`** (Manager Dashboard)

**Visual Design:**
- **Layout:** Dashboard with statistics cards, filters, tabs, and fault list
- **Color Scheme:**
  - Open: Blue
  - In Progress: Purple
  - Done/Resolved: Emerald/Green
  - Closed: Gray/Slate
  - Critical severity: Red
  - High severity: Orange
  - Medium severity: Amber
  - Low severity: Gray
- **Icons:** AlertTriangle, Wrench, Check, Clock for different statuses

**Key UI Elements:**

1. **Statistics Dashboard:**
   - 6 cards showing counts: Open, In Progress, Done, Resolved, Closed, Total
   - Color-coded by status
   - Real-time updates every 30 seconds

2. **Filter Section:**
   - **Search Bar:** Search by title, building, room number
   - **Severity Filter:** Dropdown (All, Low, Medium, High, Critical)
   - **Category Filter:** Dynamic dropdown based on existing categories
   - All filters work together (AND logic)

3. **Tab Navigation:**
   - Tabs for each status: Open, In Progress, Done, Resolved, Closed, All
   - Each tab shows count in parentheses
   - Clicking a tab filters the list by that status

4. **Fault List:**
   - Displays filtered faults using `FaultCard` component
   - Clicking a card opens detail sheet
   - Empty state message when no faults match filters

5. **Fault Detail Sheet:**
   - Side panel that opens when clicking a fault
   - Displays complete fault information
   - Update form for managers to change status, assign technician, add notes

**Functions:**

**Function: `loadData()`** (lines 68-87)
- **What it does:** Fetches all fault reports from the backend API
- **Authentication:** Requires Bearer token in Authorization header
- **Features:** Handles errors with toast notifications, updates loading states, auto-refreshes every 30 seconds

**Function: `handleUpdateFault()`** (lines 89-114)
- **What it does:** Updates a fault report with new status, assignment, or notes
- **Updates:** status, assigned_to, resolution_notes
- **Features:** Shows success/error toast, closes detail sheet, refreshes fault list
- **Validation:** Handles backend validation errors

**Function: `openFaultDetails()`** (lines 116-123)
- **What it does:** Opens the detail sheet with fault information and populates update form
- **Purpose:** Prepares the update form with current fault data

**Function: `filteredFaults`** (computed, lines 125-136)
- **What it does:** Applies all active filters to the fault list
- **Filter Logic:** Search query, severity filter, category filter, status tab (AND logic)
- **Features:** Case-insensitive search, updates dynamically as filters change

**Component 2: `Reports.jsx`** (View-Only Reports Page)

**Visual Design:**
- Similar to FaultManagement but without update capabilities
- Read-only interface for viewing fault reports
- Same statistics dashboard and filtering system

**Key Differences:**
- No update form in detail sheet
- Shows all fault information (read-only)
- Displays reporter information prominently
- Shows manager updates (assigned_to, resolution_notes) if present
- Timestamps for created, updated, and resolved dates

**Functions:**

**Function: `loadData()`**
- **What it does:** Fetches all faults from API (same as FaultManagement)
- **Features:** Auto-refreshes every 30 seconds

**Function: `filteredFaults`**
- **What it does:** Similar filtering logic with additional search fields (reporter_name, reporter_email)

**Component 3: `FaultCard.jsx`**

**Visual Design:**
- Card layout with category icon in colored circle
- Hover effects (shadow, cursor pointer)
- Status and severity badges
- Location and timestamp information

**Displayed Information:**
- Category icon (emoji based on category)
- Fault title (truncated if long)
- Severity badge (color-coded)
- Status badge (color-coded)
- Location (building, room number)
- Time since report ("2 hours ago" format)
- Description (2-line preview, truncated)
- Assigned technician (if assigned)

---

### Subtask 7.4: Test – Validate Fault Status Transitions

#### Backend Functions

**Function: `list_fault_reports()`** (`backend/accounts/views.py`, lines ~228-250)
- **What it does:** Retrieves fault reports based on user role
- **Role-based Filtering:** Managers/Admins see all faults, Students/Lecturers see only their own
- **Returns:** JSON response with faults array containing all fault details
- **Authentication:** Required (JWT token)
- **Features:** Orders by creation date (newest first)

**Function: `update_fault_report()`** (`backend/accounts/views.py`, lines ~269-311)
- **What it does:** Updates a fault report's status, assignment, or resolution notes
- **Access:** Only managers and admins can update
- **Allowed Updates:** status, assigned_to, resolution_notes
- **Automatic Updates:** Sets updated_at timestamp, sets resolved_at when status changes to 'resolved' or 'closed'
- **Validation:** Ensures status is valid, fault exists, only managers/admins can update
- **Returns:** Success message or error response

#### Testing Status Transitions

**Valid Transitions:**
1. `open` → `in_progress` (when work begins)
2. `in_progress` → `done` (when work completes)
3. `done` → `resolved` (when verified fixed)
4. `resolved` → `closed` (when archiving)
5. Any status → `closed` (for archive/cancellation)

**Test Scenarios:**

**Test 1: Status Update with Assignment**
- Update status to 'in_progress' with assigned_to → Status and assignment updated

**Test 2: Auto-set resolved_at**
- Update status to 'resolved' → resolved_at automatically set to current timestamp

**Test 3: Invalid Status**
- Attempt to set invalid status → Error response, status unchanged

**Test 4: Role-based Access**
- Student attempts to update fault → 403 Forbidden error

**Test 5: Resolution Notes Update**
- Update resolution_notes → Notes saved, other fields unchanged

---

## API Endpoints (US-7)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/faults/list` | Get all faults (role-filtered) | Required |
| PUT | `/api/faults/<fault_id>/update` | Update fault status/details | Manager/Admin |

---

## Summary

### User Story 2: Find Available Lab
- **Frontend:** `FindLabs.jsx`, `LabCard.jsx` - Interactive lab finder with filtering
- **Backend:** `LabStatus` model, `list_labs()`, `update_lab_status()`, `create_lab()`
- **Testing:** Empty state handling, capacity validation, real-time updates

### User Story 5: Approve Room Allocation
- **Frontend:** `RequestApprovals.jsx`, `RequestCard.jsx` - Approval interface with conflict detection
- **Backend:** base44 entities (RoomRequest), conflict detection logic in frontend
- **Testing:** Conflict scenarios, approval/rejection workflows, room assignment

### User Story 7: Track and Manage Faults
- **Frontend:** `FaultManagement.jsx`, `Reports.jsx`, `FaultCard.jsx` - Comprehensive fault dashboard
- **Backend:** `FaultReport` model, `list_fault_reports()`, `update_fault_report()`
- **Testing:** Status transitions, role-based access, prioritization, filtering

Each user story provides a complete, functional feature with proper error handling, user feedback, and role-based access control.
