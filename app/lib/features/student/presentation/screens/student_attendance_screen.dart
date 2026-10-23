import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/circular_progress_ring.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/metric_card.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/student_controller.dart';
import '../widgets/student_navigation_drawer.dart';

class StudentAttendanceScreen extends ConsumerStatefulWidget {
  const StudentAttendanceScreen({super.key});

  @override
  ConsumerState<StudentAttendanceScreen> createState() => _StudentAttendanceScreenState();
}

class _StudentAttendanceScreenState extends ConsumerState<StudentAttendanceScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final attendanceAsync = ref.watch(studentAttendanceProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const StudentNavigationDrawer(currentRoute: '/student/attendance'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Attendance',
        switcherLabel: 'Academic Record',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentAttendanceProvider);
        },
        child: attendanceAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text('Error loading attendance: $err')),
          data: (data) {
            final stats = data?['stats'] as Map<String, dynamic>? ?? {};
            final records = (data?['records'] as List?)?.map((r) => Map<String, dynamic>.from(r)).toList() ?? [];

            final percentage = double.tryParse(stats['attendance_percentage']?.toString() ?? '92.9') ?? 92.9;
            final presentCount = stats['present_count'] ?? 13;
            final lateCount = stats['late_count'] ?? 1;
            final absentCount = stats['absent_count'] ?? 0;

            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Attendance Overview Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Row(
                      children: [
                        CircularProgressRing(
                          percentage: percentage,
                          size: 96,
                          strokeWidth: 8,
                          progressColor: percentage >= 85.0 ? EduPulseColors.success : EduPulseColors.warning,
                          centerPrimaryText: '${percentage.toStringAsFixed(1)}%',
                          centerSecondaryText: 'Present',
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const StatusPill(
                                label: 'MIN REQUIREMENT 75%',
                                variant: PillVariant.info,
                              ),
                              const SizedBox(height: 8),
                              Text('Exemplary Attendance', style: EduPulseTypography.labelLg()),
                              const SizedBox(height: 2),
                              Text(
                                'You qualify for all examinations and academic honors this semester.',
                                style: EduPulseTypography.bodySm(),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 3-Column Metrics
                  Row(
                    children: [
                      Expanded(
                        child: MetricCard(
                          label: 'Present Days',
                          value: '$presentCount Days',
                          badgeText: 'Verified',
                          badgeVariant: PillVariant.success,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: MetricCard(
                          label: 'Late Check-ins',
                          value: '$lateCount Times',
                          badgeText: 'Within Limit',
                          badgeVariant: PillVariant.warning,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: MetricCard(
                          label: 'Unexcused',
                          value: '$absentCount Days',
                          badgeText: 'Zero Alert',
                          badgeVariant: PillVariant.neutral,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Log of Daily Records
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent Attendance Logs', style: EduPulseTypography.headlineMd()),
                      Text('${records.length} records', style: EduPulseTypography.bodySm()),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (records.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: EduPulseColors.border),
                      ),
                      child: Center(
                        child: Text('No attendance history yet.', style: EduPulseTypography.bodySm()),
                      ),
                    )
                  else
                    Column(
                      children: records.map((rec) {
                        final date = rec['attendance_date'] ?? '2026-10-16';
                        final status = (rec['status'] ?? 'present').toString().toLowerCase();
                        final checkInTime = rec['check_in_time'] != null
                            ? rec['check_in_time'].toString().substring(0, 5)
                            : '08:15';

                        PillVariant pillVariant = PillVariant.success;
                        if (status == 'late') pillVariant = PillVariant.warning;
                        if (status == 'absent') pillVariant = PillVariant.error;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: EduPulseColors.surfaceCard,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: EduPulseColors.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: status == 'present'
                                      ? const Color(0xFFECFDF5)
                                      : status == 'late'
                                          ? const Color(0xFFFFFBEB)
                                          : const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  status == 'present'
                                      ? Icons.check_circle_outline
                                      : status == 'late'
                                          ? Icons.access_time
                                          : Icons.cancel_outlined,
                                  color: status == 'present'
                                      ? EduPulseColors.success
                                      : status == 'late'
                                          ? const Color(0xFFD97706)
                                          : EduPulseColors.error,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(date, style: EduPulseTypography.labelMd()),
                                    Text('Campus Gate Check-in • $checkInTime AM', style: EduPulseTypography.bodySm()),
                                  ],
                                ),
                              ),
                              StatusPill(
                                label: status.toUpperCase(),
                                variant: pillVariant,
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
