import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { FlaskConical, Users, CheckCircle, XCircle, AlertCircle, Plus, Search, MapPin, Filter, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function FindLabs() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [occupancyInputs, setOccupancyInputs] = useState({});
  const [availableInputs, setAvailableInputs] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState('All Buildings');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showBuildingFilter, setShowBuildingFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '',
    building: '',
    room_number: '',
    max_capacity: 30,
    current_occupancy: 0,
    is_available: true,
    equipment_status: '',
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    // Initialize inputs when labs are loaded
    const inputs = {};
    const availables = {};
    labs.forEach(l => {
      inputs[l.id] = l.current_occupancy;
      availables[l.id] = l.is_available;
    });
    setOccupancyInputs(inputs);
    setAvailableInputs(availables);
  }, [labs]);

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/labs/list`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLabs(data.labs || []);
      }
    } catch (error) {
      console.error('Failed to fetch labs:', error);
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLab = async (e) => {
    e?.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/labs/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newLab),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Lab added successfully!');
        setNewLab({
          name: '',
          building: '',
          room_number: '',
          max_capacity: 30,
          current_occupancy: 0,
          is_available: true,
          equipment_status: '',
        });
        setShowAddForm(false);
        fetchLabs();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add lab');
      }
    } catch (error) {
      console.error('Failed to add lab:', error);
      toast.error('Failed to add lab');
    } finally {
      setCreating(false);
    }
  };

  const updateLabOccupancy = async (labId, newOccupancy, isAvailable) => {
    setUpdating({ ...updating, [labId]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/labs/${labId}/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_occupancy: newOccupancy,
          is_available: isAvailable,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'pending') {
          toast.success('Update request submitted! Waiting for manager approval.');
        } else {
          toast.success('Lab status updated!');
        }
        fetchLabs(); // Refresh to show current status
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update lab');
      }
    } catch (error) {
      console.error('Failed to update lab:', error);
      toast.error('Failed to update lab');
    } finally {
      setUpdating({ ...updating, [labId]: false });
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
  const buildings = ['All Buildings', ...new Set(labs.map(l => l.building).filter(Boolean))];

  // Filter labs
  const filteredLabs = labs.filter(lab => {
    // Search filter
    const matchesSearch = !searchTerm || 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    // Building filter
    const matchesBuilding = selectedBuilding === 'All Buildings' || lab.building === selectedBuilding;

    // Status filter
    const status = getOccupancyStatus(lab.current_occupancy, lab.max_capacity, lab.is_available);
    const matchesStatus = selectedStatus === 'All Status' || status === selectedStatus;

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: labs.length,
    available: labs.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_available) === 'Available').length,
    partiallyBooked: labs.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_available) === 'Partially Booked').length,
    full: labs.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_available) === 'Occupied/Full').length,
    overloaded: labs.filter(l => {
      const percentage = (l.current_occupancy / l.max_capacity) * 100;
      return percentage > 100;
    }).length,
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Labs</h1>
          <p className="text-slate-600">View and update lab occupancy status</p>
        </div>
        {isManager && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Lab'}
          </Button>
        )}
      </div>

      {/* Add Lab Form for Managers */}
      {isManager && showAddForm && (
        <Card className="p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Lab
          </h2>
          <form onSubmit={handleAddLab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lab Name *
                </label>
                <Input
                  type="text"
                  value={newLab.name}
                  onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                  placeholder="e.g., Computer Lab A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Building *
                </label>
                <Input
                  type="text"
                  value={newLab.building}
                  onChange={(e) => setNewLab({ ...newLab, building: e.target.value })}
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
                  value={newLab.room_number}
                  onChange={(e) => setNewLab({ ...newLab, room_number: e.target.value })}
                  placeholder="e.g., 201"
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
                  value={newLab.max_capacity}
                  onChange={(e) => setNewLab({ ...newLab, max_capacity: parseInt(e.target.value) || 30 })}
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
                  value={newLab.current_occupancy}
                  onChange={(e) => setNewLab({ ...newLab, current_occupancy: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLab.is_available}
                    onChange={(e) => setNewLab({ ...newLab, is_available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Available</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Equipment Status (Optional)
                </label>
                <Input
                  type="text"
                  value={newLab.equipment_status}
                  onChange={(e) => setNewLab({ ...newLab, equipment_status: e.target.value })}
                  placeholder="e.g., All computers working, 30 stations available"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={creating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {creating ? 'Adding...' : 'Add Lab'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewLab({
                    name: '',
                    building: '',
                    room_number: '',
                    max_capacity: 30,
                    current_occupancy: 0,
                    is_available: true,
                    equipment_status: '',
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

      {filteredLabs.length === 0 ? (
        <Card className="p-12 text-center">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            {labs.length === 0 ? 'No labs available' : 'No labs match your filters'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const percentage = (lab.current_occupancy / lab.max_capacity) * 100;

            return (
              <Card key={lab.id} className={`p-6 border-2 ${getStatusColor(lab.current_occupancy, lab.max_capacity, lab.is_available)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{lab.name}</h3>
                    <p className="text-sm text-slate-600">
                      {lab.building} Room {lab.room_number}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${lab.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Occupancy</span>
                      <span className="text-sm font-bold">
                        {lab.current_occupancy} / {lab.max_capacity}
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
                        {getStatusText(lab.current_occupancy, lab.max_capacity, lab.is_available)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        getOccupancyStatus(lab.current_occupancy, lab.max_capacity, lab.is_available) === 'Available' 
                          ? 'bg-green-100 text-green-700' 
                          : getOccupancyStatus(lab.current_occupancy, lab.max_capacity, lab.is_available) === 'Partially Booked'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getOccupancyStatus(lab.current_occupancy, lab.max_capacity, lab.is_available)}
                      </span>
                    </div>
                  </div>

                  {lab.equipment_status && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-600">
                        <strong>Equipment:</strong> {lab.equipment_status}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Update Occupancy
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="number"
                        min="0"
                        max={lab.max_capacity}
                        value={occupancyInputs[lab.id] ?? lab.current_occupancy}
                        onChange={(e) => setOccupancyInputs({...occupancyInputs, [lab.id]: parseInt(e.target.value) || 0})}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => updateLabOccupancy(lab.id, occupancyInputs[lab.id] ?? lab.current_occupancy, availableInputs[lab.id] ?? lab.is_available)}
                        disabled={updating[lab.id]}
                        size="sm"
                      >
                        {updating[lab.id] ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`available-${lab.id}`}
                        checked={availableInputs[lab.id] ?? lab.is_available}
                        onChange={(e) => setAvailableInputs({...availableInputs, [lab.id]: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`available-${lab.id}`} className="text-sm text-slate-700">
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
