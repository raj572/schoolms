import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalDocumentsScreen extends ConsumerWidget {
  const PrincipalDocumentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    final List<Map<String, dynamic>> docs = [
      {'title': 'CBSE Affiliation Certificate 2026-2031', 'category': 'Accreditation', 'size': '2.4 MB PDF', 'date': 'Updated 01 Jul 2026'},
      {'title': 'Campus Fire Safety & Structural Clearance', 'category': 'Compliance', 'size': '1.8 MB PDF', 'date': 'Updated 15 May 2026'},
      {'title': 'Annual School Academic Calendar 2026-27', 'category': 'Curriculum', 'size': '850 KB PDF', 'date': 'Updated 20 Aug 2026'},
      {'title': 'Staff Code of Conduct & Safeguarding Policy', 'category': 'HR & Staff', 'size': '1.2 MB PDF', 'date': 'Updated 10 Jan 2026'},
    ];

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/documents'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Official Documents',
        onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Official Documents & Vault', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Statutory affiliations, compliance & institutional policies', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: docs.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (ctx, i) {
                final d = docs[i];
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
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.description, color: Color(0xFF2563EB), size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(d['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                            Text('${d['category']} • ${d['size']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                            Text(d['date'] as String, style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.file_download_outlined, color: Color(0xFF2563EB)),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Downloading ${d['title']}...')),
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
