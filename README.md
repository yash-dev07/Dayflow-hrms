<div align="center">

# Dayflow HRMS

![Typing SVG](https://readme-typing-svg.demolab.com/?font=Fira+Code&size=22&pause=1000&color=06B6D4&center=true&vCenter=true&width=700&lines=Every+workday%2C+perfectly+aligned.;Attendance+%C2%B7+Leave+%C2%B7+Payroll+%C2%B7+One+platform)
<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

<p>
  <img src="https://img.shields.io/github/stars/yash-dev07/Dayflow-hrms?style=for-the-badge&color=FFD700" alt="Stars" />
  <img src="https://img.shields.io/github/forks/yash-dev07/Dayflow-hrms?style=for-the-badge&color=blue" alt="Forks" />
  <img src="https://img.shields.io/github/last-commit/yash-dev07/Dayflow-hrms?style=for-the-badge" alt="Last Commit" />
  <img src="https://img.shields.io/github/license/yash-dev07/Dayflow-hrms?style=for-the-badge" alt="License" />
</p>

</div>

> The live demo badge points at a Vercel preview URL, which changes on every deploy. Set a stable domain under Vercel → Project → Settings → Domains (e.g. `dayflow-hrms.vercel.app`) and swap the link above once you do.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment-vercel)
- [Project Structure](#project-structure)
- [Roles & Permissions](#roles--permissions)
- [Demo Accounts](#demo-accounts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Dayflow HRMS is a unified Human Resource Management System that brings employee management, attendance tracking, leave management, and payroll processing into a single platform. It's built on a Next.js and PostgreSQL stack with a modern, glassmorphism-inspired interface, designed to replace the spreadsheet-and-email workflows common in smaller HR teams.

<div align="center">
<img src="https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind,prisma,postgres,vercel" alt="Tech stack icons" />
</div>

## Features

| | |
|---|---|
| 🔐 **Role-based access control** | JWT-based auth with dedicated views for `ADMIN`, `HR`, and `EMPLOYEE`, enforced on both UI and API |
| ⏱️ **Real-time attendance** | One-click check-in/check-out with automatic hours-worked calculation |
| 🌴 **Leave management** | Sick, casual, and unpaid leave requests with approval workflow and automatic balance deduction |
| 💰 **Automated payroll** | Salary calculation with allowances/deductions (HRA, tax) and printable salary slips |
| 🎨 **Responsive UI** | Dark/light mode, animated backgrounds, fully responsive layout |

<details>
<summary><strong>Screenshots</strong> (click to expand)</summary>
<br>

> Add screenshots or a short screen recording here — a dashboard view and a mobile view usually sell a project fastest. Drag images into this section on GitHub and it'll generate the `![]()` markdown for you automatically.

</details>

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

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com/) project (or any PostgreSQL database)

### Installation

```bash
git clone https://github.com/yash-dev07/Dayflow-hrms.git
cd Dayflow-hrms
npm install
```

Then set up your environment variables (below), push the schema, and run the app:

```bash
cp .env.example .env        # fill in the values first
npx prisma db push
npx prisma generate
npx prisma db seed          # optional: demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string, used at runtime (Supabase: Settings → Database → Transaction pooler, port 6543) |
| `DIRECT_URL` | Direct Postgres connection string, used for migrations (Supabase: Settings → Database → Direct connection, port 5432) |
| `JWT_SECRET` | Any long, random string used to sign session tokens |

## Deployment (Vercel)

1. Push the repository to GitHub and import it into [Vercel](https://vercel.com/).
2. Add `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` under Project Settings → Environment Variables.
3. Set the build command to `prisma generate && next build`.
4. Deploy, then run `npx prisma db push` against the production database if you haven't already.

## Project Structure

<details>
<summary>Click to expand</summary>

```
Dayflow-hrms/
├── app/
│   ├── api/            # auth, attendance, employees, leaves, leave-types,
│   │                     notifications, payroll, profile, reports, dashboard
│   └── dashboard/       # Authenticated app UI
├── lib/                 # Prisma client, auth helpers
├── prisma/
│   ├── schema.prisma    # Data models
│   └── seed.ts          # Demo data
├── middleware.ts         # Route protection / RBAC
└── .env.example
```

</details>

## Roles & Permissions

| Capability | Employee | HR | Admin |
|---|---|---|---|
| Own profile / attendance / leave / payroll | View + limited edit | View + limited edit | Full access |
| Other employees' records | — | View & edit | Full access |
| Leave approvals | Apply only | Approve / reject | Approve / reject |
| Payroll structure | Read-only, own only | View | View & edit, all employees |

## Demo Accounts

<details>
<summary>Click to expand — for local development and demos only</summary>
<br>

Disable or replace these before deploying to a real production environment.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dayflow.demo` | `Admin@123` |
| HR | `hr@dayflow.demo` | `Hr@12345` |
| Employee | `employee@dayflow.demo` | `Employee@123` |

</details>

## Roadmap

- [ ] Biometric / geo-tagged check-in
- [ ] Recruitment & onboarding workflow
- [ ] Performance review module
- [ ] Native mobile app
- [ ] Payroll integration with tax/banking systems

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details, or replace this section with your preferred license.

---

<div align="center">

Built for the modern workplace.

[⬆ Back to top](#dayflow-hrms)

</div>
