import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme.dart';
import '../../../data/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  bool _isSendingOtp = false;
  String _otpMethod = 'EMAIL'; // 'EMAIL' hoặc 'SMS'
  String? _serverGeneratedOtp;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  // Gọi API Backend sinh và gửi mã OTP thực tế
  Future<void> _requestOtp(void Function(void Function()) setDialogState) async {
    final recipient = _otpMethod == 'EMAIL' ? _emailController.text.trim() : _phoneController.text.trim();
    setDialogState(() {
      _isSendingOtp = true;
    });

    try {
      final res = await ApiService.sendRegisterOtp(recipient: recipient, type: _otpMethod);
      _serverGeneratedOtp = res['otp']?.toString();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Đã gửi mã OTP thành công!'),
          backgroundColor: LanhTheme.primaryColor,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setDialogState(() {
        _isSendingOtp = false;
      });
    }
  }

  // Mở Dialog chọn phương thức OTP và xác nhận
  void _openOtpVerificationDialog() {
    _otpController.clear();
    _serverGeneratedOtp = null;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          final sentTo = _otpMethod == 'EMAIL' ? _emailController.text.trim() : _phoneController.text.trim();

          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.verified_user_outlined, color: LanhTheme.primaryColor),
                SizedBox(width: 8),
                Text('Xác thực đăng ký', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Chọn kênh nhận mã OTP xác thực:',
                    style: TextStyle(fontSize: 13, color: Colors.black87),
                  ),
                  const SizedBox(height: 12),

                  // Lựa chọn gửi qua Email hoặc SMS
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setDialogState(() {
                              _otpMethod = 'EMAIL';
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            decoration: BoxDecoration(
                              color: _otpMethod == 'EMAIL' ? const Color(0xFFE3F1E3) : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: _otpMethod == 'EMAIL' ? LanhTheme.primaryColor : Colors.black12,
                                width: _otpMethod == 'EMAIL' ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.email_outlined,
                                    color: _otpMethod == 'EMAIL' ? LanhTheme.primaryColor : Colors.grey, size: 22),
                                const SizedBox(height: 4),
                                Text(
                                  'Gmail',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: _otpMethod == 'EMAIL' ? LanhTheme.primaryColor : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setDialogState(() {
                              _otpMethod = 'SMS';
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            decoration: BoxDecoration(
                              color: _otpMethod == 'SMS' ? const Color(0xFFE3F1E3) : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: _otpMethod == 'SMS' ? LanhTheme.primaryColor : Colors.black12,
                                width: _otpMethod == 'SMS' ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.sms_outlined,
                                    color: _otpMethod == 'SMS' ? LanhTheme.primaryColor : Colors.grey, size: 22),
                                const SizedBox(height: 4),
                                Text(
                                  'Tin nhắn SMS',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: _otpMethod == 'SMS' ? LanhTheme.primaryColor : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mã sẽ được gửi tới: $sentTo',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        if (_serverGeneratedOtp != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Mã OTP từ hệ thống: $_serverGeneratedOtp',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: LanhTheme.primaryColor),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Nút bấm Gửi / Lấy lại mã OTP
                  SizedBox(
                    width: double.infinity,
                    height: 36,
                    child: OutlinedButton.icon(
                      onPressed: _isSendingOtp ? null : () => _requestOtp(setDialogState),
                      icon: _isSendingOtp
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.send_rounded, size: 14),
                      label: Text(
                        _serverGeneratedOtp == null ? 'Bấm để Gửi mã OTP' : 'Gửi lại mã OTP mới',
                        style: const TextStyle(fontSize: 12),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: LanhTheme.primaryColor,
                        side: const BorderSide(color: LanhTheme.primaryColor),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Ô nhập mã OTP 6 chữ số
                  const Text('Nhập mã OTP (6 chữ số):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    textAlign: TextAlign.center,
                    style: const TextStyle(letterSpacing: 6, fontWeight: FontWeight.bold, fontSize: 18),
                    decoration: InputDecoration(
                      hintText: '000000',
                      counterText: '',
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                      ),
                    ),
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
                onPressed: () => _executeRegister(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: LanhTheme.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Xác nhận & Hoàn tất'),
              ),
            ],
          );
        },
      ),
    );
  }

  // Thực hiện gọi API đăng ký sau khi xác thực OTP
  Future<void> _executeRegister(BuildContext dialogContext) async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập đủ 6 chữ số OTP!'), backgroundColor: Colors.red),
      );
      return;
    }

    Navigator.pop(dialogContext); // Đóng Dialog OTP

    setState(() {
      _isLoading = true;
    });

    try {
      await ApiService.register(
        fullName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        password: _passwordController.text,
        otp: otp,
        verifyMethod: _otpMethod,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký tài khoản thành công! Vui lòng đăng nhập.'),
          backgroundColor: LanhTheme.primaryColor,
        ),
      );
      Navigator.pop(context); // Quay về trang đăng nhập
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onRegisterPressed() {
    if (_formKey.currentState!.validate()) {
      _openOtpVerificationDialog();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Đăng ký tài khoản',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Center(
                  child: Text(
                    'Trở thành thành viên của LÀNH để mua sắm nông sản sạch truy xuất nguồn gốc.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 28),

                // 1. Họ và tên (Chỉ cho phép chữ, cấm số)
                const Text(
                  'Họ và tên',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _nameController,
                  keyboardType: TextInputType.name,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[a-zA-ZÀ-ỹ\s]')),
                  ],
                  decoration: InputDecoration(
                    hintText: 'Nhập họ tên (VD: Nguyễn Văn A)',
                    prefixIcon: const Icon(Icons.person_outline, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập họ và tên!';
                    }
                    if (RegExp(r'[0-9]').hasMatch(value)) {
                      return 'Họ và tên không được chứa chữ số!';
                    }
                    if (value.trim().length < 2) {
                      return 'Họ và tên quá ngắn!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 18),

                // 2. Email (Ràng buộc định dạng email chuẩn)
                const Text(
                  'Email liên kết',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    hintText: 'Nhập email (VD: user@gmail.com)',
                    prefixIcon: const Icon(Icons.email_outlined, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập địa chỉ email!';
                    }
                    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
                    if (!emailRegex.hasMatch(value.trim())) {
                      return 'Email không đúng định dạng (VD: example@gmail.com)!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 18),

                // 3. Số điện thoại (Chỉ cho phép số, chuẩn 10 số VN)
                const Text(
                  'Số điện thoại',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.number,
                  maxLength: 10,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    hintText: 'Nhập số điện thoại (10 chữ số)',
                    counterText: '',
                    prefixIcon: const Icon(Icons.phone_outlined, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập số điện thoại!';
                    }
                    if (!RegExp(r'^[0-9]+$').hasMatch(value)) {
                      return 'Số điện thoại chỉ được chứa chữ số!';
                    }
                    if (!RegExp(r'^(03|05|07|08|09)[0-9]{8}$').hasMatch(value.trim())) {
                      return 'Số điện thoại VN không hợp lệ (Đủ 10 số, bắt đầu: 03, 05, 07, 08, 09)!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 18),

                // 4. Mật khẩu
                const Text(
                  'Mật khẩu',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'Mật khẩu (tối thiểu 6 ký tự, gồm chữ và số)',
                    prefixIcon: const Icon(Icons.lock_outline, color: LanhTheme.primaryColor),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập mật khẩu!';
                    }
                    if (value.length < 6) {
                      return 'Mật khẩu phải dài tối thiểu 6 ký tự!';
                    }
                    if (!RegExp(r'[a-zA-Z]').hasMatch(value) || !RegExp(r'[0-9]').hasMatch(value)) {
                      return 'Mật khẩu nên chứa cả chữ cái và chữ số!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 18),

                // 5. Xác nhận mật khẩu
                const Text(
                  'Xác nhận mật khẩu',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    hintText: 'Nhập lại chính xác mật khẩu',
                    prefixIcon: const Icon(Icons.lock_clock_outlined, color: LanhTheme.primaryColor),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirmPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureConfirmPassword = !_obscureConfirmPassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập lại mật khẩu!';
                    }
                    if (value != _passwordController.text) {
                      return 'Mật khẩu xác nhận không khớp!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 32),

                // Nút Đăng Ký -> Mở hộp thoại chọn OTP
                ElevatedButton(
                  onPressed: _isLoading ? null : _onRegisterPressed,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: LanhTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text(
                          'Tiếp Tục Xác Thực & Đăng Ký',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
