import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalUsersScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: list, 1: register

  const PrincipalUsersScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalUsersScreen> createState() => _PrincipalUsersScreenState();
}

class _PrincipalUsersScreenState extends ConsumerState<PrincipalUsersScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;
  String _roleFilter = 'all';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _users = [
    {
      'id': 1,
      'name': 'Sarah Connor',
      'email': 'sarah.c@school.edu',
      'role': 'Teacher',
      'department': 'Science',
      'status': 'active',
      'phone': '+91 98765 43210',
    },
    {
      'id': 2,
      'name': 'James Miller',
      'email': 'james.m@school.edu',
      'role': 'Accountant',
      'department': 'Finance',
      'status': 'active',
      'phone': '+91 98123 45678',
    },
    {
      'id': 3,
      'name': 'Anita Desai',
      'email': 'anita.d@school.edu',
      'role': 'Librarian',
      'department': 'Library Services',
      'status': 'active',
      'phone': '+91 97654 32109',
    },
    {
      'id': 4,
      'name': 'Vikram Rathore',
      'email': 'vikram.r@school.edu',
      'role': 'Warden',
      'department': 'Hostel & Residential',
      'status': 'active',
      'phone': '+91 99887 76655',
    },
    {
      'id': 5,
      'name': 'Robert Taylor',
      'email': 'robert.t@school.edu',
      'role': 'Teacher',
      'department': 'Mathematics',
      'status': 'inactive',
      'phone': '+91 98456 78901',
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
    final filtered = _users.where((u) {
      if (_roleFilter != 'all' && (u['role'] as String).toLowerCase() != _roleFilter.toLowerCase()) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (u['name'] as String).toLowerCase();
        final email = (u['email'] as String).toLowerCase();
        return name.contains(q) || email.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/users'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'User Management',
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
                Text('User Administration', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Staff accounts, credentials & role access', style: EduPulseTypography.bodySm()),
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
                      Tab(text: 'User Directory'),
                      Tab(text: 'Register New User'),
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
              hintText: 'Search staff by name or email...',
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
                _buildRoleFilterChip('All Staff', 'all'),
                const SizedBox(width: 8),
                _buildRoleFilterChip('Teachers', 'teacher'),
                const SizedBox(width: 8),
                _buildRoleFilterChip('Accountants', 'accountant'),
                const SizedBox(width: 8),
                _buildRoleFilterChip('Librarians', 'librarian'),
                const SizedBox(width: 8),
                _buildRoleFilterChip('Wardens', 'warden'),
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
              final user = filtered[i];
              final isActive = user['status'] == 'active';
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
                        (user['name'] as String)[0],
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
                              Text(user['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: EduPulseColors.surfaceContainerHigh,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(user['role'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF2563EB))),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text('${user['email']} • ${user['department']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                    Switch(
                      value: isActive,
                      activeThumbColor: EduPulseColors.success,
                      onChanged: (val) {
                        setState(() {
                          user['status'] = val ? 'active' : 'inactive';
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${user['name']} status updated to ${val ? "active" : "inactive"}'),
                            backgroundColor: val ? EduPulseColors.success : EduPulseColors.error,
                          ),
                        );
                      },
                    ),
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
            Text('Register New Campus Staff', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 14),
            const TextField(decoration: InputDecoration(labelText: 'Full Name', hintText: 'e.g. Robert Langdon')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Email Address', hintText: 'robert.l@school.edu')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Phone Number', hintText: '+91 98765 00000')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Assigned Role', hintText: 'Teacher / Accountant / Librarian / Warden')),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Department / Faculty', hintText: 'e.g. Humanities & Languages')),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Staff credentials generated & invitation emailed!'), backgroundColor: EduPulseColors.success),
                  );
                },
                icon: const Icon(Icons.person_add),
                label: const Text('Create User Account'),
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

  Widget _buildRoleFilterChip(String label, String value) {
    final isSelected = _roleFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : EduPulseColors.textHeadline, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400)),
      selected: isSelected,
      selectedColor: const Color(0xFF2563EB),
      backgroundColor: EduPulseColors.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: BorderSide(color: isSelected ? Colors.transparent : EduPulseColors.border)),
      onSelected: (_) => setState(() => _roleFilter = value),
    );
  }
}
