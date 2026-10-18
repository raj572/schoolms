import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class SuperAdminDashboardScreen extends ConsumerWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Provider',
        switcherLabel: 'Super Admin Console',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('SaaS Platform Command', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Multi-Tenant Network & Revenue Analytics', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // 4 Global SaaS Metrics
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.4,
              children: [
                _buildSaaSMetric('Registered Schools', '142', '138 Active Licenses', Icons.domain, EduPulseColors.primary),
                _buildSaaSMetric('Monthly SaaS MRR', '\$384,200', '↗ +12.4% vs last mo', Icons.trending_up, EduPulseColors.success),
                _buildSaaSMetric('Platform Users', '84,520', 'Across all schools', Icons.supervised_user_circle, EduPulseColors.secondary),
                _buildSaaSMetric('Active Plans', '3 Plans', 'Basic, Standard, Premium', Icons.card_membership, EduPulseColors.warning),
              ],
            ),
            const SizedBox(height: 20),

            // Schools Network Directory
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Registered Institutions', style: EduPulseTypography.headlineMd()),
                Text('Manage All (142) >', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
              ],
            ),
            const SizedBox(height: 12),
            _buildSchoolRow('Demo International School', 'DEMO001 • Metropolis', 'Enterprise Plan', true),
            const SizedBox(height: 8),
            _buildSchoolRow('St. Jude Academy', 'SJA102 • California', 'Standard Plan', true),
            const SizedBox(height: 8),
            _buildSchoolRow('Oakridge Public School', 'OPS409 • New York', 'Basic Plan', false),
            const SizedBox(height: 20),

            // Subscription Plan Overview
            Text('SaaS Tier Pricing Plans', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            _buildPlanCard('Basic Plan', '\$499 / mo', 'Up to 500 Students • Standard Modules'),
            const SizedBox(height: 8),
            _buildPlanCard('Standard Plan', '\$899 / mo', 'Up to 1,500 Students • Transport & Hostel Modules'),
            const SizedBox(height: 8),
            _buildPlanCard('Enterprise Plan', '\$1,499 / mo', 'Unlimited Students • Dedicated Server & SLA Support'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSaaSMetric(String label, String value, String sub, IconData icon, Color color) {
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

  Widget _buildSchoolRow(String name, String code, String plan, bool isActive) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: EduPulseTypography.labelMd()),
              Text(code, style: EduPulseTypography.bodySm()),
            ],
          ),
          Row(
            children: [
              StatusPill(label: plan, variant: PillVariant.info),
              const SizedBox(width: 8),
              StatusPill(label: isActive ? 'Active' : 'Suspended', variant: isActive ? PillVariant.success : PillVariant.error),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard(String name, String price, String details) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: EduPulseTypography.labelMd()),
              Text(details, style: EduPulseTypography.bodySm()),
            ],
          ),
          Text(price, style: EduPulseTypography.tabularMd(color: EduPulseColors.primary)),
        ],
      ),
    );
  }
}
