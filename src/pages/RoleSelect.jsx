import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { GraduationCap, User, Briefcase, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RoleSelect() {
  const { setRole, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [managerType, setManagerType] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Only redirect admin users - everyone else (including students) can access role selection
  // Students need this page to request lecturer/manager roles
  useEffect(() => {
    // Only redirect admin - they don't need role selection
    // Wait until user is loaded before checking
    if (!authLoading && user?.role === 'admin') {
      console.log('Admin user, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
    // Everyone else (students, lecturers, managers) can access this page
    // Students can select student role or request lecturer/manager
  }, [user, authLoading, navigate]);

  const token = localStorage.getItem("token");

  // Show loading while checking auth - this is important right after registration
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  // If no token at all, show unauthorized
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Unauthorized</h2>
            <p className="text-slate-600 mb-4">Please log in to select your role.</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  // If we have token but user is not loaded yet, show loading
  // This can happen right after registration when state is still updating
  // Give it more time - don't redirect immediately
  const [waitingForUser, setWaitingForUser] = useState(token && !user);

  useEffect(() => {
    if (token && !user) {
      // Wait up to 3 seconds for user to load
      const timer = setTimeout(() => {
        setWaitingForUser(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setWaitingForUser(false);
    }
  }, [token, user]);

  if (waitingForUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your account...</p>
          <p className="text-sm text-slate-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // After waiting, if still no user but we have token, proceed anyway
  // The setRole function will handle getting the user
  if (token && !user) {
    console.warn('User not loaded after waiting, but token exists. Proceeding anyway - setRole will fetch user.');
  }

  const managerTypes = [
    { value: 'general', label: 'General Manager' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'it', label: 'IT Manager' },
    { value: 'facilities', label: 'Facilities Manager' },
    { value: 'maintenance', label: 'Maintenance Manager' },
  ];

  const handleRoleSelect = async (role) => {
    if (role === 'manager' && !selectedRole) {
      setSelectedRole(role);
      return;
    }

    setLoading(true);
    setError('');

    // Verify token exists and user is loaded
    const token = localStorage.getItem("token");
    console.log('=== ROLE SELECTION START ===');
    console.log('Role:', role);
    console.log('Token exists:', !!token);
    console.log('Token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NONE');
    console.log('User exists:', !!user);
    console.log('User email:', user?.email);

    if (!token) {
      const errorMsg = "No authentication token found. Please log in again.";
      console.error('ERROR: No token found');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // If we have a token but no user, that's okay - we can still set role
    // The setRole function will handle getting the user if needed
    if (!user && token) {
      console.warn('⚠️ User not in context but token exists - proceeding with role selection');
      console.warn('⚠️ setRole will fetch user if needed');
    }

    if (!user && !token) {
      const errorMsg = "No authentication found. Please log in again.";
      console.error('ERROR: No user and no token');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      console.log('Calling setRole function...');
      console.log('Role:', role);
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);
      const result = await setRole(role, reason, managerType);
      console.log('Role set result:', result);

      if (result?.pending_request) {
        toast.success(result.message || 'Your role request is pending admin approval. You can use the system as a student for now.');
        // Show additional info for manager/lecturer
        // Show additional info for all roles requiring approval
        if (['manager', 'lecturer', 'student'].includes(role)) {
          toast.info('A manager or admin will review your request. You will be notified once it\'s approved.');
        }
      } else {
        toast.success(`Role set to ${role}!`);
      }

      // Wait a moment for state to update, then navigate
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate('/dashboard');
    } catch (error) {
      console.error('=== ROLE SELECTION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      const errorMessage = error.message || 'Failed to set role. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);

      // If session expired, redirect to login after a delay
      if (errorMessage.includes('session has expired') || errorMessage.includes('log in') || errorMessage.includes('Unauthorized') || errorMessage.includes('No authentication token')) {
        console.error('Session expired, redirecting to login...');
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
      setSelectedRole(null);
      setManagerType('');
      setReason('');
    }
  };

  const roles = [
    { id: 'student', name: 'Student', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'lecturer', name: 'Lecturer', icon: User, color: 'bg-purple-500' },
    { id: 'manager', name: 'Manager', icon: Briefcase, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Your Role</h1>
          <p className="text-slate-600">Choose how you'll use Campus Navigator</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-md mx-auto flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {selectedRole === 'manager' ? (
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-bold text-slate-900">Manager Role Selection</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Manager Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={managerType}
                  onChange={(e) => setManagerType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select manager type...</option>
                  {managerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need manager access?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleRoleSelect('manager')}
                  disabled={loading || !managerType}
                  className="flex-1"
                >
                  Submit Request
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRole(null);
                    setManagerType('');
                    setReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (role.id === 'manager') {
                      setSelectedRole('manager');
                    } else {
                      handleRoleSelect(role.id);
                    }
                  }}
                >
                  <div className={`w-16 h-16 ${role.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">{role.name}</h3>
                  <p className="text-sm text-slate-600 text-center mb-4">
                    {role.id === 'student' && 'Access campus facilities and report issues'}
                    {role.id === 'lecturer' && 'Manage classes and room bookings (requires approval)'}
                    {role.id === 'manager' && 'Manage campus infrastructure (requires approval)'}
                  </p>
                  <Button className="w-full" disabled={loading}>
                    Select {role.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
