import React, { useState } from 'react';
import {
  Clock,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Building2,
  User,
  ShieldAlert,
  Send,
  Download
} from 'lucide-react';
import { EmployeeDashboardStats, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';

interface EmployeeDashboardViewProps {
  stats: EmployeeDashboardStats | null;
  loading: boolean;
  currentUser: UserType | null;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({
  stats,
  loading,
  currentUser,
  onNavigateTab,
  onRefresh
}) => {
  const [clockLoading, setClockLoading] = useState(false);
  const [clockFeedback, setClockFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleClock = async (action: 'clock_in' | 'clock_out') => {
    setClockLoading(true);
    setClockFeedback(null);
    try {
      const res = await api.clockAttendance(action);
      setClockFeedback({ type: 'success', message: res.message });
      onRefresh();
    } catch (err: any) {
      setClockFeedback({ type: 'error', message: err.message || 'Action failed' });
    } finally {
      setClockLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your employee portal...</p>
      </div>
    );
  }

  const emp = stats?.employee;
  const isCheckedIn = stats?.todayAttendance?.status === 'Present' || !!stats?.todayAttendance?.check_in;
  const isCheckedOut = !!stats?.todayAttendance?.check_out;

  return (
    <div id="employee-dashboard-container" className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 pointer-events-none rounded-l-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Employee Self-Service Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {emp?.name || currentUser?.name || 'Arun Kumar'}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              {emp?.designation || currentUser?.designation || 'Lead Architect'} • {emp?.department || currentUser?.department || 'Engineering'} • Employee ID: <span className="font-mono text-emerald-300">{emp?.employee_id || currentUser?.employee_id || 'EMP001'}</span>
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {!isCheckedIn ? (
              <button
                id="emp-clock-in-btn"
                onClick={() => handleClock('clock_in')}
                disabled={clockLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{clockLoading ? 'Logging...' : 'Clock In Today'}</span>
              </button>
            ) : !isCheckedOut ? (
              <button
                id="emp-clock-out-btn"
                onClick={() => handleClock('clock_out')}
                disabled={clockLoading}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{clockLoading ? 'Logging...' : 'Clock Out (End Day)'}</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-900/60 border border-emerald-600/40 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shift Completed Today</span>
              </div>
            )}

            <button
              id="emp-apply-leave-quick-btn"
              onClick={() => onNavigateTab('my_leave')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide transition-all flex items-center space-x-2"
            >
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Apply Leave</span>
            </button>
          </div>
        </div>

        {clockFeedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
            clockFeedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
          }`}>
            {clockFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{clockFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 4 Key Stat Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Attendance Percentage */}
        <div id="stat-card-emp-attendance" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {stats?.stats.attendancePercentage || 94}%
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Overall verified presence</p>
        </div>

        {/* Metric 2: Leave Balance */}
        <div id="stat-card-emp-leave-balance" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Balance</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {stats?.stats.leaveBalanceDays || 8} Days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Casual: 4 • Sick: 3 • Annual: 1</p>
        </div>

        {/* Metric 3: This Month Present */}
        <div id="stat-card-emp-this-month" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {stats?.stats.thisMonthPresentDays || 22}
            </span>
            <span className="text-xs text-slate-500 font-medium">Days Present</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Absent: 1 • Half Day: 0</p>
        </div>

        {/* Metric 4: Current Net Salary */}
        <div id="stat-card-emp-salary" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Salary</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              ₹{(stats?.stats.currentSalary || 55000).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500">/mo</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2">Net credited to bank</p>
        </div>
      </div>

      {/* Two Columns: Attendance Status & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Attendance & Recent Check-ins */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Today's Attendance Status</h2>
            </div>
            <button
              onClick={() => onNavigateTab('my_attendance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Shift for Today (2026-09-16)</p>
              <div className="flex items-center space-x-3 mt-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isCheckedIn ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats?.todayAttendance?.status || 'Not Checked In'}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Check-in: <span className="font-semibold text-slate-800">{stats?.todayAttendance?.check_in || '—'}</span>
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Check-out: <span className="font-semibold text-slate-800">{stats?.todayAttendance?.check_out || '—'}</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Recent 5 Attendance Days</h3>
            <div className="divide-y divide-slate-100">
              {stats?.recentAttendance && stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((rec) => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{rec.date}</span>
                      <span className="text-slate-400 ml-2">In: {rec.check_in || 'N/A'} • Out: {rec.check_out || 'N/A'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                      rec.status === 'Absent' ? 'bg-rose-50 text-rose-700' :
                      rec.status === 'Leave' ? 'bg-amber-50 text-amber-700' :
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3">No recent attendance records found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Leave Requests & Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">My Leave Applications</h2>
            </div>
            <button
              onClick={() => onNavigateTab('my_leave')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Apply / Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentLeaves && stats.recentLeaves.length > 0 ? (
              stats.recentLeaves.map((leave) => (
                <div key={leave.id} className="py-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{leave.leave_type}</span>
                      <span className="text-[11px] text-slate-500 font-medium">({leave.number_of_days} day{leave.number_of_days > 1 ? 's' : ''})</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {leave.start_date} to {leave.end_date}
                    </p>
                    {leave.reason && (
                      <p className="text-[11px] text-slate-400 italic">"{leave.reason}"</p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    leave.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No leave requests filed yet. Click "Apply Leave" to submit a request.
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('my_salary')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-between transition-colors"
            >
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                View September 2026 Pay Slip Details
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
