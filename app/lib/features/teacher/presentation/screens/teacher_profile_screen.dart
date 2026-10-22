import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherProfileScreen extends ConsumerWidget {
  const TeacherProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
    final user = ref.watch(authProvider).user;
    final teacherName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Dr. Aris Thorne';
    final email = user?.email.isNotEmpty == true ? user!.email : 'aris.thorne@learnaz.edu';

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/my-profile'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'My Profile',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: const Color(0xFF059669).withValues(alpha: 0.15),
                    child: Text(
                      teacherName[0].toUpperCase(),
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(teacherName, style: EduPulseTypography.headlineMd()),
                        const SizedBox(height: 2),
                        const Text('Senior Physics & STEM Faculty', style: TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text(email, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Teaching Assignment Details
            Text('Academic Assignment', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            _buildInfoCard('Department', 'Science & Technology'),
            const SizedBox(height: 8),
            _buildInfoCard('Primary Subjects', 'Advanced Physics, AP Chemistry'),
            const SizedBox(height: 8),
            _buildInfoCard('Classes Assigned', 'Grade 10-A, Grade 11-Science, Grade 12-B'),
            const SizedBox(height: 8),
            _buildInfoCard('Designated Classroom', 'Room 304 (Science Wing, North Campus)'),
            const SizedBox(height: 8),
            _buildInfoCard('Employee ID / Code', 'FAC-2024-9042'),
            const SizedBox(height: 16),

            // Duty Status & Working Hours
            Text('Schedule & Office Hours', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Campus Timing:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      Text('08:00 AM – 03:30 PM', style: TextStyle(fontSize: 12, color: EduPulseColors.textHeadline)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Weekly Teaching Hours:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      Text('24 Periods / Week', style: TextStyle(fontSize: 12, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Parent Counseling Slot:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      Text('Fridays 02:00 – 03:00 PM', style: TextStyle(fontSize: 12, color: EduPulseColors.textHeadline)),
                    ],
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

  Widget _buildInfoCard(String label, String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: EduPulseColors.textHeadline)),
        ],
      ),
    );
  }
}
