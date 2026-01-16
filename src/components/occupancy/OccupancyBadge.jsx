import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function OccupancyBadge({ level, percentage }) {
  const config = {
    low: { label: "Low", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    moderate: { label: "Moderate", className: "bg-amber-100 text-amber-700 border-amber-200" },
    high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" },
    full: { label: "Full", className: "bg-red-100 text-red-700 border-red-200" },
  };

  const levelConfig = config[level] || config.low;

  return (
    <Badge variant="outline" className={cn("font-medium", levelConfig.className)}>
      {levelConfig.label} {percentage !== undefined && `(${percentage}%)`}
    </Badge>
  );
}