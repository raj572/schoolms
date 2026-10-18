import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class LibrarianDashboardScreen extends ConsumerWidget {
  const LibrarianDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Library Staff';

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Librarian',
        switcherLabel: '$name (Main Library)',
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Library Circulation Hub', style: EduPulseTypography.headlineLg()),
            const SizedBox(height: 2),
            Text('Book Catalog & Circulation Tracker', style: EduPulseTypography.bodySm()),
            const SizedBox(height: 16),

            // 4 Circulation Metric Cards
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.4,
              children: [
                _buildCard('Total Volumes', '3,850', 'In Catalog', Icons.menu_book, EduPulseColors.primary),
                _buildCard('Available Books', '3,410', 'Ready to Issue', Icons.check_circle_outline, EduPulseColors.success),
                _buildCard('Currently Borrowed', '422', 'Active Readers', Icons.bookmark_border, EduPulseColors.secondary),
                _buildCard('Overdue Notices', '18', 'Requires Return', Icons.warning_amber_rounded, EduPulseColors.error),
              ],
            ),
            const SizedBox(height: 16),

            // Quick Issue / Return Actions
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      _showIssueBookDialog(context);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.qr_code_scanner, size: 18),
                        SizedBox(width: 6),
                        Text('Scan to Issue'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _showReturnBookDialog(context);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.assignment_return, size: 18),
                        SizedBox(width: 6),
                        Text('Book Return'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Overdue Borrows List
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Critical Overdue Borrows', style: EduPulseTypography.headlineMd()),
                Text('View All (18) >', style: EduPulseTypography.labelSm(color: EduPulseColors.primary)),
              ],
            ),
            const SizedBox(height: 10),
            _buildOverdueItem('Cosmos by Carl Sagan', 'Maya Lin (1001)', 'Overdue 3 days', 'Fine: \$3.00'),
            const SizedBox(height: 8),
            _buildOverdueItem('Calculus & Analytic Geometry', 'Marcus Chen (1005)', 'Overdue 5 days', 'Fine: \$5.00'),
            const SizedBox(height: 8),
            _buildOverdueItem('Clean Code: Agile Craft', 'Liam Vance (1002)', 'Overdue 1 day', 'Fine: \$1.00'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(String label, String value, String sub, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: EduPulseTypography.bodySm()),
              Icon(icon, size: 18, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: EduPulseTypography.tabularLg()),
          Text(sub, style: EduPulseTypography.labelSm(color: color)),
        ],
      ),
    );
  }

  Widget _buildOverdueItem(String book, String borrower, String days, String fine) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: EduPulseColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(book, style: EduPulseTypography.labelMd()),
              Text(borrower, style: EduPulseTypography.bodySm()),
              const SizedBox(height: 2),
              StatusPill(label: days, variant: PillVariant.error),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(fine, style: EduPulseTypography.tabularMd(color: EduPulseColors.error)),
              const SizedBox(height: 4),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(60, 26),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                child: const Text('Extend', style: TextStyle(fontSize: 10)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showIssueBookDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Circulation • Issue Book'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Book Accession No. / ISBN',
                hintText: 'e.g. BK-2024-8891',
                prefixIcon: Icon(Icons.qr_code),
              ),
            ),
            SizedBox(height: 12),
            TextField(
              decoration: InputDecoration(
                labelText: 'Student Roll No / Borrower ID',
                hintText: 'e.g. 1001 (Alex Doe)',
                prefixIcon: Icon(Icons.person),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Book successfully checked out! Due in 14 days.'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Confirm Checkout'),
          ),
        ],
      ),
    );
  }

  void _showReturnBookDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Circulation • Return Book'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TextField(
              decoration: InputDecoration(
                labelText: 'Scan or Enter Book Accession #',
                hintText: 'e.g. BK-2024-8891',
                prefixIcon: Icon(Icons.barcode_reader),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Book checked in and catalog availability restored.'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            child: const Text('Process Return'),
          ),
        ],
      ),
    );
  }
}
