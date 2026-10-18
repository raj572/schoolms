import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/colors.dart';
import '../theme/typography.dart';

class CircularProgressRing extends StatelessWidget {
  final double percentage; // 0.0 to 100.0
  final double size;
  final double strokeWidth;
  final Color progressColor;
  final Color trackColor;
  final String? centerPrimaryText;
  final String? centerSecondaryText;

  const CircularProgressRing({
    super.key,
    required this.percentage,
    this.size = 110,
    this.strokeWidth = 10,
    this.progressColor = EduPulseColors.primary,
    this.trackColor = EduPulseColors.surfaceContainer,
    this.centerPrimaryText,
    this.centerSecondaryText,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _RingPainter(
              percentage: percentage,
              strokeWidth: strokeWidth,
              progressColor: progressColor,
              trackColor: trackColor,
            ),
          ),
          if (centerPrimaryText != null || centerSecondaryText != null)
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (centerPrimaryText != null)
                  Text(
                    centerPrimaryText!,
                    style: EduPulseTypography.tabularLg(
                      color: EduPulseColors.textHeadline,
                    ),
                  ),
                if (centerSecondaryText != null)
                  Text(
                    centerSecondaryText!,
                    style: EduPulseTypography.labelSm(
                      color: EduPulseColors.textMuted,
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double percentage;
  final double strokeWidth;
  final Color progressColor;
  final Color trackColor;

  _RingPainter({
    required this.percentage,
    required this.strokeWidth,
    required this.progressColor,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Track Paint
    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius, trackPaint);

    // Progress Paint
    final progressPaint = Paint()
      ..color = progressColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * pi * (percentage.clamp(0.0, 100.0) / 100);
    // Start from 12 o'clock (-pi / 2)
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _RingPainter oldDelegate) {
    return oldDelegate.percentage != percentage ||
        oldDelegate.progressColor != progressColor ||
        oldDelegate.trackColor != trackColor;
  }
}
