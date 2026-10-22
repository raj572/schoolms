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
import '../features/student/presentation/screens/student_shell_screen.dart';
import '../features/super_admin/presentation/screens/super_admin_dashboard_screen.dart';
import '../features/teacher/presentation/screens/teacher_workspace_screen.dart';
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
        path: '/teacher',
        builder: (context, state) => const TeacherWorkspaceScreen(),
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
