import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { LogOut, LayoutDashboard, BookOpen, FlaskConical, AlertTriangle, Users, Settings, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/library-status', label: 'Library', icon: BookOpen },
    { path: '/find-labs', label: 'Labs', icon: FlaskConical },
  ];

  if (user?.role === 'student' || user?.role === 'lecturer') {
    navItems.push(
      { path: '/report-fault', label: 'Report Fault', icon: AlertTriangle },
      { path: '/reports', label: 'My Reports', icon: AlertTriangle }
    );
  }

  if (user?.role === 'lecturer') {
    navItems.push(
      { path: '/room-requests', label: 'Room Requests', icon: Calendar }
    );
  }

  if (user?.role === 'manager' || user?.role === 'admin') {
    navItems.push(
      { path: '/manager-requests', label: 'Pending Updates', icon: Settings },
      { path: '/request-approvals', label: 'Room Approvals', icon: CheckCircle },
      { path: '/fault-management', label: 'Fault Management', icon: AlertTriangle },
      { path: '/reports', label: 'All Reports', icon: AlertTriangle }
    );
  }

  if (user?.role === 'admin') {
    navItems.push(
      { path: '/user-management', label: 'User Management', icon: Users }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="text-xl font-bold text-slate-900">
              Campus Navigator
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:inline">
                {user?.email}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                {user?.role || 'student'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
