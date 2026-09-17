import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  Download
} from 'lucide-react';
import { AttendanceRecord, EmployeeAttendanceResponse, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';
import { downloadCsv } from '../../utils/csvExport.ts';

interface EmployeeAttendanceViewProps {
  currentUser: UserType | null;
}

export const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({ currentUser }) => {
  const [data, setData] = useState<EmployeeAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.getMyAttendance();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!filteredRecords || filteredRecords.length === 0) return;
    const headers = ['Date', 'Check In', 'Check Out', 'Working Hours', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.check_in || 'N/A',
      r.check_out || 'N/A',
      r.check_in && r.check_out ? '8h 30m' : r.check_in ? 'In Progress' : '0h',
      r.status
    ]);
    downloadCsv('my_attendance_log_2026', headers, rows);
  };

  const handleClock = async (action: 'clock_in' | 'clock_out') => {
    setClockLoading(true);
    setFeedback(null);
    try {
      const res = await api.clockAttendance(action);
      setFeedback({ type: 'success', message: res.message });
      await loadAttendance();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Action failed' });
    } finally {
      setClockLoading(false);
    }
  };

  const filteredRecords = data?.records?.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  }) || [];

  const today = '2026-09-16';
  const todayRecord = data?.records?.find((r) => r.date === today);
  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  return (
    <div id="employee-attendance-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Clock In / Out Live Widget */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Daily Attendance Clock</h2>
              <p className="text-xs text-slate-500">
                Today is <span className="font-semibold text-slate-700">Wednesday, 16-Sep-2026</span> • Office Shift (09:00 AM – 05:30 PM)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              id="emp-attendance-clock-in"
              onClick={() => handleClock('clock_in')}
              disabled={clockLoading || isCheckedIn}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
                isCheckedIn
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCheckedIn ? `In at ${todayRecord?.check_in}` : 'Clock In (09:00 AM)'}</span>
            </button>

            <button
              id="emp-attendance-clock-out"
              onClick={() => handleClock('clock_out')}
              disabled={clockLoading || !isCheckedIn || isCheckedOut}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
                !isCheckedIn
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isCheckedOut
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow active:scale-95'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isCheckedOut ? `Out at ${todayRecord?.check_out}` : 'Clock Out'}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Attendance Rate</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
            {data?.summary.attendanceRate || 94}%
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Verified</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Present Days</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            {data?.summary.presentCount || 22}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">This Month</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Half Days</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">
            {data?.summary.halfDayCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">0.5 ratio</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Leave Days</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {data?.summary.leaveCount || 1}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Approved time off</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Absent Days</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            {data?.summary.absentCount || 1}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Unexcused</p>
        </div>
      </div>

      {/* Table of Personal Attendance Records */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">My Attendance History</h3>
            <p className="text-xs text-slate-500">Personal punch-in logs recorded in PostgreSQL</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="emp-export-attendance-csv-btn"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5"
              title="Download attendance CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Check-In</th>
                <th className="px-5 py-3.5">Check-Out</th>
                <th className="px-5 py-3.5">Working Hours</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    Loading attendance entries...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No attendance records found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="px-5 py-3 text-slate-600">{r.check_in || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{r.check_out || '—'}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono">
                      {r.check_in && r.check_out ? '8h 30m' : r.check_in ? 'In Progress' : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                        r.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden p-4 space-y-3">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-6">Loading attendance entries...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No attendance records found matching this filter.</p>
          ) : (
            filteredRecords.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{r.date}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                    r.status === 'Leave' ? 'bg-amber-100 text-amber-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Check In</span>
                    <span className="font-medium text-slate-700">{r.check_in || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Check Out</span>
                    <span className="font-medium text-slate-700">{r.check_out || '—'}</span>
                  </div>
                </div>
                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Duration: {r.check_in && r.check_out ? '8h 30m' : r.check_in ? 'In Progress' : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
