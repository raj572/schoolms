import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherWorkspaceScreen extends StatefulWidget {
  const TeacherWorkspaceScreen({super.key});

  @override
  State<TeacherWorkspaceScreen> createState() => _TeacherWorkspaceScreenState();
}

class _TeacherWorkspaceScreenState extends State<TeacherWorkspaceScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Rapid Attendance state map studentId -> 'P' | 'T' | 'A'
  final Map<int, String> _attendanceMap = {
    1: 'P',
    2: 'T',
    3: 'P',
    4: 'A',
  };

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final user = ref.watch(authProvider).user;
        final teacherName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Dr. Aris Thorne';

        return Scaffold(
          key: _scaffoldKey,
          backgroundColor: EduPulseColors.surface,
          drawer: const TeacherNavigationDrawer(currentRoute: '/teacher'),
          appBar: EduPulseAppBar(
            title: 'Learnaz',
            subtitle: 'Faculty',
            switcherLabel: '$teacherName (Science Dept)',
            onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
            onProfileTap: () => ref.read(authProvider.notifier).logout(),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Educator Badge & Room Info
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const StatusPill(label: 'Educator Workspace', variant: PillVariant.info),
                    OutlinedButton.icon(
                      onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                      icon: const Icon(Icons.menu_open_rounded, size: 16),
                      label: const Text('All Menus', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: const Size(70, 28),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.meeting_room_outlined, size: 14, color: EduPulseColors.textMuted),
                    const SizedBox(width: 4),
                    Text('Room 304 • Science Wing', style: EduPulseTypography.bodySm()),
                    const SizedBox(width: 8),
                    Text('Term 2 (2024–25)', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                  ],
                ),
                const SizedBox(height: 12),
                const SizedBox(height: 12),

                // Greeting & Schedule Deck Counter
                Text('Good morning, $teacherName', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text(
                  'Lab 3 safety inspections completed. 3 active periods scheduled today.',
                  style: EduPulseTypography.bodySm(),
                ),
                const SizedBox(height: 14),

                // 2 Metric Counter Pills
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: EduPulseColors.surfaceCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: EduPulseColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: EduPulseColors.surfaceContainerLow,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.calendar_today, size: 18, color: EduPulseColors.primary),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('3 Classes', style: EduPulseTypography.tabularMd()),
                                Text("On today's deck", style: EduPulseTypography.bodySm()),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: EduPulseColors.surfaceCard,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: EduPulseColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: EduPulseColors.errorContainer,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.edit_note, size: 18, color: EduPulseColors.error),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('48 To Grade', style: EduPulseTypography.tabularMd()),
                                Text('12 urgent tests', style: EduPulseTypography.bodySm(color: EduPulseColors.error)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Faculty Modules Grid (Matching Web Sidebar Menus)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Faculty Modules', style: EduPulseTypography.headlineMd()),
                    Text('8 Portals', style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 12),

                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 1.55,
                  children: [
                    _buildModuleCard(
                      title: 'My Profile',
                      subtitle: 'Credentials & info',
                      icon: Icons.person_outline,
                      color: const Color(0xFF059669),
                      route: '/teacher/my-profile',
                    ),
                    _buildModuleCard(
                      title: 'My Classes',
                      subtitle: 'Periods & cohorts',
                      icon: Icons.meeting_room_outlined,
                      color: const Color(0xFF0284C7),
                      route: '/teacher/my-classes',
                    ),
                    _buildModuleCard(
                      title: 'Attendance',
                      subtitle: 'Mark & records',
                      icon: Icons.fact_check_outlined,
                      color: const Color(0xFF10B981),
                      route: '/teacher/attendance',
                    ),
                    _buildModuleCard(
                      title: 'Syllabus',
                      subtitle: 'Curriculum trackers',
                      icon: Icons.auto_stories_outlined,
                      color: const Color(0xFF7C3AED),
                      route: '/teacher/syllabus-completion',
                    ),
                    _buildModuleCard(
                      title: 'Exam',
                      subtitle: 'Schedules & marks',
                      icon: Icons.edit_calendar_outlined,
                      color: const Color(0xFFD97706),
                      route: '/teacher/exam',
                    ),
                    _buildModuleCard(
                      title: 'Assignments',
                      subtitle: 'Homework & tasks',
                      icon: Icons.assignment_outlined,
                      color: const Color(0xFFEA580C),
                      route: '/teacher/assignments',
                    ),
                    _buildModuleCard(
                      title: 'Reports',
                      subtitle: 'Student analytics',
                      icon: Icons.bar_chart_outlined,
                      color: const Color(0xFF4F46E5),
                      route: '/teacher/reports',
                    ),
                    _buildModuleCard(
                      title: 'Communication',
                      subtitle: 'Messages & notices',
                      icon: Icons.campaign_outlined,
                      color: const Color(0xFFEC4899),
                      route: '/teacher/communication',
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Next Class Card with Roll Call Status
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceCard,
                    borderRadius: BorderRadius.circular(16),
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: const [
                              StatusPill(label: '• STARTING IN 18 MINS', variant: PillVariant.success),
                            ],
                          ),
                          const StatusPill(label: 'Cohort A', variant: PillVariant.info),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text('AP Chemistry (Period 2)', style: EduPulseTypography.headlineMd()),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 14, color: EduPulseColors.textMuted),
                          const SizedBox(width: 4),
                          Text('09:30 – 10:45 AM', style: EduPulseTypography.bodySm()),
                          const SizedBox(width: 10),
                          const Icon(Icons.science_outlined, size: 14, color: EduPulseColors.textMuted),
                          const SizedBox(width: 4),
                          Text('Lab Station 3', style: EduPulseTypography.bodySm()),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Roll Call Progress
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.group_outlined, size: 16, color: EduPulseColors.primary),
                              const SizedBox(width: 6),
                              Text('Roll Call Status', style: EduPulseTypography.labelMd()),
                            ],
                          ),
                          Text('24 / 26 Present', style: EduPulseTypography.tabularMd(color: EduPulseColors.primary)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Multi-colored status bar
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: SizedBox(
                          height: 8,
                          child: Row(
                            children: [
                              Expanded(flex: 24, child: Container(color: EduPulseColors.success)),
                              Expanded(flex: 1, child: Container(color: EduPulseColors.badgeTardyText)),
                              Expanded(flex: 1, child: Container(color: EduPulseColors.error)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _buildLegendDot(EduPulseColors.success, '24 Present'),
                          const SizedBox(width: 12),
                          _buildLegendDot(EduPulseColors.badgeTardyText, '1 Tardy'),
                          const SizedBox(width: 12),
                          _buildLegendDot(EduPulseColors.error, '1 Unmarked'),
                        ],
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton(
                        onPressed: () {},
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.touch_app, size: 18),
                            SizedBox(width: 8),
                            Text('Open Interactive Roll Call'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.menu_book, size: 14),
                                  SizedBox(width: 4),
                                  Text('Lab Protocols', style: TextStyle(fontSize: 12)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.campaign, size: 14),
                                  SizedBox(width: 4),
                                  Text('Broadcast Note', style: TextStyle(fontSize: 12)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Rapid Attendance Widget
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.people, size: 18, color: EduPulseColors.primary),
                        const SizedBox(width: 6),
                        Text('Rapid Attendance', style: EduPulseTypography.headlineMd()),
                      ],
                    ),
                    Text('Auto-locks at 09:45 AM', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: EduPulseColors.border),
                  ),
                  child: Column(
                    children: [
                      _buildRosterRow(
                        id: 1,
                        name: 'Maya Lin',
                        seat: 'Seat 3A • Bench Leader',
                        tag: null,
                      ),
                      const Divider(height: 16),
                      _buildRosterRow(
                        id: 2,
                        name: 'Liam Vance',
                        seat: 'Seat 3B • Station Mate',
                        tag: 'Late Pass',
                        tagVariant: PillVariant.tardy,
                      ),
                      const Divider(height: 16),
                      _buildRosterRow(
                        id: 3,
                        name: 'Sarah Jenkins',
                        seat: 'Seat 4A • Safety Officer',
                        tag: null,
                      ),
                      const Divider(height: 16),
                      _buildRosterRow(
                        id: 4,
                        name: 'Marcus Chen',
                        seat: 'Seat 4B • Lab Support',
                        tag: 'Nurse Flag',
                        tagVariant: PillVariant.error,
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Roster attendance submitted to office!')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: EduPulseColors.surfaceContainerHigh,
                          foregroundColor: EduPulseColors.primary,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.send, size: 16),
                            SizedBox(width: 6),
                            Text('Submit Final Roster to Attendance Office'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Grading Queue
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.grading, size: 18, color: EduPulseColors.primary),
                        const SizedBox(width: 6),
                        Text('Grading Queue', style: EduPulseTypography.headlineMd()),
                      ],
                    ),
                    Text('48 Pending Total', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                  ],
                ),
                const SizedBox(height: 12),

                // Queue Item 1
                Container(
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
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: const [
                              StatusPill(label: 'AP Chem • Per 2', variant: PillVariant.info),
                              SizedBox(width: 6),
                              StatusPill(label: 'Rubric Synced', variant: PillVariant.neutral),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('92%', style: EduPulseTypography.tabularMd(color: EduPulseColors.success)),
                              Text('Class Avg', style: EduPulseTypography.bodySm()),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text("Lab Report #4: Hess's Law & Enthalpy", style: EduPulseTypography.labelLg()),
                      Text('Submitted yesterday, 11:59 PM', style: EduPulseTypography.bodySm()),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: const LinearProgressIndicator(
                          value: 24 / 28,
                          backgroundColor: EduPulseColors.surfaceContainer,
                          color: EduPulseColors.primary,
                          minHeight: 6,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('4 Submissions left to grade', style: EduPulseTypography.bodySm()),
                          ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(90, 30),
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                            ),
                            child: const Text('Grade Next >', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLegendDot(Color color, String text) {
    return Row(
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(text, style: EduPulseTypography.bodySm()),
      ],
    );
  }

  Widget _buildRosterRow({
    required int id,
    required String name,
    required String seat,
    String? tag,
    PillVariant tagVariant = PillVariant.info,
  }) {
    final currentStatus = _attendanceMap[id] ?? 'P';

    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: EduPulseColors.surfaceContainerHigh,
          child: Text(name[0], style: const TextStyle(fontWeight: FontWeight.bold, color: EduPulseColors.primary)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(child: Text(name, style: EduPulseTypography.labelMd(), overflow: TextOverflow.ellipsis)),
                  if (tag != null) ...[
                    const SizedBox(width: 6),
                    StatusPill(label: tag, variant: tagVariant),
                  ],
                ],
              ),
              Text(seat, style: EduPulseTypography.bodySm()),
            ],
          ),
        ),
        // P / T / A Toggle Group
        Container(
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceContainerLow,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              _buildAttendanceButton(id, 'P', currentStatus == 'P', EduPulseColors.success),
              _buildAttendanceButton(id, 'T', currentStatus == 'T', EduPulseColors.badgeTardyText),
              _buildAttendanceButton(id, 'A', currentStatus == 'A', EduPulseColors.error),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceButton(int studentId, String status, bool isSelected, Color activeColor) {
    return GestureDetector(
      onTap: () {
        setState(() => _attendanceMap[studentId] = status);
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isSelected ? activeColor : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Center(
          child: Text(
            status,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : EduPulseColors.textMuted,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return InkWell(
      onTap: () => context.go(route),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: EduPulseColors.surfaceCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: EduPulseColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(30, 41, 59, 0.03),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, size: 18, color: color),
                ),
                const Spacer(),
                const Icon(Icons.arrow_forward_ios, size: 11, color: EduPulseColors.textMuted),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: EduPulseTypography.labelMd(),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              subtitle,
              style: EduPulseTypography.bodySm(),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
