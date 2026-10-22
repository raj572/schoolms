import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalWardensScreen extends ConsumerWidget {
  const PrincipalWardensScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> wardens = [
      {'name': 'Vikram Rathore', 'block': 'Boys Block A (Nelson Mandela)', 'phone': '+91 99887 76655', 'duty': 'Night Supervision & Discipline', 'status': 'on_campus'},
      {'name': 'Meenakshi Sundaram', 'block': 'Girls Block B (Marie Curie)', 'phone': '+91 98765 88990', 'duty': 'Residential Care & Wellness', 'status': 'on_campus'},
      {'name': 'Ashok Singhania', 'block': 'Junior Boarding Wing', 'phone': '+91 98123 77889', 'duty': 'Dining Hall & Night Patrol', 'status': 'on_campus'},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/wardens'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Residential Wardens',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Residential Wardens', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Hostel administrators & campus security officers', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: wardens.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final w = wardens[i];
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
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.shield_outlined, color: Color(0xFF2563EB), size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(w['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            Text(w['block'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w500)),
                            Text('Phone: ${w['phone']} • ${w['duty']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.phone_outlined, color: EduPulseColors.success),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Calling ${w['name']} (${w['phone']})')),
                          );
                        },
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
}
