# 🎓 School Management System (ERP & SaaS Platform)

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

A comprehensive, multi-tenant SaaS School ERP platform engineered for modern educational institutions. Built with a **Laravel 12** RESTful backend API and a high-performance **React 18 + Vite + TypeScript** frontend dashboard.

---

## 🚀 Key Highlights & Architectural Overview

- **Multi-Tenant SaaS Architecture**: Scalable architecture supporting multiple school instances with tenant isolation, tiered subscriptions, and feature flag restrictions.
- **Role-Based Access Control (RBAC)**: Dedicated, tailored dashboards for 9 distinct user roles: Super Admin, School Administrator, Principal, Teacher, Student, Parent, Accountant, Librarian, and Warden.
- **OTP-Based Onboarding**: Secure email OTP verification flow for school registration, subscription selection, and initial setup.
- **Payment Gateway Integration**: Integrated **Razorpay** checkout for automated SaaS subscription billing and online student fee collection.
- **QR Code Attendance System**: Fast QR code scanning mechanism for student check-ins and attendance logs.
- **Syllabus & Lesson Progress Tracking**: Real-time monitor for subject syllabus completion and lesson planning.
- **Financial & Export Suite**: Built-in PDF receipt generation (DomPDF) and Excel report exports (Maatwebsite Excel) for fee collections, salaries, and attendance statistics.

---

## 🌟 Comprehensive Portals & Feature Modules

### 🏢 1. Super Admin Portal (SaaS Provider)
- **Multi-School Management**: Onboard new schools, monitor active tenancies, and toggle school access status.
- **Subscription Plan Builder**: Create and manage pricing tiers (Basic, Standard, Premium) with custom limits on max students, teachers, classes, and enabled feature modules.
- **Platform Analytics**: Global dashboard tracking revenue metrics, total active schools, total user growth, and payment history.
- **Enquiry Management**: Review and resolve incoming contact/support messages from the public website.

### 🏫 2. School Administrator Portal
- **School Setup & Branding**: Configure school profile, academic years, classes, sections, and department structures.
- **User Directory Management**: Complete CRUD operations for Teachers, Students, Parents, Accountants, Librarians, and Wardens.
- **Fee Master Configuration**: Define fee categories, installment structures, due dates, and fine policies.
- **Timetable & Subject Mapping**: Create schedules and map teachers to subjects and class sections.

### 🎓 3. Principal Portal
- **Executive Dashboard**: Holistic real-time view of school performance, daily attendance summary, fee collections, and staff activity.
- **Academic Monitoring**: Oversight of class syllabi progress, exam results distribution, and teacher evaluations.
- **Notice Approvals & Broadcasts**: Review and publish school-wide bulletins and emergency alerts.

### 👩‍🏫 4. Teacher Portal
- **Class Roster & Marking**: Manage assigned classes, log daily attendance (Manual & QR scanner), and enter exam grades.
- **Syllabus Tracker**: Update daily lesson progress, mark completed topics, and maintain subject logs.
- **Student Performance Analytics**: Track individual student academic trends and attendance history.

### 👨‍🎓 5. Student & Parent Portals
- **Personal Dashboard**: View daily class schedules, subject marks, exam timetables, and overall attendance stats.
- **Online Fee Payment**: Instant online payment of due fees via Razorpay with downloadable PDF receipts.
- **Digital ID Card & QR Check-in**: Personal QR code badge generation for instant school check-in.
- **Digital Library**: Search school library catalog, view issued books, and check due dates/fines.

### 💰 6. Accountant Portal
- **Fee Collection & Invoicing**: Record offline payments (Cash/Cheque/DD) and generate instant official PDF fee receipts.
- **Salary & Expense Management**: Track staff payroll, expense categories, and monthly accounting logs.
- **Financial Reports**: Export detailed balance sheets, pending fee rosters, and ledger summaries in Excel/PDF.

### 📚 7. Librarian Portal
- **Book Inventory**: Catalog books, track ISBNs, authors, quantities, and shelf locations.
- **Issue & Return Workflow**: Process book check-outs, check-ins, calculate late return fines, and maintain loan history.

### 🏠 8. Hostel & Mess Warden Portal
- **Room Allocation**: Manage hostel blocks, room inventory, capacity, and student resident assignments.
- **Mess Menu & Attendance**: Plan daily mess meal menus and monitor hostel student attendance.

---

## 🛠️ Technology Stack

### Backend (`/backend`)
- **Framework**: PHP 8.2+ / Laravel 12
- **Authentication**: Custom JWT / Sanctum authentication
- **Database**: MySQL 8.0+
- **PDF Generation**: `barryvdh/laravel-dompdf`
- **Excel Export**: `maatwebsite/excel`
- **Payment Processing**: `razorpay/razorpay`
- **Real-Time Messaging**: Ably / Pusher PHP Server

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite 7
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui components
- **State & Data Fetching**: TanStack React Query v5 + Zustand
- **Routing**: React Router DOM v6
- **Charts & Visualization**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner / React Hot Toast

---

## 📁 Repository Structure

```text
school-management-software/
├── backend/                  # Laravel 12 REST API backend
│   ├── app/                  # Controllers, Models, Middleware, Seeders
│   ├── config/               # App configuration files
│   ├── database/             # Migrations, Factories, Seeders
│   ├── routes/               # API endpoint definitions (api.php)
│   ├── storage/              # PDF storage, logs, exports
│   ├── composer.json         # PHP dependencies
│   └── .env.example          # Environment template for backend
│
├── frontend/                 # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components & shadcn primitives
│   │   ├── pages/            # Role-specific portal pages & routes
│   │   ├── services/         # API client hooks & Axios service layer
│   │   ├── store/            # Zustand global state stores
│   │   └── types/            # TypeScript interfaces & API types
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite build configuration
│
└── README.md                 # Project documentation
```

---

## 💻 Getting Started / Installation Guide

### Prerequisites
Make sure you have the following installed on your development system:
- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x and **npm**
- **MySQL** >= 8.0

---

### Step 1: Backend Setup (`/backend`)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Configure Environment File**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and Razorpay keys:
   ```ini
   APP_NAME="SchoolERP"
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=school_erp_db
   DB_USERNAME=root
   DB_PASSWORD=your_password

   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations & Seed Default Data**:
   ```bash
   php artisan migrate --seed
   php artisan db:seed --class=SubscriptionPlanSeeder
   ```

6. **Start the Laravel Development Server**:
   ```bash
   php artisan serve
   ```
   The backend API will run at `http://localhost:8000`.

---

### Step 2: Frontend Setup (`/frontend`)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment File**:
   Create a `.env` file inside the `frontend` folder:
   ```ini
   APP_FRONTEND_URL=http://localhost:3000
   VITE_SUPER_ADMIN_API_URL=http://localhost:8000/api/super-admin
   VITE_RAZORPAY_KEY=your_razorpay_key_id
   ```

4. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   The frontend UI will run at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🔑 Key API Routes Summary

- `POST /api/auth/send-registration-otp` — Initiate registration with OTP
- `POST /api/auth/verify-otp-and-register` — Verify OTP and create admin account
- `POST /api/auth/login` — Account login (Multi-role authentication)
- `GET  /api/subscriptions/plans` — Public SaaS subscription plans
- `POST /api/subscriptions/initiate` — Initiate subscription purchase via Razorpay
- `POST /api/attendance/qr-checkin` — Public QR scanner check-in endpoint
- `GET  /api/super-admin/dashboard/stats` — Super Admin platform analytics dashboard

---

## 📌 Status & Ongoing Progress

- [x] Multi-Tenant Database Architecture & Role Middleware
- [x] OTP Registration & Multi-step School Onboarding
- [x] Super Admin SaaS Portal & Subscription Limit Enforcement
- [x] Razorpay Online Payment Integration for Subscriptions & Student Fees
- [x] Teacher & Student Portals with Marks & Attendance Entry
- [x] QR Code Check-in System for Attendance
- [x] Accountant Fee Master, Invoicing, and PDF Receipt Export
- [x] Library, Hostel, and Mess Management Modules
- [ ] Mobile Application Integration (React Native / Flutter)
- [ ] Automated WhatsApp / SMS Notification Gateway Integration
- [ ] Multi-language Support (i18n)

---

## 🧪 Feature Verification & Testing Mode

> [!NOTE]  
> **Testing Credentials & Role Accounts**  
> All 9 system roles are pre-seeded in the database to test role-based features.

### Quick Testing Credentials

All test accounts use the **universal password**: `password`

| Role | Email | Target Path | Notes |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@school.com` | `/super-admin/dashboard` | Platform owner |
| **Administrator** | `admin@school.com` | `/administrator/dashboard` | School Admin |
| **Principal** | `principal@school.com` | `/principal/dashboard` | School Head |
| **Teacher** | `teacher@school.com` | `/teacher/dashboard` | Faculty |
| **Student** | `student@school.com` | `/student/dashboard` | Class 10A Student |
| **Parent** | `parent@school.com` | `/parent/dashboard` | Student Parent |
| **Accountant** | `accountant@school.com` | `/accountant/dashboard` | Finance Manager |
| **Librarian** | `librarian@school.com` | `/librarian/dashboard` | Library Manager |
| **Warden** | `warden@school.com` | `/warden/dashboard` | Hostel Warden |

To refresh test data in backend:
```bash
php artisan db:seed --class=RoleSeeder
```

---

## 📜 License

This project is proprietary software developed for educational institution management. All rights reserved.
