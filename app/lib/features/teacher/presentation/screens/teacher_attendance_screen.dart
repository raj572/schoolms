import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherAttendanceScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: mark, 1: records

  const TeacherAttendanceScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<TeacherAttendanceScreen> createState() => _TeacherAttendanceScreenState();
}

class _TeacherAttendanceScreenState extends ConsumerState<TeacherAttendanceScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;
  String _selectedClass = 'Grade 10-A';

  final Map<int, String> _studentStatus = {
    1: 'P',
    2: 'P',
    3: 'T',
    4: 'A',
    5: 'P',
  };

  final List<Map<String, dynamic>> _roster = [
    {'id': 1, 'name': 'Alex Doe', 'roll': '1001'},
    {'id': 2, 'name': 'Sarah Jenkins', 'roll': '1004'},
    {'id': 3, 'name': 'Rohan Sharma', 'roll': '1012'},
    {'id': 4, 'name': 'Kunal Sen', 'roll': '1018'},
    {'id': 5, 'name': 'Priya Patel', 'roll': '1020'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void didUpdateWidget(covariant TeacherAttendanceScreen oldWidget) {
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
      drawer: TeacherNavigationDrawer(currentRoute: _tabController.index == 0 ? '/teacher/attendance' : '/teacher/attendance/records'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Student Attendance',
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
                Text('Class Attendance', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Real-time roll call check-in & historical logs', style: EduPulseTypography.bodySm()),
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
                      Tab(text: 'Mark Attendance'),
                      Tab(text: 'View Records'),
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
                _buildMarkAttendanceTab(),
                _buildViewRecordsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMarkAttendanceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Class Selector Dropdown & Date
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: EduPulseColors.surfaceCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: EduPulseColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.school, size: 18, color: Color(0xFF059669)),
                    const SizedBox(width: 8),
                    DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedClass,
                        items: ['Grade 10-A', 'Grade 11-Science', 'Grade 9-B']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedClass = val);
                        },
                      ),
                    ),
                  ],
                ),
                Text('Today, 22 Oct', style: EduPulseTypography.bodySm()),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Student Roster
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _roster.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (ctx, i) {
              final s = _roster[i];
              final id = s['id'] as int;
              final current = _studentStatus[id] ?? 'P';

              return Container(
                padding: const EdgeInsets.all(12),
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
                        Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        Text('Roll No: ${s['roll']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      ],
                    ),
                    Row(
                      children: [
                        _buildAttendanceBtn('P', current == 'P', EduPulseColors.success, () {
                          setState(() => _studentStatus[id] = 'P');
                        }),
                        const SizedBox(width: 6),
                        _buildAttendanceBtn('T', current == 'T', EduPulseColors.warning, () {
                          setState(() => _studentStatus[id] = 'T');
                        }),
                        const SizedBox(width: 6),
                        _buildAttendanceBtn('A', current == 'A', EduPulseColors.error, () {
                          setState(() => _studentStatus[id] = 'A');
                        }),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 18),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Attendance submitted for $_selectedClass!'),
                    backgroundColor: EduPulseColors.success,
                  ),
                );
              },
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Submit Attendance'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildViewRecordsTab() {
    final records = [
      {'date': '21 Oct 2026', 'class': 'Grade 10-A', 'present': 40, 'total': 42, 'rate': '95.2%'},
      {'date': '20 Oct 2026', 'class': 'Grade 10-A', 'present': 41, 'total': 42, 'rate': '97.6%'},
      {'date': '19 Oct 2026', 'class': 'Grade 10-A', 'present': 39, 'total': 42, 'rate': '92.8%'},
      {'date': '18 Oct 2026', 'class': 'Grade 10-A', 'present': 42, 'total': 42, 'rate': '100%'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: records.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final r = records[i];
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
                  Text(r['date'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text('${r['class']} • ${r['present']} / ${r['total']} present', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              StatusPill(label: r['rate'] as String, variant: PillVariant.success),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAttendanceBtn(String label, bool isSelected, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isSelected ? color : color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}
