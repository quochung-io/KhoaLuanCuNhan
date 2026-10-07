import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/api_service.dart';
import '../../../core/utils/traceability_utils.dart';
import 'widgets/scanning_line_animation.dart';

class TraceScreen extends StatefulWidget {
  final String? initialLotCode;
  final VoidCallback? onClearCode;

  const TraceScreen({super.key, this.initialLotCode, this.onClearCode});

  @override
  State<TraceScreen> createState() => _TraceScreenState();
}

class _TraceScreenState extends State<TraceScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _hasSearched = false;
  bool _isScanning = false;
  String? _scannedCode;
  Product? _tracedProduct;

  bool _isLoadingTrace = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLotCode != null) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  @override
  void didUpdateWidget(covariant TraceScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialLotCode != null) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  Future<void> _performTrace(String lotCode) async {
    setState(() {
      _isLoadingTrace = true;
      _hasSearched = true;
      _tracedProduct = null;
    });

    try {
      // 1. Lấy danh sách lô hàng từ API
      final batches = await ApiService.getProductBatches();
      
      // 2. Tìm lô hàng khớp mã
      final foundBatch = batches.firstWhere(
        (b) => (b['batchCode'] ?? '').toString().toLowerCase() == lotCode.trim().toLowerCase(),
        orElse: () => null,
      );

      if (foundBatch != null && mounted) {
        final productData = foundBatch['product'];
        Product? product;
        if (productData != null) {
          productData['lotCode'] = foundBatch['batchCode'];
          product = Product.fromJson(productData);
        }

        setState(() {
          _tracedProduct = product ?? productsData[0];
          _isLoadingTrace = false;
        });
      } else if (mounted) {
         setState(() {
           // Fallback nếu gõ mã sai, hiển thị sản phẩm mẫu để test
           _tracedProduct = productsData[0];
           _isLoadingTrace = false;
         });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _tracedProduct = productsData[0];
          _isLoadingTrace = false;
        });
      }
    }
  }

  // Giả lập quét mã QR với hiệu ứng động
  void _startQrScan() {
    setState(() {
      _isScanning = true;
    });
    // Giả lập quét thành công sau 2.5 giây
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted && _isScanning) {
        setState(() {
          _isScanning = false;
          _scannedCode = 'LOT#VN-DL-0842'; // Lô hàng Cải Bó Xôi
          _controller.text = _scannedCode!;
          _performTrace(_scannedCode!);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Quét mã QR thành công!'),
            backgroundColor: Color(0xFF2E7D32),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Truy xuất nguồn gốc'),
      ),
      body: _isScanning
          ? _buildQrScannerOverlay()
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'NHẬT KÝ HÀNH TRÌNH NÔNG SẢN',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Nhập mã lô hoặc Quét QR',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Thanh nhập mã + Button Scan
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            decoration: InputDecoration(
                              hintText: 'Nhập mã ví dụ: LOT#VN-DL-0842',
                              hintStyle: const TextStyle(color: Color(0xFF8D9E90), fontSize: 13),
                              fillColor: Colors.white,
                              filled: true,
                              prefixIcon: const Icon(Icons.search, color: Color(0xFF2E7D32)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFF2E7D32)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: _startQrScan,
                          child: Container(
                            height: 48,
                            width: 48,
                            decoration: BoxDecoration(
                              color: const Color(0xFFE3F1E3),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF2E7D32).withValues(alpha: 0.2)),
                            ),
                            child: const Icon(Icons.qr_code_scanner, color: Color(0xFF2E7D32)),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () => _performTrace(_controller.text),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Truy xuất', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Kết quả truy xuất
                    if (_isLoadingTrace) ...[
                      const SizedBox(height: 60),
                      const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32))),
                    ] else if (_hasSearched && _tracedProduct != null) ...[
                      _buildTracedProductHeader(_tracedProduct!),
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
                    ] else if (!_hasSearched) ...[
                      // Giao diện chào khi chưa tìm kiếm
                      Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 40),
                            Icon(Icons.history_edu_outlined, size: 72, color: const Color(0xFF2E7D32).withValues(alpha: 0.15)),
                            const SizedBox(height: 12),
                            const Text(
                              'Nhật ký Farm-to-Table',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                            ),
                            const SizedBox(height: 6),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 24.0),
                              child: Text(
                                'Quét mã QR trên tem nhãn nông sản LÀNH để kiểm tra nguồn gốc, hạt giống, quá trình thu hoạch và chứng nhận kiểm định.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      )
                    ]
                  ],
                ),
              ),
            ),
    );
  }

  // UI quét mã QR giả lập
  Widget _buildQrScannerOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.9),
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Lớp hướng dẫn quét
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'QUÉT MÃ QR NÔNG SẢN LÀNH',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              const SizedBox(height: 8),
              const Text(
                'Đặt mã QR nằm bên trong khung quét',
                style: TextStyle(color: Colors.white70, fontSize: 11),
              ),
              const SizedBox(height: 32),
              // Khung quét
              Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF4CAF50), width: 3),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Stack(
                  children: [
                    // Hiệu ứng tia quét di chuyển giả lập (Animated line)
                    ScanningLineAnimation(),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              // Nút hủy
              OutlinedButton(
                onPressed: () {
                  setState(() {
                    _isScanning = false;
                  });
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white54),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: const Text('Hủy bỏ'),
              )
            ],
          )
        ],
      ),
    );
  }

  // Header thông tin sản phẩm được truy xuất
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
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1B3A20)),
                ),
                const SizedBox(height: 2),
                Text(
                  'Lô sản xuất: ${product.lot}',
                  style: const TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  'Chuẩn: ${product.cert} · Nguồn gốc: ${product.region}',
                  style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // Timeline hành trình Farm-to-Table
  Widget _buildTraceTimeline() {
    if (_tracedProduct == null) return const SizedBox();
    
    // Sử dụng Utils để sinh timeline động khớp với Web
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
        
        // Map IconData từ Utils sang text emoji tạm thời hoặc dùng trực tiếp IconData
        final iconData = step['icon'] as IconData;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cột bên trái: Timeline và đường thẳng nối
            Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE3F1E3),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(iconData, size: 16, color: const Color(0xFF2E7D32)),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 80, // Tăng chiều cao để đủ chỗ cho text
                    color: const Color(0xFFE1EAE0),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            // Cột bên phải: Thông tin bước
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          (step['stage'] as String).split(': ')[1], // Lấy phần sau dấu ':' để làm title
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1B3A20)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        (step['date'] as String).split(' ')[0], // Chỉ lấy phần ngày
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Mã hồ sơ: ${(step['recordNo'] != null && step['recordNo'].toString().contains(': ')) ? step['recordNo'].toString().split(': ')[1] : step['recordNo'] ?? _tracedProduct!.lot}',
                    style: const TextStyle(fontSize: 10, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step['details'] as String,
                    style: const TextStyle(color: Color(0xFF4B5D50), fontSize: 12, height: 1.3),
                  ),
                  const SizedBox(height: 14),
                ],
              ),
            )
          ],
        );
      },
    );
  }
}
