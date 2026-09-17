import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, FileText, IndianRupee, Search, Filter, ArrowUpRight, Download } from 'lucide-react';
import { SalaryRecord, Employee, User } from '../types.ts';
import { SalarySlipModal } from './SalarySlipModal.tsx';
import { downloadCsv } from '../utils/csvExport.ts';

interface SalaryViewProps {
  salaries: SalaryRecord[];
  employees: Employee[];
  loading: boolean;
  currentUser: User | null;
  onAddSalary: (data: Partial<SalaryRecord>) => Promise<void>;
}

export const SalaryView: React.FC<SalaryViewProps> = ({
  salaries,
  employees,
  loading,
  currentUser,
  onAddSalary
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState('All');
  const [activeSlip, setActiveSlip] = useState<SalaryRecord | null>(null);

  // Add Salary Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [empId, setEmpId] = useState<number>(employees[0]?.id || 1);
  const [month, setMonth] = useState('September');
  const [year, setYear] = useState(2026);
  const [basicSalary, setBasicSalary] = useState<number>(55000);
  const [allowance, setAllowance] = useState<number>(5000);
  const [deduction, setDeduction] = useState<number>(2500);
  const [submitting, setSubmitting] = useState(false);

  // Auto update basic salary when employee changes
  const handleEmpChange = (id: number) => {
    setEmpId(id);
    const selected = employees.find((e) => e.id === id);
    if (selected) {
      setBasicSalary(Number(selected.salary));
      setAllowance(Math.round(Number(selected.salary) * 0.1));
      setDeduction(Math.round(Number(selected.salary) * 0.05));
    }
  };

  const calculatedNet = Math.max(0, Number(basicSalary) + Number(allowance) - Number(deduction));

  // Filter salaries
  const filteredSalaries = useMemo(() => {
    let list = Array.isArray(salaries) ? salaries : [];
    if (!isAdmin && currentUser) {
      list = list.filter((s) => s.emp_code === currentUser.employee_id);
    }
    return list.filter((s) => {
      const matchMonth = selectedMonth === 'All' || s.month === selectedMonth;
      const matchEmp = selectedEmp === 'All' || s.employee_id.toString() === selectedEmp;
      return matchMonth && matchEmp;
    });
  }, [salaries, isAdmin, currentUser, selectedMonth, selectedEmp]);

  // Total payroll stats
  const payrollStats = useMemo(() => {
    const totalPayroll = filteredSalaries.reduce((acc, s) => acc + Number(s.net_salary), 0);
    const avgSalary = filteredSalaries.length ? Math.round(totalPayroll / filteredSalaries.length) : 0;
    return { totalPayroll, avgSalary, count: filteredSalaries.length };
  }, [filteredSalaries]);

  const handleExportCsv = () => {
    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Month',
      'Year',
      'Basic Salary',
      'Allowance',
      'Deduction',
      'Net Salary'
    ];
    const rows = filteredSalaries.map((s) => [
      s.emp_code,
      `${s.first_name} ${s.last_name}`,
      s.department_name,
      s.month,
      s.year,
      s.basic_salary,
      s.allowance,
      s.deduction,
      s.net_salary
    ]);
    downloadCsv(`payroll_records_${selectedMonth === 'All' ? 'all' : selectedMonth}_2026`, headers, rows);
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddSalary({
        employee_id: empId,
        month,
        year,
        basic_salary: Number(basicSalary),
        allowance: Number(allowance),
        deduction: Number(deduction)
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="salary-view" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Salary & Payroll Management</h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Calculate compensations, allowances, deductions, and issue salary vouchers'
              : 'Review your monthly remuneration and download official salary slips'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-payroll-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              id="add-salary-record-btn"
              onClick={() => {
                if (employees.length > 0) handleEmpChange(employees[0].id);
                setModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Salary Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Disbursed Payroll</span>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{payrollStats.totalPayroll.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Monthly Pay</span>
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">₹{payrollStats.avgSalary.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issued Vouchers</span>
            <p className="text-2xl font-bold text-purple-600 tracking-tight">{payrollStats.count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Months</option>
              <option value="September">September 2026</option>
              <option value="August">August 2026</option>
              <option value="July">July 2026</option>
            </select>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee</label>
              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[220px]"
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

        <div className="text-xs text-slate-500">
          Showing {filteredSalaries.length} salary records
        </div>
      </div>

      {/* Mobile Salary Cards (visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredSalaries.length > 0 ? (
          filteredSalaries.map((s) => (
            <div
              key={s.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {s.first_name} {s.last_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{s.emp_code} • {s.department_name}</p>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {s.month} {s.year}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Basic Pay</span>
                  <span className="font-mono font-semibold text-slate-800">₹{Number(s.basic_salary).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Allowances</span>
                  <span className="font-mono font-semibold text-emerald-600">+₹{Number(s.allowance).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Deductions</span>
                  <span className="font-mono font-semibold text-rose-600">-₹{Number(s.deduction).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Net Salary</span>
                  <span className="text-base font-black text-blue-700 font-mono">
                    ₹{Number(s.net_salary).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setActiveSlip(s)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Payslip</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">No salary records found</p>
            <p className="text-xs text-slate-400">Generate a payroll record using "+ Add Salary Record".</p>
          </div>
        )}
      </div>

      {/* Desktop Salary Table (visible on screens >= md) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Month / Year</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">Allowance</th>
                <th className="py-3 px-4">Deduction</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSalaries.length > 0 ? (
                filteredSalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{s.emp_code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 leading-tight">{s.first_name} {s.last_name}</p>
                      <p className="text-[10px] text-slate-400">{s.designation}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.department_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{s.month} {s.year}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">₹{Number(s.basic_salary).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-mono">+₹{Number(s.allowance).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-mono">-₹{Number(s.deduction).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700 text-sm font-mono">
                      ₹{Number(s.net_salary).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveSlip(s)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Payslip</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No salary records found</p>
                    <p className="text-xs text-slate-400 mt-1">Generate a payroll record using "+ Add Salary Record".</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      <SalarySlipModal
        isOpen={!!activeSlip}
        onClose={() => setActiveSlip(null)}
        salary={activeSlip}
      />

      {/* Add Salary Modal */}
      {modalOpen && (
        <div id="add-salary-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Generate Salary Record</h3>
            <p className="text-xs text-slate-500 mb-4">PostgreSQL payroll record computation</p>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={empId}
                  onChange={(e) => handleEmpChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {(employees || []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employee_id} - {e.first_name} {e.last_name} (₹{Number(e.salary).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Month *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Basic (₹) *</label>
                  <input
                    type="number"
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Allowance (₹)</label>
                  <input
                    type="number"
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deduction (₹)</label>
                  <input
                    type="number"
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-rose-700 font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Net Salary Preview */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Calculated Net Pay</span>
                  <p className="text-xl font-black text-blue-950">₹{calculatedNet.toLocaleString()}</p>
                </div>
                <span className="text-[10px] text-blue-700 font-mono">Formula: Basic + Allow - Deduct</span>
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
                  {submitting ? 'Generating...' : 'Save & Issue Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
