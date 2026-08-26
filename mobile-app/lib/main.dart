import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'presentation/screens/main_container.dart';

void main() {
  runApp(const LanhApp());
}

class LanhApp extends StatelessWidget {
  const LanhApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LÀNH - Nông sản hữu cơ',
      debugShowCheckedModeBanner: false,
      theme: LanhTheme.lightTheme,
      home: const MainContainer(),
    );
  }
}
