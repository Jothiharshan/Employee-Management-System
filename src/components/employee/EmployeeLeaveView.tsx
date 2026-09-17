import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  XCircle,
  Info,
  Download
} from 'lucide-react';
import { LeaveRequest, EmployeeLeaveResponse, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';
import { downloadCsv } from '../../utils/csvExport.ts';

interface EmployeeLeaveViewProps {
  currentUser: UserType | null;
}

export const EmployeeLeaveView: React.FC<EmployeeLeaveViewProps> = ({ currentUser }) => {
  const [data, setData] = useState<EmployeeLeaveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('2026-09-22');
  const [endDate, setEndDate] = useState('2026-09-23');
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.getMyLeaves();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!data?.leaves || data.leaves.length === 0) return;
    const headers = ['Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
    const rows = data.leaves.map((l) => [
      l.leave_type,
      l.start_date,
      l.end_date,
      l.number_of_days,
      l.reason || '',
      l.status
    ]);
    downloadCsv('my_leave_history_2026', headers, rows);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setFeedback(null);
    try {
      const res = await api.applyMyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        number_of_days: days,
        reason
      });
      setFeedback({ type: 'success', message: res.message });
      setShowApplyModal(false);
      setReason('');
      await loadLeaves();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit leave application' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div id="employee-leave-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Apply CTA */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Leave Applications & Entitlements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit time-off applications for HR & Manager review. Check status and remaining leave balance.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="emp-export-leave-csv-btn"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center justify-center space-x-1.5"
            title="Download leave history"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="open-apply-leave-modal-btn"
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Apply for New Leave</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Leave Entitlement Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Remaining</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {data?.balance?.displayBalanceDays || 8} Days
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Available for 2026</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Casual Leave</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">4 Days</p>
          <p className="text-[11px] text-slate-400 mt-1">8 taken of 12</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Sick Leave</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">3 Days</p>
          <p className="text-[11px] text-slate-400 mt-1">7 taken of 10</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Annual Leave</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">1 Day</p>
          <p className="text-[11px] text-slate-400 mt-1">14 taken of 15</p>
        </div>
      </div>

      {/* Table of Leave Requests with Status */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">My Leave History & Status</h3>
          <p className="text-xs text-slate-500">Track pending, approved, or rejected applications</p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Leave Type</th>
                <th className="px-5 py-3.5">Period</th>
                <th className="px-5 py-3.5">Duration</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    Loading your leave records...
                  </td>
                </tr>
              ) : !data?.leaves || data.leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No leave requests found. Click "Apply for New Leave" above to request time off.
                  </td>
                </tr>
              ) : (
                data.leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{l.leave_type}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {l.start_date} <span className="text-slate-400">to</span> {l.end_date}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{l.number_of_days} Day(s)</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{l.reason || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                        l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status === 'Approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {l.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {l.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                        <span>{l.status}</span>
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
            <p className="text-center text-xs text-slate-400 py-6">Loading your leave records...</p>
          ) : !data?.leaves || data.leaves.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No leave requests found. Click "Apply for New Leave" above to request time off.</p>
          ) : (
            data.leaves.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{l.leave_type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                    l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    <span>{l.status}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>{l.start_date} to {l.end_date}</span>
                  <span className="font-semibold text-slate-700">{l.number_of_days} Day(s)</span>
                </div>
                {l.reason && (
                  <p className="text-xs text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100">
                    "{l.reason}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div id="apply-leave-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Apply for Leave</h3>
                <p className="text-xs text-slate-400">Submit time off request for Admin approval</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Casual Leave">Casual Leave (Balance: 4 days)</option>
                  <option value="Sick Leave">Sick Leave (Balance: 3 days)</option>
                  <option value="Annual Leave">Annual Leave (Balance: 1 day)</option>
                  <option value="Unpaid Leave">Unpaid / Loss of Pay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Absence</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Attending family function / Doctor appointment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
