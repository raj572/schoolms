import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/accountant_navigation_drawer.dart';

class AccountantServiceChargesScreen extends ConsumerStatefulWidget {
  const AccountantServiceChargesScreen({super.key});

  @override
  ConsumerState<AccountantServiceChargesScreen> createState() => _AccountantServiceChargesScreenState();
}

class _AccountantServiceChargesScreenState extends ConsumerState<AccountantServiceChargesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _services = [
    {
      'id': 1,
      'name': 'Transport Fleet - Zone 1 (0-5 km)',
      'type': 'transport',
      'cycle': 'Monthly',
      'amount': 1200,
      'subscribers': 180,
      'status': 'active',
      'icon': Icons.directions_bus,
    },
    {
      'id': 2,
      'name': 'Transport Fleet - Zone 2 (5-15 km)',
      'type': 'transport',
      'cycle': 'Monthly',
      'amount': 1800,
      'subscribers': 140,
      'status': 'active',
      'icon': Icons.directions_bus,
    },
    {
      'id': 3,
      'name': 'Hostel & Residential Boarding',
      'type': 'hostel',
      'cycle': 'Monthly',
      'amount': 4500,
      'subscribers': 85,
      'status': 'active',
      'icon': Icons.hotel,
    },
    {
      'id': 4,
      'name': 'Campus Mess & Nutritional Plan',
      'type': 'mess',
      'cycle': 'Monthly',
      'amount': 3200,
      'subscribers': 110,
      'status': 'active',
      'icon': Icons.restaurant,
    },
    {
      'id': 5,
      'name': 'Advanced Robotics & AI Lab Fee',
      'type': 'academic',
      'cycle': 'Per Term',
      'amount': 1500,
      'subscribers': 240,
      'status': 'active',
      'icon': Icons.biotech,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const AccountantNavigationDrawer(currentRoute: '/accountant/service-charges'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Accountant',
        switcherLabel: 'Service Charges',
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
                    Text('Service Charges', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Add-on institutional service fee catalog', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showAddServiceDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add Service'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0891B2),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Top Highlights
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0891B2).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF0891B2).withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0891B2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.local_offer, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '5 Active Ancillary Services',
                          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: EduPulseColors.textHeadline),
                        ),
                        Text(
                          'Combined recurring monthly revenue of ₹9,40,000 across all routes & residential facilities',
                          style: EduPulseTypography.bodySm(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Services List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _services.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final s = _services[i];
                return _buildServiceCard(s);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceCard(Map<String, dynamic> s) {
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
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0891B2).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(s['icon'] as IconData, color: const Color(0xFF0891B2), size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s['name'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: EduPulseColors.textHeadline),
                ),
                const SizedBox(height: 2),
                Text(
                  '${s['cycle']} • ${s['subscribers']} Enrolled',
                  style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${s['amount']}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0891B2)),
              ),
              Text(s['cycle'] as String, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddServiceDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Service Charge'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Service Name', hintText: 'e.g. Swimming Coaching Fee')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Billing Cycle', hintText: 'Monthly / Quarterly / Annual')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Amount (₹)', hintText: '1500'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('New service charge created successfully!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Create Service'),
          ),
        ],
      ),
    );
  }
}
