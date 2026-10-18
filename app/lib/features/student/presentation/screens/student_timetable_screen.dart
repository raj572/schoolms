import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/student_controller.dart';

class StudentTimetableScreen extends ConsumerStatefulWidget {
  const StudentTimetableScreen({super.key});

  @override
  ConsumerState<StudentTimetableScreen> createState() => _StudentTimetableScreenState();
}

class _StudentTimetableScreenState extends ConsumerState<StudentTimetableScreen> {
  int _selectedTab = 0; // 0: Class Schedule, 1: Exam Schedule
  int _selectedDayIndex = 0; // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri, 5: Sat

  final List<String> _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  final List<String> _dayShorts = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  @override
  Widget build(BuildContext context) {
    final dashboardData = ref.watch(studentDashboardProvider).value;
    final classDetails = dashboardData?['class_details'] as Map<String, dynamic>?;
    final classId = classDetails?['class_id'] ?? 3;
    final className = classDetails?['class'] != null ? 'Class ${classDetails!['class']}-${classDetails['section'] ?? 'A'}' : 'Class 10-A';

    final timetableAsync = ref.watch(studentTimetableProvider(classId));

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Timetable',
        switcherLabel: '$className Schedule',
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentTimetableProvider(classId));
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Segmented Switch: Class Schedule vs Exam Schedule
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedTab == 0 ? EduPulseColors.surfaceCard : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: _selectedTab == 0
                                ? const [
                                    BoxShadow(
                                      color: Color.fromRGBO(30, 41, 59, 0.06),
                                      blurRadius: 4,
                                      offset: Offset(0, 1),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.view_agenda_outlined,
                                size: 16,
                                color: _selectedTab == 0 ? EduPulseColors.primary : EduPulseColors.textMuted,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Class Schedule',
                                style: EduPulseTypography.labelMd(
                                  color: _selectedTab == 0 ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 1),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedTab == 1 ? EduPulseColors.surfaceCard : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: _selectedTab == 1
                                ? const [
                                    BoxShadow(
                                      color: Color.fromRGBO(30, 41, 59, 0.06),
                                      blurRadius: 4,
                                      offset: Offset(0, 1),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.school_outlined,
                                size: 16,
                                color: _selectedTab == 1 ? EduPulseColors.primary : EduPulseColors.textMuted,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Exam Schedule',
                                style: EduPulseTypography.labelMd(
                                  color: _selectedTab == 1 ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (_selectedTab == 0) ...[
                // Weekday Selector (Monday - Saturday)
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: List.generate(_days.length, (index) {
                      final isSelected = _selectedDayIndex == index;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedDayIndex = index),
                        child: Container(
                          width: 58,
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? EduPulseColors.primary : EduPulseColors.surfaceCard,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? EduPulseColors.primary : EduPulseColors.border,
                            ),
                          ),
                          child: Column(
                            children: [
                              Text(
                                _dayShorts[index],
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white70 : EduPulseColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${index + 16}',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : EduPulseColors.textHeadline,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                ),
                const SizedBox(height: 16),

                // Selected Day Schedule
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_days[_selectedDayIndex]} Classes',
                      style: EduPulseTypography.headlineMd(),
                    ),
                    const StatusPill(label: 'Room 101', variant: PillVariant.info),
                  ],
                ),
                const SizedBox(height: 12),

                timetableAsync.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (err, _) => Center(child: Text('Error loading schedule: $err')),
                  data: (items) {
                    final selectedDayName = _days[_selectedDayIndex];
                    final dayClasses = items.where((it) {
                      final day = (it['day_of_week'] ?? '').toString();
                      return day.toLowerCase() == selectedDayName.toLowerCase();
                    }).toList();

                    // Fallback to all items if filtered day is empty
                    final displayList = dayClasses.isNotEmpty ? dayClasses : items;

                    if (displayList.isEmpty) {
                      return Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: EduPulseColors.surfaceCard,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: EduPulseColors.border),
                        ),
                        child: Center(
                          child: Text('No classes scheduled for $selectedDayName.', style: EduPulseTypography.bodySm()),
                        ),
                      );
                    }

                    return Column(
                      children: displayList.asMap().entries.map((entry) {
                        final i = entry.key;
                        final item = entry.value;
                        final subject = item['subject']?['subject_name'] ?? item['subject_name'] ?? 'Mathematics';
                        final startTime = (item['start_time'] ?? '08:30').toString().substring(0, 5);
                        final endTime = (item['end_time'] ?? '09:15').toString().substring(0, 5);
                        final teacher = item['teacher']?['full_name'] ?? item['teacher_name'] ?? 'Faculty Member';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: EduPulseColors.surfaceCard,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: EduPulseColors.border),
                          ),
                          child: Row(
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    startTime,
                                    style: EduPulseTypography.tabularMd(color: EduPulseColors.primary),
                                  ),
                                  Text(
                                    endTime,
                                    style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              Container(
                                width: 2,
                                height: 36,
                                color: EduPulseColors.primary.withValues(alpha: 0.3),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      subject,
                                      style: EduPulseTypography.labelLg(),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Teacher: $teacher • Room 101',
                                      style: EduPulseTypography.bodySm(),
                                    ),
                                  ],
                                ),
                              ),
                              StatusPill(
                                label: 'Period ${i + 1}',
                                variant: PillVariant.neutral,
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ] else ...[
                // Exam Schedule
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
                          StatusPill(label: 'MID-TERM EXAMINATIONS', variant: PillVariant.warning),
                          Text('Nov 2026', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      _buildExamItem('Mathematics (Theory)', 'Nov 10, 2026', '09:00 AM - 12:00 PM', 'Hall A'),
                      const Divider(height: 24),
                      _buildExamItem('Physics & Laboratory', 'Nov 12, 2026', '09:00 AM - 12:00 PM', 'Science Wing'),
                      const Divider(height: 24),
                      _buildExamItem('Chemistry & Bio', 'Nov 15, 2026', '09:00 AM - 12:00 PM', 'Science Wing'),
                      const Divider(height: 24),
                      _buildExamItem('English Literature', 'Nov 18, 2026', '09:00 AM - 11:30 AM', 'Hall B'),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExamItem(String title, String date, String time, String room) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: EduPulseColors.primaryContainer,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(
            child: Icon(Icons.description_outlined, color: EduPulseColors.primary, size: 20),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: EduPulseTypography.labelMd()),
              Text('$date • $room', style: EduPulseTypography.bodySm()),
            ],
          ),
        ),
        Text(time, style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
      ],
    );
  }
}
