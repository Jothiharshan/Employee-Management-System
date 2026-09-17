import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Bell,
  Lock,
  Smartphone,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { User as UserType } from '../../types.ts';

interface EmployeeSettingsViewProps {
  currentUser: UserType | null;
}

export const EmployeeSettingsView: React.FC<EmployeeSettingsViewProps> = ({ currentUser }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSaved(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSaved(false), 4000);
  };

  return (
    <div id="employee-settings-page" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">My Account Settings & Security</h2>
            <p className="text-xs text-slate-500">Personal security preferences and portal notifications</p>
          </div>
        </div>
      </div>

      {/* Access Restriction Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Role Access Boundary: Employee Mode</p>
          <p className="text-[11px] text-amber-800">
            You are logged in as an Employee. Organizational settings, PostgreSQL database management tools, seed-reset utilities, and SQL inspection consoles are restricted strictly to Administrators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password Demo Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Update Portal Password</h3>
          </div>

          {passSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Notification Channels</h3>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">Email Leave Alerts</p>
                <p className="text-[11px] text-slate-500">Receive email on leave request approval/rejection</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">Payslip SMS Broadcast</p>
                <p className="text-[11px] text-slate-500">Instant notification when monthly salary is credited</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-700">Active Authentication Session</p>
              <p className="text-[11px]">Logged in as: <span className="font-semibold text-slate-800">{currentUser?.email}</span></p>
              <p className="text-[11px]">Role: <span className="font-semibold text-emerald-700">{currentUser?.role}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
