import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/state/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function Notifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for new notifications
            const interval = setInterval(fetchNotifications, 60000); // Every minute
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE || ''}/api/notifications/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE || ''}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_BASE || ''}/api/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 top-12 w-80 max-h-[500px] overflow-hidden flex flex-col shadow-xl z-50 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1 max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-3 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <h4 className={`text-sm ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(n.created_at).toLocaleDateString()}
                                                    </span>
                                                    {n.action_link && (
                                                        <Link
                                                            to={n.action_link}
                                                            className="text-[10px] text-blue-600 font-medium hover:underline"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            View Details
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!n.is_read && (
                                                <button
                                                    onClick={(e) => markAsRead(n.id, e)}
                                                    className="text-slate-400 hover:text-blue-600 p-1"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
