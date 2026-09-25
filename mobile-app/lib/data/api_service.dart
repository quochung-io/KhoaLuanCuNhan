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

  // Kiểm tra tính duy nhất của Email, Số điện thoại hoặc Họ tên trước khi đăng ký
  static Future<Map<String, dynamic>> checkUnique({
    String? fullName,
    String? email,
    String? phone,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/auth/check-unique');
    final payload = <String, dynamic>{};
    if (fullName != null) payload['fullName'] = fullName;
    if (email != null) payload['email'] = email;
    if (phone != null) payload['phone'] = phone;

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      final result = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return result as Map<String, dynamic>;
      } else {
        throw Exception(result['message'] ?? 'Thông tin đã tồn tại trên hệ thống (${response.statusCode})');
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

  // ── SẢN PHẨM & DANH MỤC ──────────────────────────────────────
  static Future<List<dynamic>> getCategories() async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/categories');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  static Future<List<dynamic>> getProducts() async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/products');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      throw Exception('Lỗi tải sản phẩm');
    } catch (e) {
      rethrow;
    }
  }

  // ── THUẬT TOÁN GỢI Ý NGỮ CẢNH CARS ────────────────────────────
  static Future<Map<String, dynamic>> getContextAwareRecommendations({int? userId, int limit = 6}) async {
    // 1. Thử gọi gợi ý cá nhân hóa CARS đa nhân tố (For-You) nếu có user
    if (userId != null && userId > 0) {
      try {
        final uriForYou = Uri.parse('${AppConstants.baseUrl}/api/recommendations/for-you').replace(
          queryParameters: {'userId': userId.toString(), 'limit': limit.toString()},
        );
        final res = await http.get(uriForYou);
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          if (data is List && data.isNotEmpty) {
            return {
              'recommendations': data,
              'context': {
                'timeOfDay': 'Sáng nay',
                'weather': 'Mát mẻ (24°C)',
                'algorithm': 'CARS Đa Nhân Tố (Mùa vụ x Độ tươi x Khoảng cách)',
              },
            };
          }
        }
      } catch (_) {}
    }

    // 2. Gợi ý nông sản chính vụ theo mùa (In-Season CARS)
    try {
      final uriInSeason = Uri.parse('${AppConstants.baseUrl}/api/recommendations/in-season').replace(
        queryParameters: {'limit': limit.toString()},
      );
      final response = await http.get(uriInSeason);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List && data.isNotEmpty) {
          return {
            'recommendations': data,
            'context': {
              'timeOfDay': 'Hôm nay',
              'weather': 'Đang rộ vụ thu hoạch',
              'algorithm': 'CARS Mùa Vụ Sinh Học & Độ Tươi F(i)',
            },
          };
        }
      }
      return {};
    } catch (_) {
      return {};
    }
  }

  static Future<void> trackRecommendation({
    required int productId,
    required String eventType, // 'view' | 'click' | 'cart' | 'purchase'
    int? userId,
    String? contextUsed,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/recommendations/track');
    try {
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'productId': productId,
          'eventType': eventType,
          'userId': userId,
          'contextUsed': contextUsed ?? 'mobile_app',
        }),
      );
    } catch (_) {
      // Background silent track
    }
  }

  // ── ĐƠN HÀNG (ORDERS) ─────────────────────────────────────────
  static Future<List<dynamic>> getCustomerOrders(int customerId) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/orders/customer/$customerId');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  static Future<Map<String, dynamic>> getOrderById(int orderId) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/orders/$orderId');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      throw Exception('Không tìm thấy đơn hàng');
    } catch (e) {
      rethrow;
    }
  }

  static Future<bool> cancelOrder(int orderId, {String? reason}) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/orders/$orderId/status');
    try {
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'orderStatus': 'Cancelled',
          'note': reason ?? 'Khách hàng hủy đơn trên Mobile App',
        }),
      );
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (_) {
      return false;
    }
  }

  // ── HỒ SƠ & TÀI KHOẢN (USERS) ─────────────────────────────────
  static Future<Map<String, dynamic>> updateProfile(
    int userId, {
    required String fullName,
    required String email,
    required String phone,
    String? avatarUrl,
    String? password,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/users/$userId');
    try {
      final payload = <String, dynamic>{
        'fullName': fullName,
        'email': email,
        'phone': phone,
        if (avatarUrl != null && avatarUrl.isNotEmpty) 'avatarUrl': avatarUrl,
        if (password != null && password.isNotEmpty) 'password': password,
      };

      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['message'] ?? 'Cập nhật thông tin thất bại');
      }
    } catch (e) {
      rethrow;
    }
  }

  // ── ĐÁNH GIÁ (REVIEWS) ────────────────────────────────────────
  static Future<Map<String, dynamic>> getProductReviews(int productId, {int? currentUserId}) async {
    final uri = Uri.parse('${AppConstants.baseUrl}/api/reviews/product/$productId').replace(
      queryParameters: {
        if (currentUserId != null && currentUserId > 0) 'currentUserId': currentUserId.toString(),
      },
    );
    try {
      final response = await http.get(uri);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) {
          return data;
        } else if (data is List) {
          return {'reviews': data, 'totalReviews': data.length, 'averageRating': 5.0};
        }
      }
      return {'reviews': [], 'totalReviews': 0, 'averageRating': 5.0};
    } catch (_) {
      return {'reviews': [], 'totalReviews': 0, 'averageRating': 5.0};
    }
  }

  static Future<bool> submitReview({
    required int productId,
    required int customerId,
    required String customerName,
    required int rating,
    required String comment,
    List<String>? imageUrls,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/reviews');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'productId': productId,
          'customerId': customerId,
          'customerName': customerName,
          'rating': rating,
          'comment': comment,
          'imageUrls': imageUrls ?? [],
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  static Future<Map<String, dynamic>?> toggleReviewHelpful({
    required int reviewId,
    required int userId,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/reviews/$reviewId/helpful?userId=$userId');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId}),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  static Future<Map<String, dynamic>?> replyReview({
    required int reviewId,
    required int customerId,
    required String customerName,
    required String comment,
  }) async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/reviews/$reviewId/reply');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'customerId': customerId,
          'customerName': customerName,
          'comment': comment,
        }),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // ── TRUY XUẤT LÔ HÀNG (BATCHES) ───────────────────────────────
  static Future<List<dynamic>> getProductBatches() async {
    final url = Uri.parse('${AppConstants.baseUrl}/api/productbatches');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
      return [];
    } catch (_) {
      return [];
    }
  }
}
