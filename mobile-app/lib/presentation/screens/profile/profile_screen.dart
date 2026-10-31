// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/profile_screen.dart
// MÔ TẢ: Màn hình giao diện di động (profile_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../data/api_service.dart';
import '../../../data/models/cart_item_model.dart';
import '../../../data/models/product_model.dart';
import '../cart/cart_screen.dart';
import '../chat/chat_screen.dart';
import '../chat/admin_chat_screen.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';
import 'orders_management_screen.dart';
import 'address_management_screen.dart';
import 'settings_screen.dart';
import 'voucher_wallet_screen.dart';
import 'points_screen.dart';
import 'favorites_screen.dart';
import 'help_center_screen.dart';
import 'farming_standards_screen.dart';
import 'privacy_policy_screen.dart';

/// Lớp giao diện / trạng thái ProfileScreen
class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  final List<CartItem>? cartItems;
  final Function(int, int)? onUpdateCartQty;
  final VoidCallback? onClearCart;
  final VoidCallback? onOpenCart;
  final Function(Product, {int qty})? onAddToCart;

  const ProfileScreen({
    super.key,
    this.user,
    this.cartItems,
    this.onUpdateCartQty,
    this.onClearCart,
    this.onOpenCart,
    this.onAddToCart,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

/// Lớp giao diện / trạng thái _ProfileScreenState
class _ProfileScreenState extends State<ProfileScreen> {
  int _userId = 3;
  String _fullName = 'Khách hàng';
  String _email = '';
  String _phone = '';
  String _avatarUrl = '';
  String _gender = 'Chưa cập nhật';
  String _dob = 'Chưa cập nhật';
  String _cccd = 'Chưa cập nhật';
  String _membershipTier = 'Đang tải...';
  int _loyaltyPoints = 0;
  int _voucherCount = 0;

  List<dynamic> _orders = [];

  @override
  void initState() {
    super.initState();
    _initUserData();
  }

  // Thực thi nghiệp vụ hàm _initUserData
  Future<void> _initUserData() async {
    Map<String, dynamic>? userData = widget.user;

    if (userData == null) {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('customer_user');
      if (userStr != null) {
        userData = jsonDecode(userStr);
      }
    }

    if (mounted) {
      setState(() {
        _userId = userData?['userId'] ?? userData?['id'] ?? 3;
        _fullName = userData?['fullName'] ?? 'Khách hàng';
        _email = userData?['email'] ?? '';
        _phone = userData?['phone'] ?? '';
        _avatarUrl = userData?['avatarUrl'] ?? '';

        final role = userData?['role']?.toString().toLowerCase();
        if (role == 'admin') {
          _membershipTier = 'Quản trị viên 🛡️';
        } else if (role == 'supplier') {
          _membershipTier = 'Nhà vườn LÀNH 🏢';
        } else {
          _membershipTier = 'Đang tải...';
          _fetchLoyalty();
        }
      });
      _fetchOrders();
    }
  }

  // Thực thi nghiệp vụ hàm _fetchLoyalty
  Future<void> _fetchLoyalty() async {
    try {
      final loyaltyData = await ApiService.getUserLoyalty(_userId);
      if (mounted && loyaltyData != null) {
        setState(() {
          final tierStr = loyaltyData['tier']?.toString() ?? 'Mới';
          if (tierStr == 'Mới')
            _membershipTier = 'Thành viên Mới 🌱';
          else if (tierStr == 'Bạc')
            _membershipTier = 'Thành viên Bạc 🥈';
          else if (tierStr == 'Vàng')
            _membershipTier = 'Thành viên Vàng 🥇';
          else if (tierStr == 'Kim Cương')
            _membershipTier = 'Thành viên Kim Cương 💎';
          else
            _membershipTier = 'Thành viên $tierStr';

          _loyaltyPoints = loyaltyData['currentPoints'] ?? 0;
          final vouchers = (loyaltyData['vouchers'] as List<dynamic>?) ?? [];
          _voucherCount = vouchers.where((v) => v['isUsed'] != true).length;
        });
      }
    } catch (_) {}
  }

  // Thực thi nghiệp vụ hàm _fetchOrders
  Future<void> _fetchOrders() async {
    try {
      final role = widget.user?['role']?.toString().toLowerCase();
      if (role != 'admin' && role != 'supplier') {
        _fetchLoyalty();
      }
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
      if (status == 'cancelled') return s == 'cancelled' || s == 'canceled';
      return false;
    }).length;
  }

  int get _cartCount {
    if (widget.cartItems == null) return 0;
    return widget.cartItems!.fold<int>(0, (sum, item) => sum + item.qty);
  }

  // Thực thi nghiệp vụ hàm _navigateToEditProfile
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

  // Thực thi nghiệp vụ hàm _navigateToOrders
  void _navigateToOrders(int tabIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => OrdersManagementScreen(
          initialTabIndex: tabIndex,
          userId: _userId,
          onAddToCart: widget.onAddToCart,
          onOpenCart: _openCart,
        ),
      ),
    ).then((_) => _fetchOrders());
  }

  // Thực thi nghiệp vụ hàm _openCart
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

  // Thực thi nghiệp vụ hàm _openChat
  void _openChat() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (ctx) => const ChatScreen()),
    );
  }

  // Thực thi nghiệp vụ hàm _navigateToSettings
  void _navigateToSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => SettingsScreen(onEditProfile: _navigateToEditProfile),
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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
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
                                padding: const EdgeInsets.symmetric(
                                  vertical: 4,
                                ),
                                child: Row(
                                  children: [
                                    // Avatar
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 28,
                                          backgroundColor: const Color(
                                            0xFFE8F5E9,
                                          ),
                                          backgroundImage: _avatarUrl.isNotEmpty
                                              ? NetworkImage(_avatarUrl)
                                              : null,
                                          child: _avatarUrl.isEmpty
                                              ? Text(
                                                  _fullName.isNotEmpty
                                                      ? _fullName
                                                            .trim()[0]
                                                            .toUpperCase()
                                                      : 'L',
                                                  style: const TextStyle(
                                                    color: Color(0xFF2E7D32),
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 20,
                                                  ),
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
                                            child: const Icon(
                                              Icons.edit,
                                              size: 10,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),

                                    // Tên & Hạng thành viên
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
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
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 4),
                                              const Icon(
                                                Icons.chevron_right,
                                                size: 18,
                                                color: Colors.grey,
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          // Tên hạng thành viên kế bên
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFF8E1),
                                              borderRadius:
                                                  BorderRadius.circular(6),
                                              border: Border.all(
                                                color: const Color(0xFFFFD54F),
                                              ),
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
                                icon: const Icon(
                                  Icons.settings_outlined,
                                  color: Color(0xFF4B5D50),
                                ),
                                tooltip: 'Cài đặt',
                                onPressed: _navigateToSettings,
                              ),

                              // Nút Giỏ hàng với Badge số lượng (+1 khi thêm)
                              Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  IconButton(
                                    icon: const Icon(
                                      Icons.shopping_cart_outlined,
                                      color: Color(0xFF2E7D32),
                                    ),
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
                                        constraints: const BoxConstraints(
                                          minWidth: 16,
                                          minHeight: 16,
                                        ),
                                        child: Text(
                                          _cartCount > 99
                                              ? '99+'
                                              : '$_cartCount',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 9,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    ),
                                ],
                              ),

                              // Nút Chat
                              IconButton(
                                icon: const Icon(
                                  Icons.chat_outlined,
                                  color: Color(0xFF2E7D32),
                                ),
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
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Đơn mua của tôi',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B3A20),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _navigateToOrders(0),
                                child: const Row(
                                  children: [
                                    Text(
                                      'Xem lịch sử đơn',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF8D9E90),
                                      ),
                                    ),
                                    Icon(
                                      Icons.chevron_right,
                                      size: 16,
                                      color: Color(0xFF8D9E90),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1, color: Color(0xFFF0F0F0)),

                        // 5 ô trạng thái đơn mua
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 14,
                            horizontal: 4,
                          ),
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
                                label: 'Chờ giao',
                                count: _countOrders('shipping'),
                                onTap: () => _navigateToOrders(2),
                              ),
                              _buildOrderStatusItem(
                                icon: Icons.rate_review_outlined,
                                label: 'Đánh giá',
                                count: _countOrders('delivered'),
                                onTap: () => _navigateToOrders(3),
                              ),
                              _buildOrderStatusItem(
                                icon: Icons.cancel_outlined,
                                label: 'Đã hủy',
                                count: _countOrders('cancelled'),
                                onTap: () => _navigateToOrders(4),
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
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8D9E90),
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildUtilityIcon(
                              icon: Icons.confirmation_number_outlined,
                              color: Colors.orange,
                              label: 'Kho Voucher',
                              subLabel: '$_voucherCount ưu đãi',
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        VoucherWalletScreen(userId: _userId),
                                  ),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.monetization_on_outlined,
                              color: const Color(0xFF2E7D32),
                              label: 'LÀNH Points',
                              subLabel: '$_loyaltyPoints điểm',
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        PointsScreen(userId: _userId),
                                  ),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.location_on_outlined,
                              color: Colors.blue,
                              label: 'Sổ địa chỉ',
                              subLabel: 'Quản lý',
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        AddressManagementScreen(
                                          userId: _userId,
                                        ),
                                  ),
                                );
                              },
                            ),
                            _buildUtilityIcon(
                              icon: Icons.favorite_border,
                              color: Colors.red,
                              label: 'Đã thích',
                              subLabel: 'Yêu thích',
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => FavoritesScreen(
                                      onAddToCart: widget.onAddToCart,
                                    ),
                                  ),
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

                // 4. Khung Hỗ trợ & Chính sách
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
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8D9E90),
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                        ListTile(
                          leading: const Icon(
                            Icons.help_outline,
                            color: Color(0xFF2E7D32),
                          ),
                          title: const Text(
                            'Trung tâm trợ giúp',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            size: 18,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const HelpCenterScreen(),
                              ),
                            );
                          },
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(
                            Icons.support_agent_outlined,
                            color: Color(0xFF2E7D32),
                          ),
                          title: const Text(
                            'Chat với Quản trị viên (Admin)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          subtitle: const Text(
                            'Giải quyết khiếu nại & kết nối nhà vườn',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            size: 18,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => AdminChatScreen(
                                  currentUserId: _userId,
                                  currentUserName: _fullName,
                                ),
                              ),
                            );
                          },
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(
                            Icons.headset_mic_outlined,
                            color: Color(0xFF2E7D32),
                          ),
                          title: const Text(
                            'Chăm sóc khách hàng (Chat bot)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          subtitle: const Text(
                            'Hotline: 1900 8888 (7h30 - 21h00)',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            size: 18,
                            color: Colors.grey,
                          ),
                          onTap: _openChat,
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(
                            Icons.verified_user_outlined,
                            color: Color(0xFF2E7D32),
                          ),
                          title: const Text(
                            'Tiêu chuẩn canh tác sinh học',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            size: 18,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const FarmingStandardsScreen(),
                              ),
                            );
                          },
                        ),
                        const Divider(height: 1, indent: 56),
                        ListTile(
                          leading: const Icon(
                            Icons.privacy_tip_outlined,
                            color: Color(0xFF2E7D32),
                          ),
                          title: const Text(
                            'Chính sách bảo mật dữ liệu',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: const Icon(
                            Icons.chevron_right,
                            size: 18,
                            color: Colors.grey,
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    const PrivacyPolicyScreen(),
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
                          builder: (ctx) => Dialog(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            elevation: 0,
                            backgroundColor: Colors.transparent,
                            child: Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.1),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 64,
                                    height: 64,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEE2E2),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: const Color(0xFFFECACA),
                                        width: 2,
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.logout_rounded,
                                      color: Color(0xFFDC2626),
                                      size: 30,
                                    ),
                                  ),
                                  const SizedBox(height: 18),
                                  const Text(
                                    'Xác nhận đăng xuất',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      color: Color(0xFF1F2937),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  const Text(
                                    'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng LÀNH Farm? Giỏ hàng và ưu đãi của bạn vẫn được lưu trữ an toàn.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 13.5,
                                      height: 1.45,
                                      color: Color(0xFF6B7280),
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton(
                                          onPressed: () => Navigator.pop(ctx),
                                          style: OutlinedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            side: const BorderSide(
                                              color: Color(0xFFE5E7EB),
                                            ),
                                            backgroundColor: const Color(
                                              0xFFF9FAFB,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                          child: const Text(
                                            'Ở lại',
                                            style: TextStyle(
                                              color: Color(0xFF4B5563),
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () async {
                                            Navigator.pop(ctx);
                                            final prefs =
                                                await SharedPreferences.getInstance();
                                            await prefs.remove('customer_user');
                                            if (!mounted) return;
                                            Navigator.pushAndRemoveUntil(
                                              context,
                                              MaterialPageRoute(
                                                builder: (c) =>
                                                    const LoginScreen(),
                                              ),
                                              (route) => false,
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(
                                              0xFFDC2626,
                                            ),
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                            elevation: 0,
                                          ),
                                          child: const Text(
                                            'Đăng xuất',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      icon: const Icon(
                        Icons.logout,
                        size: 18,
                        color: Colors.red,
                      ),
                      label: const Text(
                        'Đăng xuất tài khoản',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.red.shade200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 5,
                        vertical: 1,
                      ),
                      decoration: const BoxDecoration(
                        color: Color(0xFFE53935),
                        borderRadius: BorderRadius.all(Radius.circular(10)),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '$count',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF4B5D50),
                fontWeight: FontWeight.w500,
              ),
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
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1B3A20),
              ),
            ),
            Text(
              subLabel,
              style: const TextStyle(fontSize: 10, color: Color(0xFF8D9E90)),
            ),
          ],
        ),
      ),
    );
  }
}
