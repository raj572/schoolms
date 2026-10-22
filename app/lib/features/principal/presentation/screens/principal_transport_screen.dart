import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalTransportScreen extends ConsumerWidget {
  const PrincipalTransportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> buses = [
      {'bus_no': 'Bus 01 (DL-01-AB-1234)', 'route': 'North Suburbs & Green Park', 'driver': 'Manoj Kumar', 'phone': '+91 98765 11223', 'status': 'on_route', 'students': 38},
      {'bus_no': 'Bus 02 (DL-01-AB-5678)', 'route': 'City Center & Ring Road', 'driver': 'Baljeet Singh', 'phone': '+91 98123 22334', 'status': 'on_route', 'students': 42},
      {'bus_no': 'Bus 03 (DL-01-AB-9012)', 'route': 'Airport Road & Civil Lines', 'driver': 'Suresh Yadav', 'phone': '+91 97654 33445', 'status': 'on_route', 'students': 35},
      {'bus_no': 'Bus 04 (DL-01-AB-3456)', 'route': 'East Enclave & Metro Station', 'driver': 'Ramesh Verma', 'phone': '+91 99887 44556', 'status': 'depot', 'students': 40},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/transport'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Transport Operations',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
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
                    Text('Fleet & Bus Routes', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Vehicle tracking & route allocations', style: EduPulseTypography.bodySm()),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: EduPulseColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('GPS Live', style: TextStyle(color: EduPulseColors.success, fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(child: _buildStat('12 Vehicles', 'Total Fleet', Icons.directions_bus, const Color(0xFF2563EB))),
                const SizedBox(width: 10),
                Expanded(child: _buildStat('420 Students', 'Commuting', Icons.people, const Color(0xFF10B981))),
                const SizedBox(width: 10),
                Expanded(child: _buildStat('10 Active', 'On Route', Icons.navigation, const Color(0xFFD97706))),
              ],
            ),
            const SizedBox(height: 16),

            Text('Active Bus Routes', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: buses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final b = buses[i];
                final isOnRoute = b['status'] == 'on_route';
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
                          Text(b['bus_no'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          StatusPill(label: isOnRoute ? 'ON ROUTE' : 'AT DEPOT', variant: isOnRoute ? PillVariant.success : PillVariant.info),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('Route: ${b['route']}', style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                      Text('Driver: ${b['driver']} (${b['phone']}) • ${b['students']} Commuters', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String val, String label, IconData icon, Color color) {
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
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
        ],
      ),
    );
  }
}
