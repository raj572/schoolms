import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalHostelScreen extends ConsumerWidget {
  const PrincipalHostelScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> buildings = [
      {'name': 'Nelson Mandela Hall (Boys Block A)', 'rooms': '40 Rooms', 'capacity': '120 Beds', 'occupied': 108, 'warden': 'Vikram Rathore', 'rate': 0.90},
      {'name': 'Marie Curie Hall (Girls Block B)', 'rooms': '35 Rooms', 'capacity': '105 Beds', 'occupied': 92, 'warden': 'Meenakshi Sundaram', 'rate': 0.88},
      {'name': 'Junior Boarding Wing', 'rooms': '20 Rooms', 'capacity': '60 Beds', 'occupied': 52, 'warden': 'Ashok Singhania', 'rate': 0.86},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/hostel'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Residential Life',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hostel & Residential', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Dormitories, residential blocks & boarding capacity', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(child: _buildMetricCard('Occupancy', '88.4%', '252 / 285 Beds', EduPulseColors.success)),
                const SizedBox(width: 10),
                Expanded(child: _buildMetricCard('Buildings', '3 Blocks', '95 Dorm Rooms', const Color(0xFF2563EB))),
              ],
            ),
            const SizedBox(height: 16),

            Text('Residential Halls', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: buildings.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final b = buildings[i];
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
                            child: Text(b['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          ),
                          Text('${((b['rate'] as double) * 100).toInt()}% Full', style: const TextStyle(fontWeight: FontWeight.bold, color: EduPulseColors.success, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('${b['rooms']} • ${b['occupied']} / ${b['capacity']} filled', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                      Text('Chief Warden: ${b['warden']}', style: const TextStyle(fontSize: 11, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: b['rate'] as double,
                        minHeight: 6,
                        borderRadius: BorderRadius.circular(3),
                        backgroundColor: EduPulseColors.surfaceContainerHigh,
                        valueColor: const AlwaysStoppedAnimation<Color>(EduPulseColors.success),
                      ),
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

  Widget _buildMetricCard(String label, String value, String sub, Color color) {
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
          Text(label, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: color)),
          Text(sub, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
