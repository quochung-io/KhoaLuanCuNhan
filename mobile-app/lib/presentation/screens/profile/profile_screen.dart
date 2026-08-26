import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cá nhân'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // User Avatar Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              color: Colors.white,
              child: const Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: Color(0xFFE3F1E3),
                    child: Icon(Icons.person, size: 36, color: Color(0xFF2E7D32)),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Bùi Quốc Hưng',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1B3A20)),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'quochung.io@gmail.com · Khách hàng Thân thiết',
                    style: TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Lịch sử Đơn hàng
            _buildProfileSectionHeader('Đơn hàng của tôi'),
            _buildMenuTile(
              icon: Icons.history,
              title: 'Lịch sử mua hàng',
              subtitle: 'Xem lại các đơn hàng đã mua',
              onTap: () {},
            ),
            _buildMenuTile(
              icon: Icons.local_shipping_outlined,
              title: 'Theo dõi đơn hàng',
              subtitle: 'Đơn hàng đang giao trong 2 giờ',
              onTap: () {},
            ),
            const SizedBox(height: 12),

            // Quản lý tài khoản
            _buildProfileSectionHeader('Tài khoản'),
            _buildMenuTile(
              icon: Icons.location_on_outlined,
              title: 'Địa chỉ nhận hàng',
              subtitle: 'Thiết lập vị trí giao hàng để gợi ý độ tươi tối ưu',
              onTap: () {},
            ),
            _buildMenuTile(
              icon: Icons.favorite_outline,
              title: 'Sản phẩm đã thích',
              subtitle: 'Lưu trữ các nông sản bạn quan tâm',
              onTap: () {},
            ),
            const SizedBox(height: 12),

            // Hỗ trợ & Thông tin
            _buildProfileSectionHeader('Ứng dụng LÀNH'),
            _buildMenuTile(
              icon: Icons.info_outline,
              title: 'Về dự án khóa luận ECC',
              subtitle: 'Đại học Công Thương TP.HCM (HUIT)',
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0, top: 12, bottom: 6),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2E7D32),
            letterSpacing: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      color: Colors.white,
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: const Color(0xFF2E7D32)),
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF8D9E90))),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFFE1EAE0)),
      ),
    );
  }
}
