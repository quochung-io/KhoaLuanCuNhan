import 'package:flutter/material.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  const ProfileScreen({super.key, this.user});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late String _fullName;
  late String _email;
  late String _phone;
  String _avatarInitials = 'KH';

  @override
  void initState() {
    super.initState();
    _fullName = widget.user?['fullName'] ?? 'Nguyễn Minh Anh';
    _email = widget.user?['email'] ?? 'minhanh@gmail.com';
    _phone = widget.user?['phone'] ?? '0911000001';
    _updateInitials();
  }

  void _updateInitials() {
    if (_fullName.trim().isNotEmpty) {
      final parts = _fullName.trim().split(' ');
      _avatarInitials = parts.length > 1
          ? '${parts.first[0]}${parts.last[0]}'.toUpperCase()
          : _fullName.substring(0, 1).toUpperCase();
    }
  }

  void _showEditProfileDialog() {
    final nameCtrl = TextEditingController(text: _fullName);
    final emailCtrl = TextEditingController(text: _email);
    final phoneCtrl = TextEditingController(text: _phone);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cập nhật thông tin cá nhân', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Họ và tên', icon: Icon(Icons.person)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                decoration: const InputDecoration(labelText: 'Email', icon: Icon(Icons.email)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                decoration: const InputDecoration(labelText: 'Số điện thoại', icon: Icon(Icons.phone)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _fullName = nameCtrl.text;
                _email = emailCtrl.text;
                _phone = phoneCtrl.text;
                _updateInitials();
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đã cập nhật thông tin cá nhân thành công!'), backgroundColor: Color(0xFF2E7D32)),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
            child: const Text('Lưu thay đổi', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog() {
    final oldPassCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đổi mật khẩu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: oldPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Mật khẩu hiện tại', icon: Icon(Icons.lock_outline)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: newPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Mật khẩu mới', icon: Icon(Icons.lock_reset)),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: confirmPassCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Xác nhận mật khẩu mới', icon: Icon(Icons.check_circle_outline)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              if (newPassCtrl.text != confirmPassCtrl.text) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Mật khẩu xác nhận không khớp!'), backgroundColor: Colors.red),
                );
                return;
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đổi mật khẩu thành công!'), backgroundColor: Color(0xFF2E7D32)),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
            child: const Text('Đổi mật khẩu', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAvatarPicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Chọn ảnh đại diện Avatar', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            ListTile(
              leading: const CircleAvatar(backgroundColor: Color(0xFFE3F1E3), child: Icon(Icons.camera_alt, color: Color(0xFF2E7D32))),
              title: const Text('Chụp ảnh từ Camera'),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã cập nhật Avatar từ Camera!')));
              },
            ),
            ListTile(
              leading: const CircleAvatar(backgroundColor: Color(0xFFE3F1E3), child: Icon(Icons.photo_library, color: Color(0xFF2E7D32))),
              title: const Text('Chọn ảnh từ Thư viện'),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã cập nhật Avatar từ Thư viện!')));
              },
            ),
          ],
        ),
      ),
    );
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận đăng xuất'),
        content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
                (route) => false,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        title: const Text('Hồ sơ cá nhân'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            tooltip: 'Đăng xuất',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // User Avatar Card with Edit Avatar Button
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              color: Colors.white,
              child: Column(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: const Color(0xFF2E7D32),
                        child: Text(
                          _avatarInitials,
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _showAvatarPicker,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFFFF9800),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt, size: 14, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _fullName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1B3A20)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$_email · $_phone',
                    style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _showEditProfileDialog,
                    icon: const Icon(Icons.edit, size: 14),
                    label: const Text('Chỉnh sửa thông tin', style: TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF2E7D32),
                      side: const BorderSide(color: Color(0xFF2E7D32)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Quản lý tài khoản & Bảo mật
            _buildProfileSectionHeader('Tài khoản & Bảo mật'),
            _buildMenuTile(
              icon: Icons.lock_reset,
              title: 'Đổi mật khẩu',
              subtitle: 'Cập nhật mật khẩu bảo vệ tài khoản',
              onTap: _showChangePasswordDialog,
            ),
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

            // Đăng xuất button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _handleLogout,
                  icon: const Icon(Icons.logout, color: Colors.white),
                  label: const Text('ĐĂNG XUẤT TÀI KHOẢN', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade600,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
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
