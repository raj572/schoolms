import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // Determine local dev environment URL
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api';
    } else {
      return 'http://127.0.0.1:8000/api';
    }
  }

  // Auth Endpoints
  static const String publicSchools = '/auth/schools';
  static const String simpleLogin = '/auth/login';
  static String schoolLogin(dynamic schoolId) => '/auth/login/$schoolId';
  static const String superAdminLogin = '/super-admin/auth/login';
  static const String currentUser = '/auth/user';

  // Student Endpoints
  static String studentDashboard(int studentId) => '/student/dashboard/$studentId';
  static String studentTodayClasses(int studentId) => '/student/today-classes/$studentId';
  static String studentInfo(int studentId) => '/student/info/$studentId';
  static String studentSyllabus(int studentId) => '/student/syllabus-progress/$studentId';
  static String studentExams(int studentId, int schoolId) => '/student/exams/$studentId/$schoolId';
  static String studentMarks(int studentId, int schoolId) => '/student/exams/marks/$studentId/$schoolId';
  static String studentReportCard(int studentId, int examId) => '/student/exams/report-card/$studentId/$examId';
  static const String studentBorrowerIssues = '/student/library/issues/borrower';

  // Attendance Endpoints
  static String studentAttendance(int studentDetailsId) => '/principal/attendance/students/$studentDetailsId';
  static String userStreaks(int userId, String userType) => '/principal/attendance/streaks/$userId/$userType';
  static const String qrCheckin = '/attendance/qr-checkin';

  // Timetable Endpoints
  static String classTimetable(int schoolId, int classId) => '/principal/class-timetable/get-by-class/$schoolId/$classId';

  // Teacher Endpoints
  static String teacherTodayClasses(int teacherId, int schoolId) => '/teacher/today-classes/$teacherId/$schoolId';
  static String teacherWeeklyTimetable(int teacherId, int schoolId) => '/teacher/weekly-timetable/$teacherId/$schoolId';
  static const String teacherMarkAttendance = '/teacher/attendance/students';
  static const String teacherBulkMarkAttendance = '/teacher/attendance/bulk-mark';
  static const String teacherSyllabusCompletion = '/teacher/syllabus/completion';

  // Fees & Payment Endpoints
  static const String feeStructures = '/accountant/fee-structure/all';
  static const String monthlyPayments = '/accountant/monthly-payments/all';
  static String generateMonthlyDues(int schoolId) => '/accountant/monthly-payments/generate-dues/$schoolId';
  static const String createPaymentOrder = '/administrator/payments/createPaymentOrder';
  static const String verifyPayment = '/administrator/payments/verifyPayment';

  // Notices & Communication
  static String myNotices(int schoolId) => '/principal/notice/my/$schoolId';
  static String markNoticeRead(int noticeId) => '/principal/notice/mark-read/$noticeId';
  static const String sendPersonalMessage = '/principal/messaging/personal/send';
  static const String personalMessageHistory = '/principal/messaging/personal/history';

  // Principal Endpoints
  static String principalDashboard(int schoolId) => '/principal/dashboard/$schoolId';
  static const String principalAttendanceAnalytics = '/principal/attendance/analytics';

  // Librarian Endpoints
  static String libraryBooks(int schoolId) => '/library/books/all/$schoolId';
  static const String libraryIssueBook = '/library/issue';
  static String libraryReturnBook(int issueId) => '/library/return/$issueId';

  // Warden Endpoints
  static String wardenDashboard(int schoolId) => '/warden/dashboard/$schoolId';
  static const String wardenRooms = '/warden/hostel/rooms/all';
  static const String wardenAllocations = '/warden/hostel/allocations/all';
  static String wardenMessMenus(int schoolId) => '/warden/mess/menus/$schoolId';

  // Administrator Endpoints
  static const String administratorDashboard = '/administrator/dashboard';
  static const String administratorPrincipals = '/administrator/principals';

  // Super Admin Endpoints
  static const String superAdminStats = '/super-admin/dashboard/stats';
  static const String superAdminSchools = '/super-admin/schools';
  static const String superAdminPlans = '/super-admin/plans';
}
