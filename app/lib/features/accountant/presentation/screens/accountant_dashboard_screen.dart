import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantDashboardScreen extends ConsumerStatefulWidget {
  const AccountantDashboardScreen({super.key});

  @override
  ConsumerState<AccountantDashboardScreen> createState() => _AccountantDashboardScreenState();
}

class _AccountantDashboardScreenState extends ConsumerState<AccountantDashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Accountant Office';

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: '$name (Bursar)',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Financial Hub', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Fee Collections & Billing Pipeline', style: EduPulseTypography.bodySm()),
                  ],
                ),
                OutlinedButton.icon(
                  onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                  icon: const Icon(Icons.menu_open_rounded, size: 18),
                  label: const Text('All Menus', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    minimumSize: const Size(80, 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Revenue Summary Cards
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Collected (Month)', style: EduPulseTypography.bodySm()),
                        const SizedBox(height: 4),
                        Text('₹1,48,500', style: EduPulseTypography.tabularLg(color: EduPulseColors.success)),
                        const SizedBox(height: 4),
                        const StatusPill(label: '84% of Billed', variant: PillVariant.success),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Pending Dues', style: EduPulseTypography.bodySm()),
                        const SizedBox(height: 4),
                        Text('₹28,400', style: EduPulseTypography.tabularLg(color: EduPulseColors.error)),
                        const SizedBox(height: 4),
                        const StatusPill(label: '64 Accounts', variant: PillVariant.error),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Quick Actions: Generate Dues & Collect Offline
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showGenerateDuesDialog(context),
                    icon: const Icon(Icons.bolt_rounded, size: 18),
                    label: const Text('Generate Dues'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF7C3AED),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showLogPaymentDialog(context),
                    icon: const Icon(Icons.point_of_sale_rounded, size: 18),
                    label: const Text('Log Payment'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // All Accountant Panel Modules (Matching Sidebar Menus)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Accountant Modules', style: EduPulseTypography.headlineMd()),
                Text('8 Services', style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted)),
              ],
            ),
            const SizedBox(height: 12),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.45,
              children: [
                _buildModuleCard(
                  title: 'Fees',
                  subtitle: 'Consolidated records',
                  icon: Icons.credit_card_outlined,
                  color: const Color(0xFF2563EB),
                  route: '/accountant/fees',
                ),
                _buildModuleCard(
                  title: 'Fees Structure',
                  subtitle: 'Class fee plans',
                  icon: Icons.receipt_long_outlined,
                  color: const Color(0xFF7C3AED),
                  route: '/accountant/fees-structure',
                ),
                _buildModuleCard(
                  title: 'Monthly Dues',
                  subtitle: 'Invoices & billing',
                  icon: Icons.receipt_outlined,
                  color: const Color(0xFF059669),
                  route: '/accountant/monthly-dues',
                ),
                _buildModuleCard(
                  title: 'Annual Payments',
                  subtitle: 'Admission & reg fees',
                  icon: Icons.account_balance_wallet_outlined,
                  color: const Color(0xFFD97706),
                  route: '/accountant/annual-payments',
                ),
                _buildModuleCard(
                  title: 'Service Charges',
                  subtitle: 'Transport, Mess, Lab',
                  icon: Icons.local_offer_outlined,
                  color: const Color(0xFF0891B2),
                  route: '/accountant/service-charges',
                ),
                _buildModuleCard(
                  title: 'Payments',
                  subtitle: 'Ledger & receipts',
                  icon: Icons.payments_outlined,
                  color: const Color(0xFF8B5CF6),
                  route: '/accountant/payments',
                ),
                _buildModuleCard(
                  title: 'Extra Services',
                  subtitle: 'Student assignments',
                  icon: Icons.extension_outlined,
                  color: const Color(0xFFEC4899),
                  route: '/accountant/extra-services',
                ),
                _buildModuleCard(
                  title: 'Reports',
                  subtitle: 'Analytics & audits',
                  icon: Icons.bar_chart_outlined,
                  color: const Color(0xFF4F46E5),
                  route: '/accountant/reports',
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Active Fee Structures Preview
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Active Fee Structures', style: EduPulseTypography.headlineMd()),
                TextButton(
                  onPressed: () => context.go('/accountant/fees-structure'),
                  child: const Text('View All', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _buildFeeStructureRow('Primary Section (Grades 1-5)', '₹3,500 / mo', '320 Students'),
            const SizedBox(height: 8),
            _buildFeeStructureRow('Middle School (Grades 6-8)', '₹4,200 / mo', '410 Students'),
            const SizedBox(height: 8),
            _buildFeeStructureRow('High School (Grades 9-12)', '₹5,100 / mo', '510 Students'),
            const SizedBox(height: 22),

            // Recent Collections
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Transactions', style: EduPulseTypography.headlineMd()),
                TextButton(
                  onPressed: () => context.go('/accountant/payments'),
                  child: const Text('Ledger', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _buildRecentCollection('Alex Doe (1001)', 'Term 2 Tuition', '₹5,100', 'Online • Razorpay'),
            const SizedBox(height: 8),
            _buildRecentCollection('Sarah Jenkins (1004)', 'Lab Materials', '₹1,500', 'Cash • Receipt #882'),
            const SizedBox(height: 8),
            _buildRecentCollection('Rohan Sharma (1012)', 'Transport Route 4', '₹1,200', 'UPI • PhonePe'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Material(
      color: EduPulseColors.surfaceCard,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: () => context.go(route),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
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
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: color, size: 18),
                  ),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: EduPulseColors.textMuted),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: EduPulseColors.textHeadline),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeeStructureRow(String name, String fee, String count) {
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
              Text(count, style: EduPulseTypography.bodySm()),
            ],
          ),
          Text(fee, style: EduPulseTypography.tabularMd(color: EduPulseColors.primary)),
        ],
      ),
    );
  }

  Widget _buildRecentCollection(String student, String item, String amount, String method) {
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
              Text(student, style: EduPulseTypography.labelMd()),
              Text('$item • $method', style: EduPulseTypography.bodySm()),
            ],
          ),
          Text(amount, style: EduPulseTypography.tabularMd(color: EduPulseColors.success)),
        ],
      ),
    );
  }

  void _showGenerateDuesDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Generate Monthly Dues'),
        content: const Text(
          'This will compute current month fee structures and assign due invoices to all enrolled students across Class 1 to 12.',
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
                  content: Text('Monthly dues generated successfully across all enrolled students!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Confirm & Generate'),
          ),
        ],
      ),
    );
  }

  void _showLogPaymentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Manual Fee Collection'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Student Roll No / ID',
                hintText: 'e.g. 1001 (Alex Doe)',
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Amount Paid (₹)',
                hintText: '4200.00',
              ),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Payment Mode',
                hintText: 'Cash / Cheque / UPI #',
              ),
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
                  content: Text('Collection recorded and instant counter receipt generated!'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Save & Issue Receipt'),
          ),
        ],
      ),
    );
  }
}
