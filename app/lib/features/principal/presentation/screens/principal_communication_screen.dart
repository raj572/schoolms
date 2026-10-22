import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalCommunicationScreen extends ConsumerWidget {
  const PrincipalCommunicationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> notices = [
      {
        'title': 'Annual Sports Meet & Athletic Championship 2026',
        'audience': 'All Students, Parents & Staff',
        'date': '20 Oct 2026',
        'content': 'The Annual Sports Meet will take place on campus athletics grounds from Nov 5-7. All houses must submit athlete rosters.',
        'reads': '1,140 reads',
      },
      {
        'title': 'Science Exhibition & Robotics Showcase Invitations',
        'audience': 'Middle & Senior School Parents',
        'date': '15 Oct 2026',
        'content': 'Parents are cordially invited to witness senior student AI and physics exhibits in the main auditorium this Saturday.',
        'reads': '890 reads',
      },
      {
        'title': 'Campus Air Quality & Health Advisory Protocol',
        'audience': 'Campus Community',
        'date': '08 Oct 2026',
        'content': 'Indoor filtration active in all classrooms. Outdoor physical education rescheduled to morning slots.',
        'reads': '1,240 reads',
      },
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/communication'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Communication Hub',
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
                    Text('Campus Communication', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Official notices, circulars & push broadcasts', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showComposeNoticeDialog(context),
                  icon: const Icon(Icons.campaign, size: 16),
                  label: const Text('Compose'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: notices.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final n = notices[i];
                return Container(
                  padding: const EdgeInsets.all(16),
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(n['audience'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                          ),
                          Text(n['date'] as String, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(n['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      const SizedBox(height: 6),
                      Text(n['content'] as String, style: const TextStyle(fontSize: 12, color: EduPulseColors.textBody)),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(n['reads'] as String, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted, fontStyle: FontStyle.italic)),
                          const Icon(Icons.check_circle_outline, size: 14, color: EduPulseColors.success),
                        ],
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

  void _showComposeNoticeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Compose Campus Notice'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Notice Headline', hintText: 'e.g. Winter Break Schedule')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Target Audience', hintText: 'All Students & Parents')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Message Body', hintText: 'Write notice details...'), maxLines: 3),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notice dispatched to student, teacher & parent portals!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Broadcast'),
          ),
        ],
      ),
    );
  }
}
