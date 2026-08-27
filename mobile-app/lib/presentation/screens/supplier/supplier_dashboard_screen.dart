import 'package:flutter/material.dart';
import '../auth/login_screen.dart';

class SupplierDashboardScreen extends StatelessWidget {
  final Map<String, dynamic> user;
  const SupplierDashboardScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1B5E20),
        title: const Row(
          children: [
            Icon(Icons.storefront_rounded, color: Colors.lightGreenAccent),
            SizedBox(width: 8),
            Text('KÊNH NHÀ CUNG CẤP / HTX', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
            // Supplier Profile Banner
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
                    backgroundColor: Color(0xFF1B5E20),
                    radius: 24,
                    child: Icon(Icons.agriculture_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user['fullName'] ?? 'Nhà cung cấp', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(user['email'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('SUPPLIER', style: TextStyle(color: Color(0xFF1B5E20), fontWeight: FontWeight.bold, fontSize: 11)),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Supplier Stat Cards
            const Text('Báo cáo Bán hàng & Tồn kho', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _buildStatCard('Doanh thu HTX', '38.200.000₫', Icons.account_balance_wallet, Colors.green),
                _buildStatCard('Đơn cần xử lý', '14 đơn mới', Icons.pending_actions, Colors.amber.shade900),
                _buildStatCard('Lô đang kinh doanh', '12 lô hàng', Icons.inventory, Colors.teal),
                _buildStatCard('Cảnh báo cận hạn', '3 lô (FEFO)', Icons.timer_outlined, Colors.red),
              ],
            ),
            const SizedBox(height: 24),

            // Modules Nhà cung cấp
            const Text('Nghiệp vụ Nhà cung cấp', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _buildSupplierMenu(
              icon: Icons.add_box_outlined,
              title: 'Cập nhật Sản phẩm & Giá bán',
              subtitle: 'Thêm nông sản mới, hình ảnh, mô tả chi tiết',
              color: Colors.green,
            ),
            _buildSupplierMenu(
              icon: Icons.qr_code_scanner_rounded,
              title: 'Quản lý Lô hàng & Vùng trồng',
              subtitle: 'Khai báo ngày thu hoạch, hạn dùng, chuẩn VietGAP',
              color: Colors.teal,
            ),
            _buildSupplierMenu(
              icon: Icons.local_shipping_outlined,
              title: 'Tiếp nhận & Xử lý Đơn hàng',
              subtitle: 'Cập nhật trạng thái chuẩn bị hàng, bàn giao vận chuyển',
              color: Colors.blue,
            ),
            _buildSupplierMenu(
              icon: Icons.analytics_outlined,
              title: 'Báo cáo Doanh thu & Tồn kho',
              subtitle: 'Biểu đồ bán chạy, kiểm kê hạn sử dụng theo lô',
              color: Colors.purple,
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

  Widget _buildSupplierMenu({required IconData icon, required String title, required String subtitle, required Color color}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
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
