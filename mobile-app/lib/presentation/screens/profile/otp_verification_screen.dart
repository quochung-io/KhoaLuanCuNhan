// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/otp_verification_screen.dart
// MÔ TẢ: Màn hình giao diện di động (otp_verification_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import '../../../data/api_service.dart';

/// Lớp giao diện / trạng thái OtpVerificationScreen
class OtpVerificationScreen extends StatefulWidget {
  final String email;
  final String newPassword;

  const OtpVerificationScreen({
    super.key,
    required this.email,
    required this.newPassword,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

/// Lớp giao diện / trạng thái _OtpVerificationScreenState
class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final TextEditingController _otpCtrl = TextEditingController();
  bool _isSubmitting = false;
  bool _isResending = false;
  int _countdown = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    _otpCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _startCountdown
  void _startCountdown() {
    setState(() => _countdown = 60);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        if (mounted) setState(() => _countdown--);
      } else {
        timer.cancel();
      }
    });
  }

  // Thực thi nghiệp vụ hàm _resendOtp
  Future<void> _resendOtp() async {
    if (_countdown > 0 || _isResending) return;
    setState(() => _isResending = true);

    try {
      await ApiService.forgotPassword(widget.email);
      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Mã OTP mới đã được gửi tới email ${widget.email}!'),
            backgroundColor: const Color(0xFF2E7D32),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể gửi lại OTP: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isResending = false);
    }
  }

  // Thực thi nghiệp vụ hàm _handleConfirm
  Future<void> _handleConfirm() async {
    final otp = _otpCtrl.text.trim();
    if (otp.isEmpty || otp.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập đầy đủ mã OTP 6 số!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await ApiService.resetPassword(
        email: widget.email,
        otp: otp,
        newPassword: widget.newPassword,
      );

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: Color(0xFF2E7D32),
                    size: 26,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Thành công!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                ),
              ],
            ),
            content: const Text(
              'Mật khẩu tài khoản LÀNH Farm của bạn đã được thay đổi thành công. Bạn có thể sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo.',
              style: TextStyle(
                fontSize: 13.5,
                height: 1.4,
                color: Color(0xFF4B5563),
              ),
            ),
            actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            actions: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx); // Đóng dialog
                    Navigator.pop(context); // Đóng OtpVerificationScreen
                    Navigator.pop(
                      context,
                    ); // Đóng ChangePasswordScreen quay về SettingsScreen
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Hoàn tất & Quay lại',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Xác thực thất bại: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
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
        title: const Text(
          'Xác thực OTP',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE1EAE0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon Header
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFC8E6C9), width: 2),
                ),
                child: const Icon(
                  Icons.mark_email_read_outlined,
                  size: 36,
                  color: Color(0xFF2E7D32),
                ),
              ),
              const SizedBox(height: 18),

              const Text(
                'Nhập mã xác thực',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1B3A20),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Hệ thống đã gửi mã OTP 6 chữ số đến địa chỉ email:\n${widget.email}',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 28),

              // Ô nhập OTP cách điệu
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9FAF9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF2E7D32),
                    width: 1.5,
                  ),
                ),
                child: TextField(
                  controller: _otpCtrl,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 6,
                  autofocus: true,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 16,
                    color: Color(0xFF1B3A20),
                  ),
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    counterText: '',
                    border: InputBorder.none,
                    hintText: '••••••',
                    hintStyle: TextStyle(letterSpacing: 16, color: Colors.grey),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Gửi lại mã
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _countdown > 0
                        ? 'Gửi lại mã sau ${_countdown}s'
                        : 'Chưa nhận được mã?',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                  if (_countdown == 0) ...[
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: _resendOtp,
                      child: Text(
                        _isResending ? 'Đang gửi...' : 'Gửi lại ngay',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2E7D32),
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 32),

              // Nút xác nhận
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleConfirm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'Xác nhận đổi mật khẩu',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
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
}
