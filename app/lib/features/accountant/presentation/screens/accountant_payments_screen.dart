import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantPaymentsScreen extends ConsumerStatefulWidget {
  const AccountantPaymentsScreen({super.key});

  @override
  ConsumerState<AccountantPaymentsScreen> createState() => _AccountantPaymentsScreenState();
}

class _AccountantPaymentsScreenState extends ConsumerState<AccountantPaymentsScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _modeFilter = 'all'; // all, online, cash, upi, cheque
  String _statusFilter = 'all'; // all, paid, processing, failed
  String _searchQuery = '';

  final List<Map<String, dynamic>> _payments = [
    {
      'id': 'TXN-9021',
      'receipt': 'RCP-8821',
      'student': 'Alex Doe',
      'class': 'Grade 10-A',
      'category': 'Tuition & Lab Fee',
      'amount': 5100,
      'date': '22 Oct 2026, 09:42 AM',
      'mode': 'Razorpay Online',
      'mode_key': 'online',
      'status': 'paid',
    },
    {
      'id': 'TXN-9022',
      'receipt': 'RCP-8822',
      'student': 'Sarah Jenkins',
      'class': 'Grade 8-B',
      'category': 'Term 2 Tuition',
      'amount': 3800,
      'date': '21 Oct 2026, 02:15 PM',
      'mode': 'Counter Cash',
      'mode_key': 'cash',
      'status': 'paid',
    },
    {
      'id': 'TXN-9023',
      'receipt': 'RCP-8823',
      'student': 'Rohan Sharma',
      'class': 'Grade 11-Science',
      'category': 'Bus Transport Zone 1',
      'amount': 1200,
      'date': '21 Oct 2026, 11:30 AM',
      'mode': 'UPI (PhonePe)',
      'mode_key': 'upi',
      'status': 'paid',
    },
    {
      'id': 'TXN-9024',
      'receipt': 'RCP-8824',
      'student': 'Priya Patel',
      'class': 'Grade 6-A',
      'category': 'Annual Admission Fee',
      'amount': 13500,
      'date': '20 Oct 2026, 04:10 PM',
      'mode': 'HDFC Cheque #339102',
      'mode_key': 'cheque',
      'status': 'processing',
    },
    {
      'id': 'TXN-9025',
      'receipt': 'RCP-8825',
      'student': 'Aarav Mehta',
      'class': 'Grade 9-B',
      'category': 'Tuition Fee',
      'amount': 4200,
      'date': '19 Oct 2026, 01:20 PM',
      'mode': 'Razorpay Card',
      'mode_key': 'online',
      'status': 'failed',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _payments.where((p) {
      if (_modeFilter != 'all' && p['mode_key'] != _modeFilter) return false;
      if (_statusFilter != 'all' && p['status'] != _statusFilter) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (p['student'] as String).toLowerCase();
        final rcp = (p['receipt'] as String).toLowerCase();
        final txn = (p['id'] as String).toLowerCase();
        return name.contains(q) || rcp.contains(q) || txn.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/payments'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Payments Ledger',
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
                    Text('Payments Ledger', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Transaction logs, counter & gateway payments', style: EduPulseTypography.bodySm()),
                  ],
                ),
                IconButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Exporting payments CSV...')),
                    );
                  },
                  icon: const Icon(Icons.file_download_outlined, color: Color(0xFF7C3AED)),
                  tooltip: 'Export Ledger',
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 4 Summary Metrics (Matching Payments.tsx)
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.6,
              children: [
                _buildKpiCard('Total Received', '₹1,58,400', Icons.check_circle_outline, EduPulseColors.success),
                _buildKpiCard('In Processing', '₹13,500', Icons.hourglass_top, EduPulseColors.warning),
                _buildKpiCard('Failed / Void', '₹4,200', Icons.error_outline, EduPulseColors.error),
                _buildKpiCard('Average Ticket', '₹4,350', Icons.trending_up, const Color(0xFF7C3AED)),
              ],
            ),
            const SizedBox(height: 16),

            // Search Bar
            TextField(
              decoration: InputDecoration(
                hintText: 'Search by receipt, txn ID, or student...',
                prefixIcon: const Icon(Icons.search, size: 20),
                filled: true,
                fillColor: EduPulseColors.surfaceCard,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: EduPulseColors.border)),
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
            const SizedBox(height: 10),

            // Mode Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildModeChip('All Modes', 'all'),
                  const SizedBox(width: 8),
                  _buildModeChip('Online Gateway', 'online'),
                  const SizedBox(width: 8),
                  _buildModeChip('Cash Counter', 'cash'),
                  const SizedBox(width: 8),
                  _buildModeChip('UPI', 'upi'),
                  const SizedBox(width: 8),
                  _buildModeChip('Cheque', 'cheque'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Payments List
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Transactions (${filtered.length})', style: EduPulseTypography.headlineMd()),
              ],
            ),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final p = filtered[i];
                return _buildTransactionCard(p);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, IconData icon, Color color) {
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
              Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: color)),
        ],
      ),
    );
  }

  Widget _buildModeChip(String label, String value) {
    final isSelected = _modeFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : EduPulseColors.textHeadline, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400)),
      selected: isSelected,
      selectedColor: const Color(0xFF7C3AED),
      backgroundColor: EduPulseColors.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: BorderSide(color: isSelected ? Colors.transparent : EduPulseColors.border)),
      onSelected: (_) => setState(() => _modeFilter = value),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> p) {
    final status = p['status'] as String;
    PillVariant variant;
    if (status == 'paid') {
      variant = PillVariant.success;
    } else if (status == 'processing') {
      variant = PillVariant.warning;
    } else {
      variant = PillVariant.error;
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
                  Text(p['student'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text('${p['class']} • ${p['receipt']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              StatusPill(label: status.toUpperCase(), variant: variant),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['category'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                  Text('${p['mode']} • ${p['date']}', style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                ],
              ),
              Text(
                '₹${p['amount']}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: EduPulseColors.textHeadline),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(height: 1, color: EduPulseColors.borderLight),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Txn: ${p['id']}', style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Downloading receipt ${p['receipt']}...')),
                  );
                },
                icon: const Icon(Icons.receipt, size: 14),
                label: const Text('Receipt', style: TextStyle(fontSize: 11)),
                style: TextButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
