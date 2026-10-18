import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class PrincipalDashboardScreen extends ConsumerWidget {
  const PrincipalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Dr. Eleanor Vance';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: '$name (Head of School)',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Executive Welcome
            Text('Executive Overview', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Campus Operational Status • Spring Term 2025', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // 4 Executive KPI Cards
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.4,
              children: [
                _buildKpiCard('Total Enrolled', '1,240', 'Students', Icons.groups, EduPulseColors.primary),
                _buildKpiCard('Faculty on Duty', '68 / 72', '94% Present', Icons.badge, EduPulseColors.success),
                _buildKpiCard('Daily Attendance', '96.2%', 'Campus Rate', Icons.fact_check, EduPulseColors.success),
                _buildKpiCard('Fee Collections', '\$148.5K', 'This Month', Icons.payments, EduPulseColors.secondary),
              ],
            ),
            const SizedBox(height: 20),

            // Operations Quick Links
            Text('School Operations', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 12),
            _buildActionTile(Icons.directions_bus, 'Transport Fleet', '12 Buses active • All GPS online', 'View Fleet'),
            const SizedBox(height: 10),
            _buildActionTile(Icons.hotel, 'Hostel & Residential', '88% Occupancy • 2 Buildings', 'Manage'),
            const SizedBox(height: 10),
            _buildActionTile(Icons.local_library, 'Library Services', '1,420 Volumes • 18 Overdue', 'Inspect'),
            const SizedBox(height: 10),
            _buildActionTile(Icons.restaurant_menu, 'Dining & Mess', "Today's Menu: Lunch & Dinner synced", 'Review'),
            const SizedBox(height: 20),

            // Broadcast Announcement CTA
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.primary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.campaign, color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Campus Broadcast', style: EduPulseTypography.labelLg(color: Colors.white)),
                        Text('Dispatch urgent notice or push alert to staff & parents', style: EduPulseTypography.bodySm(color: Colors.white.withValues(alpha: 0.85))),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      _showComposeNoticeDialog(context);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: EduPulseColors.primary),
                    child: const Text('Compose'),
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

  Widget _buildKpiCard(String label, String value, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: EduPulseTypography.bodySm()),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: EduPulseTypography.tabularLg()),
          Text(subtitle, style: EduPulseTypography.labelSm(color: color)),
        ],
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String title, String subtitle, String action) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: EduPulseColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: EduPulseColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: EduPulseTypography.labelMd()),
                Text(subtitle, style: EduPulseTypography.bodySm()),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(60, 30),
              padding: const EdgeInsets.symmetric(horizontal: 10),
            ),
            child: Text(action, style: const TextStyle(fontSize: 11)),
          ),
        ],
      ),
    );
  }

  void _showComposeNoticeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Compose Campus Notice'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Notice Headline',
                hintText: 'e.g. Annual Sports Meet 2026',
                prefixIcon: Icon(Icons.title),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Target Audience',
                hintText: 'All Students, Parents & Faculty',
                prefixIcon: Icon(Icons.people),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Announcement Details',
                hintText: 'Provide complete details and instructions...',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Notice broadcasted to all campus portals and mobile notifications dispatched!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Broadcast Now'),
          ),
        ],
      ),
    );
  }
}
