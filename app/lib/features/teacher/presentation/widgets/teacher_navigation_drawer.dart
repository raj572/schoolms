import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class TeacherNavigationDrawer extends ConsumerStatefulWidget {
  final String currentRoute;

  const TeacherNavigationDrawer({
    super.key,
    required this.currentRoute,
  });

  @override
  ConsumerState<TeacherNavigationDrawer> createState() => _TeacherNavigationDrawerState();
}

class _TeacherNavigationDrawerState extends ConsumerState<TeacherNavigationDrawer> {
  final Map<String, bool> _expandedSections = {
    'attendance': false,
    'exam': false,
  };

  @override
  void initState() {
    super.initState();
    if (widget.currentRoute.startsWith('/teacher/attendance')) _expandedSections['attendance'] = true;
    if (widget.currentRoute.startsWith('/teacher/exam')) _expandedSections['exam'] = true;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Faculty Member';

    // Deep teal & emerald dark theme matching teacher web panel
    const Color drawerBg = Color(0xFF0A1918); // Deep forest teal-navy
    const Color activeBg = Color(0xFF059669); // Emerald Green highlight
    const Color textActive = Colors.white;
    const Color textInactive = Color(0xFFCBD5E1); // Light slate
    const Color dividerColor = Color(0xFF132E2B);

    return Drawer(
      backgroundColor: drawerBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: "Teacher Panel"
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: activeBg.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: activeBg.withValues(alpha: 0.4)),
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      color: Color(0xFF34D399),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Teacher Panel',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Divider(color: dividerColor, height: 1),

            // Navigation Items List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                children: [
                  // 1. Dashboard
                  _buildMenuItem(
                    icon: Icons.home_outlined,
                    label: 'Dashboard',
                    route: '/teacher',
                    isActive: widget.currentRoute == '/teacher',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 2. My Profile
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    label: 'My Profile',
                    route: '/teacher/my-profile',
                    isActive: widget.currentRoute == '/teacher/my-profile',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 3. My Classes
                  _buildMenuItem(
                    icon: Icons.meeting_room_outlined,
                    label: 'My Classes',
                    route: '/teacher/my-classes',
                    isActive: widget.currentRoute == '/teacher/my-classes',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 4. Attendance (Expandable)
                  _buildExpandableGroup(
                    keyName: 'attendance',
                    icon: Icons.check_circle_outline,
                    label: 'Attendance',
                    baseRoute: '/teacher/attendance',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.how_to_reg_outlined,
                        label: 'Mark Attendance',
                        route: '/teacher/attendance',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.fact_check_outlined,
                        label: 'View Records',
                        route: '/teacher/attendance/records',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 5. Syllabus Completion
                  _buildMenuItem(
                    icon: Icons.menu_book_outlined,
                    label: 'Syllabus Completion',
                    route: '/teacher/syllabus-completion',
                    isActive: widget.currentRoute == '/teacher/syllabus-completion',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 6. Exam (Expandable)
                  _buildExpandableGroup(
                    keyName: 'exam',
                    icon: Icons.edit_note_outlined,
                    label: 'Exam',
                    baseRoute: '/teacher/exam',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.calendar_month_outlined,
                        label: 'Schedule',
                        route: '/teacher/exam/schedule',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.grading_outlined,
                        label: 'Marks Entry',
                        route: '/teacher/exam/marks-entry',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 7. Assignments
                  _buildMenuItem(
                    icon: Icons.assignment_outlined,
                    label: 'Assignments',
                    route: '/teacher/assignments',
                    isActive: widget.currentRoute == '/teacher/assignments',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 8. Reports
                  _buildMenuItem(
                    icon: Icons.bar_chart_outlined,
                    label: 'Reports',
                    route: '/teacher/reports',
                    isActive: widget.currentRoute == '/teacher/reports',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 9. Communication
                  _buildMenuItem(
                    icon: Icons.chat_bubble_outline,
                    label: 'Communication',
                    route: '/teacher/communication',
                    isActive: widget.currentRoute == '/teacher/communication',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                ],
              ),
            ),

            const Divider(color: dividerColor, height: 1),

            // Footer: Teacher Info & Logout
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: activeBg.withValues(alpha: 0.25),
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'T',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const Text(
                          'Faculty Teacher',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.logout_rounded, color: Color(0xFFF87171), size: 20),
                    tooltip: 'Logout',
                    onPressed: () {
                      Navigator.pop(context);
                      ref.read(authProvider.notifier).logout();
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required String route,
    required bool isActive,
    required Color activeBg,
    required Color textActive,
    required Color textInactive,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: isActive ? activeBg : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: () {
            Navigator.pop(context);
            if (widget.currentRoute != route) {
              context.go(route);
            }
          },
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(
              children: [
                Icon(icon, size: 20, color: isActive ? textActive : textInactive),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isActive ? textActive : textInactive,
                      fontSize: 14,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExpandableGroup({
    required String keyName,
    required IconData icon,
    required String label,
    required String baseRoute,
    required Color activeBg,
    required Color textActive,
    required Color textInactive,
    required List<Widget> children,
  }) {
    final bool isExpanded = _expandedSections[keyName] ?? false;
    final bool isAnyChildActive = widget.currentRoute.startsWith(baseRoute);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Material(
            color: isAnyChildActive && !isExpanded ? activeBg : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            child: InkWell(
              onTap: () {
                setState(() {
                  _expandedSections[keyName] = !isExpanded;
                });
              },
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    Icon(
                      icon,
                      size: 20,
                      color: isAnyChildActive && !isExpanded ? textActive : textInactive,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        label,
                        style: TextStyle(
                          color: isAnyChildActive && !isExpanded ? textActive : textInactive,
                          fontSize: 14,
                          fontWeight: (isAnyChildActive && !isExpanded) ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                    ),
                    Icon(
                      isExpanded ? Icons.keyboard_arrow_down_rounded : Icons.chevron_right_rounded,
                      size: 18,
                      color: isAnyChildActive && !isExpanded ? textActive : textInactive,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (isExpanded)
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Column(children: children),
          ),
      ],
    );
  }

  Widget _buildSubMenuItem({
    required IconData icon,
    required String label,
    required String route,
    required Color activeBg,
    required Color textActive,
    required Color textInactive,
  }) {
    final isActive = widget.currentRoute == route;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: isActive ? activeBg : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: () {
            Navigator.pop(context);
            if (widget.currentRoute != route) {
              context.go(route);
            }
          },
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                Icon(icon, size: 16, color: isActive ? textActive : textInactive),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isActive ? textActive : textInactive,
                      fontSize: 13,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
