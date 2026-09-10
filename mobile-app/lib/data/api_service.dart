import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';

class ApiService {
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/login');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Đăng nhập thất bại (${response.statusCode})');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Connection refused')) {
        throw Exception('Không thể kết nối đến máy chủ Backend.');
      }
      rethrow;
    }
  }

  // Gửi yêu cầu sinh mã OTP thực tế (tới Gmail hoặc SMS)
  static Future<Map<String, dynamic>> sendRegisterOtp({
    required String recipient,
    required String type, // "EMAIL" hoặc "SMS"
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/send-register-otp');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'recipient': recipient, 'type': type}),
      );

      final result = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return result as Map<String, dynamic>;
      } else {
        throw Exception(result['message'] ?? 'Không thể gửi mã OTP (${response.statusCode})');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Connection refused')) {
        throw Exception('Không thể kết nối đến máy chủ Backend.');
      }
      rethrow;
    }
  }

  // Đăng ký tài khoản kèm OTP xác thực
  static Future<void> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String otp,
    required String verifyMethod,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/register');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'password': password,
          'otp': otp,
          'verifyMethod': verifyMethod,
        }),
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Đăng ký thất bại (${response.statusCode})');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Connection refused')) {
        throw Exception('Không thể kết nối đến máy chủ Backend.');
      }
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/forgot-password');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      final result = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return result as Map<String, dynamic>;
      } else {
        throw Exception(result['message'] ?? 'Yêu cầu OTP thất bại (${response.statusCode})');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Connection refused')) {
        throw Exception('Không thể kết nối đến máy chủ Backend.');
      }
      rethrow;
    }
  }

  static Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/reset-password');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        }),
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Đặt lại mật khẩu thất bại (${response.statusCode})');
      }
    } catch (e) {
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Connection refused')) {
        throw Exception('Không thể kết nối đến máy chủ Backend.');
      }
      rethrow;
    }
  }

  static Future<List<dynamic>> getProducts() async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/products');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Lỗi tải sản phẩm');
  }
}
