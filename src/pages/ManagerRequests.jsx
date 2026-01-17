import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { CheckCircle, XCircle, Clock, BookOpen, FlaskConical, User, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function ManagerRequests() {
  const { user } = useAuth();
  const [pendingUpdates, setPendingUpdates] = useState({ library_requests: [], lab_requests: [] });
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});

  // Check if user is manager or admin
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    if (isManagerOrAdmin) {
      fetchPendingUpdates();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingUpdates, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isManagerOrAdmin]);

  const fetchPendingUpdates = async () => {
    if (!isManagerOrAdmin) return;

    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch Update Requests (Labs/Library)
      const res = await fetch(`${API_BASE || ''}/api/updates/pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingUpdates(data);
      }

      // Fetch Role Requests (New Users)
      const roleRes = await fetch(`${API_BASE || ''}/api/admin/role-requests`, { headers });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        // Filter only pending requests
        setRoleRequests(roleData.requests.filter(r => r.status === 'pending') || []);
      }

    } catch (error) {
      console.error('Failed to fetch pending updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAction = async (action, requestId, reason = '') => {
    setProcessing({ ...processing, [`role-${requestId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const body = action === 'reject' ? JSON.stringify({ rejection_reason: reason }) : null;

      const res = await fetch(`${API_BASE || ''}/api/admin/role-requests/${requestId}/${endpoint}`, {
        method: 'POST',
        headers,
        body
      });

      if (res.ok) {
        toast.success(`Role request ${action}d!`);
        setRejectionReasons({ ...rejectionReasons, [`role-${requestId}`]: '' });
        fetchPendingUpdates();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessing({ ...processing, [`role-${requestId}`]: false });
    }
  };

  const handleApprove = async (type, requestId) => {
    setProcessing({ ...processing, [`${type}-${requestId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/updates/${type}/${requestId}/approve`, {
        method: 'POST',
        headers,
      });

      if (res.ok) {
        toast.success('Update approved successfully!');
        fetchPendingUpdates();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to approve update');
      }
    } catch (error) {
      console.error('Failed to approve update:', error);
      toast.error('Failed to approve update');
    } finally {
      setProcessing({ ...processing, [`${type}-${requestId}`]: false });
    }
  };

  const handleReject = async (type, requestId) => {
    const reason = rejectionReasons[`${type}-${requestId}`] || '';
    setProcessing({ ...processing, [`${type}-${requestId}-reject`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/updates/${type}/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejection_reason: reason }),
      });

      if (res.ok) {
        toast.success('Update rejected');
        setRejectionReasons({ ...rejectionReasons, [`${type}-${requestId}`]: '' });
        fetchPendingUpdates();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to reject update');
      }
    } catch (error) {
      console.error('Failed to reject update:', error);
      toast.error('Failed to reject update');
    } finally {
      setProcessing({ ...processing, [`${type}-${requestId}-reject`]: false });
    }
  };

  const totalPendingUpdates = pendingUpdates.library_requests?.length + pendingUpdates.lab_requests?.length || 0;
  const totalRoleRequests = roleRequests.length;
  const totalPending = totalPendingUpdates + totalRoleRequests;

  // Show access denied if user is not manager/admin
  if (!isManagerOrAdmin) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You need manager or admin privileges to view pending update requests.</p>
          <p className="text-sm text-slate-500">Only managers and admins can approve/reject library and lab status updates.</p>
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pending Update Requests</h1>
        <p className="text-slate-600">Review and approve/reject updates to library and lab status</p>
      </div>

      {/* Summary Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {totalPending} Pending {totalPending === 1 ? 'Request' : 'Requests'}
              </h2>
              <p className="text-sm text-slate-600">
                {pendingUpdates.library_requests?.length || 0} library, {pendingUpdates.lab_requests?.length || 0} lab, {roleRequests.length} user roles
              </p>
            </div>
          </div>
        </div>
      </Card>

      {totalPending === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No pending update requests</p>
          <p className="text-slate-400 text-sm mt-2">All updates have been processed</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Role Requests */}
          {roleRequests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                New User Enrollments ({roleRequests.length})
              </h2>
              <div className="space-y-4">
                {roleRequests.map((req) => (
                  <Card key={req.id} className="p-6 border-2 border-green-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-bold text-slate-900">{req.user_email}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          Requesting Role: <span className="font-bold uppercase text-blue-600">{req.requested_role}</span>
                          {req.manager_type && (
                            <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded text-xs">({req.manager_type})</span>
                          )}
                        </p>
                        {req.reason && (
                          <p className="text-sm text-slate-500 italic">" {req.reason} "</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                          <Calendar className="w-4 h-4" />
                          <span>Requested: {new Date(req.requested_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending Approval
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleRoleAction('approve', req.id)}
                        disabled={processing[`role-${req.id}`]}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing[`role-${req.id}`] ? 'Approving...' : 'Approve User'}
                      </Button>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          placeholder="Rejection reason (optional)"
                          value={rejectionReasons[`role-${req.id}`] || ''}
                          onChange={(e) => setRejectionReasons({ ...rejectionReasons, [`role-${req.id}`]: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleRoleAction('reject', req.id, rejectionReasons[`role-${req.id}`])}
                          disabled={processing[`role-${req.id}`]}
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Library Update Requests */}
          {pendingUpdates.library_requests?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Library Update Requests ({pendingUpdates.library_requests.length})
              </h2>
              <div className="space-y-4">
                {pendingUpdates.library_requests.map((req) => (
                  <Card key={req.id} className="p-6 border-2 border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-bold text-slate-900">{req.library_name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                          <User className="w-4 h-4" />
                          <span>{req.requested_by_name} ({req.requested_by})</span>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(req.requested_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-600 mb-2">Current Status</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Occupancy:</span> {req.current_occupancy}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            {req.current_is_open ? (
                              <span className="text-green-600">Open</span>
                            ) : (
                              <span className="text-red-600">Closed</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-medium text-blue-700 mb-2">Requested Change</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Occupancy:</span>{' '}
                            <span className={req.requested_occupancy !== req.current_occupancy ? 'text-blue-600 font-bold' : ''}>
                              {req.requested_occupancy}
                            </span>
                            {req.requested_occupancy !== req.current_occupancy && (
                              <span className="text-xs ml-1">
                                ({req.requested_occupancy > req.current_occupancy ? '+' : ''}
                                {req.requested_occupancy - req.current_occupancy})
                              </span>
                            )}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            {req.requested_is_open ? (
                              <span className={req.requested_is_open !== req.current_is_open ? 'text-green-600 font-bold' : 'text-green-600'}>
                                Open
                              </span>
                            ) : (
                              <span className={req.requested_is_open !== req.current_is_open ? 'text-red-600 font-bold' : 'text-red-600'}>
                                Closed
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleApprove('library', req.id)}
                        disabled={processing[`library-${req.id}`]}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing[`library-${req.id}`] ? 'Approving...' : 'Approve'}
                      </Button>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          placeholder="Rejection reason (optional)"
                          value={rejectionReasons[`library-${req.id}`] || ''}
                          onChange={(e) => setRejectionReasons({ ...rejectionReasons, [`library-${req.id}`]: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleReject('library', req.id)}
                          disabled={processing[`library-${req.id}-reject`]}
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {processing[`library-${req.id}-reject`] ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Lab Update Requests */}
          {pendingUpdates.lab_requests?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FlaskConical className="w-6 h-6" />
                Lab Update Requests ({pendingUpdates.lab_requests.length})
              </h2>
              <div className="space-y-4">
                {pendingUpdates.lab_requests.map((req) => (
                  <Card key={req.id} className="p-6 border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FlaskConical className="w-5 h-5 text-purple-600" />
                          <h3 className="text-lg font-bold text-slate-900">{req.lab_name}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {req.building} Room {req.room_number}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                          <User className="w-4 h-4" />
                          <span>{req.requested_by_name} ({req.requested_by})</span>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(req.requested_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-slate-600 mb-2">Current Status</p>
                        <div className="space-y-1">
                          {req.requested_occupancy !== null && (
                            <p className="text-sm">
                              <span className="font-medium">Occupancy:</span> {req.current_occupancy}
                            </p>
                          )}
                          {req.requested_is_available !== null && (
                            <p className="text-sm">
                              <span className="font-medium">Status:</span>{' '}
                              {req.current_is_available ? (
                                <span className="text-green-600">Available</span>
                              ) : (
                                <span className="text-red-600">Unavailable</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                        <p className="text-sm font-medium text-purple-700 mb-2">Requested Change</p>
                        <div className="space-y-1">
                          {req.requested_occupancy !== null && (
                            <p className="text-sm">
                              <span className="font-medium">Occupancy:</span>{' '}
                              <span className={req.requested_occupancy !== req.current_occupancy ? 'text-purple-600 font-bold' : ''}>
                                {req.requested_occupancy}
                              </span>
                              {req.requested_occupancy !== req.current_occupancy && (
                                <span className="text-xs ml-1">
                                  ({req.requested_occupancy > req.current_occupancy ? '+' : ''}
                                  {req.requested_occupancy - req.current_occupancy})
                                </span>
                              )}
                            </p>
                          )}
                          {req.requested_is_available !== null && (
                            <p className="text-sm">
                              <span className="font-medium">Status:</span>{' '}
                              {req.requested_is_available ? (
                                <span className={req.requested_is_available !== req.current_is_available ? 'text-green-600 font-bold' : 'text-green-600'}>
                                  Available
                                </span>
                              ) : (
                                <span className={req.requested_is_available !== req.current_is_available ? 'text-red-600 font-bold' : 'text-red-600'}>
                                  Unavailable
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleApprove('lab', req.id)}
                        disabled={processing[`lab-${req.id}`]}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processing[`lab-${req.id}`] ? 'Approving...' : 'Approve'}
                      </Button>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="text"
                          placeholder="Rejection reason (optional)"
                          value={rejectionReasons[`lab-${req.id}`] || ''}
                          onChange={(e) => setRejectionReasons({ ...rejectionReasons, [`lab-${req.id}`]: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleReject('lab', req.id)}
                          disabled={processing[`lab-${req.id}-reject`]}
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {processing[`lab-${req.id}-reject`] ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
