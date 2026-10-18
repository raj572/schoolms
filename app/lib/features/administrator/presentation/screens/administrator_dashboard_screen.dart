import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class AdministratorDashboardScreen extends ConsumerWidget {
  const AdministratorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'School Administrator';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Administrator',
        switcherLabel: '$name (Campus Owner)',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Campus Administration', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('SaaS License, Billing & Leadership Oversight', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // Subscription Plan Status Hero Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: EduPulseColors.secondary,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      StatusPill(label: 'ENTERPRISE PLAN', variant: PillVariant.info),
                      StatusPill(label: 'Active License', variant: PillVariant.success),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text('Demo International School', style: EduPulseTypography.headlineMd(color: Colors.white)),
                  const SizedBox(height: 2),
                  Text('School Code: DEMO001 • Valid until Oct 2027', style: EduPulseTypography.bodySm(color: Colors.white.withValues(alpha: 0.85))),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '1,240 / 2,000 Student Capacity Used',
                          style: EduPulseTypography.bodySm(color: Colors.white.withValues(alpha: 0.85)),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Opening Razorpay SaaS Subscription Renewal...')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: EduPulseColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                        ),
                        child: const Text('Upgrade / Renew', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 4 Campus Metrics
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.4,
              children: [
                _buildMetricCard('Total Users', '1,428', 'Faculty, Staff & Pupils', Icons.people_outline, EduPulseColors.primary),
                _buildMetricCard('Active Principals', '1 Assigned', 'Dr. Eleanor Vance', Icons.military_tech_outlined, EduPulseColors.success),
                _buildMetricCard('Monthly Revenue', '\$148,500', 'Term 2 Fee Collections', Icons.account_balance, EduPulseColors.secondary),
                _buildMetricCard('System Health', '100% Uptime', 'All Services Online', Icons.cloud_done_outlined, EduPulseColors.success),
              ],
            ),
            const SizedBox(height: 20),

            // Leadership Oversight
            Text('School Leadership', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            Container(
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
                    backgroundColor: EduPulseColors.primaryContainer,
                    child: const Text('EV', style: TextStyle(fontWeight: FontWeight.bold, color: EduPulseColors.primary)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Dr. Eleanor Vance', style: EduPulseTypography.labelMd()),
                        Text('Principal & Head of School • principal@school.com', style: EduPulseTypography.bodySm()),
                      ],
                    ),
                  ),
                  const StatusPill(label: 'Assigned', variant: PillVariant.success),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, String sub, IconData icon, Color color) {
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
              Icon(icon, size: 18, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: EduPulseTypography.tabularLg()),
          Text(sub, style: EduPulseTypography.labelSm(color: color)),
        ],
      ),
    );
  }
}
