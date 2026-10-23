import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_constants.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
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

  // Register Form State matching Web (frontend/src/pages/principal/teachers/Register.tsx)
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _qualificationController = TextEditingController();

  String? _selectedGender;
  bool _isSubmitting = false;

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
    _loadTeachers();
  }

  @override
  void didUpdateWidget(covariant PrincipalTeachersScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _qualificationController.dispose();
    super.dispose();
  }

  Future<void> _loadTeachers() async {
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;
    try {
      final res = await ApiClient().get(ApiConstants.getAllTeachers(schoolId));
      if (res.data != null && res.data['status'] == true && res.data['data'] != null) {
        final List list = res.data['data'];
        if (mounted && list.isNotEmpty) {
          setState(() {
            _teachers.clear();
            for (final t in list) {
              _teachers.add({
                'id': 'TCH-${t['id'] ?? t['employee_code'] ?? '001'}',
                'name': t['name'] ?? 'Teacher',
                'subject': t['qualification'] ?? 'General Education',
                'classes': t['employee_code'] != null ? 'Code: ${t['employee_code']}' : 'Assigned Classes',
                'phone': t['phone'] ?? '+91 00000 00000',
                'status': t['status'] ?? 'present',
              });
            }
          });
        }
      }
    } catch (_) {}
  }

  void _resetForm() {
    _formKey.currentState?.reset();
    _nameController.clear();
    _emailController.clear();
    _phoneController.clear();
    _dobController.clear();
    _addressController.clear();
    _cityController.clear();
    _stateController.clear();
    _qualificationController.clear();
    setState(() {
      _selectedGender = null;
    });
  }

  Future<void> _handleRegisterTeacher() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select gender'), backgroundColor: EduPulseColors.error),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;

    final payload = {
      'school_id': schoolId,
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'phone': _phoneController.text.trim(),
      'dob': _dobController.text.trim(),
      'gender': _selectedGender,
      'address': _addressController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      'qualification': _qualificationController.text.trim(),
    };

    try {
      final response = await ApiClient().post(
        ApiConstants.registerTeacher(schoolId),
        data: payload,
      );

      if (mounted) {
        setState(() => _isSubmitting = false);
        final isSuccess = response.data != null && (response.data['status'] == true || response.statusCode == 200 || response.statusCode == 201);
        if (isSuccess) {
          final msg = response.data?['message'] ?? 'Teacher registered successfully!';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(msg), backgroundColor: EduPulseColors.success),
          );
          _teachers.insert(0, {
            'id': 'TCH-NEW',
            'name': _nameController.text.trim(),
            'subject': _qualificationController.text.trim(),
            'classes': 'Newly Appointed',
            'phone': _phoneController.text.trim(),
            'status': 'present',
          });
          _resetForm();
          _tabController.animateTo(0);
        } else {
          final err = response.data?['message'] ?? 'Failed to register teacher';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(err), backgroundColor: EduPulseColors.error),
          );
        }
      }
    } on DioException catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        final errMsg = e.response?.data?['message'] ?? e.message ?? 'Registration failed';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $errMsg'), backgroundColor: EduPulseColors.error),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Unexpected error: $e'), backgroundColor: EduPulseColors.error),
        );
      }
    }
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
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header matching web
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Teacher Registration', style: EduPulseTypography.headlineMd()),
                      const SizedBox(height: 2),
                      Text('Add a new teacher to the system', style: EduPulseTypography.bodySm()),
                    ],
                  ),
                ),
                OutlinedButton(
                  onPressed: () => context.go('/principal/dashboard'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: EduPulseColors.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  child: const Text('Back to Dashboard', style: TextStyle(fontSize: 12, color: EduPulseColors.textHeadline)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 1: Personal Information
            _buildFormCard(
              title: 'Personal Information',
              children: [
                _buildFormField(
                  label: 'Name *',
                  controller: _nameController,
                  hintText: 'Dr. Arthur Conan',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'Email',
                  controller: _emailController,
                  hintText: 'teacher@school.edu',
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'Phone Number',
                  controller: _phoneController,
                  hintText: '9876543210',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 14),
                // Date of Birth Field
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Date of Birth *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: EduPulseColors.textHeadline)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _dobController,
                      readOnly: true,
                      decoration: InputDecoration(
                        hintText: 'YYYY-MM-DD',
                        hintStyle: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13),
                        suffixIcon: const Icon(Icons.calendar_today, size: 18, color: EduPulseColors.textMuted),
                        filled: true,
                        fillColor: EduPulseColors.surfaceCard,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                      ),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Date of birth is required' : null,
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime(1990, 1, 1),
                          firstDate: DateTime(1950),
                          lastDate: DateTime.now(),
                        );
                        if (picked != null) {
                          final formatted = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
                          _dobController.text = formatted;
                        }
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // Gender Dropdown
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Gender *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: EduPulseColors.textHeadline)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedGender,
                      decoration: InputDecoration(
                        hintText: 'Select gender',
                        hintStyle: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13),
                        filled: true,
                        fillColor: EduPulseColors.surfaceCard,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Male', child: Text('Male')),
                        DropdownMenuItem(value: 'Female', child: Text('Female')),
                        DropdownMenuItem(value: 'Other', child: Text('Other')),
                      ],
                      onChanged: (v) => setState(() => _selectedGender = v),
                      validator: (v) => (v == null) ? 'Gender is required' : null,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 2: Address Information
            _buildFormCard(
              title: 'Address Information',
              children: [
                _buildFormField(
                  label: 'Address *',
                  controller: _addressController,
                  hintText: '123 School Lane',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Address is required' : null,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'State *',
                  controller: _stateController,
                  hintText: 'California',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'State is required' : null,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'City *',
                  controller: _cityController,
                  hintText: 'San Francisco',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'City is required' : null,
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 3: Teacher Education
            _buildFormCard(
              title: 'Teacher Education',
              children: [
                _buildFormField(
                  label: 'Qualification *',
                  controller: _qualificationController,
                  hintText: 'M.Sc., B.Ed.',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Qualification is required' : null,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Action Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () {
                    _resetForm();
                    _tabController.animateTo(0);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: EduPulseColors.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  ),
                  child: const Text('Cancel', style: TextStyle(fontWeight: FontWeight.w600, color: EduPulseColors.textHeadline)),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _handleRegisterTeacher,
                  icon: _isSubmitting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.save, size: 16),
                  label: Text(_isSubmitting ? 'Registering...' : 'Register Teacher', style: const TextStyle(fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildFormCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: EduPulseColors.textHeadline)),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    required String hintText,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: EduPulseColors.textHeadline)),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          validator: validator,
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13),
            filled: true,
            fillColor: EduPulseColors.surfaceCard,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
          ),
        ),
      ],
    );
  }
}
