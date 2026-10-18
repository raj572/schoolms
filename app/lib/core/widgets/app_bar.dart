import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/controllers/auth_controller.dart';
import '../../features/student/presentation/screens/student_profile_screen.dart';
import '../../features/student/presentation/screens/student_library_screen.dart';
import '../../features/student/presentation/screens/student_messages_screen.dart';
import '../theme/colors.dart';
import '../theme/typography.dart';

class EduPulseAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final String? switcherLabel;
  final VoidCallback? onSwitcherTap;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onProfileTap;
  final bool hasUnreadNotification;
  final String? avatarUrl;
  final bool? showBackButton;
  final VoidCallback? onBackPressed;

  const EduPulseAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.switcherLabel,
    this.onSwitcherTap,
    this.onNotificationTap,
    this.onProfileTap,
    this.onBackPressed,
    this.hasUnreadNotification = true,
    this.avatarUrl,
    this.showBackButton,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canPop = showBackButton ?? (ModalRoute.of(context)?.canPop ?? false);

    return Container(
      color: EduPulseColors.surface,
      child: SafeArea(
        bottom: false,
        child: Container(
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(color: EduPulseColors.border, width: 1),
            ),
          ),
          child: Row(
            children: [
              if (canPop)
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: onBackPressed ?? () => Navigator.of(context).maybePop(),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: EduPulseColors.surfaceContainerHigh,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: EduPulseColors.border),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: EduPulseColors.textHeadline,
                        size: 18,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: EduPulseColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.school_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Learnaz',
                          style: EduPulseTypography.labelSm(
                            color: EduPulseColors.primary,
                          ),
                        ),
                        if (subtitle != null) ...[
                          const SizedBox(width: 4),
                          Text(
                            '•',
                            style: EduPulseTypography.labelSm(
                              color: EduPulseColors.textMuted,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            subtitle!,
                            style: EduPulseTypography.labelSm(
                              color: EduPulseColors.textMuted,
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (switcherLabel != null)
                      GestureDetector(
                        onTap: onSwitcherTap,
                        behavior: HitTestBehavior.opaque,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Flexible(
                              child: Text(
                                switcherLabel!,
                                style: EduPulseTypography.labelLg(
                                  color: EduPulseColors.textHeadline,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 2),
                            const Icon(
                              Icons.unfold_more,
                              size: 16,
                              color: EduPulseColors.textMuted,
                            ),
                          ],
                        ),
                      )
                    else
                      Text(
                        title,
                        style: EduPulseTypography.headlineMd(
                          color: EduPulseColors.textHeadline,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              // Notification Bell
              Stack(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.notifications_none_rounded,
                      color: EduPulseColors.textHeadline,
                      size: 24,
                    ),
                    onPressed: () {
                      if (onNotificationTap != null) {
                        onNotificationTap!();
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const StudentMessagesScreen()),
                        );
                      }
                    },
                  ),
                  if (hasUnreadNotification)
                    Positioned(
                      top: 10,
                      right: 12,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: EduPulseColors.error,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              // Profile Avatar with Status Dot
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  if (onProfileTap != null) {
                    onProfileTap!();
                  } else {
                    _showDefaultProfileBottomSheet(context, ref);
                  }
                },
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: EduPulseColors.surfaceContainerHigh,
                        shape: BoxShape.circle,
                        border: Border.all(color: EduPulseColors.primaryContainer, width: 1.5),
                        image: avatarUrl != null
                            ? DecorationImage(
                                image: NetworkImage(avatarUrl!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: avatarUrl == null
                          ? const Center(
                              child: Icon(
                                Icons.person,
                                size: 20,
                                color: EduPulseColors.primary,
                              ),
                            )
                          : null,
                    ),
                    Positioned(
                      bottom: -1,
                      right: -1,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: EduPulseColors.success,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: EduPulseColors.surfaceCard,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDefaultProfileBottomSheet(BuildContext context, WidgetRef ref) {
    final user = ref.read(authProvider).user;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Material(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(20),
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
                Container(
                  width: 46,
                  height: 46,
                  decoration: const BoxDecoration(
                    color: EduPulseColors.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.person, color: EduPulseColors.primary, size: 26),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'Alex Doe', style: EduPulseTypography.headlineMd()),
                      Text(
                        user?.email ?? '',
                        style: EduPulseTypography.bodySm(color: EduPulseColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            const Divider(),
            if (user?.role.toLowerCase() == 'parent') ...[
              ListTile(
                leading: const Icon(Icons.family_restroom, color: EduPulseColors.primary),
                title: const Text('Parent Portal Account'),
                subtitle: Text('Signed in as ${user?.fullName ?? "Parent"}', style: const TextStyle(fontSize: 12)),
              ),
            ] else ...[
              ListTile(
                leading: const Icon(Icons.person_outline_rounded, color: EduPulseColors.primary),
                title: const Text('My Profile & Records'),
                subtitle: const Text('Academic & Personal Details', style: TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.chevron_right, size: 18),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const StudentProfileScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.auto_stories_outlined, color: EduPulseColors.primary),
                title: const Text('Library & Resources'),
                subtitle: const Text('Books, Issues & Digital PDFs', style: TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.chevron_right, size: 18),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const StudentLibraryScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.chat_bubble_outline_rounded, color: EduPulseColors.primary),
                title: const Text('Campus Messages & Queries'),
                subtitle: const Text('Faculty & Admin Notices', style: TextStyle(fontSize: 12)),
                trailing: const Icon(Icons.chevron_right, size: 18),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const StudentMessagesScreen()),
                  );
                },
              ),
            ],
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: EduPulseColors.error),
              title: const Text('Sign Out of Learnaz', style: TextStyle(color: EduPulseColors.error)),
              onTap: () {
                Navigator.pop(ctx);
                ref.read(authProvider.notifier).logout();
              },
            ),
          ],
        ),
      ),
    ),
  );
  }
}
