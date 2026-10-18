import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../controllers/parent_controller.dart';
import 'parent_academics_screen.dart';
import 'parent_attendance_screen.dart';
import 'parent_dashboard_screen.dart';
import 'parent_fees_screen.dart';
import 'parent_notices_screen.dart';

class ParentShellScreen extends ConsumerWidget {
  const ParentShellScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(parentTabProvider);

    final screens = const [
      ParentDashboardScreen(),
      ParentAttendanceScreen(),
      ParentAcademicsScreen(),
      ParentFeesScreen(),
      ParentNoticesScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: EduPulseColors.surfaceCard,
          border: Border(
            top: BorderSide(color: EduPulseColors.border, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: Color.fromRGBO(30, 41, 59, 0.04),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) => ref.read(parentTabProvider.notifier).state = index,
          backgroundColor: EduPulseColors.surfaceCard,
          selectedItemColor: EduPulseColors.primary,
          unselectedItemColor: EduPulseColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard_rounded),
              label: 'Overview',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.event_available_outlined),
              activeIcon: Icon(Icons.event_available_rounded),
              label: 'Attendance',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school_outlined),
              activeIcon: Icon(Icons.school_rounded),
              label: 'Academics',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet_rounded),
              label: 'Fees',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_none_rounded),
              activeIcon: Icon(Icons.notifications_rounded),
              label: 'Notices',
            ),
          ],
        ),
      ),
    );
  }
}
