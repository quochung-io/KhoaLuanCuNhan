// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/data/models/product_model.dart
// MÔ TẢ: Tầng dữ liệu & kết nối API (product_model.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';

class Product {
  final int id;
  final String name;
  final int price;
  final String unit;
  final String category; // 'Rau củ', 'Trái cây', 'Thực phẩm'
  final String cert;
  final String region;
  final double rating;
  final int reviews;
  final IconData icon;
  final Color color;
  final String lot;
  final String description;
  final String? imageUrl;
  final List<String> images;
  final String? originFarm;
  final int? stockQuantity;
  final bool isOutOfStock;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    this.category = 'Rau củ',
    required this.cert,
    required this.region,
    required this.rating,
    required this.reviews,
    required this.icon,
    required this.color,
    required this.lot,
    required this.description,
    this.imageUrl,
    this.images = const [],
    this.originFarm,
    this.stockQuantity,
    this.isOutOfStock = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    IconData getIcon(String cat) {
      if (cat.contains('Rau')) return Icons.eco_outlined;
      if (cat.contains('Trái cây')) return Icons.spa_outlined;
      return Icons.shopping_basket_outlined;
    }

    Color getColor(String cat) {
      if (cat.contains('Rau')) return const Color(0xFF2E7D32);
      if (cat.contains('Trái cây')) return const Color(0xFFFF9800);
      return const Color(0xFFC0392B);
    }

    String categoryStr = 'Khác';
    if (json['category'] is Map) {
      categoryStr = json['category']['categoryName'] ?? 'Khác';
    } else if (json['category'] is String) {
      categoryStr = json['category'];
    }

    // Handle image URLs from productImages list or direct imageUrl
    String? imgUrl = json['imageUrl'] ?? json['ImageUrl'];
    final pImages = json['productImages'] ?? json['ProductImages'];
    final List<String> extractedImages = [];

    if (pImages is List && pImages.isNotEmpty) {
      for (final item in pImages) {
        if (item is Map) {
          final u = (item['imageUrl'] ?? item['ImageUrl'])?.toString();
          if (u != null && u.trim().isNotEmpty && !extractedImages.contains(u.trim())) {
            if (item['isPrimary'] == true || item['IsPrimary'] == true) {
              extractedImages.insert(0, u.trim());
              imgUrl = u.trim();
            } else {
              extractedImages.add(u.trim());
            }
          }
        } else if (item is String && item.trim().isNotEmpty && !extractedImages.contains(item.trim())) {
          extractedImages.add(item.trim());
        }
      }
    }

    if (imgUrl != null && imgUrl.isNotEmpty && !extractedImages.contains(imgUrl)) {
      extractedImages.insert(0, imgUrl);
    }

    // Nếu chỉ có 1 ảnh hoặc ít hơn, bổ sung thêm ảnh phụ chất lượng cao theo ngành hàng (như trên Web Store)
    if (extractedImages.length < 3) {
      final nameLower = (json['productName'] ?? json['name'] ?? '').toString().toLowerCase();
      final catLower = categoryStr.toLowerCase();
      List<String> fallbackSubImages = [];

      if (catLower.contains('trái cây') || nameLower.contains('cam') || nameLower.contains('bưởi') || nameLower.contains('dâu') || nameLower.contains('bơ') || nameLower.contains('sầu riêng') || nameLower.contains('xoài')) {
        fallbackSubImages = [
          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80',
        ];
      } else if (catLower.contains('hạt') || catLower.contains('gạo') || nameLower.contains('gạo') || nameLower.contains('hạt') || nameLower.contains('ngô')) {
        fallbackSubImages = [
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1536591375315-1b838421c0f0?w=800&auto=format&fit=crop&q=80',
        ];
      } else if (catLower.contains('thơm') || nameLower.contains('hành') || nameLower.contains('ngò') || nameLower.contains('húng')) {
        fallbackSubImages = [
          'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
        ];
      } else {
        fallbackSubImages = [
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80',
        ];
      }

      for (final fb in fallbackSubImages) {
        if (!extractedImages.contains(fb)) {
          extractedImages.add(fb);
        }
        if (extractedImages.length >= 4) break;
      }
    }

    if (imgUrl == null && extractedImages.isNotEmpty) {
      imgUrl = extractedImages.first;
    }

    final pId =
        (json['productId'] ??
                json['ProductId'] ??
                json['id'] ??
                json['Id'] ??
                0)
            as int;

    // Handle Lot / Batch Code
    String lotCode = '';
    final batches =
        json['productBatches'] ??
        json['ProductBatches'] ??
        json['batches'] ??
        json['Batches'];
    if (batches is List && batches.isNotEmpty) {
      final firstBatch = batches[0];
      if (firstBatch is Map) {
        final bCode = firstBatch['batchCode'] ?? firstBatch['BatchCode'];
        if (bCode != null && bCode.toString().isNotEmpty) {
          lotCode = bCode.toString();
        }
      }
    }
    if (lotCode.isEmpty) {
      final directLot =
          json['lotCode'] ??
          json['LotCode'] ??
          json['lot'] ??
          json['Lot'] ??
          json['batchCode'] ??
          json['BatchCode'];
      if (directLot != null &&
          directLot.toString().isNotEmpty &&
          directLot.toString() != 'LOT#UNKNOWN') {
        lotCode = directLot.toString();
      }
    }
    if (lotCode.isEmpty || lotCode == 'LOT#UNKNOWN') {
      lotCode = 'LOT-DL-${pId.toString().padLeft(3, '0')}';
    }

    String pName =
        (json['productName'] ??
                json['ProductName'] ??
                json['name'] ??
                json['Name'] ??
                json['title'] ??
                '')
            .toString();
    if (pName.trim().isEmpty) {
      pName = 'Nông sản VietGAP #$pId';
    }

    return Product(
      id: pId,
      name: pName,
      price: (json['price'] as num?)?.toInt() ?? 0,
      unit: (json['unit'] ?? 'kg').toString(),
      category: categoryStr,
      cert: (json['certification'] ?? 'VietGAP').toString(),
      region: (json['originFarm'] ?? json['origin'] ?? 'Đà Lạt').toString(),
      rating:
          ((json['averageRating'] ?? json['rating']) as num?)?.toDouble() ??
          5.0,
      reviews:
          ((json['reviewsCount'] ?? json['reviews']) as num?)?.toInt() ?? 0,
      icon: getIcon(categoryStr),
      color: getColor(categoryStr),
      lot: lotCode,
      description: (json['description'] ?? '').toString(),
      imageUrl: imgUrl,
      images: extractedImages,
      originFarm: json['originFarm']?.toString(),
      stockQuantity: ((json['availableStock'] ?? json['stockQuantity']) as num?)
          ?.toInt(),
      isOutOfStock:
          json['isOutOfStock'] == true ||
          (((json['availableStock'] ?? json['stockQuantity']) as num?)
                      ?.toInt() ??
                  1) <=
              0,
    );
  }
}

final List<Product> productsData = [];
