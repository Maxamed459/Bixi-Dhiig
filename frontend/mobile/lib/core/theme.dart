import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFD7263D);
  static const Color primaryDark = Color(0xFF8E1226);
  static const Color ink = Color(0xFF14161D);
  static const Color surface = Color(0xFFF5F5F7);
  static const Color darkBg = Color(0xFF0E1015);
  static const Color darkCard = Color(0xFF1C1F27);

  static const Color normal = Color(0xFF2E7D6B);
  static const Color urgent = Color(0xFFE08A00);
  static const Color critical = Color(0xFFD7263D);
}

bool isDark(BuildContext context) => Theme.of(context).brightness == Brightness.dark;

class AppTheme {
  static ThemeData light() => _build(Brightness.light);
  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
    ).copyWith(primary: AppColors.primary, onPrimary: Colors.white);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: dark ? AppColors.darkBg : AppColors.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: dark ? AppColors.darkBg : AppColors.surface,
        foregroundColor: dark ? Colors.white : AppColors.ink,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: dark ? AppColors.darkCard : Colors.white,
        indicatorColor: AppColors.primary.withValues(alpha: 0.14),
      ),
    );
  }
}
