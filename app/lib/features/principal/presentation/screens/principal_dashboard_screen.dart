import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/theme/typography.dart';
import '../../../../core/widgets/app_bar.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../widgets/principal_navigation_drawer.dart';

class PrincipalDashboardScreen extends ConsumerStatefulWidget {
  const PrincipalDashboardScreen({super.key});

  @override
  ConsumerState<PrincipalDashboardScreen> createState() => _PrincipalDashboardScreenState();
}

class _PrincipalDashboardScreenState extends ConsumerState<PrincipalDashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName.isNotEmpty == true ? user!.fullName : 'Dr. Eleanor Vance';

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EduPulseColors.surface,
      drawer: const PrincipalNavigationDrawer(currentRoute: '/principal'),
      appBar: EduPulseAppBar(
        title: 'Learnaz',
        subtitle: 'Principal',
        switcherLabel: '$name (Head of School)',
        onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
        onProfileTap: () => ref.read(authProvider.notifier).logout(),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Executive Welcome
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Executive Overview', style: EduPulseTypography.headlineLg()),
                    const SizedBox(height: 2),
                    Text('Campus Operational Status • Academic Session 2026', style: EduPulseTypography.bodySm()),
                  ],
                ),
                OutlinedButton.icon(
                  onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                  icon: const Icon(Icons.menu_open_rounded, size: 18),
                  label: const Text('All Menus', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    minimumSize: const Size(80, 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 4 Executive KPI Cards
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.45,
              children: [
                _buildKpiCard('Total Enrolled', '1,240', 'Students Active', Icons.groups, const Color(0xFF2563EB)),
                _buildKpiCard('Faculty on Duty', '68 / 72', '94.4% Present', Icons.badge, EduPulseColors.success),
                _buildKpiCard('Daily Attendance', '96.2%', '1,193 Campus Rate', Icons.fact_check, EduPulseColors.success),
                _buildKpiCard('Fee Collections', '₹1,48,500', '84% Collected', Icons.payments, const Color(0xFF7C3AED)),
              ],
            ),
            const SizedBox(height: 20),

            // All Principal Panel Modules (Matching Sidebar Menus)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Campus Operations & Modules', style: EduPulseTypography.headlineMd()),
                Text('14 Services', style: EduPulseTypography.labelSm(color: EduPulseColors.textMuted)),
              ],
            ),
            const SizedBox(height: 12),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                _buildModuleCard(title: 'Users', subtitle: 'Staff accounts & roles', icon: Icons.people_outline, color: const Color(0xFF2563EB), route: '/principal/users'),
                _buildModuleCard(title: 'Students', subtitle: 'Directory & services', icon: Icons.badge_outlined, color: const Color(0xFF059669), route: '/principal/students'),
                _buildModuleCard(title: 'Teachers', subtitle: 'Faculty on duty', icon: Icons.school_outlined, color: const Color(0xFF7C3AED), route: '/principal/teachers'),
                _buildModuleCard(title: 'Classes', subtitle: 'Timetables & subjects', icon: Icons.meeting_room_outlined, color: const Color(0xFF0891B2), route: '/principal/classes'),
                _buildModuleCard(title: 'Exam', subtitle: 'Grading & schedules', icon: Icons.edit_note_outlined, color: const Color(0xFFD97706), route: '/principal/exam'),
                _buildModuleCard(title: 'Attendance', subtitle: 'Daily check-in stats', icon: Icons.fact_check_outlined, color: const Color(0xFF10B981), route: '/principal/attendance'),
                _buildModuleCard(title: 'Library', subtitle: '1,420 Volumes & issues', icon: Icons.local_library_outlined, color: const Color(0xFF4F46E5), route: '/principal/library'),
                _buildModuleCard(title: 'Transport', subtitle: '12 Buses GPS online', icon: Icons.directions_bus_outlined, color: const Color(0xFFEA580C), route: '/principal/transport'),
                _buildModuleCard(title: 'Hostel', subtitle: 'Residential boarding', icon: Icons.hotel_outlined, color: const Color(0xFF0D9488), route: '/principal/hostel'),
                _buildModuleCard(title: 'Wardens', subtitle: 'Hostel superintendents', icon: Icons.shield_outlined, color: const Color(0xFF6366F1), route: '/principal/wardens'),
                _buildModuleCard(title: 'Communication', subtitle: 'Campus broadcasts', icon: Icons.campaign_outlined, color: const Color(0xFFEC4899), route: '/principal/communication'),
                _buildModuleCard(title: 'Documents', subtitle: 'Accreditation vault', icon: Icons.description_outlined, color: const Color(0xFF64748B), route: '/principal/documents'),
                _buildModuleCard(title: 'Reports', subtitle: 'Institutional analytics', icon: Icons.bar_chart_outlined, color: const Color(0xFF8B5CF6), route: '/principal/reports'),
                _buildModuleCard(title: 'Settings', subtitle: 'Security & branding', icon: Icons.settings_outlined, color: const Color(0xFF334155), route: '/principal/settings'),
              ],
            ),
            const SizedBox(height: 24),

            // Operations Quick Links
            Text('Campus Operational Highlights', style: EduPulseTypography.headlineMd()),
            const SizedBox(height: 12),
            _buildActionTile(Icons.directions_bus, 'Transport Fleet', '12 Buses active • All GPS online', 'View Fleet', () => context.go('/principal/transport')),
            const SizedBox(height: 10),
            _buildActionTile(Icons.hotel, 'Hostel & Residential', '88% Occupancy • 3 Buildings', 'Manage', () => context.go('/principal/hostel')),
            const SizedBox(height: 10),
            _buildActionTile(Icons.local_library, 'Library Services', '1,420 Volumes • 18 Overdue', 'Inspect', () => context.go('/principal/library')),
            const SizedBox(height: 10),
            _buildActionTile(Icons.assignment, 'Academic Exams', 'Mid-Term Exam schedules published', 'Review', () => context.go('/principal/exam')),
            const SizedBox(height: 20),

            // Broadcast Announcement CTA
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.campaign, color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Campus Broadcast', style: EduPulseTypography.labelLg(color: Colors.white)),
                        Text('Dispatch urgent notice or push alert to staff & parents', style: EduPulseTypography.bodySm(color: Colors.white.withValues(alpha: 0.85))),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => context.go('/principal/communication'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF2563EB)),
                    child: const Text('Compose'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return Material(
      color: EduPulseColors.surfaceCard,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: () => context.go(route),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
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
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: color, size: 18),
                  ),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: EduPulseColors.textMuted),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: EduPulseColors.textHeadline),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10, color: EduPulseColors.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKpiCard(String label, String value, String subtitle, IconData icon, Color color) {
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
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: EduPulseTypography.tabularLg()),
          Text(subtitle, style: EduPulseTypography.labelSm(color: color)),
        ],
      ),
    );
  }

  Widget _buildActionTile(IconData icon, String title, String subtitle, String action, VoidCallback onTap) {
    return Container(
      padding: const EdgeInsets.all(12),
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
              color: EduPulseColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: const Color(0xFF2563EB), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: EduPulseTypography.labelMd()),
                Text(subtitle, style: EduPulseTypography.bodySm()),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: onTap,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(60, 30),
              padding: const EdgeInsets.symmetric(horizontal: 10),
            ),
            child: Text(action, style: const TextStyle(fontSize: 11)),
          ),
        ],
      ),
    );
  }
}
