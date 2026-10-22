import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalExamScreen extends ConsumerStatefulWidget {
  const PrincipalExamScreen({super.key});

  @override
  ConsumerState<PrincipalExamScreen> createState() => _PrincipalExamScreenState();
}

class _PrincipalExamScreenState extends ConsumerState<PrincipalExamScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _exams = [
    {
      'title': 'Mid-Term Examinations 2026',
      'dates': '15 Nov - 28 Nov 2026',
      'classes': 'Grades 6 to 12',
      'status': 'scheduled',
      'progress': 'Schedule Published',
    },
    {
      'title': 'Quarterly Assessment 1',
      'dates': '10 Aug - 18 Aug 2026',
      'classes': 'Grades 1 to 12',
      'status': 'completed',
      'progress': 'Report Cards Issued',
    },
    {
      'title': 'Pre-Board Examinations (Grade 10 & 12)',
      'dates': '10 Jan - 22 Jan 2027',
      'classes': 'Grade 10, Grade 12',
      'status': 'draft',
      'progress': 'Drafting Question Papers',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/exam'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Examinations Central',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
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
                    Text('Examinations & Grading', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Exam cycles, schedules & academic performance', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showCreateExamDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('New Exam'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Highlights
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF2563EB).withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.edit_note, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Upcoming: Mid-Term 2026',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline),
                        ),
                        Text(
                          'Starts in 24 days across 18 classrooms • Hall tickets ready',
                          style: EduPulseTypography.bodySm(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            Text('Active & Past Examination Cycles', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _exams.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final ex = _exams[i];
                final isCompleted = ex['status'] == 'completed';
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
                            child: Text(ex['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          ),
                          StatusPill(
                            label: (ex['status'] as String).toUpperCase(),
                            variant: isCompleted ? PillVariant.success : PillVariant.info,
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Duration: ${ex['dates']}', style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                      Text('Target: ${ex['classes']} • ${ex['progress']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      const SizedBox(height: 10),
                      const Divider(height: 1, color: EduPulseColors.borderLight),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Viewing marks & report cards for ${ex['title']}')),
                              );
                            },
                            icon: const Icon(Icons.visibility_outlined, size: 14),
                            label: const Text('View Schedules & Marks', style: TextStyle(fontSize: 11)),
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

  void _showCreateExamDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Exam Cycle'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Exam Cycle Name', hintText: 'e.g. Final Term 2026-27')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Start Date', hintText: '15 March 2027')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Eligible Classes', hintText: 'e.g. Grade 1 to 12')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Exam cycle scheduled!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Schedule Exam'),
          ),
        ],
      ),
    );
  }
}
