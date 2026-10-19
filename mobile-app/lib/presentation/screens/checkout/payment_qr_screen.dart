import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:gal/gal.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants.dart';
import '../../../data/api_service.dart';
import '../main_container.dart';
import '../profile/orders_management_screen.dart';
import 'payment_success_screen.dart';

class PaymentQRScreen extends StatefulWidget {
  final int orderId;
  final String orderCode;
  final int totalAmount;
  final String paymentMethod; // 'QRCode' hoặc 'MoMo'
  final int userId;
  final DateTime? createdAt;
  final String? momoDeeplink;
  final String? momoPayUrl;

  const PaymentQRScreen({
    super.key,
    required this.orderId,
    required this.orderCode,
    required this.totalAmount,
    this.paymentMethod = 'QRCode',
    this.userId = 3,
    this.createdAt,
    this.momoDeeplink,
    this.momoPayUrl,
  });

  @override
  State<PaymentQRScreen> createState() => _PaymentQRScreenState();
}

class _PaymentQRScreenState extends State<PaymentQRScreen>
    with WidgetsBindingObserver {
  // Thông tin tài khoản thụ hưởng TPBank của cửa hàng LÀNH Farm
  static const String receiverBankCode = 'TPB';
  static const String receiverBankName = 'TPBank (Ngân hàng Tiên Phong)';
  static const String receiverAccountNumber = '00002120078';
  static const String receiverAccountHolder = 'BUI QUOC HUNG';

  final GlobalKey _qrBoundaryKey = GlobalKey();

  int _countdownSeconds = AppConstants.orderExpirationMinutes * 60;
  Timer? _countdownTimer;
  Timer? _pollingTimer;
  bool _isCheckingStatus = false;
  bool _isNavigatingSuccess = false;
  bool _isExpiredHandled = false;
  bool _isSavingImage = false;
  bool _isOpeningMomo = false;

  String? _momoDeeplink;
  String? _momoPayUrl;

  bool get isMoMo => widget.paymentMethod.toUpperCase() == 'MOMO';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _momoDeeplink = widget.momoDeeplink;
    _momoPayUrl = widget.momoPayUrl;

    // Tính thời gian còn lại dựa trên CreatedAt từ server
    final created = widget.createdAt ?? DateTime.now();
    final elapsed = DateTime.now().difference(created).inSeconds;
    final totalDuration = AppConstants.orderExpirationMinutes * 60;
    _countdownSeconds = math.max(0, totalDuration - elapsed);

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

  // Tự động kiểm tra ngay khi khách từ App ngân hàng/MoMo quay lại app
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

    if (mounted) {
      setState(() {});
    }

    // Gọi API hủy đơn trên backend
    ApiService.cancelOrder(
      widget.orderId,
      reason:
          'Quá thời hạn thanh toán (${AppConstants.orderExpirationMinutes} phút)',
    );

    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Row(
            children: [
              Icon(Icons.timer_off_outlined, color: Colors.red),
              SizedBox(width: 8),
              Text(
                'Hết hạn thanh toán',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Text(
            'Đơn hàng đã quá thời gian thanh toán ${AppConstants.orderExpirationMinutes} phút và hệ thống đã tự động hủy đơn. Quý khách vui lòng đặt lại đơn mới nếu vẫn có nhu cầu.',
            style: const TextStyle(fontSize: 13),
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
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
              ),
              child: const Text(
                'Về trang chủ',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      );
    }
  }

  // Polling tự động kiểm tra trạng thái mỗi 3 giây
  void _startPollingPaymentStatus() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _checkPaymentStatusNow();
    });
  }

  Future<void> _checkPaymentStatusNow() async {
    if (_isCheckingStatus ||
        _isNavigatingSuccess ||
        _isExpiredHandled ||
        !mounted)
      return;
    _isCheckingStatus = true;

    try {
      final res = await ApiService.getPaymentStatus(widget.orderId);
      final isPaid = res['isPaid'] == true || res['paymentStatus'] == 'Paid';
      final isCancelled =
          res['isCancelled'] == true || res['orderStatus'] == 'Cancelled';
      final isExpired = res['isExpired'] == true;

      if ((isCancelled || isExpired) &&
          !isPaid &&
          mounted &&
          !_isNavigatingSuccess) {
        _handleExpiration();
        return;
      }

      if (isPaid && mounted && !_isNavigatingSuccess) {
        _isNavigatingSuccess = true;
        _pollingTimer?.cancel();
        _countdownTimer?.cancel();

        // Rung phản hồi nhẹ
        HapticFeedback.mediumImpact();

        // Chuyển sang Màn hình Thành Công
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

  // Chụp widget QR (RepaintBoundary -> PNG) và lưu vào thư viện ảnh bằng package gal
  Future<void> _handleSaveQrImage() async {
    if (_isSavingImage) return;
    setState(() => _isSavingImage = true);

    try {
      // Kiểm tra quyền lưu ảnh
      final hasAccess = await Gal.hasAccess();
      if (!hasAccess) {
        final granted = await Gal.requestAccess();
        if (!granted) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Vui lòng cấp quyền truy cập thư viện để lưu ảnh mã QR.',
                ),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }
      }

      final boundary =
          _qrBoundaryKey.currentContext?.findRenderObject()
              as RenderRepaintBoundary?;
      if (boundary == null) {
        throw Exception('Không tìm thấy khung ảnh QR.');
      }

      final ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      final ByteData? byteData = await image.toByteData(
        format: ui.ImageByteFormat.png,
      );
      if (byteData == null) {
        throw Exception('Lỗi chuyển đổi dữ liệu ảnh.');
      }

      final Uint8List pngBytes = byteData.buffer.asUint8List();
      await Gal.putImageBytes(pngBytes, name: 'VietQR_${widget.orderCode}');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã lưu QR, hãy mở app ngân hàng và quét ảnh này'),
            backgroundColor: Color(0xFF2E7D32),
            duration: Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Không thể lưu ảnh QR: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingImage = false);
    }
  }

  // Mở lại app MoMo hoặc Web MoMo
  Future<void> _handleOpenMomo() async {
    if (_isOpeningMomo) return;
    setState(() => _isOpeningMomo = true);

    try {
      if ((_momoDeeplink == null || _momoDeeplink!.isEmpty) &&
          (_momoPayUrl == null || _momoPayUrl!.isEmpty)) {
        final momoRes = await ApiService.createMomoPayment(widget.orderId);
        _momoDeeplink = momoRes['deeplink'] as String?;
        _momoPayUrl = momoRes['payUrl'] as String?;
      }

      bool launched = false;
      // 1. Thử mở App MoMo bằng deeplink
      if (_momoDeeplink != null && _momoDeeplink!.isNotEmpty) {
        final deeplinkUri = Uri.parse(_momoDeeplink!);
        try {
          launched = await launchUrl(
            deeplinkUri,
            mode: LaunchMode.externalApplication,
          );
        } catch (_) {
          launched = false;
        }
      }

      // 2. Nếu không mở được App MoMo (chưa cài app), tự động fallback mở web MoMo
      if (!launched && _momoPayUrl != null && _momoPayUrl!.isNotEmpty) {
        final payUri = Uri.parse(_momoPayUrl!);
        try {
          launched = await launchUrl(
            payUri,
            mode: LaunchMode.externalApplication,
          );
        } catch (_) {
          try {
            launched = await launchUrl(
              payUri,
              mode: LaunchMode.platformDefault,
            );
          } catch (_) {
            launched = false;
          }
        }
      }

      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Không thể mở ứng dụng MoMo. Bạn có thể thanh toán sau trong mục Đơn mua.',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khởi tạo MoMo: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isOpeningMomo = false);
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
    final isExpired = _countdownSeconds <= 0;

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
            isMoMo ? 'Thanh toán Ví MoMo' : 'Thanh toán Quét mã QR',
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: isExpired
                      ? const Color(0xFFFEE2E2)
                      : const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isExpired
                        ? const Color(0xFFFCA5A5)
                        : const Color(0xFFFFE082),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      isExpired
                          ? Icons.timer_off_outlined
                          : Icons.timer_outlined,
                      color: isExpired
                          ? const Color(0xFFDC2626)
                          : const Color(0xFFF57C00),
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        isExpired
                            ? 'Mã thanh toán đã hết hiệu lực'
                            : 'QR còn hiệu lực: ${_formatDuration(_countdownSeconds)}',
                        style: TextStyle(
                          color: isExpired
                              ? const Color(0xFFB91C1C)
                              : const Color(0xFFE65100),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // KHUNG NỘI DUNG: CHIA RA THEO PHƯƠNG THỨC THANH TOÁN (MOMO hoặc VIETQR)
              if (isMoMo)
                _buildMoMoCard(isExpired)
              else
                _buildVietQrCard(isExpired),

              const SizedBox(height: 16),

              // BẢNG THÔNG TIN THANH TOÁN CHI TIẾT
              _buildPaymentDetailsCard(),

              const SizedBox(height: 20),

              // KHUNG TRẠNG THÁI TỰ ĐỘNG WEBHOOK / POLLING
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
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
                            isMoMo
                                ? 'Hệ thống tự động ghi nhận khi bạn hoàn tất trên MoMo.'
                                : 'Hệ thống tự động phát hiện khi bạn chuyển khoản thành công.',
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
                child: const Text(
                  'Thanh toán sau (Lưu đơn vào mục Đơn mua)',
                  style: TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // WIDGET CARD MÃ VIETQR ĐỘNG
  Widget _buildVietQrCard(bool isExpired) {
    return Container(
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
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.qr_code_scanner,
                      size: 16,
                      color: Color(0xFF2E7D32),
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Chuẩn VietQR Napas 24/7',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Vùng chụp ảnh lưu mã QR (RepaintBoundary)
          RepaintBoundary(
            key: _qrBoundaryKey,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Ảnh VietQR động
                      Opacity(
                        opacity: isExpired ? 0.2 : 1.0,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 230,
                            height: 230,
                            color: Colors.white,
                            child: Image.network(
                              _vietQrUrl,
                              fit: BoxFit.contain,
                              loadingBuilder: (ctx, child, progress) {
                                if (progress == null) return child;
                                return const Center(
                                  child: CircularProgressIndicator(
                                    color: Color(0xFF2E7D32),
                                  ),
                                );
                              },
                              errorBuilder: (ctx, err, stack) => Container(
                                color: const Color(0xFFF1F5F9),
                                child: const Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.qr_code,
                                        size: 48,
                                        color: Colors.grey,
                                      ),
                                      SizedBox(height: 6),
                                      Text(
                                        'Không tải được mã QR',
                                        style: TextStyle(
                                          color: Colors.grey,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (isExpired)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.red.shade700.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'MÃ ĐÃ HẾT HẠN',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Đơn: ${widget.orderCode}  •  ${_formatCurrency(widget.totalAmount)}đ',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: Color(0xFF1B3A20),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // NÚT LƯU MÃ QR
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isExpired ? null : _handleSaveQrImage,
              icon: _isSavingImage
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(
                      Icons.download_rounded,
                      size: 18,
                      color: Colors.white,
                    ),
              label: Text(
                _isSavingImage ? 'Đang lưu ảnh...' : 'Lưu mã QR',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(vertical: 12),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // WIDGET CARD THANH TOÁN MOMO
  Widget _buildMoMoCard(bool isExpired) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFBCFE8)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFA50064).withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Logo MoMo
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFFA50064),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFA50064).withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                'MoMo',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  letterSpacing: -0.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          const Text(
            'Thanh toán qua Ví điện tử MoMo',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Vui lòng mở ứng dụng MoMo để hoàn tất thanh toán số tiền ${_formatCurrency(widget.totalAmount)}đ cho đơn hàng #${widget.orderCode}.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12.5,
              color: Colors.grey.shade600,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),

          // NÚT MỞ LẠI MOMO
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isExpired ? null : _handleOpenMomo,
              icon: _isOpeningMomo
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.launch, size: 18, color: Colors.white),
              label: Text(
                _isOpeningMomo ? 'Đang mở MoMo...' : 'Mở lại App MoMo',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFA50064),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(vertical: 12),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // BẢNG THÔNG TIN CHI TIẾT
  Widget _buildPaymentDetailsCard() {
    return Container(
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
            'THÔNG TIN THANH TOÁN',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF8D9E90),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 12),
          if (isMoMo) ...[
            _buildInfoRow('Phương thức', 'Ví điện tử MoMo', null),
            const Divider(height: 16),
            _buildInfoRow(
              'Mã đơn hàng',
              widget.orderCode,
              () => _copyToClipboard(widget.orderCode, 'Mã đơn hàng'),
              isHighlight: true,
            ),
            const Divider(height: 16),
            _buildInfoRow(
              'Số tiền thanh toán',
              '${_formatCurrency(widget.totalAmount)}₫',
              () => _copyToClipboard(widget.totalAmount.toString(), 'Số tiền'),
              isHighlight: true,
            ),
          ] else ...[
            _buildInfoRow('Ngân hàng nhận', receiverBankName, null),
            const Divider(height: 16),
            _buildInfoRow(
              'Số tài khoản',
              receiverAccountNumber,
              () => _copyToClipboard(receiverAccountNumber, 'Số tài khoản'),
            ),
            const Divider(height: 16),
            _buildInfoRow(
              'Chủ tài khoản',
              receiverAccountHolder,
              () => _copyToClipboard(receiverAccountHolder, 'Chủ tài khoản'),
            ),
            const Divider(height: 16),
            _buildInfoRow(
              'Số tiền cần trả',
              '${_formatCurrency(widget.totalAmount)}₫',
              () => _copyToClipboard(widget.totalAmount.toString(), 'Số tiền'),
              isHighlight: true,
            ),
            const Divider(height: 16),
            _buildInfoRow(
              'Nội dung chuyển khoản',
              widget.orderCode,
              () => _copyToClipboard(widget.orderCode, 'Nội dung chuyển khoản'),
              isHighlight: true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    String title,
    String value,
    VoidCallback? onCopy, {
    bool isHighlight = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          flex: 4,
          child: Text(
            title,
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
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
                    color: isHighlight
                        ? const Color(0xFF2E7D32)
                        : const Color(0xFF1B3A20),
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
                    child: const Icon(
                      Icons.copy,
                      size: 14,
                      color: Color(0xFF2E7D32),
                    ),
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
                        color: const Color(0xFFEA580C).withValues(alpha: 0.12),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.hourglass_top_rounded,
                      color: Color(0xFFEA580C),
                      size: 34,
                    ),
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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isAlmostExpired
                        ? const Color(0xFFFEF2F2)
                        : const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isAlmostExpired
                          ? const Color(0xFFFECACA)
                          : const Color(0xFFFFEDD5),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.timer_outlined,
                        color: isAlmostExpired
                            ? const Color(0xFFDC2626)
                            : const Color(0xFFEA580C),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Thời gian giữ đơn còn: ${_formatDuration(_remainingSeconds)}',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.bold,
                          color: isAlmostExpired
                              ? const Color(0xFFB91C1C)
                              : const Color(0xFFC2410C),
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
                        text:
                            'Nông sản của bạn vẫn được giữ nguyên trong vòng ${AppConstants.orderExpirationMinutes} phút.',
                      ),
                      const SizedBox(height: 8),
                      _buildBullet(
                        icon: Icons.receipt_long_outlined,
                        color: const Color(0xFF1D4ED8),
                        text:
                            'Bạn có thể mở lại mục "Đơn mua" (tab Chờ thanh toán) để thanh toán bất cứ khi nào.',
                      ),
                      const SizedBox(height: 8),
                      _buildBullet(
                        icon: Icons.cancel_outlined,
                        color: const Color(0xFFDC2626),
                        text:
                            'Sau ${AppConstants.orderExpirationMinutes} phút nếu chưa hoàn tất chuyển tiền, hệ thống sẽ tự động hủy đơn.',
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
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.payment, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Tiếp tục thanh toán ngay',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13.5,
                          ),
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
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
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

  Widget _buildBullet({
    required IconData icon,
    required Color color,
    required String text,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF4B5563),
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}
