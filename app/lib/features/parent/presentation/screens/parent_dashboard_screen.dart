import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../controllers/parent_controller.dart';
import 'parent_child_profile_screen.dart';

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  ConsumerState<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen> {
  int _selectedSubTab = 0; // 0: Exam Performance, 1: Fees Status, 2: Events, 3: Notices

  Color _getGradeColor(String grade) {
    switch (grade) {
      case 'A+':
        return const Color(0xFF059669);
      case 'A':
        return const Color(0xFF2563EB);
      case 'B+':
        return const Color(0xFFD97706);
      case 'B':
        return const Color(0xFFEA580C);
      default:
        return EduPulseColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authUser = ref.watch(authProvider).user;
    final activeChildIndex = ref.watch(activeChildIndexProvider);
    final dashboardAsync = ref.watch(parentDashboardProvider);

    final dynamicChildren = (dashboardAsync.valueOrNull?['children'] as List?)
        ?.map((c) => Map<String, dynamic>.from(c))
        .toList();

    // High quality children list
    final children = (dynamicChildren != null && dynamicChildren.isNotEmpty)
        ? dynamicChildren
        : [
      {
        'id': 1,
        'name': 'Rohan Sharma',
        'grade': '10th Grade',
        'class': '10th',
        'section': 'A',
        'roll_no': '10A-23',
        'attendance': 92.4,
        'school': 'Learnaz Academy',
      },
      {
        'id': 2,
        'name': 'Riya Sharma',
        'grade': '6th Grade',
        'class': '6th',
        'section': 'B',
        'roll_no': '6B-14',
        'attendance': 95.8,
        'school': 'Learnaz Academy',
      },
      {
        'id': 3,
        'name': 'Ankit Verma',
        'grade': '8th Grade',
        'class': '8th',
        'section': 'A',
        'roll_no': '8A-09',
        'attendance': 89.0,
        'school': 'Learnaz Academy',
      },
    ];

    final activeChild = children[activeChildIndex.clamp(0, children.length - 1)];
    final parentName = authUser?.fullName.isNotEmpty == true ? authUser!.fullName : 'Mr. Rajesh Sharma';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Parent Portal',
        switcherLabel: '${activeChild['name']} (${activeChild['grade']})',
        onSwitcherTap: () => _showChildSwitcherModal(context, ref, children, activeChildIndex),
        onProfileTap: () => _showParentProfileBottomSheet(context, ref, parentName, authUser?.email ?? ''),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(parentDashboardProvider);
          ref.invalidate(parentFeesNotifierProvider);
          ref.invalidate(parentNoticesProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Parent Dashboard', style: EduPulseTypography.headlineLg()),
                        const SizedBox(height: 2),
                        Text(
                          'Welcome, $parentName. Here\'s an overview of your child\'s progress.',
                          style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Action Buttons Row (Edit Profile & Download Report)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showEditProfileDialog(context, parentName, authUser?.email ?? ''),
                      icon: const Icon(Icons.edit_outlined, size: 16),
                      label: const Text('Edit Profile'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        side: const BorderSide(color: EduPulseColors.border),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${activeChild['name']}\'s performance report downloaded successfully!'),
                            backgroundColor: EduPulseColors.success,
                          ),
                        );
                      },
                      icon: const Icon(Icons.download, size: 16),
                      label: const Text('Download Report'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EduPulseColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Student Overview Card with Attendance Progress
              _buildChildSummaryCard(context, activeChild),
              const SizedBox(height: 18),

              // Quick Actions Grid (8 Shortcuts)
              _buildQuickActionsGrid(context, ref, activeChild),
              const SizedBox(height: 20),

              // 4-Segmented Switcher (Exam Performance, Fees Status, Upcoming Events, Notices)
              _buildSegmentedTabSelector(),
              const SizedBox(height: 14),

              // Active Sub-Tab Content
              if (_selectedSubTab == 0)
                _buildExamPerformanceCard()
              else if (_selectedSubTab == 1)
                _buildFeesStatusCard(context, ref)
              else if (_selectedSubTab == 2)
                _buildUpcomingEventsCard()
              else
                _buildRecentNoticesCard(context, ref),

              const SizedBox(height: 20),

              // Detailed Examination Roadmap Section (ChildExamDetailsCard)
              _buildDetailedExamCard(context),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== CHILD SUMMARY CARD ====================
  Widget _buildChildSummaryCard(BuildContext context, Map<String, dynamic> activeChild) {
    final double attendanceVal = (activeChild['attendance'] as num).toDouble();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(30, 41, 59, 0.05),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: EduPulseColors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    activeChild['name']![0],
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: EduPulseColors.primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(activeChild['name']!, style: EduPulseTypography.headlineMd()),
                    const SizedBox(height: 2),
                    Text(
                      '${activeChild['grade']} • Roll No: ${activeChild['roll_no']}',
                      style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                    ),
                  ],
                ),
              ),
              StatusPill(
                label: 'Attendance: ${attendanceVal.toStringAsFixed(0)}%',
                variant: attendanceVal >= 90 ? PillVariant.success : PillVariant.warning,
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Attendance Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(9999),
            child: LinearProgressIndicator(
              value: (attendanceVal / 100).clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: EduPulseColors.surfaceContainerHigh,
              valueColor: AlwaysStoppedAnimation<Color>(
                attendanceVal >= 90 ? EduPulseColors.success : EduPulseColors.warning,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Academic Year 2025–26', style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted)),
              Text('Good Standing • Regular Attendee', style: EduPulseTypography.labelSm(color: EduPulseColors.success)),
            ],
          ),
        ],
      ),
    );
  }

  // ==================== QUICK ACTIONS GRID ====================
  Widget _buildQuickActionsGrid(BuildContext context, WidgetRef ref, Map<String, dynamic> activeChild) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Quick Portals', style: EduPulseTypography.headlineMd()),
        const SizedBox(height: 10),
        Row(
          children: [
            _buildActionTile(
              icon: Icons.account_balance_wallet_outlined,
              label: 'Pay\nFees',
              bgColor: const Color(0xFFF5F3FF),
              iconColor: const Color(0xFF7C3AED),
              onTap: () => ref.read(parentTabProvider.notifier).state = 3,
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.event_available_outlined,
              label: 'Child\nAttendance',
              bgColor: const Color(0xFFECFDF5),
              iconColor: EduPulseColors.success,
              onTap: () => ref.read(parentTabProvider.notifier).state = 1,
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.school_outlined,
              label: 'Academic\nReport',
              bgColor: const Color(0xFFEFF6FF),
              iconColor: EduPulseColors.primary,
              onTap: () => ref.read(parentTabProvider.notifier).state = 2,
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.notifications_none_rounded,
              label: 'School\nNotices',
              bgColor: const Color(0xFFFFFBEB),
              iconColor: const Color(0xFFD97706),
              onTap: () => ref.read(parentTabProvider.notifier).state = 4,
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _buildActionTile(
              icon: Icons.person_outline_rounded,
              label: 'Student\nProfile',
              bgColor: const Color(0xFFF0FDF4),
              iconColor: const Color(0xFF16A34A),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => ParentChildProfileScreen(childData: activeChild)),
              ),
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.note_alt_outlined,
              label: 'Absence\nNote',
              bgColor: const Color(0xFFFEF2F2),
              iconColor: EduPulseColors.error,
              onTap: () => ref.read(parentTabProvider.notifier).state = 1,
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.military_tech_outlined,
              label: 'Exam\nResults',
              bgColor: const Color(0xFFF5F3FF),
              iconColor: const Color(0xFF7C3AED),
              onTap: () => setState(() => _selectedSubTab = 0),
            ),
            const SizedBox(width: 10),
            _buildActionTile(
              icon: Icons.event_outlined,
              label: 'Upcoming\nEvents',
              bgColor: const Color(0xFFEFF6FF),
              iconColor: EduPulseColors.primary,
              onTap: () => setState(() => _selectedSubTab = 2),
            ),
          ],
        ),
      ],
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
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
                child: Center(child: Icon(icon, color: iconColor, size: 20)),
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, height: 1.2),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== SEGMENTED TABS ====================
  Widget _buildSegmentedTabSelector() {
    final tabs = [
      {'title': 'Exams', 'icon': Icons.military_tech_outlined},
      {'title': 'Fees', 'icon': Icons.account_balance_wallet_outlined},
      {'title': 'Events', 'icon': Icons.calendar_today_outlined},
      {'title': 'Notices', 'icon': Icons.notifications_none_rounded},
    ];

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: List.generate(tabs.length, (index) {
          final isSel = _selectedSubTab == index;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedSubTab = index),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSel ? EduPulseColors.surfaceCard : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isSel
                      ? const [
                          BoxShadow(
                            color: Color.fromRGBO(0, 0, 0, 0.05),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      tabs[index]['icon'] as IconData,
                      size: 15,
                      color: isSel ? EduPulseColors.primary : EduPulseColors.textMuted,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      tabs[index]['title'] as String,
                      style: EduPulseTypography.labelSm(
                        color: isSel ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  // ==================== TAB 0: EXAM PERFORMANCE ====================
  Widget _buildExamPerformanceCard() {
    final examPerformance = [
      {'subject': 'Mathematics', 'marks': 85, 'max': 100, 'grade': 'A'},
      {'subject': 'Science', 'marks': 78, 'max': 100, 'grade': 'B+'},
      {'subject': 'English', 'marks': 92, 'max': 100, 'grade': 'A+'},
      {'subject': 'Social Science', 'marks': 82, 'max': 100, 'grade': 'B+'},
      {'subject': 'Computer Science', 'marks': 98, 'max': 100, 'grade': 'A+'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.military_tech_outlined, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Recent Exam Results', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const StatusPill(label: 'Term 2', variant: PillVariant.info),
              ],
            ),
          ),
          const Divider(height: 1),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: EduPulseColors.surfaceContainerLow,
            child: Row(
              children: [
                Expanded(flex: 4, child: Text('Subject', style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted))),
                Expanded(flex: 3, child: Text('Marks', textAlign: TextAlign.center, style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted))),
                Expanded(flex: 2, child: Text('Grade', textAlign: TextAlign.right, style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted))),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: examPerformance.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final exam = examPerformance[i];
              final String grade = exam['grade'] as String;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      flex: 4,
                      child: Text(exam['subject'] as String, style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text('${exam['marks']}/${exam['max']}', textAlign: TextAlign.center, style: EduPulseTypography.bodySm()),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        grade,
                        textAlign: TextAlign.right,
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _getGradeColor(grade)),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== TAB 1: FEES STATUS ====================
  Widget _buildFeesStatusCard(BuildContext context, WidgetRef ref) {
    final feeStatus = [
      {'id': 1, 'type': 'Admission Fee', 'dueDate': '2025-04-10', 'amount': '₹15,000', 'status': 'Paid'},
      {'id': 2, 'type': 'Library Fee', 'dueDate': '2025-04-08', 'amount': '₹1,000', 'status': 'Pending'},
      {'id': 3, 'type': 'Book Fee', 'dueDate': '2025-04-12', 'amount': '₹1,500', 'status': 'Pending'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.account_balance_wallet_outlined, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Fees Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                TextButton(
                  onPressed: () => ref.read(parentTabProvider.notifier).state = 3,
                  child: const Text('View Full Portal >', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: feeStatus.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final fee = feeStatus[i];
              final bool isPaid = fee['status'] == 'Paid';
              return Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(fee['type'] as String, style: EduPulseTypography.labelMd()),
                        const SizedBox(height: 2),
                        Text('Due Date: ${fee['dueDate']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      ],
                    ),
                    Row(
                      children: [
                        Text(fee['amount'] as String, style: EduPulseTypography.labelMd()),
                        const SizedBox(width: 10),
                        StatusPill(label: fee['status'] as String, variant: isPaid ? PillVariant.success : PillVariant.error),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== TAB 2: UPCOMING EVENTS ====================
  Widget _buildUpcomingEventsCard() {
    final upcomingEvents = [
      {'id': 1, 'title': 'PTM (Parent-Teacher Meeting)', 'date': '2025-04-15', 'time': '10:00 AM - 01:00 PM'},
      {'id': 2, 'title': 'Annual Sports Day', 'date': '2025-04-20', 'time': '08:30 AM - 04:00 PM'},
      {'id': 3, 'title': 'Science & Robotics Exhibition', 'date': '2025-04-28', 'time': '11:00 AM - 03:00 PM'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: const [
                Icon(Icons.calendar_today_outlined, color: EduPulseColors.primary, size: 20),
                SizedBox(width: 8),
                Text('Upcoming School Events', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: upcomingEvents.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final ev = upcomingEvents[i];
              return Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: EduPulseColors.primaryContainer,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(child: Icon(Icons.event, color: EduPulseColors.primary, size: 20)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ev['title'] as String, style: EduPulseTypography.labelMd()),
                          const SizedBox(height: 2),
                          Text('${ev['date']} • ${ev['time']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== TAB 3: RECENT NOTICES ====================
  Widget _buildRecentNoticesCard(BuildContext context, WidgetRef ref) {
    final notices = [
      {'id': 1, 'message': 'School will remain closed on 14th April for a public holiday.', 'date': '2025-04-08'},
      {'id': 2, 'message': 'Science exhibition registration closes on 12th April.', 'date': '2025-04-09'},
      {'id': 3, 'message': 'Term 2 Fee Clearance Reminder: Please clear outstanding charges.', 'date': '2025-04-05'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.notifications_none_rounded, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Recent Broadcasts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                TextButton(
                  onPressed: () => ref.read(parentTabProvider.notifier).state = 4,
                  child: const Text('All Notices >', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: notices.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final n = notices[i];
              return Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(n['message'] as String, style: EduPulseTypography.bodySm(color: EduPulseColors.textHeadline)),
                    const SizedBox(height: 4),
                    Text('Date: ${n['date']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== DETAILED EXAMINATION ROADMAP ====================
  Widget _buildDetailedExamCard(BuildContext context) {
    final schedules = [
      {'date': '2025-05-02', 'time': '09:00 - 11:30 AM', 'subject': 'Mathematics Final', 'room': 'Exam Hall A'},
      {'date': '2025-05-05', 'time': '09:00 - 11:30 AM', 'subject': 'Science & Lab Practicals', 'room': 'Lab 102'},
      {'date': '2025-05-08', 'time': '09:00 - 11:30 AM', 'subject': 'English Literature', 'room': 'Exam Hall B'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.assignment_outlined, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Term 2 Exam Roadmap', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const StatusPill(label: 'Upcoming', variant: PillVariant.info),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: schedules.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final s = schedules[i];
              return Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.schedule, size: 16, color: EduPulseColors.primary),
                          const SizedBox(height: 2),
                          Text(s['date']!.substring(5), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s['subject']!, style: EduPulseTypography.labelMd()),
                          const SizedBox(height: 2),
                          Text('${s['time']} • ${s['room']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== MODALS ====================
  void _showChildSwitcherModal(
    BuildContext context,
    WidgetRef ref,
    List<Map<String, dynamic>> children,
    int activeIndex,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Material(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(20),
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
              Text('Switch Child Profile', style: EduPulseTypography.headlineMd()),
              const SizedBox(height: 4),
              Text('Select a student to view their records and fee status.', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
              const SizedBox(height: 14),
              ...List.generate(children.length, (index) {
                final c = children[index];
                final isSel = index == activeIndex;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: isSel ? EduPulseColors.primaryContainer : EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSel ? EduPulseColors.primary : EduPulseColors.border),
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isSel ? EduPulseColors.primary : Colors.white,
                      child: Text(
                        c['name'][0],
                        style: TextStyle(color: isSel ? Colors.white : EduPulseColors.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: Text(c['name'], style: EduPulseTypography.labelMd()),
                    subtitle: Text('${c['grade']} • Roll: ${c['roll_no']}'),
                    trailing: isSel ? const Icon(Icons.check_circle, color: EduPulseColors.primary) : null,
                    onTap: () {
                      ref.read(activeChildIndexProvider.notifier).state = index;
                      Navigator.pop(ctx);
                    },
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  void _showParentProfileBottomSheet(
    BuildContext context,
    WidgetRef ref,
    String parentName,
    String email,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Material(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(20),
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
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: const BoxDecoration(
                      color: EduPulseColors.primaryContainer,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(child: Icon(Icons.family_restroom, color: EduPulseColors.primary, size: 26)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(parentName, style: EduPulseTypography.headlineMd()),
                        Text(email, style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.edit_outlined, color: EduPulseColors.primary),
                title: const Text('Edit Parent Contact Details'),
                subtitle: const Text('Phone, Email & Address', style: TextStyle(fontSize: 12)),
                onTap: () {
                  Navigator.pop(ctx);
                  _showEditProfileDialog(context, parentName, email);
                },
              ),
              ListTile(
                leading: const Icon(Icons.refresh_rounded, color: EduPulseColors.primary),
                title: const Text('Refresh Data'),
                onTap: () {
                  Navigator.pop(ctx);
                  ref.invalidate(parentDashboardProvider);
                },
              ),
              const Divider(),
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
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context, String currentName, String currentEmail) {
    final nameCtrl = TextEditingController(text: currentName);
    final emailCtrl = TextEditingController(text: currentEmail);
    final phoneCtrl = TextEditingController(text: '+91 9876543210');

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Edit Profile Information', style: EduPulseTypography.headlineMd()),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Parent Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: emailCtrl,
                decoration: const InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Profile details updated successfully!'), backgroundColor: EduPulseColors.success),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: EduPulseColors.primary),
              child: const Text('Save Changes'),
            ),
          ],
        );
      },
    );
  }
}
