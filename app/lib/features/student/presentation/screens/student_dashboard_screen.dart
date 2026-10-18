import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/metric_card.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../controllers/student_controller.dart';
import 'student_library_screen.dart';
import 'student_messages_screen.dart';
import 'student_profile_screen.dart';
import 'student_shell_screen.dart';

class StudentDashboardScreen extends ConsumerWidget {
  const StudentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final dashboardAsync = ref.watch(studentDashboardProvider);
    final attendanceAsync = ref.watch(studentAttendanceProvider);
    final noticesAsync = ref.watch(studentNoticesProvider);

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Student Portal',
        switcherLabel: user != null ? '${user.fullName} (${user.email})' : 'Student (Learnaz)',
        onProfileTap: () {
          _showProfileBottomSheet(context, ref, user);
        },
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentDashboardProvider);
          ref.invalidate(studentAttendanceProvider);
          ref.invalidate(studentNoticesProvider);
        },
        child: dashboardAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: EduPulseColors.primary),
          ),
          error: (err, stack) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off_rounded, size: 48, color: EduPulseColors.error),
                  const SizedBox(height: 12),
                  Text('Failed to load dashboard', style: EduPulseTypography.headlineMd()),
                  const SizedBox(height: 6),
                  Text('$err', style: EduPulseTypography.bodySm(), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.refresh(studentDashboardProvider),
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            ),
          ),
          data: (data) {
            final studentInfo = data?['student_info'] as Map<String, dynamic>? ?? {};
            final classDetails = data?['class_details'] as Map<String, dynamic>? ?? {};
            final stats = data?['stats'] as Map<String, dynamic>? ?? {};
            final todaysClasses = (data?['todays_classes'] as List?)?.map((c) => Map<String, dynamic>.from(c)).toList() ?? [];

            final studentName = studentInfo['name'] ?? user?.fullName ?? 'Alex Doe';
            final className = classDetails['class'] != null ? 'Class ${classDetails['class']}-${classDetails['section'] ?? 'A'}' : 'Class 10-A';
            final roomNo = classDetails['room_no'] ?? '101';
            final teacherInCharge = classDetails['teacher_in_charge'] ?? 'Faculty Coordinator';

            // Dynamic Attendance Calculation
            final attendanceStats = attendanceAsync.value?['stats'] as Map<String, dynamic>?;
            final dynamicAttPct = stats['attendance_percentage'] ??
                (attendanceStats?['attendance_percentage']);
            final double attendanceVal = double.tryParse(dynamicAttPct?.toString() ?? '92.86') ?? 92.86;
            final attendanceRate = '${attendanceVal.toStringAsFixed(1)}%';
            final String attStanding = stats['attendance_standing']?.toString() ??
                (attendanceVal >= 85 ? 'Live Record' : (attendanceVal >= 75 ? 'On Track' : 'Needs Care'));
            final PillVariant attPillVariant = attendanceVal >= 85
                ? PillVariant.success
                : (attendanceVal >= 75 ? PillVariant.info : PillVariant.warning);

            // Dynamic Avg Grade / GPA Calculation
            final String gpaValue = stats['gpa']?.toString() ?? '3.88';
            final String gradeLetter = stats['avg_grade']?.toString() ?? 'A';
            final String standing = stats['academic_standing']?.toString() ?? 'Honor Roll';

            // Dynamic Classes Today & Next Class
            final int classesTodayCount = int.tryParse(stats['classes_today']?.toString() ?? '') ?? todaysClasses.length;
            final String? nextClassTime = stats['next_class_time']?.toString();
            final String classBadge = nextClassTime != null ? 'Next $nextClassTime' : 'Schedule';

            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Greeting & Student Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    'Welcome, $studentName',
                                    style: EduPulseTypography.headlineLg(),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Text('👋', style: TextStyle(fontSize: 22)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.school, size: 16, color: EduPulseColors.primary),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '$className • Room $roomNo • In-charge: $teacherInCharge',
                                    style: EduPulseTypography.bodySm(),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: EduPulseColors.primaryContainer,
                          shape: BoxShape.circle,
                          border: Border.all(color: EduPulseColors.border, width: 2),
                        ),
                        child: const Center(
                          child: Icon(Icons.person, color: EduPulseColors.primary, size: 28),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // 3-Column Top KPI Cards
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(studentTabProvider.notifier).state = 3,
                          child: MetricCard(
                            label: 'Attendance',
                            value: attendanceRate,
                            badgeText: attStanding,
                            badgeVariant: attPillVariant,
                            badgeIcon: Icons.trending_up,
                            trailingIcon: Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: attendanceVal >= 85 ? EduPulseColors.success : EduPulseColors.warning,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(studentTabProvider.notifier).state = 2,
                          child: MetricCard(
                            label: 'Avg Grade',
                            value: '$gpaValue ($gradeLetter)',
                            badgeText: standing,
                            badgeVariant: PillVariant.info,
                            trailingIcon: const Icon(
                              Icons.star,
                              size: 16,
                              color: EduPulseColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(studentTabProvider.notifier).state = 1,
                          child: MetricCard(
                            label: 'Today Classes',
                            value: '$classesTodayCount',
                            badgeText: classBadge,
                            badgeVariant: PillVariant.neutral,
                            trailingIcon: const Icon(
                              Icons.calendar_today,
                              size: 16,
                              color: EduPulseColors.primary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Today's Live Schedule
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.schedule_rounded, size: 18, color: EduPulseColors.primary),
                          const SizedBox(width: 6),
                          Text("Today's Schedule", style: EduPulseTypography.headlineMd()),
                        ],
                      ),
                      TextButton(
                        onPressed: () => ref.read(studentTabProvider.notifier).state = 1,
                        child: Text('View Full Timetable >', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  if (todaysClasses.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: EduPulseColors.border),
                      ),
                      child: Center(
                        child: Text('No classes scheduled for today.', style: EduPulseTypography.bodySm()),
                      ),
                    )
                  else
                    Column(
                      children: todaysClasses.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final c = entry.value;
                        final isFirst = idx == 0;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isFirst ? EduPulseColors.surfaceContainerLow : EduPulseColors.surfaceCard,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isFirst ? EduPulseColors.primary.withValues(alpha: 0.3) : EduPulseColors.border,
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isFirst ? EduPulseColors.primary : EduPulseColors.surfaceContainerHigh,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Icon(
                                    Icons.menu_book_rounded,
                                    color: isFirst ? Colors.white : EduPulseColors.primary,
                                    size: 22,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          c['subject_name'] ?? 'Subject',
                                          style: EduPulseTypography.labelLg(),
                                        ),
                                        if (isFirst) ...[
                                          const SizedBox(width: 6),
                                          const StatusPill(label: 'UPCOMING', variant: PillVariant.info),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Room ${c['room_no'] ?? roomNo} • Teacher: ${c['teacher_name'] ?? teacherInCharge}',
                                      style: EduPulseTypography.bodySm(),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${c['start_time']} - ${c['end_time']}',
                                    style: EduPulseTypography.labelMd(color: EduPulseColors.primary),
                                  ),
                                  Text(
                                    'Period ${idx + 1}',
                                    style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 16),

                  // Quick Actions Grid (Interactive!)
                  Row(
                    children: [
                      const Icon(Icons.bolt, size: 18, color: EduPulseColors.primary),
                      const SizedBox(width: 6),
                      Text('Quick Actions', style: EduPulseTypography.headlineMd()),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildActionTile(
                        icon: Icons.payments_outlined,
                        label: 'Pay\nFees',
                        bgColor: const Color(0xFFF5F3FF),
                        iconColor: const Color(0xFF7C3AED),
                        onTap: () => ref.read(studentTabProvider.notifier).state = 4,
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.calendar_month_outlined,
                        label: 'Class\nTimetable',
                        bgColor: const Color(0xFFEFF6FF),
                        iconColor: EduPulseColors.primary,
                        onTap: () => ref.read(studentTabProvider.notifier).state = 1,
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.school_outlined,
                        label: 'Grades &\nExams',
                        bgColor: const Color(0xFFFEF3C7),
                        iconColor: const Color(0xFFD97706),
                        onTap: () => ref.read(studentTabProvider.notifier).state = 2,
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.assignment_turned_in_outlined,
                        label: 'Full\nAttendance',
                        bgColor: const Color(0xFFECFDF5),
                        iconColor: EduPulseColors.success,
                        onTap: () => ref.read(studentTabProvider.notifier).state = 3,
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _buildActionTile(
                        icon: Icons.auto_stories_outlined,
                        label: 'Library\nCenter',
                        bgColor: const Color(0xFFF0FDF4),
                        iconColor: const Color(0xFF16A34A),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const StudentLibraryScreen()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.chat_bubble_outline_rounded,
                        label: 'Campus\nMessages',
                        bgColor: const Color(0xFFEFF6FF),
                        iconColor: EduPulseColors.primary,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const StudentMessagesScreen()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.person_outline_rounded,
                        label: 'My\nProfile',
                        bgColor: const Color(0xFFF5F3FF),
                        iconColor: const Color(0xFF7C3AED),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const StudentProfileScreen()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      _buildActionTile(
                        icon: Icons.badge_outlined,
                        label: 'Digital\nID Card',
                        bgColor: const Color(0xFFFFFBEB),
                        iconColor: const Color(0xFFD97706),
                        onTap: () => _showDigitalIdModal(context, studentInfo, user),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // School Broadcast Notices (Live from Backend)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.campaign, size: 18, color: EduPulseColors.primary),
                          const SizedBox(width: 6),
                          Text('Campus Notices', style: EduPulseTypography.headlineMd()),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  noticesAsync.when(
                    loading: () => const Center(
                      child: Padding(
                        padding: EdgeInsets.all(12),
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                    error: (_, __) => Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: EduPulseColors.border),
                      ),
                      child: Text('No campus notices at this time.', style: EduPulseTypography.bodySm()),
                    ),
                    data: (notices) {
                      if (notices.isEmpty) {
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: EduPulseColors.surfaceCard,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: EduPulseColors.border),
                          ),
                          child: Text('No active campus announcements.', style: EduPulseTypography.bodySm()),
                        );
                      }

                      return Column(
                        children: notices.map((notice) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: EduPulseColors.surfaceCard,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: EduPulseColors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    StatusPill(
                                      label: (notice['priority'] ?? 'GENERAL').toString().toUpperCase(),
                                      variant: notice['priority'] == 'high'
                                          ? PillVariant.error
                                          : PillVariant.info,
                                    ),
                                    const Spacer(),
                                    Text(
                                      notice['publish_date'] != null
                                          ? notice['publish_date'].toString().substring(0, 10)
                                          : 'Today',
                                      style: EduPulseTypography.bodySm(),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  notice['title'] ?? 'Notice',
                                  style: EduPulseTypography.labelLg(),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  notice['content'] ?? '',
                                  style: EduPulseTypography.bodySm(),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String label,
    required Color bgColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: EduPulseColors.border),
            boxShadow: const [
              BoxShadow(
                color: Color.fromRGBO(30, 41, 59, 0.04),
                blurRadius: 4,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDigitalIdModal(BuildContext context, Map<String, dynamic> studentInfo, dynamic user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),
            Text('Digital Student ID', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('LEARNAZ ACADEMY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                      Icon(Icons.school, color: Colors.white70),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Icon(Icons.person, color: Colors.white, size: 36),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              studentInfo['name'] ?? user?.fullName ?? 'Alex Doe',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 2),
                            Text('Roll: ${studentInfo['roll_no'] ?? '1001'} • Class 10-A', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            Text('Email: ${studentInfo['email'] ?? user?.email ?? 'student@school.com'}', style: const TextStyle(color: Colors.white60, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.qr_code, size: 24),
                        SizedBox(width: 8),
                        Text('VALID FOR 2026-2027 ACADEMIC YEAR', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 44),
                backgroundColor: EduPulseColors.primary,
              ),
              child: const Text('Close ID Card'),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  void _showProfileBottomSheet(BuildContext context, WidgetRef ref, dynamic user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text(user?.fullName ?? 'Student Account', style: EduPulseTypography.headlineMd()),
            Text(user?.email ?? '', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.person_outline_rounded, color: EduPulseColors.primary),
              title: const Text('My Profile & Record'),
              subtitle: const Text('Academic & Personal Details', style: TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.chevron_right, size: 18),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const StudentProfileScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.auto_stories_outlined, color: EduPulseColors.primary),
              title: const Text('Library & Resources'),
              subtitle: const Text('Books, Issues & Digital PDFs', style: TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.chevron_right, size: 18),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const StudentLibraryScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat_bubble_outline_rounded, color: EduPulseColors.primary),
              title: const Text('Messages & Queries'),
              subtitle: const Text('Faculty & Admin Notices', style: TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.chevron_right, size: 18),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const StudentMessagesScreen()),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.refresh_rounded, color: EduPulseColors.primary),
              title: const Text('Refresh Data'),
              onTap: () {
                Navigator.pop(ctx);
                ref.invalidate(studentDashboardProvider);
                ref.invalidate(studentAttendanceProvider);
                ref.invalidate(studentNoticesProvider);
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: EduPulseColors.error),
              title: const Text('Sign Out of Learnaz', style: TextStyle(color: EduPulseColors.error)),
              onTap: () {
                Navigator.pop(ctx);
                ref.read(authProvider.notifier).logout();
              },
            ),
          ],
        ),
      ),
    );
  }
}
