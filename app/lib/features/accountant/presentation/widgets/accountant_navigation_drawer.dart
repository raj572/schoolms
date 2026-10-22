import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class AccountantNavigationDrawer extends ConsumerStatefulWidget {
  final String currentRoute;

  const AccountantNavigationDrawer({
    super.key,
    required this.currentRoute,
  });

  @override
  ConsumerState<AccountantNavigationDrawer> createState() => _AccountantNavigationDrawerState();
}

class _AccountantNavigationDrawerState extends ConsumerState<AccountantNavigationDrawer> {
  bool _reportsExpanded = false;

  @override
  void initState() {
    super.initState();
    if (widget.currentRoute.startsWith('/accountant/reports')) {
      _reportsExpanded = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Accountant Office';

    // Dark theme matching the web accountant panel sidebar
    const Color drawerBg = Color(0xFF110E1B); // Deep navy-purple
    const Color activeBg = Color(0xFF8B5CF6); // Vibrant purple highlight
    const Color textActive = Colors.white;
    const Color textInactive = Color(0xFFCBD5E1); // Light slate
    const Color dividerColor = Color(0xFF26213B);

    return Drawer(
      backgroundColor: drawerBg,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: "Accountant Panel"
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
                      Icons.account_balance_wallet_rounded,
                      color: activeBg,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Accountant Panel',
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
                  _buildMenuItem(
                    icon: Icons.home_outlined,
                    label: 'Dashboard',
                    route: '/accountant',
                    isActive: widget.currentRoute == '/accountant',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.credit_card_outlined,
                    label: 'Fees',
                    route: '/accountant/fees',
                    isActive: widget.currentRoute == '/accountant/fees',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.receipt_long_outlined,
                    label: 'Fees Structure',
                    route: '/accountant/fees-structure',
                    isActive: widget.currentRoute == '/accountant/fees-structure',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.receipt_outlined,
                    label: 'Monthly Dues',
                    route: '/accountant/monthly-dues',
                    isActive: widget.currentRoute == '/accountant/monthly-dues',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'Annual Payments',
                    route: '/accountant/annual-payments',
                    isActive: widget.currentRoute == '/accountant/annual-payments',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.local_offer_outlined,
                    label: 'Service Charges',
                    route: '/accountant/service-charges',
                    isActive: widget.currentRoute == '/accountant/service-charges',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.payments_outlined,
                    label: 'Payments',
                    route: '/accountant/payments',
                    isActive: widget.currentRoute == '/accountant/payments',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                  _buildMenuItem(
                    icon: Icons.extension_outlined,
                    label: 'Extra Services',
                    route: '/accountant/extra-services',
                    isActive: widget.currentRoute == '/accountant/extra-services',
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),

                  // Reports Expandable Section
                  _buildReportsGroup(
                    activeBg: activeBg,
                    textActive: textActive,
                    textInactive: textInactive,
                  ),
                ],
              ),
            ),

            const Divider(color: dividerColor, height: 1),

            // User Info & Sign Out Footer
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: activeBg.withValues(alpha: 0.25),
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : 'A',
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
                          'Accountant',
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
            Navigator.pop(context); // Close drawer
            if (widget.currentRoute != route) {
              context.go(route);
            }
          },
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: isActive ? textActive : textInactive,
                ),
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

  Widget _buildReportsGroup({
    required Color activeBg,
    required Color textActive,
    required Color textInactive,
  }) {
    final bool isAnyReportActive = widget.currentRoute.startsWith('/accountant/reports');

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Material(
            color: isAnyReportActive && !_reportsExpanded ? activeBg : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            child: InkWell(
              onTap: () {
                setState(() {
                  _reportsExpanded = !_reportsExpanded;
                });
              },
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                child: Row(
                  children: [
                    Icon(
                      Icons.bar_chart_outlined,
                      size: 20,
                      color: isAnyReportActive && !_reportsExpanded ? textActive : textInactive,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Reports',
                        style: TextStyle(
                          color: isAnyReportActive && !_reportsExpanded ? textActive : textInactive,
                          fontSize: 14,
                          fontWeight: (isAnyReportActive && !_reportsExpanded) ? FontWeight.w600 : FontWeight.w500,
                        ),
                      ),
                    ),
                    Icon(
                      _reportsExpanded ? Icons.keyboard_arrow_down_rounded : Icons.chevron_right_rounded,
                      size: 18,
                      color: isAnyReportActive && !_reportsExpanded ? textActive : textInactive,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (_reportsExpanded) ...[
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Column(
              children: [
                _buildSubMenuItem(
                  icon: Icons.receipt_outlined,
                  label: 'Fee Reports',
                  route: '/accountant/reports/fee',
                  isActive: widget.currentRoute == '/accountant/reports/fee' || widget.currentRoute == '/accountant/reports',
                  activeBg: activeBg,
                  textActive: textActive,
                  textInactive: textInactive,
                ),
                _buildSubMenuItem(
                  icon: Icons.pending_actions_outlined,
                  label: 'Dues Pending',
                  route: '/accountant/reports/dues-pending',
                  isActive: widget.currentRoute == '/accountant/reports/dues-pending',
                  activeBg: activeBg,
                  textActive: textActive,
                  textInactive: textInactive,
                ),
                _buildSubMenuItem(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'Transactions',
                  route: '/accountant/reports/transactions',
                  isActive: widget.currentRoute == '/accountant/reports/transactions',
                  activeBg: activeBg,
                  textActive: textActive,
                  textInactive: textInactive,
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSubMenuItem({
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
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 16,
                  color: isActive ? textActive : textInactive,
                ),
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
