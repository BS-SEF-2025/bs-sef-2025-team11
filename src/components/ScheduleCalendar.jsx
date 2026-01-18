import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function ScheduleCalendar({ requests = [], onTimeSlotClick, loading = false }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to format hours
    const formatHour = (hour) => {
        return new Date(0, 0, 0, hour).toLocaleTimeString([], { hour: 'numeric', hour12: true });
    };

    // Generate time slots (8 AM to 8 PM)
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

    // Generate days of current week (Sun-Sat)
    const weekDays = useMemo(() => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    // Navigate functions
    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        setCurrentDate(prev);
    };

    // Check if a slot is booked for the current user
    const getRequestForSlot = (day, hour) => {
        if (!requests) return null;

        return requests.find(req => {
            // Must match day
            const reqDate = new Date(req.requested_date);
            if (reqDate.toDateString() !== day.toDateString()) return false;

            // Extract hours from time strings "HH:MM:SS"
            const startH = parseInt(req.start_time.split(':')[0]);
            const endH = parseInt(req.end_time.split(':')[0]);

            // Check overlap
            // e.g., 10:00 to 12:00 covers 10 and 11
            return hour >= startH && hour < endH;
        });
    };

    const isToday = (date) => {
        return date.toDateString() === new Date().toDateString();
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-8 gap-1 h-96">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-slate-100 rounded h-full"></div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Weekly Schedule
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">
                        {weekDays[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={prevWeek} className="h-8 w-8 p-0">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={nextWeek} className="h-8 w-8 p-0">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[80px_repeat(7,1fr)] mb-2">
                        <div className="text-center text-xs font-semibold text-slate-400 pt-2">TIME</div>
                        {weekDays.map((day, i) => (
                            <div
                                key={i}
                                className={`text-center py-2 px-1 rounded-t-lg ${isToday(day) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 font-medium'}`}
                            >
                                <div className="text-xs uppercase">{day.toLocaleDateString([], { weekday: 'short' })}</div>
                                <div className="text-lg">{day.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    <div className="relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-[80px_repeat(7,1fr)] pointer-events-none">
                            <div className="border-r border-slate-100"></div>
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="border-r border-slate-100 last:border-0"></div>
                            ))}
                        </div>

                        {/* Time Rows */}
                        {timeSlots.map((hour) => (
                            <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 min-h-[60px]">
                                {/* Time Label */}
                                <div className="text-xs text-slate-400 text-right pr-4 py-2 -mt-2.5">
                                    {formatHour(hour)}
                                </div>

                                {/* Day Columns for this Hour */}
                                {weekDays.map((day, dIndex) => {
                                    const req = getRequestForSlot(day, hour);
                                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                                    return (
                                        <div
                                            key={`${dIndex}-${hour}`}
                                            className="relative p-1 group"
                                        >
                                            {req ? (
                                                // Booked Slot
                                                <div
                                                    className={`
                            h-full w-full rounded p-1 text-xs border-l-2 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm
                            ${req.status === 'approved'
                                                            ? 'bg-green-100 border-green-500 text-green-800'
                                                            : req.status === 'rejected'
                                                                ? 'bg-red-50 border-red-400 text-red-800 opacity-60'
                                                                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                                                        }
                          `}
                                                    title={`${req.purpose} (${req.status})`}
                                                >
                                                    <div className="font-semibold truncate">{req.purpose}</div>
                                                    <div className="truncate opacity-75">{req.room_type}</div>
                                                </div>
                                            ) : (
                                                // Empty Slot
                                                !isPast && (
                                                    <button
                                                        onClick={() => onTimeSlotClick && onTimeSlotClick(day, hour)}
                                                        className="w-full h-full rounded hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 text-blue-500 text-xs font-medium flex items-center justify-center border border-dashed border-blue-200"
                                                    >
                                                        <PlusIcon className="w-3 h-3 mr-1" />
                                                        Book
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-500"></div>
                    <span>Approved</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-400"></div>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-50 border border-red-400 opacity-60"></div>
                    <span>Rejected</span>
                </div>
            </div>
        </Card>
    );
}

// Simple internal icon since we can't rely on all imports in a new file immediately
function PlusIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
