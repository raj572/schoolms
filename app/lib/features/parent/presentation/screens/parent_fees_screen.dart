import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/parent_controller.dart';

class ParentFeesScreen extends ConsumerStatefulWidget {
  const ParentFeesScreen({super.key});

  @override
  ConsumerState<ParentFeesScreen> createState() => _ParentFeesScreenState();
}

class _ParentFeesScreenState extends ConsumerState<ParentFeesScreen> {
  int _selectedSegment = 0; // 0: Pending Dues, 1: Receipts History
  final NumberFormat _inrFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  String _formatInr(num amount) {
    return _inrFormatter.format(amount);
  }

  PillVariant _getStatusVariant(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return PillVariant.success;
      case 'overdue':
        return PillVariant.error;
      case 'pending':
      default:
        return PillVariant.warning;
    }
  }

  void _handleDownloadStatement(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Expanded(child: Text('Statement Downloaded: parent_fees_statement.csv saved to your device.')),
          ],
        ),
        backgroundColor: EduPulseColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _handleDownloadReceipt(BuildContext context, Map<String, dynamic> receipt) {
    final receiptNo = receipt['receipt_no'] ?? 'RCPT-2025-001';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.download_done_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text('Receipt $receiptNo downloaded successfully.')),
          ],
        ),
        backgroundColor: EduPulseColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _handleDownloadAllReceipts(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.folder_zip_rounded, color: Colors.white, size: 20),
            SizedBox(width: 8),
            Expanded(child: Text('All Receipts Exported: all_payment_receipts.csv saved to your device.')),
          ],
        ),
        backgroundColor: EduPulseColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _openPayModal(BuildContext context, Map<String, dynamic> fee) {
    String selectedMode = 'Online (Instant UPI)';
    bool isProcessing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final double amount = double.tryParse(fee['amount']?.toString() ?? '0') ?? 0.0;

            return Material(
              color: EduPulseColors.surfaceCard,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              child: Container(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 16,
                  bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 24,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: EduPulseColors.primary.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.credit_card_rounded, color: EduPulseColors.primary, size: 22),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Complete Fee Payment', style: EduPulseTypography.headlineMd()),
                            Text('Confirm fee payment details below', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Fee Summary Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: EduPulseColors.border),
                      ),
                      child: Column(
                        children: [
                          _buildModalRow('Student Name:', fee['student_name'] ?? 'Student'),
                          const SizedBox(height: 8),
                          _buildModalRow('Class:', fee['class'] ?? 'Class'),
                          const SizedBox(height: 8),
                          _buildModalRow('Due Date:', fee['due_date'] ?? '2025-10-15'),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: Divider(height: 1),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Amount:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Text(
                                _formatInr(amount),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: EduPulseColors.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    Text('Select Payment Mode', style: EduPulseTypography.labelSm()),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedMode,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: ['Online (Instant UPI)', 'Net Banking', 'Debit / Credit Card', 'School Cash Voucher']
                          .map((mode) => DropdownMenuItem(value: mode, child: Text(mode, style: const TextStyle(fontSize: 13))))
                          .toList(),
                      onChanged: isProcessing ? null : (val) {
                        if (val != null) setModalState(() => selectedMode = val);
                      },
                    ),
                    const SizedBox(height: 20),

                    // Actions Row
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: isProcessing ? null : () => Navigator.pop(sheetContext),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: EduPulseColors.border),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: isProcessing
                                ? null
                                : () async {
                                    setModalState(() => isProcessing = true);
                                    final feeId = (fee['id'] as num?)?.toInt() ?? 1;
                                    await ref.read(parentFeesNotifierProvider.notifier).payFee(feeId, mode: selectedMode);
                                    if (sheetContext.mounted) {
                                      Navigator.pop(sheetContext);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('Payment of ${_formatInr(amount)} for ${fee['student_name']} processed successfully.'),
                                          backgroundColor: EduPulseColors.success,
                                          behavior: SnackBarBehavior.floating,
                                        ),
                                      );
                                    }
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: EduPulseColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: isProcessing
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Text('Confirm & Pay'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildModalRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: EduPulseColors.textMuted)),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: EduPulseColors.textHeadline)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final feesState = ref.watch(parentFeesNotifierProvider);
    final activeChildIndex = ref.watch(activeChildIndexProvider);

    final children = [
      {'name': 'Rohan Sharma', 'grade': '10th Grade'},
      {'name': 'Riya Sharma', 'grade': '6th Grade'},
      {'name': 'Ankit Verma', 'grade': '8th Grade'},
    ];
    final activeChild = children[activeChildIndex.clamp(0, children.length - 1)];

    final duesList = feesState.dues.isNotEmpty ? feesState.dues : ParentFeesState.defaultDues;
    final receiptsList = feesState.receipts.isNotEmpty ? feesState.receipts : ParentFeesState.defaultReceipts;

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Fees Portal',
        switcherLabel: '${activeChild['name']} • Fees',
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(parentFeesNotifierProvider.notifier).loadFees();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Download Action
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Fees Portal', style: EduPulseTypography.headlineLg()),
                        const SizedBox(height: 2),
                        Text(
                          'View all students\' pending or overdue fees and download receipts.',
                          style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: () => _handleDownloadStatement(context),
                    icon: const Icon(Icons.download_rounded, size: 16),
                    label: const Text('Statement'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: EduPulseColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Summary Stats Row
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFECACA)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Total Due', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF991B1B))),
                              Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFFDC2626)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatInr(feesState.totalDue),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFFDC2626)),
                          ),
                          const SizedBox(height: 2),
                          Text('${duesList.length} pending items', style: const TextStyle(fontSize: 11, color: Color(0xFFB91C1C))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFBBF7D0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text('Total Paid', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF166534))),
                              Icon(Icons.check_circle_outline_rounded, size: 18, color: Color(0xFF16A34A)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatInr(feesState.totalPaid),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF16A34A)),
                          ),
                          const SizedBox(height: 2),
                          Text('${receiptsList.length} settled receipts', style: const TextStyle(fontSize: 11, color: Color(0xFF15803D))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Segmented Tab Selector (Dues vs Payment Receipts)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedSegment = 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedSegment == 0 ? EduPulseColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.pending_actions_rounded,
                                size: 16,
                                color: _selectedSegment == 0 ? Colors.white : EduPulseColors.textMuted,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Pending Dues (${duesList.length})',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: _selectedSegment == 0 ? Colors.white : EduPulseColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedSegment = 1),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _selectedSegment == 1 ? EduPulseColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.receipt_long_rounded,
                                size: 16,
                                color: _selectedSegment == 1 ? Colors.white : EduPulseColors.textMuted,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Receipts History (${receiptsList.length})',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: _selectedSegment == 1 ? Colors.white : EduPulseColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Active Content
              if (_selectedSegment == 0)
                _buildDuesTab(context, duesList)
              else
                _buildReceiptsTab(context, receiptsList),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  // ==================== TAB 0: PENDING DUES ====================
  Widget _buildDuesTab(BuildContext context, List<Map<String, dynamic>> dues) {
    return Container(
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
              children: [
                Row(
                  children: const [
                    Icon(Icons.schedule_rounded, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Pending / Overdue Fees', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                StatusPill(label: '${dues.length} Dues', variant: PillVariant.warning),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: dues.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final fee = dues[i];
              final double amt = double.tryParse(fee['amount']?.toString() ?? '0') ?? 0.0;
              final String status = fee['status'] ?? 'Pending';
              final bool isPaid = status.toLowerCase() == 'paid';

              return Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(fee['student_name'] ?? 'Student', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              const SizedBox(height: 2),
                              Text('${fee['class'] ?? 'Grade'} • Due: ${fee['due_date'] ?? '2025-10-15'}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                            ],
                          ),
                        ),
                        StatusPill(label: status, variant: _getStatusVariant(status)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_formatInr(amt), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: EduPulseColors.textHeadline)),
                        if (!isPaid)
                          ElevatedButton(
                            onPressed: () => _openPayModal(context, fee),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: EduPulseColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Pay Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          )
                        else
                          OutlinedButton(
                            onPressed: null,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('Paid', style: TextStyle(fontSize: 12, color: EduPulseColors.textMuted)),
                          ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // ==================== TAB 1: RECEIPTS ====================
  Widget _buildReceiptsTab(BuildContext context, List<Map<String, dynamic>> receipts) {
    return Container(
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
              children: [
                Row(
                  children: const [
                    Icon(Icons.history_rounded, color: EduPulseColors.primary, size: 20),
                    SizedBox(width: 8),
                    Text('Receipts History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                OutlinedButton.icon(
                  onPressed: () => _handleDownloadAllReceipts(context),
                  icon: const Icon(Icons.download_rounded, size: 14),
                  label: const Text('Download All'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    side: const BorderSide(color: EduPulseColors.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: receipts.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, i) {
              final r = receipts[i];
              final double amt = double.tryParse(r['amount']?.toString() ?? '0') ?? 0.0;

              return Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFBBF7D0)),
                      ),
                      child: const Icon(Icons.receipt_rounded, color: Color(0xFF16A34A), size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(r['receipt_no'] ?? 'RCPT-2025-001', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text('${r['student_name']} • ${r['class']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textHeadline)),
                          const SizedBox(height: 2),
                          Text('Date: ${r['date']} • Mode: ${r['mode']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(_formatInr(amt), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: EduPulseColors.textHeadline)),
                        const SizedBox(height: 6),
                        OutlinedButton.icon(
                          onPressed: () => _handleDownloadReceipt(context, r),
                          icon: const Icon(Icons.download_rounded, size: 14),
                          label: const Text('Receipt'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            side: const BorderSide(color: EduPulseColors.border),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            textStyle: const TextStyle(fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
