import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantReportsScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const AccountantReportsScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<AccountantReportsScreen> createState() => _AccountantReportsScreenState();
}

class _AccountantReportsScreenState extends ConsumerState<AccountantReportsScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void didUpdateWidget(covariant AccountantReportsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.animateTo(widget.initialTab);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _getCurrentRoute() {
    if (_tabController.index == 0) return '/accountant/reports/fee';
    if (_tabController.index == 1) return '/accountant/reports/dues-pending';
    return '/accountant/reports/transactions';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: AccountantNavigationDrawer(currentRoute: _getCurrentRoute()),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Financial Reports',
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
                Text('Reports & Analytics', style: EduPulseTypography.headlineLg()),
                const SizedBox(height: 2),
                Text('Auditing, dues analysis & fiscal reports', style: EduPulseTypography.bodySm()),
                const SizedBox(height: 12),

                // 3 Tabs
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    onTap: (_) => setState(() {}),
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF7C3AED),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                    tabs: const [
                      Tab(text: 'Fee Reports'),
                      Tab(text: 'Dues Pending'),
                      Tab(text: 'Transactions'),
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
                _buildFeeReportsTab(),
                _buildDuesPendingTab(),
                _buildTransactionsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 1. Fee Reports Tab
  Widget _buildFeeReportsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: EduPulseColors.surfaceCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: EduPulseColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Collection Efficiency', style: EduPulseTypography.headlineMd()),
                    const StatusPill(label: '84% Collected', variant: PillVariant.success),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: 0.84,
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                  backgroundColor: EduPulseColors.surfaceContainerHigh,
                  valueColor: const AlwaysStoppedAnimation<Color>(EduPulseColors.success),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildStatCol('Total Billed', '₹1,76,900'),
                    _buildStatCol('Collected', '₹1,48,500', color: EduPulseColors.success),
                    _buildStatCol('Outstanding', '₹28,400', color: EduPulseColors.error),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Text('Category Breakdown', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 10),
          _buildCategoryProgressRow('Monthly Tuition Fee', '₹1,12,000 / ₹1,25,000', 0.89),
          const SizedBox(height: 8),
          _buildCategoryProgressRow('Transport Bus Services', '₹22,500 / ₹28,000', 0.80),
          const SizedBox(height: 8),
          _buildCategoryProgressRow('Hostel & Mess Boarding', '₹14,000 / ₹18,900', 0.74),
          const SizedBox(height: 16),

          Text('Payment Mode Shares', style: EduPulseTypography.headlineMd()),
          const SizedBox(height: 10),
          _buildModeShareCard('Online (Razorpay / UPI)', '₹1,02,400', '69% of all collections', Icons.credit_card, const Color(0xFF7C3AED)),
          const SizedBox(height: 8),
          _buildModeShareCard('Cash Counter Receipts', '₹36,100', '24% of all collections', Icons.payments_outlined, const Color(0xFF059669)),
          const SizedBox(height: 8),
          _buildModeShareCard('Cheque / Bank Draft', '₹10,000', '7% of all collections', Icons.account_balance, const Color(0xFFD97706)),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // 2. Dues Pending Tab
  Widget _buildDuesPendingTab() {
    final pendingList = [
      {'student': 'Rohan Sharma', 'class': 'Grade 11-Science', 'amount': 5500, 'days': '14 days overdue', 'phone': '+91 98765 43210'},
      {'student': 'Sarah Jenkins', 'class': 'Grade 8-B', 'amount': 3800, 'days': '12 days overdue', 'phone': '+91 98123 45678'},
      {'student': 'Priya Patel', 'class': 'Grade 6-A', 'amount': 3500, 'days': '8 days overdue', 'phone': '+91 97654 32109'},
      {'student': 'Kunal Sen', 'class': 'Grade 7-C', 'amount': 4100, 'days': '6 days overdue', 'phone': '+91 99887 76655'},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Defaulter Accounts (64)', style: EduPulseTypography.headlineMd()),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Reminders dispatched via SMS & Parent App!'), backgroundColor: EduPulseColors.success),
                  );
                },
                icon: const Icon(Icons.send, size: 14),
                label: const Text('Remind All', style: TextStyle(fontSize: 11)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(80, 30),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: pendingList.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final item = pendingList[i];
              return Container(
                padding: const EdgeInsets.all(14),
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
                        color: EduPulseColors.error.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.warning_amber_rounded, color: EduPulseColors.error, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['student'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          Text('${item['class']} • ${item['days']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.error)),
                          Text('Parent: ${item['phone']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₹${item['amount']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: EduPulseColors.error)),
                        const SizedBox(height: 4),
                        OutlinedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Reminder sent to ${item['student']}!')),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(60, 26),
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                          ),
                          child: const Text('Notify', style: TextStyle(fontSize: 10)),
                        ),
                      ],
                    ),
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

  // 3. Transactions Tab
  Widget _buildTransactionsTab() {
    final txns = [
      {'id': 'TXN-9021', 'student': 'Alex Doe', 'amount': 5100, 'mode': 'Razorpay Online', 'status': 'paid', 'date': '22 Oct 2026'},
      {'id': 'TXN-9022', 'student': 'Sarah Jenkins', 'amount': 3800, 'mode': 'Counter Cash', 'status': 'paid', 'date': '21 Oct 2026'},
      {'id': 'TXN-9023', 'student': 'Rohan Sharma', 'amount': 1200, 'mode': 'UPI (PhonePe)', 'status': 'paid', 'date': '21 Oct 2026'},
      {'id': 'TXN-9024', 'student': 'Priya Patel', 'amount': 13500, 'mode': 'HDFC Cheque', 'status': 'processing', 'date': '20 Oct 2026'},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Audit Ledger (${txns.length})', style: EduPulseTypography.headlineMd()),
              OutlinedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Audit report generated!')),
                  );
                },
                icon: const Icon(Icons.download, size: 14),
                label: const Text('Export', style: TextStyle(fontSize: 11)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(70, 30),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: txns.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final t = txns[i];
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
                        Text(t['student'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        Text('${t['id']} • ${t['mode']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₹${t['amount']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: EduPulseColors.success)),
                        Text(t['date'] as String, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                      ],
                    ),
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

  Widget _buildStatCol(String label, String value, {Color? color}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: color ?? EduPulseColors.textHeadline)),
      ],
    );
  }

  Widget _buildCategoryProgressRow(String label, String ratio, double progress) {
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
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(ratio, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: EduPulseColors.primary)),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
            backgroundColor: EduPulseColors.surfaceContainerHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF7C3AED)),
          ),
        ],
      ),
    );
  }

  Widget _buildModeShareCard(String title, String amount, String share, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                Text(share, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
              ],
            ),
          ),
          Text(amount, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
        ],
      ),
    );
  }
}
