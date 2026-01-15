import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Clock, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';

export default function FaultCard({ fault, onClick }) {
  const severityConfig = {
    low: { label: "Low", className: "bg-slate-100 text-slate-700" },
    medium: { label: "Medium", className: "bg-amber-100 text-amber-700" },
    high: { label: "High", className: "bg-orange-100 text-orange-700" },
    critical: { label: "Critical", className: "bg-red-100 text-red-700" },
  };

  const statusConfig = {
    open: { label: "Open", className: "bg-blue-100 text-blue-700" },
    in_progress: { label: "In Progress", className: "bg-purple-100 text-purple-700" },
    done: { label: "Done", className: "bg-emerald-100 text-emerald-700" },
    resolved: { label: "Resolved", className: "bg-emerald-100 text-emerald-700" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-700" },
  };

  const severity = severityConfig[fault.severity] || severityConfig.medium;
  const status = statusConfig[fault.status] || statusConfig.open;

  const categoryIcons = {
    projector: "🖥️",
    ac: "❄️",
    lighting: "💡",
    furniture: "🪑",
    computer: "💻",
    network: "📶",
    plumbing: "🚿",
    electrical: "⚡",
    other: "🔧"
  };

  return (
    <Card 
      className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center text-xl",
          fault.severity === 'critical' || fault.severity === 'high' 
            ? "bg-red-50" 
            : "bg-slate-50"
        )}>
          {categoryIcons[fault.category] || "🔧"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{fault.title}</h3>
            <div className="flex gap-1.5 flex-shrink-0">
              <Badge variant="outline" className={severity.className}>
                {severity.label}
              </Badge>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {fault.building}, {fault.room_number}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {moment(fault.created_date).fromNow()}
            </span>
          </div>

          {fault.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{fault.description}</p>
          )}

          {fault.assigned_to && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <User className="w-3 h-3" />
              Assigned to: {fault.assigned_to}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}