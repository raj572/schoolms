import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../screens/student_shell_screen.dart';

class StudentNavigationDrawer extends ConsumerStatefulWidget {
  final String currentRoute;

  const StudentNavigationDrawer({
    super.key,
    required this.currentRoute,
  });

  @override
  ConsumerState<StudentNavigationDrawer> createState() => _StudentNavigationDrawerState();
}

class _StudentNavigationDrawerState extends ConsumerState<StudentNavigationDrawer> {
  final Map<String, bool> _expandedSections = {
    'exams': false,
    'fees': false,
  };

  @override
  void initState() {
    super.initState();
    if (widget.currentRoute.startsWith('/student/exams')) _expandedSections['exams'] = true;
    if (widget.currentRoute.startsWith('/student/fees')) _expandedSections['fees'] = true;
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Alex Doe';

    // Deep Indigo & Sapphire dark theme matching the Student web portal
    const Color drawerBg = Color(0xFF0F172A); // Slate 900
    const Color activeBg = Color(0xFF2563EB); // Royal Blue / Primary
    const Color textActive = Colors.white;
    const Color textInactive = Color(0xFF94A3B8); // Slate 400
    const Color dividerColor = Color(0xFF1E293B);

    return Drawer(
      backgroundColor: drawerBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Student Portal
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: activeBg.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: activeBg.withValues(alpha: 0.4)),
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      color: Color(0xFF60A5FA),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'STUDENT PORTAL',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(color: dividerColor, height: 1),

            // Scrollable Navigation Items
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                children: [
                  // 1. Dashboard
                  _buildNavItem(
                    title: 'Dashboard',
                    icon: Icons.dashboard_outlined,
                    activeIcon: Icons.dashboard_rounded,
                    route: '/student/dashboard',
                    isSelected: widget.currentRoute == '/student' ||
                        widget.currentRoute == '/student/dashboard',
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onTap: () {
                      ref.read(studentTabProvider.notifier).state = 0;
                      context.go('/student/dashboard');
                    },
                  ),
                  const SizedBox(height: 4),

                  // 2. My Profile
                  _buildNavItem(
                    title: 'My Profile',
                    icon: Icons.person_outline,
                    activeIcon: Icons.person,
                    route: '/student/profile',
                    isSelected: widget.currentRoute == '/student/profile',
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onTap: () => context.go('/student/profile'),
                  ),
                  const SizedBox(height: 4),

                  // 3. Attendance
                  _buildNavItem(
                    title: 'Attendance',
                    icon: Icons.fact_check_outlined,
                    activeIcon: Icons.fact_check,
                    route: '/student/attendance',
                    isSelected: widget.currentRoute == '/student/attendance',
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onTap: () {
                      ref.read(studentTabProvider.notifier).state = 3;
                      context.go('/student/attendance');
                    },
                  ),
                  const SizedBox(height: 4),

                  // 4. Exams (Expandable Submenu)
                  _buildExpandableNavItem(
                    title: 'Exams',
                    icon: Icons.bar_chart_outlined,
                    activeIcon: Icons.bar_chart,
                    isExpanded: _expandedSections['exams'] ?? false,
                    isParentActive: widget.currentRoute.startsWith('/student/exams'),
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onToggle: () {
                      setState(() {
                        _expandedSections['exams'] = !(_expandedSections['exams'] ?? false);
                      });
                    },
                    subItems: [
                      _buildSubNavItem(
                        title: 'Overview & Schedule',
                        route: '/student/exams',
                        isSelected: widget.currentRoute == '/student/exams',
                        activeColor: activeBg,
                        onTap: () {
                          ref.read(studentTabProvider.notifier).state = 2;
                          context.go('/student/exams');
                        },
                      ),
                      _buildSubNavItem(
                        title: 'Results',
                        route: '/student/exams/result',
                        isSelected: widget.currentRoute == '/student/exams/result',
                        activeColor: activeBg,
                        onTap: () {
                          ref.read(studentTabProvider.notifier).state = 2;
                          context.go('/student/exams/result');
                        },
                      ),
                      _buildSubNavItem(
                        title: 'Reports Cards',
                        route: '/student/exams/reports-cards',
                        isSelected: widget.currentRoute == '/student/exams/reports-cards',
                        activeColor: activeBg,
                        onTap: () {
                          ref.read(studentTabProvider.notifier).state = 2;
                          context.go('/student/exams/reports-cards');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // 5. Fees (Expandable Submenu)
                  _buildExpandableNavItem(
                    title: 'Fees',
                    icon: Icons.account_balance_wallet_outlined,
                    activeIcon: Icons.account_balance_wallet,
                    isExpanded: _expandedSections['fees'] ?? false,
                    isParentActive: widget.currentRoute.startsWith('/student/fees'),
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onToggle: () {
                      setState(() {
                        _expandedSections['fees'] = !(_expandedSections['fees'] ?? false);
                      });
                    },
                    subItems: [
                      _buildSubNavItem(
                        title: 'Dues',
                        route: '/student/fees/due',
                        isSelected: widget.currentRoute == '/student/fees' ||
                            widget.currentRoute == '/student/fees/due',
                        activeColor: activeBg,
                        onTap: () {
                          ref.read(studentTabProvider.notifier).state = 4;
                          context.go('/student/fees/due');
                        },
                      ),
                      _buildSubNavItem(
                        title: 'Payments History',
                        route: '/student/fees/payments-history',
                        isSelected: widget.currentRoute == '/student/fees/payments-history',
                        activeColor: activeBg,
                        onTap: () {
                          ref.read(studentTabProvider.notifier).state = 4;
                          context.go('/student/fees/payments-history');
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // 6. Library
                  _buildNavItem(
                    title: 'Library',
                    icon: Icons.book_outlined,
                    activeIcon: Icons.book,
                    route: '/student/library',
                    isSelected: widget.currentRoute == '/student/library',
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onTap: () => context.go('/student/library'),
                  ),
                  const SizedBox(height: 4),

                  // 7. Messages
                  _buildNavItem(
                    title: 'Messages',
                    icon: Icons.message_outlined,
                    activeIcon: Icons.message,
                    route: '/student/messages',
                    isSelected: widget.currentRoute == '/student/messages',
                    activeColor: activeBg,
                    textColor: textInactive,
                    activeTextColor: textActive,
                    onTap: () => context.go('/student/messages'),
                  ),
                ],
              ),
            ),

            const Divider(color: dividerColor, height: 1),

            // Profile info footer
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: activeBg,
                      child: Text(
                        userName.isNotEmpty ? userName[0].toUpperCase() : 'S',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
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
                            'Active Student • Session 2026',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, size: 18, color: Color(0xFF94A3B8)),
                      onPressed: () {
                        Navigator.pop(context); // Close drawer
                        ref.read(authProvider.notifier).logout();
                      },
                      tooltip: 'Logout',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required String title,
    required IconData icon,
    required IconData activeIcon,
    required String route,
    required bool isSelected,
    required Color activeColor,
    required Color textColor,
    required Color activeTextColor,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isSelected ? activeColor : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        leading: Icon(
          isSelected ? activeIcon : icon,
          color: isSelected ? activeTextColor : textColor,
          size: 20,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? activeTextColor : textColor,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 13,
          ),
        ),
        onTap: () {
          Navigator.pop(context); // Close drawer
          onTap();
        },
      ),
    );
  }

  Widget _buildExpandableNavItem({
    required String title,
    required IconData icon,
    required IconData activeIcon,
    required bool isExpanded,
    required bool isParentActive,
    required Color activeColor,
    required Color textColor,
    required Color activeTextColor,
    required VoidCallback onToggle,
    required List<Widget> subItems,
  }) {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: isParentActive ? activeColor.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: ListTile(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
            leading: Icon(
              isParentActive ? activeIcon : icon,
              color: isParentActive ? const Color(0xFF60A5FA) : textColor,
              size: 20,
            ),
            title: Text(
              title,
              style: TextStyle(
                color: isParentActive ? Colors.white : textColor,
                fontWeight: isParentActive ? FontWeight.w700 : FontWeight.w500,
                fontSize: 13,
              ),
            ),
            trailing: Icon(
              isExpanded ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_right,
              color: const Color(0xFF94A3B8),
              size: 18,
            ),
            onTap: onToggle,
          ),
        ),
        if (isExpanded)
          Padding(
            padding: const EdgeInsets.only(left: 18, top: 4, bottom: 4),
            child: Container(
              decoration: const BoxDecoration(
                border: Border(
                  left: BorderSide(color: Color(0xFF334155), width: 1.5),
                ),
              ),
              child: Column(children: subItems),
            ),
          ),
      ],
    );
  }

  Widget _buildSubNavItem({
    required String title,
    required String route,
    required bool isSelected,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(left: 10, top: 2, bottom: 2),
      decoration: BoxDecoration(
        color: isSelected ? activeColor : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
        leading: Icon(
          Icons.subdirectory_arrow_right,
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
          size: 15,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            fontSize: 12,
          ),
        ),
        onTap: () {
          Navigator.pop(context); // Close drawer
          onTap();
        },
      ),
    );
  }
}
