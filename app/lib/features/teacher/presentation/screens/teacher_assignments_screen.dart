import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherAssignmentsScreen extends ConsumerWidget {
  const TeacherAssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> assignments = [
      {
        'title': 'Problem Set 4: Newton\'s Third Law & Friction',
        'class': 'Grade 10-A Physics',
        'due': 'Due Tomorrow, 23 Oct',
        'submitted': '38 / 42 Submitted',
        'status': 'active',
      },
      {
        'title': 'Lab Report: Determination of Gravitational Acceleration (g)',
        'class': 'Grade 11-Science',
        'due': 'Due 26 Oct 2026',
        'submitted': '24 / 38 Submitted',
        'status': 'active',
      },
      {
        'title': 'Essay: Historical Evolution of Wave-Particle Duality',
        'class': 'Grade 12-Senior Science',
        'due': 'Closed on 18 Oct',
        'submitted': '28 / 28 Evaluated',
        'status': 'graded',
      },
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/assignments'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Assignments Hub',
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
                    Text('Student Assignments', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Homework tasks, lab reports & evaluations', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showCreateAssignmentDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Create'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: assignments.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final a = assignments[i];
                final isGraded = a['status'] == 'graded';

                return Container(
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
                        children: [
                          Expanded(
                            child: Text(a['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          ),
                          StatusPill(
                            label: isGraded ? 'EVALUATED' : 'ACTIVE',
                            variant: isGraded ? PillVariant.success : PillVariant.warning,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(a['class'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                      Text('${a['due']} • ${a['submitted']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      const SizedBox(height: 10),
                      const Divider(height: 1, color: EduPulseColors.borderLight),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Reviewing submissions for ${a['title']}')),
                              );
                            },
                            icon: const Icon(Icons.rate_review_outlined, size: 14),
                            label: const Text('Review Submissions', style: TextStyle(fontSize: 11)),
                          ),
                        ],
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

  void _showCreateAssignmentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Assignment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Assignment Title', hintText: 'e.g. Circular Motion Quiz')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Target Class', hintText: 'Grade 10-A Physics')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Due Date', hintText: '30 Oct 2026, 11:59 PM')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Assignment dispatched to student class portal!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Publish Assignment'),
          ),
        ],
      ),
    );
  }
}
