import 'package:flutter/material.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';
import '../main_container.dart';
import '../admin/admin_dashboard_screen.dart';
import '../supplier/supplier_dashboard_screen.dart';
import '../../../core/theme.dart';
import '../../../data/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      // Gọi API thực tế tới Backend SQL Server
      final result = await ApiService.login(email, password);
      final user = result['user'] as Map<String, dynamic>;
      final role = (user['role'] ?? 'CUSTOMER').toString().toUpperCase();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Xin chào ${user['fullName'] ?? email} ($role)'),
          backgroundColor: LanhTheme.primaryColor,
        ),
      );

      // Phân luồng điều hướng màn hình theo đúng Role
      if (role == 'ADMIN') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => AdminDashboardScreen(user: user)),
        );
      } else if (role == 'SUPPLIER') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => SupplierDashboardScreen(user: user)),
        );
      } else {
        // CUSTOMER -> Màn hình Mua hàng Storefront
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainContainer()),
        );
      }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 30),
                // Logo & Title
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: LanhTheme.primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.spa_rounded,
                      size: 60,
                      color: LanhTheme.primaryColor,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Center(
                  child: Text(
                    'Nông Sản LÀNH',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: LanhTheme.primaryColor,
                      fontFamily: 'Fraunces',
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                const Center(
                  child: Text(
                    'Đăng nhập hệ thống đa phân hệ',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Email Input
                const Text(
                  'Email',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    hintText: 'Nhập email (VD: admin@gmail.com)',
                    prefixIcon: const Icon(Icons.email_outlined, color: LanhTheme.primaryColor),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
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
                const SizedBox(height: 18),

                // Password Input
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Mật khẩu',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ForgotPasswordScreen(),
                          ),
                        );
                      },
                      child: const Text(
                        'Quên mật khẩu?',
                        style: TextStyle(
                          color: LanhTheme.primaryColor,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'Nhập mật khẩu (VD: Demo@123)',
                    prefixIcon: const Icon(Icons.lock_outline, color: LanhTheme.primaryColor),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
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
                const SizedBox(height: 28),

                // Login Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
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
                          'Đăng Nhập',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),
                const SizedBox(height: 20),

                // Quick Role Guide Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('💡 Tài khoản demo hệ thống (MK: Demo@123):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('• Quản trị viên: admin@gmail.com (Role: ADMIN)', style: TextStyle(fontSize: 11, color: Colors.indigo)),
                      Text('• Nhà cung ứng: dalat@gmail.com (Role: SUPPLIER)', style: TextStyle(fontSize: 11, color: Colors.green)),
                      Text('• Khách hàng: minhanh@gmail.com (Role: CUSTOMER)', style: TextStyle(fontSize: 11, color: Colors.teal)),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Register Redirect
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Bạn chưa có tài khoản? '),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const RegisterScreen()),
                        );
                      },
                      child: const Text(
                        'Đăng ký ngay',
                        style: TextStyle(
                          color: LanhTheme.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
