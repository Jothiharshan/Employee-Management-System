import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';
import { LeaveRequest, Employee, User } from '../types.ts';
import { downloadCsv } from '../utils/csvExport.ts';

interface LeaveManagementViewProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  loading: boolean;
  currentUser: User | null;
  onSubmitLeave: (data: Partial<LeaveRequest>) => Promise<void>;
  onApproveLeave: (id: number) => Promise<void>;
  onRejectLeave: (id: number) => Promise<void>;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leaves,
  employees,
  loading,
  currentUser,
  onSubmitLeave,
  onApproveLeave,
  onRejectLeave
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [employeeId, setEmployeeId] = useState<number>(
    currentUser?.id ? (employees.find(e => e.employee_id === currentUser.employee_id)?.id || 1) : 1
  );
  const [leaveType, setLeaveType] = useState<LeaveRequest['leave_type']>('Casual Leave');
  const [startDate, setStartDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-21');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto calculate days
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end < start) return 1;
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const filteredLeaves = useMemo(() => {
    let list = Array.isArray(leaves) ? leaves : [];
    // If not admin, filter to only the current employee's leaves
    if (!isAdmin && currentUser) {
      list = list.filter((l) => l.emp_code === currentUser.employee_id);
    }
    if (selectedStatus !== 'All') {
      list = list.filter((l) => l.status === selectedStatus);
    }
    return list;
  }, [leaves, isAdmin, currentUser, selectedStatus]);

  const stats = useMemo(() => {
    const pending = filteredLeaves.filter((l) => l.status === 'Pending').length;
    const approved = filteredLeaves.filter((l) => l.status === 'Approved').length;
    const rejected = filteredLeaves.filter((l) => l.status === 'Rejected').length;
    return { pending, approved, rejected, total: filteredLeaves.length };
  }, [filteredLeaves]);

  const handleExportCsv = () => {
    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Days',
      'Reason',
      'Status'
    ];
    const rows = filteredLeaves.map((item) => [
      item.emp_code,
      `${item.first_name} ${item.last_name}`,
      item.department_name,
      item.leave_type,
      item.start_date,
      item.end_date,
      item.number_of_days,
      item.reason,
      item.status
    ]);
    downloadCsv(`leave_records_${selectedStatus.toLowerCase()}_2026`, headers, rows);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFormError('Please specify the reason for taking leave.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmitLeave({
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        number_of_days: calculatedDays,
        reason
      });
      setModalOpen(false);
      setReason('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="leave-management-view" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leave Management</h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Review pending workforce leave applications and set approval decisions'
              : 'Submit absence applications and track administrative approval status'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-leave-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="apply-leave-btn"
            onClick={() => {
              // Pick appropriate employee ID
              if (!isAdmin && currentUser) {
                const myEmp = employees.find(e => e.employee_id === currentUser.employee_id);
                if (myEmp) setEmployeeId(myEmp.id);
              }
              setModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <p className="text-2xl font-bold text-amber-600 tracking-tight">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Approved Requests</span>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">{stats.approved}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rejected Requests</span>
            <p className="text-2xl font-bold text-rose-600 tracking-tight">{stats.rejected}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 w-fit">
        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            id={`filter-leave-${status.toLowerCase()}`}
            onClick={() => setSelectedStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === status
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Mobile Leave Cards (visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.first_name} {item.last_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{item.emp_code} • {item.department_name}</p>
                </div>
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.leave_type}
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.number_of_days} Day(s)
                  </span>
                </div>
                <p className="text-slate-500 font-mono text-[11px]">
                  {item.start_date} <span className="text-slate-400">to</span> {item.end_date}
                </p>
                {item.reason && (
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-xl text-xs border border-slate-100">
                    "{item.reason}"
                  </p>
                )}
              </div>

              {isAdmin && item.status === 'Pending' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    id={`mobile-reject-leave-${item.id}`}
                    onClick={() => onRejectLeave(item.id)}
                    className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    id={`mobile-approve-leave-${item.id}`}
                    onClick={() => onApproveLeave(item.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No leave requests found</p>
            <p className="text-xs text-slate-400">Use the "+ Apply for Leave" button to submit a request.</p>
          </div>
        )}
      </div>

      {/* Desktop Leave Requests Table (visible on screens >= md) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Decisions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 leading-tight">
                        {item.first_name} {item.last_name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">{item.emp_code}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.department_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.leave_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {item.start_date} <span className="text-slate-400">to</span> {item.end_date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.number_of_days} d
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="truncate" title={item.reason}>{item.reason}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        {item.status === 'Pending' ? (
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              id={`approve-leave-${item.id}`}
                              onClick={() => onApproveLeave(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              id={`reject-leave-${item.id}`}
                              onClick={() => onRejectLeave(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-xs flex items-center space-x-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Decision recorded</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No leave requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Use the "+ Apply for Leave" button to submit a request.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {modalOpen && (
        <div id="apply-leave-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Apply for Leave</h3>
            <p className="text-xs text-slate-500 mb-4">Submit time-off request for manager approval</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applying Employee *</label>
                <select
                  value={employeeId}
                  disabled={!isAdmin}
                  onChange={(e) => setEmployeeId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                >
                  {(employees || []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employee_id} - {e.first_name} {e.last_name} ({e.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Annual Leave">Annual Leave (AL)</option>
                  <option value="Personal Leave">Personal Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between text-xs text-blue-900">
                <span className="font-semibold">Calculated Absence:</span>
                <span className="font-bold text-sm bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {calculatedDays} Day(s)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attending family function / medical checkup"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
