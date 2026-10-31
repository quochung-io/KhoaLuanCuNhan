// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/privacy_policy_screen.dart
// MÔ TẢ: Màn hình giao diện di động (privacy_policy_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import '../../../core/localization_service.dart';

/// Lớp giao diện / trạng thái PrivacyPolicyScreen
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          isEn ? 'Privacy Policy' : 'Chính Sách Bảo Mật',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE1EAE0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isEn
                    ? 'LÀNH PLATFORM PRIVACY & DATA POLICY'
                    : 'QUY ĐỊNH BẢO MẬT & DỮ LIỆU NGƯỜI DÙNG LÀNH',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: Color(0xFF1B3A20),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Cập nhật lần cuối: 10/2026 · Phiên bản 1.0',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
              const Divider(height: 24),

              _buildSection(
                '1. Mục đích thu thập thông tin',
                'Chúng tôi chỉ thu thập các thông tin tối thiểu gồm: Họ tên, Số điện thoại, Địa chỉ giao hàng và Email nhằm mục đích tạo lập tài khoản thành viên, xác nhận đơn hàng và điều phối giao hàng tận nơi.',
              ),
              _buildSection(
                '2. Bảo mật thông tin thanh toán',
                'Ứng dụng LÀNH không lưu trữ thông tin thẻ ngân hàng hoặc mật khẩu tài khoản thanh toán của bạn. Toàn bộ giao dịch chuyển khoản hoặc QR Code được thực hiện thông qua cổng thanh toán bảo mật tiêu chuẩn quốc tế.',
              ),
              _buildSection(
                '3. Quyền riêng tư & Cam kết không tiết lộ',
                'LÀNH cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại ngoài phạm vi vận chuyển hàng hóa.',
              ),
              _buildSection(
                '4. Quyền của khách hàng đối với dữ liệu',
                'Bạn có quyền truy cập, chỉnh sửa thông tin hồ sơ của mình bất kỳ lúc nào tại mục "Chỉnh sửa hồ sơ" hoặc yêu cầu Ban Quản Trị hỗ trợ khóa/xóa tài khoản vĩnh viễn.',
              ),
              _buildSection(
                '5. Thông tin đơn vị chủ quản',
                'Hệ Thống Phân Phối Nông Sản Sinh Học & Hữu Cơ LÀNH\nEmail: privacy@nongsanlanh.vn\nHotline: 1900 8866',
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildSection
  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13.5,
              color: Color(0xFF1B3A20),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: TextStyle(
              fontSize: 12.5,
              color: Colors.grey.shade700,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
