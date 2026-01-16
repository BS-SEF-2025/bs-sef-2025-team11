import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { AlertTriangle, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function FaultManagement() {
  const { user } = useAuth();
  const [faults, setFaults] = useState([]);
  const [filteredFaults, setFilteredFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFault, setSelectedFault] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      fetchFaults();
    }
  }, [user]);

  useEffect(() => {
    filterFaults();
  }, [faults, searchTerm, statusFilter]);

  const fetchFaults = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE || ''}/api/faults/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFaults(data.faults || []);
      } else {
        toast.error('Failed to load fault reports');
      }
    } catch (error) {
      console.error('Error fetching faults:', error);
      toast.error('Failed to load fault reports');
    } finally {
      setLoading(false);
    }
  };

  const filterFaults = () => {
    let filtered = [...faults];

    if (searchTerm) {
      filtered = filtered.filter(fault =>
        fault.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.reporter_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(fault => fault.status === statusFilter);
    }

    setFilteredFaults(filtered);
  };

  const handleUpdateFault = async (faultId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE || ''}/api/faults/${faultId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus || undefined,
          assigned_to: assignedTo || undefined,
          resolution_notes: resolutionNotes || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Fault report updated successfully');
        setSelectedFault(null);
        setUpdateStatus('');
        setAssignedTo('');
        setResolutionNotes('');
        fetchFaults();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update fault report');
      }
    } catch (error) {
      console.error('Error updating fault:', error);
      toast.error('Failed to update fault report');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'done': return <CheckCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need manager or admin privileges to access this page.</p>
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

  const statusCounts = {
    all: faults.length,
    open: faults.filter(f => f.status === 'open').length,
    in_progress: faults.filter(f => f.status === 'in_progress').length,
    done: faults.filter(f => f.status === 'done').length,
    resolved: faults.filter(f => f.status === 'resolved').length,
    closed: faults.filter(f => f.status === 'closed').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Fault Management</h1>
        <p className="text-slate-600">Manage and update fault reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-sm text-slate-600 capitalize">{status.replace('_', ' ')}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search faults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Faults List */}
      <div className="space-y-4">
        {filteredFaults.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No fault reports found</p>
          </Card>
        ) : (
          filteredFaults.map((fault) => (
            <Card key={fault.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{fault.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(fault.status)}`}>
                      {getStatusIcon(fault.status)}
                      {fault.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(fault.severity)}`}>
                      {fault.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">{fault.description || 'No description'}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <p className="font-medium">{fault.building} Room {fault.room_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Category:</span>
                      <p className="font-medium capitalize">{fault.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Reporter:</span>
                      <p className="font-medium">{fault.reporter_email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Assigned To:</span>
                      <p className="font-medium">{fault.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>
                  {fault.resolution_notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded">
                      <p className="text-sm font-medium text-slate-700 mb-1">Resolution Notes:</p>
                      <p className="text-sm text-slate-600">{fault.resolution_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-3">
                    Created: {new Date(fault.created_date).toLocaleString()}
                    {fault.updated_at && ` • Updated: ${new Date(fault.updated_at).toLocaleString()}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFault(fault);
                    setUpdateStatus(fault.status);
                    setAssignedTo(fault.assigned_to || '');
                    setResolutionNotes(fault.resolution_notes || '');
                  }}
                  className="ml-4"
                >
                  Update
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Update Modal */}
      {selectedFault && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Update Fault Report</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFault(null)}>
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assigned To</label>
                <Input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter technician name or department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add resolution notes or updates..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdateFault(selectedFault.id)}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFault(null);
                    setUpdateStatus('');
                    setAssignedTo('');
                    setResolutionNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
