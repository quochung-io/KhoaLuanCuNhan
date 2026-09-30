import 'package:flutter/material.dart';
import '../../../data/api_service.dart';

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

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _cccdController;
  late TextEditingController _dobController;

  String _gender = 'Nam';
  String _selectedAvatar = '';
  bool _isSaving = false;

  // Danh sách các avatar phong cách sinh thái & người tiêu dùng xanh
  final List<String> _presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  ];

  @override
  void initState() {
    super.initState();
    final p = widget.initialProfile;
    _nameController = TextEditingController(text: p['fullName'] ?? 'Nguyễn Minh Anh');
    _emailController = TextEditingController(text: p['email'] ?? 'minhanh@gmail.com');
    _phoneController = TextEditingController(text: p['phone'] ?? '0912345678');
    _cccdController = TextEditingController(text: p['cccd'] ?? '079202001234');
    _dobController = TextEditingController(text: p['dob'] ?? '15/08/1995');
    _gender = p['gender'] ?? 'Nam';
    _selectedAvatar = p['avatarUrl'] ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cccdController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _selectDateOfBirth() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1995, 8, 15),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF2E7D32),
              onPrimary: Colors.white,
              onSurface: Color(0xFF1B3A20),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _dobController.text = '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
      });
    }
  }

  void _showAvatarSelectionSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Chọn ảnh đại diện',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
              ),
              const SizedBox(height: 4),
              const Text('Chọn ảnh phong cách sinh thái LÀNH Farm:', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: _presetAvatars.map((url) {
                  final isSelected = _selectedAvatar == url;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedAvatar = url);
                      Navigator.pop(ctx);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected ? const Color(0xFF2E7D32) : Colors.transparent,
                          width: 3,
                        ),
                      ),
                      child: CircleAvatar(
                        radius: 28,
                        backgroundImage: NetworkImage(url),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFE8F5E9),
                  child: Icon(Icons.person, color: Color(0xFF2E7D32)),
                ),
                title: const Text('Dùng chữ cái viết tắt mặc định', style: TextStyle(fontSize: 14)),
                onTap: () {
                  setState(() => _selectedAvatar = '');
                  Navigator.pop(ctx);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final userId = widget.initialProfile['userId'] ?? widget.initialProfile['id'] ?? 3;

    try {
      // Cập nhật thông tin lên backend database
      await ApiService.updateProfile(
        userId,
        fullName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        avatarUrl: _selectedAvatar,
      );

      final updatedData = {
        'userId': userId,
        'fullName': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'gender': _gender,
        'dob': _dobController.text.trim(),
        'cccd': _cccdController.text.trim(),
        'avatarUrl': _selectedAvatar,
      };

      widget.onProfileUpdated(updatedData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật hồ sơ cá nhân thành công!'),
            backgroundColor: Color(0xFF2E7D32),
          ),
        );
        Navigator.pop(context, updatedData);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString().replaceAll("Exception: ", "")}'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: const Text('Chỉnh sửa hồ sơ cá nhân'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveProfile,
            child: _isSaving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF2E7D32)),
                  )
                : const Text('LƯU', style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 14)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Khung Avatar chỉnh sửa
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24),
              color: Colors.white,
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF2E7D32), width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: CircleAvatar(
                          radius: 46,
                          backgroundColor: const Color(0xFFE8F5E9),
                          backgroundImage: _selectedAvatar.isNotEmpty ? NetworkImage(_selectedAvatar) : null,
                          child: _selectedAvatar.isEmpty
                              ? Text(
                                  _nameController.text.isNotEmpty ? _nameController.text.trim()[0].toUpperCase() : 'L',
                                  style: const TextStyle(fontSize: 34, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                )
                              : null,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _showAvatarSelectionSheet,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFF2E7D32),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextButton.icon(
                    onPressed: _showAvatarSelectionSheet,
                    icon: const Icon(Icons.photo_library_outlined, size: 16, color: Color(0xFF2E7D32)),
                    label: const Text('Thay đổi ảnh đại diện', style: TextStyle(color: Color(0xFF2E7D32), fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Form thông tin
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Form(
                key: _formKey,
                child: Container(
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
                        'THÔNG TIN CÁ NHÂN',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 0.8),
                      ),
                      const SizedBox(height: 16),

                      // 1. Họ và tên
                      TextFormField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          labelText: 'Họ và tên *',
                          prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF2E7D32)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập họ và tên' : null,
                      ),
                      const SizedBox(height: 16),

                      // 2. Giới tính
                      const Text('Giới tính', style: TextStyle(fontSize: 13, color: Color(0xFF4B5D50), fontWeight: FontWeight.w500)),
                      const SizedBox(height: 6),
                      Row(
                        children: ['Nam', 'Nữ', 'Khác'].map((g) {
                          final isSelected = _gender == g;
                          return Padding(
                            padding: const EdgeInsets.only(right: 12),
                            child: ChoiceChip(
                              label: Text(g),
                              selected: isSelected,
                              selectedColor: const Color(0xFFE8F5E9),
                              labelStyle: TextStyle(
                                color: isSelected ? const Color(0xFF2E7D32) : Colors.black87,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              onSelected: (val) {
                                if (val) setState(() => _gender = g);
                              },
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),

                      // 3. Ngày sinh
                      TextFormField(
                        controller: _dobController,
                        readOnly: true,
                        onTap: _selectDateOfBirth,
                        decoration: InputDecoration(
                          labelText: 'Ngày sinh (DD/MM/YYYY)',
                          prefixIcon: const Icon(Icons.cake_outlined, color: Color(0xFF2E7D32)),
                          suffixIcon: const Icon(Icons.calendar_month, color: Color(0xFF2E7D32)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 4. CCCD / CMND
                      TextFormField(
                        controller: _cccdController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Số CCCD / CMND',
                          hintText: 'Nhập 12 số căn cước công dân',
                          prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFF2E7D32)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 20),

                      const Text(
                        'LIÊN HỆ & BẢO MẬT',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 0.8),
                      ),
                      const SizedBox(height: 16),

                      // 5. Số điện thoại
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          labelText: 'Số điện thoại *',
                          prefixIcon: const Icon(Icons.phone_outlined, color: Color(0xFF2E7D32)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Vui lòng nhập số điện thoại';
                          if (v.trim().length < 10) return 'Số điện thoại phải từ 10 số';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // 6. Email
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Địa chỉ Email *',
                          prefixIcon: const Icon(Icons.mail_outline, color: Color(0xFF2E7D32)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) return 'Vui lòng nhập email';
                          if (!v.contains('@')) return 'Email không hợp lệ';
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Nút Lưu thay đổi
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Lưu thông tin hồ sơ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
