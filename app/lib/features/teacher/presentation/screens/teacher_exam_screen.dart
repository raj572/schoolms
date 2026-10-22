import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherExamScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: schedule, 1: marks

  const TeacherExamScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<TeacherExamScreen> createState() => _TeacherExamScreenState();
}

class _TeacherExamScreenState extends ConsumerState<TeacherExamScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  final List<Map<String, dynamic>> _schedules = [
    {'exam': 'Mid-Term 2026', 'subject': 'AP Physics Theory', 'class': 'Grade 10-A', 'date': '18 Nov 2026', 'time': '09:00 - 12:00 PM', 'room': 'Hall 1'},
    {'exam': 'Mid-Term 2026', 'subject': 'Physics Practical Lab', 'class': 'Grade 10-A', 'date': '20 Nov 2026', 'time': '10:00 - 01:00 PM', 'room': 'Science Lab A'},
    {'exam': 'Pre-Board 2027', 'subject': 'Electromagnetism', 'class': 'Grade 11-Science', 'date': '12 Jan 2027', 'time': '09:00 - 12:00 PM', 'room': 'Room 304'},
  ];

  final List<Map<String, dynamic>> _marksEntry = [
    {'student': 'Alex Doe', 'roll': '1001', 'class': 'Grade 10-A', 'max': 100, 'scored': 94, 'status': 'Graded'},
    {'student': 'Sarah Jenkins', 'roll': '1004', 'class': 'Grade 10-A', 'max': 100, 'scored': 88, 'status': 'Graded'},
    {'student': 'Rohan Sharma', 'roll': '1012', 'class': 'Grade 10-A', 'max': 100, 'scored': 76, 'status': 'Graded'},
    {'student': 'Priya Patel', 'roll': '1020', 'class': 'Grade 10-A', 'max': 100, 'scored': 91, 'status': 'Graded'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void didUpdateWidget(covariant TeacherExamScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: TeacherNavigationDrawer(currentRoute: _tabController.index == 0 ? '/teacher/exam/schedule' : '/teacher/exam/marks-entry'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Examinations',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Examinations & Grading', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Invigilation schedules & term marks entry', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    onTap: (_) => setState(() {}),
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    tabs: const [
                      Tab(text: 'Exam Schedules'),
                      Tab(text: 'Marks Entry'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildScheduleTab(),
                _buildMarksTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _schedules.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final s = _schedules[i];
        return Container(
          padding: const EdgeInsets.all(14),
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
                  Text(s['subject'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  StatusPill(label: s['class'] as String, variant: PillVariant.info),
                ],
              ),
              const SizedBox(height: 4),
              Text('${s['exam']} • ${s['date']} (${s['time']})', style: const TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w500)),
              Text('Room / Center: ${s['room']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMarksTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _marksEntry.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final m = _marksEntry[i];
        return Container(
          padding: const EdgeInsets.all(14),
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
                  Text(m['student'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text('${m['class']} • Roll #${m['roll']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              Row(
                children: [
                  Text(
                    '${m['scored']} / ${m['max']}',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF059669)),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 16),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Editing marks for ${m['student']}')),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
