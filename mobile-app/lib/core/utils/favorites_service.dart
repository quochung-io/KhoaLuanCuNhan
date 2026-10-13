import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/models/product_model.dart';
import '../../data/models/combo_model.dart';

class FavoritesService {
  static const String _productKey = 'user_favorites';
  static const String _comboKey = 'user_favorite_combos';

  // ── Sản phẩm Nông sản ──
  static Future<List<Product>> getFavoriteProducts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_productKey) ?? [];
      return list.map((s) => Product.fromJson(jsonDecode(s) as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<bool> isFavoriteProduct(int productId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_productKey) ?? [];
      return list.any((s) {
        final m = jsonDecode(s) as Map<String, dynamic>;
        final id = (m['id'] ?? m['productId']) as num?;
        return id?.toInt() == productId;
      });
    } catch (_) {
      return false;
    }
  }

  static Future<bool> toggleFavoriteProduct(Product p) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_productKey) ?? [];
    final idx = list.indexWhere((s) {
      final m = jsonDecode(s) as Map<String, dynamic>;
      final id = (m['id'] ?? m['productId']) as num?;
      return id?.toInt() == p.id;
    });

    bool isNowFav;
    if (idx >= 0) {
      list.removeAt(idx);
      isNowFav = false;
    } else {
      list.add(jsonEncode({
        'id': p.id,
        'productId': p.id,
        'name': p.name,
        'productName': p.name,
        'price': p.price,
        'unit': p.unit,
        'category': p.category,
        'certification': p.cert,
        'origin': p.region,
        'rating': p.rating,
        'reviewsCount': p.reviews,
        'lotCode': p.lot,
        'description': p.description,
        'imageUrl': p.imageUrl,
      }));
      isNowFav = true;
    }

    await prefs.setStringList(_productKey, list);
    return isNowFav;
  }

  static Future<void> removeFavoriteProduct(int productId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_productKey) ?? [];
    list.removeWhere((s) {
      final m = jsonDecode(s) as Map<String, dynamic>;
      final id = (m['id'] ?? m['productId']) as num?;
      return id?.toInt() == productId;
    });
    await prefs.setStringList(_productKey, list);
  }

  // ── Combo Nông sản ──
  static Future<List<Map<String, dynamic>>> getFavoriteCombos() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_comboKey) ?? [];
      return list.map((s) => jsonDecode(s) as Map<String, dynamic>).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<bool> isFavoriteCombo(int comboId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_comboKey) ?? [];
      return list.any((s) {
        final m = jsonDecode(s) as Map<String, dynamic>;
        final id = (m['id'] ?? m['comboId']) as num?;
        return id?.toInt() == comboId;
      });
    } catch (_) {
      return false;
    }
  }

  static Future<bool> toggleFavoriteCombo(ComboPlan c) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_comboKey) ?? [];
    final idx = list.indexWhere((s) {
      final m = jsonDecode(s) as Map<String, dynamic>;
      final id = (m['id'] ?? m['comboId']) as num?;
      return id?.toInt() == c.id;
    });

    bool isNowFav;
    if (idx >= 0) {
      list.removeAt(idx);
      isNowFav = false;
    } else {
      list.add(jsonEncode({
        'id': c.id,
        'name': c.name,
        'desc': c.desc,
        'price': c.price,
        'rawPrice': c.rawPrice,
        'badge': c.badge,
        'supplierId': c.supplierId,
        'supplierName': c.supplierName,
        'imageUrl': c.imageUrl,
        'type': c.type,
      }));
      isNowFav = true;
    }

    await prefs.setStringList(_comboKey, list);
    return isNowFav;
  }

  static Future<void> removeFavoriteCombo(int comboId) async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_comboKey) ?? [];
    list.removeWhere((s) {
      final m = jsonDecode(s) as Map<String, dynamic>;
      final id = (m['id'] ?? m['comboId']) as num?;
      return id?.toInt() == comboId;
    });
    await prefs.setStringList(_comboKey, list);
  }
}
