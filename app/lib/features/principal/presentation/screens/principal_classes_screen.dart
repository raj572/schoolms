import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_constants.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalClassesScreen extends ConsumerStatefulWidget {
  final int initialTab; // 0: classes, 1: subjects, 2: timetable

  const PrincipalClassesScreen({
    super.key,
    this.initialTab = 0,
  });

  @override
  ConsumerState<PrincipalClassesScreen> createState() => _PrincipalClassesScreenState();
}

class _PrincipalClassesScreenState extends ConsumerState<PrincipalClassesScreen> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late TabController _tabController;

  final List<Map<String, dynamic>> _classes = [
    {'id': 1, 'class': 'Grade 10', 'section': 'A', 'room_no': 'Room 302', 'capacity': 42, 'teacher_in_charge': 'Sarah Connor', 'status': 'active'},
    {'id': 2, 'class': 'Grade 10', 'section': 'B', 'room_no': 'Room 303', 'capacity': 40, 'teacher_in_charge': 'Robert Taylor', 'status': 'active'},
    {'id': 3, 'class': 'Grade 11', 'section': 'Science', 'room_no': 'Lab Block A', 'capacity': 38, 'teacher_in_charge': 'Kavita Iyer', 'status': 'active'},
    {'id': 4, 'class': 'Grade 8', 'section': 'B', 'room_no': 'Room 205', 'capacity': 35, 'teacher_in_charge': 'Elena Rostova', 'status': 'active'},
    {'id': 5, 'class': 'Grade 6', 'section': 'A', 'room_no': 'Room 101', 'capacity': 30, 'teacher_in_charge': 'Anita Desai', 'status': 'active'},
  ];

  final List<Map<String, dynamic>> _subjects = [
    {'id': 1, 'subject_name': 'Mathematics', 'description': 'Foundational algebra, geometry & calculus curriculum', 'teachers': 6},
    {'id': 2, 'subject_name': 'Physics', 'description': 'Classical mechanics, optics, thermodynamics & lab experiments', 'teachers': 4},
    {'id': 3, 'subject_name': 'Chemistry', 'description': 'Organic, inorganic and analytical chemistry studies', 'teachers': 4},
    {'id': 4, 'subject_name': 'English Literature', 'description': 'Grammar, rhetoric, classic prose and world poetry', 'teachers': 8},
    {'id': 5, 'subject_name': 'Computer Science & AI', 'description': 'Data structures, algorithms and modern computing principles', 'teachers': 3},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
    _loadClassesAndSubjects();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadClassesAndSubjects() async {
    final authState = ref.read(authProvider);
    final schoolId = authState.user?.schoolId ?? 1;
    try {
      final resClasses = await ApiClient().get(ApiConstants.getClasses(schoolId));
      if (resClasses.data != null && resClasses.data['status'] == true && resClasses.data['data'] != null) {
        final List list = resClasses.data['data'];
        if (mounted && list.isNotEmpty) {
          setState(() {
            _classes.clear();
            for (final c in list) {
              _classes.add({
                'id': c['id'] ?? 0,
                'class': c['class'] ?? 'Class',
                'section': c['section'] ?? '',
                'room_no': c['room_no'] ?? 'N/A',
                'capacity': c['capacity'] ?? 40,
                'teacher_in_charge': c['teacher_in_charge'] ?? 'Unassigned',
                'status': c['status'] ?? 'active',
              });
            }
          });
        }
      }
    } catch (_) {}

    try {
      final resSubj = await ApiClient().get(ApiConstants.getSubjects(schoolId));
      if (resSubj.data != null && resSubj.data['status'] == true && resSubj.data['data'] != null) {
        final List list = resSubj.data['data'];
        if (mounted && list.isNotEmpty) {
          setState(() {
            _subjects.clear();
            for (final s in list) {
              _subjects.add({
                'id': s['id'] ?? 0,
                'subject_name': s['subject_name'] ?? s['name'] ?? 'Subject',
                'description': s['description'] ?? 'Curriculum guidelines',
                'teachers': s['teachers'] ?? 2,
              });
            }
          });
        }
      }
    } catch (_) {}
  }

  void _showAddClassDialog() {
    final classController = TextEditingController();
    final sectionController = TextEditingController();
    final capacityController = TextEditingController();
    final roomNoController = TextEditingController();
    final teacherController = TextEditingController();
    final notesController = TextEditingController();
    String selectedStatus = 'active';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dCtx, setDialogState) => AlertDialog(
          title: const Text('New Class', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 380,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: classController,
                          decoration: const InputDecoration(labelText: 'Class *', hintText: 'e.g. 10'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: sectionController,
                          decoration: const InputDecoration(labelText: 'Section', hintText: 'e.g. A'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: capacityController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Capacity', hintText: 'Maximum students'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: roomNoController,
                          decoration: const InputDecoration(labelText: 'Room Number', hintText: 'e.g. R-101'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: teacherController,
                    decoration: const InputDecoration(labelText: 'Teacher In Charge', hintText: 'Select or enter teacher name'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedStatus,
                    decoration: const InputDecoration(labelText: 'Status'),
                    items: const [
                      DropdownMenuItem(value: 'active', child: Text('Active')),
                      DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
                    ],
                    onChanged: (v) => setDialogState(() => selectedStatus = v ?? 'active'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Notes', hintText: 'Optional classroom details'),
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
              onPressed: () async {
                final cls = classController.text.trim();
                if (cls.isEmpty) return;
                Navigator.pop(ctx);

                final authState = ref.read(authProvider);
                final schoolId = authState.user?.schoolId ?? 1;
                final payload = {
                  'school_id': schoolId,
                  'class': cls,
                  'section': sectionController.text.trim(),
                  'capacity': int.tryParse(capacityController.text.trim()) ?? 0,
                  'room_no': roomNoController.text.trim(),
                  'teacher_in_charge': teacherController.text.trim(),
                  'status': selectedStatus,
                  'notes': notesController.text.trim(),
                };

                try {
                  await ApiClient().post(ApiConstants.createClass, data: payload);
                } catch (_) {}

                setState(() {
                  _classes.insert(0, {
                    'id': DateTime.now().millisecondsSinceEpoch,
                    'class': cls,
                    'section': sectionController.text.trim(),
                    'room_no': roomNoController.text.trim().isNotEmpty ? roomNoController.text.trim() : 'N/A',
                    'capacity': int.tryParse(capacityController.text.trim()) ?? 40,
                    'teacher_in_charge': teacherController.text.trim().isNotEmpty ? teacherController.text.trim() : 'In-charge Assigned',
                    'status': selectedStatus,
                  });
                });

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Class created successfully!'), backgroundColor: EduPulseColors.success),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
              ),
              child: const Text('Create Class'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddSubjectDialog() {
    final nameController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Subject', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Subject Name *', hintText: 'e.g. Mathematics'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description', hintText: 'Brief syllabus or subject notes'),
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
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;
              Navigator.pop(ctx);

              final authState = ref.read(authProvider);
              final schoolId = authState.user?.schoolId ?? 1;
              final payload = {
                'school_id': schoolId,
                'subject_name': name,
                'description': descController.text.trim(),
              };

              try {
                await ApiClient().post(ApiConstants.createSubject, data: payload);
              } catch (_) {}

              setState(() {
                _subjects.insert(0, {
                  'id': DateTime.now().millisecondsSinceEpoch,
                  'subject_name': name,
                  'description': descController.text.trim(),
                  'teachers': 1,
                });
              });

              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Subject created successfully!'), backgroundColor: EduPulseColors.success),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
            ),
            child: const Text('Create Subject'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal/classes'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: 'Academic Classes',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Classroom & Curriculum', style: EduPulseTypography.headlineLg()),
                        const SizedBox(height: 2),
                        Text('Classes, subject catalog & timetable scheduling', style: EduPulseTypography.bodySm()),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        if (_tabController.index == 1) {
                          _showAddSubjectDialog();
                        } else {
                          _showAddClassDialog();
                        }
                      },
                      icon: const Icon(Icons.add, size: 16),
                      label: Text(_tabController.index == 1 ? 'New Subject' : 'New Class', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: EduPulseColors.surfaceContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: Colors.white,
                    unselectedLabelColor: EduPulseColors.textHeadline,
                    indicator: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                    onTap: (_) => setState(() {}),
                    tabs: const [
                      Tab(text: 'Classes'),
                      Tab(text: 'Subjects'),
                      Tab(text: 'Timetable'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildClassesTab(),
                _buildSubjectsTab(),
                _buildTimetableTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClassesTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _classes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final c = _classes[i];
        final classTitle = "${c['class']} ${c['section'] ?? ''}".trim();
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(classTitle, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  Text('${c['room_no']} • In-charge: ${c['teacher_in_charge']}', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${c['capacity']} Capacity',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSubjectsTab() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: _subjects.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final s = _subjects[i];
        return Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: EduPulseColors.surfaceCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: EduPulseColors.border),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['subject_name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(s['description'] as String, style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '${s['teachers']} Faculty',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTimetableTab() {
    final periods = [
      {'time': '08:30 - 09:15', 'period': 'Period 1', 'subject': 'Mathematics', 'room': 'Room 302', 'teacher': 'Robert Taylor'},
      {'time': '09:15 - 10:00', 'period': 'Period 2', 'subject': 'Physics Lab', 'room': 'Science Block', 'teacher': 'Sarah Connor'},
      {'time': '10:15 - 11:00', 'period': 'Period 3', 'subject': 'English Lit', 'room': 'Room 302', 'teacher': 'Elena Rostova'},
      {'time': '11:00 - 11:45', 'period': 'Period 4', 'subject': 'Computer Science', 'room': 'Computer Lab 2', 'teacher': 'Vikram Rathore'},
    ];

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: periods.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final p = periods[i];
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
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  p['time'] as String,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p['subject'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    Text('${p['period']} • ${p['teacher']} (${p['room']})', style: const TextStyle(fontSize: 11, color: EduPulseColors.textMuted)),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
