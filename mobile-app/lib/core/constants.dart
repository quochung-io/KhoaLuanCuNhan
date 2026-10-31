// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/core/constants.dart
// MÔ TẢ: Tiện ích cốt lõi, cấu hình hằng số & giao diện (constants.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/foundation.dart';

class AppConstants {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5023';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5023';
    } else {
      return 'http://localhost:5023';
    }
  }

  static const int orderExpirationMinutes = 15;
}
