import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Employee, Department } from '../types.ts';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => Promise<void>;
  employee: Employee | null;
  departments: Department[];
  nextSuggestedId?: string;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  departments,
  nextSuggestedId
}) => {
  const isEdit = !!employee;

  const [formData, setFormData] = useState<Partial<Employee>>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    department_id: departments[0]?.id || 1,
    designation: '',
    joining_date: '2026-09-16',
    employment_type: 'Full-Time',
    salary: 50000,
    status: 'Active',
    address: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        department_id: employee.department_id,
        designation: employee.designation,
        joining_date: employee.joining_date,
        employment_type: employee.employment_type,
        salary: Number(employee.salary),
        status: employee.status,
        address: employee.address || ''
      });
    } else {
      setFormData({
        employee_id: nextSuggestedId || 'EMP049',
        first_name: '',
        last_name: '',
        email: '',
        phone: '+91 98765 432',
        gender: 'Male',
        department_id: departments[0]?.id || 1,
        designation: '',
        joining_date: '2026-09-16',
        employment_type: 'Full-Time',
        salary: 50000,
        status: 'Active',
        address: ''
      });
    }
    setError(null);
  }, [employee, isOpen, departments, nextSuggestedId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.employee_id?.trim()) {
      setError('Employee ID is required.');
      return;
    }
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }
    if (!formData.email?.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone?.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!formData.department_id) {
      setError('Department selection is required.');
      return;
    }
    if (!formData.designation?.trim()) {
      setError('Designation is required.');
      return;
    }
    if (!formData.salary || Number(formData.salary) <= 0) {
      setError('Salary must be a positive number.');
      return;
    }
    if (!formData.joining_date) {
      setError('Date of joining is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        salary: Number(formData.salary),
        department_id: Number(formData.department_id)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="employee-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div id="employee-modal-card" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {isEdit ? `Edit Employee: ${employee?.employee_id}` : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEdit ? 'Update existing personnel record in PostgreSQL' : 'Create new employee profile in PostgreSQL database'}
            </p>
          </div>
          <button
            id="employee-modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-id">
                Employee ID *
              </label>
              <input
                id="emp-form-id"
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                placeholder="EMP001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-first-name">
                First Name *
              </label>
              <input
                id="emp-form-first-name"
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Arun"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-last-name">
                Last Name *
              </label>
              <input
                id="emp-form-last-name"
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Kumar"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-email">
                Email Address *
              </label>
              <input
                id="emp-form-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="arun.kumar@ems.demo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-phone">
                Phone Number *
              </label>
              <input
                id="emp-form-phone"
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-gender">
                Gender *
              </label>
              <select
                id="emp-form-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-department">
                Department * (FK)
              </label>
              <select
                id="emp-form-department"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.department_name} ({dep.department_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-designation">
                Designation *
              </label>
              <input
                id="emp-form-designation"
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Senior Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-joining-date">
                Joining Date *
              </label>
              <input
                id="emp-form-joining-date"
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-type">
                Employment Type *
              </label>
              <select
                id="emp-form-type"
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-salary">
                Salary (₹ Monthly) *
              </label>
              <input
                id="emp-form-salary"
                type="number"
                min="1000"
                step="500"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                placeholder="55000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-status">
                Status *
              </label>
              <select
                id="emp-form-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="emp-form-address">
                Residential Address
              </label>
              <input
                id="emp-form-address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 12/B, Indiranagar, Bengaluru"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              id="emp-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="emp-modal-submit-btn"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center space-x-2 transition-all"
            >
              {submitting ? (
                <span>Saving to PostgreSQL...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? 'Update Employee' : 'Create Employee'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
