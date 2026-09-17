import React, { useState } from 'react';
import { Menu, Bell, Search, UserCircle2, ChevronDown, Shield, UserCheck, RefreshCw } from 'lucide-react';
import { User } from '../types.ts';

interface TopNavbarProps {
  activeTab: string;
  currentUser: User | null;
  onOpenSidebar: () => void;
  pendingLeavesCount: number;
  onSearch?: (query: string) => void;
  onQuickRoleSwitch: (role: 'Admin' | 'Employee') => void;
  onRefreshData: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  // Admin Tabs
  dashboard: { title: 'Admin Dashboard', subtitle: 'Organization-wide metrics, departments, and attendance overview' },
  employees: { title: 'Employee Management', subtitle: 'Workforce records, additions, updates, and profile views' },
  departments: { title: 'Department Directory', subtitle: 'Organizational divisions, team managers, and headcount' },
  attendance: { title: 'Organization Attendance', subtitle: 'Daily check-in/out records and presence verification across teams' },
  leaves: { title: 'Leave Management', subtitle: 'Review, approve, or reject employee leave applications' },
  salary: { title: 'Payroll & Compensation', subtitle: 'Monthly remuneration, allowances, deductions, and disbursal' },
  reports: { title: 'Analytical Reports', subtitle: 'Workforce distribution, attendance trends, and departmental charts' },
  settings: { title: 'Database & System Settings', subtitle: 'PostgreSQL schema, SQL console, and system configurations' },

  // Employee Self-Service Tabs
  my_dashboard: { title: 'My Dashboard', subtitle: 'Personal work summary, attendance rate, and quick actions' },
  my_profile: { title: 'My Profile', subtitle: 'Personal information, contact details, and official credentials' },
  my_attendance: { title: 'My Attendance Log', subtitle: 'Personal check-in / check-out records and monthly attendance rate' },
  my_leave: { title: 'My Leave Management', subtitle: 'Apply for time-off, check leave balances, and view approval status' },
  my_salary: { title: 'My Salary & Payslip', subtitle: 'Monthly compensation breakdown and downloadable salary slips' },
  my_notifications: { title: 'Notifications & Alerts', subtitle: 'Leave updates, payroll announcements, and company notices' },
  my_settings: { title: 'My Account Settings', subtitle: 'Password management and personal notification preferences' }
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  currentUser,
  onOpenSidebar,
  pendingLeavesCount,
  onQuickRoleSwitch,
  onRefreshData
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const currentInfo = tabTitles[activeTab] || { title: 'EMS Portal', subtitle: 'College Activity Demonstration' };
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <header id="top-navbar" className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          id="mobile-menu-toggle-btn"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">{currentInfo.title}</h1>
          <p className="text-xs text-slate-500 hidden md:block">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Refresh Button */}
        <button
          id="topbar-refresh-btn"
          onClick={onRefreshData}
          title="Refresh data from database"
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="topbar-notifications-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingLeavesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div
              id="topbar-notifications-popover"
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700">Notifications</span>
                <span className="text-[11px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                  {pendingLeavesCount} Pending
                </span>
              </div>
              <div className="p-3">
                {pendingLeavesCount > 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                    <p className="font-semibold">Pending Leave Applications</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      There are {pendingLeavesCount} employee leave request(s) awaiting approval in the Leave Management tab.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No pending notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Quick-Switch Pill */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="quick-role-admin-btn"
            onClick={() => onQuickRoleSwitch('Admin')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isAdmin
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
          <button
            id="quick-role-employee-btn"
            onClick={() => onQuickRoleSwitch('Employee')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              !isAdmin
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Employee</span>
          </button>
        </div>

        {/* User Profile Trigger */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/60"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${isAdmin ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {currentUser?.name.substring(0, 2).toUpperCase() || 'EM'}
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500">{currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentUser?.designation} • {currentUser?.department}
                </span>
              </div>
              <div className="px-2 py-1.5">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Switch Demo</p>
                <button
                  id="dropdown-switch-admin"
                  onClick={() => {
                    onQuickRoleSwitch('Admin');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Switch to Admin</span>
                  {isAdmin && <span className="text-[10px] font-bold text-blue-600">Active</span>}
                </button>
                <button
                  id="dropdown-switch-employee"
                  onClick={() => {
                    onQuickRoleSwitch('Employee');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Switch to Employee (Arun)</span>
                  {!isAdmin && <span className="text-[10px] font-bold text-emerald-600">Active</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
