import React from 'react';
import { cn } from "@/lib/utils";

export default function OccupancyBar({ percentage, showLabel = true, size = "md" }) {
  const getColor = (pct) => {
    if (pct <= 40) return "bg-emerald-500";
    if (pct <= 70) return "bg-amber-500";
    if (pct <= 90) return "bg-orange-500";
    return "bg-red-500";
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className="space-y-1">
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", heights[size])}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getColor(percentage))}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 text-right">{percentage}% occupied</p>
      )}
    </div>
  );
}