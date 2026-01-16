import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { AlertTriangle, CheckCircle, Clock, XCircle, Search, MapPin, Building, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [filteredFaults, setFilteredFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, [user]);

  useEffect(() => {
    filterReports();
  }, [faults, searchTerm]);

  const fetchReports = async () => {
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
        toast.error('Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...faults];

    if (searchTerm) {
      filtered = filtered.filter(fault =>
        fault.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.building.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFaults(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle, label: 'Open' },
      in_progress: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, label: 'In Progress' },
      done: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Done' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, label: 'Closed' },
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
    };

    const config = severityConfig[severity] || severityConfig.medium;

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryIcon = (category) => {
    // You can add icons here if needed
    return null;
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
  const myReports = faults.filter(f => f.reporter_email === user?.email);
  const displayReports = isManager ? faults : myReports;
  const filteredDisplayReports = searchTerm 
    ? filteredFaults.filter(f => isManager || f.reporter_email === user?.email)
    : displayReports;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isManager ? 'All Fault Reports' : 'My Reports'}
        </h1>
        <p className="text-slate-600">
          {isManager 
            ? `Viewing ${faults.length} fault report${faults.length !== 1 ? 's' : ''} from all users`
            : `You have ${myReports.length} report${myReports.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search reports by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {filteredDisplayReports.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reports Found</h3>
          <p className="text-slate-600 mb-6">
            {faults.length === 0 
              ? 'No reports have been submitted yet.'
              : 'No reports match your search criteria.'
            }
          </p>
          {(user?.role === 'student' || user?.role === 'lecturer') && faults.length === 0 && (
            <Button onClick={() => navigate('/report-fault')}>
              Submit Your First Report
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDisplayReports.map((fault) => (
            <Card key={fault.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-blue-500">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {fault.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(fault.status)}
                    {getSeverityBadge(fault.severity)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {fault.description && (
                <p className="text-slate-600 mb-4 line-clamp-2">
                  {fault.description}
                </p>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">
                      {fault.building}
                      {fault.room_number && ` • Room ${fault.room_number}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Category</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {fault.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {isManager && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Reported By</p>
                      <p className="text-sm font-medium text-slate-900">
                        {fault.reporter_email}
                      </p>
                    </div>
                  </div>
                )}
                {fault.assigned_to && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Assigned To</p>
                      <p className="text-sm font-medium text-slate-900">
                        {fault.assigned_to}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              {fault.resolution_notes && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-900 mb-1">Resolution Notes</p>
                  <p className="text-sm text-green-800">{fault.resolution_notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Reported {formatDate(fault.created_date)}</span>
                </div>
                {isManager && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/fault-management')}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
