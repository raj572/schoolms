import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantFeesScreen extends ConsumerStatefulWidget {
  const AccountantFeesScreen({super.key});

  @override
  ConsumerState<AccountantFeesScreen> createState() => _AccountantFeesScreenState();
}

class _AccountantFeesScreenState extends ConsumerState<AccountantFeesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _selectedTab = 'all'; // all, monthly, annual, service
  String _searchQuery = '';
  String _statusFilter = 'all'; // all, paid, pending, due

  final List<Map<String, dynamic>> _dummyFees = [
    {
      'id': 'FEE-101',
      'student': 'Alex Doe',
      'class': 'Grade 10-A',
      'type': 'monthly',
      'title': 'October Tuition Fee',
      'amount': 4200,
      'dueDate': '10 Nov 2026',
      'status': 'paid',
      'mode': 'Razorpay Online',
    },
    {
      'id': 'FEE-102',
      'student': 'Sarah Jenkins',
      'class': 'Grade 8-B',
      'type': 'monthly',
      'title': 'October Tuition Fee',
      'amount': 3800,
      'dueDate': '10 Nov 2026',
      'status': 'due',
      'mode': 'Pending',
    },
    {
      'id': 'FEE-103',
      'student': 'Rohan Sharma',
      'class': 'Grade 11-Science',
      'type': 'annual',
      'title': 'Admission & Registration Fee',
      'amount': 15000,
      'dueDate': '15 Oct 2026',
      'status': 'paid',
      'mode': 'Cash Counter',
    },
    {
      'id': 'FEE-104',
      'student': 'Priya Patel',
      'class': 'Grade 6-A',
      'type': 'service',
      'title': 'Transport Service - Route 4',
      'amount': 1200,
      'dueDate': '05 Nov 2026',
      'status': 'pending',
      'mode': 'Processing',
    },
    {
      'id': 'FEE-105',
      'student': 'Aarav Mehta',
      'class': 'Grade 9-B',
      'type': 'service',
      'title': 'Mess & Dining Plan',
      'amount': 2800,
      'dueDate': '05 Nov 2026',
      'status': 'due',
      'mode': 'Pending',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _dummyFees.where((f) {
      if (_selectedTab != 'all' && f['type'] != _selectedTab) return false;
      if (_statusFilter != 'all' && f['status'] != _statusFilter) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (f['student'] as String).toLowerCase();
        final title = (f['title'] as String).toLowerCase();
        return name.contains(q) || title.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/fees'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Fees Central',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Text('Fees Management', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Comprehensive student fee records & collection', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // KPI Overview
            Row(
              children: [
                Expanded(
                  child: _buildKpiCard('Total Billed', '₹2,10,000', Icons.receipt_long, const Color(0xFF2563EB)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildKpiCard('Collected', '₹1,54,000', Icons.check_circle, const Color(0xFF10B981)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildKpiCard('Pending', '₹56,000', Icons.pending, const Color(0xFFDC2626)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search Bar
            TextField(
              decoration: InputDecoration(
                hintText: 'Search by student name or fee title...',
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
            const SizedBox(height: 12),

            // Segmented Category Tabs
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All Fees', 'all', _selectedTab, (v) => setState(() => _selectedTab = v)),
                  const SizedBox(width: 8),
                  _buildFilterChip('Monthly', 'monthly', _selectedTab, (v) => setState(() => _selectedTab = v)),
                  const SizedBox(width: 8),
                  _buildFilterChip('Annual', 'annual', _selectedTab, (v) => setState(() => _selectedTab = v)),
                  const SizedBox(width: 8),
                  _buildFilterChip('Service Charges', 'service', _selectedTab, (v) => setState(() => _selectedTab = v)),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Status Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildStatusChip('All Status', 'all'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Paid', 'paid'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Due', 'due'),
                  const SizedBox(width: 8),
                  _buildStatusChip('Pending', 'pending'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // List of Fee Records
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Records (${filtered.length})', style: EduPulseTypography.headlineMd()),
              ],
            ),
            const SizedBox(height: 10),

            if (filtered.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.inbox_outlined, size: 40, color: EduPulseColors.textMuted),
                      const SizedBox(height: 8),
                      Text('No fee records found', style: EduPulseTypography.bodySm()),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (ctx, i) {
                  final item = filtered[i];
                  return _buildFeeCard(item);
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
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline)),
          Text(label, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, String current, Function(String) onSelect) {
    final isSelected = current == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 12, color: isSelected ? Colors.white : EduPulseColors.textHeadline, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400)),
      selected: isSelected,
      selectedColor: const Color(0xFF7C3AED),
      backgroundColor: EduPulseColors.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? Colors.transparent : EduPulseColors.border)),
      onSelected: (_) => onSelect(value),
    );
  }

  Widget _buildStatusChip(String label, String value) {
    final isSelected = _statusFilter == value;
    return FilterChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? const Color(0xFF7C3AED) : EduPulseColors.textMuted, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
      selected: isSelected,
      selectedColor: const Color(0xFF7C3AED).withValues(alpha: 0.15),
      backgroundColor: Colors.transparent,
      checkmarkColor: const Color(0xFF7C3AED),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: isSelected ? const Color(0xFF7C3AED) : EduPulseColors.border)),
      onSelected: (_) => setState(() => _statusFilter = value),
    );
  }

  Widget _buildFeeCard(Map<String, dynamic> item) {
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['student'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: EduPulseColors.textHeadline),
                    ),
                    Text(
                      '${item['class']} • ${item['id']}',
                      style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted),
                    ),
                  ],
                ),
              ),
              StatusPill(label: status.toUpperCase(), variant: variant),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: EduPulseColors.borderLight),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['title'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                  Text('Due: ${item['dueDate']} • ${item['mode']}', style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                ],
              ),
              Text(
                '₹${item['amount']}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: EduPulseColors.textHeadline),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
