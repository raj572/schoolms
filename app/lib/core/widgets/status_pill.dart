import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../theme/typography.dart';

enum PillVariant {
  success,
  warning,
  error,
  info,
  tardy,
  excused,
  neutral,
}

class StatusPill extends StatelessWidget {
  final String label;
  final PillVariant variant;
  final IconData? icon;
  final bool showDot;

  const StatusPill({
    super.key,
    required this.label,
    this.variant = PillVariant.info,
    this.icon,
    this.showDot = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color dotColor;

    switch (variant) {
      case PillVariant.success:
        bg = EduPulseColors.successContainer;
        fg = EduPulseColors.onSuccessContainer;
        dotColor = EduPulseColors.success;
        break;
      case PillVariant.warning:
        bg = EduPulseColors.warningContainer;
        fg = EduPulseColors.onWarningContainer;
        dotColor = EduPulseColors.warning;
        break;
      case PillVariant.error:
        bg = EduPulseColors.errorContainer;
        fg = EduPulseColors.onErrorContainer;
        dotColor = EduPulseColors.error;
        break;
      case PillVariant.tardy:
        bg = EduPulseColors.badgeTardyBg;
        fg = EduPulseColors.badgeTardyText;
        dotColor = EduPulseColors.badgeTardyText;
        break;
      case PillVariant.excused:
        bg = EduPulseColors.badgeExcusedBg;
        fg = EduPulseColors.badgeExcusedText;
        dotColor = EduPulseColors.badgeExcusedText;
        break;
      case PillVariant.info:
        bg = EduPulseColors.surfaceContainerHigh;
        fg = EduPulseColors.primary;
        dotColor = EduPulseColors.primary;
        break;
      case PillVariant.neutral:
        bg = EduPulseColors.borderLight;
        fg = EduPulseColors.textMuted;
        dotColor = EduPulseColors.textMuted;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
          ],
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 3),
          ],
          Flexible(
            child: Text(
              label,
              style: EduPulseTypography.labelSm(color: fg),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ),
        ],
      ),
    );
  }
}
