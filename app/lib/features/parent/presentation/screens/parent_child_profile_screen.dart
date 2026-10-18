import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/parent_controller.dart';

class ParentChildProfileScreen extends ConsumerWidget {
  final Map<String, dynamic>? childData;

  const ParentChildProfileScreen({super.key, this.childData});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final studentId = (childData?['id'] as num?)?.toInt() ?? 1;
    final personalAsync = ref.watch(parentPersonalProvider(studentId));

    // Fallback/Default values matching website Personal-info.tsx
    final defaultInfo = {
      'name': childData?['name'] ?? 'Rohan Kumar',
      'gender': 'Male',
      'dob': '15 March 2010',
      'blood_group': 'O+',
      'contact': '+91 9876543210',
      'email': 'rohan.kumar@example.com',
      'address': '123, Green Park, New Delhi',
      'parent_name': 'Mr. Rajesh Kumar',
      'parent_contact': '+91 9876500000',
    };

    final profile = personalAsync.valueOrNull ?? defaultInfo;

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: AppBar(
        backgroundColor: EduPulseColors.surfaceCard,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: EduPulseColors.textHeadline),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Student Profile', style: EduPulseTypography.headlineMd()),
            Text(
              childData?['name'] ?? profile['name'] ?? 'Personal Information',
              style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
            ),
          ],
        ),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: EduPulseColors.border),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Heading
            Text('Personal Information', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 4),
            Text(
              'Detailed identity, guardian information and verified contact records.',
              style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
            ),
            const SizedBox(height: 16),

            // Top Profile Card (Matches website Personal-info.tsx user avatar card)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
                boxShadow: const [
                  BoxShadow(
                    color: Color.fromRGBO(30, 41, 59, 0.04),
                    blurRadius: 10,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: EduPulseColors.primary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: EduPulseColors.primary.withValues(alpha: 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.person, color: Colors.white, size: 36),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          childData?['name'] ?? profile['name'] ?? 'Rohan Kumar',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: EduPulseColors.textHeadline),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${profile['gender'] ?? 'Male'} • ${profile['dob'] ?? '15 March 2010'}',
                          style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Blood: ${profile['blood_group'] ?? 'O+'}',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFDC2626)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            StatusPill(
                              label: childData?['grade'] ?? '8th Grade',
                              variant: PillVariant.info,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Contact & Family Details Card (Matches website Personal-info.tsx Contact Details)
            Container(
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: const [
                        Icon(Icons.contact_mail_outlined, color: EduPulseColors.primary, size: 20),
                        SizedBox(width: 8),
                        Text('Contact & Family Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildInfoRow('Student Contact', profile['contact'] ?? '+91 9876543210', Icons.phone_android_rounded),
                        const SizedBox(height: 14),
                        _buildInfoRow('Email Address', profile['email'] ?? 'rohan.kumar@example.com', Icons.alternate_email_rounded),
                        const SizedBox(height: 14),
                        _buildInfoRow('Residential Address', profile['address'] ?? '123, Green Park, New Delhi', Icons.home_outlined),
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 14),
                          child: Divider(height: 1),
                        ),
                        _buildInfoRow('Parent / Guardian Name', profile['parent_name'] ?? 'Mr. Rajesh Kumar', Icons.people_outline_rounded),
                        const SizedBox(height: 14),
                        _buildInfoRow('Parent Emergency Contact', profile['parent_contact'] ?? '+91 9876500000', Icons.phone_in_talk_rounded),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // School & Enrolment Information Card
            Container(
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Row(
                          children: [
                            Icon(Icons.school_outlined, color: EduPulseColors.primary, size: 20),
                            SizedBox(width: 8),
                            Text('Enrolment & Standing', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ],
                        ),
                        StatusPill(label: 'Enrolled', variant: PillVariant.success),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            _buildStatBox('Roll Number', childData?['roll_no'] ?? '10A-23', EduPulseColors.primary),
                            const SizedBox(width: 12),
                            _buildStatBox('Class / Section', '${childData?['class'] ?? '10th'} - ${childData?['section'] ?? 'A'}', const Color(0xFF059669)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildStatBox('Academic Year', '2025–26', const Color(0xFFD97706)),
                            const SizedBox(width: 12),
                            _buildStatBox('Overall Attendance', '${childData?['attendance'] ?? 92.4}%', const Color(0xFF7C3AED)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: EduPulseColors.primary),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: EduPulseColors.textMuted)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: EduPulseColors.textHeadline)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: EduPulseColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: EduPulseColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
            const SizedBox(height: 2),
            Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }
}
