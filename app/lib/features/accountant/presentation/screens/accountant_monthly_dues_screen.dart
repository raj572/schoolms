import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantMonthlyDuesScreen extends ConsumerStatefulWidget {
  const AccountantMonthlyDuesScreen({super.key});

  @override
  ConsumerState<AccountantMonthlyDuesScreen> createState() => _AccountantMonthlyDuesScreenState();
}

class _AccountantMonthlyDuesScreenState extends ConsumerState<AccountantMonthlyDuesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _selectedMonth = 'October 2026';
  String _statusFilter = 'all'; // all, due, paid, pending
  String _searchQuery = '';

  final List<String> _months = [
    'October 2026',
    'November 2026',
    'September 2026',
    'August 2026',
  ];

  final List<Map<String, dynamic>> _dues = [
    {
      'id': 'INV-2026-101',
      'student': 'Alex Doe',
      'roll_no': '1001',
      'class': 'Grade 10-A',
      'amount': 4200,
      'status': 'paid',
      'payment_date': '12 Oct 2026',
      'mode': 'Online • Razorpay',
    },
    {
      'id': 'INV-2026-102',
      'student': 'Sarah Jenkins',
      'roll_no': '1004',
      'class': 'Grade 8-B',
      'amount': 3800,
      'status': 'due',
      'payment_date': null,
      'mode': null,
    },
    {
      'id': 'INV-2026-103',
      'student': 'Rohan Sharma',
      'roll_no': '1012',
      'class': 'Grade 11-Science',
      'amount': 5500,
      'status': 'due',
      'payment_date': null,
      'mode': null,
    },
    {
      'id': 'INV-2026-104',
      'student': 'Priya Patel',
      'roll_no': '1020',
      'class': 'Grade 6-A',
      'amount': 3500,
      'status': 'pending',
      'payment_date': '20 Oct 2026',
      'mode': 'Cheque in clearing',
    },
    {
      'id': 'INV-2026-105',
      'student': 'Aarav Mehta',
      'roll_no': '1035',
      'class': 'Grade 9-B',
      'amount': 4800,
      'status': 'paid',
      'payment_date': '08 Oct 2026',
      'mode': 'Cash Counter',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _dues.where((d) {
      if (_statusFilter != 'all' && d['status'] != _statusFilter) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (d['student'] as String).toLowerCase();
        final roll = (d['roll_no'] as String).toLowerCase();
        return name.contains(q) || roll.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/monthly-dues'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Monthly Dues',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Monthly Dues', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Invoices & monthly collection status', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showGenerateDuesDialog(context),
                  icon: const Icon(Icons.flash_on, size: 16),
                  label: const Text('Generate'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Month Selector Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: EduPulseColors.surfaceCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: EduPulseColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_month, color: Color(0xFF059669), size: 20),
                  const SizedBox(width: 10),
                  const Text('Billing Cycle:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedMonth,
                        items: _months.map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 13)))).toList(),
                        onChanged: (v) {
                          if (v != null) setState(() => _selectedMonth = v);
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Dues Metrics
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard('Billed', '₹1,84,000', const Color(0xFF2563EB)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard('Collected', '₹1,28,000', const Color(0xFF10B981)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard('Pending', '₹56,000', const Color(0xFFDC2626)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search & Filter
            TextField(
              decoration: InputDecoration(
                hintText: 'Search student name or roll number...',
                prefixIcon: const Icon(Icons.search, size: 20),
                filled: true,
                fillColor: EduPulseColors.surfaceCard,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: EduPulseColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: EduPulseColors.border),
                ),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
            const SizedBox(height: 10),

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildStatusChip('All Dues', 'all'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Due Only', 'due'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Paid', 'paid'),
                  const SizedBox(width: 8),
                  _buildStatusChip('In Clearing', 'pending'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Invoices List
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Invoices (${filtered.length})', style: EduPulseTypography.headlineMd()),
              ],
            ),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final item = filtered[i];
                return _buildDueItemCard(item);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color color) {
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
          Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: color)),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, String value) {
    final isSelected = _statusFilter == value;
    return FilterChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? const Color(0xFF059669) : EduPulseColors.textMuted, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
      selected: isSelected,
      selectedColor: const Color(0xFF059669).withValues(alpha: 0.15),
      backgroundColor: Colors.transparent,
      checkmarkColor: const Color(0xFF059669),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: isSelected ? const Color(0xFF059669) : EduPulseColors.border)),
      onSelected: (_) => setState(() => _statusFilter = value),
    );
  }

  Widget _buildDueItemCard(Map<String, dynamic> item) {
    final status = item['status'] as String;
    PillVariant variant;
    if (status == 'paid') {
      variant = PillVariant.success;
    } else if (status == 'due') {
      variant = PillVariant.error;
    } else {
      variant = PillVariant.warning;
    }

    return Container(
      padding: const EdgeInsets.all(14),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['student'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text('${item['class']} • Roll #${item['roll_no']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              StatusPill(label: status.toUpperCase(), variant: variant),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Monthly Tuition: ₹${item['amount']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              if (status == 'due')
                ElevatedButton(
                  onPressed: () => _showRecordPaymentDialog(item),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(70, 30),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                  ),
                  child: const Text('Collect', style: TextStyle(fontSize: 11)),
                )
              else
                Text(
                  item['mode'] ?? 'Paid',
                  style: const TextStyle(fontSize: 11, color: EduPulseColors.success, fontWeight: FontWeight.w500),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _showRecordPaymentDialog(Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Collect Dues - ${item['student']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Amount Due: ₹${item['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(labelText: 'Payment Method', hintText: 'Cash / UPI / Cheque'),
            ),
            const SizedBox(height: 10),
            const TextField(
              decoration: InputDecoration(labelText: 'Receipt Notes', hintText: 'e.g. Paid at counter by Father'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              setState(() {
                item['status'] = 'paid';
                item['mode'] = 'Cash Counter';
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Payment recorded and receipt issued!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Record Payment'),
          ),
        ],
      ),
    );
  }

  void _showGenerateDuesDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Generate Dues for $_selectedMonth'),
        content: const Text('This will calculate all active fee structures and create pending invoice records for all enrolled students.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Monthly dues generated for $_selectedMonth!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Generate Now'),
          ),
        ],
      ),
    );
  }
}
