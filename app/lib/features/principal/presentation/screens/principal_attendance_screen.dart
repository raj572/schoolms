import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalAttendanceScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: teachers, 1: analytics

  const PrincipalAttendanceScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalAttendanceScreen> createState() => _PrincipalAttendanceScreenState();
}

class _PrincipalAttendanceScreenState extends ConsumerState<PrincipalAttendanceScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  final List<Map<String, dynamic>> _teacherAttendance = [
    {'name': 'Sarah Connor', 'dept': 'Science', 'time': '08:12 AM', 'status': 'present'},
    {'name': 'Robert Taylor', 'dept': 'Mathematics', 'time': '08:05 AM', 'status': 'present'},
    {'name': 'Elena Rostova', 'dept': 'Languages', 'time': '—', 'status': 'leave'},
    {'name': 'Kavita Iyer', 'dept': 'Biology', 'time': '08:24 AM', 'status': 'present'},
    {'name': 'Vikram Rathore', 'dept': 'Physical Ed', 'time': '08:10 AM', 'status': 'present'},
    {'name': 'Anita Desai', 'dept': 'Library', 'time': '08:45 AM', 'status': 'late'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/attendance'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Daily Attendance',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Attendance Management', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Faculty attendance & campus-wide presence analytics', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    tabs: const [
                      Tab(text: 'Teacher Attendance'),
                      Tab(text: 'Analytics Dashboard'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTeachersTab(),
                _buildAnalyticsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeachersTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildMetricCard('Faculty on Duty', '68 / 72', '94% Present', EduPulseColors.success),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard('On Leave / Late', '4 Members', 'Approved', EduPulseColors.warning),
              ),
            ],
          ),
          const SizedBox(height: 14),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _teacherAttendance.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final t = _teacherAttendance[i];
              final status = t['status'] as String;
              PillVariant variant;
              if (status == 'present') {
                variant = PillVariant.success;
              } else if (status == 'late') {
                variant = PillVariant.warning;
              } else {
                variant = PillVariant.error;
              }

              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        Text('${t['dept']} • Punch-in: ${t['time']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      ],
                    ),
                    StatusPill(label: status.toUpperCase(), variant: variant),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildAnalyticsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
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
                  children: const [
                    Text('Campus Overall Health', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    StatusPill(label: 'Excellent', variant: PillVariant.success),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Student Rate: 96.2%', style: TextStyle(fontWeight: FontWeight.w600, color: EduPulseColors.success)),
                    Text('Staff Rate: 94.4%', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF2563EB))),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: 0.962,
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                  backgroundColor: EduPulseColors.surfaceContainerHigh,
                  valueColor: const AlwaysStoppedAnimation<Color>(EduPulseColors.success),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text('Weekly Absence Trends', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 10),
          _buildDayRow('Monday', '97.4% Present', 0.974),
          const SizedBox(height: 8),
          _buildDayRow('Tuesday', '96.8% Present', 0.968),
          const SizedBox(height: 8),
          _buildDayRow('Wednesday (Today)', '96.2% Present', 0.962),
          const SizedBox(height: 8),
          _buildDayRow('Thursday (Avg)', '95.9% Present', 0.959),
          const SizedBox(height: 8),
          _buildDayRow('Friday (Avg)', '94.8% Present', 0.948),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, String sub, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: color)),
          Text(sub, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildDayRow(String day, String rate, double val) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(day, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(rate, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: EduPulseColors.primary)),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: val,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: EduPulseColors.surfaceContainerHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF2563EB)),
          ),
        ],
      ),
    );
  }
}
