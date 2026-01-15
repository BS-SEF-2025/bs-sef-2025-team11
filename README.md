# US-2: Find Available Lab

This branch contains ONLY the implementation for **US-2: Find Available Lab**.

Allows students to quickly locate free computer labs suitable for practice.

## Files Included

### US-2 Specific Files
- `src/pages/FindLabs.jsx` - Main page component for finding available labs
- `src/components/cards/LabCard.jsx` - Lab display card component

### Backend Files (Relevant Sections)
- `backend/accounts/models.py` (lines 101-117) - `LabStatus` model
- `backend/accounts/views.py` (lines 379-467) - Lab endpoints:
  - `list_labs()` - Returns labs with availability status
  - `update_lab_status()` - Updates lab metadata
  - `create_lab()` - Creates new lab entries
- `backend/accounts/urls.py` - URL routing for lab endpoints

### Shared Dependencies
- `src/api/entities.js` - Entity definitions
- `src/api/base44Client.js` - API client setup
- `src/lib/utils.js` - Common utilities
- `src/components/ui/*` - UI components (card, button, input, badge, etc.)

## Subtasks

### 2.1 Backend – Define lab availability rules
- Files: `backend/accounts/models.py` (LabStatus model), `backend/accounts/views.py` (list_labs)

### 2.2 Backend – Maintain lab metadata (location, capacity)
- Files: `backend/accounts/models.py` (LabStatus fields), `backend/accounts/views.py` (create_lab, update_lab_status)

### 2.3 Frontend – Display available labs list
- Files: `src/pages/FindLabs.jsx`, `src/components/cards/LabCard.jsx`

### 2.4 Test – Handle no available labs scenario
- Files: `src/pages/FindLabs.jsx` (lines 218-226) - Empty state handling

## Notes

- This branch contains ONLY files for US-2
- Backend files contain multiple models/views; only US-2 relevant sections (LabStatus) are used
- Shared UI components are included as dependencies
