// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/core/localization_service.dart
// MÔ TẢ: Tiện ích cốt lõi, cấu hình hằng số & giao diện (localization_service.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Lớp giao diện / trạng thái LocalizationService
class LocalizationService extends ChangeNotifier {
  static final LocalizationService instance = LocalizationService._();
  LocalizationService._();

  String _currentLanguage = 'vi';
  String get currentLanguage => _currentLanguage;
  bool get isEnglish => _currentLanguage == 'en';

  // Thực thi nghiệp vụ hàm init
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString('app_language') ?? 'vi';
    notifyListeners();
  }

  // Thực thi nghiệp vụ hàm setLanguage
  Future<void> setLanguage(String langCode) async {
    if (_currentLanguage == langCode) return;
    _currentLanguage = langCode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_language', langCode);
    notifyListeners();
  }

  // Từ điển đa ngôn ngữ hoàn chỉnh cho toàn ứng dụng
  static final Map<String, Map<String, String>> _localizedValues = {
    'vi': {
      // Bottom Bar
      'nav_home': 'Trang chủ',
      'nav_combos': 'Gói Combo',
      'nav_trace': 'Truy xuất',
      'nav_notifications': 'Thông báo',
      'nav_profile': 'Cá nhân',

      // Home
      'search_placeholder': 'Tìm rau củ, trái cây, HTX...',
      'banner_title': 'Nông sản chuẩn LÀNH',
      'banner_desc': 'Thu hoạch tại vườn, giao tận tay trong ngày',
      'flash_sale': 'GIẢM GIÁ ĐẶC BIỆT TRONG NGÀY',
      'for_you': 'Gợi ý nông sản tươi lành hôm nay',
      'for_you_subtitle':
          'Lựa chọn các loại nông sản tươi ngon, vào độ thu hoạch tốt nhất trong ngày.',
      'categories': 'Danh mục nông sản',
      'all': 'Tất cả',
      'add_to_cart': 'Thêm giỏ hàng',

      // Combos
      'combo_header': 'Gói Combo Dinh Dưỡng Định Kỳ',
      'combo_subtitle':
          'Giao định kỳ hàng tuần hoặc tháng với nông sản đạt chuẩn VietGAP',
      'combo_customize': 'Tùy chọn nông sản & Đặt combo',
      'view_details': 'Xem chi tiết',
      'nutrition_score': 'Điểm cân bằng dinh dưỡng',
      'auto_balance': 'Phân bổ tối ưu',
      'auto_balance_success':
          '✨ Đã tự động chọn các loại rau củ quả tươi ngon, cân bằng dinh dưỡng cho bạn!',

      // Trace
      'trace_title': 'Truy Xuất Nguồn Gốc',
      'scan_qr': 'Quét mã QR trên bao bì',
      'enter_lot_code': 'Hoặc nhập mã lô hàng',
      'check_trace': 'Truy xuất ngay',

      // Notifications
      'notif_title': 'Thông báo hệ thống',
      'notif_all': 'Tất cả',
      'notif_order': 'Đơn hàng',
      'notif_promo': 'Khuyến mãi',
      'mark_all_read': 'Đọc tất cả',

      // Profile
      'profile_title': 'Hồ sơ cá nhân',
      'my_orders': 'Đơn mua của tôi',
      'voucher_wallet': 'Kho Voucher',
      'points_rewards': 'Điểm tích lũy & Hạng',
      'favorite_items': 'Nông sản đã thích',
      'help_center': 'Trung tâm trợ giúp',
      'farming_standards': 'Tiêu chuẩn canh tác sinh học',
      'privacy_policy': 'Chính sách bảo mật',
      'settings': 'Cài đặt hệ thống',
      'chat_with_admin': 'Hỗ trợ & Khiếu nại với Admin',
      'edit_profile': 'Chỉnh sửa hồ sơ',
      'change_password': 'Đổi mật khẩu',
      'logout': 'Đăng xuất',
      'confirm_logout': 'Bạn có chắc chắn muốn đăng xuất tài khoản?',
      'cancel': 'Hủy',
      'confirm': 'Đồng ý',

      // Settings
      'language': 'Ngôn ngữ',
      'vietnamese': 'Tiếng Việt (VN)',
      'english': 'Tiếng Anh (EN)',
      'notifications_setting': 'Thông báo ưu đãi & Lô hàng',

      // Reviews
      'write_review': 'Viết đánh giá nông sản',
      'product_quality': 'Chất lượng sản phẩm',
      'seller_service': 'Dịch vụ nhà cung cấp',
      'add_photos_videos': 'Thêm hình ảnh & video thực tế',
      'submit_review': 'Gửi đánh giá ngay',
      'reply': 'Trả lời',

      // Cart & Checkout
      'cart_title': 'Giỏ hàng của bạn',
      'checkout_title': 'Thanh toán đơn hàng',
      'total': 'Tổng cộng',
      'buy_now': 'Mua ngay',
      'buy_again': 'Mua lại',
    },
    'en': {
      // Bottom Bar
      'nav_home': 'Home',
      'nav_combos': 'Combos',
      'nav_trace': 'Traceability',
      'nav_notifications': 'Notifications',
      'nav_profile': 'Profile',

      // Home
      'search_placeholder': 'Search veggies, fruits, farms...',
      'banner_title': 'Pure & Organic Farm Produce',
      'banner_desc': 'Harvested at farms, delivered fresh today',
      'flash_sale': 'DAILY FLASH DEALS',
      'for_you': 'Fresh Produce Recommendations Today',
      'for_you_subtitle':
          'Selected fresh harvest at peak nutrition today for you.',
      'categories': 'Produce Categories',
      'all': 'All',
      'add_to_cart': 'Add to Cart',

      // Combos
      'combo_header': 'Regular Nutrition Combos',
      'combo_subtitle':
          'Delivered weekly or monthly with VietGAP certified produce',
      'combo_customize': 'Customize & Subscribe',
      'view_details': 'View Details',
      'nutrition_score': 'Nutrition Balance Score',
      'auto_balance': 'Optimal Balance',
      'auto_balance_success':
          '✨ Fresh balanced veggies & fruits have been automatically selected for you!',

      // Trace
      'trace_title': 'Produce Traceability',
      'scan_qr': 'Scan packaging QR code',
      'enter_lot_code': 'Or enter Lot/Batch code',
      'check_trace': 'Trace Origin',

      // Notifications
      'notif_title': 'System Notifications',
      'notif_all': 'All',
      'notif_order': 'Orders',
      'notif_promo': 'Promotions',
      'mark_all_read': 'Mark all as read',

      // Profile
      'profile_title': 'User Profile',
      'my_orders': 'My Orders',
      'voucher_wallet': 'Voucher Wallet',
      'points_rewards': 'Reward Points & Tier',
      'favorite_items': 'Favorite Produce',
      'help_center': 'Help Center',
      'farming_standards': 'Eco-Farming Standards',
      'privacy_policy': 'Privacy Policy',
      'settings': 'System Settings',
      'chat_with_admin': 'Support & Claims with Admin',
      'edit_profile': 'Edit Profile',
      'change_password': 'Change Password',
      'logout': 'Log Out',
      'confirm_logout': 'Are you sure you want to log out?',
      'cancel': 'Cancel',
      'confirm': 'Confirm',

      // Settings
      'language': 'Language',
      'vietnamese': 'Vietnamese (VN)',
      'english': 'English (EN)',
      'notifications_setting': 'Deals & Batch Notifications',

      // Reviews
      'write_review': 'Write Product Review',
      'product_quality': 'Product Quality',
      'seller_service': 'Supplier Service',
      'add_photos_videos': 'Add Photos & Videos',
      'submit_review': 'Submit Review',
      'reply': 'Reply',

      // Cart & Checkout
      'cart_title': 'Your Shopping Cart',
      'checkout_title': 'Checkout',
      'total': 'Total',
      'buy_now': 'Buy Now',
      'buy_again': 'Buy Again',
    },
  };

  String tr(String key) {
    return _localizedValues[_currentLanguage]?[key] ??
        _localizedValues['vi']?[key] ??
        key;
  }
}

// Extension helper tiện lợi dùng trực tiếp trong Widget
extension LocalizationExtension on BuildContext {
  String tr(String key) => LocalizationService.instance.tr(key);
}
