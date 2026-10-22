import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalStudentsScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: list, 1: register, 2: attendance, 3: services

  const PrincipalStudentsScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalStudentsScreen> createState() => _PrincipalStudentsScreenState();
}

class _PrincipalStudentsScreenState extends ConsumerState<PrincipalStudentsScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;
  String _classFilter = 'all';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _students = [
    {
      'id': 'STD-1001',
      'name': 'Alex Doe',
      'class': 'Grade 10-A',
      'father': 'John Doe',
      'phone': '+91 98765 43210',
      'attendance': '96%',
      'services': ['Transport Zone 2', 'Robotics Lab'],
      'status': 'active',
    },
    {
      'id': 'STD-1004',
      'name': 'Sarah Jenkins',
      'class': 'Grade 8-B',
      'father': 'David Jenkins',
      'phone': '+91 98123 45678',
      'attendance': '92%',
      'services': ['Mess Meal Plan'],
      'status': 'active',
    },
    {
      'id': 'STD-1012',
      'name': 'Rohan Sharma',
      'class': 'Grade 11-Science',
      'father': 'Rajesh Sharma',
      'phone': '+91 97654 32109',
      'attendance': '88%',
      'services': ['Hostel Room B-204'],
      'status': 'active',
    },
    {
      'id': 'STD-1020',
      'name': 'Priya Patel',
      'class': 'Grade 6-A',
      'father': 'Suresh Patel',
      'phone': '+91 99887 76655',
      'attendance': '98%',
      'services': ['Transport Zone 1'],
      'status': 'active',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _students.where((s) {
      if (_classFilter != 'all' && !((s['class'] as String).toLowerCase().contains(_classFilter.toLowerCase()))) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (s['name'] as String).toLowerCase();
        final id = (s['id'] as String).toLowerCase();
        return name.contains(q) || id.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/students'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Students Management',
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
                Text('Student Administration', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Enrollment, attendance analytics & student services', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                    tabs: const [
                      Tab(text: 'Directory'),
                      Tab(text: 'Register Student'),
                      Tab(text: 'Attendance Analytics'),
                      Tab(text: 'Services'),
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
                _buildDirectoryTab(filtered),
                _buildRegisterTab(),
                _buildAnalyticsTab(),
                _buildServicesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDirectoryTab(List<Map<String, dynamic>> filtered) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            decoration: InputDecoration(
              hintText: 'Search student name or roll ID...',
              prefixIcon: const Icon(Icons.search, size: 20),
              filled: true,
              fillColor: EduPulseColors.surfaceCard,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
            ),
            onChanged: (v) => setState(() => _searchQuery = v),
          ),
          const SizedBox(height: 10),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildClassChip('All Classes', 'all'),
                const SizedBox(width: 8),
                _buildClassChip('Grade 10', '10'),
                const SizedBox(width: 8),
                _buildClassChip('Grade 11', '11'),
                const SizedBox(width: 8),
                _buildClassChip('Grade 8', '8'),
                const SizedBox(width: 8),
                _buildClassChip('Grade 6', '6'),
              ],
            ),
          ),
          const SizedBox(height: 14),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final s = filtered[i];
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.12),
                      child: Text(
                        (s['name'] as String)[0],
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              const SizedBox(width: 8),
                              Text('${s['id']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text('${s['class']} • Parent: ${s['father']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                    StatusPill(label: s['attendance'] as String, variant: PillVariant.success),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildRegisterTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: EduPulseColors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: EduPulseColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Enroll New Student', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 14),
            const TextField(decoration: InputDecoration(labelText: 'Student Full Name', hintText: 'e.g. Liam Johnson')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Class & Section', hintText: 'e.g. Grade 10-A')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Father / Guardian Name', hintText: 'e.g. Richard Johnson')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Primary Phone', hintText: '+91 98765 11111')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Residential Address', hintText: '124 Park Avenue')),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Student registered successfully & ID assigned!'), backgroundColor: EduPulseColors.success),
                  );
                },
                icon: const Icon(Icons.person_add),
                label: const Text('Complete Enrollment'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyticsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
                Text('Campus Attendance Health', style: EduPulseTypography.headlineMd()),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Today\'s Presence Rate', style: TextStyle(fontWeight: FontWeight.w600)),
                    Text('96.2%', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: EduPulseColors.success)),
                  ],
                ),
                const SizedBox(height: 10),
                LinearProgressIndicator(
                  value: 0.962,
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                  backgroundColor: EduPulseColors.surfaceContainerHigh,
                  valueColor: const AlwaysStoppedAnimation<Color>(EduPulseColors.success),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildStatCol('Present', '1,193', EduPulseColors.success),
                    _buildStatCol('Absent', '32', EduPulseColors.error),
                    _buildStatCol('On Leave', '15', EduPulseColors.warning),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text('Class-wise Attendance', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 10),
          _buildClassAttendanceRow('Grade 10-A', '98.5%', 0.985),
          const SizedBox(height: 8),
          _buildClassAttendanceRow('Grade 11-Science', '96.2%', 0.962),
          const SizedBox(height: 8),
          _buildClassAttendanceRow('Grade 8-B', '93.8%', 0.938),
          const SizedBox(height: 8),
          _buildClassAttendanceRow('Grade 6-A', '95.0%', 0.950),
        ],
      ),
    );
  }

  Widget _buildServicesTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      itemCount: _students.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final s = _students[i];
        final services = s['services'] as List<String>;
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
              Text(s['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              Text('${s['class']} • ${s['id']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: services.map((srv) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(srv, style: const TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.w600)),
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildClassChip(String label, String value) {
    final isSelected = _classFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : EduPulseColors.textHeadline, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400)),
      selected: isSelected,
      selectedColor: const Color(0xFF2563EB),
      backgroundColor: EduPulseColors.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: BorderSide(color: isSelected ? Colors.transparent : EduPulseColors.border)),
      onSelected: (_) => setState(() => _classFilter = value),
    );
  }

  Widget _buildStatCol(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
        Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: color)),
      ],
    );
  }

  Widget _buildClassAttendanceRow(String title, String pct, double val) {
    return Container(
      padding: const EdgeInsets.all(12),
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
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(pct, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: EduPulseColors.success)),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: val,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: EduPulseColors.surfaceContainerHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(EduPulseColors.success),
          ),
        ],
      ),
    );
  }
}
