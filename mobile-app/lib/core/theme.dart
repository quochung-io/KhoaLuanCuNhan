import 'package:flutter/material.dart';

class LanhTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'sans-serif',
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF2E7D32),
        primary: const Color(0xFF2E7D32),
        secondary: const Color(0xFFFF9800),
        background: const Color(0xFFF9FBF8),
        surface: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFFF9FBF8),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFF9FBF8),
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Color(0xFF16241A),
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: IconThemeData(color: Color(0xFF16241A)),
      ),
    );
  }
}
