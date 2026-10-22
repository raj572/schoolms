import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantAnnualPaymentsScreen extends ConsumerStatefulWidget {
  const AccountantAnnualPaymentsScreen({super.key});

  @override
  ConsumerState<AccountantAnnualPaymentsScreen> createState() => _AccountantAnnualPaymentsScreenState();
}

class _AccountantAnnualPaymentsScreenState extends ConsumerState<AccountantAnnualPaymentsScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _statusFilter = 'all'; // all, paid, due
  String _searchQuery = '';

  final List<Map<String, dynamic>> _annualRecords = [
    {
      'id': 'ANN-001',
      'student': 'Alex Doe',
      'class': 'Grade 10-A',
      'admission_fee': 15000,
      'registration_fee': 3000,
      'other_fee': 2000,
      'total': 20000,
      'status': 'paid',
      'date': '15 Jul 2026',
      'mode': 'Online • Net Banking',
    },
    {
      'id': 'ANN-002',
      'student': 'Sarah Jenkins',
      'class': 'Grade 8-B',
      'admission_fee': 12000,
      'registration_fee': 2500,
      'other_fee': 1500,
      'total': 16000,
      'status': 'paid',
      'date': '20 Jul 2026',
      'mode': 'Cheque #449102',
    },
    {
      'id': 'ANN-003',
      'student': 'Rohan Sharma',
      'class': 'Grade 11-Science',
      'admission_fee': 18000,
      'registration_fee': 3500,
      'other_fee': 2500,
      'total': 24000,
      'status': 'due',
      'date': null,
      'mode': null,
    },
    {
      'id': 'ANN-004',
      'student': 'Priya Patel',
      'class': 'Grade 6-A',
      'admission_fee': 10000,
      'registration_fee': 2500,
      'other_fee': 1000,
      'total': 13500,
      'status': 'due',
      'date': null,
      'mode': null,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _annualRecords.where((r) {
      if (_statusFilter != 'all' && r['status'] != _statusFilter) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (r['student'] as String).toLowerCase();
        final cls = (r['class'] as String).toLowerCase();
        return name.contains(q) || cls.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/annual-payments'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Annual Payments',
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
                    Text('Annual Payments', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Admission, registration & one-time annual fees', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showRecordAnnualDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Record'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD97706),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Summary Stats
            Row(
              children: [
                Expanded(
                  child: _buildStatCard('Total Billed', '₹73,500', const Color(0xFF2563EB)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard('Collected', '₹36,000', const Color(0xFF10B981)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard('Pending', '₹37,500', const Color(0xFFDC2626)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search & Filter
            TextField(
              decoration: InputDecoration(
                hintText: 'Search by student name or class...',
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

            Row(
              children: [
                _buildFilterChip('All Status', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('Paid', 'paid'),
                const SizedBox(width: 8),
                _buildFilterChip('Due', 'due'),
              ],
            ),
            const SizedBox(height: 16),

            // Records List
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Records (${filtered.length})', style: EduPulseTypography.headlineMd()),
              ],
            ),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final item = filtered[i];
                return _buildAnnualCard(item);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
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

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _statusFilter == value;
    return FilterChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? const Color(0xFFD97706) : EduPulseColors.textMuted, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
      selected: isSelected,
      selectedColor: const Color(0xFFD97706).withValues(alpha: 0.15),
      backgroundColor: Colors.transparent,
      checkmarkColor: const Color(0xFFD97706),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: isSelected ? const Color(0xFFD97706) : EduPulseColors.border)),
      onSelected: (_) => setState(() => _statusFilter = value),
    );
  }

  Widget _buildAnnualCard(Map<String, dynamic> item) {
    final isPaid = item['status'] == 'paid';

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
                  Text(item['class'] as String, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              StatusPill(label: isPaid ? 'PAID' : 'DUE', variant: isPaid ? PillVariant.success : PillVariant.error),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Admission: ₹${item['admission_fee']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textBody)),
              Text('Reg: ₹${item['registration_fee']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textBody)),
              Text('Other: ₹${item['other_fee']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textBody)),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(height: 1, color: EduPulseColors.borderLight),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isPaid ? '${item['mode']} • ${item['date']}' : 'Outstanding Due',
                style: TextStyle(fontSize: 11, color: isPaid ? EduPulseColors.textMuted : EduPulseColors.error),
              ),
              Text(
                'Total: ₹${item['total']}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: EduPulseColors.textHeadline),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showRecordAnnualDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Record Annual Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Student Roll No / Name', hintText: 'e.g. Rohan Sharma')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Admission Fee (₹)', hintText: '18000'), keyboardType: TextInputType.number),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Payment Mode', hintText: 'Online / Cash / Cheque')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Annual fee recorded successfully!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Save Record'),
          ),
        ],
      ),
    );
  }
}
