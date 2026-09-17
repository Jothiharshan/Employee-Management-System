import React, { useState, useEffect } from 'react';
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
  Cell,
  Legend
} from 'recharts';
import { Printer, Download, BarChart3, Users, Building2, CalendarCheck, CalendarDays, TrendingUp } from 'lucide-react';
import { api } from '../services/api.ts';
import { downloadCsv } from '../utils/csvExport.ts';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#7c3aed', '#dc2626'];

export const ReportsView: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReports();
      setReportData(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err instanceof Error ? err.message : 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Aggregating PostgreSQL analytical reports...</p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
        <BarChart3 className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-sm font-bold text-slate-800">Reports are unavailable</h2>
        <p className="mt-1 max-w-md text-xs text-slate-500">
          {error || 'No report data was returned by the server.'}
        </p>
        <button
          type="button"
          onClick={() => void loadReports()}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const rawAttendance = reportData?.attendanceStats || reportData?.attendanceBreakdown || [];
  const rawLeaves = reportData?.leaveStats || reportData?.leaveBreakdown || [];
  const rawDepts = reportData?.deptStats || reportData?.deptCounts || [];

  const attendancePieData = Array.isArray(rawAttendance)
    ? rawAttendance.map((item: any) => ({
        name: item.status,
        value: Number(item.count || 0)
      }))
    : [];

  const leavePieData = Array.isArray(rawLeaves)
    ? rawLeaves.map((item: any) => ({
        name: item.status,
        value: Number(item.count || 0)
      }))
    : [];

  const deptChartData = Array.isArray(rawDepts)
    ? rawDepts.map((item: any) => ({
        name: item.department_name || item.name,
        staffCount: Number(item.staff_count ?? item.employee_count ?? 0),
        avgSalary: Math.round(Number(item.avg_salary || 0))
      }))
    : [];

  const empStatus = reportData?.employeeStatus || {
    total: 48,
    active: 45,
    onLeave: 3
  };

  const handleExportCsv = () => {
    const headers = ['Department Name', 'Total Staff Count', 'Average Salary (INR)'];
    const rows = deptChartData.map((d: any) => [
      d.name,
      d.staffCount,
      d.avgSalary
    ]);
    downloadCsv('department_workforce_analytics_2026', headers, rows);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Analytical Reports</h2>
          <p className="text-xs text-slate-500">
            Workforce demographics, department compensation averages, and attendance analytics
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-reports-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download analytics CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="print-reports-btn"
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{empStatus.total}</p>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">{empStatus.active} Active</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{empStatus.onLeave} On Leave</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department Count</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{deptChartData.length}</p>
          <p className="text-[11px] text-slate-400 mt-2">Operational divisions</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
            <CalendarCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {(() => {
              const total = attendancePieData.reduce((sum, item) => sum + item.value, 0);
              const present = attendancePieData.find((item) => item.name === 'Present')?.value || 0;
              return total > 0 ? `${((present / total) * 100).toFixed(1)}%` : '0.0%';
            })()}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            {attendancePieData.find((item) => item.name === 'Present')?.value || 0} Present records
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leave Applications</span>
            <CalendarDays className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{leavePieData.reduce((acc: number, cur: any) => acc + cur.value, 0)}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-2">
            {leavePieData.find((item) => item.name === 'Pending')?.value || 0} Requests pending review
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Headcount Chart */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Department Workforce Headcount</h3>
          <p className="text-xs text-slate-500 mb-4">Total employees assigned to each department</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`${val} Staff`, 'Headcount']}
                />
                <Bar dataKey="staffCount" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Salary by Department Chart */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Average Salary by Department (₹)</h3>
          <p className="text-xs text-slate-500 mb-4">Benchmark monthly compensation comparison</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Average Salary']}
                />
                <Bar dataKey="avgSalary" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Breakdown Pie */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Attendance Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Daily presence vs absence categorization</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendancePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attendancePieData.map((_: any, index: number) => (
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

        {/* Leave Status Pie */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Leave Approval Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Status of all submitted leave requests</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leavePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#059669" /> {/* Approved */}
                  <Cell fill="#d97706" /> {/* Pending */}
                  <Cell fill="#dc2626" /> {/* Rejected */}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
