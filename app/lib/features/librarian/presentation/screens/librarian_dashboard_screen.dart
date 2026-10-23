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

            // Quick Actions matching Web
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showAddBookDialog(context),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text('Add Book'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showIssueBookDialog(context),
                    icon: const Icon(Icons.bookmark_add, size: 16),
                    label: const Text('Issue Book'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showReturnBookDialog(context),
                    icon: const Icon(Icons.assignment_return, size: 16),
                    label: const Text('Return'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
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

  void _showAddBookDialog(BuildContext context) {
    final codeController = TextEditingController();
    final titleController = TextEditingController();
    final authorController = TextEditingController();
    final publisherController = TextEditingController();
    final isbnController = TextEditingController();
    final qtyController = TextEditingController(text: '1');
    final priceController = TextEditingController(text: '0');
    final locationController = TextEditingController();
    final descController = TextEditingController();
    String selectedCategory = 'Science';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add New Book', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 380,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: codeController,
                          decoration: const InputDecoration(labelText: 'Book Code *', hintText: 'BK-1001'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: isbnController,
                          decoration: const InputDecoration(labelText: 'ISBN', hintText: '978-0-123456'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(labelText: 'Book Title *', hintText: 'e.g. Principia Mathematica'),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: authorController,
                          decoration: const InputDecoration(labelText: 'Author', hintText: 'Author name'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: publisherController,
                          decoration: const InputDecoration(labelText: 'Publisher', hintText: 'Publisher'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: selectedCategory,
                          decoration: const InputDecoration(labelText: 'Category'),
                          items: const [
                            DropdownMenuItem(value: 'Science', child: Text('Science')),
                            DropdownMenuItem(value: 'Mathematics', child: Text('Mathematics')),
                            DropdownMenuItem(value: 'Literature', child: Text('Literature')),
                            DropdownMenuItem(value: 'History', child: Text('History')),
                            DropdownMenuItem(value: 'Computer Science', child: Text('Computer Science')),
                            DropdownMenuItem(value: 'General', child: Text('General')),
                          ],
                          onChanged: (v) => setDialogState(() => selectedCategory = v ?? 'Science'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: qtyController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Quantity *'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: priceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Price (₹)'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: locationController,
                          decoration: const InputDecoration(labelText: 'Shelf Location', hintText: 'Rack A-2'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: descController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Description', hintText: 'Summary or condition notes'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                final title = titleController.text.trim();
                if (title.isEmpty) return;
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Book added to library catalog successfully!'), backgroundColor: EduPulseColors.success),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
              ),
              child: const Text('Add Book'),
            ),
          ],
        ),
      ),
    );
  }

  void _showIssueBookDialog(BuildContext context) {
    String borrowerType = 'student';
    final bookIdController = TextEditingController();
    final borrowerIdController = TextEditingController();
    final fineController = TextEditingController(text: '5');
    DateTime dueDate = DateTime.now().add(const Duration(days: 7));

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Issue Library Book', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 360,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DropdownButtonFormField<String>(
                    initialValue: borrowerType,
                    decoration: const InputDecoration(labelText: 'Borrower Type *'),
                    items: const [
                      DropdownMenuItem(value: 'student', child: Text('Student')),
                      DropdownMenuItem(value: 'teacher', child: Text('Faculty / Teacher')),
                    ],
                    onChanged: (v) => setDialogState(() => borrowerType = v ?? 'student'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: bookIdController,
                    decoration: const InputDecoration(
                      labelText: 'Book Accession # / ISBN *',
                      hintText: 'e.g. BK-1001',
                      prefixIcon: Icon(Icons.qr_code, size: 20),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: borrowerIdController,
                    decoration: InputDecoration(
                      labelText: borrowerType == 'student' ? 'Student Roll No / ID *' : 'Teacher Employee ID *',
                      hintText: borrowerType == 'student' ? 'e.g. 1001 (Alex Doe)' : 'e.g. TCH-001',
                      prefixIcon: const Icon(Icons.person, size: 20),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: fineController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Late Fine Per Day (₹)',
                      hintText: '5',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Due Date: ${dueDate.year}-${dueDate.month.toString().padLeft(2, '0')}-${dueDate.day.toString().padLeft(2, '0')}',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      TextButton.icon(
                        onPressed: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: dueDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 90)),
                          );
                          if (picked != null) {
                            setDialogState(() => dueDate = picked);
                          }
                        },
                        icon: const Icon(Icons.calendar_today, size: 14),
                        label: const Text('Change'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final bId = borrowerIdController.text.trim();
                final bkId = bookIdController.text.trim();
                if (bId.isEmpty || bkId.isEmpty) return;
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Book successfully checked out!'),
                    backgroundColor: EduPulseColors.success,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
              ),
              child: const Text('Confirm Checkout'),
            ),
          ],
        ),
      ),
    );
  }

  void _showReturnBookDialog(BuildContext context) {
    final bookController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Circulation • Return Book', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: bookController,
              decoration: const InputDecoration(
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
