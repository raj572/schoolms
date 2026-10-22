import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalLibraryScreen extends ConsumerWidget {
  const PrincipalLibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> recentIssues = [
      {'book': 'Principles of Modern Physics (Vol 1)', 'student': 'Alex Doe (Grade 10)', 'date': 'Issued 18 Oct', 'status': 'active'},
      {'book': 'Advanced Calculus & Analytical Geometry', 'student': 'Rohan Sharma (Grade 11)', 'date': 'Issued 10 Oct', 'status': 'overdue'},
      {'book': 'To Kill a Mockingbird - Harper Lee', 'student': 'Sarah Jenkins (Grade 8)', 'date': 'Issued 21 Oct', 'status': 'active'},
      {'book': 'A Brief History of Time - Stephen Hawking', 'student': 'Priya Patel (Grade 6)', 'date': 'Issued 14 Oct', 'status': 'active'},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/library'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Campus Library',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Library & Resource Center', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Collection volume, circulation & digital journals', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(child: _buildStat('1,420 Books', 'Catalog Volumes', Icons.book, const Color(0xFF2563EB))),
                const SizedBox(width: 10),
                Expanded(child: _buildStat('184 Issued', 'Circulation', Icons.assignment, const Color(0xFF10B981))),
                const SizedBox(width: 10),
                Expanded(child: _buildStat('18 Overdue', 'Pending Return', Icons.warning_amber, const Color(0xFFDC2626))),
              ],
            ),
            const SizedBox(height: 16),

            Text('Recent Book Issues & Circulation', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: recentIssues.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final b = recentIssues[i];
                final isOverdue = b['status'] == 'overdue';
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
                          color: (isOverdue ? EduPulseColors.error : const Color(0xFF2563EB)).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.menu_book, color: isOverdue ? EduPulseColors.error : const Color(0xFF2563EB), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(b['book'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            Text('Borrower: ${b['student']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                            Text(b['date'] as String, style: TextStyle(fontSize: 10, color: isOverdue ? EduPulseColors.error : EduPulseColors.textMuted, fontWeight: FontWeight.w600)),
                          ],
                        ),
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
          Text(val, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
        ],
      ),
    );
  }
}
