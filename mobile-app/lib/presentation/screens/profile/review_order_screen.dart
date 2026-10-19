import 'package:flutter/material.dart';
import '../../../data/api_service.dart';

class ReviewOrderScreen extends StatefulWidget {
  final Map<String, dynamic> order;
  final int? userId;

  const ReviewOrderScreen({super.key, required this.order, this.userId});

  @override
  State<ReviewOrderScreen> createState() => _ReviewOrderScreenState();
}

class _ReviewOrderScreenState extends State<ReviewOrderScreen> {
  bool _isLoading = false;
  List<dynamic> _orderItems = [];

  // State for each item
  List<int> _productRatings = [];
  List<TextEditingController> _commentControllers = [];

  // State for seller and shipping service
  int _sellerServiceRating = 5;
  int _shippingServiceRating = 5;

  @override
  void initState() {
    super.initState();
    _orderItems = (widget.order['orderItems'] as List<dynamic>?) ?? [];
    for (int i = 0; i < _orderItems.length; i++) {
      _productRatings.add(5);
      _commentControllers.add(TextEditingController());
    }
  }

  @override
  void dispose() {
    for (var ctrl in _commentControllers) {
      ctrl.dispose();
    }
    super.dispose();
  }

  Future<void> _submitReview() async {
    setState(() => _isLoading = true);

    final customer = widget.order['customer'] as Map<String, dynamic>?;
    final rawCustomerId = widget.userId ??
        customer?['id'] ??
        customer?['customerId'] ??
        customer?['userId'] ??
        widget.order['customerId'] ??
        widget.order['userId'] ??
        3;
    final int customerId = rawCustomerId is num
        ? rawCustomerId.toInt()
        : int.tryParse(rawCustomerId.toString()) ?? 3;

    final customerName =
        customer?['fullName'] ?? customer?['name'] ?? 'Khách hàng';

    bool allSuccess = true;
    for (int i = 0; i < _orderItems.length; i++) {
      final item = _orderItems[i];
      final prod = item['product'] as Map<String, dynamic>?;
      final rawPId = prod?['productId'] ??
          prod?['id'] ??
          item['productId'] ??
          item['id'];
      final int pId = rawPId is num
          ? rawPId.toInt()
          : int.tryParse(rawPId?.toString() ?? '') ?? 0;

      if (pId > 0) {
        try {
          String finalComment = _commentControllers[i].text.trim();
          if (finalComment.isEmpty) {
            finalComment = 'Chất lượng nông sản tươi ngon, rất hài lòng!';
          }

          // Add seller service rating to the comment for the backend to store
          finalComment +=
              '\n[Dịch vụ người bán: $_sellerServiceRating sao | Giao hàng: $_shippingServiceRating sao]';

          final success = await ApiService.submitReview(
            productId: pId,
            customerId: customerId,
            customerName: customerName,
            rating: _productRatings[i],
            comment: finalComment,
          );
          if (!success) allSuccess = false;
        } catch (e) {
          allSuccess = false;
        }
      }
    }

    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            allSuccess
                ? 'Đã gửi đánh giá thành công!'
                : 'Có lỗi khi gửi một số đánh giá.',
          ),
          backgroundColor: allSuccess ? const Color(0xFF2E7D32) : Colors.red,
        ),
      );
      if (allSuccess) {
        Navigator.pop(context, true); // Return true to indicate success
      }
    }
  }

  Widget _buildStarRating(
    int currentRating,
    Function(int) onRatingChanged, {
    double size = 32,
  }) {
    return Row(
      children: List.generate(5, (index) {
        return GestureDetector(
          onTap: () => onRatingChanged(index + 1),
          child: Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: Icon(
              index < currentRating ? Icons.star : Icons.star_border,
              color: Colors.orange,
              size: size,
            ),
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text(
          'Đánh giá sản phẩm',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: const Color(0xFF2E7D32),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  // Product list for rating
                  ...List.generate(_orderItems.length, (index) {
                    final item = _orderItems[index];
                    final prod = item['product'] as Map<String, dynamic>?;
                    final name = prod?['productName'] ??
                        prod?['name'] ??
                        item['productName'] ??
                        item['name'] ??
                        'Nông sản LÀNH';
                    final qty = item['quantity'] ?? 1;

                    String? imgUrl = item['imageUrl'] ??
                        item['image'] ??
                        prod?['imageUrl'] ??
                        prod?['image'];
                    if (imgUrl == null || imgUrl.toString().isEmpty) {
                      final images = (prod?['images'] ?? item['images'])
                          as List<dynamic>?;
                      if (images != null && images.isNotEmpty) {
                        final first = images.first;
                        if (first is Map) {
                          imgUrl = first['imageUrl']?.toString() ??
                              first['url']?.toString();
                        } else {
                          imgUrl = first.toString();
                        }
                      }
                    }

                    return Card(
                      color: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Product Info
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: (imgUrl != null &&
                                          imgUrl.toString().isNotEmpty)
                                      ? Image.network(
                                          imgUrl.toString(),
                                          width: 60,
                                          height: 60,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) =>
                                              _buildFallbackImg(60),
                                        )
                                      : _buildFallbackImg(60),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Phân loại: Hàng chuẩn | Số lượng: $qty',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 24, thickness: 1),

                            // Product Rating
                            Row(
                              children: [
                                const Text(
                                  'Chất lượng sản phẩm',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                                const Spacer(),
                                _buildStarRating(_productRatings[index], (val) {
                                  setState(() => _productRatings[index] = val);
                                }, size: 26),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Comment Box
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[300]!),
                              ),
                              child: TextField(
                                controller: _commentControllers[index],
                                maxLines: 4,
                                decoration: const InputDecoration(
                                  hintText:
                                      'Hãy chia sẻ nhận xét cho sản phẩm này nhé!',
                                  hintStyle: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.all(12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),

                  // Seller and Shipping Rating
                  Card(
                    color: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    margin: const EdgeInsets.only(bottom: 24),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Đánh giá dịch vụ',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Text(
                                'Dịch vụ người bán',
                                style: TextStyle(fontSize: 15),
                              ),
                              const Spacer(),
                              _buildStarRating(_sellerServiceRating, (val) {
                                setState(() => _sellerServiceRating = val);
                              }, size: 24),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Text(
                                'Dịch vụ vận chuyển',
                                style: TextStyle(fontSize: 15),
                              ),
                              const Spacer(),
                              _buildStarRating(_shippingServiceRating, (val) {
                                setState(() => _shippingServiceRating = val);
                              }, size: 24),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton(
            onPressed: _isLoading ? null : _submitReview,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'Gửi Đánh Giá',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackImg([double size = 60]) {
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
