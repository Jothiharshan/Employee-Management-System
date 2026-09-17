import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  Building2,
  ArrowUpDown,
  Mail,
  Calendar,
  DollarSign,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Employee, Department, User } from '../types.ts';
import { downloadCsv } from '../utils/csvExport.ts';

interface EmployeesViewProps {
  employees: Employee[];
  departments: Department[];
  loading: boolean;
  currentUser: User | null;
  initialDepartmentId?: string;
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: number) => Promise<void>;
  onViewEmployee: (emp: Employee) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  loading,
  currentUser,
  initialDepartmentId,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartmentId || 'All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'salary' | 'date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDepartment(initialDepartmentId);
    }
  }, [initialDepartmentId]);

  // Delete modal confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered and Sorted employees
  const filteredEmployees = useMemo(() => {
    return (employees || [])
      .filter((emp) => {
        const matchesSearch =
          emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept =
          selectedDepartment === 'All' || emp.department_id.toString() === selectedDepartment;

        const matchesStatus =
          selectedStatus === 'All' || emp.status === selectedStatus;

        const matchesType =
          selectedType === 'All' || emp.employment_type === selectedType;

        return matchesSearch && matchesDept && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'name') {
          compare = a.first_name.localeCompare(b.first_name);
        } else if (sortBy === 'salary') {
          compare = Number(a.salary) - Number(b.salary);
        } else if (sortBy === 'date') {
          compare = new Date(a.joining_date).getTime() - new Date(b.joining_date).getTime();
        } else {
          compare = a.id - b.id;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [employees, searchQuery, selectedDepartment, selectedStatus, selectedType, sortBy, sortOrder]);

  const handleExportCsv = () => {
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Joining Date',
      'Employment Type',
      'Monthly Salary (INR)',
      'Status',
      'Address'
    ];
    const rows = filteredEmployees.map((emp) => [
      emp.employee_id,
      emp.first_name,
      emp.last_name,
      emp.email,
      emp.phone || '',
      emp.department_name,
      emp.designation,
      emp.joining_date,
      emp.employment_type,
      emp.salary,
      emp.status,
      emp.address || ''
    ]);
    downloadCsv(`employees_directory_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedStatus('All');
    setSelectedType('All');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div id="employees-view" className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500">
            Showing {filteredEmployees.length} of {(employees || []).length} personnel registered in PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-employees-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              id="add-employee-btn"
              onClick={onAddEmployee}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="employee-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, email, or designation..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              id="filter-department-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Departments ({(departments || []).length})</option>
              {(departments || []).map((d) => (
                <option key={d.id} value={d.id.toString()}>
                  {d.department_name} ({d.department_id})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        {/* Quick Sort tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-400">Sort By:</span>
            {(['id', 'name', 'salary', 'date'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (sortBy === s) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(s);
                    setSortOrder('asc');
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize flex items-center space-x-1 transition-colors ${
                  sortBy === s
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{s === 'id' ? 'ID' : s === 'date' ? 'Joining Date' : s}</span>
                {sortBy === s && (
                  <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            Click on any employee to view profile details
          </div>
        </div>
      </div>

      {/* Mobile Employee Cards (visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              id={`employee-card-${emp.employee_id}`}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-xs text-slate-500">{emp.designation}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    emp.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : emp.status === 'On Leave'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">ID</span>
                  <span className="font-mono font-bold text-slate-800">{emp.employee_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Department</span>
                  <span className="font-medium text-slate-800 truncate block">{emp.department_name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Salary</span>
                  <span className="font-bold text-slate-800">₹{Number(emp.salary).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Type</span>
                  <span className="font-medium text-slate-800">{emp.employment_type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  onClick={() => onViewEmployee(emp)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onEditEmployee(emp)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(emp)}
                      className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
            <p className="text-sm font-semibold">No matching employees found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or clear all search terms.</p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Employee List Table (visible on screens >= md) */}
      <div className="hidden md:block rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    id={`employee-row-${emp.employee_id}`}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {emp.employee_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-200">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {emp.department_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {emp.designation}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {emp.joining_date}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {emp.employment_type}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ₹{Number(emp.salary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          id={`view-emp-${emp.employee_id}`}
                          onClick={() => onViewEmployee(emp)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              id={`edit-emp-${emp.employee_id}`}
                              onClick={() => onEditEmployee(emp)}
                              title="Edit Employee"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`delete-emp-${emp.employee_id}`}
                              onClick={() => setDeleteTarget(emp)}
                              title="Delete Employee"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No matching employees found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 mt-3 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div id="delete-confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Delete Employee?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteTarget.first_name} {deleteTarget.last_name}</span> ({deleteTarget.employee_id})? This will remove all associated attendance and salary records from PostgreSQL.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-employee-btn"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
