import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalTeachersScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: list, 1: register

  const PrincipalTeachersScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalTeachersScreen> createState() => _PrincipalTeachersScreenState();
}

class _PrincipalTeachersScreenState extends ConsumerState<PrincipalTeachersScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;
  String _searchQuery = '';

  final List<Map<String, dynamic>> _teachers = [
    {
      'id': 'TCH-001',
      'name': 'Sarah Connor',
      'subject': 'Physics & Chemistry',
      'classes': 'Grade 10-A, 11-Science',
      'phone': '+91 98765 43210',
      'status': 'present',
    },
    {
      'id': 'TCH-002',
      'name': 'Robert Taylor',
      'subject': 'Mathematics & Calculus',
      'classes': 'Grade 9-B, 12-Science',
      'phone': '+91 98456 78901',
      'status': 'present',
    },
    {
      'id': 'TCH-003',
      'name': 'Elena Rostova',
      'subject': 'English Literature',
      'classes': 'Grade 6-A, 7-B, 8-A',
      'phone': '+91 97123 45678',
      'status': 'leave',
    },
    {
      'id': 'TCH-004',
      'name': 'Kavita Iyer',
      'subject': 'Biology & Environmental Science',
      'classes': 'Grade 9-A, 10-B',
      'phone': '+91 99001 22334',
      'status': 'present',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _teachers.where((t) {
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (t['name'] as String).toLowerCase();
        final sub = (t['subject'] as String).toLowerCase();
        return name.contains(q) || sub.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/teachers'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Faculty & Teachers',
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
                Text('Faculty Management', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Teaching staff directory & onboarding', style: EduPulseTypography.bodySm()),
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
                      Tab(text: 'Faculty Directory'),
                      Tab(text: 'Add Teacher'),
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
              hintText: 'Search teacher by name or subject...',
              prefixIcon: const Icon(Icons.search, size: 20),
              filled: true,
              fillColor: EduPulseColors.surfaceCard,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
            ),
            onChanged: (v) => setState(() => _searchQuery = v),
          ),
          const SizedBox(height: 14),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final t = filtered[i];
              final isPresent = t['status'] == 'present';
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
                      backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.12),
                      child: Text(
                        (t['name'] as String)[0],
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(t['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          Text(t['subject'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                          Text('Classes: ${t['classes']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                    StatusPill(label: isPresent ? 'ON DUTY' : 'LEAVE', variant: isPresent ? PillVariant.success : PillVariant.warning),
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
            Text('Register Faculty Member', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 14),
            const TextField(decoration: InputDecoration(labelText: 'Teacher Name', hintText: 'e.g. Dr. Arthur Conan')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Primary Subject', hintText: 'e.g. Mathematics & Statistics')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Official Email', hintText: 'arthur.c@school.edu')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Contact Phone', hintText: '+91 98765 22222')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Assigned Classes', hintText: 'e.g. Grade 9, 10, 11')),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Faculty profile created successfully!'), backgroundColor: EduPulseColors.success),
                  );
                },
                icon: const Icon(Icons.school),
                label: const Text('Add Faculty Member'),
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
}
