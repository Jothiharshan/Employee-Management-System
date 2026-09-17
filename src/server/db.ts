import { newDb, IMemoryDb } from 'pg-mem';

let dbInstance: IMemoryDb | null = null;

export interface DepartmentRow {
  id: number;
  department_id: string;
  department_name: string;
  manager_name: string;
  description: string;
  created_at: string;
}

export interface EmployeeRow {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  department_id: number;
  designation: string;
  joining_date: string;
  employment_type: string;
  salary: number;
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRow {
  id: number;
  employee_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  check_in: string | null;
  check_out: string | null;
  created_at: string;
}

export interface LeaveRequestRow {
  id: number;
  employee_id: number;
  leave_type: 'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Personal Leave';
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
}

export interface SalaryRow {
  id: number;
  employee_id: number;
  month: string;
  year: number;
  basic_salary: number;
  allowance: number;
  deduction: number;
  net_salary: number;
  created_at: string;
}

export function getDb(): IMemoryDb {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

export function resetDatabase(): IMemoryDb {
  dbInstance = initDatabase();
  return dbInstance;
}

function initDatabase(): IMemoryDb {
  const db = newDb();

  // Register helpful math/string functions
  try {
    db.public.registerFunction({
      name: 'round',
      implementation: (val: any) => Math.round(Number(val))
    });
  } catch (e) {
    // Ignore if already registered
  }

  // Create PostgreSQL Tables with Relational Constraints
  db.public.none(`
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      department_id VARCHAR(50) UNIQUE NOT NULL,
      department_name VARCHAR(100) NOT NULL,
      manager_name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(50) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
      designation VARCHAR(100) NOT NULL,
      joining_date VARCHAR(20) NOT NULL,
      employment_type VARCHAR(50) NOT NULL,
      salary NUMERIC NOT NULL,
      status VARCHAR(50) NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE attendance (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL,
      check_in VARCHAR(20),
      check_out VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE leave_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      leave_type VARCHAR(50) NOT NULL,
      start_date VARCHAR(20) NOT NULL,
      end_date VARCHAR(20) NOT NULL,
      number_of_days INTEGER NOT NULL,
      reason TEXT,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE salary (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      month VARCHAR(30) NOT NULL,
      year INTEGER NOT NULL,
      basic_salary NUMERIC NOT NULL,
      allowance NUMERIC NOT NULL,
      deduction NUMERIC NOT NULL,
      net_salary NUMERIC NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData(db);

  return db;
}

function seedData(db: IMemoryDb) {
  // 1. Seed 6 Departments
  const departmentsData = [
    { code: 'DEP001', name: 'Engineering', manager: 'Suresh Kumar', desc: 'Software development, architecture, QA, and core engineering operations.' },
    { code: 'DEP002', name: 'HR', manager: 'Anitha Raj', desc: 'Talent recruitment, employee relations, culture, and benefits management.' },
    { code: 'DEP003', name: 'Finance', manager: 'Ravi Kumar', desc: 'Corporate accounting, financial audit, payroll, and fiscal planning.' },
    { code: 'DEP004', name: 'Marketing', manager: 'Priya Menon', desc: 'Brand positioning, digital marketing, public relations, and customer outreach.' },
    { code: 'DEP005', name: 'IT', manager: 'Manoj S', desc: 'Infrastructure, cybersecurity, systems administration, and tech support.' },
    { code: 'DEP006', name: 'Operations', manager: 'Karthik R', desc: 'Facility coordination, supply logistics, and process workflow optimization.' }
  ];

  for (const dep of departmentsData) {
    db.public.none(`
      INSERT INTO departments (department_id, department_name, manager_name, description)
      VALUES ('${dep.code}', '${dep.name}', '${dep.manager}', '${dep.desc}');
    `);
  }

  // 2. Seed 48 Employees (Matching prompt specification with Realistic Indian & Global demo names)
  const employeeSeeds = [
    { id: 'EMP001', first: 'Arun', last: 'Kumar', email: 'arun.kumar@ems.demo', phone: '+91 98765 43210', gender: 'Male', depId: 1, desig: 'Senior Engineer', join: '2022-06-15', type: 'Full-Time', sal: 55000, status: 'Active', addr: 'No 45, 2nd Main, Indiranagar, Bengaluru' },
    { id: 'EMP002', first: 'Priya', last: 'Sharma', email: 'priya.sharma@ems.demo', phone: '+91 98765 43211', gender: 'Female', depId: 2, desig: 'HR Executive', join: '2023-01-10', type: 'Full-Time', sal: 42000, status: 'Active', addr: 'Flat 302, Green Glen Layout, Bellandur, Bengaluru' },
    { id: 'EMP003', first: 'Rahul', last: 'Raj', email: 'rahul.raj@ems.demo', phone: '+91 98765 43212', gender: 'Male', depId: 3, desig: 'Accountant', join: '2023-03-20', type: 'Full-Time', sal: 48000, status: 'Active', addr: '12/A, Gandhi Nagar, Chennai' },
    { id: 'EMP004', first: 'Divya', last: 'S', email: 'divya.s@ems.demo', phone: '+91 98765 43213', gender: 'Female', depId: 4, desig: 'Marketing Executive', join: '2023-09-05', type: 'Full-Time', sal: 38000, status: 'Active', addr: '88, Anna Salai, T. Nagar, Chennai' },
    { id: 'EMP005', first: 'Karthik', last: 'M', email: 'karthik.m@ems.demo', phone: '+91 98765 43214', gender: 'Male', depId: 5, desig: 'Software Engineer', join: '2022-11-12', type: 'Full-Time', sal: 52000, status: 'Active', addr: '5th Cross, HSR Layout Sector 1, Bengaluru' },
    { id: 'EMP006', first: 'Meena', last: 'R', email: 'meena.r@ems.demo', phone: '+91 98765 43215', gender: 'Female', depId: 6, desig: 'Operations Manager', join: '2021-04-01', type: 'Full-Time', sal: 65000, status: 'On Leave', addr: 'B-14, Whitefield Main Road, Bengaluru' },
    { id: 'EMP007', first: 'Naveen', last: 'Kumar', email: 'naveen.kumar@ems.demo', phone: '+91 98765 43216', gender: 'Male', depId: 1, desig: 'Design Engineer', join: '2023-08-18', type: 'Full-Time', sal: 46000, status: 'Active', addr: 'Block C, Silver Springs, Marathahalli, Bengaluru' },
    { id: 'EMP008', first: 'Anitha', last: 'Raj', email: 'anitha.raj@ems.demo', phone: '+91 98765 43217', gender: 'Female', depId: 2, desig: 'HR Manager', join: '2020-02-14', type: 'Full-Time', sal: 60000, status: 'Active', addr: '23, Kasturba Road, Sampangi Rama Nagar, Bengaluru' },
    { id: 'EMP009', first: 'Suresh', last: 'B', email: 'suresh.b@ems.demo', phone: '+91 98765 43218', gender: 'Male', depId: 5, desig: 'System Administrator', join: '2022-05-11', type: 'Full-Time', sal: 50000, status: 'Active', addr: '41, 10th Ave, Ashok Nagar, Chennai' },
    { id: 'EMP010', first: 'Kavya', last: 'P', email: 'kavya.p@ems.demo', phone: '+91 98765 43219', gender: 'Female', depId: 4, desig: 'Marketing Manager', join: '2021-07-09', type: 'Full-Time', sal: 58000, status: 'Active', addr: 'Tower 4, Sobha City, Thanisandra, Bengaluru' },
    { id: 'EMP011', first: 'Vikram', last: 'Sethi', email: 'vikram.sethi@ems.demo', phone: '+91 98765 43220', gender: 'Male', depId: 1, desig: 'Tech Lead', join: '2020-03-01', type: 'Full-Time', sal: 72000, status: 'Active', addr: '71, Richmond Road, Bengaluru' },
    { id: 'EMP012', first: 'Sneha', last: 'Patel', email: 'sneha.patel@ems.demo', phone: '+91 98765 43221', gender: 'Female', depId: 3, desig: 'Senior Financial Analyst', join: '2022-10-15', type: 'Full-Time', sal: 56000, status: 'Active', addr: '104, Embassy Residency, Velachery, Chennai' },
    { id: 'EMP013', first: 'Amit', last: 'Verma', email: 'amit.verma@ems.demo', phone: '+91 98765 43222', gender: 'Male', depId: 5, desig: 'DevOps Specialist', join: '2023-01-02', type: 'Full-Time', sal: 54000, status: 'Active', addr: '89, Koramangala 4th Block, Bengaluru' },
    { id: 'EMP014', first: 'Pooja', last: 'Nair', email: 'pooja.nair@ems.demo', phone: '+91 98765 43223', gender: 'Female', depId: 2, desig: 'Talent Acquisition Specialist', join: '2023-04-19', type: 'Full-Time', sal: 44000, status: 'Active', addr: '15, Marine Lines, Kochi' },
    { id: 'EMP015', first: 'Rajesh', last: 'G', email: 'rajesh.g@ems.demo', phone: '+91 98765 43224', gender: 'Male', depId: 1, desig: 'QA Automation Engineer', join: '2022-08-12', type: 'Full-Time', sal: 45000, status: 'Active', addr: '19, Bannerghatta Road, Bengaluru' },
    { id: 'EMP016', first: 'Deepa', last: 'Joshi', email: 'deepa.joshi@ems.demo', phone: '+91 98765 43225', gender: 'Female', depId: 4, desig: 'Content Strategist', join: '2023-05-25', type: 'Full-Time', sal: 41000, status: 'Active', addr: 'Flat 503, Skyline Oasis, Vidyavihar, Mumbai' },
    { id: 'EMP017', first: 'Sanjay', last: 'K', email: 'sanjay.k@ems.demo', phone: '+91 98765 43226', gender: 'Male', depId: 6, desig: 'Logistics Coordinator', join: '2023-09-10', type: 'Full-Time', sal: 40000, status: 'Active', addr: 'No 3, Industrial Estate, Peenya, Bengaluru' },
    { id: 'EMP018', first: 'Harini', last: 'V', email: 'harini.v@ems.demo', phone: '+91 98765 43227', gender: 'Female', depId: 5, desig: 'Full Stack Developer', join: '2022-12-03', type: 'Full-Time', sal: 53000, status: 'Active', addr: '45, BTM 2nd Stage, Bengaluru' },
    { id: 'EMP019', first: 'Manoj', last: 'S', email: 'manoj.s@ems.demo', phone: '+91 98765 43228', gender: 'Male', depId: 5, desig: 'IT Director', join: '2019-08-10', type: 'Full-Time', sal: 82000, status: 'Active', addr: '62, Lavelle Road, Bengaluru' },
    { id: 'EMP020', first: 'Lakshmi', last: 'N', email: 'lakshmi.n@ems.demo', phone: '+91 98765 43229', gender: 'Female', depId: 3, desig: 'Payroll Specialist', join: '2022-06-14', type: 'Full-Time', sal: 46000, status: 'Active', addr: '34, Malleshwaram 8th Cross, Bengaluru' },
    { id: 'EMP021', first: 'Praveen', last: 'Chander', email: 'praveen.c@ems.demo', phone: '+91 98765 43230', gender: 'Male', depId: 1, desig: 'Cloud Architect', join: '2021-01-15', type: 'Full-Time', sal: 78000, status: 'Active', addr: '204, Brigade Gateway, Rajajinagar, Bengaluru' },
    { id: 'EMP022', first: 'Ritu', last: 'Saxena', email: 'ritu.saxena@ems.demo', phone: '+91 98765 43231', gender: 'Female', depId: 4, desig: 'Brand Manager', join: '2023-02-18', type: 'Full-Time', sal: 51000, status: 'Active', addr: '11, Defence Colony, New Delhi' },
    { id: 'EMP023', first: 'Ganesh', last: 'Pillai', email: 'ganesh.p@ems.demo', phone: '+91 98765 43232', gender: 'Male', depId: 6, desig: 'Quality Inspector', join: '2022-07-20', type: 'Contract', sal: 42000, status: 'Inactive', addr: '10, Guindy Industrial Area, Chennai' },
    { id: 'EMP024', first: 'Shilpa', last: 'Rao', email: 'shilpa.rao@ems.demo', phone: '+91 98765 43233', gender: 'Female', depId: 2, desig: 'HR Operations Associate', join: '2023-11-08', type: 'Full-Time', sal: 39000, status: 'Active', addr: '51, Jayanagar 4th Block, Bengaluru' },
    { id: 'EMP025', first: 'Vijay', last: 'Raghavan', email: 'vijay.r@ems.demo', phone: '+91 98765 43234', gender: 'Male', depId: 1, desig: 'Firmware Engineer', join: '2022-04-04', type: 'Full-Time', sal: 57000, status: 'Active', addr: '82, Electronic City Phase 1, Bengaluru' },
    { id: 'EMP026', first: 'Swati', last: 'Bhatt', email: 'swati.bhatt@ems.demo', phone: '+91 98765 43235', gender: 'Female', depId: 3, desig: 'Tax Consultant', join: '2022-09-01', type: 'Full-Time', sal: 50000, status: 'On Leave', addr: 'Flat 12B, Prestige Acropolis, Koramangala, Bengaluru' },
    { id: 'EMP027', first: 'Balaji', last: 'Sundaram', email: 'balaji.s@ems.demo', phone: '+91 98765 43236', gender: 'Male', depId: 5, desig: 'Database Administrator', join: '2021-03-22', type: 'Full-Time', sal: 55000, status: 'Active', addr: '29, Cathedral Road, Chennai' },
    { id: 'EMP028', first: 'Madhuri', last: 'Sen', email: 'madhuri.sen@ems.demo', phone: '+91 98765 43237', gender: 'Female', depId: 4, desig: 'SEO Specialist', join: '2024-01-11', type: 'Full-Time', sal: 43000, status: 'Active', addr: '17, Salt Lake Sector 5, Kolkata' },
    { id: 'EMP029', first: 'Arvind', last: 'Swaminathan', email: 'arvind.s@ems.demo', phone: '+91 98765 43238', gender: 'Male', depId: 1, desig: 'Frontend Specialist', join: '2023-05-16', type: 'Full-Time', sal: 54000, status: 'Active', addr: '94, Basavanagudi, Bengaluru' },
    { id: 'EMP030', first: 'Gayathri', last: 'Ram', email: 'gayathri.ram@ems.demo', phone: '+91 98765 43239', gender: 'Female', depId: 6, desig: 'Warehouse Supervisor', join: '2022-10-02', type: 'Full-Time', sal: 44000, status: 'Active', addr: '6, OMR Road, Sholinganallur, Chennai' },
    { id: 'EMP031', first: 'Rohit', last: 'Deshmukh', email: 'rohit.d@ems.demo', phone: '+91 98765 43240', gender: 'Male', depId: 1, desig: 'Backend Developer', join: '2023-07-17', type: 'Full-Time', sal: 52000, status: 'Active', addr: '44, Kothrud, Pune' },
    { id: 'EMP032', first: 'Bhavana', last: 'K', email: 'bhavana.k@ems.demo', phone: '+91 98765 43241', gender: 'Female', depId: 5, desig: 'Security Analyst', join: '2023-02-05', type: 'Full-Time', sal: 58000, status: 'Active', addr: '8, Sarjapur Road, Bengaluru' },
    { id: 'EMP033', first: 'Sandeep', last: 'Reddy', email: 'sandeep.r@ems.demo', phone: '+91 98765 43242', gender: 'Male', depId: 3, desig: 'Accounts Payable Lead', join: '2022-09-19', type: 'Full-Time', sal: 47000, status: 'Active', addr: '72, Banjara Hills, Hyderabad' },
    { id: 'EMP034', first: 'Neha', last: 'Aggarwal', email: 'neha.a@ems.demo', phone: '+91 98765 43243', gender: 'Female', depId: 2, desig: 'Employee Relations Specialist', join: '2023-03-14', type: 'Full-Time', sal: 43000, status: 'Active', addr: '16, Cyber City, Gurugram' },
    { id: 'EMP035', first: 'Vignesh', last: 'Murugan', email: 'vignesh.m@ems.demo', phone: '+91 98765 43244', gender: 'Male', depId: 1, desig: 'Junior Software Engineer', join: '2024-08-01', type: 'Full-Time', sal: 36000, status: 'Active', addr: '91, KK Nagar, Madurai' },
    { id: 'EMP036', first: 'Keerthi', last: 'V', email: 'keerthi.v@ems.demo', phone: '+91 98765 43245', gender: 'Female', depId: 4, desig: 'Digital Advertising Specialist', join: '2023-10-10', type: 'Full-Time', sal: 42000, status: 'Active', addr: '33, Adyar, Chennai' },
    { id: 'EMP037', first: 'Anand', last: 'Shankar', email: 'anand.s@ems.demo', phone: '+91 98765 43246', gender: 'Male', depId: 6, desig: 'Supply Chain Planner', join: '2022-04-08', type: 'Full-Time', sal: 49000, status: 'Active', addr: '55, Hebbal Kempapura, Bengaluru' },
    { id: 'EMP038', first: 'Preeti', last: 'Kulkarni', email: 'preeti.k@ems.demo', phone: '+91 98765 43247', gender: 'Female', depId: 1, desig: 'Mobile Developer', join: '2022-06-12', type: 'Part-Time', sal: 53000, status: 'Inactive', addr: '18, FC Road, Shivajinagar, Pune' },
    { id: 'EMP039', first: 'Varun', last: 'Kapoor', email: 'varun.k@ems.demo', phone: '+91 98765 43248', gender: 'Male', depId: 5, desig: 'Network Engineer', join: '2023-11-23', type: 'Full-Time', sal: 48000, status: 'Active', addr: '77, Vasant Vihar, New Delhi' },
    { id: 'EMP040', first: 'Tanvi', last: 'Mehra', email: 'tanvi.m@ems.demo', phone: '+91 98765 43249', gender: 'Female', depId: 3, desig: 'Financial Controller', join: '2020-05-05', type: 'Full-Time', sal: 68000, status: 'Active', addr: '4, Bandra Kurla Complex, Mumbai' },
    { id: 'EMP041', first: 'Ramesh', last: 'Krishnan', email: 'ramesh.k@ems.demo', phone: '+91 98765 43250', gender: 'Male', depId: 1, desig: 'Principal Architect', join: '2019-01-11', type: 'Full-Time', sal: 88000, status: 'Active', addr: '2, Ulsoor Lake View, Bengaluru' },
    { id: 'EMP042', first: 'Shweta', last: 'Iyer', email: 'shweta.i@ems.demo', phone: '+91 98765 43251', gender: 'Female', depId: 2, desig: 'Learning & Development Coordinator', join: '2023-08-16', type: 'Full-Time', sal: 41000, status: 'Active', addr: '28, Alwarpet, Chennai' },
    { id: 'EMP043', first: 'Deepak', last: 'Chawla', email: 'deepak.c@ems.demo', phone: '+91 98765 43252', gender: 'Male', depId: 4, desig: 'Graphic Designer', join: '2024-02-28', type: 'Full-Time', sal: 37000, status: 'Active', addr: '14, Sector 18, Noida' },
    { id: 'EMP044', first: 'Sangeetha', last: 'Nair', email: 'sangeetha.n@ems.demo', phone: '+91 98765 43253', gender: 'Female', depId: 6, desig: 'Facility Manager', join: '2021-05-19', type: 'Full-Time', sal: 52000, status: 'Active', addr: '63, Panampilly Nagar, Ernakulam' },
    { id: 'EMP045', first: 'Ashok', last: 'Kumar', email: 'ashok.k@ems.demo', phone: '+91 98765 43254', gender: 'Male', depId: 1, desig: 'Systems Engineer', join: '2023-09-09', type: 'Full-Time', sal: 51000, status: 'Active', addr: '101, Mahadevapura, Bengaluru' },
    { id: 'EMP046', first: 'Sunita', last: 'Gupte', email: 'sunita.g@ems.demo', phone: '+91 98765 43255', gender: 'Female', depId: 5, desig: 'Helpdesk Engineer', join: '2024-04-15', type: 'Full-Time', sal: 35000, status: 'Active', addr: '5, Model Colony, Pune' },
    { id: 'EMP047', first: 'Mohan', last: 'Das', email: 'mohan.d@ems.demo', phone: '+91 98765 43256', gender: 'Male', depId: 3, desig: 'Internal Auditor', join: '2022-12-01', type: 'Full-Time', sal: 53000, status: 'Active', addr: '81, MG Road, Secunderabad' },
    { id: 'EMP048', first: 'Jyoti', last: 'Mishra', email: 'jyoti.m@ems.demo', phone: '+91 98765 43257', gender: 'Female', depId: 4, desig: 'PR Executive', join: '2023-06-18', type: 'Full-Time', sal: 40000, status: 'Active', addr: '37, Hazratganj, Lucknow' }
  ];

  for (const emp of employeeSeeds) {
    db.public.none(`
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone, gender, department_id,
        designation, joining_date, employment_type, salary, status, address
      ) VALUES (
        '${emp.id}', '${emp.first}', '${emp.last}', '${emp.email}', '${emp.phone}', '${emp.gender}',
        ${emp.depId}, '${emp.desig}', '${emp.join}', '${emp.type}', ${emp.sal}, '${emp.status}', '${emp.addr}'
      );
    `);
  }

  // 3. Seed Attendance Records
  // Today date: 2026-09-16 (matching example in prompt)
  // 42 Present, 4 Leave, 2 Absent = 48 employees today!
  const today = '2026-09-16';
  const yesterday = '2026-09-15';
  const dayBefore = '2026-09-14';

  // Seed Today's Attendance for all 48 employees:
  for (let empId = 1; empId <= 48; empId++) {
    let status = 'Present';
    let checkIn: string | null = '09:05 AM';
    let checkOut: string | null = '05:45 PM';

    if (empId === 6 || empId === 26 || empId === 10 || empId === 34) {
      status = 'Leave';
      checkIn = null;
      checkOut = null;
    } else if (empId === 3 || empId === 23) {
      status = 'Absent';
      checkIn = null;
      checkOut = null;
    } else if (empId % 7 === 0) {
      status = 'Half Day';
      checkIn = '09:15 AM';
      checkOut = '01:30 PM';
    } else {
      const minIn = 9 * 60 + (empId % 25);
      const minOut = 17 * 60 + 30 + (empId % 30);
      const inH = Math.floor(minIn / 60);
      const inM = (minIn % 60).toString().padStart(2, '0');
      const outH = Math.floor(minOut / 60) - 12;
      const outM = (minOut % 60).toString().padStart(2, '0');
      checkIn = `0${inH}:${inM} AM`;
      checkOut = `0${outH}:${outM} PM`;
    }

    db.public.none(`
      INSERT INTO attendance (employee_id, date, status, check_in, check_out)
      VALUES (${empId}, '${today}', '${status}', ${checkIn ? `'${checkIn}'` : 'NULL'}, ${checkOut ? `'${checkOut}'` : 'NULL'});
    `);
  }

  // Seed Yesterday's Attendance for 48 employees
  for (let empId = 1; empId <= 48; empId++) {
    const isLeave = empId === 6 || empId === 2;
    const isAbsent = empId === 12;
    const status = isLeave ? 'Leave' : isAbsent ? 'Absent' : 'Present';
    const checkIn = isLeave || isAbsent ? null : '09:10 AM';
    const checkOut = isLeave || isAbsent ? null : '05:40 PM';

    db.public.none(`
      INSERT INTO attendance (employee_id, date, status, check_in, check_out)
      VALUES (${empId}, '${yesterday}', '${status}', ${checkIn ? `'${checkIn}'` : 'NULL'}, ${checkOut ? `'${checkOut}'` : 'NULL'});
    `);
  }

  // Seed Day Before Yesterday Attendance for 30 employees
  for (let empId = 1; empId <= 30; empId++) {
    const status = empId === 6 ? 'Leave' : 'Present';
    const checkIn = empId === 6 ? null : '09:00 AM';
    const checkOut = empId === 6 ? null : '05:30 PM';

    db.public.none(`
      INSERT INTO attendance (employee_id, date, status, check_in, check_out)
      VALUES (${empId}, '${dayBefore}', '${status}', ${checkIn ? `'${checkIn}'` : 'NULL'}, ${checkOut ? `'${checkOut}'` : 'NULL'});
    `);
  }

  // 4. Seed Leave Requests (20 records, with 3 Pending for prompt accuracy)
  const leaveSeeds = [
    { empId: 1, type: 'Casual Leave', start: '2026-09-18', end: '2026-09-19', days: 2, reason: 'Family function in hometown', status: 'Pending' },
    { empId: 2, type: 'Sick Leave', start: '2026-09-15', end: '2026-09-16', days: 2, reason: 'Viral fever and doctor advice', status: 'Approved' },
    { empId: 3, type: 'Casual Leave', start: '2026-09-20', end: '2026-09-20', days: 1, reason: 'Personal work at bank', status: 'Rejected' },
    { empId: 5, type: 'Annual Leave', start: '2026-09-25', end: '2026-09-28', days: 4, reason: 'Scheduled annual vacation', status: 'Pending' },
    { empId: 6, type: 'Personal Leave', start: '2026-09-16', end: '2026-09-17', days: 2, reason: 'Relocation assistance', status: 'Approved' },
    { empId: 7, type: 'Casual Leave', start: '2026-09-22', end: '2026-09-23', days: 2, reason: 'Brother wedding ceremony', status: 'Pending' },
    { empId: 8, type: 'Sick Leave', start: '2026-08-10', end: '2026-08-12', days: 3, reason: 'Severe migraine treatment', status: 'Approved' },
    { empId: 9, type: 'Personal Leave', start: '2026-08-18', end: '2026-08-18', days: 1, reason: 'Govt document registration', status: 'Approved' },
    { empId: 10, type: 'Casual Leave', start: '2026-09-16', end: '2026-09-16', days: 1, reason: 'Parent-teacher conference', status: 'Approved' },
    { empId: 11, type: 'Annual Leave', start: '2026-07-01', end: '2026-07-05', days: 5, reason: 'Summer holiday trip', status: 'Approved' },
    { empId: 13, type: 'Sick Leave', start: '2026-07-22', end: '2026-07-23', days: 2, reason: 'Dental extraction surgery', status: 'Approved' },
    { empId: 14, type: 'Personal Leave', start: '2026-08-04', end: '2026-08-04', days: 1, reason: 'House shifting errands', status: 'Approved' },
    { empId: 16, type: 'Casual Leave', start: '2026-08-25', end: '2026-08-26', days: 2, reason: 'Attending alumni convocation', status: 'Rejected' },
    { empId: 18, type: 'Annual Leave', start: '2026-09-02', end: '2026-09-04', days: 3, reason: 'Festival celebration at home', status: 'Approved' },
    { empId: 21, type: 'Casual Leave', start: '2026-06-12', end: '2026-06-13', days: 2, reason: 'Emergency plumbing repairs at home', status: 'Approved' },
    { empId: 24, type: 'Sick Leave', start: '2026-06-25', end: '2026-06-26', days: 2, reason: 'Food poisoning recovery', status: 'Approved' },
    { empId: 26, type: 'Casual Leave', start: '2026-09-16', end: '2026-09-18', days: 3, reason: 'Travel out of town for wedding', status: 'Approved' },
    { empId: 30, type: 'Personal Leave', start: '2026-08-11', end: '2026-08-11', days: 1, reason: 'Vehicle fitness inspection', status: 'Approved' },
    { empId: 34, type: 'Sick Leave', start: '2026-09-16', end: '2026-09-17', days: 2, reason: 'Eye checkup and rest', status: 'Approved' },
    { empId: 37, type: 'Casual Leave', start: '2026-07-15', end: '2026-07-16', days: 2, reason: 'Family gathering', status: 'Approved' }
  ];

  for (const lr of leaveSeeds) {
    db.public.none(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, number_of_days, reason, status)
      VALUES (${lr.empId}, '${lr.type}', '${lr.start}', '${lr.end}', ${lr.days}, '${lr.reason}', '${lr.status}');
    `);
  }

  // 5. Seed Salary for all 48 Employees for September 2026
  // Formula: Net Salary = Basic Salary + Allowance - Deduction
  for (let empId = 1; empId <= 48; empId++) {
    const emp = employeeSeeds[empId - 1];
    const allowance = Math.round(emp.sal * 0.12);
    const deduction = Math.round(emp.sal * 0.04);
    const basic = emp.sal - allowance + deduction;
    const net = basic + allowance - deduction;

    db.public.none(`
      INSERT INTO salary (employee_id, month, year, basic_salary, allowance, deduction, net_salary)
      VALUES (${empId}, 'September', 2026, ${basic}, ${allowance}, ${deduction}, ${net});
    `);
  }
}
