import 'package:flutter/material.dart';

import '../../../data/api_service.dart';

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

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['notificationId'].toString(),
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      time: _formatDate(json['createdAt']),
      type: (json['type'] ?? 'system').toLowerCase(),
      isRead: json['isRead'] ?? false,
    );
  }

  static String _formatDate(String? isoDate) {
    if (isoDate == null) return '';
    try {
      final date = DateTime.parse(isoDate);
      final diff = DateTime.now().difference(date);
      if (diff.inDays > 0) return '${diff.inDays} ngày trước';
      if (diff.inHours > 0) return '${diff.inHours} giờ trước';
      if (diff.inMinutes > 0) return '${diff.inMinutes} phút trước';
      return 'Vừa xong';
    } catch (_) {
      return '';
    }
  }
}

class NotificationsScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  const NotificationsScreen({super.key, this.user});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedCategory = 'all';
  List<NotificationItem> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    if (widget.user == null) {
      setState(() => _isLoading = false);
      return;
    }
    
    try {
      final userId = widget.user!['userId'];
      final data = await ApiService.getUserNotifications(userId);
      if (mounted) {
        setState(() {
          _notifications = data.map((json) => NotificationItem.fromJson(json)).toList();
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<NotificationItem> get _filteredNotifications {
    if (_selectedCategory == 'all') return _notifications;
    if (_selectedCategory == 'order') return _notifications.where((n) => n.type == 'order').toList();
    if (_selectedCategory == 'promo') return _notifications.where((n) => n.type == 'promotion' || n.type == 'promo').toList();
    return _notifications.where((n) => n.type == 'system' || n.type == 'supplier').toList();
  }

  Future<void> _markAllAsRead() async {
    if (widget.user != null) {
      await ApiService.markAllNotificationsAsRead(widget.user!['userId']);
    }
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã đánh dấu tất cả là đã đọc'),
          backgroundColor: Color(0xFF2E7D32),
        ),
      );
    }
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
        if (!item.isRead) {
          setState(() => item.isRead = true);
          ApiService.markNotificationAsRead(int.parse(item.id));
        }
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
