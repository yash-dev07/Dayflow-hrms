<div align="center">

# Dayflow HRMS

**Every workday, perfectly aligned.**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

</div>

## Overview

Dayflow HRMS is a unified Human Resource Management System that brings employee management, attendance tracking, leave management, and payroll processing into a single platform. It's built on a Next.js and PostgreSQL stack with a modern, glassmorphism-inspired interface, and is designed to replace the spreadsheet-and-email workflows common in smaller HR teams.

## Features

- **Role-based access control** — JWT-based authentication with dedicated views for `ADMIN`, `HR`, and `EMPLOYEE` roles, enforced on both the UI and the API.
- **Attendance tracking** — One-click check-in/check-out with automatic hours-worked calculation and daily/weekly views.
- **Leave management** — Employees submit sick, casual, or unpaid leave requests; admins approve or reject with automatic balance deductions.
- **Payroll processing** — Automatic salary calculation with allowances and deductions (HRA, tax), and printable salary slips.
- **Responsive UI** — Dark/light mode, animated backgrounds, and a fully responsive layout.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React |
| Backend | Next.js API Routes & Server Actions |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Custom JWT with HTTP-only cookies |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [Supabase](https://supabase.com/) project (or any PostgreSQL database)

### 1. Clone the repository

```bash
git clone https://github.com/yash-dev07/Dayflow-hrms.git
cd Dayflow-hrms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string, used at runtime (Supabase: Settings → Database → Transaction pooler, port 6543) |
| `DIRECT_URL` | Direct Postgres connection string, used for migrations (Supabase: Settings → Database → Direct connection, port 5432) |
| `JWT_SECRET` | Any long, random string used to sign session tokens |

### 4. Set up the database

```bash
npx prisma db push      # sync the schema to your database
npx prisma generate     # generate the Prisma client
npx prisma db seed      # optional: load demo data
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment (Vercel)

1. Push the repository to GitHub and import it into [Vercel](https://vercel.com/).
2. Add `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` under Project Settings → Environment Variables.
3. Set the build command to `prisma generate && next build` so the Prisma client is generated during the build.
4. Deploy. Run `npx prisma db push` (or a migration) against the production database before or after the first deploy so the schema exists.

## Project Structure

```
Dayflow-hrms/
├── app/
│   ├── api/            # Route handlers: auth, attendance, employees,
│   │                    # leaves, leave-types, notifications, payroll,
│   │                    # profile, reports, dashboard
│   └── dashboard/       # Authenticated app UI
├── lib/                 # Prisma client, auth helpers
├── prisma/
│   ├── schema.prisma    # Data models
│   └── seed.ts          # Demo data
├── middleware.ts         # Route protection / RBAC
└── .env.example
```

## Demo Accounts

For local development and demos only — disable or replace these before deploying to a real production environment.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dayflow.demo` | `Admin@123` |
| HR | `hr@dayflow.demo` | `Hr@12345` |
| Employee | `employee@dayflow.demo` | `Employee@123` |

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details, or replace this section with your preferred license.

---

<div align="center">
Built for the modern workplace.
</div>
