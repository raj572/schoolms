import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class AccountantDashboardScreen extends ConsumerWidget {
  const AccountantDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Accountant Office';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: '$name (Bursar)',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Financial Management Hub', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Fee Collections & Billing Pipeline', style: EduPulseTypography.bodySm()),
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
                        Text('\$148,500', style: EduPulseTypography.tabularLg(color: EduPulseColors.success)),
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
                        Text('\$28,400', style: EduPulseTypography.tabularLg(color: EduPulseColors.error)),
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
                  child: ElevatedButton(
                    onPressed: () {
                      _showGenerateDuesDialog(context);
                    },
                    child: const Text('Generate Dues'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _showLogPaymentDialog(context);
                    },
                    child: const Text('Log Cash/Cheque'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Fee Structures Table Preview
            Text('Active Fee Structures', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            _buildFeeStructureRow('Primary Section (Grades 1-5)', '\$350.00 / mo', '320 Students'),
            const SizedBox(height: 8),
            _buildFeeStructureRow('Middle School (Grades 6-8)', '\$420.00 / mo', '410 Students'),
            const SizedBox(height: 8),
            _buildFeeStructureRow('High School (Grades 9-12)', '\$510.00 / mo', '510 Students'),
            const SizedBox(height: 20),

            // Recent Invoices
            Text('Recent Collections', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),
            _buildRecentCollection('Alex Doe (1001)', 'Term 2 Tuition', '\$510.00', 'Online • Razorpay'),
            const SizedBox(height: 8),
            _buildRecentCollection('Sarah Jenkins (1004)', 'Lab Materials', '\$150.00', 'Cash • Receipt #882'),
            const SizedBox(height: 24),
          ],
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
                  content: Text('Monthly dues generated successfully across all 1,240 enrolled students!'),
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
                labelText: 'Amount Paid (\$)',
                hintText: '420.00',
              ),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Payment Mode',
                hintText: 'Cash / Cheque #',
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
