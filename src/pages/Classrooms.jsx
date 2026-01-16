import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { GraduationCap, Users, CheckCircle, XCircle, AlertCircle, Plus, Search, MapPin, Filter, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function Classrooms() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [occupancyInputs, setOccupancyInputs] = useState({});
  const [availableInputs, setAvailableInputs] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showBuildingFilter, setShowBuildingFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    building: '',
    room_number: '',
    max_capacity: 50,
    current_occupancy: 0,
    is_available: true,
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    // Initialize inputs when classrooms are loaded
    const inputs = {};
    const availables = {};
    classrooms.forEach(c => {
      inputs[c.id] = c.current_occupancy;
      availables[c.id] = c.is_available;
    });
    setOccupancyInputs(inputs);
    setAvailableInputs(availables);
  }, [classrooms]);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/classrooms/list`, { headers });
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
      toast.error('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClassroom = async (e) => {
    e?.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/classrooms/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newClassroom),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Classroom added successfully!');
        setNewClassroom({
          name: '',
          building: '',
          room_number: '',
          max_capacity: 50,
          current_occupancy: 0,
          is_available: true,
        });
        setShowAddForm(false);
        fetchClassrooms();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add classroom');
      }
    } catch (error) {
      console.error('Failed to add classroom:', error);
      toast.error('Failed to add classroom');
    } finally {
      setCreating(false);
    }
  };

  const updateOccupancy = async (classroomId, newOccupancy, isAvailable) => {
    setUpdating({ ...updating, [classroomId]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/classrooms/${classroomId}/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_occupancy: newOccupancy,
          is_available: isAvailable,
        }),
      });

      if (res.ok) {
        toast.success('Classroom status updated!');
        fetchClassrooms();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update classroom');
      }
    } catch (error) {
      console.error('Failed to update classroom:', error);
      toast.error('Failed to update classroom');
    } finally {
      setUpdating({ ...updating, [classroomId]: false });
    }
  };

  const getStatusColor = (occupancy, maxCapacity, isAvailable) => {
    if (!isAvailable) return 'bg-red-100 text-red-800 border-red-200';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (occupancy, maxCapacity, isAvailable) => {
    if (!isAvailable) return 'Unavailable';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 80) return 'Very Busy';
    if (percentage >= 50) return 'Moderate';
    return 'Good to Go';
  };

  const getOccupancyStatus = (occupancy, maxCapacity, isAvailable) => {
    if (!isAvailable) return 'Occupied/Full';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 100) return 'Occupied/Full';
    if (percentage >= 50) return 'Partially Booked';
    return 'Available';
  };

  // Get unique buildings
  const buildings = ['All Buildings', ...new Set(classrooms.map(c => c.building).filter(Boolean))];

  // Filter classrooms
  const filteredClassrooms = classrooms.filter(classroom => {
    // Search filter
    const matchesSearch = !searchTerm || 
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    // Building filter
    const matchesBuilding = selectedBuilding === 'All Buildings' || classroom.building === selectedBuilding;

    // Status filter
    const status = getOccupancyStatus(classroom.current_occupancy, classroom.max_capacity, classroom.is_available);
    const matchesStatus = selectedStatus === 'All Status' || status === selectedStatus;

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: classrooms.length,
    available: classrooms.filter(c => getOccupancyStatus(c.current_occupancy, c.max_capacity, c.is_available) === 'Available').length,
    partiallyBooked: classrooms.filter(c => getOccupancyStatus(c.current_occupancy, c.max_capacity, c.is_available) === 'Partially Booked').length,
    full: classrooms.filter(c => getOccupancyStatus(c.current_occupancy, c.max_capacity, c.is_available) === 'Occupied/Full').length,
    overloaded: classrooms.filter(c => {
      const percentage = (c.current_occupancy / c.max_capacity) * 100;
      return percentage > 100;
    }).length,
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

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Classrooms</h1>
          <p className="text-slate-600">View and update classroom occupancy status</p>
        </div>
        {isManager && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Classroom'}
          </Button>
        )}
      </div>

      {/* Add Classroom Form for Managers */}
      {isManager && showAddForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Classroom
          </h2>
          <form onSubmit={handleAddClassroom} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Classroom Name *
                </label>
                <Input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  placeholder="e.g., Lecture Hall A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Building *
                </label>
                <Input
                  type="text"
                  value={newClassroom.building}
                  onChange={(e) => setNewClassroom({ ...newClassroom, building: e.target.value })}
                  placeholder="e.g., Building A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number *
                </label>
                <Input
                  type="text"
                  value={newClassroom.room_number}
                  onChange={(e) => setNewClassroom({ ...newClassroom, room_number: e.target.value })}
                  placeholder="e.g., 101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Capacity *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={newClassroom.max_capacity}
                  onChange={(e) => setNewClassroom({ ...newClassroom, max_capacity: parseInt(e.target.value) || 50 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Occupancy
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newClassroom.current_occupancy}
                  onChange={(e) => setNewClassroom({ ...newClassroom, current_occupancy: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newClassroom.is_available}
                    onChange={(e) => setNewClassroom({ ...newClassroom, is_available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Available</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creating ? 'Adding...' : 'Add Classroom'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewClassroom({
                    name: '',
                    building: '',
                    room_number: '',
                    max_capacity: 50,
                    current_occupancy: 0,
                    is_available: true,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search rooms or buildings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Building Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowBuildingFilter(!showBuildingFilter);
                setShowStatusFilter(false);
              }}
              className="flex items-center gap-2 min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{selectedBuilding}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showBuildingFilter && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {buildings.map((building) => (
                  <button
                    key={building}
                    onClick={() => {
                      setSelectedBuilding(building);
                      setShowBuildingFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 ${
                      selectedBuilding === building ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {selectedBuilding === building && <CheckCircle className="w-4 h-4" />}
                    <span>{building}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusFilter(!showStatusFilter);
                setShowBuildingFilter(false);
              }}
              className="flex items-center gap-2 min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>{selectedStatus}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showStatusFilter && (
              <div className="absolute top-full right-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                {['All Status', 'Available', 'Partially Booked', 'Occupied/Full'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowStatusFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 ${
                      selectedStatus === status ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {selectedStatus === status && <CheckCircle className="w-4 h-4" />}
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Total</p>
            <p className="text-lg font-bold text-slate-900">{stats.total}</p>
          </div>
          <div>
            <p className="text-slate-600">Available</p>
            <p className="text-lg font-bold text-green-600">{stats.available}</p>
          </div>
          <div>
            <p className="text-slate-600">Partially Booked</p>
            <p className="text-lg font-bold text-yellow-600">{stats.partiallyBooked}</p>
          </div>
          <div>
            <p className="text-slate-600">Full</p>
            <p className="text-lg font-bold text-red-600">{stats.full}</p>
          </div>
          <div>
            <p className="text-slate-600">Overloaded</p>
            <p className="text-lg font-bold text-red-700">{stats.overloaded}</p>
          </div>
        </div>
      </Card>

      {/* Close dropdowns when clicking outside */}
      {(showBuildingFilter || showStatusFilter) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowBuildingFilter(false);
            setShowStatusFilter(false);
          }}
        />
      )}

      {filteredClassrooms.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            {classrooms.length === 0 ? 'No classrooms available' : 'No classrooms match your filters'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => {
            const percentage = (classroom.current_occupancy / classroom.max_capacity) * 100;

            return (
              <Card key={classroom.id} className={`p-6 border-2 ${getStatusColor(classroom.current_occupancy, classroom.max_capacity, classroom.is_available)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{classroom.name}</h3>
                    <p className="text-sm text-slate-600">
                      {classroom.building} Room {classroom.room_number}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${classroom.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Occupancy</span>
                      <span className="text-sm font-bold">
                        {classroom.current_occupancy} / {classroom.max_capacity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${
                          percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        {getStatusText(classroom.current_occupancy, classroom.max_capacity, classroom.is_available)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        getOccupancyStatus(classroom.current_occupancy, classroom.max_capacity, classroom.is_available) === 'Available' 
                          ? 'bg-green-100 text-green-700' 
                          : getOccupancyStatus(classroom.current_occupancy, classroom.max_capacity, classroom.is_available) === 'Partially Booked'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getOccupancyStatus(classroom.current_occupancy, classroom.max_capacity, classroom.is_available)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Update Occupancy
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="number"
                        min="0"
                        max={classroom.max_capacity}
                        value={occupancyInputs[classroom.id] ?? classroom.current_occupancy}
                        onChange={(e) => setOccupancyInputs({...occupancyInputs, [classroom.id]: parseInt(e.target.value) || 0})}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => updateOccupancy(classroom.id, occupancyInputs[classroom.id] ?? classroom.current_occupancy, availableInputs[classroom.id] ?? classroom.is_available)}
                        disabled={updating[classroom.id]}
                        size="sm"
                      >
                        {updating[classroom.id] ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`available-${classroom.id}`}
                        checked={availableInputs[classroom.id] ?? classroom.is_available}
                        onChange={(e) => setAvailableInputs({...availableInputs, [classroom.id]: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`available-${classroom.id}`} className="text-sm text-slate-700">
                        Available
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
