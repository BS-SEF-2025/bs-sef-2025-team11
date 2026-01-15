import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Clock, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';

export default function RequestCard({ request, onClick }) {
  const statusConfig = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-700" },
  };

  const roomTypeLabels = {
    classroom: "Classroom",
    lecture_hall: "Lecture Hall",
    meeting_room: "Meeting Room",
    seminar_room: "Seminar Room",
    lab: "Computer Lab"
  };

  const status = statusConfig[request.status] || statusConfig.pending;

  return (
    <Card 
      className={cn(
        "p-5 hover:shadow-lg transition-all duration-300 cursor-pointer",
        request.status === 'pending' && "border-amber-200"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              {roomTypeLabels[request.room_type] || request.room_type}
            </h3>
            <p className="text-sm text-slate-500">{request.purpose}</p>
          </div>
        </div>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          {moment(request.date).format('MMM D, YYYY')}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          {request.start_time} - {request.end_time}
        </div>
        <div className="flex items-center gap-2 text-slate-600 col-span-2">
          <User className="w-4 h-4 text-slate-400" />
          {request.requester_name || request.requester_email}
        </div>
      </div>

      {request.status === 'approved' && request.approved_room_name && (
        <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
          Assigned: {request.approved_room_name}
        </div>
      )}

      {request.status === 'rejected' && request.rejection_reason && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg text-sm text-red-700">
          Reason: {request.rejection_reason}
        </div>
      )}
    </Card>
  );
}