import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { Calendar, Clock, Users, BookOpen, FlaskConical, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function RoomRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    room_type: 'classroom',
    room_id: '',
    purpose: '',
    expected_attendees: 1,
    requested_date: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const requestData = {
        ...newRequest,
        room_id: newRequest.room_id || null, // Optional room selection
      };

      const res = await fetch(`${API_BASE || ''}/api/room-requests/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        toast.success('Room request submitted successfully!');
        setNewRequest({
          room_type: 'classroom',
          room_id: '',
          purpose: '',
          expected_attendees: 1,
          requested_date: '',
          start_time: '',
          end_time: '',
        });
        setShowForm(false);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const availableRooms = newRequest.room_type === 'classroom' 
    ? classrooms.filter(c => c.is_available && c.max_capacity >= newRequest.expected_attendees)
    : labs.filter(l => l.is_available && l.max_capacity >= newRequest.expected_attendees);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Room Requests</h1>
          <p className="text-slate-600">Request a classroom or lab for your teaching needs</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Request Form */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Room Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Type *
                </label>
                <select
                  value={newRequest.room_type}
                  onChange={(e) => setNewRequest({ ...newRequest, room_type: e.target.value, room_id: '' })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Room (Optional)
                </label>
                <select
                  value={newRequest.room_id}
                  onChange={(e) => setNewRequest({ ...newRequest, room_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any available room</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.building} Room {room.room_number} (Capacity: {room.max_capacity})
                    </option>
                  ))}
                </select>
                {availableRooms.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No available {newRequest.room_type}s with sufficient capacity</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purpose / Course Name *
                </label>
                <Input
                  type="text"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Attendees *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={newRequest.expected_attendees}
                  onChange={(e) => setNewRequest({ ...newRequest, expected_attendees: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Requested Date *
                </label>
                <Input
                  type="date"
                  value={newRequest.requested_date}
                  onChange={(e) => setNewRequest({ ...newRequest, requested_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={newRequest.start_time}
                  onChange={(e) => setNewRequest({ ...newRequest, start_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={newRequest.end_time}
                  onChange={(e) => setNewRequest({ ...newRequest, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setNewRequest({
                    room_type: 'classroom',
                    room_id: '',
                    purpose: '',
                    expected_attendees: 1,
                    requested_date: '',
                    start_time: '',
                    end_time: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* My Requests List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">My Requests</h2>
        {requests.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No room requests yet</p>
            <p className="text-slate-400 text-sm mt-2">Click "New Request" to create one</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className={`p-6 border-2 ${getStatusColor(req.status)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {req.room_type === 'classroom' ? (
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      ) : (
                        <FlaskConical className="w-6 h-6 text-purple-600" />
                      )}
                      <h3 className="text-xl font-bold text-slate-900">
                        {req.room_type === 'classroom' ? 'Classroom' : 'Lab'} Request
                      </h3>
                    </div>
                    <p className="text-slate-700 mb-2"><strong>Purpose:</strong> {req.purpose}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Date:</strong> {req.requested_date ? new Date(req.requested_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Time:</strong> {req.start_time ? new Date(`2000-01-01T${req.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {req.end_time ? new Date(`2000-01-01T${req.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Attendees:</strong> {req.expected_attendees}
                        </span>
                      </div>
                    </div>
                    {req.assigned_room && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          <strong>Assigned Room:</strong> {req.assigned_room.name} - {req.assigned_room.building} Room {req.assigned_room.room_number}
                        </p>
                      </div>
                    )}
                    {req.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-900">
                          <strong>Rejection Reason:</strong> {req.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {req.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
