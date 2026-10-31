// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/edit_profile_screen.dart
// MÔ TẢ: Màn hình giao diện di động (edit_profile_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../data/api_service.dart';
import '../../../core/localization_service.dart';

/// Lớp giao diện / trạng thái EditProfileScreen
class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> initialProfile;
  final Function(Map<String, dynamic>) onProfileUpdated;

  const EditProfileScreen({
    super.key,
    required this.initialProfile,
    required this.onProfileUpdated,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

/// Lớp giao diện / trạng thái _EditProfileScreenState
class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  String _avatarUrl = '';
  bool _isSaving = false;

  final List<String> _presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.initialProfile['fullName'] ?? '',
    );
    _emailController = TextEditingController(
      text: widget.initialProfile['email'] ?? '',
    );
    _phoneController = TextEditingController(
      text: widget.initialProfile['phone'] ?? '',
    );
    _avatarUrl = widget.initialProfile['avatarUrl'] ?? _presetAvatars[0];
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _showAvatarPicker
  void _showAvatarPicker() {
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
            const Text(
              'Chọn Ảnh Đại Diện Sinh Thái',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Color(0xFF1B3A20),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: _presetAvatars.map((url) {
                final isSelected = _avatarUrl == url;
                return GestureDetector(
                  onTap: () {
                    setState(() => _avatarUrl = url);
                    Navigator.pop(ctx);
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF2E7D32)
                            : Colors.transparent,
                        width: 3,
                      ),
                    ),
                    child: CircleAvatar(
                      radius: 34,
                      backgroundImage: NetworkImage(url),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _handleSave
  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final userId = widget.initialProfile['userId'] ?? 3;
    final fullName = _nameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();

    try {
      await ApiService.updateProfile(
        userId,
        fullName: fullName,
        email: email,
        phone: phone,
        avatarUrl: _avatarUrl,
      );

      final updatedData = {
        'userId': userId,
        'fullName': fullName,
        'email': email,
        'phone': phone,
        'avatarUrl': _avatarUrl,
        'role': widget.initialProfile['role'] ?? 'CUSTOMER',
        'status': widget.initialProfile['status'] ?? 'Active',
      };

      // Cập nhật SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('customer_user', jsonEncode(updatedData));

      widget.onProfileUpdated(updatedData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật hồ sơ tài khoản thành công!'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
        Navigator.pop(context, updatedData);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi cập nhật: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;
    final role = widget.initialProfile['role'] ?? 'CUSTOMER';
    final userId = widget.initialProfile['userId'] ?? 3;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          isEn ? 'Edit Profile' : 'Chỉnh Sửa Hồ Sơ',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // 1. Khung Avatar trung tâm
              Center(
                child: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFF2E7D32),
                          width: 2.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: CircleAvatar(
                        radius: 50,
                        backgroundColor: const Color(0xFFE8F5E9),
                        backgroundImage: _avatarUrl.isNotEmpty
                            ? NetworkImage(_avatarUrl)
                            : null,
                        child: _avatarUrl.isEmpty
                            ? const Icon(
                                Icons.person,
                                size: 50,
                                color: Color(0xFF2E7D32),
                              )
                            : null,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _showAvatarPicker,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Color(0xFF2E7D32),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Nhấn vào biểu tượng máy ảnh để đổi avatar',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),

              const SizedBox(height: 24),

              // 2. Thẻ thông tin cá nhân (Các cột trong bảng Users)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE1EAE0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'THÔNG TIN TÀI KHOẢN (BẢNG USERS)',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF8D9E90),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Cột: FullName
                    const Text(
                      'Họ và tên *',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(
                          Icons.badge_outlined,
                          color: Color(0xFF2E7D32),
                        ),
                        hintText: 'Nhập họ và tên đầy đủ',
                        filled: true,
                        fillColor: const Color(0xFFF9FAF9),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                      ),
                      validator: (val) => (val == null || val.trim().isEmpty)
                          ? 'Vui lòng nhập họ tên'
                          : null,
                    ),

                    const SizedBox(height: 16),

                    // Cột: Email
                    const Text(
                      'Địa chỉ Email *',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(
                          Icons.email_outlined,
                          color: Color(0xFF2E7D32),
                        ),
                        hintText: 'Nhập địa chỉ email',
                        filled: true,
                        fillColor: const Color(0xFFF9FAF9),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty)
                          return 'Vui lòng nhập email';
                        if (!val.contains('@') || !val.contains('.'))
                          return 'Email không hợp lệ';
                        return null;
                      },
                    ),

                    const SizedBox(height: 16),

                    // Cột: Phone
                    const Text(
                      'Số điện thoại *',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(
                          Icons.phone_outlined,
                          color: Color(0xFF2E7D32),
                        ),
                        hintText: 'Nhập số điện thoại (10 chữ số)',
                        filled: true,
                        fillColor: const Color(0xFFF9FAF9),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                            color: Color(0xFFE1EAE0),
                          ),
                        ),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty)
                          return 'Vui lòng nhập số điện thoại';
                        if (val.trim().length < 9)
                          return 'Số điện thoại không hợp lệ';
                        return null;
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // 3. Khung thông tin hệ thống (Readonly)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE1EAE0)),
                ),
                child: Column(
                  children: [
                    _buildInfoRow('Mã tài khoản (UserId)', '#USR-$userId'),
                    const Divider(height: 16),
                    _buildInfoRow(
                      'Vai trò thành viên (Role)',
                      role.toString().toUpperCase(),
                    ),
                    const Divider(height: 16),
                    _buildInfoRow(
                      'Trạng thái tài khoản (Status)',
                      'Đang hoạt động (Active)',
                      isGreen: true,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Nút Lưu thay đổi
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _handleSave,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isSaving
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          isEn ? 'Save Changes' : 'Lưu Thay Đổi',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildInfoRow
  Widget _buildInfoRow(String label, String value, {bool isGreen = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.bold,
            color: isGreen ? const Color(0xFF2E7D32) : const Color(0xFF1B3A20),
          ),
        ),
      ],
    );
  }
}
