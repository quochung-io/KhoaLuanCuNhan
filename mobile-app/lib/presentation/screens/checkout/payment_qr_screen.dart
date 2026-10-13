import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../data/api_service.dart';
import '../main_container.dart';
import '../profile/orders_management_screen.dart';
import 'payment_success_screen.dart';

class PaymentQRScreen extends StatefulWidget {
  final int orderId;
  final String orderCode;
  final int totalAmount;
  final String paymentMethod; // 'QRCode' hoặc 'BankApp'
  final int userId;
  final DateTime? createdAt;

  const PaymentQRScreen({
    super.key,
    required this.orderId,
    required this.orderCode,
    required this.totalAmount,
    this.paymentMethod = 'QRCode',
    this.userId = 3,
    this.createdAt,
  });

  @override
  State<PaymentQRScreen> createState() => _PaymentQRScreenState();
}

class _PaymentQRScreenState extends State<PaymentQRScreen> with WidgetsBindingObserver {
  // Thông tin tài khoản thụ hưởng của cửa hàng LÀNH Farm (TPBank)
  static const String receiverBankCode = 'TPB';
  static const String receiverBankName = 'TPBank (Ngân hàng Tiên Phong)';
  static const String receiverAccountNumber = '00002120078';
  static const String receiverAccountHolder = 'BUI QUOC HUNG';

  int _countdownSeconds = 15 * 60; // 15 phút đếm ngược
  Timer? _countdownTimer;
  Timer? _pollingTimer;
  bool _isCheckingStatus = false;
  bool _isNavigatingSuccess = false;
  bool _isExpiredHandled = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    final created = widget.createdAt ?? DateTime.now();
    final elapsed = DateTime.now().difference(created).inSeconds;
    _countdownSeconds = math.max(0, 15 * 60 - elapsed);
    _startCountdown();
    _startPollingPaymentStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _countdownTimer?.cancel();
    _pollingTimer?.cancel();
    super.dispose();
  }

  // Tự động kiểm tra ngay khi khách từ app ngân hàng quay lại app nông sản
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkPaymentStatusNow();
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    if (_countdownSeconds <= 0) {
      _handleExpiration();
      return;
    }
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdownSeconds > 0) {
        if (mounted) setState(() => _countdownSeconds--);
      } else {
        timer.cancel();
        _handleExpiration();
      }
    });
  }

  void _handleExpiration() {
    if (_isExpiredHandled || _isNavigatingSuccess) return;
    _isExpiredHandled = true;
    _countdownTimer?.cancel();
    _pollingTimer?.cancel();

    ApiService.cancelOrder(widget.orderId, reason: 'Quá thời hạn thanh toán (15 phút)');

    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.timer_off_outlined, color: Colors.red),
              SizedBox(width: 8),
              Text('Hết hạn thanh toán', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: const Text(
            'Đơn hàng đã quá thời gian thanh toán 15 phút và hệ thống đã tự động hủy đơn. Quý khách vui lòng đặt lại đơn mới nếu vẫn có nhu cầu.',
            style: TextStyle(fontSize: 13),
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const MainContainer()),
                  (route) => false,
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
              child: const Text('Về trang chủ', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    }
  }

  // Polling tự động kiểm tra Webhook mỗi 3 giây
  void _startPollingPaymentStatus() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _checkPaymentStatusNow();
    });
  }

  Future<void> _checkPaymentStatusNow() async {
    if (_isCheckingStatus || _isNavigatingSuccess || _isExpiredHandled || !mounted) return;
    _isCheckingStatus = true;

    try {
      final res = await ApiService.getPaymentStatus(widget.orderId);
      final isPaid = res['isPaid'] == true || res['paymentStatus'] == 'Paid';
      final isCancelled = res['isCancelled'] == true || res['orderStatus'] == 'Cancelled';
      final isExpired = res['isExpired'] == true;

      if ((isCancelled || isExpired) && !isPaid && mounted && !_isNavigatingSuccess) {
        _handleExpiration();
        return;
      }

      if (isPaid && mounted && !_isNavigatingSuccess) {
        _isNavigatingSuccess = true;
        _pollingTimer?.cancel();
        _countdownTimer?.cancel();

        // Rung phản hồi nhẹ
        HapticFeedback.mediumImpact();

        // Tự động nhảy sang Màn hình Thành Công
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => PaymentSuccessScreen(
              orderCode: widget.orderCode,
              orderId: widget.orderId,
              totalAmount: widget.totalAmount.toDouble(),
              paymentMethod: widget.paymentMethod,
              userId: widget.userId,
            ),
          ),
        );
      }
    } catch (_) {
      // Bỏ qua lỗi kết nối mạng tạm thời
    } finally {
      _isCheckingStatus = false;
    }
  }

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _formatCurrency(int amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }

  String get _vietQrUrl {
    final encodedHolder = Uri.encodeComponent(receiverAccountHolder);
    final encodedCode = Uri.encodeComponent(widget.orderCode);
    return 'https://img.vietqr.io/image/$receiverBankCode-$receiverAccountNumber-compact2.png?amount=${widget.totalAmount}&addInfo=$encodedCode&accountName=$encodedHolder';
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã sao chép $label: $text'),
        backgroundColor: const Color(0xFF2E7D32),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _openBankAppDirectly() {
    // Tự động sao chép Số tài khoản vào bộ nhớ tạm
    Clipboard.setData(ClipboardData(text: receiverAccountNumber));

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFFE8F5E9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.account_balance, color: Color(0xFF2E7D32), size: 22),
            ),
            const SizedBox(width: 10),
            const Text('Mở App Ngân Hàng', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF7FAF7),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('STK nhận: $receiverAccountNumber (Đã sao chép)', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Color(0xFF2E7D32))),
                  const SizedBox(height: 4),
                  Text('Số tiền: ${_formatCurrency(widget.totalAmount)}đ', style: const TextStyle(fontSize: 12, color: Colors.black87)),
                  const SizedBox(height: 4),
                  Text('Nội dung: ${widget.orderCode}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Vui lòng mở ứng dụng ngân hàng của bạn trên điện thoại (TPBank, MB, Vietcombank, Techcombank, VPBank...) để xác nhận chuyển tiền.',
              style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700, height: 1.4),
            ),
            const SizedBox(height: 8),
            Text(
              '⚡ Sau khi chuyển tiền xong, bạn chỉ cần quay lại app LÀNH Farm, hệ thống sẽ tự động xác nhận đơn hàng thành công!',
              style: TextStyle(fontSize: 12, color: Colors.green.shade800, fontStyle: FontStyle.italic),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _checkPaymentStatusNow();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Đã hiểu & Đi tới App'),
          ),
        ],
      ),
    );
  }

  // Giả lập Webhook để test demo ngay tức thì mà không cần chuyển tiền thật
  Future<void> _handleSimulateWebhook() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
      ),
    );

    final ok = await ApiService.simulatePaymentTransfer(
      orderId: widget.orderId,
      orderCode: widget.orderCode,
      amount: widget.totalAmount.toDouble(),
    );

    if (mounted) Navigator.pop(context); // Đóng loading

    if (ok) {
      _checkPaymentStatusNow();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mô phỏng Webhook. Vui lòng thử lại!'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _handlePayLater() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => _PayLaterConfirmDialog(
        orderCode: widget.orderCode,
        userId: widget.userId,
        initialRemainingSeconds: _countdownSeconds,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isBankAppMode = widget.paymentMethod == 'BankApp';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _handlePayLater();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF7FAF7),
        appBar: AppBar(
          title: Text(
            isBankAppMode ? 'Thanh toán App Ngân Hàng' : 'Thanh toán Quét mã QR',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF1B3A20),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: _handlePayLater,
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Thanh Đếm ngược giữ đơn
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFFE082)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, color: Color(0xFFF57C00), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Vui lòng hoàn tất thanh toán trong ${_formatDuration(_countdownSeconds)}',
                        style: const TextStyle(color: Color(0xFFE65100), fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // KHUNG MÃ VIETQR ĐỘNG
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE1EAE0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8F5E9),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.qr_code_scanner, size: 16, color: Color(0xFF2E7D32)),
                              SizedBox(width: 6),
                              Text(
                                'Chuẩn VietQR Napas 24/7',
                                style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Ảnh VietQR động
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        width: 240,
                        height: 240,
                        color: Colors.white,
                        child: Image.network(
                          _vietQrUrl,
                          fit: BoxFit.contain,
                          loadingBuilder: (ctx, child, progress) {
                            if (progress == null) return child;
                            return const Center(
                              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
                            );
                          },
                          errorBuilder: (ctx, err, stack) => Container(
                            color: const Color(0xFFF1F5F9),
                            child: const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.qr_code, size: 48, color: Colors.grey),
                                  SizedBox(height: 6),
                                  Text('Không tải được mã QR', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      'Chụp màn hình hoặc lưu ảnh QR để quét trong App ngân hàng',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 12),

                    // Nút Lưu ảnh / Mở App ngân hàng
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Mã QR đã sẵn sàng! Bạn hãy chụp màn hình để quét trên App ngân hàng nhé.'),
                                  backgroundColor: Color(0xFF2E7D32),
                                ),
                              );
                            },
                            icon: const Icon(Icons.save_alt, size: 16, color: Color(0xFF2E7D32)),
                            label: const Text('Lưu ảnh QR', style: TextStyle(fontSize: 12.5, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF2E7D32)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _openBankAppDirectly,
                            icon: const Icon(Icons.launch, size: 16, color: Colors.white),
                            label: const Text(
                              'Mở App Ngân hàng',
                              style: TextStyle(fontSize: 12.5, color: Colors.white, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2E7D32),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // BẢNG THÔNG TIN CHUYỂN KHOẢN CHI TIẾT
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE1EAE0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'THÔNG TIN CHUYỂN KHOẢN',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 0.8),
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow('Ngân hàng nhận', receiverBankName, null),
                    const Divider(height: 16),
                    _buildInfoRow('Số tài khoản', receiverAccountNumber, () => _copyToClipboard(receiverAccountNumber, 'Số tài khoản')),
                    const Divider(height: 16),
                    _buildInfoRow('Chủ tài khoản', receiverAccountHolder, () => _copyToClipboard(receiverAccountHolder, 'Chủ tài khoản')),
                    const Divider(height: 16),
                    _buildInfoRow('Số tiền cần trả', '${_formatCurrency(widget.totalAmount)}₫', () => _copyToClipboard(widget.totalAmount.toString(), 'Số tiền'), isHighlight: true),
                    const Divider(height: 16),
                    _buildInfoRow('Nội dung chuyển khoản', widget.orderCode, () => _copyToClipboard(widget.orderCode, 'Nội dung chuyển khoản'), isHighlight: true),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // KHUNG TRẠNG THÁI TỰ ĐỘNG WEBHOOK (Thay thế nút thủ công cũ)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA5D6A7)),
                ),
                child: Row(
                  children: [
                    const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Color(0xFF2E7D32),
                        strokeWidth: 2.5,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Đang chờ xác nhận thanh toán...',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13.5,
                              color: Color(0xFF1B3A20),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Hệ thống tự động phát hiện khi bạn chuyển khoản thành công.',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Colors.green.shade800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Nút thanh toán sau
              TextButton(
                onPressed: _handlePayLater,
                child: const Text('Thanh toán sau (Lưu đơn vào mục Đơn mua)', style: TextStyle(color: Colors.grey, fontSize: 13)),
              ),
              const SizedBox(height: 8),

              // Nút Demo Mô phỏng Webhook (Dành cho việc test / demo đồ án)
              InkWell(
                onTap: _handleSimulateWebhook,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.bolt, size: 16, color: Colors.amber.shade800),
                      const SizedBox(width: 4),
                      Text(
                        'Mô phỏng Webhook thanh toán (Dành cho Test)',
                        style: TextStyle(fontSize: 11.5, color: Colors.amber.shade900, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String title, String value, VoidCallback? onCopy, {bool isHighlight = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          flex: 4,
          child: Text(title, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
        ),
        Expanded(
          flex: 6,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Flexible(
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontSize: isHighlight ? 14 : 13,
                    fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600,
                    color: isHighlight ? const Color(0xFF2E7D32) : const Color(0xFF1B3A20),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (onCopy != null) ...[
                const SizedBox(width: 6),
                InkWell(
                  onTap: onCopy,
                  borderRadius: BorderRadius.circular(4),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Icon(Icons.copy, size: 14, color: Color(0xFF2E7D32)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _PayLaterConfirmDialog extends StatefulWidget {
  final String orderCode;
  final int userId;
  final int initialRemainingSeconds;

  const _PayLaterConfirmDialog({
    required this.orderCode,
    required this.userId,
    required this.initialRemainingSeconds,
  });

  @override
  State<_PayLaterConfirmDialog> createState() => _PayLaterConfirmDialogState();
}

class _PayLaterConfirmDialogState extends State<_PayLaterConfirmDialog> {
  late int _remainingSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.initialRemainingSeconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _timer?.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    if (seconds <= 0) return '00:00';
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isAlmostExpired = _remainingSeconds < 180; // Dưới 3 phút

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      elevation: 8,
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header Icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEA580C).withOpacity(0.12),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.hourglass_top_rounded, color: Color(0xFFEA580C), size: 34),
                  ),
                ),
                const SizedBox(height: 14),

                // Title
                const Text(
                  'Giữ đơn & Thanh toán sau?',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Color(0xFF1F2937),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),

                // Order Code Chip
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Mã đơn: #${widget.orderCode}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Timer Countdown Banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: isAlmostExpired ? const Color(0xFFFEF2F2) : const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isAlmostExpired ? const Color(0xFFFECACA) : const Color(0xFFFFEDD5),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.timer_outlined,
                        color: isAlmostExpired ? const Color(0xFFDC2626) : const Color(0xFFEA580C),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Thời gian giữ đơn còn: ${_formatDuration(_remainingSeconds)}',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.bold,
                          color: isAlmostExpired ? const Color(0xFFB91C1C) : const Color(0xFFC2410C),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Info card
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFF3F4F6)),
                  ),
                  child: Column(
                    children: [
                      _buildBullet(
                        icon: Icons.check_circle_outline,
                        color: const Color(0xFF2E7D32),
                        text: 'Nông sản của bạn vẫn được giữ nguyên trong vòng 15 phút.',
                      ),
                      const SizedBox(height: 8),
                      _buildBullet(
                        icon: Icons.receipt_long_outlined,
                        color: const Color(0xFF1D4ED8),
                        text: 'Bạn có thể mở lại mục "Đơn mua" (tab Chờ thanh toán) để thanh toán bất cứ khi nào.',
                      ),
                      const SizedBox(height: 8),
                      _buildBullet(
                        icon: Icons.cancel_outlined,
                        color: const Color(0xFFDC2626),
                        text: 'Sau 15 phút nếu chưa hoàn tất chuyển tiền, hệ thống sẽ tự động hủy đơn.',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),

                // Nút chính: Tiếp tục thanh toán
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.qr_code, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Tiếp tục thanh toán ngay',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Nút phụ: Để sau & Xem đơn mua
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (c) => OrdersManagementScreen(
                            userId: widget.userId,
                            initialTabIndex: 1, // Tab Chờ thanh toán
                          ),
                        ),
                        (route) => false,
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.grey.shade300),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      'Rời đi & Xem đơn mua',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13.5,
                        color: Colors.grey.shade800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Nút nhẹ: Về trang chủ
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (c) => const MainContainer()),
                      (route) => false,
                    );
                  },
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                  ),
                  child: Text(
                    'Về trang chủ',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                ),
              ],
            ),
          ),

          // Nút X góc trên phải
          Positioned(
            top: 10,
            right: 10,
            child: IconButton(
              icon: Icon(Icons.close, size: 20, color: Colors.grey.shade500),
              onPressed: () => Navigator.pop(context),
              tooltip: 'Đóng',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBullet({required IconData icon, required Color color, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563), height: 1.35),
          ),
        ),
      ],
    );
  }
}

