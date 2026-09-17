import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Briefcase, IndianRupee, ShieldCheck, Clock } from 'lucide-react';
import { Employee, SalaryRecord, LeaveRequest } from '../types.ts';
import { api } from '../services/api.ts';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ isOpen, onClose, employee }) => {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee && isOpen) {
      setLoading(true);
      Promise.all([
        api.getSalaries({ employee_id: employee.id }),
        api.getLeaves({ employee_id: employee.id })
      ])
        .then(([salData, leaveData]) => {
          setSalaries(Array.isArray(salData) ? salData : []);
          setLeaves(Array.isArray(leaveData) ? leaveData : []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  return (
    <div id="employee-profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div id="employee-profile-card" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 my-8">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6 relative">
          <button
            id="profile-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 border-2 border-white/20 flex items-center justify-center text-xl font-bold text-white shadow-md">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight text-white">{employee.first_name} {employee.last_name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/10 text-blue-200 font-semibold">
                  {employee.employee_id}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">{employee.designation} • {employee.department_name}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  employee.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-slate-500/20 text-slate-300'
                }`}>
                  {employee.status}
                </span>
                <span className="text-[10px] font-medium text-slate-300">
                  {employee.employment_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs / Info */}
        <div className="p-6 space-y-6">
          {/* Key Contact & Detail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Work Email</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Contact Phone</p>
                <p className="text-xs font-semibold text-slate-800">{employee.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Joining Date</p>
                <p className="text-xs font-semibold text-slate-800">{employee.joining_date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <IndianRupee className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Monthly Compensation</p>
                <p className="text-xs font-bold text-slate-800">₹{Number(employee.salary).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {employee.address && (
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Residential Address</p>
                <p className="text-xs text-slate-700">{employee.address}</p>
              </div>
            </div>
          )}

          {/* Salary Records Snapshot */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Salary History</span>
              <span className="text-[10px] text-slate-400 font-normal">{salaries.length} Record(s)</span>
            </h4>
            {salaries.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Period</th>
                      <th className="p-2.5">Basic</th>
                      <th className="p-2.5">Allowance</th>
                      <th className="p-2.5">Deduction</th>
                      <th className="p-2.5 text-right font-bold">Net Salary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salaries.slice(0, 3).map((s) => (
                      <tr key={s.id} className="text-[11px]">
                        <td className="p-2.5 font-semibold text-slate-800">{s.month} {s.year}</td>
                        <td className="p-2.5 text-slate-600">₹{Number(s.basic_salary).toLocaleString()}</td>
                        <td className="p-2.5 text-emerald-600">+₹{Number(s.allowance).toLocaleString()}</td>
                        <td className="p-2.5 text-rose-600">-₹{Number(s.deduction).toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold text-blue-600">₹{Number(s.net_salary).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No salary records generated yet.</p>
            )}
          </div>

          {/* Leave History Snapshot */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Leave History</span>
              <span className="text-[10px] text-slate-400 font-normal">{leaves.length} Request(s)</span>
            </h4>
            {leaves.length > 0 ? (
              <div className="space-y-2">
                {leaves.map((lr) => (
                  <div key={lr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{lr.leave_type}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({lr.start_date} to {lr.end_date} • {lr.number_of_days} days)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">"{lr.reason}"</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lr.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : lr.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {lr.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No leave requests logged.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
