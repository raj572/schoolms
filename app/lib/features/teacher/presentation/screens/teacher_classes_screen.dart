import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherClassesScreen extends ConsumerWidget {
  const TeacherClassesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> classes = [
      {'name': 'Grade 10-A', 'subject': 'AP Physics Mechanics', 'room': 'Room 304', 'students': 42, 'schedule': 'Mon, Wed, Fri (09:15 AM)', 'attendance': '98%'},
      {'name': 'Grade 11-Science', 'subject': 'Electromagnetism & Waves', 'room': 'Science Lab A', 'students': 38, 'schedule': 'Tue, Thu (10:15 AM)', 'attendance': '94%'},
      {'name': 'Grade 9-B', 'subject': 'Foundation Physical Sciences', 'room': 'Room 205', 'students': 36, 'schedule': 'Daily (08:30 AM)', 'attendance': '96%'},
      {'name': 'Grade 12-Senior Science', 'subject': 'Modern Physics & Quantum', 'room': 'Lab Block 2', 'students': 28, 'schedule': 'Mon, Thu (01:15 PM)', 'attendance': '92%'},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/my-classes'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'My Classes',
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
                    Text('Assigned Classrooms', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Batches, timetables & student cohorts', style: EduPulseTypography.bodySm()),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('4 Batches', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: classes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final c = classes[i];
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
                          Text(c['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: EduPulseColors.surfaceContainerHigh,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '${c['students']} Students',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF059669)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(c['subject'] as String, style: const TextStyle(fontSize: 13, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text('${c['room']} • Timing: ${c['schedule']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      const SizedBox(height: 12),
                      const Divider(height: 1, color: EduPulseColors.borderLight),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Presence: ${c['attendance']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: EduPulseColors.success)),
                          OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Opening student roll list for ${c['name']}')),
                              );
                            },
                            icon: const Icon(Icons.groups_outlined, size: 14),
                            label: const Text('View Students', style: TextStyle(fontSize: 11)),
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(70, 28),
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                            ),
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
}
