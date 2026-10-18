import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class EduPulseTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: EduPulseColors.primary,
      scaffoldBackgroundColor: EduPulseColors.background,
      fontFamily: GoogleFonts.plusJakartaSans().fontFamily,
      
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: EduPulseColors.primary,
        onPrimary: EduPulseColors.onPrimary,
        primaryContainer: EduPulseColors.primaryContainer,
        onPrimaryContainer: EduPulseColors.onPrimaryContainer,
        secondary: EduPulseColors.secondary,
        onSecondary: EduPulseColors.onSecondary,
        secondaryContainer: EduPulseColors.secondaryContainer,
        onSecondaryContainer: EduPulseColors.onSecondaryContainer,
        error: EduPulseColors.error,
        onError: EduPulseColors.onError,
        errorContainer: EduPulseColors.errorContainer,
        onErrorContainer: EduPulseColors.onErrorContainer,
        surface: EduPulseColors.surface,
        onSurface: EduPulseColors.textHeadline,
        surfaceContainerLowest: EduPulseColors.surfaceCard,
        surfaceContainerLow: EduPulseColors.surfaceContainerLow,
        surfaceContainer: EduPulseColors.surfaceContainer,
        surfaceContainerHigh: EduPulseColors.surfaceContainerHigh,
        surfaceContainerHighest: EduPulseColors.surfaceContainerHighest,
        outline: EduPulseColors.outline,
        outlineVariant: EduPulseColors.border,
      ),

      // App Bar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: EduPulseColors.surface,
        foregroundColor: EduPulseColors.textHeadline,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
      ),

      // Card Theme
      cardTheme: CardThemeData(
        color: EduPulseColors.surfaceCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: EduPulseColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: EduPulseColors.primary,
          foregroundColor: EduPulseColors.onPrimary,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: EduPulseColors.textHeadline,
          side: const BorderSide(color: EduPulseColors.border, width: 1.5),
          minimumSize: const Size(double.infinity, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: EduPulseColors.surfaceCard,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: EduPulseColors.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: EduPulseColors.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: EduPulseColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: EduPulseColors.error, width: 1),
        ),
        hintStyle: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          color: EduPulseColors.textPlaceholder,
        ),
        labelStyle: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: EduPulseColors.textMuted,
        ),
      ),

      // Bottom Navigation Bar Theme
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: EduPulseColors.surfaceCard,
        selectedItemColor: EduPulseColors.primary,
        unselectedItemColor: EduPulseColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // Divider Theme
      dividerTheme: const DividerThemeData(
        color: EduPulseColors.border,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
