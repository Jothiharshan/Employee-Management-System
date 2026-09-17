import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  UserCheck,
  User,
  Bell,
  UserPlus,
  ChevronDown,
  X
} from 'lucide-react';
import { User as UserType } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  onAddEmployee
}) => {
  const isAdmin = currentUser?.role === 'Admin';
  const [employeesSubmenuOpen, setEmployeesSubmenuOpen] = useState(true);

  // Admin Navigation structure
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      hasSubmenu: true,
      subItems: [
        { id: 'employees', label: 'All Employees' },
        { id: 'add_employee', label: 'Add Employee', action: onAddEmployee }
      ]
    },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
    { id: 'salary', label: 'Salary', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  // Employee Navigation structure (strictly isolated)
  const employeeNavItems = [
    { id: 'my_dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my_profile', label: 'My Profile', icon: User },
    { id: 'my_attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'my_leave', label: 'My Leave', icon: CalendarDays },
    { id: 'my_salary', label: 'My Salary', icon: CreditCard },
    { id: 'my_notifications', label: 'Notifications', icon: Bell }
  ];

  const currentNavList = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div className="flex-1 overflow-y-auto">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-tight ${
                isAdmin ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                EMS
              </div>
              <div>
                <span className="font-bold text-slate-800 tracking-tight text-base block leading-tight">EMS Portal</span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                  {isAdmin ? 'Admin Console' : 'Employee Self-Service'}
                </span>
              </div>
            </div>
            <button
              id="sidebar-close-btn"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Banner */}
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isAdmin ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isAdmin ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {currentUser?.role}
            </span>
          </div>

          {/* Navigation Section Title */}
          <div className="px-5 pt-4 pb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isAdmin ? 'Organization Administration' : 'Personal Workspace'}
            </p>
          </div>

          {/* Navigation Items List */}
          <nav className="px-3 space-y-1">
            {currentNavList.map((item: any) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.hasSubmenu && isAdmin) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      id={`nav-item-${item.id}`}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setEmployeesSubmenuOpen(!employeesSubmenuOpen);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        isActive || activeTab === 'employees'
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          employeesSubmenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {employeesSubmenuOpen && (
                      <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                        <button
                          id="nav-subitem-all-employees"
                          type="button"
                          onClick={() => {
                            setActiveTab('employees');
                            onClose();
                          }}
                          className={`w-full flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                            activeTab === 'employees'
                              ? 'text-blue-700 font-bold bg-blue-50/60'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                        >
                          <span>• All Employees</span>
                        </button>
                        <button
                          id="nav-subitem-add-employee"
                          type="button"
                          onClick={() => {
                            if (onAddEmployee) onAddEmployee();
                            onClose();
                          }}
                          className="w-full flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-700 hover:bg-slate-100/60 text-left transition-colors"
                        >
                          <UserPlus className="w-3 h-3 text-slate-400" />
                          <span>Add Employee</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    isActive
                      ? isAdmin
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? (isAdmin ? 'text-blue-600' : 'text-emerald-600') : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section (Settings & Logout) */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <button
            id="nav-item-settings"
            type="button"
            onClick={() => {
              setActiveTab(isAdmin ? 'settings' : 'my_settings');
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              activeTab === (isAdmin ? 'settings' : 'my_settings')
                ? isAdmin
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          <button
            id="nav-item-logout"
            type="button"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
