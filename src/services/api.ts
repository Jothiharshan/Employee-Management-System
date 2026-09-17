import {
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  SalaryRecord,
  DashboardStats,
  User,
  EmployeeDashboardStats,
  EmployeeAttendanceResponse,
  EmployeeLeaveResponse,
  EmployeeSalaryResponse,
  NotificationItem
} from '../types.ts';

const DEFAULT_DEMO_TOKEN = 'demo-admin-token-2026';

let token: string | null = null;
if (typeof window !== 'undefined') {
  try {
    token = localStorage.getItem('ems_token');
    if (!token) {
      token = DEFAULT_DEMO_TOKEN;
      localStorage.setItem('ems_token', DEFAULT_DEMO_TOKEN);
    }
  } catch (e) {
    token = DEFAULT_DEMO_TOKEN;
  }
} else {
  token = DEFAULT_DEMO_TOKEN;
}

export const setAuthToken = (newToken: string | null) => {
  token = newToken;
  if (typeof window !== 'undefined') {
    try {
      if (newToken) {
        localStorage.setItem('ems_token', newToken);
      } else {
        localStorage.removeItem('ems_token');
      }
    } catch (e) {}
  }
};

export const getAuthToken = (): string => {
  if (!token && typeof window !== 'undefined') {
    try {
      token = localStorage.getItem('ems_token') || DEFAULT_DEMO_TOKEN;
    } catch (e) {
      token = DEFAULT_DEMO_TOKEN;
    }
  }
  return token || DEFAULT_DEMO_TOKEN;
};

const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = { ...extra };
  const currentToken = getAuthToken();
  headers['Authorization'] = `Bearer ${currentToken}`;
  headers['x-auth-token'] = currentToken;
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
};

export const api = {
  getAuthToken,
  setAuthToken,

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await handleResponse(res);
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders()
      });
      return await handleResponse(res);
    } finally {
      setAuthToken(null);
    }
  },

  // Admin Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Employees (Admin Only)
  async getEmployees(params?: { search?: string; department?: string; status?: string; employment_type?: string; sort?: string }): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.status) query.set('status', params.status);
    if (params?.employment_type) query.set('employment_type', params.employment_type);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`/api/employees?${query.toString()}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async createEmployee(data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateEmployee(id: number, data: Partial<Employee>): Promise<{ message: string; employee: Employee }> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteEmployee(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async createDepartment(data: Partial<Department>): Promise<{ message: string; department: Department }> {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateDepartment(id: number, data: Partial<Department>): Promise<{ message: string; department: Department }> {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteDepartment(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Admin Attendance
  async getAttendance(params?: { date?: string; employee_id?: number; status?: string }): Promise<{ records: AttendanceRecord[]; summary: any }> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.employee_id) query.set('employee_id', params.employee_id.toString());
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/attendance?${query.toString()}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async markAttendance(data: Partial<AttendanceRecord>): Promise<{ message: string }> {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAttendance(id: number, data: Partial<AttendanceRecord>): Promise<{ message: string }> {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAttendance(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Admin Leaves
  async getLeaves(params?: { employee_id?: number; status?: string }): Promise<LeaveRequest[]> {
    const query = new URLSearchParams();
    if (params?.employee_id) query.set('employee_id', params.employee_id.toString());
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`/api/leaves?${query.toString()}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async submitLeave(data: Partial<LeaveRequest>): Promise<{ message: string }> {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateLeaveStatus(id: number, status: 'Approved' | 'Rejected'): Promise<{ message: string }> {
    const res = await fetch(`/api/leaves/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async approveLeave(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/leaves/${id}/approve`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async rejectLeave(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/leaves/${id}/reject`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Admin Salaries
  async getSalaries(params?: { employee_id?: number; month?: string; year?: number }): Promise<SalaryRecord[]> {
    const query = new URLSearchParams();
    if (params?.employee_id) query.set('employee_id', params.employee_id.toString());
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year.toString());

    const res = await fetch(`/api/salaries?${query.toString()}`, {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async addSalary(data: Partial<SalaryRecord>): Promise<{ message: string; net_salary: number }> {
    const res = await fetch('/api/salaries', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Admin Reports
  async getReports(): Promise<any> {
    const res = await fetch('/api/reports', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  // Database tools
  async resetDatabase(): Promise<{ message: string }> {
    const res = await fetch('/api/database/reset', {
      method: 'POST',
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async runQuery(sql: string): Promise<{ rows?: any[]; rowCount?: number; message?: string }> {
    const res = await fetch('/api/database/query', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sql })
    });
    return handleResponse(res);
  },

  // ==========================================
  // EMPLOYEE PERSONAL SELF-SERVICE APIS
  // ==========================================
  async getMyDashboard(): Promise<EmployeeDashboardStats> {
    const res = await fetch('/api/my-dashboard', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async getMyProfile(): Promise<Employee> {
    const res = await fetch('/api/my-profile', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async updateMyProfile(data: { phone?: string; address?: string }): Promise<{ message: string; employee: Employee }> {
    const res = await fetch('/api/my-profile', {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMyAttendance(): Promise<EmployeeAttendanceResponse> {
    const res = await fetch('/api/my-attendance', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async clockAttendance(action: 'clock_in' | 'clock_out'): Promise<{ message: string; check_in?: string; check_out?: string }> {
    const res = await fetch('/api/my-attendance/clock', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  },

  async getMyLeaves(): Promise<EmployeeLeaveResponse> {
    const res = await fetch('/api/my-leaves', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async applyMyLeave(data: { leave_type: string; start_date: string; end_date: string; number_of_days: number; reason?: string }): Promise<{ message: string }> {
    const res = await fetch('/api/my-leaves', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMySalary(): Promise<EmployeeSalaryResponse> {
    const res = await fetch('/api/my-salary', {
      headers: authHeaders()
    });
    return handleResponse(res);
  },

  async getMyNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/my-notifications', {
      headers: authHeaders()
    });
    return handleResponse(res);
  }
};
