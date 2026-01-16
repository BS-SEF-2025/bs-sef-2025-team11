import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "@/pages/Dashboard.jsx";
import RoleSelection from "@/pages/RoleSelect.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";

// your existing pages
import Layout from "@/pages/Layout.jsx";
import LibraryStatus from "@/pages/LibraryStatus.jsx";
import FindLabs from "@/pages/FindLabs.jsx";
import Classrooms from "@/pages/Classrooms.jsx";
import RoomRequests from "@/pages/RoomRequests.jsx";
import ReportFault from "@/pages/ReportFault.jsx";
import Reports from "@/pages/Reports.jsx";
import FaultManagement from "@/pages/FaultManagement.jsx";
import ManagerRequests from "@/pages/ManagerRequests.jsx";
import RequestApprovals from "@/pages/RequestApprovals.jsx";
import OccupancyOverview from "@/pages/OccupancyOverview.jsx";
import UserManagement from "@/pages/UserManagement.jsx";

import { useAuth } from "@/state/AuthContext.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // Admins always have access, skip role selection
  if (user.role === 'admin') return children;
  if (!user.role) return <Navigate to="/role-selection" replace />;
  return children;
}

export default function Pages() {
  console.log('📄 Pages component rendering...');
  
  // Safety check - ensure we always render something
  try {
    return (
      <Routes>
        {/* Default: go login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Needs login only */}
        <Route
          path="/role-selection"
          element={
            <RequireAuth>
              <RoleSelection />
            </RequireAuth>
          }
        />

        {/* Needs login + role */}
        <Route
          element={
            <RequireRole>
              <Layout />
            </RequireRole>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library-status" element={<LibraryStatus />} />
          <Route path="/find-labs" element={<FindLabs />} />
          <Route path="/classrooms" element={<Classrooms />} />
          <Route path="/room-requests" element={<RoomRequests />} />
          <Route path="/report-fault" element={<ReportFault />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/fault-management" element={<FaultManagement />} />
          <Route path="/manager-requests" element={<ManagerRequests />} />
          <Route path="/request-approvals" element={<RequestApprovals />} />
          <Route path="/occupancy-overview" element={<OccupancyOverview />} />
          <Route path="/user-management" element={<UserManagement />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  } catch (error) {
    console.error('❌ Pages component error:', error);
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#d32f2f', fontSize: '24px', marginBottom: '20px' }}>
            Routing Error
          </h1>
          <p style={{ color: '#424242', marginBottom: '10px' }}>
            <strong>Error:</strong> {error.message || 'Unknown routing error'}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
}
