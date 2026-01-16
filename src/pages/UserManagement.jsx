import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { Users, CheckCircle, XCircle, Clock, AlertCircle, Shield, GraduationCap, Briefcase, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch stats
      const statsRes = await fetch(`${API_BASE || ''}/api/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE || ''}/api/admin/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch role requests
      const requestsRes = await fetch(`${API_BASE || ''}/api/admin/role-requests`, { headers });
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRoleRequests(requestsData.requests || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE || ''}/api/admin/role-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Role request approved!');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId, reason = '') => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE || ''}/api/admin/role-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: reason }),
      });

      if (response.ok) {
        toast.success('Role request rejected');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'lecturer': return <User className="w-4 h-4" />;
      case 'manager': return <Briefcase className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const pendingRequests = roleRequests.filter(r => r.status === 'pending');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Manage users, role requests, and system overview</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.users.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_role_requests}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Faults</p>
                <p className="text-2xl font-bold text-slate-900">{stats.faults.total}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Open Faults</p>
                <p className="text-2xl font-bold text-red-600">{stats.faults.open}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Role Requests ({pendingRequests.length} pending)
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">User Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <span className="text-slate-700">Students</span>
                </div>
                <span className="font-semibold">{stats.users.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  <span className="text-slate-700">Lecturers</span>
                </div>
                <span className="font-semibold">{stats.users.lecturers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Managers</span>
                </div>
                <span className="font-semibold">{stats.users.managers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <span className="text-slate-700">Admins</span>
                </div>
                <span className="font-semibold">{stats.users.admins}</span>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Pending Role Requests</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stats.pending_role_requests > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {stats.pending_role_requests}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Open Fault Reports</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${stats.faults.open > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {stats.faults.open}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Total Fault Reports</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {stats.faults.total}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Manager Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{u.email}</p>
                        <p className="text-sm text-slate-500">{u.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {getRoleIcon(u.role)}
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.manager_type ? (
                        <span className="text-sm text-slate-700 capitalize">{u.manager_type.replace('_', ' ')}</span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-700">{u.department || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-500">
                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Role Requests Tab */}
      {activeTab === 'requests' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Role Requests</h3>
          <div className="space-y-4">
            {roleRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No role requests found</p>
            ) : (
              roleRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{req.user_email}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Requesting role: <span className="font-semibold capitalize">{req.requested_role}</span>
                        {req.manager_type && (
                          <span className="ml-2">({req.manager_type.replace('_', ' ')})</span>
                        )}
                      </p>
                      {req.reason && (
                        <p className="text-sm text-slate-600 mb-2">
                          <span className="font-medium">Reason:</span> {req.reason}
                        </p>
                      )}
                      {req.rejection_reason && (
                        <p className="text-sm text-red-600 mb-2">
                          <span className="font-medium">Rejection reason:</span> {req.rejection_reason}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Requested: {new Date(req.requested_at).toLocaleString()}
                        {req.approved_at && ` • Approved: ${new Date(req.approved_at).toLocaleString()}`}
                        {req.approved_by && ` by ${req.approved_by}`}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):');
                            if (reason !== null) {
                              handleReject(req.id, reason);
                            }
                          }}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
