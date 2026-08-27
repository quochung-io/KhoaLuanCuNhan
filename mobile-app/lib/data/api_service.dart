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

  static Future<List<dynamic>> getProducts() async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/products');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Lỗi tải sản phẩm');
  }
}
