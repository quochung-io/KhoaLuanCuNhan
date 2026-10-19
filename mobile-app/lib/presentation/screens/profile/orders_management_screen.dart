import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../checkout/payment_qr_screen.dart';
import '../main_container.dart';
import 'order_detail_screen.dart';
import 'review_order_screen.dart';

class OrdersManagementScreen extends StatefulWidget {
  final int initialTabIndex;
  final int userId;
  final Function(Product, {int qty})? onAddToCart;
  final VoidCallback? onOpenCart;

  const OrdersManagementScreen({
    super.key,
    this.initialTabIndex = 0,
    required this.userId,
    this.onAddToCart,
    this.onOpenCart,
  });

  @override
  State<OrdersManagementScreen> createState() => _OrdersManagementScreenState();
}

class _OrdersManagementScreenState extends State<OrdersManagementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _allOrders = [];
  bool _isLoading = true;
  final String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 5,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 4),
    );
    _fetchOrders();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoading = true);
    try {
      final orders = await ApiService.getCustomerOrders(widget.userId);
      if (mounted) {
        setState(() {
          _allOrders = orders;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleReorder(Map<String, dynamic> order) async {
    final items = (order['orderItems'] as List<dynamic>?) ?? [];
    if (items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đơn hàng không có sản phẩm nào để mua lại.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Hiển thị dialog loading kiểm tra tồn kho
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: Card(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: Color(0xFF2E7D32)),
                SizedBox(height: 14),
                Text(
                  'Đang kiểm tra tồn kho sản phẩm...',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    List<String> outOfStockNames = [];
    List<String> addedNames = [];

    try {
      // Lấy danh sách sản phẩm mới nhất từ máy chủ
      final liveProductsJson = await ApiService.getProducts();
      final Map<int, Product> liveProductMap = {};
      for (var json in liveProductsJson) {
        if (json is Map<String, dynamic>) {
          final prod = Product.fromJson(json);
          liveProductMap[prod.id] = prod;
        }
      }

      for (var item in items) {
        final p = item['product'] as Map<String, dynamic>?;
        final rawId = p?['productId'] ?? p?['id'] ?? item['productId'] ?? 0;
        final int pId = rawId is num
            ? rawId.toInt()
            : (int.tryParse(rawId.toString()) ?? 0);
        final String fallbackName =
            (p?['productName'] ??
                    p?['name'] ??
                    item['productName'] ??
                    'Sản phẩm #$pId')
                .toString();

        final qtyRaw = item['quantity'] ?? 1;
        final int qty = qtyRaw is num
            ? qtyRaw.toInt()
            : (int.tryParse(qtyRaw.toString()) ?? 1);

        // Lấy thông tin sản phẩm cập nhật
        Product? liveProd = liveProductMap[pId];
        if (liveProd == null && pId > 0) {
          final singleJson = await ApiService.getProductById(pId);
          if (singleJson != null) {
            liveProd = Product.fromJson(singleJson);
          }
        }

        if (liveProd == null) {
          outOfStockNames.add(fallbackName);
        } else if (liveProd.isOutOfStock ||
            (liveProd.stockQuantity != null && liveProd.stockQuantity! <= 0)) {
          outOfStockNames.add(liveProd.name);
        } else {
          int addQty = qty;
          if (liveProd.stockQuantity != null && liveProd.stockQuantity! < qty) {
            addQty = liveProd.stockQuantity!;
          }

          if (widget.onAddToCart != null && addQty > 0) {
            widget.onAddToCart!(liveProd, qty: addQty);
            addedNames.add(liveProd.name);
          }
        }
      }
    } catch (e) {
      debugPrint('Lỗi khi kiểm tra tồn kho: $e');
    } finally {
      if (mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }

    if (!mounted) return;

    if (addedNames.isEmpty) {
      _showOutOfStockNotice(context, outOfStockNames);
    } else if (outOfStockNames.isNotEmpty) {
      final outStr = outOfStockNames.join(', ');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Đã thêm các món còn hàng. "$outStr" tạm hết hàng.',
                  style: const TextStyle(fontSize: 12.5),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.orange.shade800,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
      if (widget.onOpenCart != null) {
        widget.onOpenCart!();
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Đã thêm ${addedNames.length} sản phẩm vào giỏ hàng thành công!',
          ),
          backgroundColor: const Color(0xFF2E7D32),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
      if (widget.onOpenCart != null) {
        widget.onOpenCart!();
      }
    }
  }

  void _showOutOfStockNotice(
    BuildContext context,
    List<String> outOfStockNames,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 18),
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFECACA), width: 1.5),
              ),
              child: const Icon(
                Icons.production_quantity_limits_rounded,
                color: Color(0xFFDC2626),
                size: 26,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Sản phẩm tạm hết hàng',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1B3A20),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Các nông sản sau hiện tại đã hết hàng:',
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 14),
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 200),
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: outOfStockNames.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final name = outOfStockNames[index];
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAF9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE5ECE5)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.eco_outlined,
                          size: 18,
                          color: Color(0xFF8D9E90),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            name,
                            style: const TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1B3A20),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Hết hàng',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFDC2626),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Đã hiểu',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<dynamic> _getOrdersForTab(int tabIndex) {
    return _allOrders.where((order) {
      final status = (order['orderStatus'] ?? 'pending')
          .toString()
          .toLowerCase();
      bool match = false;
      switch (tabIndex) {
        case 0: // Chờ xác nhận
          match = status == 'pending';
          break;
        case 1: // Chờ lấy hàng
          match = status == 'processing' || status == 'confirmed';
          break;
        case 2: // Chờ giao hàng
          match = status == 'shipping';
          break;
        case 3: // Đánh giá (Hoàn tất / Đã giao)
          match = status == 'delivered' || status == 'completed';
          break;
        case 4: // Đã hủy
          match = status == 'cancelled' || status == 'canceled';
          break;
      }
      if (!match) return false;

      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase().trim();
      final code = (order['orderCode'] ?? order['orderId'] ?? '')
          .toString()
          .toLowerCase();
      final items = (order['orderItems'] as List<dynamic>?) ?? [];
      final hasProduct = items.any((i) {
        final pName = (i['product']?['productName'] ?? i['productName'] ?? '')
            .toString()
            .toLowerCase();
        return pName.contains(q);
      });
      return code.contains(q) || hasProduct;
    }).toList();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange.shade700;
      case 'processing':
      case 'confirmed':
        return Colors.blue.shade700;
      case 'shipping':
        return Colors.teal.shade700;
      case 'delivered':
      case 'completed':
        return const Color(0xFF2E7D32);
      case 'cancelled':
      case 'canceled':
        return Colors.red.shade700;
      default:
        return Colors.grey.shade700;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
      case 'confirmed':
        return 'Đang chuẩn bị hàng';
      case 'shipping':
        return 'Đang vận chuyển';
      case 'delivered':
      case 'completed':
        return 'Giao thành công';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.receipt_long_outlined,
                size: 54,
                color: Color(0xFF2E7D32),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              message,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: Color(0xFF1B3A20),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Chưa có đơn hàng nào tại mục này.\nHãy khám phá ngay các loại nông sản tươi ngon tại LÀNH Farm nhé!',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF8D9E90),
                fontSize: 12,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
              child: const Text(
                'Khám phá nông sản ngay',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openOrderDetail(dynamic order) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => OrderDetailScreen(
          order: order,
          userId: widget.userId,
          onAddToCart: widget.onAddToCart,
          onOpenCart: widget.onOpenCart,
        ),
      ),
    ).then((_) => _fetchOrders());
  }

  Widget _buildOrderCard(dynamic order) {
    final status = (order['orderStatus'] ?? 'pending').toString();
    final paymentStatus = (order['paymentStatus'] ?? '')
        .toString()
        .toLowerCase();
    final paymentMethod = (order['paymentMethod'] ?? '')
        .toString()
        .toUpperCase();
    final isUnpaidNonCOD =
        paymentMethod != 'COD' &&
        paymentStatus != 'paid' &&
        status.toLowerCase() == 'pending';

    final items = (order['orderItems'] as List<dynamic>?) ?? [];
    final code = (order['orderCode'] ?? '#${order['orderId']}').toString();
    final total = (order['totalAmount'] as num?)?.toInt() ?? 0;
    final totalFormatted = total.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );

    // Tính tổng số lượng món hàng
    final int totalItemsCount = items.fold<int>(0, (sum, i) {
      final q = i['quantity'];
      return sum + (q is num ? q.toInt() : (int.tryParse(q?.toString() ?? '') ?? 1));
    });

    // Định dạng thời gian đặt hàng
    final createdStr = order['createdAt']?.toString();
    String orderDateFmt = '';
    if (createdStr != null && createdStr.isNotEmpty) {
      final d = DateTime.tryParse(createdStr);
      if (d != null) {
        orderDateFmt =
            '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2EBE2), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.035),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _openOrderDetail(order),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Header Card: Store Info & Status
              Container(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
                decoration: const BoxDecoration(
                  color: Color(0xFFFAFCFA),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFFC8E6C9),
                              width: 0.8,
                            ),
                          ),
                          child: const Icon(
                            Icons.storefront_rounded,
                            size: 15,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'LÀNH Farm Official',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                            color: Color(0xFF1B3A20),
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.verified_rounded,
                          size: 14,
                          color: Color(0xFF2E7D32),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _getStatusColor(status).withValues(alpha: 0.3),
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            _getStatusText(status),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _getStatusColor(status),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.tag_rounded,
                          size: 13,
                          color: Color(0xFF757575),
                        ),
                        const SizedBox(width: 2),
                        Text(
                          'Mã: $code',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF616161),
                          ),
                        ),
                        const Spacer(),
                        if (orderDateFmt.isNotEmpty) ...[
                          const Icon(
                            Icons.access_time_rounded,
                            size: 12,
                            color: Color(0xFF9E9E9E),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            orderDateFmt,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF757575),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (isUnpaidNonCOD) ...[
                      const SizedBox(height: 8),
                      () {
                        int remMins = 15;
                        if (createdStr != null && createdStr.isNotEmpty) {
                          final c =
                              DateTime.tryParse(createdStr) ?? DateTime.now();
                          remMins = math.max(
                            0,
                            15 - DateTime.now().difference(c).inMinutes,
                          );
                        }
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: remMins > 0
                                ? const Color(0xFFFFF8E1)
                                : const Color(0xFFFFEBEE),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: remMins > 0
                                  ? const Color(0xFFFFD54F)
                                  : const Color(0xFFFFCDD2),
                              width: 0.8,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                remMins > 0
                                    ? Icons.alarm_rounded
                                    : Icons.timer_off_outlined,
                                size: 14,
                                color: remMins > 0
                                    ? const Color(0xFFE65100)
                                    : Colors.red,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  remMins > 0
                                      ? 'Vui lòng thanh toán trong $remMins phút để giữ đơn'
                                      : 'Đơn hàng chưa thanh toán đã hết hạn hiệu lực',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: remMins > 0
                                        ? const Color(0xFFBF360C)
                                        : Colors.red.shade900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }(),
                    ],
                  ],
                ),
              ),
              const Divider(height: 1, thickness: 1, color: Color(0xFFF0F5F0)),

              // 2. Body: Danh sách sản phẩm (tối đa 2 sản phẩm hiển thị tóm tắt)
              ...items.take(2).map((item) {
                final prod = item['product'] as Map<String, dynamic>?;
                final pName =
                    prod?['productName'] ?? item['productName'] ?? 'Nông sản LÀNH';
                final qty = item['quantity'] ?? 1;
                final price = (item['unitPrice'] as num?)?.toInt() ?? 0;
                final priceFmt = price.toString().replaceAllMapped(
                  RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                  (Match m) => '${m[1]}.',
                );

                final images = prod?['productImages'] as List<dynamic>?;
                String? rawImg;
                if (images != null && images.isNotEmpty) {
                  final primary = images.firstWhere(
                    (img) =>
                        img is Map &&
                        (img['isPrimary'] == true || img['IsPrimary'] == true),
                    orElse: () => images[0],
                  );
                  if (primary is Map) {
                    rawImg = (primary['imageUrl'] ?? primary['ImageUrl'])
                        ?.toString();
                  }
                }
                rawImg ??=
                    (prod?['imageUrl'] ??
                            prod?['ImageUrl'] ??
                            item['imageUrl'] ??
                            item['ImageUrl'])
                        ?.toString();

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: const Color(0xFFE2EBE2),
                            width: 0.8,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(9),
                          child: (rawImg != null && rawImg.trim().isNotEmpty)
                              ? Image.network(
                                  ApiService.fixImageUrl(rawImg),
                                  width: 58,
                                  height: 58,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      _buildFallbackImg(58),
                                )
                              : _buildFallbackImg(58),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              pName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                                color: Color(0xFF1B3A20),
                                height: 1.25,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 7,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    'x$qty',
                                    style: const TextStyle(
                                      color: Color(0xFF4A6B4E),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                Text(
                                  '$priceFmt₫',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: Color(0xFF2E7D32),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),

              if (items.length > 2)
                Padding(
                  padding: const EdgeInsets.only(left: 14, right: 14, bottom: 10),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.more_horiz_rounded,
                        size: 14,
                        color: Color(0xFF757575),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Xem thêm ${items.length - 2} sản phẩm khác...',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontStyle: FontStyle.italic,
                          color: Color(0xFF5B6E5C),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

              const Divider(height: 1, thickness: 1, color: Color(0xFFF0F5F0)),

              // 3. Footer Card: Phương thức thanh toán, Tổng tiền & Nút hành động
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Payment method badge
                        () {
                          final isMoMo = paymentMethod.contains('MOMO');
                          final isCod = paymentMethod == 'COD';
                          final bg = isMoMo
                              ? const Color(0xFFFCE4EC)
                              : (isCod
                                  ? const Color(0xFFE8F5E9)
                                  : const Color(0xFFE3F2FD));
                          final borderCol = isMoMo
                              ? const Color(0xFFF8BBD0)
                              : (isCod
                                  ? const Color(0xFFC8E6C9)
                                  : const Color(0xFFBBDEFB));
                          final textCol = isMoMo
                              ? const Color(0xFFD82D8B)
                              : (isCod
                                  ? const Color(0xFF2E7D32)
                                  : const Color(0xFF1565C0));
                          final icon = isMoMo
                              ? Icons.account_balance_wallet_rounded
                              : (isCod
                                  ? Icons.local_shipping_outlined
                                  : Icons.qr_code_2_rounded);
                          final label = isMoMo
                              ? 'MoMo'
                              : (isCod ? 'Tiền mặt (COD)' : 'Chuyển khoản QR');

                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3.5,
                            ),
                            decoration: BoxDecoration(
                              color: bg,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: borderCol, width: 0.7),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(icon, size: 12, color: textCol),
                                const SizedBox(width: 4),
                                Text(
                                  label,
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w600,
                                    color: textCol,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }(),
                        const Spacer(),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              'Tổng ($totalItemsCount món): ',
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: Color(0xFF616161),
                              ),
                            ),
                            Text(
                              '$totalFormatted₫',
                              style: const TextStyle(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        OutlinedButton(
                          onPressed: () => _openOrderDetail(order),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFCFD8DC)),
                            foregroundColor: const Color(0xFF455A64),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 7,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            'Chi tiết',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (isUnpaidNonCOD) ...[
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: () {
                              final rawId = order['orderId'] ?? order['id'];
                              final int oId = rawId is num
                                  ? rawId.toInt()
                                  : int.tryParse(rawId.toString()) ?? 0;
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => PaymentQRScreen(
                                    orderId: oId,
                                    orderCode: code,
                                    totalAmount: total.toInt(),
                                    paymentMethod: paymentMethod.contains('MOMO')
                                        ? 'MoMo'
                                        : 'QRCode',
                                    userId: widget.userId,
                                    createdAt: DateTime.tryParse(
                                      order['createdAt']?.toString() ?? '',
                                    ),
                                  ),
                                ),
                              ).then((_) => _fetchOrders());
                            },
                            icon: const Icon(
                              Icons.qr_code_scanner_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'Thanh toán ngay',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE65100),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 7,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 0,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ),
                        ] else ...[
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: () => _handleReorder(order),
                            icon: const Icon(
                              Icons.replay_rounded,
                              size: 13,
                              color: Color(0xFF2E7D32),
                            ),
                            label: const Text(
                              'Mua lại',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF2E7D32)),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 7,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ),
                        ],
                        if (status.toLowerCase() == 'delivered' ||
                            status.toLowerCase() == 'completed') ...[
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => ReviewOrderScreen(
                                    order: order,
                                    userId: widget.userId,
                                  ),
                                ),
                              ).then((res) {
                                if (res == true) {
                                  _fetchOrders();
                                }
                              });
                            },
                            icon: const Icon(
                              Icons.star_rate_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'Đánh giá',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF57C00),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 7,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 0,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleBack() {
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    } else {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (c) => const MainContainer()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _handleBack();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7FAF7),
        appBar: AppBar(
          title: const Text('Đơn mua của tôi'),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF1B3A20),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _handleBack,
            tooltip: 'Quay lại',
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(48),
            child: Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                labelPadding: const EdgeInsets.symmetric(horizontal: 16),
                labelColor: const Color(0xFF2E7D32),
                unselectedLabelColor: const Color(0xFF6B7280),
                indicatorColor: const Color(0xFF2E7D32),
                indicatorWeight: 3,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.normal,
                  fontSize: 13,
                ),
                tabs: const [
                  Tab(text: 'Chờ xác nhận'),
                  Tab(text: 'Chờ lấy hàng'),
                  Tab(text: 'Chờ giao'),
                  Tab(text: 'Đánh giá'),
                  Tab(text: 'Đã hủy'),
                ],
              ),
            ),
          ),
        ),
        body: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
              )
            : TabBarView(
                controller: _tabController,
                children: [
                  // Tab 0: Chờ xác nhận
                  RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: const Color(0xFF2E7D32),
                    child: _getOrdersForTab(0).isEmpty
                        ? _buildEmptyState('Chưa có đơn hàng chờ xác nhận')
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _getOrdersForTab(0).length,
                            itemBuilder: (ctx, i) =>
                                _buildOrderCard(_getOrdersForTab(0)[i]),
                          ),
                  ),

                  // Tab 1: Chờ lấy hàng
                  RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: const Color(0xFF2E7D32),
                    child: _getOrdersForTab(1).isEmpty
                        ? _buildEmptyState('Chưa có đơn hàng đang chuẩn bị')
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _getOrdersForTab(1).length,
                            itemBuilder: (ctx, i) =>
                                _buildOrderCard(_getOrdersForTab(1)[i]),
                          ),
                  ),

                  // Tab 2: Chờ giao hàng
                  RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: const Color(0xFF2E7D32),
                    child: _getOrdersForTab(2).isEmpty
                        ? _buildEmptyState('Chưa có đơn hàng đang giao')
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _getOrdersForTab(2).length,
                            itemBuilder: (ctx, i) =>
                                _buildOrderCard(_getOrdersForTab(2)[i]),
                          ),
                  ),

                  // Tab 3: Đánh giá
                  RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: const Color(0xFF2E7D32),
                    child: _getOrdersForTab(3).isEmpty
                        ? _buildEmptyState('Chưa có đơn hàng cần đánh giá')
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _getOrdersForTab(3).length,
                            itemBuilder: (ctx, i) =>
                                _buildOrderCard(_getOrdersForTab(3)[i]),
                          ),
                  ),

                  // Tab 4: Đã hủy
                  RefreshIndicator(
                    onRefresh: _fetchOrders,
                    color: const Color(0xFF2E7D32),
                    child: _getOrdersForTab(4).isEmpty
                        ? _buildEmptyState('Chưa có đơn hàng nào bị hủy')
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: _getOrdersForTab(4).length,
                            itemBuilder: (ctx, i) =>
                                _buildOrderCard(_getOrdersForTab(4)[i]),
                          ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildFallbackImg([double size = 48]) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(Icons.eco, color: const Color(0xFF2E7D32), size: size * 0.5),
    );
  }
}
