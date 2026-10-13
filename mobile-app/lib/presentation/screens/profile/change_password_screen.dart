import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../data/api_service.dart';
import 'otp_verification_screen.dart';

class ChangePasswordScreen extends StatefulWidget {
  final String? userEmail;
  const ChangePasswordScreen({super.key, this.userEmail});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  bool _obscureNew = true;
  bool _obscureConfirm = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _emailCtrl.text = widget.userEmail ?? '';
    if (_emailCtrl.text.isEmpty) {
      _loadEmailFromPrefs();
    }
  }

  Future<void> _loadEmailFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('customer_user');
      if (userStr != null) {
        final data = jsonDecode(userStr);
        final email = data['email']?.toString() ?? '';
        if (mounted && email.isNotEmpty) {
          setState(() => _emailCtrl.text = email);
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleProceed() async {
    final email = _emailCtrl.text.trim();
    final newPass = _newPassCtrl.text;
    final confirmPass = _confirmPassCtrl.text;

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không tìm thấy email tài khoản. Vui lòng thử lại!'), backgroundColor: Colors.red),
      );
      return;
    }

    if (newPass.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mật khẩu mới phải có tối thiểu 8 ký tự!'), backgroundColor: Colors.red),
      );
      return;
    }

    if (newPass != confirmPass) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mật khẩu xác nhận không trùng khớp!'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Gửi mã OTP xác nhận về email
      await ApiService.forgotPassword(email);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Mã OTP xác thực đã được gửi tới $email!'),
            backgroundColor: const Color(0xFF2E7D32),
            duration: const Duration(seconds: 2),
          ),
        );

        // Chuyển sang màn hình xác thực OTP
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (ctx) => OtpVerificationScreen(
              email: email,
              newPassword: newPass,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi gửi OTP xác thực: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: const Text('Đổi Mật Khẩu', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE1EAE0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.shield_outlined, color: Color(0xFF2E7D32), size: 24),
                  SizedBox(width: 8),
                  Text(
                    'Thiết lập mật khẩu mới',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Sau khi nhập mật khẩu mới, hệ thống sẽ gửi mã OTP đến email ${_emailCtrl.text} để bạn xác nhận an toàn.',
                style: TextStyle(fontSize: 12.5, color: Colors.grey.shade600, height: 1.4),
              ),
              const SizedBox(height: 20),

              // Email tài khoản (Chỉ đọc)
              const Text('EMAIL TÀI KHOẢN', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90))),
              const SizedBox(height: 6),
              TextField(
                controller: _emailCtrl,
                readOnly: true,
                style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1B3A20)),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF2E7D32)),
                  filled: true,
                  fillColor: const Color(0xFFF4F6F4),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),

              const SizedBox(height: 18),

              // Mật khẩu mới
              const Text('MẬT KHẨU MỚI (TỐI THIỂU 8 KÝ TỰ)', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90))),
              const SizedBox(height: 6),
              TextField(
                controller: _newPassCtrl,
                obscureText: _obscureNew,
                decoration: InputDecoration(
                  hintText: 'Nhập mật khẩu mới',
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF2E7D32)),
                  suffixIcon: IconButton(
                    icon: Icon(_obscureNew ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                    onPressed: () => setState(() => _obscureNew = !_obscureNew),
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF9FAF9),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE1EAE0))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE1EAE0))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF2E7D32))),
                ),
              ),

              const SizedBox(height: 18),

              // Xác nhận mật khẩu mới
              const Text('XÁC NHẬN MẬT KHẨU MỚI', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90))),
              const SizedBox(height: 6),
              TextField(
                controller: _confirmPassCtrl,
                obscureText: _obscureConfirm,
                decoration: InputDecoration(
                  hintText: 'Nhập lại mật khẩu mới',
                  prefixIcon: const Icon(Icons.lock_reset, color: Color(0xFF2E7D32)),
                  suffixIcon: IconButton(
                    icon: Icon(_obscureConfirm ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                    onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF9FAF9),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE1EAE0))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE1EAE0))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF2E7D32))),
                ),
              ),

              const SizedBox(height: 28),

              // Nút Tiếp tục
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _handleProceed,
                  icon: _isSubmitting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                  label: Text(
                    _isSubmitting ? 'Đang gửi mã OTP...' : 'Tiếp tục nhận mã OTP',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
