import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../controllers/student_controller.dart';
import '../widgets/student_navigation_drawer.dart';

class StudentProfileScreen extends ConsumerStatefulWidget {
  const StudentProfileScreen({super.key});

  @override
  ConsumerState<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends ConsumerState<StudentProfileScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final profileAsync = ref.watch(studentProfileProvider);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const StudentNavigationDrawer(currentRoute: '/student/profile'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Profile',
        switcherLabel: 'Student Record & Settings',
        showBackButton: true,
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentProfileProvider);
        },
        child: profileAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: EduPulseColors.primary),
          ),
          error: (err, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: EduPulseColors.error),
                  const SizedBox(height: 12),
                  Text('Failed to load profile', style: EduPulseTypography.headlineMd()),
                  const SizedBox(height: 6),
                  Text('$err', style: EduPulseTypography.bodySm(), textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.refresh(studentProfileProvider),
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            ),
          ),
          data: (profile) {
            final name = profile?['candidate_name'] ?? user?.fullName ?? 'Alex Doe';
            final email = profile?['email'] ?? user?.email ?? 'student@school.com';
            final className = profile?['class'] ?? '10';
            final section = profile?['section'] ?? 'A';
            final rollNo = profile?['roll_no']?.toString() ?? '14';
            final phone = profile?['phone'] ?? '+1 (555) 019-2834';
            final address = profile?['address'] ?? '42 Elm Street, Springfield';
            final fatherName = profile?['father_name'] ?? 'Robert Doe';
            final motherName = profile?['mother_name'] ?? 'Sarah Doe';
            final dob = profile?['dob'] ?? '2008-05-14';
            final gender = profile?['gender'] ?? 'Male';
            final admissionDate = profile?['admission_date'] ?? '2022-08-15';
            final nationalId = profile?['addhar'] ?? '•••• •••• 8821';

            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Hero Bento Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF003EA8), Color(0xFF0053DB), Color(0xFF2563EB)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: const [
                        BoxShadow(
                          color: Color.fromRGBO(0, 74, 198, 0.25),
                          blurRadius: 16,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white70, width: 3),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 8,
                                    offset: Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'S',
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: EduPulseColors.primaryDeep,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          name,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981),
                                          borderRadius: BorderRadius.circular(9999),
                                        ),
                                        child: const Text(
                                          'ACTIVE',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    email,
                                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Class $className-$section • Roll No. $rollNo',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Academic Details Section
                  _buildSectionCard(
                    title: 'Academic Profile',
                    icon: Icons.school_outlined,
                    children: [
                      _buildInfoRow('Class & Section', 'Class $className-$section'),
                      _buildInfoRow('Roll Number', rollNo),
                      _buildInfoRow('Admission Date', admissionDate),
                      _buildInfoRow('Enrollment Status', 'Regular / Full-time'),
                      _buildInfoRow('Academic Year', '2025–2026'),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Personal Details Section
                  _buildSectionCard(
                    title: 'Personal Information',
                    icon: Icons.person_outline,
                    children: [
                      _buildInfoRow('Date of Birth', dob),
                      _buildInfoRow('Gender', gender),
                      _buildInfoRow('Blood Group', 'O+ (Positive)'),
                      _buildInfoRow('National ID / Aadhaar', nationalId),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Contact & Guardian Section
                  _buildSectionCard(
                    title: 'Guardian & Contact Details',
                    icon: Icons.family_restroom_outlined,
                    children: [
                      _buildInfoRow('Father\'s Name', fatherName),
                      _buildInfoRow('Mother\'s Name', motherName),
                      _buildInfoRow('Primary Phone', phone),
                      _buildInfoRow('Home Address', address),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Security & Password Change
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
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
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: EduPulseColors.surfaceContainerHigh,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.lock_reset, color: EduPulseColors.primary, size: 20),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Security & Credentials', style: EduPulseTypography.labelLg()),
                                  Text('Manage password and account protection', style: EduPulseTypography.bodySm()),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _showChangePasswordDialog(context, ref, user?.studentId ?? user?.id ?? 1),
                            icon: const Icon(Icons.key, size: 18),
                            label: const Text('Change Password'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: EduPulseColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
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
              Icon(icon, color: EduPulseColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(title, style: EduPulseTypography.labelLg()),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 6),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: EduPulseTypography.labelMd(color: EduPulseColors.textHeadline),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context, WidgetRef ref, int studentId) {
    final currentPasswordCtrl = TextEditingController();
    final newPasswordCtrl = TextEditingController();
    final confirmPasswordCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogContext, setState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              const Icon(Icons.lock_clock, color: EduPulseColors.primary),
              const SizedBox(width: 8),
              Text('Update Password', style: EduPulseTypography.headlineMd()),
            ],
          ),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: currentPasswordCtrl,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Current Password',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.password, size: 18),
                    ),
                    validator: (v) => (v == null || v.isEmpty) ? 'Please enter current password' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: newPasswordCtrl,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'New Password',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.key, size: 18),
                    ),
                    validator: (v) {
                      if (v == null || v.length < 6) return 'Must be at least 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: confirmPasswordCtrl,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      prefixIcon: const Icon(Icons.check_circle_outline, size: 18),
                    ),
                    validator: (v) {
                      if (v != newPasswordCtrl.text) return 'Passwords do not match';
                      return null;
                    },
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (formKey.currentState?.validate() != true) return;
                      setState(() => isSubmitting = true);
                      final repo = ref.read(studentRepositoryProvider);
                      final result = await repo.updatePassword(
                        studentId: studentId,
                        currentPassword: currentPasswordCtrl.text,
                        newPassword: newPasswordCtrl.text,
                        confirmPassword: confirmPasswordCtrl.text,
                      );
                      setState(() => isSubmitting = false);
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(result['message'] ?? 'Password update complete'),
                            backgroundColor: result['status'] == true ? EduPulseColors.success : EduPulseColors.error,
                          ),
                        );
                      }
                    },
              style: ElevatedButton.styleFrom(backgroundColor: EduPulseColors.primary),
              child: isSubmitting
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Update Password'),
            ),
          ],
        ),
      ),
    );
  }
}
