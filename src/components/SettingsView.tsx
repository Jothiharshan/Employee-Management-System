import React, { useState } from 'react';
import { Database, Terminal, RotateCcw, CheckCircle2, Shield, Code, Play, AlertCircle } from 'lucide-react';
import { api } from '../services/api.ts';

interface SettingsViewProps {
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset }) => {
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT e.employee_id, e.first_name, e.last_name, d.department_name, e.salary\nFROM employees e\nJOIN departments d ON e.department_id = d.id\nLIMIT 10;'
  );
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleExecuteSql = async () => {
    setExecuting(true);
    setQueryError(null);
    try {
      const res = await api.runQuery(sqlQuery);
      setQueryResult(res.rows || []);
    } catch (err: any) {
      setQueryError(err.message || 'SQL execution failed');
      setQueryResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset database to pristine seed data (48 employees, 6 departments, attendance, leaves, salaries)?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDatabase();
      setResetSuccess(true);
      onDataReset();
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const sampleQueries = [
    {
      label: 'Staff Count by Department',
      sql: 'SELECT d.department_name, count(e.id) as staff_count, CAST(avg(e.salary) as integer) as avg_salary\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.id\nGROUP BY d.department_name\nORDER BY staff_count DESC;'
    },
    {
      label: 'Highest Paid Employees',
      sql: 'SELECT employee_id, first_name, last_name, designation, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;'
    },
    {
      label: 'Pending Leave Applications',
      sql: 'SELECT lr.id, e.first_name, e.last_name, lr.leave_type, lr.number_of_days, lr.status\nFROM leave_requests lr\nJOIN employees e ON lr.employee_id = e.id\nWHERE lr.status = \'Pending\';'
    }
  ];

  return (
    <div id="settings-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Database Architecture & Settings</h2>
          <p className="text-xs text-slate-500">
            Relational PostgreSQL schema, live SQL console, and project academic documentation
          </p>
        </div>

        <button
          id="reset-database-btn"
          onClick={handleResetData}
          disabled={resetting}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 shadow-xs transition-all"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Default Seed Data'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Database successfully reset and re-seeded with 48 employees and relations!</span>
        </div>
      )}

      {/* Project Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Academic Project Specifications</h3>
            <p className="text-xs text-slate-500">College Academic Activity Demonstration</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          This Employee Management System (EMS) demonstrates enterprise digital workforce operations including personnel management, department structures, daily attendance logging, multi-day leave application workflows, monthly salary payroll disbursements with printable vouchers, and analytics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Backend Server</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Express.js & REST APIs</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Database Engine</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Relational PostgreSQL</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Frontend Client</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">React 18 + Tailwind + Recharts</p>
          </div>
        </div>
      </div>

      {/* Live PostgreSQL SQL Console */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Live PostgreSQL SQL Query Console</h3>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
            DQL Execution
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Execute real relational SQL queries against the live PostgreSQL instance to inspect data, joins, and aggregates:
        </p>

        {/* Query Presets */}
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSqlQuery(q.sql)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Editor Box */}
        <div className="rounded-2xl border border-slate-300 bg-slate-950 p-3.5 text-slate-100 font-mono text-xs shadow-inner">
          <textarea
            rows={4}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-transparent text-emerald-400 focus:outline-none resize-none font-mono text-xs leading-relaxed"
            placeholder="SELECT * FROM employees LIMIT 5;"
          />
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              id="execute-sql-btn"
              onClick={handleExecuteSql}
              disabled={executing}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Executing SQL...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {queryError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{queryError}</span>
          </div>
        )}

        {/* Query Results Table */}
        {queryResult && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden mt-3">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Query Output</span>
              <span className="text-slate-400 font-mono">{queryResult.length} Row(s) returned</span>
            </div>
            {queryResult.length > 0 ? (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                    <tr>
                      {Object.keys(queryResult[0]).map((col) => (
                        <th key={col} className="py-2 px-3 border-b border-slate-200">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryResult.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="py-2 px-3 text-slate-800">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                Query executed successfully. 0 rows returned.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relational Schema Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Code className="w-4 h-4 text-purple-600" />
          <span>PostgreSQL Relational Schema DDL</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono space-y-1">
            <span className="font-bold text-blue-700">departments</span>
            <p className="text-[11px] text-slate-600">id (PK), department_id, department_name, manager_name, description, created_at</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono space-y-1">
            <span className="font-bold text-blue-700">employees</span>
            <p className="text-[11px] text-slate-600">id (PK), employee_id (UNIQUE), first_name, last_name, email (UNIQUE), phone, gender, department_id (FK), designation, joining_date, employment_type, salary, status, address</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono space-y-1">
            <span className="font-bold text-blue-700">attendance</span>
            <p className="text-[11px] text-slate-600">id (PK), employee_id (FK), date, status ('Present','Absent','Leave','Half Day'), check_in, check_out, created_at</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono space-y-1">
            <span className="font-bold text-blue-700">leave_requests</span>
            <p className="text-[11px] text-slate-600">id (PK), employee_id (FK), leave_type, start_date, end_date, number_of_days, reason, status ('Pending','Approved','Rejected')</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono space-y-1 md:col-span-2">
            <span className="font-bold text-blue-700">salaries</span>
            <p className="text-[11px] text-slate-600">id (PK), employee_id (FK), month, year, basic_salary, allowance, deduction, net_salary, created_at</p>
          </div>
        </div>
      </div>
    </div>
  );
};
