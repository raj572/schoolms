import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherSyllabusScreen extends ConsumerWidget {
  const TeacherSyllabusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> units = [
      {'unit': 'Unit 1: Kinematics & Laws of Motion', 'class': 'Grade 10-A Physics', 'progress': 1.0, 'status': 'Completed (12/12 topics)'},
      {'unit': 'Unit 2: Work, Energy & Power Theorem', 'class': 'Grade 10-A Physics', 'progress': 0.85, 'status': 'In Progress (8/10 topics)'},
      {'unit': 'Unit 3: Gravitation & Planetary Dynamics', 'class': 'Grade 10-A Physics', 'progress': 0.40, 'status': 'In Progress (4/10 topics)'},
      {'unit': 'Unit 4: Thermodynamics & Kinetic Theory', 'class': 'Grade 11-Science', 'progress': 0.65, 'status': 'In Progress (6/9 topics)'},
      {'unit': 'Unit 5: Oscillations & Wave Optics', 'class': 'Grade 11-Science', 'progress': 0.10, 'status': 'Upcoming (1/10 topics)'},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/syllabus-completion'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Syllabus Tracker',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Curriculum Progress', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Chapter milestones & teaching pace', style: EduPulseTypography.bodySm()),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('72% Avg', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Highlights
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.book, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('On Schedule for Term 2', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text('31 of 42 lesson plans delivered on time across all grades', style: EduPulseTypography.bodySm()),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            Text('Curriculum Units', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: units.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final u = units[i];
                final progress = u['progress'] as double;
                final isCompleted = progress >= 1.0;

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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(u['unit'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          ),
                          Text('${(progress * 100).toInt()}%', style: TextStyle(fontWeight: FontWeight.bold, color: isCompleted ? EduPulseColors.success : const Color(0xFF059669))),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('${u['class']} • ${u['status']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        borderRadius: BorderRadius.circular(3),
                        backgroundColor: EduPulseColors.surfaceContainerHigh,
                        valueColor: AlwaysStoppedAnimation<Color>(isCompleted ? EduPulseColors.success : const Color(0xFF059669)),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
