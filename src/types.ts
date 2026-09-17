export type UserRole = 'Admin' | 'Employee';

export interface User {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
}

export interface Department {
  id: number;
  department_id: string;
  department_name: string;
  manager_name: string;
  description: string;
  employee_count?: number;
  created_at: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  department_id: number;
  department_name?: string;
  dep_code?: string;
  designation: string;
  joining_date: string;
  employment_type: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  address: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  emp_code?: string;
  first_name?: string;
  last_name?: string;
  department_name?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  check_in: string | null;
  check_out: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  emp_code?: string;
  first_name?: string;
  last_name?: string;
  department_name?: string;
  leave_type: 'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Personal Leave';
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export interface SalaryRecord {
  id: number;
  employee_id: number;
  emp_code?: string;
  first_name?: string;
  last_name?: string;
  designation?: string;
  department_name?: string;
  month: string;
  year: number;
  basic_salary: number;
  allowance: number;
  deduction: number;
  net_salary: number;
  created_at: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeaves: number;
  deptDistribution: { name: string; count: number }[];
  attendanceSummary: { status: string; count: number }[];
  recentEmployees: any[];
  recentLeaves: any[];
}

export interface EmployeeDashboardStats {
  employee: {
    id: number;
    employee_id: string;
    name: string;
    department: string;
    designation: string;
    email: string;
    joining_date: string;
  };
  stats: {
    attendancePercentage: number;
    leaveBalanceDays: number;
    thisMonthPresentDays: number;
    currentSalary: number;
  };
  todayAttendance: {
    id?: number;
    date?: string;
    status: string;
    check_in: string | null;
    check_out: string | null;
  };
  recentAttendance: AttendanceRecord[];
  recentLeaves: LeaveRequest[];
}

export interface EmployeeAttendanceResponse {
  records: AttendanceRecord[];
  summary: {
    totalDays: number;
    presentCount: number;
    halfDayCount: number;
    leaveCount: number;
    absentCount: number;
    attendanceRate: number;
  };
}

export interface EmployeeLeaveResponse {
  leaves: LeaveRequest[];
  balance: {
    casual: number;
    sick: number;
    annual: number;
    totalRemaining: number;
    displayBalanceDays: number;
  };
}

export interface EmployeeSalaryResponse {
  currentSalary: number;
  breakdown: {
    basic_salary: number;
    allowance: number;
    deduction: number;
    net_salary: number;
  };
  records: SalaryRecord[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'salary' | 'system' | 'announcement';
  date: string;
  read: boolean;
}
