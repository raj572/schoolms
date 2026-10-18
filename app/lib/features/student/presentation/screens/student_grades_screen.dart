import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/circular_progress_ring.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../controllers/student_controller.dart';

class StudentGradesScreen extends ConsumerStatefulWidget {
  const StudentGradesScreen({super.key});

  @override
  ConsumerState<StudentGradesScreen> createState() => _StudentGradesScreenState();
}

class _StudentGradesScreenState extends ConsumerState<StudentGradesScreen> {
  int _selectedTermIndex = 0; // 0: Term 2 (Current), 1: Term 1, 2: Exam Schedule

  final List<String> _terms = ['Term 2 (Current)', 'Term 1', 'Exam Schedule'];

  final List<Map<String, dynamic>> _courses = [
    {
      'subject': 'AP Chemistry',
      'category': 'AP Science',
      'grade': 'A+',
      'score': 94.5,
      'trend': '+2.1%',
      'teacher': 'Dr. Aris Thorne • Period 2',
      'credits': 4.0,
      'pillVariant': PillVariant.success,
      'color': EduPulseColors.primary,
      'breakdown': [
        {'type': 'Mid-Semester Exam', 'max': 100, 'obtained': 95, 'weight': '40%'},
        {'type': 'Lab Practical & Safety', 'max': 50, 'obtained': 48, 'weight': '25%'},
        {'type': 'Organic Chemistry Quiz', 'max': 25, 'obtained': 24, 'weight': '15%'},
        {'type': 'Problem Sets & Homework', 'max': 50, 'obtained': 46, 'weight': '20%'},
      ],
    },
    {
      'subject': 'AP Calculus BC',
      'category': 'Mathematics',
      'grade': 'A',
      'score': 91.0,
      'trend': '+1.4%',
      'teacher': 'Prof. Julian Vance • Period 4',
      'credits': 4.0,
      'pillVariant': PillVariant.success,
      'color': Color(0xFF0284C7),
      'breakdown': [
        {'type': 'Mid-Semester Exam', 'max': 100, 'obtained': 90, 'weight': '40%'},
        {'type': 'Integration Techniques Test', 'max': 50, 'obtained': 47, 'weight': '25%'},
        {'type': 'Weekly Problem Sets', 'max': 50, 'obtained': 44, 'weight': '20%'},
        {'type': 'Vector Calculus Quiz', 'max': 25, 'obtained': 23, 'weight': '15%'},
      ],
    },
    {
      'subject': 'Physics C: Mechanics',
      'category': 'Physics',
      'grade': 'A',
      'score': 89.2,
      'trend': '+3.0%',
      'teacher': 'Elena Rostova • Period 1',
      'credits': 4.0,
      'pillVariant': PillVariant.success,
      'color': Color(0xFF7C3AED),
      'breakdown': [
        {'type': 'Mid-Semester Exam', 'max': 100, 'obtained': 88, 'weight': '40%'},
        {'type': 'Rotational Dynamics Lab', 'max': 50, 'obtained': 45, 'weight': '25%'},
        {'type': 'Kinematics Mastery Quiz', 'max': 25, 'obtained': 22, 'weight': '15%'},
        {'type': 'Analytical Homework', 'max': 50, 'obtained': 44, 'weight': '20%'},
      ],
    },
    {
      'subject': 'World History: Modern',
      'category': 'Humanities',
      'grade': 'A-',
      'score': 88.0,
      'trend': '-0.5%',
      'teacher': 'Marcus Sterling • Period 5',
      'credits': 3.5,
      'pillVariant': PillVariant.info,
      'color': Color(0xFFD97706),
      'breakdown': [
        {'type': 'Mid-Semester Essay', 'max': 100, 'obtained': 87, 'weight': '40%'},
        {'type': 'Primary Source Analysis', 'max': 50, 'obtained': 44, 'weight': '25%'},
        {'type': 'Industrial Revolution Quiz', 'max': 25, 'obtained': 22, 'weight': '15%'},
        {'type': 'Seminar Discussion', 'max': 50, 'obtained': 45, 'weight': '20%'},
      ],
    },
    {
      'subject': 'Honors English Literature',
      'category': 'Literature',
      'grade': 'B+',
      'score': 85.5,
      'trend': '+1.8%',
      'teacher': 'Sarah Jenkins • Period 3',
      'credits': 3.0,
      'pillVariant': PillVariant.info,
      'color': Color(0xFF059669),
      'breakdown': [
        {'type': 'Mid-Semester Analysis', 'max': 100, 'obtained': 85, 'weight': '40%'},
        {'type': 'Shakespeare Term Essay', 'max': 50, 'obtained': 43, 'weight': '25%'},
        {'type': 'Poetry Explication Quiz', 'max': 25, 'obtained': 21, 'weight': '15%'},
        {'type': 'Class Participation', 'max': 50, 'obtained': 44, 'weight': '20%'},
      ],
    },
  ];

  final List<Map<String, dynamic>> _upcomingExams = [
    {
      'subject': 'Mathematics (AP Calculus BC)',
      'date': '2026-11-15',
      'time': '09:00 AM - 12:00 PM',
      'room': 'Exam Hall A',
      'type': 'Semester Final',
      'syllabus': 'Differential & Integral Calculus, Series & Sequences',
    },
    {
      'subject': 'Physics C: Mechanics',
      'date': '2026-11-17',
      'time': '02:00 PM - 05:00 PM',
      'room': 'Exam Hall B',
      'type': 'Semester Final',
      'syllabus': 'Newtonian Mechanics, Work Energy, Oscillations',
    },
    {
      'subject': 'AP Chemistry',
      'date': '2026-11-20',
      'time': '09:00 AM - 12:00 PM',
      'room': 'Science Lab 201',
      'type': 'Practical & Written',
      'syllabus': 'Thermodynamics, Chemical Kinetics & Equilibrium',
    },
    {
      'subject': 'Computer Science & Algorithms',
      'date': '2026-11-22',
      'time': '10:00 AM - 01:00 PM',
      'room': 'Computing Lab 3',
      'type': 'Practical Coding',
      'syllabus': 'Object Oriented Design, Data Structures, Recursion',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final dashboardData = ref.watch(studentDashboardProvider).value;
    final stats = dashboardData?['stats'] as Map<String, dynamic>? ?? {};
    final marksAsync = ref.watch(studentMarksProvider);
    final marks = marksAsync.value ?? [];

    final studentInfo = dashboardData?['student_info'] as Map<String, dynamic>?;
    final studentName = studentInfo?['name']?.toString() ?? user?.fullName ?? 'Alex Doe';
    final rawClass = studentInfo?['class']?.toString() ?? '10';
    final rawSec = studentInfo?['section']?.toString() ?? 'A';
    final className = 'Class $rawClass-$rawSec';

    final List<Map<String, dynamic>> displayCourses = marks.isNotEmpty
        ? marks.map((m) {
            final subjectName = m['subject_name'] ??
                m['exam_schedule']?['subject']?['subject_name'] ??
                'Subject';
            final double obtained = (m['marks_obtained'] as num?)?.toDouble() ?? 0.0;
            final double total = (m['marks_total'] as num?)?.toDouble() ?? 100.0;
            final double score = total > 0 ? (obtained / total) * 100.0 : 0.0;
            final grade = m['grade']?.toString() ??
                (score >= 90 ? 'A+' : (score >= 80 ? 'A' : (score >= 70 ? 'B' : (score >= 60 ? 'C' : 'F'))));
            final PillVariant pill = score >= 80 ? PillVariant.success : (score >= 60 ? PillVariant.info : PillVariant.warning);

            return {
              'subject': subjectName,
              'category': 'Academic',
              'grade': grade,
              'score': score,
              'trend': '+1.2%',
              'teacher': m['teacher_name'] ?? 'Faculty Coordinator',
              'credits': 4.0,
              'pillVariant': pill,
              'color': EduPulseColors.primary,
              'breakdown': [
                {
                  'type': m['exam_name'] ?? 'Term Assessment',
                  'max': total.toInt(),
                  'obtained': obtained.toInt(),
                  'weight': '100%'
                }
              ],
            };
          }).toList()
        : _courses;

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Grades',
        switcherLabel: '$studentName ($className)',
      ),
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Term Selector Segmented Bar (matching app/uiux and website)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceContainer,
                borderRadius: BorderRadius.circular(9999),
              ),
              child: Row(
                children: List.generate(_terms.length, (index) {
                  final isSelected = index == _selectedTermIndex;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTermIndex = index),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? EduPulseColors.surfaceCard : Colors.transparent,
                          borderRadius: BorderRadius.circular(9999),
                          boxShadow: isSelected
                              ? const [
                                  BoxShadow(
                                    color: Color.fromRGBO(0, 0, 0, 0.06),
                                    blurRadius: 4,
                                    offset: Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          _terms[index],
                          textAlign: TextAlign.center,
                          style: EduPulseTypography.labelSm(
                            color: isSelected ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 16),

            if (_selectedTermIndex == 2)
              _buildExamScheduleView()
            else ...[
              // Academic Overview Hero Card (from app/uiux/grades_report_card)
              _buildAcademicHeroCard(studentName, className, stats),
              const SizedBox(height: 20),

              // Subject Grades Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text('Enrolled Courses', style: EduPulseTypography.headlineMd()),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: EduPulseColors.surfaceContainerHigh,
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: Text(
                          '${displayCourses.length} Subjects',
                          style: EduPulseTypography.labelSm(color: EduPulseColors.primary),
                        ),
                      ),
                    ],
                  ),
                  Text('Spring 2026', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                ],
              ),
              const SizedBox(height: 12),

              // Subject Cards List
              Column(
                children: displayCourses.map((course) => _buildCourseCard(course)).toList(),
              ),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAcademicHeroCard(String studentName, String className, Map<String, dynamic> stats) {
    final gpa = stats['gpa']?.toString() ?? '3.88';
    final standing = stats['academic_standing']?.toString() ?? "Dean's Honor Roll";
    final rankPct = double.tryParse(stats['exam_percentage']?.toString() ?? '97.0') ?? 97.0;
    final weightedGpa = (double.tryParse(gpa) != null ? (double.parse(gpa) + 0.27) : 4.15).toStringAsFixed(2);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(30, 41, 59, 0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  StatusPill(
                    label: standing,
                    variant: PillVariant.success,
                    icon: Icons.workspace_premium,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(gpa, style: EduPulseTypography.tabularXl(color: EduPulseColors.textHeadline)),
                      const SizedBox(width: 6),
                      Text('/ 4.0 Unweighted', style: EduPulseTypography.bodyMd(color: EduPulseColors.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Weighted GPA: $weightedGpa',
                    style: EduPulseTypography.labelMd(color: EduPulseColors.primary),
                  ),
                ],
              ),
              CircularProgressRing(
                percentage: rankPct,
                size: 78,
                strokeWidth: 8,
                progressColor: EduPulseColors.primary,
                centerPrimaryText: '${rankPct.toStringAsFixed(0)}%',
                centerSecondaryText: 'Percentile',
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Bento Stats Matrix
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Class Standing', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      const SizedBox(height: 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text('14th', style: EduPulseTypography.tabularLg(color: EduPulseColors.textHeadline)),
                          const SizedBox(width: 4),
                          Text('of 180', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text('Top 8% of Cohort', style: EduPulseTypography.labelSm(color: EduPulseColors.success)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Credit Completion', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      const SizedBox(height: 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text('24.5', style: EduPulseTypography.tabularLg(color: EduPulseColors.textHeadline)),
                          const SizedBox(width: 4),
                          Text('/ 28 Credits', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text('On Track for Honors', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Official Report Card Action CTA
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showOfficialReportCardModal(context, studentName, className),
              icon: const Icon(Icons.picture_as_pdf_rounded, size: 18),
              label: const Text('Download Official PDF Report Card'),
              style: ElevatedButton.styleFrom(
                backgroundColor: EduPulseColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    final double score = (course['score'] as num).toDouble();
    final String grade = course['grade'];
    final String subject = course['subject'];
    final String category = course['category'];
    final String teacher = course['teacher'];
    final String trend = course['trend'] ?? '+2.0%';
    final Color accentColor = course['color'] ?? EduPulseColors.primary;

    return GestureDetector(
      onTap: () => _showSubjectDetailModal(context, course),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: EduPulseColors.surfaceCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: EduPulseColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(30, 41, 59, 0.03),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Left Color Accent Strip
                Container(width: 4, color: accentColor),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: EduPulseColors.primaryContainer,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    category,
                                    style: EduPulseTypography.labelSm(color: EduPulseColors.primaryDeep),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Row(
                                  children: [
                                    Icon(
                                      trend.startsWith('+') ? Icons.trending_up : Icons.trending_down,
                                      size: 14,
                                      color: trend.startsWith('+') ? EduPulseColors.success : EduPulseColors.error,
                                    ),
                                    const SizedBox(width: 2),
                                    Text(
                                      trend,
                                      style: EduPulseTypography.labelSm(
                                        color: trend.startsWith('+') ? EduPulseColors.success : EduPulseColors.error,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                StatusPill(label: grade, variant: course['pillVariant']),
                                const SizedBox(width: 8),
                                Text(
                                  '$score%',
                                  style: EduPulseTypography.tabularMd(color: EduPulseColors.textHeadline),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(subject, style: EduPulseTypography.labelLg()),
                        const SizedBox(height: 2),
                        Text(teacher, style: EduPulseTypography.bodySm()),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: score / 100.0,
                            backgroundColor: EduPulseColors.surfaceContainer,
                            color: score >= 90.0 ? EduPulseColors.success : EduPulseColors.primary,
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExamScheduleView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Upcoming Exam Timetable', style: EduPulseTypography.headlineMd()),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('Hall Ticket Active', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ..._upcomingExams.map((exam) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
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
                      child: Text(
                        exam['subject'],
                        style: EduPulseTypography.labelLg(),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    StatusPill(label: exam['type'], variant: PillVariant.info),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 14, color: EduPulseColors.textMuted),
                    const SizedBox(width: 4),
                    Text(exam['date'], style: EduPulseTypography.bodySm()),
                    const SizedBox(width: 12),
                    const Icon(Icons.schedule_outlined, size: 14, color: EduPulseColors.textMuted),
                    const SizedBox(width: 4),
                    Text(exam['time'], style: EduPulseTypography.bodySm()),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.meeting_room_outlined, size: 14, color: EduPulseColors.primary),
                    const SizedBox(width: 4),
                    Text('Location: ${exam['room']}', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.menu_book_outlined, size: 14, color: EduPulseColors.textMuted),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Syllabus: ${exam['syllabus']}',
                          style: EduPulseTypography.bodySm(),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  void _showSubjectDetailModal(BuildContext context, Map<String, dynamic> course) {
    final breakdown = (course['breakdown'] as List?) ?? [];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: EduPulseColors.surfaceCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(course['subject'], style: EduPulseTypography.headlineMd()),
                        Text(course['teacher'], style: EduPulseTypography.bodySm()),
                      ],
                    ),
                    StatusPill(label: '${course['score']}% (${course['grade']})', variant: course['pillVariant']),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 12),
                Text('Assessment Breakdown & Weightage', style: EduPulseTypography.labelMd()),
                const SizedBox(height: 10),
                ...breakdown.map((item) {
                  final obtained = item['obtained'];
                  final max = item['max'];
                  final pct = (obtained / max) * 100;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['type'], style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                            Text('Weight: ${item['weight']}', style: EduPulseTypography.bodySm()),
                          ],
                        ),
                        Text(
                          '$obtained / $max (${pct.toStringAsFixed(0)}%)',
                          style: EduPulseTypography.tabularMd(color: EduPulseColors.primary),
                        ),
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showOfficialReportCardModal(BuildContext context, String studentName, String className) {
    showDialog(
      context: context,
      builder: (ctx) {
        double totalMax = _courses.length * 100.0;
        double totalObtained = 0.0;
        for (var c in _courses) {
          totalObtained += (c['score'] as num).toDouble();
        }
        final double overallPercentage = (totalObtained / totalMax) * 100.0;

        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.school, color: EduPulseColors.primary),
              const SizedBox(width: 8),
              Expanded(
                child: Text('Official Report Card', style: EduPulseTypography.headlineMd()),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$studentName • $className', style: EduPulseTypography.labelMd()),
                Text('Academic Session 2025–2026 • Term 2', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 14),
                Table(
                  border: TableBorder.all(color: EduPulseColors.border),
                  children: [
                    TableRow(
                      decoration: const BoxDecoration(color: EduPulseColors.surfaceContainerHigh),
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text('Subject', style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text('Marks', style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Text('Grade', style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                        ),
                      ],
                    ),
                    ..._courses.map((c) {
                      return TableRow(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(c['subject'], style: EduPulseTypography.bodySm(color: EduPulseColors.textHeadline)),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text('${c['score']}/100', style: EduPulseTypography.bodySm()),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(c['grade'], style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
                          ),
                        ],
                      );
                    }),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Aggregate Score', style: EduPulseTypography.bodySm()),
                          Text('${overallPercentage.toStringAsFixed(1)}%', style: EduPulseTypography.headlineMd(color: EduPulseColors.success)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Overall Status', style: EduPulseTypography.bodySm()),
                          const StatusPill(label: 'PASSED WITH HONORS', variant: PillVariant.success),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Report Card PDF downloaded for $studentName!'),
                    backgroundColor: EduPulseColors.primary,
                  ),
                );
              },
              icon: const Icon(Icons.download, size: 16),
              label: const Text('Export PDF'),
              style: ElevatedButton.styleFrom(backgroundColor: EduPulseColors.primary),
            ),
          ],
        );
      },
    );
  }
}
