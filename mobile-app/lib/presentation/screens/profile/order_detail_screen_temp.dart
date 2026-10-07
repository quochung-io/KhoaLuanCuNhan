import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../product_detail/product_detail_screen.dart'; // import product detail

class OrderDetailScreen extends StatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback? onOrderUpdated;
  final Function(Product, {int qty})? onAddToCart;

  const OrderDetailScreen({
    super.key,
    required this.order,
    this.onOrderUpdated,
    this.onAddToCart,
  });

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late Map<String, dynamic> _currentOrder;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _currentOrder = widget.order;
  }

  String _formatCurrency(dynamic amount) {
    if (amount == null) return '0â‚«';
    final val = double.tryParse(amount.toString()) ?? 0;
    return '${val.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}â‚«';
  }

  int _getStatusStep(String? status) {
    final s = (status ?? 'pending').toLowerCase();
    if (s == 'cancelled') return -1;
    if (s == 'delivered' || s == 'completed') return 4;
    if (s == 'shipping') return 3;
    if (s == 'processing') return 2;
    return 1; // pending (Ä‘Ã£ xÃ¡c nháº­n/chá» duyá»‡t)
  }

  void _showReviewModal() {
    int selectedRating = 5;
    final commentCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16, right: 16, top: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('ÄÃ¡nh giÃ¡ Ä‘Æ¡n hÃ ng', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) => IconButton(
                      icon: Icon(
                        index < selectedRating ? Icons.star : Icons.star_border,
                        color: Colors.orange,
                        size: 40,
                      ),
                      onPressed: () {
                        setModalState(() => selectedRating = index + 1);
                      },
                    )),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: commentCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Chia sáº» tráº£i nghiá»‡m cá»§a báº¡n vá» nÃ´ng sáº£n...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        _submitReview(selectedRating, commentCtrl.text);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Gá»­i Ä‘Ã¡nh giÃ¡', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _submitReview(int rating, String comment) async {
    setState(() => _isLoading = true);
    final items = (_currentOrder['orderItems'] as List<dynamic>?) ?? [];
    final customer = _currentOrder['customer'] as Map<String, dynamic>?;
    final customerId = customer?['id'] ?? customer?['customerId'] ?? _currentOrder['customerId'] ?? 3;
    final customerName = customer?['fullName'] ?? customer?['name'] ?? 'KhÃ¡ch hÃ ng';

    bool allSuccess = true;
    for (var item in items) {
      final prod = item['product'];
      if (prod != null) {
        final pId = prod['productId'] ?? prod['id'];
        if (pId != null) {
          try {
            final success = await ApiService.submitReview(
              productId: pId,
              customerId: customerId,
              customerName: customerName,
              rating: rating,
              comment: comment.isEmpty ? 'Cháº¥t lÆ°á»£ng nÃ´ng sáº£n ráº¥t tá»‘t!' : comment,
            );
            if (!success) allSuccess = false;
          } catch (e) {
            allSuccess = false;
          }
        }
      }
    }

    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(allSuccess ? 'ÄÃ£ gá»­i Ä‘Ã¡nh giÃ¡ thÃ nh cÃ´ng!' : 'CÃ³ lá»—i khi gá»­i má»™t sá»‘ Ä‘Ã¡nh giÃ¡.'),
          backgroundColor: allSuccess ? const Color(0xFF2E7D32) : Colors.red,
        ),
      );
    }
  }

  void _showCancelDialog() {
    final reasonCtrl = TextEditingController(text: 'TÃ´i muá»‘n Ä‘á»•i Ä‘á»‹a chá»‰ giao hÃ ng hoáº·c thÃªm mÃ³n');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('XÃ¡c nháº­n há»§y Ä‘Æ¡n hÃ ng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n há»§y Ä‘Æ¡n hÃ ng nÃ y khÃ´ng? NÃ´ng sáº£n sáº½ Ä‘Æ°á»£c hoÃ n láº¡i kho.', style: TextStyle(fontSize: 13)),
            const SizedBox(height: 12),
            TextField(
              controller: reasonCtrl,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'LÃ½ do há»§y Ä‘Æ¡n',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.all(10),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Giá»¯ Ä‘Æ¡n hÃ ng', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() => _isLoading = true);
              final orderId = _currentOrder['orderId'] ?? _currentOrder['id'];
              final success = await ApiService.cancelOrder(orderId, reason: reasonCtrl.text.trim());
              setState(() => _isLoading = false);

              if (mounted) {
                if (success) {
                  setState(() {
                    _currentOrder['orderStatus'] = 'Cancelled';
                  });
                  widget.onOrderUpdated?.call();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('ÄÃ£ há»§y Ä‘Æ¡n hÃ ng thÃ nh cÃ´ng'), backgroundColor: Colors.red),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('KhÃ´ng thá»ƒ há»§y Ä‘Æ¡n lÃºc nÃ y. Vui lÃ²ng thá»­ láº¡i.'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Há»§y Ä‘Æ¡n ngay', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final oStatus = (_currentOrder['orderStatus'] ?? 'pending').toString().toLowerCase();
    final isCancelled = oStatus == 'cancelled';
    final currentStep = _getStatusStep(oStatus);
    final items = (_currentOrder['orderItems'] as List<dynamic>?) ?? [];
    final address = _currentOrder['address'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        title: Text(
          'ÄÆ¡n hÃ ng #${_currentOrder['orderCode'] ?? _currentOrder['orderId'] ?? ''}',
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
                  // TIáº¾N TRÃŒNH ÄÆ N HÃ€NG (TIMELINE STEPPER)
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
                              'TIáº¾N TRÃŒNH GIAO HÃ€NG',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
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
                                    'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c há»§y. NÃ´ng sáº£n vÃ  chi phÃ­ Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ hoÃ n tráº£.',
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

                  // THÃ”NG TIN NHáº¬N HÃ€NG
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
                              'Äá»ŠA CHá»ˆ NHáº¬N HÃ€NG',
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
                          address?['receiverName'] ?? _currentOrder['customer']?['fullName'] ?? 'KhÃ¡ch hÃ ng',
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

                  // DANH SÃCH NÃ”NG Sáº¢N TRONG ÄÆ N
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
                              'DANH SÃCH NÃ”NG Sáº¢N',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                                color: Color(0xFF2E7D32),
                              ),
                            ),
                            Text('${items.length} mÃ³n', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                        const Divider(height: 20),
                        ...items.map((item) {
                          final prod = item['product'] as Map<String, dynamic>?;
                          final prodName = prod?['productName'] ?? item['productName'] ?? 'NÃ´ng sáº£n LÃ€NH';
                          final unit = prod?['unit'] ?? item['unit'] ?? 'kg';
                          final qty = item['quantity'] ?? 1;
                          final price = item['unitPrice'] ?? prod?['price'] ?? 0;
                          final images = prod?['productImages'] as List<dynamic>?;
                          final imgUrl = (images != null && images.isNotEmpty) ? images[0]['imageUrl'] : null;

                          return InkWell(
                            onTap: () {
                              if (prod != null) {
                                final product = Product(
                                  id: prod['productId'] ?? prod['id'] ?? 0,
                                  name: prodName,
                                  price: (prod['price'] ?? 0).toDouble().toInt(),
                                  imageUrl: imgUrl ?? '',
                                  unit: unit,
                                  category: prod['type'] ?? 'product',
                                  stockQuantity: 999, // dummy
                                  description: prod['description'] ?? '',
                                  lot: prod['lotCode'] ?? '',
                                  cert: prod['cert'] ?? 'VietGAP',
                                  region: prod['region'] ?? 'Viá»‡t Nam',
                                  rating: 5.0,
                                  reviews: 0,
                                  icon: Icons.eco_outlined,
                                  color: const Color(0xFF2E7D32),
                                );
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => ProductDetailScreen(
                                      product: product,
                                      onAddToCart: widget.onAddToCart ?? (p, {qty=1}) {},
                                    ),
                                  ),
                                );
                              }
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: imgUrl != null
                                        ? Image.network(
                                            imgUrl,
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
                                          'Sá»‘ lÆ°á»£ng: $qty $unit',
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
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Tá»”NG Káº¾T THANH TOÃN
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
                          'CHI TIáº¾T THANH TOÃN',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        const Divider(height: 20),
                        _buildPaymentRow('Tiá»n hÃ ng nÃ´ng sáº£n', _formatCurrency(_currentOrder['totalAmount'])),
                        _buildPaymentRow('PhÃ­ váº­n chuyá»ƒn', 'Miá»…n phÃ­'),
                        _buildPaymentRow('PhÆ°Æ¡ng thá»©c', _currentOrder['paymentMethod'] ?? 'COD (Tiá»n máº·t)'),
                        _buildPaymentRow('Tráº¡ng thÃ¡i thanh toÃ¡n', _currentOrder['paymentStatus'] == 'Paid' ? 'ÄÃ£ thanh toÃ¡n' : 'ChÆ°a thanh toÃ¡n'),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Tá»•ng thanh toÃ¡n:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
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

                  // HÃ€NH Äá»˜NG
                  if (oStatus == 'pending') ...[
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: OutlinedButton.icon(
                        onPressed: _showCancelDialog,
                        icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                        label: const Text('Há»¦Y ÄÆ N HÃ€NG NÃ€Y', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                  ],
                  if (oStatus == 'delivered' || oStatus == 'completed') ...[
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
                            'ÄÃNH GIÃ ÄÆ N HÃ€NG',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                              color: Color(0xFF2E7D32),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(5, (index) => IconButton(
                              icon: const Icon(Icons.star_border, color: Colors.orange, size: 32),
                              onPressed: _showReviewModal,
                            )),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (widget.onAddToCart != null) {
                          for (var item in items) {
                            final prod = item['product'];
                            if (prod != null) {
                              final product = Product(
                                id: prod['productId'] ?? prod['id'] ?? 0,
                                name: prod['productName'] ?? prod['name'] ?? 'Sáº£n pháº©m',
                                price: (prod['price'] ?? 0).toDouble().toInt(),
                                imageUrl: prod['imageUrl'] ?? '',
                                unit: prod['unit'] ?? 'kg',
                                category: prod['type'] ?? 'product',
                                stockQuantity: 999, // dummy
                                description: prod['description'] ?? '',
                                lot: prod['lotCode'] ?? '',
                                cert: prod['cert'] ?? 'VietGAP',
                                region: prod['region'] ?? 'Viá»‡t Nam',
                                rating: 5.0,
                                reviews: 0,
                                icon: Icons.eco_outlined,
                                color: const Color(0xFF2E7D32),
                              );
                              final qty = item['quantity'] ?? 1;
                              widget.onAddToCart!(product, qty: qty);
                            }
                          }
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('ÄÃ£ thÃªm cÃ¡c sáº£n pháº©m vÃ o giá» hÃ ng'),
                              backgroundColor: Color(0xFF2E7D32),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.shopping_cart_checkout, color: Colors.white),
                      label: const Text('MUA Láº I ÄÆ N HÃ€NG NÃ€Y', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
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
    if (addr == null) return 'Äá»‹a chá»‰ Ä‘Ã£ lÆ°u táº¡i há»‡ thá»‘ng';
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
          Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
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
        label = 'ÄÃ£ hoÃ n táº¥t';
        break;
      case 'shipping':
        bg = const Color(0xFFE3F2FD);
        text = const Color(0xFF1565C0);
        label = 'Äang giao hÃ ng';
        break;
      case 'processing':
        bg = const Color(0xFFEDE7F6);
        text = const Color(0xFF5E35B1);
        label = 'Äang láº¥y hÃ ng';
        break;
      case 'cancelled':
        bg = const Color(0xFFFFEBEE);
        text = const Color(0xFFC62828);
        label = 'ÄÃ£ há»§y';
        break;
      default:
        bg = const Color(0xFFFFF3E0);
        text = const Color(0xFFE65100);
        label = 'Chá» xÃ¡c nháº­n';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(color: text, fontSize: 11.5, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildStepper(int currentStep) {
    final steps = [
      'ÄÃ£ Ä‘áº·t hÃ ng',
      'ÄÃ£ xÃ¡c nháº­n',
      'Láº¥y hÃ ng & ÄÃ³ng gÃ³i',
      'Äang giao Shipper',
      'Giao thÃ nh cÃ´ng',
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
}

