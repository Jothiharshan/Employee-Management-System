import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { SalaryRecord, EmployeeSalaryResponse, User as UserType } from '../../types.ts';
import { api } from '../../services/api.ts';

interface EmployeeSalaryViewProps {
  currentUser: UserType | null;
}

export const EmployeeSalaryView: React.FC<EmployeeSalaryViewProps> = ({ currentUser }) => {
  const [data, setData] = useState<EmployeeSalaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<SalaryRecord | null>(null);

  useEffect(() => {
    loadSalary();
  }, []);

  const loadSalary = async () => {
    try {
      setLoading(true);
      const res = await api.getMySalary();
      setData(res);
      if (res.records && res.records.length > 0) {
        setSelectedPayslip(res.records[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentBreakdown = data?.breakdown || {
    basic_salary: 50000,
    allowance: 7000,
    deduction: 2000,
    net_salary: 55000
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="employee-salary-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Current Salary Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Current Monthly Compensation (September 2026)
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                ₹{currentBreakdown.net_salary.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Processed & Disbursed
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Direct Deposit • State Bank of India • A/C Ending in ****4821
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-wide transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4 text-indigo-300" />
              <span>Print / Download Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Salary Breakdown 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Basic Salary</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
            ₹{currentBreakdown.basic_salary.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Standard wage base</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Allowances (HRA + TA)</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            +₹{currentBreakdown.allowance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Fixed allowances</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Deductions (PF + Tax)</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            -₹{currentBreakdown.deduction.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Provident fund / TDS</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 bg-emerald-50/40 border-emerald-200">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">Net Take-Home</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            ₹{currentBreakdown.net_salary.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">Transferred to employee</p>
        </div>
      </div>

      {/* Payslip Detailed View (Printable Card) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              EMS
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Apex Global Technologies Ltd.</h3>
              <p className="text-xs text-slate-500">Official Payslip for the month of September 2026</p>
            </div>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              PAYSLIP #2026-09-EMP001
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Disbursement Date: 30-Sep-2026</p>
          </div>
        </div>

        {/* Employee Particulars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Employee Name</p>
            <p className="font-bold text-slate-800 mt-0.5">{currentUser?.name || 'Arun Kumar'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Employee Code</p>
            <p className="font-mono font-bold text-slate-800 mt-0.5">{currentUser?.employee_id || 'EMP001'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Department</p>
            <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.department || 'Engineering'}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Designation</p>
            <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.designation || 'Lead Architect'}</p>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Earnings */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-200">
              Earnings & Additions
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Basic Wage Salary</span>
                <span className="font-semibold text-slate-800">₹{currentBreakdown.basic_salary.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-800">₹{Math.round(currentBreakdown.allowance * 0.7).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transport & Special Allowance</span>
                <span className="font-semibold text-slate-800">₹{Math.round(currentBreakdown.allowance * 0.3).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-800">
                <span>Total Gross Earnings</span>
                <span>₹{(currentBreakdown.basic_salary + currentBreakdown.allowance).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-200">
              Statutory & Other Deductions
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Provident Fund (PF)</span>
                <span className="font-semibold text-rose-600">₹{Math.round(currentBreakdown.deduction * 0.6).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Professional Tax & TDS</span>
                <span className="font-semibold text-rose-600">₹{Math.round(currentBreakdown.deduction * 0.4).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Loss of Pay / Unexcused Absences</span>
                <span className="font-semibold text-slate-400">₹0</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-800">
                <span>Total Deductions</span>
                <span className="text-rose-600">₹{currentBreakdown.deduction.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Callout */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-900">Net Payable Amount (In Words):</p>
            <p className="text-xs text-emerald-800 italic">Fifty Five Thousand Indian Rupees Only</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Net Credited</span>
            <p className="text-2xl font-bold text-emerald-800">₹{currentBreakdown.net_salary.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
