<div align="center">
  
# ⚡️ Dayflow HRMS
**Every workday, perfectly aligned.**

<p align="center">
  <img src="https://imgshields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>



</div>

---

## 📖 Overview

**Dayflow HRMS** is a modern, unified Human Resource Management System built to scale. Designed with a hyper-polished Glassmorphism aesthetic and robust backend architecture, Dayflow eliminates the friction of traditional HR platforms by bringing employee management, attendance, leaves, and automated payroll processing under one incredibly beautiful roof.

### 🌟 Key Features

- **🔐 Strict Role-Based Access Control:** Secure JWT-based authentication supporting `ADMIN`, `HR`, and `EMPLOYEE` roles with dedicated dashboard views.
- **⏰ Real-Time Attendance:** One-click clock-in/out tracking with precise logging and automated "Hours Worked" calculations.
- **📅 Leave Management:** Employees can request sick, casual, or unpaid leaves. Admins can seamlessly approve/reject with automated balance deductions.
- **💰 Automated Payroll Processing:** Say goodbye to spreadsheets. Dayflow automatically calculates base salaries, applies allowances/deductions (HRA, Tax), and generates professional, printable **Salary Slips**.
- **🎨 Stunning UI/UX:** Fully responsive, modern design featuring an animated Aurora background, dark/light mode toggles, and seamless micro-animations.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Lucide React
- **Backend:** Next.js Server Actions & API Routes
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** Custom JWT with HTTP-only cookies

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a [Supabase](https://supabase.com/) account for the database.

### 1. Clone the repository
```bash
git clone https://github.com/yash-dev07/Dayflow-hrms.git
cd Dayflow-hrms
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase connection strings and a strong JWT secret:
```env
# Database connection string from Supabase
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Optional direct connection for migrations
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Custom JWT Secret (Any strong random string)
JWT_SECRET="your-super-strong-jwt-secret-key"
```

### 4. Setup Prisma Database
Push the schema to your Supabase instance and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🧪 Demo Accounts

You can test the application using the following pre-configured demo credentials (if seeded):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@dayflow.demo` | `Admin@123` |
| **HR** | `hr@dayflow.demo` | `Hr@12345` |
| **Employee** | `employee@dayflow.demo` | `Employee@123` |

---

<div align="center">
  <p>Built for the modern workplace. ⚡️</p>
</div>
