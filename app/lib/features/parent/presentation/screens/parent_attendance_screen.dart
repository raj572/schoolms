import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/parent_controller.dart';

class ParentAttendanceScreen extends ConsumerStatefulWidget {
  const ParentAttendanceScreen({super.key});

  @override
  ConsumerState<ParentAttendanceScreen> createState() => _ParentAttendanceScreenState();
}

class _ParentAttendanceScreenState extends ConsumerState<ParentAttendanceScreen> {

  @override
  Widget build(BuildContext context) {
    final activeChildIndex = ref.watch(activeChildIndexProvider);
    final children = [
      {'name': 'Rohan Sharma', 'grade': '10th Grade', 'attendance': 92.4, 'present': 18, 'absent': 1, 'late': 1},
      {'name': 'Riya Sharma', 'grade': '6th Grade', 'attendance': 95.8, 'present': 19, 'absent': 0, 'late': 1},
      {'name': 'Ankit Verma', 'grade': '8th Grade', 'attendance': 89.0, 'present': 17, 'absent': 2, 'late': 1},
    ];
    final activeChild = children[activeChildIndex.clamp(0, children.length - 1)];
    final double attendanceVal = (activeChild['attendance'] as num).toDouble();

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Attendance',
        switcherLabel: '${activeChild['name']} • Attendance',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header
            Text('Child Attendance Overview', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text(
              'Track monthly presence, records, and submit absence excuse notes.',
              style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
            ),
            const SizedBox(height: 16),

            // Top Summary Card
            Container(
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
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Overall Academic Year', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                          const SizedBox(height: 4),
                          Text(
                            '${attendanceVal.toStringAsFixed(1)}%',
                            style: EduPulseTypography.tabularXl(
                              color: attendanceVal >= 90 ? EduPulseColors.success : EduPulseColors.warning,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            activeChild['name'] as String,
                            style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                          ),
                        ],
                      ),
                      Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          color: EduPulseColors.primaryContainer,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Icon(
                            Icons.verified_user_rounded,
                            size: 34,
                            color: EduPulseColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 14),

                  // Metrics Row (Present, Absent, Late)
                  Row(
                    children: [
                      _buildMetricTile('Present', '${activeChild['present']} Days', EduPulseColors.success, const Color(0xFFECFDF5)),
                      const SizedBox(width: 8),
                      _buildMetricTile('Absent', '${activeChild['absent']} Days', EduPulseColors.error, const Color(0xFFFEF2F2)),
                      const SizedBox(width: 8),
                      _buildMetricTile('Late', '${activeChild['late']} Day', EduPulseColors.warning, const Color(0xFFFFFBEB)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Submit Excuse Documentation Button Surface
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.edit_note_rounded, color: EduPulseColors.primary, size: 22),
                      SizedBox(width: 8),
                      Text('Submit Absence Note or Doctor Slip', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Notify class teacher and school office in advance of student absence.',
                    style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _showAbsenceNoteModal(context, activeChild['name'] as String),
                      icon: const Icon(Icons.upload_file, size: 18),
                      label: const Text('Submit Excuse Documentation'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EduPulseColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Monthly Log Breakdown Card
            Container(
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
                        Text('Monthly Attendance History', style: EduPulseTypography.headlineMd()),
                        const StatusPill(label: '2025–26', variant: PillVariant.neutral),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  _buildMonthRow('October 2025 (Current)', '95.0%', 19, 1, PillVariant.success),
                  const Divider(height: 1),
                  _buildMonthRow('September 2025', '92.3%', 24, 2, PillVariant.success),
                  const Divider(height: 1),
                  _buildMonthRow('August 2025', '90.0%', 20, 2, PillVariant.success),
                  const Divider(height: 1),
                  _buildMonthRow('July 2025', '96.2%', 25, 1, PillVariant.success),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color, Color bgColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildMonthRow(String month, String pct, int present, int absent, PillVariant variant) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(month, style: EduPulseTypography.labelMd()),
              const SizedBox(height: 2),
              Text('$present Days Present • $absent Days Absent', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
            ],
          ),
          StatusPill(label: pct, variant: variant),
        ],
      ),
    );
  }

  void _showAbsenceNoteModal(BuildContext context, String childName) {
    String selectedReason = 'Medical / Illness';
    final noteCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
            child: Material(
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
                    Text('Submit Absence Note', style: EduPulseTypography.headlineMd()),
                    const SizedBox(height: 2),
                    Text('For student: $childName', style: EduPulseTypography.bodySm(color: EduPulseColors.primary)),
                    const SizedBox(height: 16),
                    Text('Absence Reason', style: EduPulseTypography.labelSm()),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedReason,
                      decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                      items: ['Medical / Illness', 'Family Function', 'Urgent Personal Work', 'Out of Station']
                          .map((r) => DropdownMenuItem(value: r, child: Text(r, style: const TextStyle(fontSize: 13))))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) setModalState(() => selectedReason = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    Text('Detailed Note for Teacher', style: EduPulseTypography.labelSm()),
                    const SizedBox(height: 8),
                    TextField(
                      controller: noteCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Enter reason or medical prescription details...',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Absence note for $childName submitted successfully!'),
                              backgroundColor: EduPulseColors.success,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: EduPulseColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Submit Excuse Documentation'),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
