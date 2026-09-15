# Comprehensive QA & Testing Guide
**Target System:** School Management Software (Laravel Backend + React/Frontend Stack)

This guide provides a structured, step-by-step checklist and testing framework to evaluate role-based features, system-wide functionality, security, frontend UX, API integration, and performance/speed across the application.

---

## 📌 Table of Contents
1. [Role-Based Access & Feature Testing (RBAC Matrix)](#1-role-based-access--feature-testing-rbac-matrix)
2. [Module-by-Module Feature Verification](#2-module-by-module-feature-verification)
3. [Security Testing](#3-security-testing)
4. [Functional & Bug Testing](#4-functional--bug-testing)
5. [Frontend & UX Testing](#5-frontend--ux-testing)
6. [API Response & Integration Testing](#6-api-response--integration-testing)
7. [Speed & Performance Testing](#7-speed--performance-testing)
8. [Testing Execution & Verification Checklist](#8-testing-execution--verification-checklist)

---

## 1. Role-Based Access & Feature Testing (RBAC Matrix)

Verify that each user role can **ONLY** view and perform actions allowed by their permissions.

| Feature / Module | Super Admin | Admin | Teacher | Student | Parent | Accountant |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| System Settings & Configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User & Role Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Student Admission & Edit | ✅ | ✅ | 👁️ (Read Only) | ❌ | ❌ | ❌ |
| Class & Subject Allocation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mark Attendance | ✅ | ✅ | ✅ (Own Class) | ❌ | ❌ | ❌ |
| View Own Attendance | ✅ | ✅ | ✅ | ✅ | ✅ (Child's) | ❌ |
| Enter/Edit Exam Marks | ✅ | ✅ | ✅ (Assigned Subject) | ❌ | ❌ | ❌ |
| View Exam Results & Report Card | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Fee Structure & Invoice Generation | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Pay Fees / Online Payment | ❌ | ❌ | ❌ | ✅ / ✅ Parent | ✅ | ❌ |
| Collect Cash/Offline Fee Payments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Noticeboard / Announcements Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Role-Based Test Steps:
- [ ] **Role Switch Verification**: Log in as a **Student** $\rightarrow$ Attempt to manually navigate to `/admin/settings` or call `POST /api/admin/users`. Expect **403 Forbidden** or frontend redirect to unauthorized page.
- [ ] **Data Isolation (Parent/Student)**: Log in as Parent A $\rightarrow$ Ensure Parent A can ONLY see children linked to Parent A and cannot view Parent B's children data via direct URL tampering (IDOR check).
- [ ] **Teacher Scope Limitation**: Log in as Teacher A $\rightarrow$ Verify Teacher A can enter marks *only* for classes/subjects assigned to them, not for other teachers' classes.

---

## 2. Module-by-Module Feature Verification

Check every core module to ensure all functionality works as expected end-to-end:

### A. Authentication & Profile Module
- [ ] **Login**: Test with valid and invalid credentials for all 6 roles.
- [ ] **Password Reset**: Request reset link $\rightarrow$ receive token $\rightarrow$ reset password $\rightarrow$ verify old password no longer works.
- [ ] **Profile Management**: Update profile info/avatar $\rightarrow$ ensure changes reflect instantly on UI and DB.

### B. Student Management Module
- [ ] **Student Admission**: Add new student with photo, parent details, class assignment, and documents.
- [ ] **Student List & Search**: Test search by Name, Roll Number, Class, and Section. Test pagination.
- [ ] **Student Promotion**: Test mass-promoting students from Grade 1 to Grade 2 at academic year end.
- [ ] **Transfer / Inactive Status**: Deactivate a student and verify they no longer appear in active attendance sheets.

### C. Attendance Module
- [ ] **Daily Attendance Entry**: Teacher/Admin marks Present, Absent, Late, or Leave for a class section.
- [ ] **Attendance Edit Limit**: Verify attendance cannot be modified after the locked window (e.g. 7 days past) unless by Admin.
- [ ] **Attendance Reports**: Generate monthly attendance percentage report for individual students and entire classes.

### D. Examinations & Grading Module
- [ ] **Exam Setup**: Create Exam Term (e.g. Mid-Term 2026), set grade scales (A+, A, B, etc.), and assign subjects.
- [ ] **Marks Entry**: Enter marks for a class $\rightarrow$ calculate totals, percentages, and ranks automatically.
- [ ] **Report Card Generation**: Download/view PDF report cards $\rightarrow$ check mark calculations and formatting.

### E. Fees & Accounting Module
- [ ] **Fee Structure Creation**: Set up Tuition Fee, Transport Fee, Admission Fee per class.
- [ ] **Invoice Generation**: Auto-generate monthly/quarterly invoices for students.
- [ ] **Fee Payment & Receipt**: Pay online (Stripe/Razorpay/PayPal) or log offline payment $\rightarrow$ check invoice status changes from "Unpaid" to "Paid" $\rightarrow$ download payment receipt.
- [ ] **Due Fee Reminders**: Filter students with overdue fees and verify warning notifications.

### F. Communication & Noticeboard Module
- [ ] **Create Notice**: Admin posts notice targeted to Specific Class / Teachers / All Parents.
- [ ] **Notifications**: Check if push/email/in-app notifications are delivered to targeted users.

---

## 3. Security Testing

### A. Authentication & Session Management
- [ ] **Token Storage & Transmission**: Verify JWT / Sanctum tokens are stored securely (e.g., `HttpOnly`, `SameSite`, `Secure` cookies or clean local storage handling) and passed via `Authorization: Bearer <token>`.
- [ ] **Token Expiration & Invalidation**: Confirm tokens expire properly and logging out invalidates the session server-side.
- [ ] **Password Security**: Ensure password policy enforcement (length, special characters) and that passwords are never sent back in API responses or plain text logs.

### B. Authorization & Access Control (RBAC)
- [ ] **Role Isolation**: Test access between roles (Admin, Teacher, Student, Parent, Staff).
- [ ] **IDOR (Insecure Direct Object References)**: Test changing IDs in endpoint URLs (e.g., `/api/students/10` to `/api/students/11`). Ensure users can only view/edit data belonging to their authorized scope.

### C. Vulnerability Checks
- [ ] **SQL Injection (SQLi)**: Test all input fields and query params (`GET /api/students?search=' OR 1=1 --`) to ensure Eloquent prepared statements prevent injection.
- [ ] **Cross-Site Scripting (XSS)**: Inject scripts like `<script>alert('xss')</script>` into text inputs. Ensure frontend renders them safely without executing.
- [ ] **Cross-Site Request Forgery (CSRF)**: Verify state-changing operations require valid CSRF protection or API token validation.
- [ ] **File Upload Security**: Test uploading unexpected file types (`.php`, `.exe`, `.html`, zero-byte files). Verify MIME type validation and file size restrictions.
- [ ] **Rate Limiting (Brute Force Protection)**: Attempt multiple rapid invalid login requests (`POST /api/login`) to ensure Laravel rate limiters (`throttle:api`) trigger HTTP 429.

---

## 4. Functional & Bug Testing

### A. Core Workflow Verification
- [ ] **Full Lifecycle**: Student admission $\rightarrow$ Class Assignment $\rightarrow$ Attendance $\rightarrow$ Exam Marks Entry $\rightarrow$ Report Card Generation $\rightarrow$ Fee Payment.
- [ ] **Data Integrity & Cascade Operations**: Soft deletes vs Hard deletes; ensuring deleting a Class does not leave orphaned records.

### B. Boundary & Edge Case Testing
- [ ] **Extreme Numerical Values**: Negative values, zero, decimals, or excessively large numbers into fees/marks.
- [ ] **Special Characters**: Names containing apostrophes (`O'Connor`), hyphens, Unicode, or non-Latin characters.
- [ ] **Date/Time Boundary**: End-of-month, leap year, and multi-timezone date selections.

---

## 5. Frontend & UX Testing

### A. Responsive Design & Layout
- [ ] **Device Viewports**: Mobile (375px), Tablet (768px), and Desktop (1440px+).
- [ ] **Overflow & Text Truncation**: Long strings do not overflow containers or ruin tables.

### B. User Interface Feedback
- [ ] **Loading States**: Skeleton loader or spinner display while API requests are pending.
- [ ] **Error Messages & Toasts**: Clear toast messages for failures ("Network error", "Validation failed").
- [ ] **Form Handling & State**: Submit buttons disabled while processing to prevent double-submits.

---

## 6. API Response & Integration Testing

### A. HTTP Status Code Standardization
- **200 OK** | **201 Created** | **400 Bad Request** | **401 Unauthorized** | **403 Forbidden** | **404 Not Found** | **422 Unprocessable Entity** | **500 Internal Server Error**

### B. Payload Structure Consistency
- [ ] **Pagination Structure**: Standard format (`data`, `current_page`, `last_page`, `total`).
- [ ] **Empty State Responses**: Return `[]` inside `data` rather than `null` or `500`.

---

## 7. Speed & Performance Testing

### A. Frontend Optimization
- [ ] **Lighthouse Audit**: Score 85+ on Performance & Accessibility.
- [ ] **Bundle Size & Lazy Loading**: Code splitting on router level.

### B. Backend & Database Performance
- [ ] **N+1 Query Detection**: Verify eager loading (`with(['class', 'parent'])`) using Telescope/Debugbar.
- [ ] **Database Indexing**: Indexed foreign key columns (`student_id`, `class_id`, `created_at`).

---

## 8. Testing Execution & Verification Checklist

```bash
# 1. Backend Automated Tests (Feature & Unit tests including Role middleware tests)
php artisan test

# 2. Security & Dependency Scans
composer audit
npm audit

# 3. Frontend Production Build Check
npm run build

# 4. API Throttling & Load Test
ab -n 100 -c 10 http://127.0.0.1:8000/api/health-check
```
