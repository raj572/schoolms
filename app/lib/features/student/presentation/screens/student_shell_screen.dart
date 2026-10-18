import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import 'student_attendance_screen.dart';
import 'student_dashboard_screen.dart';
import 'student_fees_screen.dart';
import 'student_grades_screen.dart';
import 'student_timetable_screen.dart';

final studentTabProvider = StateProvider<int>((ref) => 0);

class StudentShellScreen extends ConsumerWidget {
  const StudentShellScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(studentTabProvider);

    final screens = const [
      StudentDashboardScreen(),
      StudentTimetableScreen(),
      StudentGradesScreen(),
      StudentAttendanceScreen(),
      StudentFeesScreen(),
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
          onTap: (index) => ref.read(studentTabProvider.notifier).state = index,
          backgroundColor: EduPulseColors.surfaceCard,
          selectedItemColor: EduPulseColors.primary,
          unselectedItemColor: EduPulseColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.grid_view_outlined),
              activeIcon: Icon(Icons.grid_view_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              activeIcon: Icon(Icons.calendar_today_rounded),
              label: 'Timetable',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.school_outlined),
              activeIcon: Icon(Icons.school_rounded),
              label: 'Grades',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.fact_check_outlined),
              activeIcon: Icon(Icons.fact_check_rounded),
              label: 'Attendance',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet_rounded),
              label: 'Fees',
            ),
          ],
        ),
      ),
    );
  }
}
