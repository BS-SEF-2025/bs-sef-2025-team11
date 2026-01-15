import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { AlertTriangle, Search, Filter, User, Clock, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import FaultCard from '../components/cards/FaultCard';
import moment from 'moment';

const API_BASE = "http://127.0.0.1:8000";

export default function Reports() {
  const { user } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFault, setSelectedFault] = useState(null);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/faults/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to load faults");
      
      const data = await response.json();
      setFaults(data.faults || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load faults');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaults = faults.filter(fault => {
    const matchesSearch = !searchQuery || 
      fault.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.building?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.reporter_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || fault.status === statusFilter;
    const matchesTab = activeTab === 'all' || fault.status === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const counts = {
    all: faults.length,
    open: faults.filter(f => f.status === 'open').length,
    in_progress: faults.filter(f => f.status === 'in_progress').length,
    done: faults.filter(f => f.status === 'done').length,
    resolved: faults.filter(f => f.status === 'resolved').length,
    closed: faults.filter(f => f.status === 'closed').length,
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'in_progress': return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'closed': return <XCircle className="w-4 h-4 text-slate-600" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'done': return 'bg-emerald-100 text-emerald-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fault Reports</h1>
        <p className="text-slate-500 mt-1">View all fault reports from students and lecturers with status updates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <p className="text-2xl font-bold text-blue-600">{counts.open}</p>
          <p className="text-sm text-slate-500">Open</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-purple-600">{counts.in_progress}</p>
          <p className="text-sm text-slate-500">In Progress</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-emerald-600">{counts.done}</p>
          <p className="text-sm text-slate-500">Done</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-emerald-600">{counts.resolved}</p>
          <p className="text-sm text-slate-500">Resolved</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-600">{counts.closed}</p>
          <p className="text-sm text-slate-500">Closed</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-slate-600">{counts.all}</p>
          <p className="text-sm text-slate-500">Total</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by title, location, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabs & List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="done">Done ({counts.done})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({counts.resolved})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-3">
            {filteredFaults.map(fault => (
              <FaultCard 
                key={fault.id} 
                fault={fault}
                onClick={() => setSelectedFault(fault)}
              />
            ))}
            {filteredFaults.length === 0 && (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">No Reports Found</h3>
                <p className="text-slate-500">No fault reports match your current filters.</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Fault Details Sheet */}
      <Sheet open={!!selectedFault} onOpenChange={() => setSelectedFault(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedFault && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedFault.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedFault.status)}
                  <Badge className={getStatusColor(selectedFault.status)}>
                    {selectedFault.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium">{selectedFault.building}, {selectedFault.room_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <p className="font-medium capitalize">{selectedFault.category?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Severity</p>
                    <Badge variant="outline" className={
                      selectedFault.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      selectedFault.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      selectedFault.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {selectedFault.severity?.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Reported</p>
                    <p className="font-medium">{moment(selectedFault.created_at).format('MMM D, YYYY')}</p>
                  </div>
                </div>

                {selectedFault.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-slate-700">{selectedFault.description}</p>
                  </div>
                )}

                {selectedFault.image_url && (
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Photo</p>
                    <img 
                      src={selectedFault.image_url} 
                      alt="Fault" 
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Reporter Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <p className="text-sm text-slate-500">Reported By</p>
                  </div>
                  <p className="font-medium">{selectedFault.reporter_name || selectedFault.reporter_email || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{selectedFault.reporter_email}</p>
                </div>

                {/* Manager Updates */}
                {selectedFault.assigned_to && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-500">Assigned To</p>
                    </div>
                    <p className="font-medium">{selectedFault.assigned_to}</p>
                  </div>
                )}

                {selectedFault.resolution_notes && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-slate-500">Resolution Notes</p>
                    </div>
                    <p className="text-slate-700 bg-emerald-50 p-3 rounded-lg">{selectedFault.resolution_notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Created: {moment(selectedFault.created_at).format('MMM D, YYYY h:mm A')}</span>
                  </div>
                  {selectedFault.updated_at && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Last Updated: {moment(selectedFault.updated_at).format('MMM D, YYYY h:mm A')}</span>
                    </div>
                  )}
                  {selectedFault.resolved_at && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolved: {moment(selectedFault.resolved_at).format('MMM D, YYYY h:mm A')}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
