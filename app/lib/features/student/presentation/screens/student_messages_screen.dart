import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../widgets/student_navigation_drawer.dart';

class StudentMessagesScreen extends ConsumerStatefulWidget {
  const StudentMessagesScreen({super.key});

  @override
  ConsumerState<StudentMessagesScreen> createState() => _StudentMessagesScreenState();
}

class _StudentMessagesScreenState extends ConsumerState<StudentMessagesScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _selectedCategory = 'all'; // all, teacher, admin
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();

  final List<Map<String, dynamic>> _messages = [
    {
      'id': 1,
      'sender': 'Dr. Aris Thorne',
      'role': 'AP Chemistry Teacher',
      'type': 'teacher',
      'subject': 'Laboratory Practical Schedule & Safety Protocols',
      'content':
          'Dear Students, Please review the updated Lab Safety Protocols before Thursday\'s organic synthesis session. Protective eye-wear and lab coats are strictly mandatory at all stations.',
      'time': '2 hours ago',
      'unread': true,
      'replies': [
        {
          'sender': 'Alex Doe',
          'isSelf': true,
          'text': 'Thank you Dr. Thorne, will bring our lab journals as well.',
          'time': '1 hour ago',
        }
      ],
    },
    {
      'id': 2,
      'sender': 'Dean\'s Academic Office',
      'role': 'Administration',
      'type': 'admin',
      'subject': 'Spring Term Final Examination Timetable Published',
      'content':
          'The comprehensive schedule for Spring Term Examinations has been uploaded to your portal timetable. Please verify your hall ticket and seat numbers by Friday.',
      'time': 'Yesterday',
      'unread': true,
      'replies': [],
    },
    {
      'id': 3,
      'sender': 'Prof. Elena Rostova',
      'role': 'Calculus Instructor',
      'type': 'teacher',
      'subject': 'Extra Help & Office Hours This Wednesday',
      'content':
          'Office hours for Chapter 8 Taylor Series Review are extended this Wednesday from 3:30 PM to 5:00 PM in Room 302.',
      'time': '2 days ago',
      'unread': false,
      'replies': [],
    },
    {
      'id': 4,
      'sender': 'Bursar & Accounts Department',
      'role': 'Billing & Finance',
      'type': 'admin',
      'subject': 'Term 2 Fee Receipt & Statement Generation',
      'content':
          'Official stamped tax receipts for payments cleared before March 15 have been generated and can be downloaded from the Fees tab.',
      'time': '4 days ago',
      'unread': false,
      'replies': [],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _messages.where((m) {
      if (_selectedCategory != 'all' && m['type'] != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final subject = (m['subject'] ?? '').toString().toLowerCase();
        final sender = (m['sender'] ?? '').toString().toLowerCase();
        return subject.contains(_searchQuery) || sender.contains(_searchQuery);
      }
      return true;
    }).toList();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const StudentNavigationDrawer(currentRoute: '/student/messages'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Messages',
        switcherLabel: 'Campus Communications',
        showBackButton: true,
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showNewMessageDialog(context),
        backgroundColor: EduPulseColors.primary,
        icon: const Icon(Icons.edit_note, color: Colors.white),
        label: const Text('New Query', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
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
                  hintText: 'Search communications & announcements...',
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
            const SizedBox(height: 12),

            // Category Filter Pills
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', 'All Messages (${_messages.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('teacher', 'Teachers & Faculty'),
                  const SizedBox(width: 8),
                  _buildFilterChip('admin', 'Administration'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Messages List
            if (filtered.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: EduPulseColors.surfaceCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: EduPulseColors.border),
                ),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.mail_outline, size: 40, color: EduPulseColors.textMuted),
                      const SizedBox(height: 10),
                      Text('No communications found', style: EduPulseTypography.labelLg()),
                      const SizedBox(height: 4),
                      Text('Try selecting a different category or search term', style: EduPulseTypography.bodySm()),
                    ],
                  ),
                ),
              )
            else
              Column(
                children: filtered.map((msg) {
                  final unread = msg['unread'] as bool;
                  final type = msg['type'] as String;

                  return GestureDetector(
                    onTap: () {
                      setState(() => msg['unread'] = false);
                      _showMessageDetailModal(context, msg);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: unread ? EduPulseColors.primary.withValues(alpha: 0.35) : EduPulseColors.border,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: unread
                                ? const Color.fromRGBO(37, 99, 235, 0.06)
                                : const Color.fromRGBO(30, 41, 59, 0.03),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: type == 'teacher'
                                      ? const Color(0xFFEFF6FF)
                                      : const Color(0xFFF5F3FF),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Icon(
                                    type == 'teacher' ? Icons.school_outlined : Icons.corporate_fare_outlined,
                                    color: type == 'teacher' ? EduPulseColors.primary : const Color(0xFF7C3AED),
                                    size: 20,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(msg['sender'] ?? '', style: EduPulseTypography.labelMd()),
                                        if (unread) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              color: EduPulseColors.primary,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    Text(msg['role'] ?? '', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                                  ],
                                ),
                              ),
                              Text(msg['time'] ?? '', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            msg['subject'] ?? '',
                            style: EduPulseTypography.labelLg(color: EduPulseColors.textHeadline),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            msg['content'] ?? '',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: EduPulseTypography.bodySm(),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedCategory == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? EduPulseColors.primary : EduPulseColors.surfaceCard,
          borderRadius: BorderRadius.circular(9999),
          border: Border.all(
            color: isSelected ? EduPulseColors.primary : EduPulseColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : EduPulseColors.textBody,
          ),
        ),
      ),
    );
  }

  void _showMessageDetailModal(BuildContext context, Map<String, dynamic> msg) {
    final replyCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalContext, setModalState) => Container(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
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
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: EduPulseColors.surfaceContainerHigh,
                      child: Text(
                        (msg['sender'] as String).substring(0, 1),
                        style: const TextStyle(fontWeight: FontWeight.bold, color: EduPulseColors.primary),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(msg['sender'] ?? '', style: EduPulseTypography.labelLg()),
                          Text('${msg['role']} • ${msg['time']}', style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(msg['subject'] ?? '', style: EduPulseTypography.headlineMd()),
                const SizedBox(height: 8),
                Text(msg['content'] ?? '', style: EduPulseTypography.bodyMd()),
                const SizedBox(height: 16),
                const Divider(),

                // Thread Replies
                if ((msg['replies'] as List).isNotEmpty) ...[
                  Text('Discussion Thread', style: EduPulseTypography.labelMd(color: EduPulseColors.textMuted)),
                  const SizedBox(height: 8),
                  ...(msg['replies'] as List).map((r) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: EduPulseColors.surfaceContainerLow,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.reply, size: 16, color: EduPulseColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(r['sender'] ?? 'You', style: EduPulseTypography.labelSm()),
                                  Text(r['text'] ?? '', style: EduPulseTypography.bodySm()),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                  const SizedBox(height: 12),
                ],

                // Reply Input
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: replyCtrl,
                        decoration: InputDecoration(
                          hintText: 'Type your reply...',
                          hintStyle: EduPulseTypography.bodySm(),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        if (replyCtrl.text.trim().isEmpty) return;
                        setModalState(() {
                          (msg['replies'] as List).add({
                            'sender': 'Alex Doe',
                            'isSelf': true,
                            'text': replyCtrl.text.trim(),
                            'time': 'Just now',
                          });
                        });
                        replyCtrl.clear();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: EduPulseColors.primary,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                      child: const Icon(Icons.send, size: 18),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showNewMessageDialog(BuildContext context) {
    final toCtrl = TextEditingController(text: 'Faculty Coordinator');
    final subjectCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.edit_note, color: EduPulseColors.primary),
            const SizedBox(width: 8),
            Text('Compose Query', style: EduPulseTypography.headlineMd()),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: toCtrl,
                decoration: InputDecoration(
                  labelText: 'Recipient',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: subjectCtrl,
                decoration: InputDecoration(
                  labelText: 'Subject',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: bodyCtrl,
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Message Body',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
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
                  content: Text('Message sent to Faculty Coordinator.'),
                  backgroundColor: EduPulseColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: EduPulseColors.primary),
            child: const Text('Send Message'),
          ),
        ],
      ),
    );
  }
}
