import 'package:flutter/material.dart';
import '../auth/login_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  final Map<String, dynamic> user;
  const AdminDashboardScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Row(
          children: [
            Icon(Icons.admin_panel_settings, color: Colors.amber),
            SizedBox(width: 8),
            Text('HỆ THỐNG QUẢN TRỊ (ADMIN)', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Admin Profile Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: Color(0xFF1E293B),
                    radius: 24,
                    child: Icon(Icons.person, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user['fullName'] ?? 'Admin', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(user['email'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('SUPER ADMIN', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 11)),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Statistics Grid (Dashboard Thống kê)
            const Text('Dashboard Tổng quan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _buildStatCard('Doanh thu hệ thống', '142.500.000₫', Icons.monetization_on, Colors.green),
                _buildStatCard('Tổng đơn hàng', '1.248 đơn', Icons.shopping_bag, Colors.blue),
                _buildStatCard('Người dùng & HTX', '56 tài khoản', Icons.people, Colors.orange),
                _buildStatCard('Lô gần hết hạn (FEFO)', '8 lô hàng', Icons.warning_amber_rounded, Colors.red),
              ],
            ),
            const SizedBox(height: 24),

            // Modules Quản lý
            const Text('Chức năng Quản trị', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildAdminMenu(
              icon: Icons.people_alt_outlined,
              title: 'Quản lý Người dùng & Hợp tác xã',
              subtitle: 'Phê duyệt, khóa/mở tài khoản, phân quyền',
              color: Colors.indigo,
            ),
            _buildAdminMenu(
              icon: Icons.inventory_2_outlined,
              title: 'Duyệt & Quản lý Nông sản',
              subtitle: 'Kiểm duyệt sản phẩm, danh mục, tiêu chuẩn VietGAP',
              color: Colors.teal,
            ),
            _buildAdminMenu(
              icon: Icons.qr_code_2_outlined,
              title: 'Kiểm soát Vùng trồng & Nguồn gốc',
              subtitle: 'Quản lý lô hàng, ngày thu hoạch, hạn sử dụng',
              color: Colors.green,
            ),
            _buildAdminMenu(
              icon: Icons.receipt_long_outlined,
              title: 'Quản lý Đơn hàng & Tồn kho',
              subtitle: 'Theo dõi tiến trình giao hàng, điều phối toàn sàn',
              color: Colors.purple,
            ),
            _buildAdminMenu(
              icon: Icons.auto_graph_outlined,
              title: 'Mô-đun AI Gợi ý & Đánh giá',
              subtitle: 'Theo dõi hiệu quả xếp hạng Top-K, review khách hàng',
              color: Colors.amber.shade800,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: Colors.black54)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildAdminMenu({required IconData icon, required String title, required String subtitle, required Color color}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () {},
      ),
    );
  }
}
