// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/settings_screen.dart
// MÔ TẢ: Màn hình giao diện di động (settings_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/localization_service.dart';
import 'change_password_screen.dart';
import 'privacy_policy_screen.dart';
import 'help_center_screen.dart';
import '../auth/login_screen.dart';

/// Lớp giao diện / trạng thái SettingsScreen
class SettingsScreen extends StatefulWidget {
  final VoidCallback onEditProfile;

  const SettingsScreen({super.key, required this.onEditProfile});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

/// Lớp giao diện / trạng thái _SettingsScreenState
class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  String _userEmail = '';

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  // Thực thi nghiệp vụ hàm _loadSettings
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final notif = prefs.getBool('notifications_enabled') ?? true;
    final userStr = prefs.getString('customer_user');
    String email = '';
    if (userStr != null) {
      try {
        final u = jsonDecode(userStr);
        email = (u['email'] ?? '').toString();
      } catch (_) {}
    }
    if (mounted) {
      setState(() {
        _notificationsEnabled = notif;
        _userEmail = email;
      });
    }
  }

  // Thực thi nghiệp vụ hàm _toggleNotification
  Future<void> _toggleNotification(bool val) async {
    setState(() => _notificationsEnabled = val);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications_enabled', val);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            val
                ? 'Đã bật nhận thông báo khuyến mãi & đơn hàng'
                : 'Đã tắt nhận thông báo',
          ),
          duration: const Duration(seconds: 1),
          backgroundColor: const Color(0xFF2E7D32),
        ),
      );
    }
  }

  // Thực thi nghiệp vụ hàm _showLogoutDialog
  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
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
                  border: Border.all(color: const Color(0xFFFECACA), width: 2),
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
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Color(0xFFE5E7EB)),
                        backgroundColor: const Color(0xFFF9FAFB),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.remove('customer_user');
                        if (!mounted) return;
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(
                            builder: (c) => const LoginScreen(),
                          ),
                          (route) => false,
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDC2626),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
  }

  @override
  Widget build(BuildContext context) {
    final loc = LocalizationService.instance;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          loc.tr('settings'),
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),
          _buildSectionHeader(loc.tr('account')),
          _buildListTile(
            icon: Icons.person_outline,
            title: loc.tr('edit_profile'),
            onTap: widget.onEditProfile,
          ),
          _buildListTile(
            icon: Icons.lock_outline,
            title: loc.tr('change_password'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => ChangePasswordScreen(userEmail: _userEmail),
                ),
              );
            },
          ),

          const SizedBox(height: 24),
          _buildSectionHeader(loc.tr('system_preferences')),
          SwitchListTile(
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.notifications_active_outlined,
                color: Color(0xFF2E7D32),
                size: 22,
              ),
            ),
            title: const Text(
              'Thông báo ưu đãi & đơn hàng',
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1B3A20),
              ),
            ),
            subtitle: const Text(
              'Nhận tin cập nhật trạng thái đơn hàng và khuyến mãi mới nhất',
              style: TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
            ),
            value: _notificationsEnabled,
            activeThumbColor: const Color(0xFF2E7D32),
            activeTrackColor: const Color(0xFFA5D6A7),
            onChanged: _toggleNotification,
          ),

          const SizedBox(height: 24),
          _buildSectionHeader(loc.tr('information')),
          _buildListTile(
            icon: Icons.privacy_tip_outlined,
            title: loc.tr('privacy_policy'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => const PrivacyPolicyScreen(),
                ),
              );
            },
          ),
          _buildListTile(
            icon: Icons.help_outline,
            title: loc.tr('help_center'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (ctx) => const HelpCenterScreen()),
              );
            },
          ),
          _buildListTile(
            icon: Icons.info_outline,
            title: 'Về ứng dụng LÀNH Farm',
            trailing: const Text(
              'Phiên bản 2.1.0',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            onTap: () {},
          ),

          const SizedBox(height: 32),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _showLogoutDialog,
                icon: const Icon(Icons.logout, size: 18, color: Colors.white),
                label: const Text(
                  'Đăng xuất tài khoản',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD32F2F),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildSectionHeader
  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 13,
          color: Colors.grey,
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildListTile
  Widget _buildListTile({
    required IconData icon,
    required String title,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF2E7D32)),
      title: Text(title, style: const TextStyle(fontSize: 15)),
      trailing: trailing ?? const Icon(Icons.chevron_right, color: Colors.grey),
      onTap: onTap,
    );
  }
}
