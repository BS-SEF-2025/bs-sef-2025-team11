import React, { useState, useEffect } from 'react';
import { useAuth } from '@/state/AuthContext';
import { AlertTriangle, Zap, MapPin, Building, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function RecurringIssues() {
    const { user } = useAuth();
    const [data, setData] = useState({ recurring_faults: [], recurring_overloads: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecurringIssues();
    }, [user]);

    const fetchRecurringIssues = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE || ''}/api/reports/recurring`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to load recurring issues');
            }
        } catch (error) {
            console.error('Error fetching recurring issues:', error);
            toast.error('Failed to load recurring issues');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Recurring Issues Report</h1>
                <p className="text-slate-600">Identify systemic problems and plan infrastructure improvements (US-11)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recurring Faults Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-semibold text-slate-900">Recurring Faults</h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Locations with multiple reported faults</p>

                    {data.recurring_faults.length === 0 ? (
                        <Card className="p-12 text-center text-slate-500">
                            No recurring fault patterns detected yet.
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.recurring_faults.map((item, idx) => (
                                <Card key={idx} className="p-4 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-900">{item.building}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-700">Room {item.room_number || 'Multiple'}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase">
                                                    Type: {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-orange-600 mb-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-2xl font-bold">{item.count}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">Reports</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recurring Overloads Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-semibold text-slate-900">Recurring Overloads</h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Repeated resource or occupancy threshold violations</p>

                    {data.recurring_overloads.length === 0 ? (
                        <Card className="p-12 text-center text-slate-500">
                            No recurring overload patterns detected yet.
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {data.recurring_overloads.map((item, idx) => (
                                <Card key={idx} className="p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-900">{item.building}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-700">Room {item.room_number || 'General'}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium uppercase">
                                                    Resource: {item.resource_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-blue-600 mb-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-2xl font-bold">{item.count}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">Incidents</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    variant="outline"
                    onClick={fetchRecurringIssues}
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Report
                </Button>
            </div>
        </div>
    );
}
