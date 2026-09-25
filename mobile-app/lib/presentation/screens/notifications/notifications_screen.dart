import 'package:flutter/material.dart';

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String time;
  final String type; // 'order' | 'promo' | 'system'
  bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.type,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedCategory = 'all';

  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      title: 'Đơn hàng #ORD-8823 đang được giao!',
      message: 'Shipper Nguyễn Văn B đang giao gói nông sản tươi đến địa chỉ của bạn. Dự kiến giao trong 30 phút.',
      time: '10 phút trước',
      type: 'order',
      isRead: false,
    ),
    NotificationItem(
      id: '2',
      title: 'Xác nhận đơn hàng thành công #ORD-8823',
      message: 'Hợp tác xã Nông Sản Đà Lạt đã tiếp nhận đơn và đang chuẩn bị những luống rau thu hoạch tươi nhất.',
      time: '2 giờ trước',
      type: 'order',
      isRead: false,
    ),
    NotificationItem(
      id: '3',
      title: 'Ưu đãi Combo Gia Đình: Giảm 20%',
      message: 'Combo rau củ quả tuần mới đã có mặt. Nhập mã TUOILANH20 để nhận ưu đãi ngay hôm nay!',
      time: 'Hôm qua',
      type: 'promo',
      isRead: true,
    ),
    NotificationItem(
      id: '4',
      title: 'Tích luỹ +150 Lành Point thành công',
      message: 'Bạn đã nhận 150 điểm thưởng từ đơn hàng hoàn thành #ORD-7612. Dùng điểm để đổi voucher giảm giá!',
      time: '2 ngày trước',
      type: 'system',
      isRead: true,
    ),
    NotificationItem(
      id: '5',
      title: 'Lô Cải bó xôi mới đạt chuẩn VietGAP',
      message: 'Hợp tác xã vừa cập nhật kết quả kiểm định Lab QC không dư lượng thuốc BVTV. Tra cứu ngay!',
      time: '3 ngày trước',
      type: 'system',
      isRead: true,
    ),
  ];

  List<NotificationItem> get _filteredNotifications {
    if (_selectedCategory == 'all') return _notifications;
    return _notifications.where((n) => n.type == _selectedCategory).toList();
  }

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đánh dấu tất cả là đã đọc'),
        backgroundColor: Color(0xFF2E7D32),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.notifications_active_outlined, color: Color(0xFF2E7D32), size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'Thông Báo',
              style: TextStyle(
                color: Color(0xFF1B3A20),
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$unreadCount mới',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: _markAllAsRead,
            icon: const Icon(Icons.done_all, size: 16, color: Color(0xFF2E7D32)),
            label: const Text('Đã đọc hết', style: TextStyle(color: Color(0xFF2E7D32), fontSize: 12)),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                _buildTab('all', 'Tất cả'),
                const SizedBox(width: 8),
                _buildTab('order', 'Đơn hàng'),
                const SizedBox(width: 8),
                _buildTab('promo', 'Khuyến mãi'),
                const SizedBox(width: 8),
                _buildTab('system', 'Hệ thống'),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Notifications List
          Expanded(
            child: _filteredNotifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: 12),
                        const Text('Không có thông báo nào', style: TextStyle(color: Colors.grey, fontSize: 14)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: _filteredNotifications.length,
                    itemBuilder: (context, index) {
                      final item = _filteredNotifications[index];
                      return _buildNotificationCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String key, String label) {
    final isSelected = _selectedCategory == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFFF1F5F1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF4A5568),
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    IconData icon;
    Color iconColor;
    Color iconBg;

    switch (item.type) {
      case 'order':
        icon = Icons.local_shipping_outlined;
        iconColor = const Color(0xFF1976D2);
        iconBg = const Color(0xFFE3F2FD);
        break;
      case 'promo':
        icon = Icons.local_offer_outlined;
        iconColor = const Color(0xFFE65100);
        iconBg = const Color(0xFFFFF3E0);
        break;
      default:
        icon = Icons.verified_outlined;
        iconColor = const Color(0xFF2E7D32);
        iconBg = const Color(0xFFE8F5E9);
    }

    return GestureDetector(
      onTap: () {
        setState(() => item.isRead = true);
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: item.isRead ? Colors.white : const Color(0xFFF4FBF4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: item.isRead ? const Color(0xFFE5ECE5) : const Color(0xFFA5D6A7),
            width: item.isRead ? 1 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                            color: const Color(0xFF1B3A20),
                          ),
                        ),
                      ),
                      if (!item.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF2E7D32),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.message,
                    style: TextStyle(
                      fontSize: 12.5,
                      color: Colors.grey.shade700,
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.time,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
