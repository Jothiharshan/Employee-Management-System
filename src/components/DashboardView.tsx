import React from 'react';
import {
  Users,
  UserCheck,
  Building2,
  CalendarCheck,
  Clock,
  AlertCircle,
  ArrowUpRight,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardStats, User } from '../types.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  currentUser: User | null;
  onApproveLeave?: (id: number) => void;
  onRejectLeave?: (id: number) => void;
}

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#7c3aed', '#dc2626'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onNavigateTab,
  currentUser,
  onApproveLeave,
  onRejectLeave
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading database statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-950">Dashboard data is unavailable</h2>
          <p className="mt-2 text-xs leading-relaxed text-amber-800">
            The GitHub Pages frontend is loaded, but its Express API must be hosted separately for live data.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const attendanceData = stats.attendanceSummary?.map((item) => ({
    name: item.status,
    value: Number(item.count)
  })) || [];

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
            <span>Live PostgreSQL Database</span>
            <span>•</span>
            <span>48 Active Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {isAdmin
              ? 'You have administrative privileges to manage employees, departments, daily attendance, and approve leave requests.'
              : `Logged in as employee (${currentUser?.designation} - ${currentUser?.department}). You can track your attendance, view salaries, and apply for leaves.`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <button
              id="dashboard-add-employee-quick-btn"
              onClick={() => onNavigateTab('employees')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>
          ) : (
            <button
              id="dashboard-apply-leave-quick-btn"
              onClick={() => onNavigateTab('leaves')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
          <button
            id="dashboard-view-reports-btn"
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold transition-all"
          >
            View Reports
          </button>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          id="stat-card-total-employees"
          onClick={() => onNavigateTab('employees')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Employees</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalEmployees}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">In database</span>
        </div>

        <div
          id="stat-card-active-employees"
          onClick={() => onNavigateTab('employees')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Employees</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">{stats.activeEmployees}</p>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">Current workforce</span>
        </div>

        <div
          id="stat-card-departments"
          onClick={() => onNavigateTab('departments')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-purple-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Departments</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.departmentsCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Operational units</span>
        </div>

        <div
          id="stat-card-present-today"
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-blue-600 tracking-tight">{stats.presentToday}</p>
          <span className="text-[10px] text-blue-600/80 mt-1 block">Logged presence</span>
        </div>

        <div
          id="stat-card-on-leave"
          onClick={() => onNavigateTab('leaves')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-amber-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">On Leave</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-600 tracking-tight">{stats.onLeaveToday}</p>
          <span className="text-[10px] text-amber-600/80 mt-1 block">Approved absence</span>
        </div>

        <div
          id="stat-card-pending-leave"
          onClick={() => onNavigateTab('leaves')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-rose-600 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Leave</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-rose-600 tracking-tight">{stats.pendingLeaves}</p>
          <span className="text-[10px] text-rose-600/80 mt-1 block">Awaiting review</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution (Bar Chart) */}
        <div id="chart-employee-distribution" className="lg:col-span-2 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Employee Distribution by Department</h3>
              <p className="text-xs text-slate-500">Live headcounts across all 6 departments</p>
            </div>
            <button
              onClick={() => onNavigateTab('departments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`${val} Employees`, 'Count']}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Breakdown (Pie Chart) */}
        <div id="chart-attendance-breakdown" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Today's Attendance</h3>
              <span className="text-[11px] font-semibold text-slate-400">16-09-2026</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Daily attendance status distribution</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendanceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {attendanceData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 text-[11px] truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Employees & Recent Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees Table */}
        <div id="dashboard-recent-employees-card" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recently Added Employees</h3>
              <p className="text-xs text-slate-500">Latest workforce additions in database</p>
            </div>
            <button
              onClick={() => onNavigateTab('employees')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              <span>View All ({stats.totalEmployees})</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">Employee</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">Salary</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats.recentEmployees || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-slate-400">
                      No employees recorded yet.
                    </td>
                  </tr>
                ) : (
                  (stats.recentEmployees || []).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-mono text-[11px] font-semibold text-slate-600">{emp.employee_id}</td>
                      <td className="py-2.5">
                        <p className="font-semibold text-slate-800">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[10px] text-slate-400">{emp.designation}</p>
                      </td>
                      <td className="py-2.5 text-slate-600">{emp.department_name}</td>
                      <td className="py-2.5 font-medium text-slate-700">₹{Number(emp.salary).toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div id="dashboard-recent-leaves-card" className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500">Employee applications needing review</p>
            </div>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              <span>Manage Leaves</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(stats.recentLeaves || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No recent leave requests found.</p>
            ) : (
              (stats.recentLeaves || []).map((lr) => (
                <div
                  key={lr.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between gap-3"
                >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-bold text-xs text-slate-800 truncate">{lr.first_name} {lr.last_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({lr.employee_id})</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                      {lr.leave_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {lr.start_date} to {lr.end_date} • {lr.number_of_days} day(s) — "{lr.reason}"
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {lr.status === 'Pending' ? (
                    isAdmin ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onApproveLeave && onApproveLeave(lr.id)}
                          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRejectLeave && onRejectLeave(lr.id)}
                          className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )
                  ) : (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      lr.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {lr.status}
                    </span>
                  )}
                </div>
              </div>
            ))) }
          </div>
        </div>
      </div>
    </div>
  );
};
