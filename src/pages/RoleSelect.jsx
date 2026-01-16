import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { GraduationCap, User, Briefcase, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RoleSelect() {
  const { setRole, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [managerType, setManagerType] = useState('');
  const [reason, setReason] = useState('');

  // If user is already admin, redirect to dashboard
  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

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
    try {
      const result = await setRole(role, reason, managerType);
      if (result.pending_request) {
        toast.info(result.message || 'Your role request is pending admin approval. You can use the system as a student for now.');
      } else {
        toast.success(`Role set to ${role}!`);
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to set role');
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
