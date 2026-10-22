import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class PrincipalNavigationDrawer extends ConsumerStatefulWidget {
  final String currentRoute;

  const PrincipalNavigationDrawer({
    super.key,
    required this.currentRoute,
  });

  @override
  ConsumerState<PrincipalNavigationDrawer> createState() => _PrincipalNavigationDrawerState();
}

class _PrincipalNavigationDrawerState extends ConsumerState<PrincipalNavigationDrawer> {
  final Map<String, bool> _expandedSections = {
    'users': false,
    'students': false,
    'teachers': false,
    'classes': false,
    'attendance': false,
    'reports': false,
    'settings': false,
  };

  @override
  void initState() {
    super.initState();
    if (widget.currentRoute.startsWith('/principal/users')) _expandedSections['users'] = true;
    if (widget.currentRoute.startsWith('/principal/students')) _expandedSections['students'] = true;
    if (widget.currentRoute.startsWith('/principal/teachers')) _expandedSections['teachers'] = true;
    if (widget.currentRoute.startsWith('/principal/classes')) _expandedSections['classes'] = true;
    if (widget.currentRoute.startsWith('/principal/attendance')) _expandedSections['attendance'] = true;
    if (widget.currentRoute.startsWith('/principal/reports')) _expandedSections['reports'] = true;
    if (widget.currentRoute.startsWith('/principal/settings')) _expandedSections['settings'] = true;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Dr. Eleanor Vance';

    // Dark sleek sidebar theme matching the web panel
    const Color drawerBg = Color(0xFF0F172A); // Deep slate navy
    const Color activeBg = Color(0xFF2563EB); // Royal Blue highlight
    const Color textActive = Colors.white;
    const Color textInactive = Color(0xFFCBD5E1); // Light slate
    const Color dividerColor = Color(0xFF1E293B);

    return Drawer(
      backgroundColor: drawerBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: "Principal Panel"
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
                      Icons.account_balance_rounded,
                      color: Color(0xFF60A5FA),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Principal Panel',
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
                    route: '/principal',
                    isActive: widget.currentRoute == '/principal',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 2. Users (Expandable)
                  _buildExpandableGroup(
                    keyName: 'users',
                    icon: Icons.people_outline,
                    label: 'Users',
                    baseRoute: '/principal/users',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.person_add_outlined,
                        label: 'Register User',
                        route: '/principal/users/register',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.list_alt_outlined,
                        label: 'User List',
                        route: '/principal/users/list',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 3. Students (Expandable)
                  _buildExpandableGroup(
                    keyName: 'students',
                    icon: Icons.badge_outlined,
                    label: 'Students',
                    baseRoute: '/principal/students',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.person_add_outlined,
                        label: 'Register Student',
                        route: '/principal/students/register',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.list_alt_outlined,
                        label: 'Student Directory',
                        route: '/principal/students/list',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.analytics_outlined,
                        label: 'Attendance Analytics',
                        route: '/principal/students/attendance',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.volunteer_activism_outlined,
                        label: 'Services',
                        route: '/principal/students/services',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 4. Teachers (Expandable)
                  _buildExpandableGroup(
                    keyName: 'teachers',
                    icon: Icons.school_outlined,
                    label: 'Teachers',
                    baseRoute: '/principal/teachers',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.person_add_outlined,
                        label: 'Register Teacher',
                        route: '/principal/teachers/register',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.list_alt_outlined,
                        label: 'Faculty List',
                        route: '/principal/teachers/list',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 5. Classes (Expandable)
                  _buildExpandableGroup(
                    keyName: 'classes',
                    icon: Icons.meeting_room_outlined,
                    label: 'Classes',
                    baseRoute: '/principal/classes',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.list_alt_outlined,
                        label: 'Class List',
                        route: '/principal/classes/list',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.book_outlined,
                        label: 'Subjects',
                        route: '/principal/classes/subjects',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.calendar_month_outlined,
                        label: 'Timetable',
                        route: '/principal/classes/timetable',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 6. Exam
                  _buildMenuItem(
                    icon: Icons.edit_note_outlined,
                    label: 'Exam',
                    route: '/principal/exam',
                    isActive: widget.currentRoute == '/principal/exam',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 7. Attendance (Expandable)
                  _buildExpandableGroup(
                    keyName: 'attendance',
                    icon: Icons.fact_check_outlined,
                    label: 'Attendance',
                    baseRoute: '/principal/attendance',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.how_to_reg_outlined,
                        label: 'Teacher Attendance',
                        route: '/principal/attendance/teachers',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.insights_outlined,
                        label: 'Analytics Dashboard',
                        route: '/principal/attendance/dashboard',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 8. Library
                  _buildMenuItem(
                    icon: Icons.local_library_outlined,
                    label: 'Library',
                    route: '/principal/library',
                    isActive: widget.currentRoute == '/principal/library',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 9. Transport
                  _buildMenuItem(
                    icon: Icons.directions_bus_outlined,
                    label: 'Transport',
                    route: '/principal/transport',
                    isActive: widget.currentRoute == '/principal/transport',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 10. Hostel
                  _buildMenuItem(
                    icon: Icons.hotel_outlined,
                    label: 'Hostel',
                    route: '/principal/hostel',
                    isActive: widget.currentRoute == '/principal/hostel',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 11. Wardens
                  _buildMenuItem(
                    icon: Icons.shield_outlined,
                    label: 'Wardens',
                    route: '/principal/wardens',
                    isActive: widget.currentRoute == '/principal/wardens',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 12. Communication
                  _buildMenuItem(
                    icon: Icons.chat_bubble_outline,
                    label: 'Communication',
                    route: '/principal/communication',
                    isActive: widget.currentRoute == '/principal/communication',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 13. Documents
                  _buildMenuItem(
                    icon: Icons.description_outlined,
                    label: 'Documents',
                    route: '/principal/documents',
                    isActive: widget.currentRoute == '/principal/documents',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // 14. Reports (Expandable)
                  _buildExpandableGroup(
                    keyName: 'reports',
                    icon: Icons.bar_chart_outlined,
                    label: 'Reports',
                    baseRoute: '/principal/reports',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.school_outlined,
                        label: 'Student Reports',
                        route: '/principal/reports/student',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.payments_outlined,
                        label: 'Fee Reports',
                        route: '/principal/reports/fee',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.access_time_outlined,
                        label: 'Attendance Reports',
                        route: '/principal/reports/attendance',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.assignment_outlined,
                        label: 'Exam Reports',
                        route: '/principal/reports/exams',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.menu_book_outlined,
                        label: 'Syllabus Overview',
                        route: '/principal/reports/syllabus-overview',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),

                  // 15. Settings (Expandable)
                  _buildExpandableGroup(
                    keyName: 'settings',
                    icon: Icons.settings_outlined,
                    label: 'Settings',
                    baseRoute: '/principal/settings',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                    children: [
                      _buildSubMenuItem(
                        icon: Icons.manage_accounts_outlined,
                        label: 'User Management',
                        route: '/principal/settings/user-management',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.security_outlined,
                        label: 'Roles & Permissions',
                        route: '/principal/settings/roles',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                      _buildSubMenuItem(
                        icon: Icons.info_outline,
                        label: 'School Info',
                        route: '/principal/settings/school-info',
                        activeBg: activeBg,
                        textActive: textActive,
                        textInactive: textInactive,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Divider(color: dividerColor, height: 1),

            // Footer: Principal Info & Sign Out
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: activeBg.withValues(alpha: 0.25),
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'P',
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
                          'Head of School',
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
