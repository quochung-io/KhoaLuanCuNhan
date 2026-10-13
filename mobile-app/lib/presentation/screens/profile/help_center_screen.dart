import 'package:flutter/material.dart';
import '../chat/admin_chat_screen.dart';
import '../../../core/localization_service.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    final faqs = [
      {
        'q': isEn ? 'How are weekly combos delivered?' : 'Các gói combo định kỳ được giao như thế nào?',
        'a': isEn
            ? 'Produce is harvested at certified farms in the morning and delivered to your doorstep on your chosen schedule (e.g., every Tuesday or Friday) to guarantee freshness.'
            : 'Nông sản trong gói combo được thu hoạch tươi sáng sớm tại các hợp tác xã VietGAP và giao đến tận cửa nhà bạn theo lịch cố định (Thứ 3 hoặc Thứ 6) trong khung giờ bạn đã chọn.'
      },
      {
        'q': isEn ? 'What is the return/exchange policy for damaged produce?' : 'Chính sách đổi trả khi rau củ bị dập úng?',
        'a': isEn
            ? 'LÀNH supports a 100% money-back or immediate replacement policy within 24 hours if produce is damaged or not meeting standard quality upon delivery.'
            : 'LÀNH cam kết hoàn tiền 100% hoặc đổi hàng bù ngay trong ngày nếu nông sản bị hư hại, dập úng hoặc không đúng quy cách. Bạn chỉ cần chụp ảnh và gửi yêu cầu qua mục "Khiếu nại với Admin".'
      },
      {
        'q': isEn ? 'How to trace lot origin with QR code?' : 'Cách kiểm tra nguồn gốc bằng mã QR?',
        'a': isEn
            ? 'Open the "Traceability" tab on the app and scan the QR code printed on the packaging to view harvest date, farm location, pesticide tests, and soil inspection reports.'
            : 'Bạn vào mục "Truy xuất" trên ứng dụng và quét mã QR in trên tem nhãn gói hàng. Hệ thống IoT sẽ hiển thị đầy đủ ngày thu hoạch, HTX canh tác, kiểm định dư lượng và nhiệt độ bảo quản.'
      },
      {
        'q': isEn ? 'How do I earn and redeem reward points?' : 'Quy chế tích điểm và sử dụng điểm L-Points?',
        'a': isEn
            ? 'Every delivered order earns 1% to 3% value in L-Points based on your membership tier. 1 L-Point = 1 VND, which can be redeemed for discount vouchers in the Voucher Wallet.'
            : 'Mỗi đơn hàng hoàn thành tích lũy 1% - 3% giá trị đơn hàng tùy theo hạng thành viên. Điểm L-Points dùng để đổi voucher giảm giá hoặc khấu trừ tiền trực tiếp khi thanh toán.'
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(isEn ? 'Help Center' : 'Trung Tâm Trợ Giúp', style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Banner liên hệ khẩn cấp
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.support_agent, color: Colors.white, size: 28),
                    const SizedBox(width: 10),
                    Text(
                      isEn ? 'We are here to help!' : 'Chúng tôi luôn lắng nghe bạn!',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isEn
                      ? 'Have an issue with your order or produce quality? Contact Admin directly for immediate resolution.'
                      : 'Bạn gặp vấn đề về đơn hàng, chất lượng nông sản hay giao trễ? Hãy liên hệ ngay với Ban Quản Trị để được xử lý nhanh nhất.',
                  style: const TextStyle(color: Colors.white70, fontSize: 12.5, height: 1.4),
                ),
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (ctx) => const AdminChatScreen()),
                    );
                  },
                  icon: const Icon(Icons.chat_bubble_outline, size: 16, color: Color(0xFF1B5E20)),
                  label: Text(
                    isEn ? 'Chat with Admin now' : 'Chat trực tiếp với Admin',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Kênh liên lạc
          const Text(
            'KÊNH HỖ TRỢ TRỰC TIẾP',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
          ),
          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE1EAE0)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.phone_in_talk, color: Color(0xFF2E7D32)),
                  title: const Text('Tổng đài miễn cước: 1900 8866', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                  subtitle: const Text('Hoạt động từ 07:00 - 21:00 hàng ngày', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                const Divider(height: 1, color: Color(0xFFF0F4F0)),
                ListTile(
                  leading: const Icon(Icons.email_outlined, color: Color(0xFF2E7D32)),
                  title: const Text('Email hỗ trợ khách hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                  subtitle: const Text('cskh@nongsanlanh.vn', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // FAQ
          const Text(
            'CÂU HỎI THƯỜNG GẶP (FAQ)',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
          ),
          const SizedBox(height: 10),

          ...faqs.map((faq) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE1EAE0)),
            ),
            child: ExpansionTile(
              title: Text(
                faq['q']!,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF1B3A20)),
              ),
              childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              children: [
                Text(
                  faq['a']!,
                  style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700, height: 1.4),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
