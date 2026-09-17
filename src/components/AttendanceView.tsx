import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  UserCheck,
  Edit3,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { AttendanceRecord, Employee, User } from '../types.ts';
import { downloadCsv } from '../utils/csvExport.ts';

interface AttendanceViewProps {
  records: AttendanceRecord[];
  employees: Employee[];
  loading: boolean;
  currentUser: User | null;
  onMarkAttendance: (data: Partial<AttendanceRecord>) => Promise<void>;
  onUpdateAttendance: (id: number, data: Partial<AttendanceRecord>) => Promise<void>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  records,
  employees,
  loading,
  currentUser,
  onMarkAttendance,
  onUpdateAttendance,
  selectedDate,
  setSelectedDate
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const [formData, setFormData] = useState({
    employee_id: employees[0]?.id || 1,
    date: selectedDate,
    status: 'Present' as AttendanceRecord['status'],
    check_in: '09:15',
    check_out: '17:45'
  });
  const [submitting, setSubmitting] = useState(false);

  const stepDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      setSelectedDate(todayStr);
      return;
    }
    const current = new Date(selectedDate || '2026-09-16');
    if (direction === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    setSelectedDate(current.toISOString().slice(0, 10));
  };

  const handleExportCsv = () => {
    const headers = [
      'Employee Code',
      'First Name',
      'Last Name',
      'Department',
      'Date',
      'Status',
      'Check In',
      'Check Out'
    ];
    const rows = userFilteredRecords.map((r) => [
      r.emp_code,
      r.first_name,
      r.last_name,
      r.department_name,
      r.date,
      r.status,
      r.check_in || 'N/A',
      r.check_out || 'N/A'
    ]);
    downloadCsv(`attendance_log_${selectedDate}`, headers, rows);
  };

  // If user is Employee role, they only see their own attendance by default
  const userFilteredRecords = useMemo(() => {
    let list = Array.isArray(records) ? records : [];
    if (!isAdmin && currentUser) {
      list = list.filter((r) => r.emp_code === currentUser.employee_id);
    }
    return list.filter((r) => {
      const matchStatus = selectedStatus === 'All' || r.status === selectedStatus;
      const matchEmp = selectedEmpFilter === 'All' || r.employee_id.toString() === selectedEmpFilter;
      return matchStatus && matchEmp;
    });
  }, [records, isAdmin, currentUser, selectedStatus, selectedEmpFilter]);

  // Daily Summary metrics
  const summary = useMemo(() => {
    const present = userFilteredRecords.filter((r) => r.status === 'Present').length;
    const absent = userFilteredRecords.filter((r) => r.status === 'Absent').length;
    const leave = userFilteredRecords.filter((r) => r.status === 'Leave').length;
    const halfDay = userFilteredRecords.filter((r) => r.status === 'Half Day').length;
    return { present, absent, leave, halfDay, total: userFilteredRecords.length };
  }, [userFilteredRecords]);

  const openMarkModal = (rec?: AttendanceRecord) => {
    if (rec) {
      setEditingRecord(rec);
      setFormData({
        employee_id: rec.employee_id,
        date: rec.date,
        status: rec.status,
        check_in: rec.check_in || '09:15',
        check_out: rec.check_out || '17:45'
      });
    } else {
      setEditingRecord(null);
      setFormData({
        employee_id: employees[0]?.id || 1,
        date: selectedDate,
        status: 'Present',
        check_in: '09:15',
        check_out: '17:45'
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRecord) {
        await onUpdateAttendance(editingRecord.id, formData);
      } else {
        await onMarkAttendance(formData);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="attendance-view" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daily Attendance Tracking</h2>
          <p className="text-xs text-slate-500">
            Verify workforce presence, punch-in logs, and daily status in PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-attendance-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download CSV report"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              id="mark-attendance-btn"
              onClick={() => openMarkModal()}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Present</span>
            <p className="text-xl font-bold text-emerald-600">{summary.present}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Absent</span>
            <p className="text-xl font-bold text-rose-600">{summary.absent}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">On Leave</span>
            <p className="text-xl font-bold text-amber-600">{summary.leave}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Half Day</span>
            <p className="text-xl font-bold text-purple-600">{summary.halfDay}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => stepDate('prev')}
                title="Previous Day"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={() => stepDate('next')}
                title="Next Day"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => stepDate('today')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Filter</label>
              <select
                value={selectedEmpFilter}
                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
              >
                <option value="All">All Employees ({(employees || []).length})</option>
                {(employees || []).map((e) => (
                  <option key={e.id} value={e.id.toString()}>
                    {e.employee_id} - {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-right self-end lg:self-center">
          <span className="text-xs text-slate-500 font-medium">
            Showing {userFilteredRecords.length} records
          </span>
        </div>
      </div>

      {/* Mobile Attendance Cards (visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {userFilteredRecords.length > 0 ? (
          userFilteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {rec.first_name} {rec.last_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{rec.emp_code} • {rec.department_name}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    rec.status === 'Present'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : rec.status === 'Absent'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : rec.status === 'Leave'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {rec.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Check In</span>
                  <span className="font-mono font-bold text-slate-800">{rec.check_in || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Check Out</span>
                  <span className="font-mono font-bold text-slate-800">{rec.check_out || '—'}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => openMarkModal(rec)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Attendance</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No attendance records for this date</p>
            <p className="text-xs text-slate-400">Use "+ Mark Attendance" or switch dates above.</p>
          </div>
        )}
      </div>

      {/* Desktop Attendance Log Table (visible on screens >= md) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userFilteredRecords.length > 0 ? (
                userFilteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{rec.emp_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {rec.first_name} {rec.last_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.department_name}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{rec.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rec.status === 'Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {rec.check_in || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {rec.check_out || '—'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openMarkModal(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Log"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No attendance records for this date</p>
                    <p className="text-xs text-slate-400 mt-1">Use the "+ Mark Attendance" button to record punches.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark / Edit Attendance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingRecord ? 'Edit Attendance Record' : 'Record Employee Attendance'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">PostgreSQL attendance daily log update</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={formData.employee_id}
                  disabled={!!editingRecord}
                  onChange={(e) => setFormData({ ...formData, employee_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {(employees || []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employee_id} - {e.first_name} {e.last_name} ({e.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'Absent' && formData.status !== 'Leave' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Check In Time</label>
                    <input
                      type="time"
                      value={formData.check_in}
                      onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Check Out Time</label>
                    <input
                      type="time"
                      value={formData.check_out}
                      onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

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
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
