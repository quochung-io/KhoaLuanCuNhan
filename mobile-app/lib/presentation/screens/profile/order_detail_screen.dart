// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/order_detail_screen.dart
// MÔ TẢ: Màn hình giao diện di động (order_detail_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import 'review_order_screen.dart';
import '../../../data/models/product_model.dart';
import '../checkout/payment_qr_screen.dart';

/// Lớp giao diện / trạng thái OrderDetailScreen
class OrderDetailScreen extends StatefulWidget {
  final Map<String, dynamic> order;
  final int? userId;
  final VoidCallback? onOrderUpdated;
  final Function(Product, {int qty})? onAddToCart;
  final VoidCallback? onOpenCart;

  const OrderDetailScreen({
    super.key,
    required this.order,
    this.userId,
    this.onOrderUpdated,
    this.onAddToCart,
    this.onOpenCart,
  });

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

/// Lớp giao diện / trạng thái _OrderDetailScreenState
class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late Map<String, dynamic> _currentOrder;
  bool _isLoading = false;
  Timer? _countdownTimer;
  int _remainingSeconds = 0;

  @override
  void initState() {
    super.initState();
    _currentOrder = widget.order;
    _initCountdown();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _initCountdown
  void _initCountdown() {
    final createdStr = _currentOrder['createdAt']?.toString();
    if (createdStr != null && createdStr.isNotEmpty) {
      final created = DateTime.tryParse(createdStr) ?? DateTime.now();
      final elapsed = DateTime.now().difference(created).inSeconds;
      _remainingSeconds = math.max(0, 15 * 60 - elapsed);
    } else {
      _remainingSeconds = 15 * 60;
    }

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        if (mounted) setState(() => _remainingSeconds--);
      } else {
        timer.cancel();
        _refreshOrderDetail();
      }
    });
  }

  String _formatCurrency(dynamic amount) {
    if (amount == null) return '0₫';
    final val = double.tryParse(amount.toString()) ?? 0;
    return '${val.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫';
  }

  int _getStatusStep(String? status) {
    final s = (status ?? 'pending').toLowerCase();
    if (s == 'cancelled') return -1;
    if (s == 'delivered' || s == 'completed') return 4;
    if (s == 'shipping') return 3;
    if (s == 'processing') return 2;
    return 1; // pending (đã xác nhận/chờ duyệt)
  }

  // Thực thi nghiệp vụ hàm _refreshOrderDetail
  Future<void> _refreshOrderDetail() async {
    final rawId = _currentOrder['orderId'] ?? _currentOrder['id'];
    final int? oId = rawId is num
        ? rawId.toInt()
        : int.tryParse(rawId?.toString() ?? '');
    if (oId == null || oId <= 0) return;
    try {
      final updated = await ApiService.getOrderById(oId);
      if (mounted) {
        setState(() {
          _currentOrder = updated;
        });
        widget.onOrderUpdated?.call();
      }
    } catch (_) {}
  }

  // Thực thi nghiệp vụ hàm _handleReorder
  Future<void> _handleReorder() async {
    final items = (_currentOrder['orderItems'] as List<dynamic>?) ?? [];
    if (items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đơn hàng không có sản phẩm nào để mua lại.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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

  // Thực thi nghiệp vụ hàm _showOutOfStockNotice
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

  // Thực thi nghiệp vụ hàm _showCancelReasonSheet
  void _showCancelReasonSheet() {
    final reasons = [
      'Tôi muốn cập nhật hoặc đổi địa chỉ nhận hàng',
      'Tôi muốn đổi số lượng hoặc thêm/bớt nông sản',
      'Tôi tìm thấy sản phẩm tương tự có giá tốt hơn',
      'Thời gian giao hàng dự kiến không phù hợp',
      'Tôi đổi ý, hiện không còn nhu cầu mua nữa',
      'Lý do khác',
    ];

    String selectedReason = reasons[0];
    final otherReasonCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final isOther = selectedReason == 'Lý do khác';
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                top: 12,
                left: 16,
                right: 16,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Thanh kéo nhỏ
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Lý do hủy đơn hàng',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B3A20),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(
                            Icons.close,
                            size: 20,
                            color: Colors.grey,
                          ),
                          onPressed: () => Navigator.pop(sheetCtx),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Vui lòng chọn 1 lý do để giúp LÀNH Farm cải thiện chất lượng phục vụ tốt hơn.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const Divider(height: 20),
                    ...reasons.map((r) {
                      final isSelected = selectedReason == r;
                      return InkWell(
                        onTap: () {
                          setSheetState(() => selectedReason = r);
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 2),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFFE8F5E9).withValues(alpha: 0.5)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Radio<String>(
                                value: r,
                                groupValue: selectedReason,
                                activeColor: const Color(0xFF2E7D32),
                                onChanged: (val) {
                                  if (val != null)
                                    setSheetState(() => selectedReason = val);
                                },
                              ),
                              Expanded(
                                child: Text(
                                  r,
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: isSelected
                                        ? FontWeight.w600
                                        : FontWeight.normal,
                                    color: isSelected
                                        ? const Color(0xFF1B3A20)
                                        : Colors.black87,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    if (isOther) ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: otherReasonCtrl,
                        maxLines: 2,
                        decoration: InputDecoration(
                          hintText: 'Nhập lý do chi tiết của bạn...',
                          hintStyle: TextStyle(
                            fontSize: 12.5,
                            color: Colors.grey.shade400,
                          ),
                          contentPadding: const EdgeInsets.all(12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(
                              color: Color(0xFF2E7D32),
                              width: 1.5,
                            ),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(sheetCtx),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: BorderSide(color: Colors.grey.shade300),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Giữ đơn hàng',
                              style: TextStyle(
                                color: Colors.black87,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () async {
                              final finalReason = isOther
                                  ? (otherReasonCtrl.text.trim().isNotEmpty
                                        ? otherReasonCtrl.text.trim()
                                        : 'Lý do khác')
                                  : selectedReason;

                              final messenger = ScaffoldMessenger.of(context);
                              Navigator.pop(sheetCtx);
                              setState(() => _isLoading = true);

                              final rawId =
                                  _currentOrder['orderId'] ??
                                  _currentOrder['id'];
                              final int orderId = rawId is num
                                  ? rawId.toInt()
                                  : int.tryParse(rawId.toString()) ?? 0;
                              final success = await ApiService.cancelOrder(
                                orderId,
                                reason: finalReason,
                              );
                              setState(() => _isLoading = false);

                              if (mounted) {
                                if (success) {
                                  setState(() {
                                    _currentOrder['orderStatus'] = 'Cancelled';
                                  });
                                  widget.onOrderUpdated?.call();
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Đã hủy đơn hàng thành công',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                } else {
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Không thể hủy đơn lúc này. Vui lòng thử lại.',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Xác nhận hủy đơn',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final oStatus = (_currentOrder['orderStatus'] ?? 'pending')
        .toString()
        .toLowerCase();
    final isCancelled = oStatus == 'cancelled';
    final pStatus = (_currentOrder['paymentStatus'] ?? '').toString();
    final isPaid = pStatus.toLowerCase() == 'paid';
    final isUnpaid = !isPaid && !isCancelled;
    final currentStep = _getStatusStep(oStatus);
    final items = (_currentOrder['orderItems'] as List<dynamic>?) ?? [];
    final address = _currentOrder['address'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        title: Text(
          'Đơn hàng #${_currentOrder['orderCode'] ?? _currentOrder['orderId'] ?? ''}',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        elevation: 0.5,
        backgroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // TIẾN TRÌNH ĐƠN HÀNG (TIMELINE STEPPER)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5ECE5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Text(
                                'TIẾN TRÌNH GIAO HÀNG',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                  color: Color(0xFF2E7D32),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            _buildStatusBadge(oStatus),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (isCancelled)
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEBEE),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                Icon(
                                  Icons.cancel_outlined,
                                  color: Colors.red,
                                  size: 20,
                                ),
                                SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Đơn hàng đã được hủy. Nông sản và chi phí đã được xử lý hoàn trả.',
                                    style: TextStyle(
                                      color: Colors.red,
                                      fontSize: 12.5,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          _buildStepper(currentStep),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // THÔNG TIN NHẬN HÀNG
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5ECE5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(
                              Icons.location_on_outlined,
                              color: Color(0xFF2E7D32),
                              size: 18,
                            ),
                            SizedBox(width: 8),
                            Text(
                              'ĐỊA CHỈ NHẬN HÀNG',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        Text(
                          address?['receiverName'] ??
                              _currentOrder['customer']?['fullName'] ??
                              'Khách hàng',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          address?['phone'] ??
                              _currentOrder['customer']?['phone'] ??
                              '0911000001',
                          style: TextStyle(
                            color: Colors.grey.shade700,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatAddress(address),
                          style: TextStyle(
                            color: Colors.grey.shade700,
                            fontSize: 13,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // DANH SÁCH NÔNG SẢN TRONG ĐƠN
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5ECE5)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'DANH SÁCH NÔNG SẢN',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                            Text(
                              '${items.length} món',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        ...items.map((item) {
                          final prod = item['product'] as Map<String, dynamic>?;
                          final prodName =
                              prod?['productName'] ??
                              item['productName'] ??
                              'Nông sản LÀNH';
                          final unit = prod?['unit'] ?? item['unit'] ?? 'kg';
                          final qty = item['quantity'] ?? 1;
                          final price =
                              item['unitPrice'] ?? prod?['price'] ?? 0;
                          final images =
                              prod?['productImages'] as List<dynamic>?;
                          String? imgUrl;
                          if (images != null && images.isNotEmpty) {
                            final primary = images.firstWhere(
                              (img) =>
                                  img is Map &&
                                  (img['isPrimary'] == true ||
                                      img['IsPrimary'] == true),
                              orElse: () => images[0],
                            );
                            if (primary is Map) {
                              imgUrl =
                                  (primary['imageUrl'] ?? primary['ImageUrl'])
                                      ?.toString();
                            }
                          }
                          imgUrl ??=
                              (prod?['imageUrl'] ??
                                      prod?['ImageUrl'] ??
                                      item['imageUrl'] ??
                                      item['ImageUrl'])
                                  ?.toString();

                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: imgUrl != null
                                      ? Image.network(
                                          ApiService.fixImageUrl(imgUrl),
                                          width: 50,
                                          height: 50,
                                          fit: BoxFit.cover,
                                          errorBuilder:
                                              (context, error, stackTrace) =>
                                                  _buildFallbackImg(),
                                        )
                                      : _buildFallbackImg(),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        prodName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13.5,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Số lượng: $qty $unit',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey.shade600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  _formatCurrency(price * qty),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                    color: Color(0xFF2E7D32),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // CHI TIẾT THANH TOÁN (Trùng khớp 100% với khung Chi tiết thanh toán bên Checkout)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(
                            0xFF1B3A20,
                          ).withValues(alpha: 0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Builder(
                      builder: (context) {
                        final rawItems =
                            (_currentOrder['orderItems'] ??
                                    _currentOrder['items'] ??
                                    [])
                                as List;
                        final double totalAmountVal =
                            double.tryParse(
                              (_currentOrder['totalAmount'] ??
                                      _currentOrder['TotalAmount'] ??
                                      0)
                                  .toString(),
                            ) ??
                            0.0;
                        final double shippingFeeVal =
                            double.tryParse(
                              (_currentOrder['shippingFee'] ??
                                      _currentOrder['ShippingFee'] ??
                                      0)
                                  .toString(),
                            ) ??
                            0.0;
                        final double discountAmountVal =
                            double.tryParse(
                              (_currentOrder['discountAmount'] ??
                                      _currentOrder['DiscountAmount'] ??
                                      0)
                                  .toString(),
                            ) ??
                            0.0;

                        double subtotalVal = 0.0;
                        final sRaw =
                            _currentOrder['subtotal'] ??
                            _currentOrder['Subtotal'];
                        if (sRaw != null) {
                          subtotalVal = double.tryParse(sRaw.toString()) ?? 0.0;
                        } else if (rawItems.isNotEmpty) {
                          for (var it in rawItems) {
                            final p =
                                double.tryParse(
                                  (it['unitPrice'] ?? it['price'] ?? 0)
                                      .toString(),
                                ) ??
                                0.0;
                            final q = (it['quantity'] is num
                                ? (it['quantity'] as num).toDouble()
                                : double.tryParse(
                                        (it['quantity'] ?? 1).toString(),
                                      ) ??
                                      1.0);
                            subtotalVal += p * q;
                          }
                        } else {
                          subtotalVal = math.max(
                            0.0,
                            totalAmountVal - shippingFeeVal + discountAmountVal,
                          );
                        }

                        // Nhận diện tên phương thức thanh toán chuẩn hóa
                        final rawMethod = (_currentOrder['paymentMethod'] ?? '')
                            .toString()
                            .toUpperCase();
                        String methodDisplay;
                        if (rawMethod.contains('MOMO')) {
                          methodDisplay = 'Thanh toán qua Ví MoMo';
                        } else if (rawMethod.contains('QR') ||
                            rawMethod.contains('BANK')) {
                          methodDisplay =
                              'Thanh toán qua QR Code (VietQR 24/7)';
                        } else {
                          methodDisplay = 'Thanh toán khi nhận hàng (COD)';
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Chi tiết thanh toán',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: Color(0xFF1B3A20),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tổng tiền hàng',
                                  style: TextStyle(
                                    color: Color(0xFF4B5D50),
                                    fontSize: 13.5,
                                  ),
                                ),
                                Text(
                                  _formatCurrency(subtotalVal),
                                  style: const TextStyle(fontSize: 13.5),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Phí vận chuyển',
                                  style: TextStyle(
                                    color: Color(0xFF4B5D50),
                                    fontSize: 13.5,
                                  ),
                                ),
                                Text(
                                  _formatCurrency(shippingFeeVal),
                                  style: const TextStyle(fontSize: 13.5),
                                ),
                              ],
                            ),
                            if (discountAmountVal > 0) ...[
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Row(
                                    children: [
                                      Icon(
                                        Icons.local_shipping,
                                        color: Color(0xFF166534),
                                        size: 16,
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        'LÀNH Voucher',
                                        style: TextStyle(
                                          color: Color(0xFF166534),
                                          fontSize: 13.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    '-${_formatCurrency(discountAmountVal)}',
                                    style: const TextStyle(
                                      color: Color(0xFF166534),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Phương thức',
                                  style: TextStyle(
                                    color: Color(0xFF4B5D50),
                                    fontSize: 13.5,
                                  ),
                                ),
                                Flexible(
                                  child: Text(
                                    methodDisplay,
                                    textAlign: TextAlign.right,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF1B3A20),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Trạng thái thanh toán',
                                  style: TextStyle(
                                    color: Color(0xFF4B5D50),
                                    fontSize: 13.5,
                                  ),
                                ),
                                _buildPaymentStatusBadge(isPaid),
                              ],
                            ),
                            const Divider(color: Color(0xFFE1EAE0), height: 22),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tổng thanh toán',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                    color: Color(0xFF1B3A20),
                                  ),
                                ),
                                Text(
                                  _formatCurrency(totalAmountVal),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 17,
                                    color: Color(0xFF2E7D32),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),

                  // HÀNH ĐỘNG
                  if (oStatus == 'pending') ...[
                    if (isUnpaid) ...[
                      SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            final rawId =
                                _currentOrder['orderId'] ?? _currentOrder['id'];
                            final int oId = rawId is num
                                ? rawId.toInt()
                                : int.tryParse(rawId.toString()) ?? 0;
                            final double total =
                                double.tryParse(
                                  _currentOrder['totalAmount']?.toString() ??
                                      '0',
                                ) ??
                                0.0;
                            final code =
                                (_currentOrder['orderCode'] ?? 'ORD$oId')
                                    .toString();
                            final payMethod =
                                (_currentOrder['paymentMethod'] ?? 'QRCode')
                                    .toString()
                                    .toUpperCase();
                            final isMoMoOrder = payMethod.contains('MOMO');
                            final uId =
                                widget.userId ??
                                _currentOrder['customerId'] ??
                                _currentOrder['userId'] ??
                                0;

                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PaymentQRScreen(
                                  orderId: oId,
                                  orderCode: code,
                                  totalAmount: total.toInt(),
                                  paymentMethod: isMoMoOrder
                                      ? 'MoMo'
                                      : 'QRCode',
                                  userId: uId,
                                  createdAt: DateTime.tryParse(
                                    _currentOrder['createdAt']?.toString() ??
                                        '',
                                  ),
                                  momoDeeplink:
                                      _currentOrder['momoDeeplink']
                                          ?.toString() ??
                                      _currentOrder['deeplink']?.toString(),
                                  momoPayUrl:
                                      _currentOrder['momoPayUrl']?.toString() ??
                                      _currentOrder['payUrl']?.toString(),
                                ),
                              ),
                            ).then((_) => _refreshOrderDetail());
                          },
                          icon: Icon(
                            (_currentOrder['paymentMethod'] ?? '')
                                    .toString()
                                    .toUpperCase()
                                    .contains('MOMO')
                                ? Icons.account_balance_wallet
                                : Icons.qr_code_scanner,
                            color: Colors.white,
                          ),
                          label: Text(
                            (_currentOrder['paymentMethod'] ?? '')
                                    .toString()
                                    .toUpperCase()
                                    .contains('MOMO')
                                ? 'THANH TOÁN MOMO NGAY'
                                : 'THANH TOÁN VIETQR NGAY',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                (_currentOrder['paymentMethod'] ?? '')
                                    .toString()
                                    .toUpperCase()
                                    .contains('MOMO')
                                ? const Color(0xFFA50064)
                                : const Color(0xFF2E7D32),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: OutlinedButton.icon(
                        onPressed: _showCancelReasonSheet,
                        icon: const Icon(
                          Icons.cancel_outlined,
                          color: Colors.red,
                        ),
                        label: const Text(
                          'HỦY ĐƠN HÀNG NÀY',
                          style: TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ] else if (oStatus == 'delivered' ||
                      oStatus == 'completed') ...[
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 46,
                            child: OutlinedButton.icon(
                              onPressed: _handleReorder,
                              icon: const Icon(
                                Icons.refresh,
                                color: Color(0xFF2E7D32),
                              ),
                              label: const Text(
                                'MUA LẠI',
                                style: TextStyle(
                                  color: Color(0xFF2E7D32),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(
                                  color: Color(0xFF2E7D32),
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 46,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        ReviewOrderScreen(order: _currentOrder),
                                  ),
                                );
                              },
                              icon: const Icon(
                                Icons.rate_review,
                                color: Colors.white,
                              ),
                              label: const Text(
                                'ĐÁNH GIÁ',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2E7D32),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else if (oStatus == 'cancelled') ...[
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton.icon(
                        onPressed: _handleReorder,
                        icon: const Icon(Icons.refresh, color: Colors.white),
                        label: const Text(
                          'MUA LẠI ĐƠN HÀNG NÀY',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildFallbackImg
  Widget _buildFallbackImg() {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.eco, color: Color(0xFF2E7D32), size: 24),
    );
  }

  String _formatAddress(Map<String, dynamic>? addr) {
    if (addr == null) return 'Địa chỉ đã lưu tại hệ thống';
    final parts = [
      addr['addressDetail'],
      addr['ward'],
      addr['district'],
      addr['province'],
    ].where((e) => e != null && e.toString().trim().isNotEmpty).toList();
    return parts.join(', ');
  }

  // Thực thi nghiệp vụ hàm _buildStatusBadge
  Widget _buildStatusBadge(String status) {
    Color bg;
    Color text;
    String label;

    switch (status) {
      case 'delivered':
      case 'completed':
        bg = const Color(0xFFE8F5E9);
        text = const Color(0xFF2E7D32);
        label = 'Đã hoàn tất';
        break;
      case 'shipping':
        bg = const Color(0xFFE3F2FD);
        text = const Color(0xFF1565C0);
        label = 'Đang giao hàng';
        break;
      case 'processing':
        bg = const Color(0xFFEDE7F6);
        text = const Color(0xFF5E35B1);
        label = 'Đang lấy hàng';
        break;
      case 'cancelled':
        bg = const Color(0xFFFFEBEE);
        text = const Color(0xFFC62828);
        label = 'Đã hủy';
        break;
      default:
        bg = const Color(0xFFFFF3E0);
        text = const Color(0xFFE65100);
        label = 'Chờ xác nhận';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: 11.5,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildStepper
  Widget _buildStepper(int currentStep) {
    final steps = [
      'Đã đặt hàng',
      'Đã xác nhận',
      'Lấy hàng & Đóng gói',
      'Đang giao Shipper',
      'Giao thành công',
    ];

    return Column(
      children: List.generate(steps.length, (index) {
        final isDone = index <= currentStep;
        final isCurrent = index == currentStep;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    color: isDone
                        ? const Color(0xFF2E7D32)
                        : Colors.grey.shade300,
                    shape: BoxShape.circle,
                  ),
                  child: isDone
                      ? const Icon(Icons.check, size: 14, color: Colors.white)
                      : null,
                ),
                if (index < steps.length - 1)
                  Container(
                    width: 2,
                    height: 28,
                    color: isDone && index < currentStep
                        ? const Color(0xFF2E7D32)
                        : Colors.grey.shade300,
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Text(
                  steps[index],
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isCurrent
                        ? FontWeight.bold
                        : (isDone ? FontWeight.w600 : FontWeight.normal),
                    color: isDone
                        ? const Color(0xFF1B3A20)
                        : Colors.grey.shade500,
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  // Thực thi nghiệp vụ hàm _buildPaymentStatusBadge
  Widget _buildPaymentStatusBadge(bool isPaid) {
    if (isPaid) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFFE8F5E9),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF81C784)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, size: 13, color: Color(0xFF2E7D32)),
            SizedBox(width: 4),
            Text(
              'Đã thanh toán',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2E7D32),
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF3E0),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFFFFB74D)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.access_time_rounded, size: 13, color: Color(0xFFE65100)),
            SizedBox(width: 4),
            Text(
              'Chưa thanh toán',
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.bold,
                color: Color(0xFFE65100),
              ),
            ),
          ],
        ),
      );
    }
  }
}
