import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../checkout/payment_qr_screen.dart';
import '../main_container.dart';
import 'order_detail_screen.dart';

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

class _OrdersManagementScreenState extends State<OrdersManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _allOrders = [];
  bool _isLoading = true;
  final String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 4,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 3),
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

  List<dynamic> _getOrdersForTab(int tabIndex) {
    return _allOrders.where((order) {
      final status = (order['orderStatus'] ?? 'pending').toString().toLowerCase();
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
      }
      if (!match) return false;

      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase().trim();
      final code = (order['orderCode'] ?? order['orderId'] ?? '').toString().toLowerCase();
      final items = (order['orderItems'] as List<dynamic>?) ?? [];
      final hasProduct = items.any((i) {
        final pName = (i['product']?['productName'] ?? i['productName'] ?? '').toString().toLowerCase();
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
              child: const Icon(Icons.receipt_long_outlined, size: 54, color: Color(0xFF2E7D32)),
            ),
            const SizedBox(height: 18),
            Text(
              message,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1B3A20)),
            ),
            const SizedBox(height: 8),
            const Text(
              'Chưa có đơn hàng nào tại mục này.\nHãy khám phá ngay các loại nông sản tươi ngon tại LÀNH Farm nhé!',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: const Text('Khám phá nông sản ngay', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    final status = (order['orderStatus'] ?? 'pending').toString();
    final paymentStatus = (order['paymentStatus'] ?? '').toString().toLowerCase();
    final paymentMethod = (order['paymentMethod'] ?? '').toString().toUpperCase();
    final isUnpaidNonCOD = paymentMethod != 'COD' && paymentStatus != 'paid' && status.toLowerCase() == 'pending';

    final items = (order['orderItems'] as List<dynamic>?) ?? [];
    final code = (order['orderCode'] ?? '#${order['orderId']}').toString();
    final total = (order['totalAmount'] as num?)?.toInt() ?? 0;
    final totalFormatted = total.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1EAE0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.storefront, size: 16, color: Color(0xFF2E7D32)),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          'LÀNH Farm Official',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1B3A20)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isUnpaidNonCOD) ...[
                      () {
                        final createdStr = order['createdAt']?.toString();
                        int remMins = 15;
                        if (createdStr != null && createdStr.isNotEmpty) {
                          final c = DateTime.tryParse(createdStr) ?? DateTime.now();
                          remMins = math.max(0, 15 - DateTime.now().difference(c).inMinutes);
                        }
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                          decoration: BoxDecoration(
                            color: remMins > 0 ? const Color(0xFFFFF3E0) : const Color(0xFFFFEBEE),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: remMins > 0 ? const Color(0xFFFFB74D) : Colors.red.shade300),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                remMins > 0 ? Icons.timer_outlined : Icons.timer_off_outlined,
                                size: 11,
                                color: remMins > 0 ? const Color(0xFFE65100) : Colors.red,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                remMins > 0 ? 'Còn ${remMins}p' : 'Hết hạn',
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  color: remMins > 0 ? const Color(0xFFE65100) : Colors.red,
                                ),
                              ),
                            ],
                          ),
                        );
                      }(),
                      const SizedBox(width: 6),
                    ],
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: _getStatusColor(status).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _getStatusText(status),
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: _getStatusColor(status),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF0F0F0)),

          // Danh sách sản phẩm (tối đa 2 sản phẩm hiển thị tóm tắt)
          ...items.take(2).map((item) {
            final pName = item['product']?['productName'] ?? item['productName'] ?? 'Nông sản LÀNH';
            final qty = item['quantity'] ?? 1;
            final price = (item['unitPrice'] as num?)?.toInt() ?? 0;
            final priceFmt = price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.eco, color: Color(0xFF2E7D32), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Số lượng: x$qty',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '$priceFmt₫',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2E7D32)),
                  ),
                ],
              ),
            );
          }),

          if (items.length > 2)
            Padding(
              padding: const EdgeInsets.only(left: 12, bottom: 8),
              child: Text(
                'và ${items.length - 2} sản phẩm khác...',
                style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.grey),
              ),
            ),

          const Divider(height: 1, color: Color(0xFFF0F0F0)),

          // Footer Card: Mã đơn & Tổng tiền & Nút xem chi tiết
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Mã: $code', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                      const SizedBox(height: 2),
                      FittedBox(
                        alignment: Alignment.centerLeft,
                        fit: BoxFit.scaleDown,
                        child: Row(
                          children: [
                            const Text('Thành tiền: ', style: TextStyle(fontSize: 12, color: Colors.black87)),
                            Text(
                              '$totalFormatted₫',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isUnpaidNonCOD) ...[
                      ElevatedButton.icon(
                        onPressed: () {
                          final rawId = order['orderId'] ?? order['id'];
                          final int oId = rawId is num ? rawId.toInt() : int.tryParse(rawId.toString()) ?? 0;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (ctx) => PaymentQRScreen(
                                orderId: oId,
                                orderCode: code,
                                totalAmount: total.toInt(),
                                paymentMethod: paymentMethod.contains('BANK') ? 'BankApp' : 'QRCode',
                                userId: widget.userId,
                                createdAt: DateTime.tryParse(order['createdAt']?.toString() ?? ''),
                              ),
                            ),
                          ).then((_) => _fetchOrders());
                        },
                        icon: const Icon(Icons.qr_code, size: 14, color: Colors.white),
                        label: const Text('Thanh toán', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE65100),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          elevation: 0,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                      const SizedBox(width: 6),
                    ] else ...[
                      OutlinedButton(
                        onPressed: () {
                          final items = (order['orderItems'] as List<dynamic>?) ?? [];
                          bool hasItems = false;
                          for (var item in items) {
                            final p = item['product'];
                            if (p != null) {
                              final product = Product(
                                id: p['productId'] ?? p['id'] ?? 0,
                                name: p['productName'] ?? p['name'] ?? 'Sản phẩm',
                                price: (p['price'] ?? 0).toInt(),
                                imageUrl: p['imageUrl'] ?? '',
                                unit: p['unit'] ?? 'kg',
                                category: p['type'] ?? 'product',
                                stockQuantity: 999, // dummy
                                description: '',
                                lot: '',
                                cert: 'VietGAP',
                                region: 'Việt Nam',
                                rating: 5.0,
                                reviews: 0,
                                icon: Icons.eco_outlined,
                                color: const Color(0xFF2E7D32),
                              );
                              
                              final qtyRaw = item['quantity'] ?? 1;
                              final int qty = qtyRaw is num ? qtyRaw.toInt() : int.tryParse(qtyRaw.toString()) ?? 1;
                              
                              if (widget.onAddToCart != null) {
                                widget.onAddToCart!(product, qty: qty);
                                hasItems = true;
                              }
                            }
                          }
                          
                          if (hasItems) {
                            if (widget.onOpenCart != null) {
                              widget.onOpenCart!();
                            }
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Không có sản phẩm nào để mua lại'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF2E7D32)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Mua lại', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32))),
                      ),
                      const SizedBox(width: 8),
                    ],
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => OrderDetailScreen(
                              order: order,
                              userId: widget.userId,
                              onAddToCart: widget.onAddToCart,
                            ),
                          ),
                        ).then((_) => _fetchOrders());
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Xem chi tiết', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
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
              isScrollable: false,
              labelColor: const Color(0xFF2E7D32),
              unselectedLabelColor: const Color(0xFF6B7280),
              indicatorColor: const Color(0xFF2E7D32),
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
              tabs: const [
                Tab(text: 'Chờ xác nhận'),
                Tab(text: 'Chờ lấy hàng'),
                Tab(text: 'Chờ giao'),
                Tab(text: 'Đánh giá'),
              ],
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
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
                          itemBuilder: (ctx, i) => _buildOrderCard(_getOrdersForTab(0)[i]),
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
                          itemBuilder: (ctx, i) => _buildOrderCard(_getOrdersForTab(1)[i]),
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
                          itemBuilder: (ctx, i) => _buildOrderCard(_getOrdersForTab(2)[i]),
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
                          itemBuilder: (ctx, i) => _buildOrderCard(_getOrdersForTab(3)[i]),
                        ),
                ),
              ],
            ),
      ),
    );
  }
}
