import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import {
  BookOpen, FlaskConical, AlertTriangle, Plus, ArrowRight,
  Users, CheckCircle, Clock, XCircle, GraduationCap,
  Edit2, Save, X, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [labs, setLabs] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLab, setEditingLab] = useState(null);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [updating, setUpdating] = useState({});
  const [labInputs, setLabInputs] = useState({});
  const [classroomInputs, setClassroomInputs] = useState({});
  const [roomRequests, setRoomRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch library status
      try {
        const libRes = await fetch(`${API_BASE || ''}/api/library/status`, { headers });
        if (libRes.ok) {
          const libData = await libRes.json();
          setLibraryStatus(libData);
        }
      } catch (e) {
        console.error('Failed to fetch library status:', e);
      }

      // Fetch labs
      try {
        const labsRes = await fetch(`${API_BASE || ''}/api/labs/list`, { headers });
        if (labsRes.ok) {
          const labsData = await labsRes.json();
          setLabs(labsData.labs || []);
        }
      } catch (e) {
        console.error('Failed to fetch labs:', e);
      }

      // Fetch classrooms
      try {
        const classroomsRes = await fetch(`${API_BASE || ''}/api/classrooms/list`, { headers });
        if (classroomsRes.ok) {
          const classroomsData = await classroomsRes.json();
          setClassrooms(classroomsData.classrooms || []);
        }
      } catch (e) {
        console.error('Failed to fetch classrooms:', e);
      }

      // Fetch faults (only for students/lecturers - their own reports)
      if (user?.role === 'student' || user?.role === 'lecturer') {
        try {
          const faultsRes = await fetch(`${API_BASE || ''}/api/faults/list`, { headers });
          if (faultsRes.ok) {
            const faultsData = await faultsRes.json();
            const myFaults = (faultsData.faults || []).filter(f => f.reported_by === user?.email);
            setFaults(myFaults);
          } else if (faultsRes.status !== 404) {
            // Only log if it's not a 404 (which just means no reports)
            console.error('Failed to fetch faults:', faultsRes.status);
          }
        } catch (e) {
          // Silently handle network errors - don't show toast
          console.error('Failed to fetch faults:', e);
        }
      } else {
        // For managers/admins, fetch all faults
        try {
          const faultsRes = await fetch(`${API_BASE || ''}/api/faults/list`, { headers });
          if (faultsRes.ok) {
            const faultsData = await faultsRes.json();
            setFaults(faultsData.faults || []);
          } else if (faultsRes.status !== 404) {
            // Only log if it's not a 404 (which just means no reports)
            console.error('Failed to fetch faults:', faultsRes.status);
          }
        } catch (e) {
          // Silently handle network errors - don't show toast
          console.error('Failed to fetch faults:', e);
        }
      }

      // Fetch room requests
      if (user?.role === 'lecturer' || user?.role === 'manager' || user?.role === 'admin') {
        try {
          const roomRequestsRes = await fetch(`${API_BASE || ''}/api/room-requests/list`, { headers });
          if (roomRequestsRes.ok) {
            const rrData = await roomRequestsRes.json();
            setRoomRequests(rrData.requests || []);
          }
        } catch (e) {
          console.error('Failed to fetch room requests:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const myFaults = faults.filter(f => f.reported_by === user?.email);
  const openFaults = faults.filter(f => ['open', 'in_progress'].includes(f.status));
  const availableLabs = labs.filter(l => l.is_available && l.current_occupancy < l.max_capacity);
  const availableClassrooms = classrooms.filter(c => c.is_available && c.current_occupancy < c.max_capacity);

  // For students, show a simplified dashboard
  const isStudent = user?.role === 'student';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const handleLabEdit = (lab) => {
    setEditingLab(lab.id);
    setLabInputs({
      [lab.id]: {
        current_occupancy: lab.current_occupancy,
        is_available: lab.is_available,
      }
    });
  };

  const handleLabCancel = () => {
    setEditingLab(null);
    setLabInputs({});
  };

  const handleLabSave = async (labId) => {
    setUpdating({ ...updating, [`lab-${labId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const input = labInputs[labId];
      const res = await fetch(`${API_BASE || ''}/api/labs/${labId}/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_occupancy: input.current_occupancy,
          is_available: input.is_available,
        }),
      });

      if (res.ok) {
        toast.success('Lab updated successfully!');
        setEditingLab(null);
        setLabInputs({});
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update lab');
      }
    } catch (error) {
      console.error('Failed to update lab:', error);
      toast.error('Failed to update lab');
    } finally {
      setUpdating({ ...updating, [`lab-${labId}`]: false });
    }
  };

  const handleClassroomEdit = (classroom) => {
    setEditingClassroom(classroom.id);
    setClassroomInputs({
      [classroom.id]: {
        current_occupancy: classroom.current_occupancy,
        is_available: classroom.is_available,
      }
    });
  };

  const handleClassroomCancel = () => {
    setEditingClassroom(null);
    setClassroomInputs({});
  };

  const handleClassroomSave = async (classroomId) => {
    setUpdating({ ...updating, [`classroom-${classroomId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const input = classroomInputs[classroomId];
      const res = await fetch(`${API_BASE || ''}/api/classrooms/${classroomId}/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_occupancy: input.current_occupancy,
          is_available: input.is_available,
        }),
      });

      if (res.ok) {
        toast.success('Classroom updated successfully!');
        setEditingClassroom(null);
        setClassroomInputs({});
        fetchDashboardData();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update classroom');
      }
    } catch (error) {
      console.error('Failed to update classroom:', error);
      toast.error('Failed to update classroom');
    } finally {
      setUpdating({ ...updating, [`classroom-${classroomId}`]: false });
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          Welcome back, <span className="font-semibold">{user?.email}</span>!
          Your role: <span className="font-semibold capitalize">{user?.role || 'student'}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className={`grid grid-cols-1 ${isStudent ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Library Occupancy</p>
              <p className="text-2xl font-bold text-slate-900">
                {libraryStatus ? `${libraryStatus.current_occupancy}/${libraryStatus.max_capacity}` : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {libraryStatus && libraryStatus.is_open ? 'Open' : 'Closed'}
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Available Labs</p>
              <p className="text-2xl font-bold text-slate-900">{availableLabs.length}</p>
              <p className="text-xs text-slate-500 mt-1">out of {labs.length} labs</p>
            </div>
            <FlaskConical className="w-12 h-12 text-purple-500" />
          </div>
        </Card>

        {isStudent && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Available Classrooms</p>
                <p className="text-2xl font-bold text-slate-900">{availableClassrooms.length}</p>
                <p className="text-xs text-slate-500 mt-1">out of {classrooms.length} classrooms</p>
              </div>
              <GraduationCap className="w-12 h-12 text-green-500" />
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">
                {isStudent ? 'My Reports' : 'Open Fault Reports'}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isStudent ? myFaults.length : openFaults.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isStudent ? 'total reports' : `total: ${faults.length}`}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
        </Card>

        {(user?.role === 'student' || user?.role === 'lecturer' || user?.role === 'manager' || user?.role === 'admin') && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  {user?.role === 'lecturer' ? 'My Room Requests' : 'Pending Approvals'}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {user?.role === 'lecturer'
                    ? roomRequests.filter(r => r.requested_by === user?.email).length
                    : roomRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {user?.role === 'lecturer' ? 'total submitted' : 'pending review'}
                </p>
              </div>
              <Calendar className={`w-12 h-12 ${user?.role === 'lecturer' ? 'text-blue-500' : 'text-yellow-500'}`} />
            </div>
          </Card>
        )}
      </div>

      {/* Library Status Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900">Library Status</h2>
          </div>
          <Link to="/library-status">
            <Button variant="outline" size="sm">
              View Details <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        {libraryStatus ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Current Occupancy</span>
              <span className="font-semibold">
                {libraryStatus.current_occupancy} / {libraryStatus.max_capacity}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((libraryStatus.current_occupancy / libraryStatus.max_capacity) * 100, 100)}%`
                }}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${libraryStatus.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-600">
                {libraryStatus.is_open ? 'Library is open' : 'Library is closed'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">No library data available</p>
        )}
      </Card>

      {/* Lab Availability Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-slate-900">Lab Availability</h2>
          </div>
          <Link to="/find-labs">
            <Button variant="outline" size="sm">
              View All Labs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        {labs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.slice(0, 6).map((lab) => {
              const isEditing = editingLab === lab.id;
              const input = labInputs[lab.id] || { current_occupancy: lab.current_occupancy, is_available: lab.is_available };

              return (
                <div key={lab.id} className={`border rounded-lg p-4 ${lab.is_available && lab.current_occupancy < lab.max_capacity ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{lab.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${lab.is_available && lab.current_occupancy < lab.max_capacity ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {isManager && !isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLabEdit(lab)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {lab.building} Room {lab.room_number}
                  </p>

                  {isEditing && isManager ? (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Occupancy
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={lab.max_capacity}
                          value={input.current_occupancy}
                          onChange={(e) => setLabInputs({
                            ...labInputs,
                            [lab.id]: { ...input, current_occupancy: parseInt(e.target.value) || 0 }
                          })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={input.is_available}
                          onChange={(e) => setLabInputs({
                            ...labInputs,
                            [lab.id]: { ...input, is_available: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label className="text-xs text-slate-700">Available</label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLabSave(lab.id)}
                          disabled={updating[`lab-${lab.id}`]}
                          className="flex-1 h-7 text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleLabCancel}
                          className="h-7 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {lab.current_occupancy} / {lab.max_capacity}
                        </span>
                        <span className={`font-medium ${lab.current_occupancy >= lab.max_capacity * 0.8 ? 'text-red-600' : lab.current_occupancy >= lab.max_capacity * 0.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {lab.occupancy_percentage}% full
                        </span>
                      </div>
                      {lab.current_occupancy >= lab.max_capacity * 0.8 && (
                        <p className="text-xs text-red-600 mt-2 font-medium">Very Busy</p>
                      )}
                      {lab.current_occupancy < lab.max_capacity * 0.5 && lab.is_available && (
                        <p className="text-xs text-green-600 mt-2 font-medium">Good to Go</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500">No labs available at the moment</p>
        )}
      </Card>

      {/* Classroom Availability Section - For Students and Managers */}
      {(isStudent || isManager) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-slate-900">Classroom Availability</h2>
            </div>
            {isManager && (
              <Link to="/classrooms">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
          {classrooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.slice(0, 6).map((classroom) => {
                const isEditing = editingClassroom === classroom.id;
                const input = classroomInputs[classroom.id] || { current_occupancy: classroom.current_occupancy, is_available: classroom.is_available };

                return (
                  <div key={classroom.id} className={`border rounded-lg p-4 ${classroom.is_available && classroom.current_occupancy < classroom.max_capacity ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{classroom.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${classroom.is_available && classroom.current_occupancy < classroom.max_capacity ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {isManager && !isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClassroomEdit(classroom)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {classroom.building} Room {classroom.room_number}
                    </p>

                    {isEditing && isManager ? (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Occupancy
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={classroom.max_capacity}
                            value={input.current_occupancy}
                            onChange={(e) => setClassroomInputs({
                              ...classroomInputs,
                              [classroom.id]: { ...input, current_occupancy: parseInt(e.target.value) || 0 }
                            })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={input.is_available}
                            onChange={(e) => setClassroomInputs({
                              ...classroomInputs,
                              [classroom.id]: { ...input, is_available: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <label className="text-xs text-slate-700">Available</label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleClassroomSave(classroom.id)}
                            disabled={updating[`classroom-${classroom.id}`]}
                            className="flex-1 h-7 text-xs"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleClassroomCancel}
                            className="h-7 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {classroom.current_occupancy} / {classroom.max_capacity}
                          </span>
                          <span className={`font-medium ${classroom.current_occupancy >= classroom.max_capacity * 0.8 ? 'text-red-600' : classroom.current_occupancy >= classroom.max_capacity * 0.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {classroom.occupancy_percentage}% full
                          </span>
                        </div>
                        {classroom.current_occupancy >= classroom.max_capacity * 0.8 && (
                          <p className="text-xs text-red-600 mt-2 font-medium">Very Busy</p>
                        )}
                        {classroom.current_occupancy < classroom.max_capacity * 0.5 && classroom.is_available && (
                          <p className="text-xs text-green-600 mt-2 font-medium">Good to Go</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">No classrooms available at the moment</p>
          )}
        </Card>
      )}

      {/* Fault Reports Section - For Students/Lecturers */}
      {(isStudent || user?.role === 'lecturer') && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-slate-900">My Fault Reports</h2>
            </div>
            <Link to="/report-fault">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Report Fault
              </Button>
            </Link>
          </div>
          {myFaults.length > 0 ? (
            <div className="space-y-3">
              {myFaults.slice(0, 5).map((fault) => (
                <div key={fault.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{fault.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fault.status)}`}>
                          {fault.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(fault.severity)}`}>
                          {fault.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{fault.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{fault.building} Room {fault.room_number}</span>
                        <span>{fault.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No fault reports yet</p>
              <Link to="/report-fault">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Report Your First Fault
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* All Fault Reports Section - For Managers/Admins */}
      {(user?.role === 'manager' || user?.role === 'admin') && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-slate-900">All Fault Reports</h2>
            </div>
            <Link to="/fault-management">
              <Button variant="outline" size="sm">
                Manage All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          {faults.length > 0 ? (
            <div className="space-y-3">
              {faults.slice(0, 5).map((fault) => (
                <div key={fault.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{fault.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fault.status)}`}>
                          {fault.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(fault.severity)}`}>
                          {fault.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{fault.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{fault.building} Room {fault.room_number}</span>
                        <span>{fault.category}</span>
                        <span>Reported by: {fault.reporter_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No fault reports yet</p>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isStudent ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-4`}>
          <Link to="/library-status">
            <Card className="p-4 hover:bg-slate-50 cursor-pointer transition">
              <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-slate-900">Library Status</h3>
              <p className="text-sm text-slate-600">View & update library</p>
            </Card>
          </Link>
          <Link to="/find-labs">
            <Card className="p-4 hover:bg-slate-50 cursor-pointer transition">
              <FlaskConical className="w-6 h-6 text-purple-500 mb-2" />
              <h3 className="font-semibold text-slate-900">Find Labs</h3>
              <p className="text-sm text-slate-600">Check lab availability</p>
            </Card>
          </Link>
          {(isStudent || isManager) && (
            <Link to="/classrooms">
              <Card className="p-4 hover:bg-slate-50 cursor-pointer transition">
                <GraduationCap className="w-6 h-6 text-green-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Classrooms</h3>
                <p className="text-sm text-slate-600">View classrooms</p>
              </Card>
            </Link>
          )}
          {(user?.role === 'student' || user?.role === 'lecturer') && (
            <Link to="/report-fault">
              <Card className="p-4 hover:bg-slate-50 cursor-pointer transition border-2 border-orange-200">
                <Plus className="w-6 h-6 text-orange-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Report Fault</h3>
                <p className="text-sm text-slate-600">Report an issue</p>
              </Card>
            </Link>
          )}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <Link to="/fault-management">
              <Card className="p-4 hover:bg-slate-50 cursor-pointer transition">
                <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Manage Faults</h3>
                <p className="text-sm text-slate-600">View all reports</p>
              </Card>
            </Link>
          )}
          {(user?.role === 'student' || user?.role === 'lecturer') && (
            <Link to="/room-requests">
              <Card className="p-4 hover:bg-slate-50 cursor-pointer transition border-2 border-blue-200">
                <Calendar className="w-6 h-6 text-blue-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Room Requests</h3>
                <p className="text-sm text-slate-600">Request a room</p>
              </Card>
            </Link>
          )}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <Link to="/request-approvals">
              <Card className="p-4 hover:bg-slate-50 cursor-pointer transition border-2 border-yellow-200">
                <CheckCircle className="w-6 h-6 text-yellow-500 mb-2" />
                <h3 className="font-semibold text-slate-900">Room Approvals</h3>
                <p className="text-sm text-slate-600">Review requests</p>
              </Card>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
