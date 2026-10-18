import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/parent_controller.dart';

class ParentAcademicsScreen extends ConsumerWidget {
  const ParentAcademicsScreen({super.key});

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
  Widget build(BuildContext context, WidgetRef ref) {
    final activeChildIndex = ref.watch(activeChildIndexProvider);
    final children = [
      {'name': 'Rohan Sharma', 'grade': '10th Grade', 'roll_no': 'STU2025-101', 'section': 'A'},
      {'name': 'Riya Sharma', 'grade': '6th Grade', 'roll_no': 'STU2025-102', 'section': 'B'},
      {'name': 'Ankit Verma', 'grade': '8th Grade', 'roll_no': 'STU2025-103', 'section': 'A'},
    ];
    final activeChild = children[activeChildIndex.clamp(0, children.length - 1)];

    final subjects = [
      {'name': 'Mathematics', 'grade': 'A+', 'marks': '95/100'},
      {'name': 'Science', 'grade': 'A', 'marks': '90/100'},
      {'name': 'English', 'grade': 'A', 'marks': '88/100'},
      {'name': 'Social Science', 'grade': 'B+', 'marks': '82/100'},
      {'name': 'Computer', 'grade': 'A+', 'marks': '98/100'},
    ];

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Academics',
        switcherLabel: '${activeChild['name']} • Academic Record',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Academic Details', style: EduPulseTypography.headlineLg()),
                      const SizedBox(height: 2),
                      Text('Student progress, subject marks, and evaluations', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Official report card for ${activeChild['name']} downloaded!'),
                        backgroundColor: EduPulseColors.success,
                      ),
                    );
                  },
                  icon: const Icon(Icons.download, size: 16),
                  label: const Text('Report Card', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    side: const BorderSide(color: EduPulseColors.border),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 1: Student Information Grid
            Container(
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
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Student Information', style: EduPulseTypography.headlineMd()),
                        const StatusPill(label: 'Enrolled', variant: PillVariant.success),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildInfoRow('Roll No', activeChild['roll_no']!, 'Class', activeChild['grade']!),
                        const SizedBox(height: 12),
                        _buildInfoRow('Section', activeChild['section']!, 'Admission Date', '10 April 2021'),
                        const SizedBox(height: 12),
                        _buildInfoRow('Current Year', '2025-26', 'Performance', 'Excellent'),
                        const SizedBox(height: 12),
                        _buildInfoRow('Overall Attendance', '96%', 'Standing', 'Top 5% Honor Roll'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Card 2: Subjects & Grades Table
            Container(
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
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.school, color: EduPulseColors.primary, size: 20),
                            SizedBox(width: 8),
                            Text('Subjects & Term Grades', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                    itemCount: subjects.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, i) {
                      final sub = subjects[i];
                      final String grade = sub['grade']!;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 4,
                              child: Text(sub['name']!, style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                            ),
                            Expanded(
                              flex: 3,
                              child: Text(sub['marks']!, textAlign: TextAlign.center, style: EduPulseTypography.bodySm()),
                            ),
                            Expanded(
                              flex: 2,
                              child: Text(
                                grade,
                                textAlign: TextAlign.right,
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: _getGradeColor(grade)),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label1, String value1, String label2, String value2) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label1, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
              const SizedBox(height: 2),
              Text(value1, style: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13)),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label2, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
              const SizedBox(height: 2),
              Text(value2, style: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }
}
