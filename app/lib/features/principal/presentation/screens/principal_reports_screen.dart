import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalReportsScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const PrincipalReportsScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalReportsScreen> createState() => _PrincipalReportsScreenState();
}

class _PrincipalReportsScreenState extends ConsumerState<PrincipalReportsScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void didUpdateWidget(covariant PrincipalReportsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _getCurrentRoute() {
    switch (_tabController.index) {
      case 0:
        return '/principal/reports/student';
      case 1:
        return '/principal/reports/fee';
      case 2:
        return '/principal/reports/attendance';
      case 3:
        return '/principal/reports/exams';
      case 4:
        return '/principal/reports/syllabus-overview';
      default:
        return '/principal/reports';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: PrincipalNavigationDrawer(currentRoute: _getCurrentRoute()),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Campus Analytics',
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
                Text('Institutional Reports', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Academic metrics, fee audit & syllabus velocity', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    onTap: (_) => setState(() {}),
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                    tabs: const [
                      Tab(text: 'Students'),
                      Tab(text: 'Fees Collection'),
                      Tab(text: 'Attendance'),
                      Tab(text: 'Exams & GPA'),
                      Tab(text: 'Syllabus'),
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
                _buildStudentReports(),
                _buildFeeReports(),
                _buildAttendanceReports(),
                _buildExamReports(),
                _buildSyllabusReports(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentReports() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCard('Total Campus Enrollment', '1,240 Students', 'Across Primary, Middle & High School', const Color(0xFF2563EB)),
          const SizedBox(height: 12),
          Text('Enrollment by Section', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 8),
          _buildProgressRow('Primary Section (Grades 1-5)', '320 Students', 0.26),
          const SizedBox(height: 8),
          _buildProgressRow('Middle School (Grades 6-8)', '410 Students', 0.33),
          const SizedBox(height: 8),
          _buildProgressRow('High School (Grades 9-10)', '280 Students', 0.23),
          const SizedBox(height: 8),
          _buildProgressRow('Senior Secondary (Grades 11-12)', '230 Students', 0.18),
        ],
      ),
    );
  }

  Widget _buildFeeReports() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCard('Month Fee Collection', '₹1,48,500', '84% of ₹1,76,900 Total Billed', EduPulseColors.success),
          const SizedBox(height: 12),
          Text('Collection Channels', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 8),
          _buildProgressRow('Online Payment Gateway', '₹1,02,400 (69%)', 0.69),
          const SizedBox(height: 8),
          _buildProgressRow('Cash Counter Receipts', '₹36,100 (24%)', 0.24),
          const SizedBox(height: 8),
          _buildProgressRow('Cheque & Bank Transfer', '₹10,000 (7%)', 0.07),
        ],
      ),
    );
  }

  Widget _buildAttendanceReports() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCard('Daily Campus Attendance', '96.2%', '1,193 Students Present Today', EduPulseColors.success),
          const SizedBox(height: 12),
          Text('Grade-Wise Attendance', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 8),
          _buildProgressRow('Grade 10', '98.5% Rate', 0.985),
          const SizedBox(height: 8),
          _buildProgressRow('Grade 11', '96.2% Rate', 0.962),
          const SizedBox(height: 8),
          _buildProgressRow('Grade 6', '95.0% Rate', 0.950),
          const SizedBox(height: 8),
          _buildProgressRow('Grade 8', '93.8% Rate', 0.938),
        ],
      ),
    );
  }

  Widget _buildExamReports() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCard('Academic Performance', '86.4% Avg GPA', 'Quarterly Assessment 1 Results', const Color(0xFF7C3AED)),
          const SizedBox(height: 12),
          Text('Grade Performance Band', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 8),
          _buildProgressRow('A1 / Distinction (90-100%)', '380 Students (31%)', 0.31),
          const SizedBox(height: 8),
          _buildProgressRow('A2 / Merit (80-89%)', '450 Students (36%)', 0.36),
          const SizedBox(height: 8),
          _buildProgressRow('B1 / First Class (70-79%)', '290 Students (23%)', 0.23),
          const SizedBox(height: 8),
          _buildProgressRow('B2 & Below (<70%)', '120 Students (10%)', 0.10),
        ],
      ),
    );
  }

  Widget _buildSyllabusReports() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSummaryCard('Curriculum Velocity', '72% Covered', 'On target for Term 1 Final Exams', const Color(0xFFD97706)),
          const SizedBox(height: 12),
          Text('Department Completion', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 8),
          _buildProgressRow('Science & Physics', '78% Covered', 0.78),
          const SizedBox(height: 8),
          _buildProgressRow('Mathematics & Geometry', '74% Covered', 0.74),
          const SizedBox(height: 8),
          _buildProgressRow('Social Sciences', '70% Covered', 0.70),
          const SizedBox(height: 8),
          _buildProgressRow('Languages & Literature', '68% Covered', 0.68),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String title, String val, String sub, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, color: EduPulseColors.textMuted)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: color)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildProgressRow(String label, String stat, double val) {
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
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(stat, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
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
