import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalSettingsScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const PrincipalSettingsScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalSettingsScreen> createState() => _PrincipalSettingsScreenState();
}

class _PrincipalSettingsScreenState extends ConsumerState<PrincipalSettingsScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void didUpdateWidget(covariant PrincipalSettingsScreen oldWidget) {
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

  String _getCurrentRoute() {
    switch (_tabController.index) {
      case 0:
        return '/principal/settings/user-management';
      case 1:
        return '/principal/settings/roles';
      case 2:
        return '/principal/settings/school-info';
      default:
        return '/principal/settings';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: PrincipalNavigationDrawer(currentRoute: _getCurrentRoute()),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'School Settings',
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
                Text('Institutional Settings', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Access control, roles & school profile branding', style: EduPulseTypography.bodySm()),
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
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                    tabs: const [
                      Tab(text: 'User Management'),
                      Tab(text: 'Roles & Access'),
                      Tab(text: 'School Profile'),
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
                _buildUserManagementTab(),
                _buildRolesTab(),
                _buildSchoolProfileTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUserManagementTab() {
    final staff = [
      {'name': 'Sarah Connor', 'role': 'Teacher (Science)', 'email': 'sarah.c@school.edu', 'status': 'active'},
      {'name': 'James Miller', 'role': 'Accountant (Bursar)', 'email': 'james.m@school.edu', 'status': 'active'},
      {'name': 'Anita Desai', 'role': 'Librarian', 'email': 'anita.d@school.edu', 'status': 'active'},
      {'name': 'Vikram Rathore', 'role': 'Warden (Boys Block)', 'email': 'vikram.r@school.edu', 'status': 'active'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: staff.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final u = staff[i];
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
                  Text(u['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(u['role'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                  Text(u['email'] as String, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 18),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Editing user ${u['name']}')),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRolesTab() {
    final roles = [
      {'title': 'Teacher', 'count': '68 Staff', 'perms': 'Attendance, Exam marks entry, Syllabus'},
      {'title': 'Accountant', 'count': '3 Staff', 'perms': 'Fee structure, Dues generation, Receipts'},
      {'title': 'Librarian', 'count': '2 Staff', 'perms': 'Book catalog, Issue/Return records'},
      {'title': 'Warden', 'count': '4 Staff', 'perms': 'Hostel rooms, Mess menu, Night roll call'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: roles.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final r = roles[i];
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(r['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(r['count'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                ],
              ),
              const SizedBox(height: 4),
              Text('Permissions: ${r['perms']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSchoolProfileTab() {
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
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Icon(Icons.school, color: Color(0xFF2563EB), size: 28),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Greenwood International Academy', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      Text('Affiliation No: CBSE-2026-9042', style: TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 10),
            const TextField(decoration: InputDecoration(labelText: 'School Name', hintText: 'Greenwood International Academy')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Official Email', hintText: 'contact@greenwood.edu')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Contact Phone', hintText: '+91 11 2345 6789')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Campus Address', hintText: 'Sector 14, Institutional Area')),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('School profile updated successfully!'), backgroundColor: EduPulseColors.success),
                  );
                },
                icon: const Icon(Icons.save_outlined),
                label: const Text('Save Changes'),
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
