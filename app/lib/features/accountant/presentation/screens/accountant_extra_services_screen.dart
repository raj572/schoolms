import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantExtraServicesScreen extends ConsumerStatefulWidget {
  const AccountantExtraServicesScreen({super.key});

  @override
  ConsumerState<AccountantExtraServicesScreen> createState() => _AccountantExtraServicesScreenState();
}

class _AccountantExtraServicesScreenState extends ConsumerState<AccountantExtraServicesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _serviceFilter = 'all'; // all, transport, hostel, mess, academic
  String _searchQuery = '';

  final List<Map<String, dynamic>> _assignments = [
    {
      'id': 1,
      'student': 'Alex Doe',
      'class': 'Grade 10-A',
      'service': 'Transport Fleet - Zone 2 (North Campus)',
      'service_type': 'transport',
      'amount': 1800,
      'assigned_date': '01 Aug 2026',
      'status': 'active',
    },
    {
      'id': 2,
      'student': 'Sarah Jenkins',
      'class': 'Grade 8-B',
      'service': 'Campus Mess - Full Meal Plan',
      'service_type': 'mess',
      'amount': 3200,
      'assigned_date': '15 Jul 2026',
      'status': 'active',
    },
    {
      'id': 3,
      'student': 'Rohan Sharma',
      'class': 'Grade 11-Science',
      'service': 'Hostel Room B-204 (Double Occupancy)',
      'service_type': 'hostel',
      'amount': 4500,
      'assigned_date': '10 Jul 2026',
      'status': 'active',
    },
    {
      'id': 4,
      'student': 'Priya Patel',
      'class': 'Grade 6-A',
      'service': 'Transport Fleet - Zone 1 (City Center)',
      'service_type': 'transport',
      'amount': 1200,
      'assigned_date': '01 Aug 2026',
      'status': 'active',
    },
    {
      'id': 5,
      'student': 'Aarav Mehta',
      'class': 'Grade 9-B',
      'service': 'Advanced Robotics & AI Lab Access',
      'service_type': 'academic',
      'amount': 1500,
      'assigned_date': '20 Aug 2026',
      'status': 'active',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _assignments.where((a) {
      if (_serviceFilter != 'all' && a['service_type'] != _serviceFilter) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (a['student'] as String).toLowerCase();
        final srv = (a['service'] as String).toLowerCase();
        return name.contains(q) || srv.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/extra-services'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Extra Services',
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
                    Text('Extra Services', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Student subscriptions & facility allocations', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showAssignServiceDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Assign'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEC4899),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Highlights
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEC4899).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFEC4899).withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEC4899),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.extension, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '655 Total Subscriptions',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline),
                        ),
                        Text(
                          'Automatically appended to monthly student invoice generation',
                          style: EduPulseTypography.bodySm(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Search Bar
            TextField(
              decoration: InputDecoration(
                hintText: 'Search by student or service name...',
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

            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildServiceChip('All Services', 'all'),
                  const SizedBox(width: 8),
                  _buildServiceChip('Transport', 'transport'),
                  const SizedBox(width: 8),
                  _buildServiceChip('Hostel', 'hostel'),
                  const SizedBox(width: 8),
                  _buildServiceChip('Mess', 'mess'),
                  const SizedBox(width: 8),
                  _buildServiceChip('Robotics/Lab', 'academic'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Subscriptions List
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Active Allocations (${filtered.length})', style: EduPulseTypography.headlineMd()),
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
                return _buildAllocationCard(item);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceChip(String label, String value) {
    final isSelected = _serviceFilter == value;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : EduPulseColors.textHeadline, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400)),
      selected: isSelected,
      selectedColor: const Color(0xFFEC4899),
      backgroundColor: EduPulseColors.surfaceCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: BorderSide(color: isSelected ? Colors.transparent : EduPulseColors.border)),
      onSelected: (_) => setState(() => _serviceFilter = value),
    );
  }

  Widget _buildAllocationCard(Map<String, dynamic> item) {
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
              const StatusPill(label: 'ACTIVE', variant: PillVariant.success),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item['service'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('Assigned: ${item['assigned_date']}', style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                  ],
                ),
              ),
              Text(
                '₹${item['amount']}/mo',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFFEC4899)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(height: 1, color: EduPulseColors.borderLight),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Service modified for ${item['student']}')),
                  );
                },
                icon: const Icon(Icons.edit_outlined, size: 14),
                label: const Text('Modify', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAssignServiceDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Assign Service to Student'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Student Roll No / Name', hintText: 'e.g. 1001 Alex Doe')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Select Service', hintText: 'Transport / Hostel / Mess')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Effective Month', hintText: 'November 2026')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Service assigned to student!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Assign Service'),
          ),
        ],
      ),
    );
  }
}
