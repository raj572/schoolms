import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/teacher_navigation_drawer.dart';

class TeacherCommunicationScreen extends ConsumerWidget {
  const TeacherCommunicationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> messages = [
      {
        'from': 'Principal\'s Office (Dr. Eleanor Vance)',
        'title': 'Faculty Briefing: Term 2 Examination Guidelines',
        'date': 'Today, 10:30 AM',
        'body': 'All subject leads are requested to assemble in the main conference hall tomorrow at 03:45 PM for exam paper vetting.',
        'isUnread': true,
      },
      {
        'from': 'Richard Johnson (Father of Alex Doe)',
        'title': 'Query regarding Physics practical test marks',
        'date': 'Yesterday, 04:15 PM',
        'body': 'Respected Sir, Alex mentioned the practical demo is scheduled for next Tuesday. Could you please share the required equipment list?',
        'isUnread': false,
      },
      {
        'from': 'Academic Department Notice',
        'title': 'Submission of internal assessment grades',
        'date': '19 Oct 2026',
        'body': 'Please ensure internal continuous assessment records for Grade 10-A are finalized by this Friday.',
        'isUnread': false,
      },
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const TeacherNavigationDrawer(currentRoute: '/teacher/communication'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Faculty',
        switcherLabel: 'Faculty Messages',
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
                    Text('Admin notices, parent messages & class alerts', style: EduPulseTypography.bodySm()),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showBroadcastDialog(context),
                  icon: const Icon(Icons.campaign, size: 16),
                  label: const Text('Broadcast'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
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
              itemCount: messages.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final m = messages[i];
                final isUnread = m['isUnread'] as bool;

                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isUnread ? const Color(0xFF059669) : EduPulseColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              m['from'] as String,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF059669)),
                            ),
                          ),
                          Text(m['date'] as String, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(m['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      const SizedBox(height: 4),
                      Text(m['body'] as String, style: const TextStyle(fontSize: 12, color: EduPulseColors.textBody)),
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

  void _showBroadcastDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send Class Announcement'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(decoration: InputDecoration(labelText: 'Target Class', hintText: 'e.g. Grade 10-A Physics')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Announcement Title', hintText: 'e.g. Formula Sheet Required')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Message Body', hintText: 'Enter announcement details...'), maxLines: 3),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notice dispatched to student & parent mobile app!'), backgroundColor: EduPulseColors.success),
              );
            },
            child: const Text('Broadcast'),
          ),
        ],
      ),
    );
  }
}
