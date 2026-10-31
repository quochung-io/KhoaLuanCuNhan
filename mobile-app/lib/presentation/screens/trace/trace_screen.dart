// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/trace/trace_screen.dart
// MÔ TẢ: Màn hình giao diện di động (trace_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../data/models/product_model.dart';
import '../../../data/api_service.dart';
import '../../../core/utils/traceability_utils.dart';
import 'farming_diary_screen.dart';

/// Lớp giao diện / trạng thái TraceScreen
class TraceScreen extends StatefulWidget {
  final String? initialLotCode;
  final VoidCallback? onClearCode;

  const TraceScreen({super.key, this.initialLotCode, this.onClearCode});

  @override
  State<TraceScreen> createState() => _TraceScreenState();
}

/// Lớp giao diện / trạng thái _TraceScreenState
class _TraceScreenState extends State<TraceScreen> {
  final TextEditingController _controller = TextEditingController();
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _hasSearched = false;
  bool _isScanning = false;
  bool _isTorchOn = false;
  Product? _tracedProduct;
  Map<String, dynamic>? _batchDetails;
  Map<String, dynamic>? _verifiedCertificate;
  bool _isLoadingTrace = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLotCode != null && widget.initialLotCode!.isNotEmpty) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  @override
  void didUpdateWidget(covariant TraceScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialLotCode != null && widget.initialLotCode!.isNotEmpty) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _performTrace
  Future<void> _performTrace(String lotCode) async {
    final query = lotCode.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoadingTrace = true;
      _hasSearched = true;
      _tracedProduct = null;
      _batchDetails = null;
      _verifiedCertificate = null;
    });

    try {
      // 1. Lấy danh sách lô hàng từ cơ sở dữ liệu backend
      final batches = await ApiService.getProductBatches();

      // 2. Tìm lô hàng khớp mã
      final foundBatch = batches.firstWhere(
        (b) =>
            (b['batchCode'] ?? '').toString().toLowerCase() == query.toLowerCase() ||
            (b['batchId'] ?? '').toString() == query,
        orElse: () => null,
      );

      if (foundBatch != null && mounted) {
        final int batchId = foundBatch['batchId'] is int
            ? foundBatch['batchId']
            : int.tryParse(foundBatch['batchId'].toString()) ?? 0;

        // Lấy chi tiết lô hàng bao gồm Nông trại vùng trồng & Giấy chứng nhận pháp lý (VietGAP/GlobalGAP)
        Map<String, dynamic>? fullDetails;
        if (batchId > 0) {
          fullDetails = await ApiService.getProductBatchDetails(batchId);
        }

        final productData = foundBatch['product'];
        Product? product;
        if (productData != null) {
          productData['lotCode'] = foundBatch['batchCode'];
          product = Product.fromJson(productData);
        }

        setState(() {
          _tracedProduct = product;
          _batchDetails = fullDetails ?? foundBatch;
          _isLoadingTrace = false;
        });
      } else {
        // 3. Nếu không tìm thấy lô hàng, thử tra cứu xem đây có phải mã giấy chứng nhận (VietGAP/GlobalGAP)
        final certResult = await ApiService.verifyCertificate(query);
        if (certResult != null && certResult['verified'] == true && mounted) {
          setState(() {
            _verifiedCertificate = certResult;
            _isLoadingTrace = false;
          });
        } else if (mounted) {
          setState(() {
            _tracedProduct = null;
            _batchDetails = null;
            _isLoadingTrace = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _tracedProduct = null;
          _batchDetails = null;
          _isLoadingTrace = false;
        });
      }
    }
  }

  // Thực thi nghiệp vụ hàm _onBarcodeDetected
  void _onBarcodeDetected(BarcodeCapture capture) {
    if (!_isScanning) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode != null && barcode.rawValue != null) {
      final code = barcode.rawValue!.trim();
      if (code.isNotEmpty) {
        setState(() {
          _isScanning = false;
          _controller.text = code;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã quét mã: $code'),
            backgroundColor: const Color(0xFF2E7D32),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 1),
          ),
        );
        _performTrace(code);
      }
    }
  }

  // Thực thi nghiệp vụ hàm _toggleTorch
  void _toggleTorch() {
    _scannerController.toggleTorch();
    setState(() {
      _isTorchOn = !_isTorchOn;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Truy xuất nguồn gốc'),
        actions: [
          if (_isScanning) ...[
            IconButton(
              icon: Icon(_isTorchOn ? Icons.flash_on : Icons.flash_off),
              onPressed: _toggleTorch,
              tooltip: 'Bật/Tắt đèn Flash',
            ),
            IconButton(
              icon: const Icon(Icons.flip_camera_ios),
              onPressed: () => _scannerController.switchCamera(),
              tooltip: 'Đổi camera trước/sau',
            ),
          ]
        ],
      ),
      body: _isScanning
          ? _buildRealCameraScanner()
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'MINH BẠCH HÓA CHUỖI CUNG ỨNG NÔNG SẢN',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Quét Camera hoặc Nhập Mã Lô',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Thanh nhập mã + Button Scan Camera Thật
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            decoration: InputDecoration(
                              hintText: 'Nhập mã lô hoặc mã VietGAP...',
                              hintStyle: const TextStyle(
                                color: Color(0xFF8D9E90),
                                fontSize: 13,
                              ),
                              fillColor: Colors.white,
                              filled: true,
                              prefixIcon: const Icon(
                                Icons.search,
                                color: Color(0xFF2E7D32),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFFE1EAE0),
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFF2E7D32),
                                ),
                              ),
                            ),
                            onSubmitted: _performTrace,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Tooltip(
                          message: 'Bật Camera quét mã QR trực tiếp',
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _isScanning = true;
                              });
                            },
                            child: Container(
                              height: 48,
                              width: 48,
                              decoration: BoxDecoration(
                                color: const Color(0xFFE3F1E3),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFF2E7D32).withValues(alpha: 0.2),
                                ),
                              ),
                              child: const Icon(
                                Icons.qr_code_scanner,
                                color: Color(0xFF2E7D32),
                                size: 26,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.travel_explore, size: 18),
                        onPressed: () => _performTrace(_controller.text),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        label: const Text(
                          'Tra Cứu Dữ Liệu Nguồn Gốc',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // KẾT QUẢ TRUY XUẤT
                    if (_isLoadingTrace) ...[
                      const SizedBox(height: 60),
                      const Center(
                        child: Column(
                          children: [
                            CircularProgressIndicator(color: Color(0xFF2E7D32)),
                            SizedBox(height: 14),
                            Text(
                              'Đang đối soát chuỗi dữ liệu nguồn gốc và chứng nhận...',
                              style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ] else if (_hasSearched && _tracedProduct != null) ...[
                      _buildTracedProductHeader(_tracedProduct!),
                      const SizedBox(height: 16),
                      _buildFarmAndCertificateCard(),
                      const SizedBox(height: 24),
                      const Text(
                        'HÀNH TRÌNH CANH TÁC & VẬN CHUYỂN',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B3A20),
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildTraceTimeline(),
                    ] else if (_hasSearched && _verifiedCertificate != null) ...[
                      _buildStandaloneCertificateView(_verifiedCertificate!),
                    ] else if (_hasSearched && _tracedProduct == null) ...[
                      Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 40),
                            Icon(
                              Icons.search_off_rounded,
                              size: 64,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Không tìm thấy mã nguồn gốc',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Color(0xFF1B3A20),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24.0),
                              child: Text(
                                'Mã "${_controller.text}" không tồn tại trong hệ thống ECC Agri-Chain hoặc chưa được kích hoạt nhật ký canh tác.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Color(0xFF8D9E90),
                                  fontSize: 12,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else if (!_hasSearched) ...[
                      Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 40),
                            Icon(
                              Icons.history_edu_outlined,
                              size: 72,
                              color: const Color(0xFF2E7D32).withValues(alpha: 0.15),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Nhật ký Farm-to-Table Đích Thực',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1B3A20),
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 24.0),
                              child: Text(
                                'Bật camera quét mã QR trên tem nhãn nông sản để kiểm tra nguồn gốc vùng trồng, quy trình thu hoạch và chứng nhận VietGAP/GlobalGAP.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Color(0xFF8D9E90),
                                  fontSize: 12,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }

  // Camera Scanner Thật bằng MobileScanner
  Widget _buildRealCameraScanner() {
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController,
          onDetect: _onBarcodeDetected,
        ),
        // Khung quét và chỉ dẫn
        Center(
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF4CAF50), width: 3),
              borderRadius: BorderRadius.circular(20),
              color: Colors.transparent,
            ),
          ),
        ),
        Positioned(
          top: 30,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.65),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Hướng camera về phía mã QR trên tem nông sản',
                style: TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Center(
            child: ElevatedButton.icon(
              icon: const Icon(Icons.close),
              label: const Text('Đóng Camera'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withValues(alpha: 0.9),
                foregroundColor: Colors.black87,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              onPressed: () {
                setState(() {
                  _isScanning = false;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  // Header thông tin sản phẩm
  Widget _buildTracedProductHeader(Product product) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: product.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(product.icon, color: product.color, size: 32),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Color(0xFF1B3A20),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Mã Lô: ${product.lot}',
                  style: const TextStyle(
                    color: Color(0xFF2E7D32),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Tiêu chuẩn: ${product.cert} · Vùng: ${product.region}',
                  style: const TextStyle(
                    color: Color(0xFF8D9E90),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Thẻ thông tin Nông trại & Giấy chứng nhận pháp lý (VietGAP / GlobalGAP)
  Widget _buildFarmAndCertificateCard() {
    final farm = _batchDetails?['farm'] as Map<String, dynamic>?;
    final cert = _batchDetails?['certificate'] as Map<String, dynamic>?;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FCF9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD6E8D6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified, color: Color(0xFF2E7D32), size: 20),
              const SizedBox(width: 8),
              const Text(
                'CHỨNG NHẬN PHÁP LÝ & VÙNG CANH TÁC',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Color(0xFF1B3A20),
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const Divider(height: 20, color: Color(0xFFE1EAE0)),
          if (cert != null) ...[
            _buildInfoRow('Hệ tiêu chuẩn:', cert['standardType'] ?? 'VietGAP', isBold: true, highlightColor: const Color(0xFF2E7D32)),
            _buildInfoRow('Số giấy phép:', cert['certificateCode'] ?? 'Chưa cấp', isBold: true),
            _buildInfoRow('Cơ quan cấp:', cert['issuedBy'] ?? 'Trung tâm Chứng nhận Nông nghiệp Quốc gia'),
            _buildInfoRow('Hiệu lực:', '${(cert['issueDate'] ?? '').toString().split('T')[0]} ➔ ${(cert['expiryDate'] ?? '').toString().split('T')[0]}'),
          ] else ...[
            _buildInfoRow('Tiêu chuẩn cơ sở:', 'VietGAP Trồng trọt & An toàn Sinh học', highlightColor: const Color(0xFF2E7D32)),
          ],
          if (farm != null) ...[
            const SizedBox(height: 6),
            _buildInfoRow('Nông trại / HTX:', farm['farmName'] ?? 'Hợp tác xã nông sản', isBold: true),
            _buildInfoRow('Địa chỉ vùng trồng:', '${farm['district'] ?? ''}, ${farm['province'] ?? 'Việt Nam'}'),
            if (farm['area'] != null)
              _buildInfoRow('Quy mô canh tác:', '${farm['area']} hecta'),
          ],
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              icon: const Icon(Icons.menu_book, size: 16),
              label: const Text('Xem Nhật Ký Canh Tác'),
              style: TextButton.styleFrom(foregroundColor: const Color(0xFF2E7D32)),
              onPressed: () {
                if (_tracedProduct != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => FarmingDiaryScreen(
                        lotCode: _tracedProduct!.lot,
                        productName: _tracedProduct!.name,
                        farmName: _tracedProduct!.originFarm ?? 'Hợp tác xã Nông Sản Đà Lạt (Lâm Đồng)',
                      ),
                    ),
                  );
                }
              },
            ),
          )
        ],
      ),
    );
  }

  // Hiển thị tra cứu khi quét trực tiếp mã chứng nhận
  Widget _buildStandaloneCertificateView(Map<String, dynamic> certData) {
    final bool isValid = certData['isLegallyValid'] ?? false;
    final supplier = certData['supplier'] as Map<String, dynamic>?;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isValid ? const Color(0xFF4CAF50) : Colors.red),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isValid ? Icons.check_circle : Icons.warning_amber,
                color: isValid ? const Color(0xFF2E7D32) : Colors.red,
                size: 28,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isValid ? 'CHỨNG NHẬN HỢP LỆ' : 'CẢNH BÁO HIỆU LỰC',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isValid ? const Color(0xFF1B3A20) : Colors.red,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            certData['certificateName'] ?? 'Giấy chứng nhận an toàn thực phẩm',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 6),
          Text(
            certData['legalNotice'] ?? '',
            style: TextStyle(
              color: isValid ? const Color(0xFF2E7D32) : Colors.red,
              fontSize: 12,
            ),
          ),
          const Divider(height: 24),
          _buildInfoRow('Mã chứng nhận:', certData['certificateCode'] ?? '', isBold: true),
          _buildInfoRow('Hệ tiêu chuẩn:', certData['standardType'] ?? 'VietGAP', isBold: true),
          _buildInfoRow('Cơ quan thẩm quyền:', certData['issuedBy'] ?? ''),
          if (supplier != null)
            _buildInfoRow('Đơn vị sở hữu:', supplier['supplierName'] ?? ''),
          _buildInfoRow('Hạn sử dụng:', '${(certData['expiryDate'] ?? '').toString().split('T')[0]} (${certData['daysRemaining']} ngày)'),
        ],
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildInfoRow
  Widget _buildInfoRow(String label, String value, {bool isBold = false, Color? highlightColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: highlightColor ?? const Color(0xFF1F2937),
                fontSize: 12,
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Timeline hành trình Farm-to-Table
  Widget _buildTraceTimeline() {
    if (_tracedProduct == null) return const SizedBox();

    final List<Map<String, dynamic>> steps = TraceabilityUtils.generateTimeline(
      _tracedProduct!.lot,
      _tracedProduct!.name,
      _tracedProduct!.originFarm ?? '',
    );

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: steps.length,
      itemBuilder: (context, index) {
        final step = steps[index];
        final isLast = index == steps.length - 1;

        IconData iconData = Icons.radio_button_checked;
        final iconStr = step['icon'] as String? ?? '';
        if (iconStr.contains('grass') || iconStr.contains('seed')) {
          iconData = Icons.eco;
        } else if (iconStr.contains('water') || iconStr.contains('spa')) {
          iconData = Icons.water_drop;
        } else if (iconStr.contains('agriculture') || iconStr.contains('cut')) {
          iconData = Icons.content_cut;
        } else if (iconStr.contains('verified') || iconStr.contains('security')) {
          iconData = Icons.verified_user;
        } else if (iconStr.contains('inventory') || iconStr.contains('package')) {
          iconData = Icons.inventory_2;
        } else if (iconStr.contains('local_shipping') || iconStr.contains('truck')) {
          iconData = Icons.local_shipping;
        } else if (iconStr.contains('storefront') || iconStr.contains('home')) {
          iconData = Icons.storefront;
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE3F1E3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    iconData,
                    size: 16,
                    color: const Color(0xFF2E7D32),
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 80,
                    color: const Color(0xFFE1EAE0),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          (step['stage'] as String).split(': ')[1],
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Color(0xFF1B3A20),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        (step['date'] as String).split(' ')[0],
                        style: const TextStyle(
                          color: Color(0xFF8D9E90),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Mã hồ sơ: ${(step['recordNo'] != null && step['recordNo'].toString().contains(': ')) ? step['recordNo'].toString().split(': ')[1] : step['recordNo'] ?? _tracedProduct!.lot}',
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF2E7D32),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step['details'] as String,
                    style: const TextStyle(
                      color: Color(0xFF4B5D50),
                      fontSize: 12,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 14),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
