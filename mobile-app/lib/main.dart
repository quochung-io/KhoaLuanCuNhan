// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/main.dart
// MÔ TẢ: Tệp mã nguồn main.dart thuộc hệ thống Thương mại điện tử Nông sản sạch LÀNH Farm.
// ============================================================================
import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/localization_service.dart';
import 'presentation/screens/auth/login_screen.dart';

// Thực thi nghiệp vụ hàm main
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalizationService.instance.init();
  runApp(const LanhApp());
}

/// Lớp giao diện / trạng thái LanhApp
class LanhApp extends StatelessWidget {
  const LanhApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: LocalizationService.instance,
      builder: (context, _) {
        return MaterialApp(
          title: 'LÀNH - Nông sản hữu cơ',
          debugShowCheckedModeBanner: false,
          theme: LanhTheme.lightTheme,
          home: const LoginScreen(),
        );
      },
    );
  }
}
