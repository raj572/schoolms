import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../theme/typography.dart';
import 'status_pill.dart';

class MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final Widget? trailingIcon;
  final String? badgeText;
  final PillVariant badgeVariant;
  final IconData? badgeIcon;

  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    this.trailingIcon,
    this.badgeText,
    this.badgeVariant = PillVariant.info,
    this.badgeIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: EduPulseColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: EduPulseColors.border, width: 1),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(30, 41, 59, 0.04),
            blurRadius: 3,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: EduPulseTypography.labelSm(
                    color: EduPulseColors.textMuted,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (trailingIcon != null) trailingIcon!,
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: EduPulseTypography.tabularLg(
              color: EduPulseColors.textHeadline,
            ),
          ),
          const SizedBox(height: 6),
          if (badgeText != null)
            StatusPill(
              label: badgeText!,
              variant: badgeVariant,
              icon: badgeIcon,
            ),
        ],
      ),
    );
  }
}
