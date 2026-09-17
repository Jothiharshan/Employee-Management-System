import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { SalaryRecord } from '../types.ts';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: SalaryRecord | null;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({ isOpen, onClose, salary }) => {
  if (!isOpen || !salary) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="salary-slip-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div id="salary-slip-printable-card" className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:m-0 print:border-none print:shadow-none">
        {/* Top Control Bar (hidden during print) */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-bold text-slate-700">Official Payslip Document</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document Body */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  EMS
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">TECHCORP ENTERPRISES PVT LTD</h2>
              </div>
              <p className="text-xs text-slate-500">Bangalore Technology Park, Electronic City, Bengaluru - 560100</p>
              <p className="text-[11px] text-slate-400">Academic Demo Project • EMS Portal</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
                Salary Voucher
              </span>
              <p className="text-xs font-bold text-slate-800 mt-2">{salary.month} {salary.year}</p>
              <p className="text-[10px] text-slate-400 font-mono">SLIP-{salary.id.toString().padStart(5, '0')}</p>
            </div>
          </div>

          {/* Employee Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Employee Name</p>
              <p className="font-bold text-slate-900 text-sm">{salary.first_name} {salary.last_name}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {salary.emp_code}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Department & Role</p>
              <p className="font-bold text-slate-900">{salary.department_name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{salary.designation}</p>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 text-left border-r border-slate-200 w-1/2">Earnings (Credits)</th>
                  <th className="py-2.5 px-4 text-left w-1/2">Deductions (Debits)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 border-r border-slate-200 align-top space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary:</span>
                      <span className="font-semibold text-slate-900">₹{Number(salary.basic_salary).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Special Allowances:</span>
                      <span className="font-semibold text-emerald-600">+₹{Number(salary.allowance).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Statutory Deductions:</span>
                      <span className="font-semibold text-rose-600">-₹{Number(salary.deduction).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Tax / PF / Insurance</span>
                      <span>Included</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2.5 px-4 border-r border-slate-200">
                    <div className="flex justify-between text-slate-800">
                      <span>Total Earnings:</span>
                      <span>₹{(Number(salary.basic_salary) + Number(salary.allowance)).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex justify-between text-slate-800">
                      <span>Total Deductions:</span>
                      <span>₹{Number(salary.deduction).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Pay Highlight Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Net Take-Home Pay</span>
              <p className="text-2xl font-black text-blue-950 tracking-tight">₹{Number(salary.net_salary).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Disbursed
              </span>
            </div>
          </div>

          {/* Signature and Verification */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
            <div className="space-y-1">
              <p className="flex items-center text-slate-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" /> Computer-Generated Statement
              </p>
              <p className="text-[10px] text-slate-400">Generated on 2026-09-16 • PostgreSQL Database verified</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-slate-300 mb-1" />
              <p className="font-semibold text-slate-700">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Finance & Payroll Dept</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
