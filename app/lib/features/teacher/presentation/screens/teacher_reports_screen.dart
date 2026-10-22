import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherReportsScreen extends ConsumerWidget {
  const TeacherReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/reports'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Academic Reports',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Class Performance & Analytics', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Subject GPA benchmarks, pass rates & test averages', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // Performance Cards
            Row(
              children: [
                Expanded(child: _buildMetricCard('Subject Average', '84.6%', 'Physics (Grades 10-12)', const Color(0xFF059669))),
                const SizedBox(width: 10),
                Expanded(child: _buildMetricCard('Pass Rate', '97.2%', '140 / 144 Students', const Color(0xFF2563EB))),
              ],
            ),
            const SizedBox(height: 16),

            Text('Batch GPA Breakdown', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            _buildClassRow('Grade 10-A (AP Physics)', '89.2% Class Avg', 0.892),
            const SizedBox(height: 8),
            _buildClassRow('Grade 11-Science (Electromagnetism)', '84.0% Class Avg', 0.840),
            const SizedBox(height: 8),
            _buildClassRow('Grade 9-B (General Physics)', '82.5% Class Avg', 0.825),
            const SizedBox(height: 8),
            _buildClassRow('Grade 12-Senior Science (Modern Physics)', '86.4% Class Avg', 0.864),
            const SizedBox(height: 18),

            Text('Syllabus Delivery Pace', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            _buildPaceCard('Term 1 Completion', '100% Target Met', 'All units tested and evaluated'),
            const SizedBox(height: 8),
            _buildPaceCard('Term 2 In-Progress', '72% Covered', '4 units remaining before finals'),
            const SizedBox(height: 24),
          ],
        ),
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

  Widget _buildClassRow(String title, String avg, double val) {
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
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(avg, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF059669))),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: val,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: EduPulseColors.surfaceContainerHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF059669)),
          ),
        ],
      ),
    );
  }

  Widget _buildPaceCard(String title, String status, String note) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              Text(note, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
            ],
          ),
          Text(status, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF059669))),
        ],
      ),
    );
  }
}
