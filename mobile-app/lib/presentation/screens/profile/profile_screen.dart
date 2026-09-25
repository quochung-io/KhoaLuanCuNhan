import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/cart_item_model.dart';
import '../cart/cart_screen.dart';
import '../chat/chat_screen.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';
import 'orders_management_screen.dart';

class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  final List<CartItem>? cartItems;
  final Function(int, int)? onUpdateCartQty;
  final VoidCallback? onClearCart;
  final VoidCallback? onOpenCart;

  const ProfileScreen({
    super.key,
    this.user,
    this.cartItems,
    this.onUpdateCartQty,
    this.onClearCart,
    this.onOpenCart,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late int _userId;
  late String _fullName;
  late String _email;
  late String _phone;
  late String _avatarUrl;
  String _gender = 'Nam';
  String _dob = '15/08/1995';
  String _cccd = '079202001234';
  String _membershipTier = 'Thành viên Vàng ⭐';

  List<dynamic> _orders = [];

  @override
  void initState() {
    super.initState();
    _userId = widget.user?['userId'] ?? widget.user?['id'] ?? 3;
    _fullName = widget.user?['fullName'] ?? 'Nguyễn Minh Anh';
    _email = widget.user?['email'] ?? 'minhanh@gmail.com';
    _phone = widget.user?['phone'] ?? '0912345678';
    _avatarUrl = widget.user?['avatarUrl'] ?? '';

    // Căn cứ theo vai trò hoặc điểm số để xác định hạng thành viên
    final role = widget.user?['role']?.toString().toLowerCase();
    if (role == 'admin') {
      _membershipTier = 'Quản trị viên 🛡️';
    } else if (role == 'supplier') {
      _membershipTier = 'Nhà vườn LÀNH 🏢';
    } else {
      _membershipTier = 'Thành viên Vàng ⭐';
    }

    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    try {
      final orders = await ApiService.getCustomerOrders(_userId);
      if (mounted) {
        setState(() {
          _orders = orders;
        });
      }
    } catch (_) {}
  }

  // Đếm số đơn theo trạng thái
  int _countOrders(String status) {
    return _orders.where((o) {
      final s = (o['orderStatus'] ?? '').toString().toLowerCase();
      if (status == 'pending') return s == 'pending';
      if (status == 'processing') return s == 'processing' || s == 'confirmed';
      if (status == 'shipping') return s == 'shipping';
      if (status == 'delivered') return s == 'delivered' || s == 'completed';
      return false;
    }).length;
  }

  int get _cartCount {
    if (widget.cartItems == null) return 0;
    return widget.cartItems!.fold<int>(0, (sum, item) => sum + item.qty);
  }

  void _navigateToEditProfile() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => EditProfileScreen(
          initialProfile: {
            'userId': _userId,
            'fullName': _fullName,
            'email': _email,
            'phone': _phone,
            'gender': _gender,
            'dob': _dob,
            'cccd': _cccd,
            'avatarUrl': _avatarUrl,
          },
          onProfileUpdated: (updated) {
            setState(() {
              _fullName = updated['fullName'] ?? _fullName;
              _email = updated['email'] ?? _email;
              _phone = updated['phone'] ?? _phone;
              _gender = updated['gender'] ?? _gender;
              _dob = updated['dob'] ?? _dob;
              _cccd = updated['cccd'] ?? _cccd;
              _avatarUrl = updated['avatarUrl'] ?? _avatarUrl;
            });
          },
        ),
      ),
    );

    if (result != null && result is Map<String, dynamic>) {
      setState(() {
        _fullName = result['fullName'] ?? _fullName;
        _email = result['email'] ?? _email;
        _phone = result['phone'] ?? _phone;
        _gender = result['gender'] ?? _gender;
        _dob = result['dob'] ?? _dob;
        _cccd = result['cccd'] ?? _cccd;
        _avatarUrl = result['avatarUrl'] ?? _avatarUrl;
      });
    }
  }

  void _navigateToOrders(int tabIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => OrdersManagementScreen(
          initialTabIndex: tabIndex,
          userId: _userId,
        ),
      ),
    ).then((_) => _fetchOrders());
  }

  void _openCart() {
    if (widget.onOpenCart != null) {
      widget.onOpenCart!();
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (ctx) => CartScreen(
            cartItems: widget.cartItems ?? [],
            onUpdateQty: widget.onUpdateCartQty ?? (i, q) {},
            onCheckoutSuccess: widget.onClearCart ?? () {},
          ),
        ),
      );
    }
  }

  void _openChat() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (ctx) => const ChatScreen()),
    );
  }

  void _showSettingsDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Cài đặt hệ thống', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20))),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.notifications_active_outlined, color: Color(0xFF2E7D32)),
              title: const Text('Thông báo ưu đãi & Lô hàng'),
              trailing: Switch(value: true, activeThumbColor: const Color(0xFF2E7D32), onChanged: (v) {}),
            ),
            ListTile(
              leading: const Icon(Icons.lock_outline, color: Color(0xFF2E7D32)),
              title: const Text('Đổi mật khẩu'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.pop(ctx);
                _navigateToEditProfile();
              },
            ),
            ListTile(
              leading: const Icon(Icons.language, color: Color(0xFF2E7D32)),
              title: const Text('Ngôn ngữ'),
              trailing: const Text('Tiếng Việt (VN)', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchOrders,
          color: const Color(0xFF2E7D32),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                // 1. Phía trên cùng: Header Avatar + Tên + Hạng thành viên & Cụm nút Setting, Cart, Chat
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  color: Colors.white,
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Avatar & Tên & Hạng thành viên (Bấm vào mở Sửa hồ sơ)
                          Expanded(
                            child: InkWell(
                              onTap: _navigateToEditProfile,
                              borderRadius: BorderRadius.circular(12),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  children: [
                                    // Avatar
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 28,
                                          backgroundColor: const Color(0xFFE8F5E9),
                                          backgroundImage: _avatarUrl.isNotEmpty ? NetworkImage(_avatarUrl) : null,
                                          child: _avatarUrl.isEmpty
                                              ? Text(
                                                  _fullName.isNotEmpty ? _fullName.trim()[0].toUpperCase() : 'L',
                                                  style: const TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 20),
                                                )
                                              : null,
                                        ),
                                        Positioned(
                                          bottom: 0,
                                          right: 0,
                                          child: Container(
                                            padding: const EdgeInsets.all(3),
                                            decoration: const BoxDecoration(
                                              color: Color(0xFF2E7D32),
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.edit, size: 10, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),

                                    // Tên & Hạng thành viên
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Flexible(
                                                child: Text(
                                                  _fullName,
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF1B3A20),
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 4),
                                              const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          // Tên hạng thành viên kế bên
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFF8E1),
                                              borderRadius: BorderRadius.circular(6),
                                              border: Border.all(color: const Color(0xFFFFD54F)),
                                            ),
                                            child: Text(
                                              _membershipTier,
                                              style: const TextStyle(
                                                color: Color(0xFFF57F17),
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          // Cụm nút Setting, Giỏ hàng, Chat
                          Row(
                            children: [
                              // Nút Setting
                              IconButton(
                                icon: const Icon(Icons.settings_outlined, color: Color(0xFF4B5D50)),
                                tooltip: 'Cài đặt',
                                onPressed: _showSettingsDialog,
                              ),

                              // Nút Giỏ hàng với Badge số lượng (+1 khi thêm)
                              Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.shopping_cart_outlined, color: Color(0xFF2E7D32)),
                                    tooltip: 'Giỏ hàng',
                                    onPressed: _openCart,
                                  ),
                                  if (_cartCount > 0)
                                    Positioned(
                                      top: 6,
                                      right: 6,
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFE53935),
                                          shape: BoxShape.circle,
                                        ),
                                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                        child: Text(
                                          _cartCount > 99 ? '99+' : '$_cartCount',
                                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ),
                                ],
                              ),

                              // Nút Chat
                              IconButton(
                                icon: const Icon(Icons.chat_outlined, color: Color(0xFF2E7D32)),
                                tooltip: 'Trò chuyện hỗ trợ',
                                onPressed: _openChat,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // 2. Khung Đơn mua (4 ô: Chờ xác nhận, Chờ lấy hàng, Chờ giao hàng, Đánh giá)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Đơn mua của tôi',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                              ),
                              GestureDetector(
                                onTap: () => _navigateToOrders(0),
                                child: const Row(
                                  children: [
                                    Text('Xem lịch sử đơn', style: TextStyle(fontSize: 12, color: Color(0xFF8D9E90))),
                                    Icon(Icons.chevron_right, size: 16, color: Color(0xFF8D9E90)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1, color: Color(0xFFF0F0F0)),

                        // 4 ô trạng thái đơn mua
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildOrderStatusItem(
                                icon: Icons.schedule_outlined,
                                label: 'Chờ xác nhận',
                                count: _countOrders('pending'),
                                onTap: () => _navigateToOrders(0),
                              ),
                              _buildOrderStatusItem(
                                icon: Icons.inventory_2_outlined,
                                label: 'Chờ lấy hàng',
                                count: _countOrders('processing'),
                                onTap: () => _navigateToOrders(1),
                              ),
                              _buildOrderStatusItem(
                                icon: Icons.local_shipping_outlined,
                                label: 'Chờ giao hàng',
                                count: _countOrders('shipping'),
                                onTap: () => _navigateToOrders(2),
                              ),
                              _buildOrderStatusItem(
                                icon: Icons.rate_review_outlined,
                                label: 'Đánh giá',
                                count: _countOrders('delivered'),
                                onTap: () => _navigateToOrders(3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // 3. Khung Tiện ích của tôi (Voucher, Lành Point, Sổ địa chỉ, Yêu thích)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TIỆN ÍCH CỦA TÔI',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 0.8),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildUtilityIcon(
                              icon: Icons.confirmation_number_outlined,
                              color: Colors.orange,
                              label: 'Kho Voucher',
                              subLabel: '5 ưu đãi',
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Bạn đang có 5 voucher giảm giá nông sản sinh học!')),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.monetization_on_outlined,
                              color: const Color(0xFF2E7D32),
                              label: 'LÀNH Points',
                              subLabel: '350 điểm',
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Số dư: 350 LÀNH Points (tương đương 35.000₫)')),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.location_on_outlined,
                              color: Colors.blue,
                              label: 'Sổ địa chỉ',
                              subLabel: '2 địa chỉ',
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Địa chỉ chính: 123 Nguyễn Huệ, Quận 1, TP.HCM')),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.favorite_border,
                              color: Colors.red,
                              label: 'Đã thích',
                              subLabel: '12 món',
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Danh sách 12 nông sản bạn đã lưu yêu thích')),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // 4. Khung Hỗ trợ (Trung tâm trợ giúp, Chăm sóc khách hàng, Điều khoản)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: Text(
                            'HỖ TRỢ & CHÍNH SÁCH',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 0.8),
                          ),
                        ),
                        ListTile(
                          leading: const Icon(Icons.help_outline, color: Color(0xFF2E7D32)),
                          title: const Text('Trung tâm trợ giúp', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Trung tâm trợ giúp LÀNH'),
                                content: const Text('LÀNH cam kết 100% nông sản sạch, đổi trả miễn phí trong 24h nếu rau củ bị dập úa hoặc không đúng chứng nhận sinh học.'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Đã hiểu')),
                                ],
                              ),
                            );
                          },
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(Icons.headset_mic_outlined, color: Color(0xFF2E7D32)),
                          title: const Text('Chăm sóc khách hàng', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          subtitle: const Text('Hotline: 1900 8888 (7h30 - 21h00)', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                          onTap: _openChat,
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(Icons.verified_user_outlined, color: Color(0xFF2E7D32)),
                          title: const Text('Tiêu chuẩn canh tác sinh học & Truy xuất nguồn gốc', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                          trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text('Cam kết minh bạch'),
                                content: const Text('Toàn bộ quy trình 6 chặng canh tác được ghi nhận số hóa và xác thực qua mã lô QR trên bao bì từng gói nông sản.'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Đóng')),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Nút Đăng xuất
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Xác nhận đăng xuất'),
                            content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng LÀNH Farm?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy', style: TextStyle(color: Colors.grey))),
                              ElevatedButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(builder: (c) => const LoginScreen()),
                                    (route) => false,
                                  );
                                },
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700),
                                child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        );
                      },
                      icon: const Icon(Icons.logout, size: 18, color: Colors.red),
                      label: const Text('Đăng xuất tài khoản', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.red.shade200),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        backgroundColor: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Widget ô trạng thái đơn mua
  Widget _buildOrderStatusItem({
    required IconData icon,
    required String label,
    required int count,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(icon, size: 26, color: const Color(0xFF4B5D50)),
                if (count > 0)
                  Positioned(
                    top: -4,
                    right: -8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: const BoxDecoration(
                        color: Color(0xFFE53935),
                        borderRadius: BorderRadius.all(Radius.circular(10)),
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '$count',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: Color(0xFF4B5D50), fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  // Widget tiện ích
  Widget _buildUtilityIcon({
    required IconData icon,
    required Color color,
    required String label,
    required String subLabel,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(4),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1B3A20))),
            Text(subLabel, style: const TextStyle(fontSize: 10, color: Color(0xFF8D9E90))),
          ],
        ),
      ),
    );
  }
}
