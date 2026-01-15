import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { AlertTriangle, Search, Filter, Check, Clock, Wrench, Loader2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const statusOptions = [
  { value: 'open', label: 'Open', icon: AlertTriangle, color: 'text-blue-600' },
  { value: 'in_progress', label: 'In Progress', icon: Wrench, color: 'text-purple-600' },
  { value: 'done', label: 'Done', icon: Check, color: 'text-emerald-600' },
  { value: 'resolved', label: 'Resolved', icon: Check, color: 'text-emerald-600' },
  { value: 'closed', label: 'Closed', icon: Clock, color: 'text-slate-600' },
];

const API_BASE = "http://127.0.0.1:8000";

export default function FaultManagement() {
  const { user } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('open');
  const [selectedFault, setSelectedFault] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [updateData, setUpdateData] = useState({
    status: '',
    assigned_to: '',
    resolution_notes: ''
  });

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

  const handleUpdateFault = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/faults/${selectedFault.id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update fault");
      }

      toast.success('Fault updated successfully');
      setSelectedFault(null);
      loadData();
    } catch (e) {
      toast.error(e.message || 'Failed to update fault');
    }
    setUpdating(false);
  };

  const openFaultDetails = (fault) => {
    setSelectedFault(fault);
    setUpdateData({
      status: fault.status,
      assigned_to: fault.assigned_to || '',
      resolution_notes: fault.resolution_notes || ''
    });
  };

  const filteredFaults = faults.filter(fault => {
    const matchesSearch = !searchQuery || 
      fault.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.building?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.room_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || fault.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || fault.category === categoryFilter;
    const matchesStatus = activeTab === 'all' || fault.status === activeTab;
    
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  const counts = {
    all: faults.length,
    open: faults.filter(f => f.status === 'open').length,
    in_progress: faults.filter(f => f.status === 'in_progress').length,
    done: faults.filter(f => f.status === 'done').length,
    resolved: faults.filter(f => f.status === 'resolved').length,
    closed: faults.filter(f => f.status === 'closed').length,
  };

  const categories = [...new Set(faults.map(f => f.category))].filter(Boolean);

  const severityConfig = {
    low: { label: 'Low', className: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
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
        <h1 className="text-2xl font-bold text-slate-900">Fault Management</h1>
        <p className="text-slate-500 mt-1">Track and manage facility maintenance issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search faults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
                </SelectItem>
              ))}
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
                onClick={() => openFaultDetails(fault)}
              />
            ))}
            {filteredFaults.length === 0 && (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">No Faults Found</h3>
                <p className="text-slate-500">No faults match your current filters.</p>
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
                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium">{selectedFault.building}, {selectedFault.room_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <p className="font-medium capitalize">{selectedFault.category?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Severity</p>
                    <Badge variant="outline" className={severityConfig[selectedFault.severity]?.className}>
                      {severityConfig[selectedFault.severity]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Reported</p>
                    <p className="font-medium">{moment(selectedFault.created_date).format('MMM D, YYYY')}</p>
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

                <div>
                  <p className="text-sm text-slate-500">Reporter</p>
                  <p className="font-medium">{selectedFault.reporter_name || selectedFault.reporter_email || 'Unknown'}</p>
                </div>

                <hr />

                {/* Update Form */}
                <div className="space-y-4">
                  <h4 className="font-medium">Update Fault</h4>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={updateData.status} 
                      onValueChange={(v) => setUpdateData(prev => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Input
                      placeholder="Technician name or team"
                      value={updateData.assigned_to}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution Notes</Label>
                    <Textarea
                      placeholder="Add notes about the resolution..."
                      value={updateData.resolution_notes}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, resolution_notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleUpdateFault}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Fault'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}