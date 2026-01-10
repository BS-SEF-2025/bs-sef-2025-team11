

# 🧪 User Story 2: Lab Availability & Room Management

## 📌 Project Overview

This module is the core of the Campus Infrastructure Hub. It allows students and faculty members to view real-time availability of computer labs and study rooms, preventing overcrowding and optimizing campus resources.

## 🎯 User Story Definition

> **"As a Student/Staff member, I want to see which labs are currently available and their occupancy status, so I can plan my study sessions effectively."**

## ✨ Key Features

* **Live Occupancy Tracking:** Visual indicators (Green/Red) for lab availability.
* **Detailed Lab Info:** Displays capacity, current number of students, and available software/hardware.
* **Dynamic Filtering:** Filter labs by building, floor, or equipment (e.g., "Labs with GPU").
* **Integration with Maintenance:** Automatically marks labs as "Unavailable" if a critical issue is reported via US7.

## 🛠️ Technical Architecture

### **Backend (Django)**

We implemented a robust data model in the `room_requests` and `infrastructure` apps:

* **Model `Lab**`: Stores capacity, location, and status.
* **API View**: High-performance endpoints using Django REST Framework to serve lab data to the frontend.

### **Frontend (React)**

* **Component-Based UI:** Modular React components for lab cards and status badges.
* **State Management:** Real-time updates using Axios and React Hooks (`useState`, `useEffect`).
* **Responsive Design:** Fully compatible with mobile and desktop views.

## 🧪 Testing & QA

Following the course requirements, we implemented:

1. **Unit Tests:** Testing the Lab model and API response logic.
2. **Integration Tests:** Verifying that lab data is correctly fetched and displayed in the frontend.

## 🔄 Git & Workflow

* **Branch:** `feature/US2-lab-availability`
* **Integration:** Successfully merged with `main` and synchronized with US5 (Alerts) and US7 (Maintenance).
