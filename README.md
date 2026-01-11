# US-11 — Recurring Issues Monitoring (Faults & Overloads)

## Overview
US-11 adds the capability to record and track recurring system issues in the application.  
The goal is to persist operational problems (e.g., faults and overload conditions) so they can be audited, monitored, and analyzed over time.

This implementation introduces dedicated models for:
- **Fault**: a structured system error (error code + description + timestamp)
- **Overload**: high resource usage events (CPU/RAM or component usage)

US-11 ensures the issues are stored in the database and can be retrieved later (e.g., via admin, API, or HTML pages depending on your project scope).

---

## Functional Scope
US-11 covers:
- Database persistence for recurring issues (Fault / Overload)
- Automatic timestamping for event records
- Migrations for the new schema
- (Optional) Admin integration for viewing records
- (Optional) API endpoints and/or HTML pages to list records

---

## Architecture & Data Flow

### What problem does this solve?
Recurring issues are operational events. Without persistence, they are lost after restart.  
US-11 stores them permanently in the DB so the team can:
- Investigate when an issue happened
- See repeated patterns (same error code, same component)
- Provide evidence in reports and demos

### Data flow (high level)
1. An issue event occurs (fault or overload)
2. The application creates a record (Fault / Overload)
3. Django ORM persists the record to the database
4. Records can be viewed later (admin/API/UI)

---

## Database: Where is the data saved?

### 1) Faults
Stored in a table generated from the `Fault` model (commonly: `issues_fault`).

Typical fields:
- `id` (primary key)
- `error_code` (string, e.g., `DB_CONNECTION_FAIL`)
- `description` (text)
- `timestamp` (auto-created DateTime)

**Key behavior:**  
`timestamp` is stored automatically at creation using `auto_now_add=True`.  
This guarantees each event has a reliable audit time.

### 2) Overloads
Stored in a table generated from the `Overload` model (commonly: `issues_overload`).

Typical fields depend on your model, but often include:
- `component_name` (e.g., `DB`, `API`, `Worker`)
- metrics like `cpu_percent`, `ram_percent`, or general usage fields
- `timestamp` (auto-created)

### 3) Django Migrations
US-11 schema is applied via migrations in:
- `issues/migrations/`

You should see applied migrations with:
```powershell
python manage.py showmigrations issues
