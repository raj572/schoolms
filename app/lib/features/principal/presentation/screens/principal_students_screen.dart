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

  // Register Form State matching Web (frontend/src/pages/principal/students/Register.tsx)
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _aadhaarController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  final _addressController = TextEditingController();
  final _rollNoController = TextEditingController();
  final _parentEmailController = TextEditingController();
  final _fatherNameController = TextEditingController();
  final _motherNameController = TextEditingController();

  String? _selectedGender;
  String? _selectedClass;
  bool _isSubmitting = false;
  List<Map<String, dynamic>> _availableClasses = [];

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
    _loadClasses();
    _loadStudents();
  }

  @override
  void didUpdateWidget(covariant PrincipalStudentsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _aadhaarController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    _rollNoController.dispose();
    _parentEmailController.dispose();
    _fatherNameController.dispose();
    _motherNameController.dispose();
    super.dispose();
  }

  Future<void> _loadClasses() async {
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;
    try {
      final res = await ApiClient().get(ApiConstants.getClasses(schoolId));
      if (res.data != null && res.data['status'] == true && res.data['data'] != null) {
        final List list = res.data['data'];
        if (mounted && list.isNotEmpty) {
          setState(() {
            _availableClasses = list.map((c) => Map<String, dynamic>.from(c as Map)).toList();
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _loadStudents() async {
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;
    try {
      final res = await ApiClient().get(ApiConstants.getAllStudents(schoolId));
      if (res.data != null && res.data['status'] == true && res.data['data'] != null) {
        final List list = res.data['data'];
        if (mounted && list.isNotEmpty) {
          setState(() {
            _students.clear();
            for (final s in list) {
              _students.add({
                'id': 'STD-${s['id'] ?? s['roll_no'] ?? '000'}',
                'name': s['candidate_name'] ?? s['name'] ?? 'Student',
                'class': s['class'] is Map ? "${s['class']['class'] ?? ''} ${s['class']['section'] ?? ''}".trim() : (s['class']?.toString() ?? 'Grade 10-A'),
                'father': s['father_name'] ?? 'Guardian',
                'phone': s['phone'] ?? '+91 00000 00000',
                'attendance': '95%',
                'services': ['Standard Plan'],
                'status': s['status'] ?? 'active',
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
    _aadhaarController.clear();
    _emailController.clear();
    _phoneController.clear();
    _dobController.clear();
    _addressController.clear();
    _rollNoController.clear();
    _parentEmailController.clear();
    _fatherNameController.clear();
    _motherNameController.clear();
    setState(() {
      _selectedGender = null;
      _selectedClass = null;
    });
  }

  Future<void> _handleRegisterStudent() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedGender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select gender'), backgroundColor: EduPulseColors.error),
      );
      return;
    }
    if (_selectedClass == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a class'), backgroundColor: EduPulseColors.error),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;

    final payload = {
      'school_id': schoolId,
      'candidate_name': _nameController.text.trim(),
      'addhar': _aadhaarController.text.trim(),
      'email': _emailController.text.trim(),
      'phone': _phoneController.text.trim(),
      'dob': _dobController.text.trim(),
      'gender': _selectedGender,
      'address': _addressController.text.trim(),
      'roll_no': _rollNoController.text.trim(),
      'class': _selectedClass,
      'parent_email': _parentEmailController.text.trim(),
      'father_name': _fatherNameController.text.trim(),
      'mother_name': _motherNameController.text.trim(),
    };

    try {
      final response = await ApiClient().post(
        ApiConstants.registerStudent(schoolId),
        data: payload,
      );

      if (mounted) {
        setState(() => _isSubmitting = false);
        final isSuccess = response.data != null && (response.data['status'] == true || response.statusCode == 200 || response.statusCode == 201);
        if (isSuccess) {
          final msg = response.data?['message'] ?? 'Student registered successfully!';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(msg), backgroundColor: EduPulseColors.success),
          );
          _students.insert(0, {
            'id': 'STD-${_rollNoController.text.trim()}',
            'name': _nameController.text.trim(),
            'class': _selectedClass ?? 'General',
            'father': _fatherNameController.text.trim(),
            'phone': _phoneController.text.trim(),
            'attendance': '100%',
            'services': ['Enrolled'],
            'status': 'active',
          });
          _resetForm();
          _tabController.animateTo(0);
        } else {
          final err = response.data?['message'] ?? 'Failed to register student';
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
    final classOptions = _availableClasses.isNotEmpty
        ? _availableClasses.map((c) {
            final cls = c['class']?.toString() ?? '';
            final sec = c['section']?.toString() ?? '';
            return sec.isNotEmpty ? '$cls ($sec)' : cls;
          }).toList()
        : ['Grade 10-A', 'Grade 10-B', 'Grade 11-Science', 'Grade 11-Commerce', 'Grade 8-B', 'Grade 6-A'];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header matching web
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Student Registration', style: EduPulseTypography.headlineMd()),
                      const SizedBox(height: 2),
                      Text('Add a new student to the system', style: EduPulseTypography.bodySm()),
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
                  hintText: 'John Doe',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Student name is required' : null,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'Aadhaar Number',
                  controller: _aadhaarController,
                  hintText: '1234 5678 9012',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: 'Email *',
                  controller: _emailController,
                  hintText: 'johndoe@gmail.com',
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => (v == null || !v.contains('@')) ? 'Valid email is required' : null,
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
                          initialDate: DateTime(2010, 1, 1),
                          firstDate: DateTime(1990),
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
                const SizedBox(height: 14),
                // Address Field
                _buildFormField(
                  label: 'Address',
                  controller: _addressController,
                  hintText: 'A-district, South City, India',
                  maxLines: 3,
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 2: Academic Information
            _buildFormCard(
              title: 'Academic Information',
              children: [
                _buildFormField(
                  label: 'Roll Number *',
                  controller: _rollNoController,
                  hintText: 'e.g. 101',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Roll number is required' : null,
                ),
                const SizedBox(height: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Class *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: EduPulseColors.textHeadline)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedClass,
                      decoration: InputDecoration(
                        hintText: 'Select class',
                        hintStyle: const TextStyle(color: EduPulseColors.textMuted, fontSize: 13),
                        filled: true,
                        fillColor: EduPulseColors.surfaceCard,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: EduPulseColors.border)),
                      ),
                      items: classOptions.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                      onChanged: (v) => setState(() => _selectedClass = v),
                      validator: (v) => (v == null) ? 'Class is required' : null,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Card 3: Parent/Guardian Information
            _buildFormCard(
              title: "Parent/Guardian Information",
              children: [
                _buildFormField(
                  label: 'Parent Email',
                  controller: _parentEmailController,
                  hintText: 'parent@gmail.com',
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: "Father's Name *",
                  controller: _fatherNameController,
                  hintText: 'Jim Carrey',
                  validator: (v) => (v == null || v.trim().isEmpty) ? "Father's name is required" : null,
                ),
                const SizedBox(height: 14),
                _buildFormField(
                  label: "Mother's Name *",
                  controller: _motherNameController,
                  hintText: 'Angelina Joe',
                  validator: (v) => (v == null || v.trim().isEmpty) ? "Mother's name is required" : null,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Submit and Cancel Action Row
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
                  onPressed: _isSubmitting ? null : _handleRegisterStudent,
                  icon: _isSubmitting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.save, size: 16),
                  label: Text(_isSubmitting ? 'Registering...' : 'Register Student', style: const TextStyle(fontWeight: FontWeight.w600)),
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
