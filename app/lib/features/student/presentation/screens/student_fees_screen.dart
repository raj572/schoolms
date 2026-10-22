import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/student_controller.dart';
import '../widgets/student_navigation_drawer.dart';

class StudentFeesScreen extends ConsumerStatefulWidget {
  final int initialTab;

  const StudentFeesScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<StudentFeesScreen> createState() => _StudentFeesScreenState();
}

class _StudentFeesScreenState extends ConsumerState<StudentFeesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late int _selectedTab;

  @override
  void initState() {
    super.initState();
    _selectedTab = widget.initialTab;
  }

  String _formatInr(num amount) {
    final formatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    return formatter.format(amount);
  }

  @override
  Widget build(BuildContext context) {
    final feesState = ref.watch(studentFeesNotifierProvider);
    final feesNotifier = ref.read(studentFeesNotifierProvider.notifier);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const StudentNavigationDrawer(currentRoute: '/student/fees'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Fees',
        switcherLabel: 'Fee & Billing Portal',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await feesNotifier.loadFees();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Segmented Tabs: Dues vs Payments History
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(9999),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 9),
                          decoration: BoxDecoration(
                            color: _selectedTab == 0 ? EduPulseColors.surfaceCard : Colors.transparent,
                            borderRadius: BorderRadius.circular(9999),
                            boxShadow: _selectedTab == 0
                                ? const [
                                    BoxShadow(
                                      color: Color.fromRGBO(0, 0, 0, 0.06),
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Dues',
                                style: EduPulseTypography.labelMd(
                                  color: _selectedTab == 0 ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                                ),
                              ),
                              if (feesState.dues.isNotEmpty) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: EduPulseColors.error,
                                    borderRadius: BorderRadius.circular(9999),
                                  ),
                                  child: Text(
                                    '${feesState.dues.length}',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedTab = 1),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 9),
                          decoration: BoxDecoration(
                            color: _selectedTab == 1 ? EduPulseColors.surfaceCard : Colors.transparent,
                            borderRadius: BorderRadius.circular(9999),
                            boxShadow: _selectedTab == 1
                                ? const [
                                    BoxShadow(
                                      color: Color.fromRGBO(0, 0, 0, 0.06),
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Text(
                            'Payments History',
                            textAlign: TextAlign.center,
                            style: EduPulseTypography.labelMd(
                              color: _selectedTab == 1 ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),

              // Page Title & Subtitle (matching website headers)
              Text(
                _selectedTab == 0 ? 'Fees Due' : 'Payment History',
                style: EduPulseTypography.headlineLg(),
              ),
              const SizedBox(height: 2),
              Text(
                _selectedTab == 0
                    ? 'Check pending fees and pay online'
                    : 'All successful fee transactions',
                style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
              ),
              const SizedBox(height: 16),

              // Main Card matching website layout
              if (_selectedTab == 0)
                _buildDuesCard(context, feesState, feesNotifier)
              else
                _buildHistoryCard(context, feesState),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== DUES CARD ====================
  Widget _buildDuesCard(
    BuildContext context,
    StudentFeesState feesState,
    StudentFeesNotifier feesNotifier,
  ) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(30, 41, 59, 0.05),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Student Info Header (Wallet icon, Name, Roll No, Class)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: EduPulseColors.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.account_balance_wallet_outlined,
                      color: EduPulseColors.primary,
                      size: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        feesState.studentName,
                        style: EduPulseTypography.headlineMd(),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Roll No: ${feesState.rollNo} • Class: ${feesState.className}',
                        style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Items Table / List
          if (feesState.dues.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    const Icon(Icons.check_circle_outline, size: 48, color: EduPulseColors.success),
                    const SizedBox(height: 12),
                    Text('No Fees Due', style: EduPulseTypography.headlineMd()),
                    const SizedBox(height: 4),
                    Text(
                      'All term fees and charges are completely settled.',
                      style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            // Table Header Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: EduPulseColors.surfaceContainerLow,
              child: Row(
                children: [
                  Expanded(
                    flex: 4,
                    child: Text(
                      'Fee Head',
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Amount',
                      textAlign: TextAlign.right,
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Due Date',
                      textAlign: TextAlign.right,
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Status',
                      textAlign: TextAlign.right,
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Item Rows
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: feesState.dues.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final fee = feesState.dues[index];
                final String head = fee['head']?.toString() ?? 'Fee Head';
                final double amount = double.tryParse(fee['amount']?.toString() ?? '0') ?? 0.0;
                final String dueDate = fee['due_date']?.toString() ?? '2025-10-15';
                final String status = fee['status']?.toString() ?? 'Pending';

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 4,
                        child: Text(
                          head,
                          style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          _formatInr(amount),
                          textAlign: TextAlign.right,
                          style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          dueDate,
                          textAlign: TextAlign.right,
                          style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: StatusPill(
                            label: status,
                            variant: status.toLowerCase() == 'paid'
                                ? PillVariant.success
                                : PillVariant.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],

          const Divider(height: 1),

          // Card Footer: Total Due + Pay Now & Download Statement Buttons
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.currency_rupee,
                          size: 20,
                          color: EduPulseColors.primary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Total Due: ${_formatInr(feesState.totalDue)}',
                          style: EduPulseTypography.headlineMd(),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Action Buttons Row
                Row(
                  children: [
                    if (feesState.dues.isNotEmpty)
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _showPaymentDialog(
                            context,
                            feesNotifier,
                            feesState.totalDue,
                            feesState.dues,
                          ),
                          icon: const Icon(Icons.credit_card, size: 18),
                          label: const Text('Pay Now'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: EduPulseColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    if (feesState.dues.isNotEmpty) const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _handleDownloadStatement(context, feesState),
                        icon: const Icon(Icons.download, size: 18),
                        label: const Text('Download Statement'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: EduPulseColors.textHeadline,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: EduPulseColors.border),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==================== PAYMENT HISTORY CARD ====================
  Widget _buildHistoryCard(BuildContext context, StudentFeesState feesState) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(30, 41, 59, 0.05),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Student Info Header (ReceiptText icon, Name, Roll No, Class)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: EduPulseColors.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.receipt_long_outlined,
                      color: EduPulseColors.primary,
                      size: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        feesState.studentName,
                        style: EduPulseTypography.headlineMd(),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Roll No: ${feesState.historyRollNo} • Class: ${feesState.className}',
                        style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Transactions Table / List
          if (feesState.history.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    const Icon(Icons.receipt_long_outlined, size: 48, color: EduPulseColors.textMuted),
                    const SizedBox(height: 12),
                    Text('No Transactions Yet', style: EduPulseTypography.headlineMd()),
                    const SizedBox(height: 4),
                    Text(
                      'Payment receipts will appear here once cleared.',
                      style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            // Table Header Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: EduPulseColors.surfaceContainerLow,
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Date',
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Fee Head',
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Amount',
                      textAlign: TextAlign.right,
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                  Expanded(
                    flex: 3,
                    child: Text(
                      'Action',
                      textAlign: TextAlign.right,
                      style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Payment Rows
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: feesState.history.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final item = feesState.history[index];
                final String date = item['date']?.toString() ?? '2025-07-10';
                final String head = item['head']?.toString() ?? 'Fee Head';
                final String txnId = item['transaction_id']?.toString() ?? 'TXN000';
                final double amount = double.tryParse(item['amount']?.toString() ?? '0') ?? 0.0;
                final String status = item['status']?.toString() ?? 'Paid';

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(date, style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                            Text(txnId, style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: EduPulseColors.textMuted)),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(head, style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline)),
                            const SizedBox(height: 2),
                            StatusPill(
                              label: status,
                              variant: PillVariant.success,
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          _formatInr(amount),
                          textAlign: TextAlign.right,
                          style: EduPulseTypography.labelSm(color: EduPulseColors.textHeadline),
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: OutlinedButton.icon(
                            onPressed: () => _showReceiptModal(context, item, feesState),
                            icon: const Icon(Icons.download, size: 14),
                            label: const Text('Receipt', style: TextStyle(fontSize: 11)),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: const Size(0, 32),
                              side: const BorderSide(color: EduPulseColors.border),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],

          const Divider(height: 1),

          // Card Footer: Total Paid Amount
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Icon(
                  Icons.verified,
                  size: 20,
                  color: EduPulseColors.success,
                ),
                const SizedBox(width: 8),
                Text(
                  'Total Paid Amount: ${_formatInr(feesState.totalPaid)}',
                  style: EduPulseTypography.headlineMd(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==================== FEE PAYMENT DIALOG ====================
  void _showPaymentDialog(
    BuildContext context,
    StudentFeesNotifier notifier,
    double totalDue,
    List<Map<String, dynamic>> dues,
  ) {
    String selectedMethod = 'Instant UPI / QR';
    bool isProcessing = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: [
                  const Icon(Icons.account_balance_wallet, color: EduPulseColors.primary),
                  const SizedBox(width: 8),
                  Text('Fee Payment', style: EduPulseTypography.headlineMd()),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Amount Due: ${_formatInr(totalDue)}',
                    style: EduPulseTypography.labelMd(color: EduPulseColors.primary),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Select payment method to complete your fee payment securely.',
                    style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                  ),
                  const SizedBox(height: 14),

                  ...[
                    'Instant UPI / QR (PhonePe, GPay, Paytm)',
                    'Net Banking (All Major Indian Banks)',
                    'Debit / Credit Card (Visa, RuPay, MasterCard)'
                  ].map((method) {
                    final isSel = selectedMethod == method;
                    return GestureDetector(
                      onTap: () => setModalState(() => selectedMethod = method),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: isSel ? EduPulseColors.primaryContainer : EduPulseColors.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSel ? EduPulseColors.primary : EduPulseColors.border,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                method,
                                style: EduPulseTypography.labelSm(
                                  color: isSel ? EduPulseColors.primaryDeep : EduPulseColors.textHeadline,
                                ),
                              ),
                            ),
                            if (isSel)
                              const Icon(Icons.check_circle, size: 16, color: EduPulseColors.primary),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isProcessing ? null : () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: isProcessing
                      ? null
                      : () async {
                          setModalState(() => isProcessing = true);
                          await Future.delayed(const Duration(milliseconds: 700));
                          await notifier.payAllDues(mode: selectedMethod);
                          if (context.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Payment initiated successfully!'),
                                backgroundColor: EduPulseColors.success,
                              ),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EduPulseColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  child: Text(isProcessing ? 'Processing...' : 'Proceed to Online Gateway'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // ==================== DOWNLOAD STATEMENT ====================
  void _handleDownloadStatement(BuildContext context, StudentFeesState feesState) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.description_outlined, color: EduPulseColors.primary),
                      const SizedBox(width: 8),
                      Text('Fee Statement Preview', style: EduPulseTypography.headlineMd()),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Student: ${feesState.studentName} • Roll: ${feesState.rollNo} • Class: ${feesState.className}',
                style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
              ),
              const SizedBox(height: 14),
              const Divider(height: 1),
              const SizedBox(height: 10),
              ...feesState.dues.map((f) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(f['head'] ?? '', style: EduPulseTypography.labelSm()),
                        Text(
                          _formatInr((f['amount'] as num).toDouble()),
                          style: EduPulseTypography.labelSm(),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 10),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total Due:', style: EduPulseTypography.headlineMd()),
                  Text(
                    _formatInr(feesState.totalDue),
                    style: EduPulseTypography.headlineMd(color: EduPulseColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Fee statement fee_statement_${feesState.rollNo}.csv downloaded successfully'),
                        backgroundColor: EduPulseColors.success,
                      ),
                    );
                  },
                  icon: const Icon(Icons.download),
                  label: const Text('Export Statement CSV'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: EduPulseColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ==================== OFFICIAL RECEIPT MODAL ====================
  void _showReceiptModal(
    BuildContext context,
    Map<String, dynamic> item,
    StudentFeesState feesState,
  ) {
    final String txnId = item['transaction_id']?.toString() ?? 'TXN000';
    final String date = item['date']?.toString() ?? '2025-07-10';
    final String head = item['head']?.toString() ?? 'Fee Head';
    final double amount = double.tryParse(item['amount']?.toString() ?? '0') ?? 0.0;
    final String status = item['status']?.toString() ?? 'Paid';

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: const [
              Icon(Icons.verified, color: EduPulseColors.success),
              SizedBox(width: 8),
              Text('Official Fee Receipt'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Transaction ID: $txnId', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
              const SizedBox(height: 6),
              Text('Date: $date', style: EduPulseTypography.bodySm()),
              Text('Student: ${feesState.studentName} (Roll No: ${feesState.historyRollNo})', style: EduPulseTypography.bodySm()),
              Text('Class: ${feesState.className}', style: EduPulseTypography.bodySm()),
              Text('Fee Head: $head', style: EduPulseTypography.bodySm()),
              Text('Amount Settled: ${_formatInr(amount)}', style: EduPulseTypography.labelMd(color: EduPulseColors.success)),
              Text('Status: $status', style: EduPulseTypography.bodySm()),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Verified by Campus Accounts Office • Digitally Authenticated',
                  style: TextStyle(color: Color(0xFF047857), fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Receipt $txnId downloaded successfully'),
                    backgroundColor: EduPulseColors.success,
                  ),
                );
              },
              icon: const Icon(Icons.download, size: 16),
              label: const Text('Download Receipt'),
              style: ElevatedButton.styleFrom(backgroundColor: EduPulseColors.primary),
            ),
          ],
        );
      },
    );
  }
}
