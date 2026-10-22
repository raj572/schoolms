import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalClassesScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: classes, 1: subjects, 2: timetable

  const PrincipalClassesScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalClassesScreen> createState() => _PrincipalClassesScreenState();
}

class _PrincipalClassesScreenState extends ConsumerState<PrincipalClassesScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  final List<Map<String, dynamic>> _classes = [
    {'class': 'Grade 10-A', 'room': 'Room 302', 'students': 42, 'teacher': 'Sarah Connor'},
    {'class': 'Grade 10-B', 'room': 'Room 303', 'students': 40, 'teacher': 'Robert Taylor'},
    {'class': 'Grade 11-Science', 'room': 'Lab Block A', 'students': 38, 'teacher': 'Kavita Iyer'},
    {'class': 'Grade 8-B', 'room': 'Room 205', 'students': 35, 'teacher': 'Elena Rostova'},
    {'class': 'Grade 6-A', 'room': 'Room 101', 'students': 30, 'teacher': 'Anita Desai'},
  ];

  final List<Map<String, dynamic>> _subjects = [
    {'name': 'Mathematics', 'code': 'MTH-101', 'grades': 'Grades 6 to 12', 'teachers': 6},
    {'name': 'Physics', 'code': 'PHY-201', 'grades': 'Grades 9 to 12', 'teachers': 4},
    {'name': 'Chemistry', 'code': 'CHM-202', 'grades': 'Grades 9 to 12', 'teachers': 4},
    {'name': 'English Literature', 'code': 'ENG-101', 'grades': 'Grades 1 to 12', 'teachers': 8},
    {'name': 'Computer Science & AI', 'code': 'CSC-301', 'grades': 'Grades 6 to 12', 'teachers': 3},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
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
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/classes'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Academic Classes',
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
                Text('Classroom & Curriculum', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Classes, subject catalog & timetable scheduling', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    tabs: const [
                      Tab(text: 'Classes'),
                      Tab(text: 'Subjects'),
                      Tab(text: 'Timetable'),
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
                _buildClassesTab(),
                _buildSubjectsTab(),
                _buildTimetableTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClassesTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _classes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final c = _classes[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c['class'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  Text('${c['room']} • In-charge: ${c['teacher']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${c['students']} Students',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSubjectsTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _subjects.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final s = _subjects[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text('${s['code']} • ${s['grades']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              Text(
                '${s['teachers']} Faculty',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTimetableTab() {
    final periods = [
      {'time': '08:30 - 09:15', 'period': 'Period 1', 'subject': 'Mathematics', 'room': 'Room 302', 'teacher': 'Robert Taylor'},
      {'time': '09:15 - 10:00', 'period': 'Period 2', 'subject': 'Physics Lab', 'room': 'Science Block', 'teacher': 'Sarah Connor'},
      {'time': '10:15 - 11:00', 'period': 'Period 3', 'subject': 'English Lit', 'room': 'Room 302', 'teacher': 'Elena Rostova'},
      {'time': '11:00 - 11:45', 'period': 'Period 4', 'subject': 'Computer Science', 'room': 'Computer Lab 2', 'teacher': 'Vikram Rathore'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: periods.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final p = periods[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  p['time'] as String,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p['subject'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    Text('${p['period']} • ${p['teacher']} (${p['room']})', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
