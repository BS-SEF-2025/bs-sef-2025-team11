# bs-sef-2025-team11

US11 – Recurring Issues Detection (Faults + Overloads) and Reporting UI

Goal: Detect repeating problems in the system over a time window and expose them via APIs + a simple report page for viewing results.

Step 1 — Define the Data Models (Persistence Layer)
US11.1 — Fault Logging Model (Issues domain)

Implemented a Fault entity (error_code, description, component, timestamp).

Purpose: store system faults so we can analyze recurrence over time.

US11.2 — Overload Logging Model (Infrastructure domain)

Implemented an OverloadRecord entity (component, cpu, memory, timestamp).

Purpose: store resource overload events (CPU/RAM) for recurrence detection.

Result: We now have two persistent sources of truth:

issues_fault (fault events)

infrastructure_overloadrecord (overload events)

Step 2 — Database Migrations (Schema Creation)

Generated migrations for both apps (issues + infrastructure).

Applied migrations to create DB tables.

Verified tables exist in the SQLite database using Django migrations / introspection.

Result: No more “no such table …” errors once migrations are applied correctly.

Step 3 — Implement the Detection Logic (Business/Service Layer)
US11.1 Recurring Faults Detection

Created a service function that:

filters Faults within a given minutes window

groups by (error_code, component)

counts occurrences

returns only items meeting a threshold (e.g., 3+ occurrences)

US11.2 Recurring Overloads Detection

Created a service function that:

filters OverloadRecord within minutes window

groups by component

calculates average CPU (and optionally memory)

returns only components exceeding cpu_threshold (e.g., avg CPU >= 80)

Result: Recurrence rules are centralized and reusable (not embedded inside views).

Step 4 — Expose Results Through REST APIs (API Layer)
US11.1 API: Recurring Faults

Implemented an API endpoint:

GET /api/issues/recurring-faults/

Returns structured JSON list (e.g., error_code, component, count).

Supports query params such as:

minutes

fault_threshold

US11.2 API: Recurring Overloads

Implemented an API endpoint:

GET /api/issues/recurring-overloads/

Returns structured JSON list (e.g., component, average_cpu).

Supports query params such as:

minutes

cpu_threshold

Result: The system supports programmatic access (frontend, monitoring tools, Postman).

Step 5 — Add Frontend Report Page (UI Layer)
US11.3 Web UI: Recurring Issues Report

Implemented a server-rendered page:

GET /issues/recurring-report/

UI includes:

filter form: minutes window + thresholds

Recurring Faults table

Recurring Overloads table

links to the two API endpoints

Result: Human-readable report for instructors / stakeholders without needing Postman.

Step 6 — Routing and Integration (Wiring)

Added URL routing for:

issues page route: /issues/recurring-report/

issues API routes: /api/issues/recurring-faults/, /api/issues/recurring-overloads/

Ensured INSTALLED_APPS includes:

issues

infrastructure

Result: Full end-to-end flow works (models → DB → services → APIs → UI).

Step 7 — Validation / Testing (Proof it works)

Seeded sample data through Django shell (Faults + OverloadRecord).

Confirmed:

APIs return HTTP 200 OK and correct JSON

report page renders and shows tables

filters update results correctly

Confirmed no missing templates after moving templates into app-based folders:

issues/templates/issues/...

Final Deliverables for US11

Fault recurrence detection + API

Overload recurrence detection + API

Recurring report UI page (HTML tables + filters)

Integration (urls, templates, migrations, installed apps)
