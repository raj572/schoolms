import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/student_controller.dart';

class StudentLibraryScreen extends ConsumerStatefulWidget {
  const StudentLibraryScreen({super.key});

  @override
  ConsumerState<StudentLibraryScreen> createState() => _StudentLibraryScreenState();
}

class _StudentLibraryScreenState extends ConsumerState<StudentLibraryScreen> {
  int _selectedTab = 0; // 0: Catalog, 1: My Issues, 2: Digital Resources
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();

  // Fallback demo data if library is freshly initialized
  final List<Map<String, dynamic>> _demoBooks = [
    {
      'id': 1,
      'book_title': 'Advanced Principles of Physics',
      'author_name': 'Prof. David J. Griffiths',
      'book_code': 'PHY-401',
      'category': 'Science',
      'available_quantity': 8,
      'total_quantity': 10,
    },
    {
      'id': 2,
      'book_title': 'Calculus: Early Transcendentals',
      'author_name': 'James Stewart',
      'book_code': 'MTH-205',
      'category': 'Mathematics',
      'available_quantity': 12,
      'total_quantity': 15,
    },
    {
      'id': 3,
      'book_title': 'Organic Chemistry: Structure and Function',
      'author_name': 'K. Peter C. Vollhardt',
      'book_code': 'CHM-310',
      'category': 'Science',
      'available_quantity': 3,
      'total_quantity': 8,
    },
    {
      'id': 4,
      'book_title': 'Data Structures & Algorithms in Java',
      'author_name': 'Robert Lafore',
      'book_code': 'CSC-112',
      'category': 'Computer Science',
      'available_quantity': 0,
      'total_quantity': 6,
    },
    {
      'id': 5,
      'book_title': 'Modern World History & Geopolitics',
      'author_name': 'Norman Lowe',
      'book_code': 'HST-101',
      'category': 'Humanities',
      'available_quantity': 14,
      'total_quantity': 14,
    },
  ];

  final List<Map<String, dynamic>> _demoIssues = [
    {
      'id': 101,
      'book_title': 'Advanced Principles of Physics',
      'author_name': 'Prof. David J. Griffiths',
      'book_code': 'PHY-401',
      'issue_date': '2026-03-01',
      'due_date': '2026-03-22',
      'status': 'Active',
      'days_left': 5,
    },
    {
      'id': 102,
      'book_title': 'Calculus: Early Transcendentals',
      'author_name': 'James Stewart',
      'book_code': 'MTH-205',
      'issue_date': '2026-02-10',
      'due_date': '2026-03-03',
      'status': 'Returned',
      'days_left': 0,
    },
  ];

  final List<Map<String, dynamic>> _demoResources = [
    {
      'id': 201,
      'title': 'AP Chemistry Complete Semester Lab Manual 2026',
      'resource_type': 'PDF Document',
      'file_size': '14.2 MB',
      'downloads': 184,
      'subject': 'Chemistry',
    },
    {
      'id': 202,
      'title': 'Calculus II Practice Problem Sets & Formula Sheet',
      'resource_type': 'Study Guide',
      'file_size': '6.8 MB',
      'downloads': 342,
      'subject': 'Mathematics',
    },
    {
      'id': 203,
      'title': 'World Literature Mid-Term Selected Readings',
      'resource_type': 'E-Booklet',
      'file_size': '4.1 MB',
      'downloads': 98,
      'subject': 'English Literature',
    },
    {
      'id': 204,
      'title': 'Computer Science Past Examination Papers (2020-2025)',
      'resource_type': 'Archive Bundle',
      'file_size': '22.5 MB',
      'downloads': 512,
      'subject': 'Computer Science',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final booksAsync = ref.watch(studentLibraryBooksProvider);
    final issuesAsync = ref.watch(studentBorrowedIssuesProvider);
    final resourcesAsync = ref.watch(studentDigitalResourcesProvider);

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: const EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Library',
        switcherLabel: 'Academic Resource Center',
        showBackButton: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(studentLibraryBooksProvider);
          ref.invalidate(studentBorrowedIssuesProvider);
          ref.invalidate(studentDigitalResourcesProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Input Field
              Container(
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: EduPulseColors.border),
                  boxShadow: const [
                    BoxShadow(
                      color: Color.fromRGBO(30, 41, 59, 0.04),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchCtrl,
                  onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                  decoration: InputDecoration(
                    hintText: 'Search titles, authors, book codes...',
                    hintStyle: EduPulseTypography.bodySm(color: EduPulseColors.textPlaceholder),
                    prefixIcon: const Icon(Icons.search, color: EduPulseColors.primary, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Segmented Tab Switcher (matching EduPulse UI/UX specification)
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _buildTabButton(0, 'Catalog', Icons.auto_stories_outlined),
                    _buildTabButton(1, 'My Issues', Icons.bookmark_added_outlined),
                    _buildTabButton(2, 'Resources', Icons.cloud_download_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Tab View Content
              if (_selectedTab == 0)
                _buildCatalogTab(booksAsync)
              else if (_selectedTab == 1)
                _buildIssuesTab(issuesAsync)
              else
                _buildResourcesTab(resourcesAsync),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(int index, String label, IconData icon) {
    final isSelected = _selectedTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isSelected ? EduPulseColors.surfaceCard : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? const [
                    BoxShadow(
                      color: Color.fromRGBO(30, 41, 59, 0.06),
                      blurRadius: 4,
                      offset: Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected ? EduPulseColors.primary : EduPulseColors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: EduPulseTypography.labelMd(
                  color: isSelected ? EduPulseColors.textHeadline : EduPulseColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCatalogTab(AsyncValue<List<Map<String, dynamic>>> booksAsync) {
    final liveBooks = booksAsync.value ?? [];
    final sourceList = liveBooks.isNotEmpty ? liveBooks : _demoBooks;

    final filtered = sourceList.where((b) {
      if (_searchQuery.isEmpty) return true;
      final title = (b['book_title'] ?? '').toString().toLowerCase();
      final author = (b['author_name'] ?? '').toString().toLowerCase();
      final code = (b['book_code'] ?? '').toString().toLowerCase();
      return title.contains(_searchQuery) || author.contains(_searchQuery) || code.contains(_searchQuery);
    }).toList();

    if (filtered.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: EduPulseColors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: EduPulseColors.border),
        ),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.menu_book, size: 40, color: EduPulseColors.textMuted),
              const SizedBox(height: 10),
              Text('No matching books found', style: EduPulseTypography.labelLg()),
              const SizedBox(height: 4),
              Text('Try searching with different terms or codes', style: EduPulseTypography.bodySm()),
            ],
          ),
        ),
      );
    }

    return Column(
      children: filtered.map((book) {
        final title = book['book_title'] ?? 'Book Title';
        final author = book['author_name'] ?? 'Author Name';
        final code = book['book_code'] ?? 'CODE-001';
        final category = book['category'] ?? 'General';
        final available = int.tryParse(book['available_quantity']?.toString() ?? '0') ?? 0;
        final total = int.tryParse(book['total_quantity']?.toString() ?? '0') ?? 1;
        final isAvailable = available > 0;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: EduPulseColors.border),
            boxShadow: const [
              BoxShadow(
                color: Color.fromRGBO(30, 41, 59, 0.03),
                blurRadius: 6,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 60,
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: const Center(
                  child: Icon(Icons.book_rounded, color: EduPulseColors.primary, size: 26),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: EduPulseColors.surfaceContainer,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            code,
                            style: EduPulseTypography.labelSm(color: EduPulseColors.primary),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: EduPulseColors.surfaceContainerLow,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            category,
                            style: EduPulseTypography.labelSm(color: EduPulseColors.secondaryMuted),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(title, style: EduPulseTypography.labelLg()),
                    const SizedBox(height: 2),
                    Text('by $author', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        StatusPill(
                          label: isAvailable ? '$available of $total Available' : 'Out of Stock',
                          variant: isAvailable ? PillVariant.success : PillVariant.error,
                        ),
                        OutlinedButton(
                          onPressed: () => _showBookDetailsModal(context, book),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            minimumSize: const Size(0, 32),
                          ),
                          child: const Text('Details', style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildIssuesTab(AsyncValue<List<Map<String, dynamic>>> issuesAsync) {
    final liveIssues = issuesAsync.value ?? [];
    final sourceList = liveIssues.isNotEmpty ? liveIssues : _demoIssues;

    return Column(
      children: sourceList.map((issue) {
        final title = issue['book_title'] ?? issue['book']?['book_title'] ?? 'Textbook';
        final author = issue['author_name'] ?? issue['book']?['author_name'] ?? 'Faculty';
        final issueDate = issue['issue_date'] ?? '2026-03-01';
        final dueDate = issue['due_date'] ?? '2026-03-22';
        final status = issue['status'] ?? 'Active';
        final isReturned = status.toLowerCase() == 'returned';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(title, style: EduPulseTypography.labelLg()),
                  ),
                  StatusPill(
                    label: isReturned ? 'RETURNED' : 'ISSUED',
                    variant: isReturned ? PillVariant.neutral : PillVariant.info,
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text('by $author', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Issued On', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      Text(issueDate, style: EduPulseTypography.labelMd()),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Due Date', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                      Text(
                        dueDate,
                        style: EduPulseTypography.labelMd(
                          color: isReturned ? EduPulseColors.textHeadline : EduPulseColors.error,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildResourcesTab(AsyncValue<List<Map<String, dynamic>>> resourcesAsync) {
    final liveResources = resourcesAsync.value ?? [];
    final sourceList = liveResources.isNotEmpty ? liveResources : _demoResources;

    return Column(
      children: sourceList.map((res) {
        final title = res['title'] ?? 'Learning Resource PDF';
        final type = res['resource_type'] ?? 'PDF Document';
        final size = res['file_size'] ?? '8.4 MB';
        final downloads = res['downloads'] ?? 142;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Center(
                  child: Icon(Icons.picture_as_pdf_outlined, color: EduPulseColors.primary, size: 24),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: EduPulseTypography.labelMd()),
                    const SizedBox(height: 2),
                    Text('$type • $size • $downloads downloads', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.download_for_offline_outlined, color: EduPulseColors.primary),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Downloading "$title" ($size)...'),
                      backgroundColor: EduPulseColors.primary,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  void _showBookDetailsModal(BuildContext context, Map<String, dynamic> book) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text(book['book_title'] ?? '', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 4),
            Text('by ${book['author_name'] ?? ''}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _buildDetailRow('Book Code', book['book_code'] ?? 'N/A'),
            _buildDetailRow('Category', book['category'] ?? 'General'),
            _buildDetailRow('Available Copies', '${book['available_quantity'] ?? 0}'),
            _buildDetailRow('Total Library Stock', '${book['total_quantity'] ?? 0}'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Reservation request sent to School Librarian.'),
                    backgroundColor: EduPulseColors.success,
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: EduPulseColors.primary,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Reserve at Library Desk'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
          Text(value, style: EduPulseTypography.labelMd()),
        ],
      ),
    );
  }
}
