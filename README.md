
# 🛠️ User Story 7: Maintenance Staff Dashboard

## 📝 Overview

This component provides a dedicated interface for the campus maintenance staff. It allows them to view all reported infrastructure issues across different labs and toggle their status (Pending/Fixed) in real-time.

## ✨ Key Features

* **Centralized Issue Tracking:** View a professional table listing all reported lab problems.
* **Real-time Status Updates:** Toggle between "Pending" and "Fixed" status with a single click.
* **Responsive & Modern UI:** A clean, user-friendly dashboard built with React and custom CSS-in-JS.
* **Backend Integration:** Fully connected to a Django REST API with a relational database.

## 🏗️ Technical Architecture

### Backend (Django)

* **Model:** `Issue` - linked to the `Lab` model via ForeignKey.
* **API Endpoints:**
* `GET /infrastructure/api/issues/`: Fetches all reported issues.
* `POST /infrastructure/api/issues/update/<int:issue_id>/`: Updates the fix status of a specific issue.


* **Logic:** Uses `@csrf_exempt` for secure cross-origin communication with the React frontend.

### Frontend (React)

* **State Management:** Uses `useState` to track issues and loading states.
* **Data Fetching:** Implements `fetch` to communicate with the Django backend.
* **UI/UX:** Modern styling using shadows, badges, and interactive buttons for immediate visual feedback.

## 🧪 Testing

We have implemented unit tests to ensure the reliability of the maintenance system.

To run the backend tests, execute:

```powershell
python manage.py test infrastructure

```

**Tests include:**

1. Verifying the `Issue` model creation.
2. Ensuring the API returns the correct list of issues.
3. Validating that the status toggle logic correctly updates the database.

## 🚀 How to Run

1. **Start Backend:**
```powershell
cd BACKEND
python manage.py runserver

```


2. **Start Frontend:**
```powershell
cd frontend
npm start

```


3. **Access Dashboard:** Open `http://localhost:3000` (or your local port) to view the Maintenance Center.

---



```powershell
git add README.md
git commit -m "Docs: Added detailed README for US7"
git push origin feature/US7-maintenance-dashboard

```

