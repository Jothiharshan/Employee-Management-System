import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  Megaphone,
  Check,
  Info
} from 'lucide-react';
import { NotificationItem, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';

interface EmployeeNotificationsViewProps {
  currentUser: UserType | null;
}

export const EmployeeNotificationsView: React.FC<EmployeeNotificationsViewProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getMyNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return <CalendarCheck className="w-5 h-5 text-emerald-600" />;
      case 'salary':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div id="employee-notifications-page" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Notifications & Announcements</h2>
            <p className="text-xs text-slate-500">Official HR alerts, payroll notifications, and approval updates</p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No notifications at this time.</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markSingleAsRead(item.id)}
              className={`p-5 sm:p-6 flex items-start space-x-4 transition-colors cursor-pointer ${
                !item.read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold truncate ${!item.read ? 'text-blue-950' : 'text-slate-800'}`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2 shrink-0">
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
