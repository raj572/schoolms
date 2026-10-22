import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/accountant/presentation/screens/accountant_dashboard_screen.dart';
import '../features/accountant/presentation/screens/accountant_fees_screen.dart';
import '../features/accountant/presentation/screens/accountant_fee_structure_screen.dart';
import '../features/accountant/presentation/screens/accountant_monthly_dues_screen.dart';
import '../features/accountant/presentation/screens/accountant_annual_payments_screen.dart';
import '../features/accountant/presentation/screens/accountant_service_charges_screen.dart';
import '../features/accountant/presentation/screens/accountant_payments_screen.dart';
import '../features/accountant/presentation/screens/accountant_extra_services_screen.dart';
import '../features/accountant/presentation/screens/accountant_reports_screen.dart';
import '../features/administrator/presentation/screens/administrator_dashboard_screen.dart';
import '../features/auth/presentation/controllers/auth_controller.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/librarian/presentation/screens/librarian_dashboard_screen.dart';
import '../features/parent/presentation/screens/parent_shell_screen.dart';
import '../features/principal/presentation/screens/principal_dashboard_screen.dart';
import '../features/principal/presentation/screens/principal_users_screen.dart';
import '../features/principal/presentation/screens/principal_students_screen.dart';
import '../features/principal/presentation/screens/principal_teachers_screen.dart';
import '../features/principal/presentation/screens/principal_classes_screen.dart';
import '../features/principal/presentation/screens/principal_exam_screen.dart';
import '../features/principal/presentation/screens/principal_attendance_screen.dart';
import '../features/principal/presentation/screens/principal_transport_screen.dart';
import '../features/principal/presentation/screens/principal_hostel_screen.dart';
import '../features/principal/presentation/screens/principal_wardens_screen.dart';
import '../features/principal/presentation/screens/principal_library_screen.dart';
import '../features/principal/presentation/screens/principal_communication_screen.dart';
import '../features/principal/presentation/screens/principal_documents_screen.dart';
import '../features/principal/presentation/screens/principal_reports_screen.dart';
import '../features/principal/presentation/screens/principal_settings_screen.dart';
import '../features/student/presentation/screens/student_shell_screen.dart';
import '../features/student/presentation/screens/student_dashboard_screen.dart';
import '../features/student/presentation/screens/student_profile_screen.dart';
import '../features/student/presentation/screens/student_attendance_screen.dart';
import '../features/student/presentation/screens/student_grades_screen.dart';
import '../features/student/presentation/screens/student_fees_screen.dart';
import '../features/student/presentation/screens/student_library_screen.dart';
import '../features/student/presentation/screens/student_messages_screen.dart';
import '../features/super_admin/presentation/screens/super_admin_dashboard_screen.dart';
import '../features/teacher/presentation/screens/teacher_workspace_screen.dart';
import '../features/teacher/presentation/screens/teacher_profile_screen.dart';
import '../features/teacher/presentation/screens/teacher_classes_screen.dart';
import '../features/teacher/presentation/screens/teacher_attendance_screen.dart';
import '../features/teacher/presentation/screens/teacher_syllabus_screen.dart';
import '../features/teacher/presentation/screens/teacher_exam_screen.dart';
import '../features/teacher/presentation/screens/teacher_assignments_screen.dart';
import '../features/teacher/presentation/screens/teacher_reports_screen.dart';
import '../features/teacher/presentation/screens/teacher_communication_screen.dart';
import '../features/warden/presentation/screens/warden_dashboard_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isAuth) {
        return isLoggingIn ? null : '/login';
      }

      // If authenticated and trying to go to login, route based on role
      if (isLoggingIn) {
        final role = authState.user?.role.toLowerCase();
        switch (role) {
          case 'student':
            return '/student';
          case 'teacher':
            return '/teacher';
          case 'parent':
            return '/parent';
          case 'principal':
            return '/principal';
          case 'accountant':
            return '/accountant';
          case 'librarian':
            return '/librarian';
          case 'warden':
            return '/warden';
          case 'administrator':
            return '/administrator';
          case 'super_admin':
            return '/super-admin';
          default:
            return '/student';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/student',
        builder: (context, state) => const StudentShellScreen(),
      ),
      GoRoute(
        path: '/student/dashboard',
        builder: (context, state) => const StudentDashboardScreen(),
      ),
      GoRoute(
        path: '/student/profile',
        builder: (context, state) => const StudentProfileScreen(),
      ),
      GoRoute(
        path: '/student/attendance',
        builder: (context, state) => const StudentAttendanceScreen(),
      ),
      GoRoute(
        path: '/student/exams',
        builder: (context, state) => const StudentGradesScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/student/exams/result',
        builder: (context, state) => const StudentGradesScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/student/exams/reports-cards',
        builder: (context, state) => const StudentGradesScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/student/fees',
        builder: (context, state) => const StudentFeesScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/student/fees/due',
        builder: (context, state) => const StudentFeesScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/student/fees/payments-history',
        builder: (context, state) => const StudentFeesScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/student/library',
        builder: (context, state) => const StudentLibraryScreen(),
      ),
      GoRoute(
        path: '/student/messages',
        builder: (context, state) => const StudentMessagesScreen(),
      ),
      GoRoute(
        path: '/teacher',
        builder: (context, state) => const TeacherWorkspaceScreen(),
      ),
      GoRoute(
        path: '/teacher/dashboard',
        builder: (context, state) => const TeacherWorkspaceScreen(),
      ),
      GoRoute(
        path: '/teacher/my-profile',
        builder: (context, state) => const TeacherProfileScreen(),
      ),
      GoRoute(
        path: '/teacher/my-classes',
        builder: (context, state) => const TeacherClassesScreen(),
      ),
      GoRoute(
        path: '/teacher/attendance',
        builder: (context, state) => const TeacherAttendanceScreen(),
      ),
      GoRoute(
        path: '/teacher/attendance/records',
        builder: (context, state) => const TeacherAttendanceScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/teacher/syllabus-completion',
        builder: (context, state) => const TeacherSyllabusScreen(),
      ),
      GoRoute(
        path: '/teacher/exam',
        builder: (context, state) => const TeacherExamScreen(),
      ),
      GoRoute(
        path: '/teacher/exam/schedule',
        builder: (context, state) => const TeacherExamScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/teacher/exam/marks-entry',
        builder: (context, state) => const TeacherExamScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/teacher/assignments',
        builder: (context, state) => const TeacherAssignmentsScreen(),
      ),
      GoRoute(
        path: '/teacher/reports',
        builder: (context, state) => const TeacherReportsScreen(),
      ),
      GoRoute(
        path: '/teacher/communication',
        builder: (context, state) => const TeacherCommunicationScreen(),
      ),
      GoRoute(
        path: '/parent',
        builder: (context, state) => const ParentShellScreen(),
      ),
      GoRoute(
        path: '/principal',
        builder: (context, state) => const PrincipalDashboardScreen(),
      ),
      GoRoute(
        path: '/principal/users',
        builder: (context, state) => const PrincipalUsersScreen(),
      ),
      GoRoute(
        path: '/principal/users/register',
        builder: (context, state) => const PrincipalUsersScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/users/list',
        builder: (context, state) => const PrincipalUsersScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/students',
        builder: (context, state) => const PrincipalStudentsScreen(),
      ),
      GoRoute(
        path: '/principal/students/register',
        builder: (context, state) => const PrincipalStudentsScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/students/list',
        builder: (context, state) => const PrincipalStudentsScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/students/attendance',
        builder: (context, state) => const PrincipalStudentsScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/principal/students/services',
        builder: (context, state) => const PrincipalStudentsScreen(initialTab: 3),
      ),
      GoRoute(
        path: '/principal/teachers',
        builder: (context, state) => const PrincipalTeachersScreen(),
      ),
      GoRoute(
        path: '/principal/teachers/register',
        builder: (context, state) => const PrincipalTeachersScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/teachers/list',
        builder: (context, state) => const PrincipalTeachersScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/classes',
        builder: (context, state) => const PrincipalClassesScreen(),
      ),
      GoRoute(
        path: '/principal/classes/list',
        builder: (context, state) => const PrincipalClassesScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/classes/subjects',
        builder: (context, state) => const PrincipalClassesScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/classes/timetable',
        builder: (context, state) => const PrincipalClassesScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/principal/exam',
        builder: (context, state) => const PrincipalExamScreen(),
      ),
      GoRoute(
        path: '/principal/attendance',
        builder: (context, state) => const PrincipalAttendanceScreen(),
      ),
      GoRoute(
        path: '/principal/attendance/teachers',
        builder: (context, state) => const PrincipalAttendanceScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/attendance/dashboard',
        builder: (context, state) => const PrincipalAttendanceScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/library',
        builder: (context, state) => const PrincipalLibraryScreen(),
      ),
      GoRoute(
        path: '/principal/transport',
        builder: (context, state) => const PrincipalTransportScreen(),
      ),
      GoRoute(
        path: '/principal/hostel',
        builder: (context, state) => const PrincipalHostelScreen(),
      ),
      GoRoute(
        path: '/principal/wardens',
        builder: (context, state) => const PrincipalWardensScreen(),
      ),
      GoRoute(
        path: '/principal/communication',
        builder: (context, state) => const PrincipalCommunicationScreen(),
      ),
      GoRoute(
        path: '/principal/documents',
        builder: (context, state) => const PrincipalDocumentsScreen(),
      ),
      GoRoute(
        path: '/principal/reports',
        builder: (context, state) => const PrincipalReportsScreen(),
      ),
      GoRoute(
        path: '/principal/reports/student',
        builder: (context, state) => const PrincipalReportsScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/reports/fee',
        builder: (context, state) => const PrincipalReportsScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/reports/attendance',
        builder: (context, state) => const PrincipalReportsScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/principal/reports/exams',
        builder: (context, state) => const PrincipalReportsScreen(initialTab: 3),
      ),
      GoRoute(
        path: '/principal/reports/syllabus-overview',
        builder: (context, state) => const PrincipalReportsScreen(initialTab: 4),
      ),
      GoRoute(
        path: '/principal/settings',
        builder: (context, state) => const PrincipalSettingsScreen(),
      ),
      GoRoute(
        path: '/principal/settings/user-management',
        builder: (context, state) => const PrincipalSettingsScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/principal/settings/roles',
        builder: (context, state) => const PrincipalSettingsScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/principal/settings/school-info',
        builder: (context, state) => const PrincipalSettingsScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/accountant',
        builder: (context, state) => const AccountantDashboardScreen(),
      ),
      GoRoute(
        path: '/accountant/fees',
        builder: (context, state) => const AccountantFeesScreen(),
      ),
      GoRoute(
        path: '/accountant/fees-structure',
        builder: (context, state) => const AccountantFeeStructureScreen(),
      ),
      GoRoute(
        path: '/accountant/monthly-dues',
        builder: (context, state) => const AccountantMonthlyDuesScreen(),
      ),
      GoRoute(
        path: '/accountant/annual-payments',
        builder: (context, state) => const AccountantAnnualPaymentsScreen(),
      ),
      GoRoute(
        path: '/accountant/service-charges',
        builder: (context, state) => const AccountantServiceChargesScreen(),
      ),
      GoRoute(
        path: '/accountant/payments',
        builder: (context, state) => const AccountantPaymentsScreen(),
      ),
      GoRoute(
        path: '/accountant/extra-services',
        builder: (context, state) => const AccountantExtraServicesScreen(),
      ),
      GoRoute(
        path: '/accountant/reports',
        builder: (context, state) => const AccountantReportsScreen(),
      ),
      GoRoute(
        path: '/accountant/reports/fee',
        builder: (context, state) => const AccountantReportsScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/accountant/reports/dues-pending',
        builder: (context, state) => const AccountantReportsScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/accountant/reports/transactions',
        builder: (context, state) => const AccountantReportsScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/librarian',
        builder: (context, state) => const LibrarianDashboardScreen(),
      ),
      GoRoute(
        path: '/warden',
        builder: (context, state) => const WardenDashboardScreen(),
      ),
      GoRoute(
        path: '/administrator',
        builder: (context, state) => const AdministratorDashboardScreen(),
      ),
      GoRoute(
        path: '/super-admin',
        builder: (context, state) => const SuperAdminDashboardScreen(),
      ),
    ],
  );
});
