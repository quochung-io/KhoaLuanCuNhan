import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import 'review_order_screen.dart';
import '../../../data/models/product_model.dart';
import '../checkout/payment_qr_screen.dart';

class OrderDetailScreen extends StatefulWidget {
  final Map<String, dynamic> order;
  final int? userId;
  final VoidCallback? onOrderUpdated;
  final Function(Product, {int qty})? onAddToCart;

  const OrderDetailScreen({
    super.key,
    required this.order,
    this.userId,
    this.onOrderUpdated,
    this.onAddToCart,
  });

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

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

  Future<void> _refreshOrderDetail() async {
    final rawId = _currentOrder['orderId'] ?? _currentOrder['id'];
    final int? oId = rawId is num ? rawId.toInt() : int.tryParse(rawId?.toString() ?? '');
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
                          icon: const Icon(Icons.close, size: 20, color: Colors.grey),
                          onPressed: () => Navigator.pop(sheetCtx),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Vui lòng chọn 1 lý do để giúp LÀNH Farm cải thiện chất lượng phục vụ tốt hơn.',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
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
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFE8F5E9).withValues(alpha: 0.5) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Radio<String>(
                                value: r,
                                groupValue: selectedReason,
                                activeColor: const Color(0xFF2E7D32),
                                onChanged: (val) {
                                  if (val != null) setSheetState(() => selectedReason = val);
                                },
                              ),
                              Expanded(
                                child: Text(
                                  r,
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                    color: isSelected ? const Color(0xFF1B3A20) : Colors.black87,
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
                          hintStyle: TextStyle(fontSize: 12.5, color: Colors.grey.shade400),
                          contentPadding: const EdgeInsets.all(12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5),
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
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Giữ đơn hàng', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
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

                              final rawId = _currentOrder['orderId'] ?? _currentOrder['id'];
                              final int orderId = rawId is num ? rawId.toInt() : int.tryParse(rawId.toString()) ?? 0;
                              final success = await ApiService.cancelOrder(orderId, reason: finalReason);
                              setState(() => _isLoading = false);

                              if (mounted) {
                                if (success) {
                                  setState(() {
                                    _currentOrder['orderStatus'] = 'Cancelled';
                                  });
                                  widget.onOrderUpdated?.call();
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text('Đã hủy đơn hàng thành công'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                } else {
                                  messenger.showSnackBar(
                                    const SnackBar(
                                      content: Text('Không thể hủy đơn lúc này. Vui lòng thử lại.'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              elevation: 0,
                            ),
                            child: const Text('Xác nhận hủy đơn', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
    final oStatus = (_currentOrder['orderStatus'] ?? 'pending').toString().toLowerCase();
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
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
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
                                Icon(Icons.cancel_outlined, color: Colors.red, size: 20),
                                SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Đơn hàng đã được hủy. Nông sản và chi phí đã được xử lý hoàn trả.',
                                    style: TextStyle(color: Colors.red, fontSize: 12.5),
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
                            Icon(Icons.location_on_outlined, color: Color(0xFF2E7D32), size: 18),
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
                          address?['receiverName'] ?? _currentOrder['customer']?['fullName'] ?? 'Khách hàng',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          address?['phone'] ?? _currentOrder['customer']?['phone'] ?? '0911000001',
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatAddress(address),
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 13, height: 1.3),
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
                            Text('${items.length} món', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                        const Divider(height: 20),
                        ...items.map((item) {
                          final prod = item['product'] as Map<String, dynamic>?;
                          final prodName = prod?['productName'] ?? item['productName'] ?? 'Nông sản LÀNH';
                          final unit = prod?['unit'] ?? item['unit'] ?? 'kg';
                          final qty = item['quantity'] ?? 1;
                          final price = item['unitPrice'] ?? prod?['price'] ?? 0;
                          final images = prod?['productImages'] as List<dynamic>?;
                          final imgUrl = (images != null && images.isNotEmpty) ? images[0]['imageUrl'] : null;

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
                                          errorBuilder: (context, error, stackTrace) => _buildFallbackImg(),
                                        )
                                      : _buildFallbackImg(),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        prodName,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Số lượng: $qty $unit',
                                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  _formatCurrency(price * qty),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF2E7D32)),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // TỔNG KẾT THANH TOÁN
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
                        const Text(
                          'CHI TIẾT THANH TOÁN',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        const Divider(height: 20),
                        _buildPaymentRow('Tiền hàng nông sản', _formatCurrency(_currentOrder['totalAmount'])),
                        _buildPaymentRow('Phí vận chuyển', 'Miễn phí'),
                        _buildPaymentRow('Phương thức', _currentOrder['paymentMethod'] ?? 'COD (Tiền mặt)'),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text('Trạng thái thanh toán', style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
                              ),
                              const SizedBox(width: 8),
                              _buildPaymentStatusBadge(isPaid),
                            ],
                          ),
                        ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Text('Tổng thanh toán:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _formatCurrency(_currentOrder['totalAmount']),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF2E7D32)),
                            ),
                          ],
                        ),
                      ],
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
                            final rawId = _currentOrder['orderId'] ?? _currentOrder['id'];
                            final int oId = rawId is num ? rawId.toInt() : int.tryParse(rawId.toString()) ?? 0;
                            final double total = double.tryParse(_currentOrder['totalAmount']?.toString() ?? '0') ?? 0.0;
                            final code = (_currentOrder['orderCode'] ?? 'ORD$oId').toString();
                            final payMethod = (_currentOrder['paymentMethod'] ?? 'QRCode').toString();
                            final uId = widget.userId ?? _currentOrder['customerId'] ?? _currentOrder['userId'] ?? 0;

                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PaymentQRScreen(
                                  orderId: oId,
                                  orderCode: code,
                                  totalAmount: total.toInt(),
                                  paymentMethod: payMethod.toLowerCase().contains('app') ? 'BankApp' : 'QRCode',
                                  userId: uId,
                                  createdAt: DateTime.tryParse(_currentOrder['createdAt']?.toString() ?? ''),
                                ),
                              ),
                            ).then((_) => _refreshOrderDetail());
                          },
                          icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                          label: const Text('THANH TOÁN NGAY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2E7D32),
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
                        icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                        label: const Text('HỦY ĐƠN HÀNG NÀY', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ] else if (oStatus == 'delivered' || oStatus == 'completed') ...[
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ReviewOrderScreen(order: _currentOrder),
                            ),
                          );
                        },
                        icon: const Icon(Icons.rate_review, color: Colors.white),
                        label: const Text('ĐÁNH GIÁ ĐƠN HÀNG', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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

  Widget _buildFallbackImg() {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(8)),
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

  Widget _buildPaymentRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
          ),
          const SizedBox(width: 8),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

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
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(color: text, fontSize: 11.5, fontWeight: FontWeight.bold)),
    );
  }

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
                    color: isDone ? const Color(0xFF2E7D32) : Colors.grey.shade300,
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
                    color: isDone && index < currentStep ? const Color(0xFF2E7D32) : Colors.grey.shade300,
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
                    fontWeight: isCurrent ? FontWeight.bold : (isDone ? FontWeight.w600 : FontWeight.normal),
                    color: isDone ? const Color(0xFF1B3A20) : Colors.grey.shade500,
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

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
              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
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
              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFFE65100)),
            ),
          ],
        ),
      );
    }
  }
}

