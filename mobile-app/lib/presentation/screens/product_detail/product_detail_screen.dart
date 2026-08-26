import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../main_container.dart';

class ProductDetailScreen extends StatelessWidget {
  final Product product;
  final Function(Product) onAddToCart;

  const ProductDetailScreen({super.key, required this.product, required this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết nông sản'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hình ảnh icon đại diện sản phẩm
            Container(
              width: double.infinity,
              height: 220,
              decoration: BoxDecoration(
                color: product.color.withOpacity(0.06),
              ),
              child: Hero(
                tag: 'product-icon-${product.id}',
                child: Icon(
                  product.icon,
                  size: 100,
                  color: product.color,
                ),
              ),
            ),

            // Nội dung chi tiết
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tags chứng nhận
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F1E3),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.cert,
                          style: const TextStyle(color: Color(0xFF2E7D32), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Nguồn gốc: ${product.region}',
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Tên sản phẩm
                  Text(
                    product.name,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                  ),
                  const SizedBox(height: 8),

                  // Đánh giá sao
                  Row(
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFF9800), size: 18),
                      const SizedBox(width: 2),
                      Text(
                        product.rating.toString(),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${product.reviews} đánh giá)',
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Giá cả
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${product.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                      ),
                      Text(
                        ' / ${product.unit}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF8D9E90)),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFE1EAE0), height: 28),

                  // Mô tả sản phẩm
                  const Text(
                    'GIỚI THIỆU SẢN PHẨM',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    product.description,
                    style: const TextStyle(color: Color(0xFF4B5D50), fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 20),

                  // Thông tin mã lô sản phẩm (Truy xuất)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Mã lô truy xuất:', style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50))),
                            Text(
                              product.lot,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Sản phẩm này có nhật ký canh tác đầy đủ. Bạn có thể sử dụng mã lô trên để tra cứu toàn bộ nguồn gốc.',
                          style: TextStyle(fontSize: 11, color: Color(0xFF8D9E90), height: 1.3),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 36,
                          child: OutlinedButton(
                            onPressed: () {
                              // Đóng màn hình chi tiết và chuyển sang Tab Truy xuất nguồn gốc
                              Navigator.pop(context);
                              final mainState = context.findAncestorStateOfType<MainContainerState>();
                              if (mainState != null) {
                                mainState.navigateToTrace(product.lot);
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF2E7D32)),
                              foregroundColor: const Color(0xFF2E7D32),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.qr_code, size: 14),
                                SizedBox(width: 4),
                                Text('Xem nhật ký canh tác', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE1EAE0))),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: () {
                onAddToCart(product);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
              ),
              child: const Text('Thêm vào giỏ hàng', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ),
      ),
    );
  }
}
