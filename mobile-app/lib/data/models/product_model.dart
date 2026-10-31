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

    // Handle image URL from productImages list or direct imageUrl
    String? imgUrl = json['imageUrl'] ?? json['ImageUrl'];
    final pImages = json['productImages'] ?? json['ProductImages'];
    if ((imgUrl == null || imgUrl.isEmpty) &&
        pImages is List &&
        pImages.isNotEmpty) {
      final primaryImg = pImages.firstWhere(
        (img) =>
            img is Map &&
            (img['isPrimary'] == true || img['IsPrimary'] == true),
        orElse: () => pImages[0],
      );
      if (primaryImg is Map) {
        imgUrl = (primaryImg['imageUrl'] ?? primaryImg['ImageUrl'])?.toString();
      }
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
