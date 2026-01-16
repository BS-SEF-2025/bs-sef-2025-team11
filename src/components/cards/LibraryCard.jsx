import React from 'react';
import { Card } from "@/components/ui/card";
import { BookOpen, MapPin, Users, Clock } from 'lucide-react';
import OccupancyBadge from '../occupancy/OccupancyBadge';
import OccupancyBar from '../occupancy/OccupancyBar';
import moment from 'moment';

const statusMap = {
  'quiet': { label: 'Quiet', percentage: 25, color: 'emerald' },
  'moderate': { label: 'Moderate', percentage: 50, color: 'blue' },
  'busy': { label: 'Busy', percentage: 75, color: 'amber' },
  'very_busy': { label: 'Very Busy', percentage: 100, color: 'red' }
};

export default function LibraryCard({ library }) {
  const status = statusMap[library.occupancy_status] || statusMap['moderate'];
  
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{library.name}</h3>
            <p className="text-sm text-slate-600 mt-0.5">{status.label}</p>
          </div>
        </div>
      </div>

      <OccupancyBar percentage={status.percentage} />

      <div className="mt-4 flex items-center justify-center text-sm text-slate-500">
        <Clock className="w-4 h-4 mr-1" />
        <span>Updated {library.last_updated ? moment(library.last_updated).fromNow() : 'recently'}</span>
      </div>
    </Card>
  );
}