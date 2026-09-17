<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Employee Management System

An employee management portal for handling workforce records, departments,
attendance, leave requests, salary records, and analytical reports.

The application includes separate Admin and Employee workspaces backed by an
Express API and an in-memory PostgreSQL-compatible database.

## Features

- Employee and department management
- Attendance and leave workflows
- Salary records and printable salary slips
- Workforce analytics and CSV export

## Run Locally

**Prerequisites:** Node.js 18 or newer

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Available scripts

- `npm run dev` starts the development server.
- `npm run lint` runs the TypeScript check.
- `npm run build` creates the production bundle.

## Admin workspace

Administrators can manage employees, departments, attendance, leave approvals,
salary records, reports, and application settings from the organization
workspace.

## Demo accounts

- Admin: `admin@ems.demo` / `admin123`
- Employee: `employee@ems.demo` / `employee123`

## Validation

Run the TypeScript check with:

```bash
npm run lint
```
