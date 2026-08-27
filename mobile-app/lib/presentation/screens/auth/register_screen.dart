import 'package:flutter/material.dart';
import '../../../core/theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

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
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleRegister() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đăng ký tài khoản thành công! Vui lòng đăng nhập.'),
          backgroundColor: LanhTheme.primaryColor,
        ),
      );
      Navigator.pop(context); // Quay lại trang đăng nhập
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
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                ),
                const SizedBox(height: 32),

                // Full Name Input
                const Text(
                  'Họ và tên',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    hintText: 'Nhập họ tên đầy đủ',
                    prefixIcon: const Icon(Icons.person_outline, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập họ tên!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Email Input
                const Text(
                  'Email liên kết',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    hintText: 'Nhập email của bạn',
                    prefixIcon: const Icon(Icons.email_outlined, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: LanhTheme.primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Vui lòng nhập email!';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)*[\w-]{2,}$').hasMatch(value.trim())) {
                      return 'Email không đúng định dạng!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Phone Input
                const Text(
                  'Số điện thoại',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    hintText: 'Nhập số điện thoại nhận hàng',
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
                    if (!RegExp(r'^[0-9]{10,11}$').hasMatch(value)) {
                      return 'Số điện thoại gồm 10-11 chữ số!';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Password Input
                const Text(
                  'Mật khẩu',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'Nhập mật khẩu (tối thiểu 6 ký tự)',
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
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Confirm Password Input
                const Text(
                  'Xác nhận mật khẩu',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirmPassword,
                  decoration: InputDecoration(
                    hintText: 'Nhập lại mật khẩu',
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
                const SizedBox(height: 36),

                // Register Button
                ElevatedButton(
                  onPressed: _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: LanhTheme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  child: const Text(
                    'Đăng Ký Tài Khoản',
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
