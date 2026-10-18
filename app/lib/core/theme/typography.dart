import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class EduPulseTypography {
  static TextStyle headlineXl({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 28,
      fontWeight: FontWeight.w800,
      letterSpacing: -0.6,
      height: 1.25,
      color: color,
    );
  }

  static TextStyle headlineLg({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 22,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.3,
      height: 1.3,
      color: color,
    );
  }

  static TextStyle headlineMd({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 18,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.2,
      height: 1.35,
      color: color,
    );
  }

  static TextStyle bodyLg({Color color = EduPulseColors.textBody}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      height: 1.5,
      color: color,
    );
  }

  static TextStyle bodyMd({Color color = EduPulseColors.textBody}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      height: 1.45,
      color: color,
    );
  }

  static TextStyle bodySm({Color color = EduPulseColors.textMuted}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      height: 1.4,
      color: color,
    );
  }

  static TextStyle labelLg({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.15,
      height: 1.4,
      color: color,
    );
  }

  static TextStyle labelMd({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 12,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.25,
      height: 1.35,
      color: color,
    );
  }

  static TextStyle labelSm({Color color = EduPulseColors.textMuted}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 11,
      fontWeight: FontWeight.w700,
      letterSpacing: 0.4,
      height: 1.3,
      color: color,
    );
  }

  // Strict Tabular Numerals for GPA, Percentages, and Financial Sums
  static TextStyle tabularLg({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 20,
      fontWeight: FontWeight.w700,
      height: 1.25,
      color: color,
    );
  }

  static TextStyle tabularXl({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 28,
      fontWeight: FontWeight.w800,
      height: 1.25,
      letterSpacing: -0.6,
      color: color,
    );
  }

  static TextStyle tabularMd({Color color = EduPulseColors.textHeadline}) {
    return GoogleFonts.plusJakartaSans(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      height: 1.3,
      color: color,
    );
  }
}
