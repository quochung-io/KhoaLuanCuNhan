import 'package:flutter/material.dart';
import '../../../data/models/cart_item_model.dart';

class CartScreen extends StatelessWidget {
  final List<CartItem> cartItems;
  final Function(int, int) onUpdateQty;
  final VoidCallback onCheckoutSuccess;

  const CartScreen({
    super.key,
    required this.cartItems,
    required this.onUpdateQty,
    required this.onCheckoutSuccess,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = cartItems.fold<int>(0, (sum, item) => sum + item.product.price * item.qty);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng của bạn'),
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: const Color(0xFF2E7D32).withOpacity(0.2)),
                  const SizedBox(height: 12),
                  const Text('Giỏ hàng trống', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B3A20))),
                  const SizedBox(height: 6),
                  const Text('Hãy chọn các bó rau tươi ngon ở tab Cửa hàng nhé.', style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return _buildCartItemTile(context, item);
                    },
                  ),
                ),
                _buildOrderSummaryPanel(context, totalAmount),
              ],
            ),
    );
  }

  Widget _buildCartItemTile(BuildContext context, CartItem item) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: item.product.color.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(item.product.icon, color: item.product.color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3A20)),
                ),
                const SizedBox(height: 2),
                Text(
                  'Đơn giá: ${item.product.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                ),
              ],
            ),
          ),
          // Điều khiển số lượng
          Row(
            children: [
              IconButton(
                onPressed: () => onUpdateQty(item.product.id, -1),
                icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF8D9E90), size: 20),
              ),
              Text(
                item.qty.toString(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              IconButton(
                onPressed: () => onUpdateQty(item.product.id, 1),
                icon: const Icon(Icons.add_circle_outline, color: Color(0xFF2E7D32), size: 20),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildOrderSummaryPanel(BuildContext context, int totalAmount) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tổng tiền hàng:', style: TextStyle(color: Color(0xFF4B5D50))),
                Text(
                  '${totalAmount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Phí vận chuyển:', style: TextStyle(color: Color(0xFF4B5D50))),
                Text(
                  'Miễn phí',
                  style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const Divider(color: Color(0xFFE1EAE0), height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Cần thanh toán:', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                Text(
                  '${totalAmount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                ),
              ],
            ),
            const SizedBox(height: 18),
            // Thanh toán giả lập (Mock Checkout Flow)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  _showMockCheckoutDialog(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                child: const Text('Thanh toán giả lập', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  void _showMockCheckoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.payment, color: Color(0xFFFF9800)),
              SizedBox(width: 8),
              Text('Giả lập thanh toán', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Đây là tính năng thanh toán giả lập (Sandbox) phục vụ việc chạy demo khóa luận tốt nghiệp.',
                style: TextStyle(fontSize: 13, color: Color(0xFF4B5D50), height: 1.4),
              ),
              SizedBox(height: 10),
              Text(
                'Hệ thống sẽ ghi nhận trạng thái đơn hàng là ĐÃ THANH TOÁN và trừ tồn kho các lô hàng tương ứng theo chuẩn FEFO.',
                style: TextStyle(fontSize: 13, color: Color(0xFF4B5D50), height: 1.4),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Hủy', style: TextStyle(color: Color(0xFF8D9E90))),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                onCheckoutSuccess();
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF2E7D32), size: 56),
                        const SizedBox(height: 14),
                        const Text('Đặt hàng thành công!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 6),
                        const Text(
                          'Đơn hàng của bạn đang được điều phối giao trong 2 giờ. Bạn có thể theo dõi hành trình ở mục Cá nhân.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50)),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
                          child: const Text('Đồng ý', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
              child: const Text('Xác nhận thanh toán', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
