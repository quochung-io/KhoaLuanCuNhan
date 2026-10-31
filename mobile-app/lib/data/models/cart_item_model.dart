// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/data/models/cart_item_model.dart
// MÔ TẢ: Tầng dữ liệu & kết nối API (cart_item_model.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'product_model.dart';

class CartItem {
  final Product product;
  int qty;

  CartItem({required this.product, this.qty = 1});
}
