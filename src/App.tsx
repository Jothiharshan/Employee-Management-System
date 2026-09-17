import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { TopNavbar } from './components/TopNavbar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { EmployeesView } from './components/EmployeesView.tsx';
import { EmployeeModal } from './components/EmployeeModal.tsx';
import { EmployeeProfileModal } from './components/EmployeeProfileModal.tsx';
import { DepartmentsView } from './components/DepartmentsView.tsx';
import { AttendanceView } from './components/AttendanceView.tsx';
import { LeaveManagementView } from './components/LeaveManagementView.tsx';
import { SalaryView } from './components/SalaryView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

// Employee Views
import { EmployeeDashboardView } from './components/employee/EmployeeDashboardView.tsx';
import { EmployeeProfileView } from './components/employee/EmployeeProfileView.tsx';
import { EmployeeAttendanceView } from './components/employee/EmployeeAttendanceView.tsx';
import { EmployeeLeaveView } from './components/employee/EmployeeLeaveView.tsx';
import { EmployeeSalaryView } from './components/employee/EmployeeSalaryView.tsx';
import { EmployeeNotificationsView } from './components/employee/EmployeeNotificationsView.tsx';
import { EmployeeSettingsView } from './components/employee/EmployeeSettingsView.tsx';

import { api } from './services/api.ts';
import {
  User,
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  SalaryRecord,
  DashboardStats,
  EmployeeDashboardStats
} from './types.ts';
import { ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

const pathToTab: Record<string, string> = {
  '/admin/dashboard': 'dashboard',
  '/admin/employees': 'employees',
  '/admin/departments': 'departments',
  '/admin/attendance': 'attendance',
  '/admin/leaves': 'leaves',
  '/admin/salary': 'salary',
  '/admin/reports': 'reports',
  '/admin/settings': 'settings',
  '/employee/dashboard': 'my_dashboard',
  '/employee/profile': 'my_profile',
  '/employee/attendance': 'my_attendance',
  '/employee/leaves': 'my_leave',
  '/employee/salary': 'my_salary',
  '/employee/notifications': 'my_notifications',
  '/employee/settings': 'my_settings'
};

export default function App() {
  // Session & User state with persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ems_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) return parsed;
        }
      } catch (e) {}
    }
    return {
      id: 1,
      employee_id: 'ADM001',
      name: 'Admin User',
      email: 'admin@ems.demo',
      role: 'Admin',
      department: 'Executive',
      designation: 'System Administrator'
    };
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keep persistent user in sync
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('ems_user', JSON.stringify(currentUser));
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('ems_user');
      } catch (e) {}
    }
  }, [currentUser]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    const requestedTab = typeof window !== 'undefined' ? pathToTab[window.location.pathname] : undefined;
    const isEmployeeTab = requestedTab?.startsWith('my_');
    if (requestedTab && ((currentUser?.role === 'Employee') === isEmployeeTab)) {
      return requestedTab;
    }
    return currentUser?.role === 'Employee' ? 'my_dashboard' : 'dashboard';
  });
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Admin Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');

  // Employee Personal Data states
  const [employeeStats, setEmployeeStats] = useState<EmployeeDashboardStats | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Modal states
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [profileModalEmployee, setProfileModalEmployee] = useState<Employee | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  // Load Data safely based on Role
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure a valid token is set in memory and storage
      if (!api.getAuthToken()) {
        api.setAuthToken(currentUser?.role === 'Employee' ? 'demo-employee-token-2026' : 'demo-admin-token-2026');
      }

      if (currentUser?.role === 'Admin') {
        const [statsData, empsData, deptsData, attData, leavesData, salariesData] = await Promise.all([
          api.getDashboardStats(),
          api.getEmployees(),
          api.getDepartments(),
          api.getAttendance({ date: selectedDate }),
          api.getLeaves(),
          api.getSalaries()
        ]);

        setDashboardStats(statsData || null);
        setEmployees(Array.isArray(empsData) ? empsData : []);
        setDepartments(Array.isArray(deptsData) ? deptsData : []);
        setAttendanceRecords(Array.isArray(attData?.records) ? attData.records : []);
        setLeaves(Array.isArray(leavesData) ? leavesData : []);
        setSalaries(Array.isArray(salariesData) ? salariesData : []);
      } else if (currentUser?.role === 'Employee') {
        const empData = await api.getMyDashboard();
        setEmployeeStats(empData || null);
      }
    } catch (err: any) {
      console.error('Error fetching data from PostgreSQL backend:', err?.message || err);
      // Auto-recovery: if token expired or missing, auto-authenticate with demo credentials and retry once
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('token')) {
        try {
          const authRes = await api.login(
            currentUser?.role === 'Employee' ? 'employee@ems.demo' : 'admin@ems.demo',
            currentUser?.role === 'Employee' ? 'employee123' : 'admin123'
          );
          api.setAuthToken(authRes.token);
          setCurrentUser(authRes.user);

          if (authRes.user.role === 'Admin') {
            const [statsData, empsData, deptsData, attData, leavesData, salariesData] = await Promise.all([
              api.getDashboardStats(),
              api.getEmployees(),
              api.getDepartments(),
              api.getAttendance({ date: selectedDate }),
              api.getLeaves(),
              api.getSalaries()
            ]);
            setDashboardStats(statsData || null);
            setEmployees(Array.isArray(empsData) ? empsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setAttendanceRecords(Array.isArray(attData?.records) ? attData.records : []);
            setLeaves(Array.isArray(leavesData) ? leavesData : []);
            setSalaries(Array.isArray(salariesData) ? salariesData : []);
          } else {
            const empData = await api.getMyDashboard();
            setEmployeeStats(empData || null);
          }
        } catch (retryErr) {
          console.error('Auto-recovery login failed:', retryErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.role, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize URL path with Active Tab & Role for realistic deep linking
  useEffect(() => {
    const tabToPathMap: Record<string, string> = {
      dashboard: '/admin/dashboard',
      employees: '/admin/employees',
      departments: '/admin/departments',
      attendance: '/admin/attendance',
      leaves: '/admin/leaves',
      salary: '/admin/salary',
      reports: '/admin/reports',
      settings: '/admin/settings',
      my_dashboard: '/employee/dashboard',
      my_profile: '/employee/profile',
      my_attendance: '/employee/attendance',
      my_leave: '/employee/leaves',
      my_salary: '/employee/salary',
      my_notifications: '/employee/notifications',
      my_settings: '/employee/settings'
    };

    const newPath = tabToPathMap[activeTab];
    if (newPath && window.location.pathname !== newPath) {
      try {
        window.history.replaceState(null, '', newPath);
      } catch (e) {
        // Safe fallback in restricted sandboxes
      }
    }
  }, [activeTab]);

  // Handle Tab Navigation with Role Protection
  const handleNavigateTab = (tab: string) => {
    const adminOnlyTabs = [
      'dashboard',
      'employees',
      'departments',
      'attendance',
      'leaves',
      'salary',
      'reports',
      'settings'
    ];

    if (!isAdmin && adminOnlyTabs.includes(tab)) {
      setAccessDeniedMessage(`Access Denied: You do not have permission to view this page (${tab}). Redirected to Employee Dashboard.`);
      setActiveTab('my_dashboard');
      setTimeout(() => setAccessDeniedMessage(null), 5000);
      return;
    }

    setAccessDeniedMessage(null);
    setActiveTab(tab);
  };

  // Switch role handler (Demo convenience & testing)
  const handleRoleSwitch = async (role: 'Admin' | 'Employee') => {
    setLoading(true);
    setAccessDeniedMessage(null);
    try {
      if (role === 'Admin') {
        const data = await api.login('admin@ems.demo', 'admin123');
        api.setAuthToken(data.token);
        setCurrentUser(data.user);
        setActiveTab('dashboard');
      } else {
        const data = await api.login('employee@ems.demo', 'employee123');
        api.setAuthToken(data.token);
        setCurrentUser(data.user);
        setActiveTab('my_dashboard');
      }
    } catch (err: any) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Login Modal Success Handler
  const handleLoginSuccess = (user: User, token: string) => {
    api.setAuthToken(token);
    setCurrentUser(user);
    setLoginModalOpen(false);
    setAccessDeniedMessage(null);
    if (user.role === 'Admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('my_dashboard');
    }
  };

  // Attendance date change (Admin)
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    try {
      const attData = await api.getAttendance({ date: newDate });
      setAttendanceRecords(attData.records);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Leave approval / rejection
  const handleApproveLeave = async (id: number) => {
    try {
      await api.updateLeaveStatus(id, 'Approved');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await api.updateLeaveStatus(id, 'Rejected');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Employee CRUD (Admin)
  const handleSaveEmployee = async (data: Partial<Employee>) => {
    if (editingEmployee) {
      await api.updateEmployee(editingEmployee.id, data);
    } else {
      await api.createEmployee(data);
    }
    await loadData();
  };

  const handleDeleteEmployee = async (id: number) => {
    await api.deleteEmployee(id);
    await loadData();
  };

  // Department CRUD (Admin)
  const handleAddDepartment = async (data: Partial<Department>) => {
    await api.createDepartment(data);
    await loadData();
  };

  const handleEditDepartment = async (id: number, data: Partial<Department>) => {
    await api.updateDepartment(id, data);
    await loadData();
  };

  const handleDeleteDepartment = async (id: number) => {
    await api.deleteDepartment(id);
    await loadData();
  };

  // Attendance actions (Admin)
  const handleMarkAttendance = async (data: Partial<AttendanceRecord>) => {
    await api.markAttendance(data);
    const attData = await api.getAttendance({ date: selectedDate });
    setAttendanceRecords(attData.records);
    const stats = await api.getDashboardStats();
    setDashboardStats(stats);
  };

  const handleUpdateAttendance = async (id: number, data: Partial<AttendanceRecord>) => {
    await api.updateAttendance(id, data);
    const attData = await api.getAttendance({ date: selectedDate });
    setAttendanceRecords(attData.records);
    const stats = await api.getDashboardStats();
    setDashboardStats(stats);
  };

  // Leave submission (Admin fallback)
  const handleSubmitLeave = async (data: Partial<LeaveRequest>) => {
    await api.submitLeave(data);
    await loadData();
  };

  // Salary actions (Admin)
  const handleAddSalary = async (data: Partial<SalaryRecord>) => {
    await api.addSalary(data);
    await loadData();
  };

  // Pending leaves count for Admin badge
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  // Next suggested employee ID
  const nextSuggestedId = `EMP${(employees.length + 1).toString().padStart(3, '0')}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50/50 flex font-sans antialiased text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        currentUser={currentUser}
        onLogout={() => setLoginModalOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddEmployee={() => {
          if (isAdmin) {
            setEditingEmployee(null);
            setEmployeeModalOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenSidebar={() => setSidebarOpen(true)}
          pendingLeavesCount={pendingLeavesCount}
          onQuickRoleSwitch={handleRoleSwitch}
          onRefreshData={loadData}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4">
          {/* Access Denied Banner */}
          {accessDeniedMessage && (
            <div
              id="access-denied-alert"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{accessDeniedMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setAccessDeniedMessage(null)}
                className="text-rose-600 hover:text-rose-800 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* ADMIN INTERFACES (Organization-wide management)             */}
          {/* ============================================================ */}

          {isAdmin && (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={dashboardStats}
                  loading={loading}
                  onNavigateTab={handleNavigateTab}
                  currentUser={currentUser}
                  onApproveLeave={handleApproveLeave}
                  onRejectLeave={handleRejectLeave}
                />
              )}

              {activeTab === 'employees' && (
                <EmployeesView
                  employees={employees}
                  departments={departments}
                  loading={loading}
                  currentUser={currentUser}
                  onAddEmployee={() => {
                    setEditingEmployee(null);
                    setEmployeeModalOpen(true);
                  }}
                  onEditEmployee={(emp) => {
                    setEditingEmployee(emp);
                    setEmployeeModalOpen(true);
                  }}
                  onDeleteEmployee={handleDeleteEmployee}
                  onViewEmployee={(emp) => setProfileModalEmployee(emp)}
                />
              )}

              {activeTab === 'departments' && (
                <DepartmentsView
                  departments={departments}
                  loading={loading}
                  currentUser={currentUser}
                  onAddDepartment={handleAddDepartment}
                  onEditDepartment={handleEditDepartment}
                  onDeleteDepartment={handleDeleteDepartment}
                  onFilterByDepartment={() => {
                    setActiveTab('employees');
                  }}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  records={attendanceRecords}
                  employees={employees}
                  loading={loading}
                  currentUser={currentUser}
                  onMarkAttendance={handleMarkAttendance}
                  onUpdateAttendance={handleUpdateAttendance}
                  selectedDate={selectedDate}
                  setSelectedDate={handleDateChange}
                />
              )}

              {activeTab === 'leaves' && (
                <LeaveManagementView
                  leaves={leaves}
                  employees={employees}
                  loading={loading}
                  currentUser={currentUser}
                  onSubmitLeave={handleSubmitLeave}
                  onApproveLeave={handleApproveLeave}
                  onRejectLeave={handleRejectLeave}
                />
              )}

              {activeTab === 'salary' && (
                <SalaryView
                  salaries={salaries}
                  employees={employees}
                  loading={loading}
                  currentUser={currentUser}
                  onAddSalary={handleAddSalary}
                />
              )}

              {activeTab === 'reports' && <ReportsView />}

              {activeTab === 'settings' && <SettingsView onDataReset={loadData} />}
            </>
          )}

          {/* ============================================================ */}
          {/* EMPLOYEE INTERFACES (Strictly personal self-service)         */}
          {/* ============================================================ */}

          {!isAdmin && (
            <>
              {activeTab === 'my_dashboard' && (
                <EmployeeDashboardView
                  stats={employeeStats}
                  loading={loading}
                  currentUser={currentUser}
                  onNavigateTab={handleNavigateTab}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'my_profile' && (
                <EmployeeProfileView currentUser={currentUser} />
              )}

              {activeTab === 'my_attendance' && (
                <EmployeeAttendanceView currentUser={currentUser} />
              )}

              {activeTab === 'my_leave' && (
                <EmployeeLeaveView currentUser={currentUser} />
              )}

              {activeTab === 'my_salary' && (
                <EmployeeSalaryView currentUser={currentUser} />
              )}

              {activeTab === 'my_notifications' && (
                <EmployeeNotificationsView currentUser={currentUser} />
              )}

              {activeTab === 'my_settings' && (
                <EmployeeSettingsView currentUser={currentUser} />
              )}

              {/* Fallback Guard: If an Employee accidentally reaches an Admin tab */}
              {[
                'dashboard',
                'employees',
                'departments',
                'attendance',
                'leaves',
                'salary',
                'reports',
                'settings'
              ].includes(activeTab) && (
                <div id="employee-access-denied-fallback" className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    You do not have permission to view this organization administration page. Employee accounts are strictly restricted to personal self-service tools.
                  </p>
                  <button
                    onClick={() => setActiveTab('my_dashboard')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to My Dashboard</span>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Employee Add/Edit Modal (Admin Only) */}
      {isAdmin && (
        <EmployeeModal
          isOpen={employeeModalOpen}
          onClose={() => setEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          employee={editingEmployee}
          departments={departments}
          nextSuggestedId={nextSuggestedId}
        />
      )}

      {/* Employee Full Profile Modal (Admin Only) */}
      {isAdmin && (
        <EmployeeProfileModal
          isOpen={!!profileModalEmployee}
          onClose={() => setProfileModalEmployee(null)}
          employee={profileModalEmployee}
        />
      )}

      {/* Login / Role Selection Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
