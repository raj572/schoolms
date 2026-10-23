import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_constants.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
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

  // Register Form State matching Web
  final _registerFormKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  String? _selectedRole;
  bool _obscurePassword = true;
  bool _isSubmitting = false;

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
    _loadUsers();
  }

  @override
  void didUpdateWidget(covariant PrincipalUsersScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;
    try {
      final res = await ApiClient().get(ApiConstants.getAllUsers(schoolId));
      if (res.data != null && res.data['status'] == true && res.data['data'] != null) {
        final List list = res.data['data'];
        if (list.isNotEmpty && mounted) {
          setState(() {
            _users.clear();
            for (final u in list) {
              _users.add({
                'id': u['id'] ?? 0,
                'name': u['full_name'] ?? u['username'] ?? 'User',
                'email': u['email'] ?? '',
                'role': (u['role'] ?? 'Staff').toString().toUpperCase(),
                'department': u['role'] ?? 'General',
                'status': u['status'] ?? 'active',
                'phone': u['phone'] ?? '+91 00000 00000',
              });
            }
          });
        }
      }
    } catch (_) {
      // Fallback to initialized seed users
    }
  }

  void _resetForm() {
    _registerFormKey.currentState?.reset();
    _usernameController.clear();
    _emailController.clear();
    _passwordController.clear();
    _phoneController.clear();
    setState(() {
      _selectedRole = null;
      _obscurePassword = true;
    });
  }

  Future<void> _handleRegisterUser() async {
    if (!_registerFormKey.currentState!.validate()) return;
    if (_selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a role for the user'),
          backgroundColor: EduPulseColors.error,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final phone = _phoneController.text.trim();
    final role = _selectedRole!;

    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;

    try {
      final response = await ApiClient().post(
        ApiConstants.registerUser(schoolId),
        data: {
          'school_id': schoolId,
          'full_name': username,
          'username': username,
          'email': email,
          'password': password,
          'phone': phone.isNotEmpty ? phone : null,
          'role': role,
        },
      );

      final data = response.data;
      if (data != null && (data['status'] == true || response.statusCode == 200 || response.statusCode == 201)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message'] ?? 'User registered successfully!'),
            backgroundColor: EduPulseColors.success,
          ),
        );

        setState(() {
          _users.insert(0, {
            'id': DateTime.now().millisecondsSinceEpoch,
            'name': username,
            'email': email,
            'role': role[0].toUpperCase() + role.substring(1),
            'department': role[0].toUpperCase() + role.substring(1),
            'status': 'active',
            'phone': phone.isNotEmpty ? phone : '+91 98765 00000',
          });
        });
        _resetForm();
        _tabController.animateTo(0);
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data?['message'] ?? 'Failed to register user'),
            backgroundColor: EduPulseColors.error,
          ),
        );
      }
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data?['message'] ??
          (e.response?.data?['error'] is Map ? (e.response?.data?['error'] as Map).values.first.toString() : null) ??
          e.message ??
          'Failed to register user';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: EduPulseColors.error,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: EduPulseColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
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
      child: Form(
        key: _registerFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top action bar matching web: "User Registration" + "Back to Dashboard"
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('User Registration', style: EduPulseTypography.headlineMd()),
                      const SizedBox(height: 2),
                      Text(
                        'Add a new user to the system',
                        style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                      ),
                    ],
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: () => context.go('/principal'),
                  icon: const Icon(Icons.arrow_back, size: 14),
                  label: const Text('Back to Dashboard', style: TextStyle(fontSize: 11)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    minimumSize: const Size(0, 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Card container: "Information" (matching Image 2)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Information',
                    style: EduPulseTypography.labelLg().copyWith(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // 1. Username
                  Text(
                    'Username',
                    style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _usernameController,
                    decoration: const InputDecoration(
                      hintText: 'principal@school.com',
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Username is required';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // 2. Email
                  Text(
                    'Email',
                    style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'johndoe@gmail.com',
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Email is required';
                      if (!v.contains('@') || !v.contains('.')) return 'Enter a valid email address';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // 3. Password
                  Text(
                    'Password',
                    style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          size: 18,
                          color: EduPulseColors.textMuted,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Password is required';
                      if (v.length < 6) return 'Password must be at least 6 characters long';
                      return null;
                    },
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Password must be at least 6 characters long',
                    style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted).copyWith(fontSize: 11),
                  ),
                  const SizedBox(height: 16),

                  // 4. Role Dropdown
                  Text(
                    'Role',
                    style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: _selectedRole,
                        hint: const Text(
                          'Select Role',
                          style: TextStyle(color: EduPulseColors.textPlaceholder, fontSize: 14),
                        ),
                        icon: const Icon(Icons.keyboard_arrow_down, size: 20, color: EduPulseColors.textMuted),
                        items: const [
                          DropdownMenuItem(value: 'principal', child: Text('Principal')),
                          DropdownMenuItem(value: 'accountant', child: Text('Accountant')),
                          DropdownMenuItem(value: 'librarian', child: Text('Librarian')),
                          DropdownMenuItem(value: 'administrator', child: Text('Administrator')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedRole = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 5. Phone Number
                  Text(
                    'Phone Number',
                    style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      hintText: '9894223678',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Bottom Actions: Cancel & Register User (matching web)
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: _isSubmitting
                      ? null
                      : () {
                          _resetForm();
                          _tabController.animateTo(0);
                        },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    side: const BorderSide(color: EduPulseColors.border),
                  ),
                  child: const Text('Cancel'),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _handleRegisterUser,
                  icon: _isSubmitting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.save_outlined, size: 18),
                  label: Text(_isSubmitting ? 'Registering...' : 'Register User'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
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
