import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';
import { Department, User } from '../types.ts';
import { downloadCsv } from '../utils/csvExport.ts';

interface DepartmentsViewProps {
  departments: Department[];
  loading: boolean;
  currentUser: User | null;
  onAddDepartment: (data: Partial<Department>) => Promise<void>;
  onEditDepartment: (id: number, data: Partial<Department>) => Promise<void>;
  onDeleteDepartment: (id: number) => Promise<void>;
  onFilterByDepartment: (deptId: number) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  loading,
  currentUser,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onFilterByDepartment
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    department_id: '',
    department_name: '',
    manager_name: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Deletion confirm
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExportCsv = () => {
    const headers = ['Department Code', 'Department Name', 'Head / Manager', 'Employee Count', 'Description'];
    const rows = (departments || []).map((d) => [
      d.department_id,
      d.department_name,
      d.manager_name,
      d.employee_count || 0,
      d.description || ''
    ]);
    downloadCsv('departments_list_2026', headers, rows);
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({
      department_id: `DEP00${(departments || []).length + 1}`,
      department_name: '',
      manager_name: '',
      description: ''
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      department_id: dept.department_id,
      department_name: dept.department_name,
      manager_name: dept.manager_name,
      description: dept.description
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department_id.trim() || !formData.department_name.trim() || !formData.manager_name.trim()) {
      setError('Please fill in Department ID, Name, and Manager Name.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (editingDept) {
        await onEditDepartment(editingDept.id, formData);
      } else {
        await onAddDepartment(formData);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await onDeleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Cannot delete department.');
    }
  };

  return (
    <div id="departments-view" className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Department Units</h2>
          <p className="text-xs text-slate-500">
            Organizational structure and department managers in PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-departments-csv-btn"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs hover:shadow-xs transition-all"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              id="add-department-btn"
              onClick={openAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(departments || []).map((dept) => (
          <div
            key={dept.id}
            id={`department-card-${dept.department_id}`}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {dept.department_id}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Users className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
                  <span>{dept.employee_count || 0} Staff</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{dept.department_name}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{dept.description}</p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 mb-4">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Department Head</span>
                <p className="text-xs font-bold text-slate-800">{dept.manager_name}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onFilterByDepartment(dept.id)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                <span>View Staff</span>
              </button>

              {isAdmin && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Department"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(dept);
                      setDeleteError(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Department Modal */}
      {modalOpen && (
        <div id="department-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value.toUpperCase() })}
                  placeholder="DEP001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.department_name}
                  onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                  placeholder="e.g. Research & Development"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manager / Head Name *</label>
                <input
                  type="text"
                  required
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of department responsibilities"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 resize-none"
                />
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
                  {submitting ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Delete Department {deleteTarget.department_name}?</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Note: Departments with currently assigned employees cannot be removed to preserve relational integrity.
            </p>
            {deleteError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
