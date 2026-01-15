import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, X, Clock, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import moment from 'moment';

export default function RequestApprovals() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const [approvalData, setApprovalData] = useState({
    approved_room_id: '',
    approved_room_name: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      const [userData, requestsData, roomsData, labsData] = await Promise.all([
        isAuth ? base44.auth.me() : Promise.resolve(null),
        base44.entities.RoomRequest.filter({ status: 'pending' }, '-created_date', 100),
        base44.entities.Room.list('name', 100),
        base44.entities.Lab.list('name', 100)
      ]);
      setUser(userData);
      setRequests(requestsData);
      setRooms(roomsData);
      setLabs(labsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = (request) => {
    // Check for time conflicts with approved requests
    const conflicts = requests.filter(r => 
      r.id !== request.id &&
      r.status === 'approved' &&
      r.date === request.date &&
      r.approved_room_id === approvalData.approved_room_id &&
      ((request.start_time >= r.start_time && request.start_time < r.end_time) ||
       (request.end_time > r.start_time && request.end_time <= r.end_time))
    );
    return conflicts.length > 0;
  };

  const handleApprove = async () => {
    if (!approvalData.approved_room_id) {
      toast.error('Please select a room to assign');
      return;
    }

    setProcessing(true);
    try {
      // Update the room request
      await base44.entities.RoomRequest.update(selectedRequest.id, {
        status: 'approved',
        approved_room_id: approvalData.approved_room_id,
        approved_room_name: approvalData.approved_room_name,
        reviewed_by: user?.email,
        reviewed_at: new Date().toISOString()
      });

      toast.success('Request approved');
      setSelectedRequest(null);
      setActionType(null);
      loadData();
    } catch (e) {
      toast.error('Failed to approve request');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await base44.entities.RoomRequest.update(selectedRequest.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_by: user?.email,
        reviewed_at: new Date().toISOString()
      });
      toast.success('Request rejected');
      setSelectedRequest(null);
      setActionType(null);
      setRejectionReason('');
      loadData();
    } catch (e) {
      toast.error('Failed to reject request');
    }
    setProcessing(false);
  };

  const getAvailableSpaces = (request) => {
    const spaces = request.room_type === 'lab' ? labs : rooms;
    return spaces.filter(s => 
      (request.room_type === 'lab' || s.type === request.room_type) &&
      s.capacity >= (request.expected_attendees || 0)
    );
  };

  const roomTypeLabels = {
    classroom: 'Classroom',
    lecture_hall: 'Lecture Hall',
    meeting_room: 'Meeting Room',
    seminar_room: 'Seminar Room',
    lab: 'Computer Lab'
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Request Approvals</h1>
        <p className="text-slate-500 mt-1">
          {requests.length} pending request{requests.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        {requests.map(request => (
          <Card key={request.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">
                      {roomTypeLabels[request.room_type] || request.room_type}
                    </h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{request.purpose}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>📅 {moment(request.date).format('MMM D, YYYY')}</span>
                    <span>⏰ {request.start_time} - {request.end_time}</span>
                    <span>👥 {request.expected_attendees || 'N/A'} people</span>
                    <span>👤 {request.requester_name || request.requester_email}</span>
                  </div>
                  {request.equipment_needed?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {request.equipment_needed.map((eq, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 lg:flex-shrink-0">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setSelectedRequest(request);
                    setActionType('reject');
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setSelectedRequest(request);
                    setActionType('approve');
                    setApprovalData({ approved_room_id: '', approved_room_name: '' });
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card className="p-12 text-center">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-1">All Caught Up!</h3>
            <p className="text-slate-500">No pending requests to review.</p>
          </Card>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Request Details</p>
                <p className="font-medium">{roomTypeLabels[selectedRequest.room_type]}</p>
                <p className="text-sm text-slate-600">
                  {moment(selectedRequest.date).format('MMM D, YYYY')} • {selectedRequest.start_time} - {selectedRequest.end_time}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Assign Room *</Label>
                <Select 
                  value={approvalData.approved_room_id}
                  onValueChange={(v) => {
                    const spaces = getAvailableSpaces(selectedRequest);
                    const selected = spaces.find(s => s.id === v);
                    setApprovalData({
                      approved_room_id: v,
                      approved_room_name: selected ? `${selected.name} (${selected.building})` : ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSpaces(selectedRequest).map(space => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name} ({space.building}) - Capacity: {space.capacity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getAvailableSpaces(selectedRequest).length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">No suitable rooms available for this request.</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processing || !approvalData.approved_room_id}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Explain why this request is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setActionType(null);
              setRejectionReason('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              variant="destructive"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}