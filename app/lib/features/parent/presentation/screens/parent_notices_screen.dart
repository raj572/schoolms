import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../../core/widgets/status_pill.dart';
import '../controllers/parent_controller.dart';

class ParentNoticesScreen extends ConsumerWidget {
  const ParentNoticesScreen({super.key});

  void _showNoticeDetailModal(BuildContext context, Map<String, dynamic> notice) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        final bool hasAttachment = notice['attachment'] == true;

        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          contentPadding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: EduPulseColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.notifications_active_rounded, color: EduPulseColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  notice['title'] ?? 'Notice Details',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const StatusPill(label: 'Official Circular', variant: PillVariant.info),
                  const Spacer(),
                  Text(
                    'Date: ${notice['date'] ?? '2024-04-05'}',
                    style: const TextStyle(fontSize: 12, color: EduPulseColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                notice['message'] ?? '',
                style: const TextStyle(fontSize: 14, height: 1.5, color: EduPulseColors.textHeadline),
              ),
              if (hasAttachment) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: EduPulseColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.picture_as_pdf_rounded, color: EduPulseColors.error, size: 24),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('sports_schedule_circular.pdf', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            Text('240 KB • PDF Document', style: TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.download_rounded, color: EduPulseColors.primary),
                        onPressed: () {
                          Navigator.pop(dialogContext);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Downloaded sports_schedule_circular.pdf successfully.'),
                              backgroundColor: EduPulseColors.success,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  void _downloadAllNotices(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            Icon(Icons.download_done_rounded, color: Colors.white, size: 18),
            SizedBox(width: 8),
            Text('All parent circulars downloaded (parent_notices_bundle.pdf).'),
          ],
        ),
        backgroundColor: EduPulseColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final noticesAsync = ref.watch(parentNoticesProvider);
    final activeChildIndex = ref.watch(activeChildIndexProvider);

    final children = [
      {'name': 'Rohan Sharma', 'grade': '10th Grade'},
      {'name': 'Riya Sharma', 'grade': '6th Grade'},
      {'name': 'Ankit Verma', 'grade': '8th Grade'},
    ];
    final activeChild = children[activeChildIndex.clamp(0, children.length - 1)];

    // Default notices matching website Notices.tsx
    final defaultNotices = [
      {
        'id': 1,
        'title': 'Annual Sports Day Announcement',
        'message': 'Annual Sports Day will be held on 20th April 2024. Parents are invited to attend.',
        'date': '2024-04-05',
        'attachment': true,
      },
      {
        'id': 2,
        'title': 'Parent-Teacher Meeting',
        'message': 'PTM is scheduled on 15th April 2024. Kindly be present to discuss your child\'s progress.',
        'date': '2024-04-03',
        'attachment': false,
      },
      {
        'id': 3,
        'title': 'Holiday Notice',
        'message': 'School will remain closed on 14th April 2024 due to a public holiday.',
        'date': '2024-04-02',
        'attachment': false,
      },
    ];

    final rawNotices = noticesAsync.valueOrNull;
    final notices = (rawNotices != null && rawNotices.isNotEmpty)
        ? rawNotices
        : defaultNotices;

    return Scaffold(
      backgroundColor: EduPulseColors.surface,
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Parent Notices',
        switcherLabel: '${activeChild['name']} • Notices',
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(parentNoticesProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header matching website Notices.tsx
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: EduPulseColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.notifications_active_outlined, color: EduPulseColors.primary, size: 22),
                      ),
                      const SizedBox(width: 10),
                      Text('Parent Notices', style: EduPulseTypography.headlineLg()),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _downloadAllNotices(context),
                    icon: const Icon(Icons.download_rounded, size: 16),
                    label: const Text('Download All'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: EduPulseColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Notices Cards List
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: notices.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final notice = notices[i];
                  final bool hasAttachment = notice['attachment'] == true;

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: EduPulseColors.border),
                      boxShadow: const [
                        BoxShadow(
                          color: Color.fromRGBO(30, 41, 59, 0.04),
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    notice['title'] ?? 'Notice',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: EduPulseColors.textHeadline),
                                  ),
                                  const SizedBox(height: 2),
                                  Text('Date: ${notice['date'] ?? '2024-04-05'}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            const StatusPill(label: 'Notice', variant: PillVariant.neutral),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          notice['message'] ?? '',
                          style: const TextStyle(fontSize: 13, height: 1.4, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (hasAttachment) ...[
                              ElevatedButton.icon(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Downloading attachment for "${notice['title']}"...'),
                                      backgroundColor: EduPulseColors.primary,
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.download_rounded, size: 14),
                                label: const Text('Attachment'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: EduPulseColors.primary,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 8),
                            ],
                            OutlinedButton.icon(
                              onPressed: () => _showNoticeDetailModal(context, notice),
                              icon: const Icon(Icons.visibility_outlined, size: 14),
                              label: const Text('View'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                side: const BorderSide(color: EduPulseColors.border),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                textStyle: const TextStyle(fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
