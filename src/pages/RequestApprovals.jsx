import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { Calendar, Clock, Users, BookOpen, FlaskConical, CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function RequestApprovals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [selectedRooms, setSelectedRooms] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [showApprovalDialog, setShowApprovalDialog] = useState(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(null);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch room requests
      const requestsRes = await fetch(`${API_BASE || ''}/api/room-requests/list`, { headers });
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }

      // Fetch available classrooms
      const classroomsRes = await fetch(`${API_BASE || ''}/api/classrooms/list`, { headers });
      if (classroomsRes.ok) {
        const classroomsData = await classroomsRes.json();
        setClassrooms(classroomsData.classrooms || []);
      }

      // Fetch available labs
      const labsRes = await fetch(`${API_BASE || ''}/api/labs/list`, { headers });
      if (labsRes.ok) {
        const labsData = await labsRes.json();
        setLabs(labsData.labs || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const roomId = selectedRooms[requestId];
    if (!roomId) {
      toast.error('Please select a room to assign');
      return;
    }

    setProcessing({ ...processing, [`approve-${requestId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/room-requests/${requestId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ room_id: parseInt(roomId) }),
      });

      if (res.ok) {
        toast.success('Room request approved!');
        setShowApprovalDialog(null);
        setSelectedRooms({ ...selectedRooms, [requestId]: '' });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessing({ ...processing, [`approve-${requestId}`]: false });
    }
  };

  const handleReject = async (requestId) => {
    const reason = rejectionReasons[requestId] || '';
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing({ ...processing, [`reject-${requestId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/room-requests/${requestId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejection_reason: reason }),
      });

      if (res.ok) {
        toast.success('Room request rejected');
        setShowRejectionDialog(null);
        setRejectionReasons({ ...rejectionReasons, [requestId]: '' });
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessing({ ...processing, [`reject-${requestId}`]: false });
    }
  };

  const getAvailableRooms = (request) => {
    // Return all rooms of the correct type, we'll indicate availability in the dropdown
    if (request.room_type === 'classroom') {
      return classrooms;
    } else {
      return labs;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Room Request Approvals</h1>
        <p className="text-slate-600">Review and approve/reject room requests from lecturers</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              const availableRooms = getAvailableRooms(req);
              return (
                <Card key={req.id} className="p-6 border-2 border-yellow-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {req.room_type === 'classroom' ? (
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        ) : (
                          <FlaskConical className="w-6 h-6 text-purple-600" />
                        )}
                        <h3 className="text-xl font-bold text-slate-900">
                          {req.room_type === 'classroom' ? 'Classroom' : 'Lab'} Request
                        </h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Requested By</p>
                          <p className="font-medium text-slate-900">{req.requested_by_name} ({req.requested_by})</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Purpose</p>
                          <p className="font-medium text-slate-900">{req.purpose}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Date</p>
                            <p className="font-medium text-slate-900">
                              {req.requested_date ? new Date(req.requested_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Time</p>
                            <p className="font-medium text-slate-900">
                              {req.start_time ? new Date(`2000-01-01T${req.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {req.end_time ? new Date(`2000-01-01T${req.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Expected Attendees</p>
                            <p className="font-medium text-slate-900">{req.expected_attendees}</p>
                          </div>
                        </div>
                      </div>

                      {/* Room Selection */}
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Select {req.room_type === 'classroom' ? 'Classroom' : 'Lab'} to Assign *
                        </label>
                        <select
                          value={selectedRooms[req.id] || ''}
                          onChange={(e) => setSelectedRooms({ ...selectedRooms, [req.id]: e.target.value })}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a room...</option>
                          {availableRooms.map(room => {
                            const isTooSmall = room.max_capacity < req.expected_attendees;
                            const isBusy = !room.is_available;
                            return (
                              <option key={room.id} value={room.id}>
                                {room.name} - {room.building} {room.room_number} 
                                (Cap: {room.max_capacity})
                                {isBusy ? ' [currently UNAVAILABLE]' : ''}
                                {isTooSmall ? ' [Too Small]' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      onClick={() => handleApprove(req.id)}
                      disabled={processing[`approve-${req.id}`] || !selectedRooms[req.id] || availableRooms.length === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processing[`approve-${req.id}`] ? 'Approving...' : 'Approve & Assign Room'}
                    </Button>
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Rejection reason (required)"
                        value={rejectionReasons[req.id] || ''}
                        onChange={(e) => setRejectionReasons({ ...rejectionReasons, [req.id]: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleReject(req.id)}
                        disabled={processing[`reject-${req.id}`] || !rejectionReasons[req.id]?.trim()}
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {processing[`reject-${req.id}`] ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Approved Requests ({approvedRequests.length})</h2>
          <div className="space-y-4">
            {approvedRequests.map((req) => (
              <Card key={req.id} className="p-6 border-2 border-green-200 bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {req.room_type === 'classroom' ? (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FlaskConical className="w-5 h-5 text-purple-600" />
                      )}
                      <h3 className="text-lg font-bold text-slate-900">{req.purpose}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Approved
                      </span>
                    </div>
                    {req.assigned_room && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-slate-900">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          <strong>Assigned:</strong> {req.assigned_room.name} - {req.assigned_room.building} Room {req.assigned_room.room_number}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          This room has been marked as unavailable
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-2">
                      Approved by {req.approved_by} on {req.approved_at ? new Date(req.approved_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Rejected Requests ({rejectedRequests.length})</h2>
          <div className="space-y-4">
            {rejectedRequests.map((req) => (
              <Card key={req.id} className="p-6 border-2 border-red-200 bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {req.room_type === 'classroom' ? (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FlaskConical className="w-5 h-5 text-purple-600" />
                      )}
                      <h3 className="text-lg font-bold text-slate-900">{req.purpose}</h3>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Rejected
                      </span>
                    </div>
                    {req.rejection_reason && (
                      <div className="mt-2 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-red-900">
                          <strong>Reason:</strong> {req.rejection_reason}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 mt-2">
                      Rejected by {req.approved_by} on {req.approved_at ? new Date(req.approved_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No room requests found</p>
        </Card>
      )}
    </div>
  );
}
