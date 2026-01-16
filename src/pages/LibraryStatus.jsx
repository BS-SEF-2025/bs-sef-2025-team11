import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { BookOpen, Users, CheckCircle, XCircle, AlertCircle, Plus, Edit2, Save, X, Search, Filter, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function LibraryStatus() {
  const { user } = useAuth();
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [editingLibrary, setEditingLibrary] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [libraryInputs, setLibraryInputs] = useState({});
  const [occupancyInputs, setOccupancyInputs] = useState({});
  const [isOpenInputs, setIsOpenInputs] = useState({});
  const [newLibrary, setNewLibrary] = useState({
    name: '',
    max_capacity: 100,
    current_occupancy: 0,
    is_open: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    // Initialize inputs when libraries are loaded
    const occupancies = {};
    const opens = {};
    libraries.forEach(lib => {
      occupancies[lib.id] = lib.current_occupancy;
      opens[lib.id] = lib.is_open;
    });
    setOccupancyInputs(occupancies);
    setIsOpenInputs(opens);
  }, [libraries]);

  const fetchLibraries = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error('Please log in to view libraries');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/libraries/list`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLibraries(data.libraries || []);
      } else if (res.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        // Fallback to old endpoint for backward compatibility
        const oldRes = await fetch(`${API_BASE || ''}/api/library/status`, { headers });
        if (oldRes.ok) {
          const oldData = await oldRes.json();
          setLibraries([oldData]);
        } else {
          console.error('Failed to fetch libraries:', res.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      toast.error('Failed to load libraries');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLibrary = async (e) => {
    e?.preventDefault();
    
    if (!isManager) {
      toast.error('Only managers and admins can add libraries');
      return;
    }
    
    if (!newLibrary.name || !newLibrary.max_capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error('Please log in to add libraries');
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('Creating library:', newLibrary);
      const res = await fetch(`${API_BASE || ''}/api/library/create`, {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify(newLibrary),
      });

      const responseText = await res.text();
      console.log('Create library response status:', res.status);
      console.log('Create library response:', responseText);

      if (res.ok) {
        const data = JSON.parse(responseText);
        toast.success('Library added successfully!');
        setNewLibrary({
          name: '',
          max_capacity: 100,
          current_occupancy: 0,
          is_open: true,
        });
        setShowAddForm(false);
        fetchLibraries();
      } else {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || `Failed to add library (status ${res.status})` };
        }
        console.error('Failed to add library:', error);
        if (res.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem("token");
            window.location.href = '/login';
          }, 2000);
        } else if (res.status === 403) {
          // Check if user has pending manager role request
          const errorMsg = error.message || 'You do not have permission to add libraries';
          if (user?.role === 'student') {
            toast.error('Only managers and admins can add libraries. If you requested manager access, please wait for admin approval.');
          } else {
            toast.error(errorMsg);
          }
        } else {
          toast.error(error.message || 'Failed to add library');
        }
      }
    } catch (error) {
      console.error('Failed to add library:', error);
      toast.error('Failed to add library. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditLibrary = (library) => {
    setEditingLibrary(library.id);
    setLibraryInputs({
      [library.id]: {
        name: library.name,
        max_capacity: library.max_capacity,
        current_occupancy: library.current_occupancy,
        is_open: library.is_open,
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingLibrary(null);
    setLibraryInputs({});
  };

  const handleSaveLibrary = async (libraryId) => {
    setUpdating({ ...updating, [`lib-${libraryId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const input = libraryInputs[libraryId];
      const res = await fetch(`${API_BASE || ''}/api/library/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          library_id: libraryId,
          name: input.name,
          max_capacity: input.max_capacity,
          current_occupancy: input.current_occupancy,
          is_open: input.is_open,
        }),
      });

      if (res.ok) {
        toast.success('Library updated successfully!');
        setEditingLibrary(null);
        setLibraryInputs({});
        fetchLibraries();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update library');
      }
    } catch (error) {
      console.error('Failed to update library:', error);
      toast.error('Failed to update library');
    } finally {
      setUpdating({ ...updating, [`lib-${libraryId}`]: false });
    }
  };

  const updateLibraryStatus = async (libraryId, currentOccupancy, isOpen) => {
    setUpdating({ ...updating, [`update-${libraryId}`]: true });
    try {
      const token = localStorage.getItem("token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const res = await fetch(`${API_BASE || ''}/api/library/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          library_id: libraryId,
          current_occupancy: currentOccupancy,
          is_open: isOpen,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'pending') {
          toast.success('Update request submitted! Waiting for manager approval.');
        } else {
          toast.success('Library status updated!');
        }
        fetchLibraries();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update library status');
      }
    } catch (error) {
      console.error('Failed to update library status:', error);
      toast.error('Failed to update library status');
    } finally {
      setUpdating({ ...updating, [`update-${libraryId}`]: false });
    }
  };

  const getStatusColor = (occupancy, maxCapacity, isOpen) => {
    if (!isOpen) return 'bg-red-100 text-red-800 border-red-200';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (occupancy, maxCapacity, isOpen) => {
    if (!isOpen) return 'Closed';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 80) return 'Very Busy';
    if (percentage >= 50) return 'Moderate';
    return 'Good to Go';
  };

  const getOccupancyStatus = (occupancy, maxCapacity, isOpen) => {
    if (!isOpen) return 'Occupied/Full';
    const percentage = (occupancy / maxCapacity) * 100;
    if (percentage >= 100) return 'Occupied/Full';
    if (percentage >= 50) return 'Partially Booked';
    return 'Available';
  };

  // Filter libraries
  const filteredLibraries = libraries.filter(library => {
    // Search filter
    const matchesSearch = !searchTerm || 
      library.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const status = getOccupancyStatus(library.current_occupancy, library.max_capacity, library.is_open);
    const matchesStatus = selectedStatus === 'All Status' || status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: libraries.length,
    available: libraries.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_open) === 'Available').length,
    partiallyBooked: libraries.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_open) === 'Partially Booked').length,
    full: libraries.filter(l => getOccupancyStatus(l.current_occupancy, l.max_capacity, l.is_open) === 'Occupied/Full').length,
    overloaded: libraries.filter(l => {
      const percentage = (l.current_occupancy / l.max_capacity) * 100;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Library Status</h1>
          <p className="text-slate-600">View and update library occupancy</p>
        </div>
        {isManager && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Library'}
          </Button>
        )}
      </div>

      {/* Add Library Form for Managers */}
      {isManager && showAddForm && (
        <Card className="p-6 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Library
          </h2>
          <form onSubmit={handleAddLibrary} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Library Name *
                </label>
                <Input
                  type="text"
                  value={newLibrary.name}
                  onChange={(e) => setNewLibrary({ ...newLibrary, name: e.target.value })}
                  placeholder="e.g., Main Library, Science Library"
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
                  value={newLibrary.max_capacity}
                  onChange={(e) => setNewLibrary({ ...newLibrary, max_capacity: parseInt(e.target.value) || 100 })}
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
                  value={newLibrary.current_occupancy}
                  onChange={(e) => setNewLibrary({ ...newLibrary, current_occupancy: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLibrary.is_open}
                    onChange={(e) => setNewLibrary({ ...newLibrary, is_open: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Open</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {creating ? 'Adding...' : 'Add Library'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewLibrary({
                    name: '',
                    max_capacity: 100,
                    current_occupancy: 0,
                    is_open: true,
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
              placeholder="Search libraries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowStatusFilter(!showStatusFilter)}
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
      {showStatusFilter && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowStatusFilter(false)}
        />
      )}

      {filteredLibraries.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">
            {libraries.length === 0 ? 'No libraries available' : 'No libraries match your filters'}
          </p>
          {isManager && libraries.length === 0 && (
            <p className="text-slate-400 text-sm mt-2">Click "Add Library" to create one</p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibraries.map((library) => {
            const percentage = (library.current_occupancy / library.max_capacity) * 100;
            const isEditing = editingLibrary === library.id;
            const input = libraryInputs[library.id] || {
              name: library.name,
              max_capacity: library.max_capacity,
              current_occupancy: library.current_occupancy,
              is_open: library.is_open,
            };
            const occupancyInput = occupancyInputs[library.id] ?? library.current_occupancy;
            const isOpenInput = isOpenInputs[library.id] ?? library.is_open;

            return (
              <Card key={library.id} className={`p-6 border-2 ${getStatusColor(library.current_occupancy, library.max_capacity, library.is_open)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    {isEditing && isManager ? (
                      <Input
                        type="text"
                        value={input.name}
                        onChange={(e) => setLibraryInputs({
                          ...libraryInputs,
                          [library.id]: { ...input, name: e.target.value }
                        })}
                        className="flex-1 h-8 text-lg font-bold"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-slate-900">{library.name}</h2>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${library.is_open ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isManager && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLibrary(library)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing && isManager ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Max Capacity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={input.max_capacity}
                        onChange={(e) => setLibraryInputs({
                          ...libraryInputs,
                          [library.id]: { ...input, max_capacity: parseInt(e.target.value) || 100 }
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Current Occupancy
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={input.max_capacity}
                        value={input.current_occupancy}
                        onChange={(e) => setLibraryInputs({
                          ...libraryInputs,
                          [library.id]: { ...input, current_occupancy: parseInt(e.target.value) || 0 }
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={input.is_open}
                        onChange={(e) => setLibraryInputs({
                          ...libraryInputs,
                          [library.id]: { ...input, is_open: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label className="text-xs text-slate-700">Open</label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveLibrary(library.id)}
                        disabled={updating[`lib-${library.id}`]}
                        className="flex-1 h-7 text-xs"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-7 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Current Occupancy</span>
                        <span className="text-sm font-bold">
                          {library.current_occupancy} / {library.max_capacity}
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
                          {percentage.toFixed(1)}% Full - {getStatusText(library.current_occupancy, library.max_capacity, library.is_open)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          getOccupancyStatus(library.current_occupancy, library.max_capacity, library.is_open) === 'Available' 
                            ? 'bg-green-100 text-green-700' 
                            : getOccupancyStatus(library.current_occupancy, library.max_capacity, library.is_open) === 'Partially Booked'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {getOccupancyStatus(library.current_occupancy, library.max_capacity, library.is_open)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        {library.is_open ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {library.is_open ? 'Library is Open' : 'Library is Closed'}
                        </span>
                      </div>

                      {/* Update Form for Students/Lecturers */}
                      {!isManager && (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Update Occupancy
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min="0"
                                max={library.max_capacity}
                                value={occupancyInput}
                                onChange={(e) => setOccupancyInputs({...occupancyInputs, [library.id]: parseInt(e.target.value) || 0})}
                                className="h-8 text-sm flex-1"
                              />
                              <Button
                                onClick={() => updateLibraryStatus(library.id, occupancyInput, isOpenInput)}
                                disabled={updating[`update-${library.id}`]}
                                size="sm"
                                className="h-8"
                              >
                                {updating[`update-${library.id}`] ? 'Updating...' : 'Update'}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isOpenInput}
                              onChange={(e) => setIsOpenInputs({...isOpenInputs, [library.id]: e.target.checked})}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label className="text-xs text-slate-700">Open</label>
                          </div>
                        </div>
                      )}

                      {library.last_updated && (
                        <p className="text-xs text-slate-500 mt-2">
                          Last updated: {new Date(library.last_updated).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
