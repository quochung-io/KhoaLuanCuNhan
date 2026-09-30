import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../trace/farming_diary_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  final Function(Product) onAddToCart;

  const ProductDetailScreen({super.key, required this.product, required this.onAddToCart});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _commentController = TextEditingController();
  final _replyController = TextEditingController();
  double _userRating = 5.0;

  bool _isLoadingReviews = false;
  List<Map<String, dynamic>> _realReviews = [];
  int _totalReviewCount = 0;
  double _avgRating = 5.0;

  // Giả lập ID người dùng hiện tại (Nguyễn Minh Anh - ID: 3)
  final int _currentUserId = 3;
  final String _currentUserName = 'Nguyễn Minh Anh';

  @override
  void initState() {
    super.initState();
    _fetchRealReviews();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _fetchRealReviews() async {
    setState(() => _isLoadingReviews = true);
    try {
      final res = await ApiService.getProductReviews(widget.product.id, currentUserId: _currentUserId);
      final rawList = (res['reviews'] as List<dynamic>?) ?? [];

      if (rawList.isNotEmpty) {
        setState(() {
          _realReviews = rawList.map((item) => Map<String, dynamic>.from(item as Map)).toList();
          _totalReviewCount = res['totalReviews'] ?? _realReviews.length;
          _avgRating = (res['averageRating'] is num) ? (res['averageRating'] as num).toDouble() : widget.product.rating;
          _isLoadingReviews = false;
        });
      } else {
        // Nếu sản phẩm chưa có review trong DB thì fallback từ reviewList của model
        setState(() {
          _realReviews = widget.product.reviewList.asMap().entries.map((e) {
            return {
              'reviewId': 1000 + e.key,
              'customerId': 1,
              'customerName': e.key % 2 == 0 ? 'Chị Lan (Đà Lạt)' : 'Anh Hoàng (TP.HCM)',
              'roleLabel': '👤 Khách hàng',
              'rating': 5,
              'comment': e.value,
              'createdAt': 'Hôm qua',
              'helpfulCount': e.key * 2 + 1,
              'isHelpfulByMe': false,
              'replies': <Map<String, dynamic>>[],
            };
          }).toList();
          _totalReviewCount = _realReviews.length;
          _avgRating = widget.product.rating;
          _isLoadingReviews = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _realReviews = widget.product.reviewList.asMap().entries.map((e) {
            return {
              'reviewId': 1000 + e.key,
              'customerId': 1,
              'customerName': 'Khách hàng thân thiết',
              'roleLabel': '👤 Khách hàng',
              'rating': 5,
              'comment': e.value,
              'createdAt': 'Gần đây',
              'helpfulCount': 2,
              'isHelpfulByMe': false,
              'replies': <Map<String, dynamic>>[],
            };
          }).toList();
          _totalReviewCount = _realReviews.length;
          _isLoadingReviews = false;
        });
      }
    }
  }

  // Thao tác Thích / Bỏ thích (Like or Unlike)
  Future<void> _handleToggleHelpful(Map<String, dynamic> review) async {
    final int reviewId = review['reviewId'] ?? 0;
    final bool currentLiked = review['isHelpfulByMe'] == true;
    final int currentCount = (review['helpfulCount'] as num?)?.toInt() ?? 0;

    // Optimistic UI update
    setState(() {
      review['isHelpfulByMe'] = !currentLiked;
      review['helpfulCount'] = currentLiked ? (currentCount > 0 ? currentCount - 1 : 0) : currentCount + 1;
    });

    if (reviewId > 0 && reviewId < 1000) {
      await ApiService.toggleReviewHelpful(reviewId: reviewId, userId: _currentUserId);
    }
  }

  // Mở hộp thoại Trả lời (Reply comment)
  void _showReplyDialog(Map<String, dynamic> parentReview) {
    _replyController.clear();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.reply, color: Color(0xFF2E7D32), size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Trả lời ${parentReview['customerName'] ?? 'bình luận'}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '“${parentReview['comment']}”',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _replyController,
              maxLines: 3,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Nhập câu trả lời hoặc trao đổi thêm...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              final text = _replyController.text.trim();
              if (text.isEmpty) return;
              Navigator.pop(ctx);

              final newReply = {
                'customerName': _currentUserName,
                'roleLabel': '👤 Khách hàng',
                'comment': text,
                'createdAt': 'Vừa xong',
                'helpfulCount': 0,
              };

              setState(() {
                if (parentReview['replies'] == null) {
                  parentReview['replies'] = <Map<String, dynamic>>[];
                }
                (parentReview['replies'] as List).add(newReply);
              });

              final int reviewId = parentReview['reviewId'] ?? 0;
              if (reviewId > 0 && reviewId < 1000) {
                await ApiService.replyReview(
                  reviewId: reviewId,
                  customerId: _currentUserId,
                  customerName: _currentUserName,
                  comment: text,
                );
              }

              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Đã gửi phản hồi thành công!'),
                    backgroundColor: Color(0xFF2E7D32),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
            child: const Text('Gửi phản hồi', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // Viết đánh giá nông sản mới
  void _showAddReviewDialog() {
    _commentController.clear();
    _userRating = 5.0;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Viết đánh giá nông sản', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Mức độ hài lòng của bạn:', style: TextStyle(fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < _userRating ? Icons.star : Icons.star_border,
                      color: const Color(0xFFFF9800),
                      size: 28,
                    ),
                    onPressed: () {
                      setDialogState(() {
                        _userRating = index + 1.0;
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _commentController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Nhận xét về độ tươi ngon, đóng gói...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () async {
                final commentText = _commentController.text.trim();
                if (commentText.isEmpty) return;
                Navigator.pop(ctx);

                final newRev = {
                  'reviewId': DateTime.now().millisecondsSinceEpoch,
                  'customerId': _currentUserId,
                  'customerName': _currentUserName,
                  'roleLabel': '👤 Khách hàng (Đã mua hàng)',
                  'rating': _userRating.toInt(),
                  'comment': commentText,
                  'createdAt': 'Vừa xong',
                  'helpfulCount': 0,
                  'isHelpfulByMe': false,
                  'replies': <Map<String, dynamic>>[],
                };

                setState(() {
                  _realReviews.insert(0, newRev);
                  _totalReviewCount += 1;
                });

                await ApiService.submitReview(
                  productId: widget.product.id,
                  customerId: _currentUserId,
                  customerName: _currentUserName,
                  rating: _userRating.toInt(),
                  comment: commentText,
                );

                if (mounted) {
                  ScaffoldMessenger.of(this.context).showSnackBar(
                    const SnackBar(
                      content: Text('Cảm ơn bạn đã gửi đánh giá nông sản!'),
                      backgroundColor: Color(0xFF2E7D32),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
              child: const Text('Gửi đánh giá', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết nông sản'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh minh họa sản phẩm
            Container(
              width: double.infinity,
              height: 220,
              decoration: BoxDecoration(
                color: product.color.withValues(alpha: 0.08),
              ),
              child: Hero(
                tag: 'product-icon-${product.id}',
                child: Icon(
                  product.icon,
                  size: 100,
                  color: product.color,
                ),
              ),
            ),

            // Nội dung chi tiết
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tags chứng nhận & Phân loại
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F1E3),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.cert,
                          style: const TextStyle(color: Color(0xFF2E7D32), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.category,
                          style: TextStyle(color: Colors.orange.shade900, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Nguồn gốc: ${product.region}',
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Tên sản phẩm
                  Text(
                    product.name,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                  ),
                  const SizedBox(height: 8),

                  // Đánh giá sao & lượt review
                  Row(
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFF9800), size: 18),
                      const SizedBox(width: 4),
                      Text(
                        _avgRating.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '($_totalReviewCount đánh giá từ người mua)',
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Giá cả
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${product.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                      ),
                      Text(
                        ' / ${product.unit}',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF8D9E90)),
                      ),
                    ],
                  ),
                  const Divider(color: Color(0xFFE1EAE0), height: 28),

                  // Mô tả sản phẩm
                  const Text(
                    'GIỚI THIỆU SẢN PHẨM',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    product.description,
                    style: const TextStyle(color: Color(0xFF4B5D50), fontSize: 13, height: 1.5),
                  ),
                  const SizedBox(height: 20),

                  // Khung truy xuất nguồn gốc & Nút XEM NHẬT KÝ CANH TÁC
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1EAE0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Mã lô truy xuất nguồn gốc:', style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50))),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE3F1E3),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                product.lot,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Sản phẩm được canh tác theo chuẩn sinh học an toàn, ghi nhận đầy đủ 6 chặng từ gieo hạt đến thu hoạch.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), height: 1.4),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          height: 42,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => FarmingDiaryScreen(
                                    lotCode: product.lot,
                                    productName: product.name,
                                    farmName: 'Trang trại LÀNH Farm (${product.region})',
                                  ),
                                ),
                              );
                            },
                            icon: const Icon(Icons.menu_book_rounded, size: 18),
                            label: const Text('Xem nhật ký canh tác', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE8F5E9),
                              foregroundColor: const Color(0xFF2E7D32),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                                side: const BorderSide(color: Color(0xFF2E7D32)),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Phần Đánh giá & Nhận xét của khách hàng (Chuẩn Web Store)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ĐÁNH GIÁ TỪ KHÁCH HÀNG',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$_totalReviewCount nhận xét thực tế từ người mua',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                          ),
                        ],
                      ),
                      TextButton.icon(
                        onPressed: _showAddReviewDialog,
                        icon: const Icon(Icons.rate_review_outlined, size: 16, color: Color(0xFF2E7D32)),
                        label: const Text('Viết đánh giá', style: TextStyle(fontSize: 13, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (_isLoadingReviews)
                    const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
                  else if (_realReviews.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: const Center(
                        child: Text(
                          'Chưa có đánh giá nào cho sản phẩm này.\nHãy là người đầu tiên trải nghiệm và để lại nhận xét!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey, fontSize: 12, height: 1.4),
                        ),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _realReviews.length,
                      separatorBuilder: (ctx, i) => const Divider(color: Color(0xFFE1EAE0), height: 24),
                      itemBuilder: (ctx, i) {
                        final rev = _realReviews[i];
                        final bool isHelpful = rev['isHelpfulByMe'] == true;
                        final int helpfulCount = (rev['helpfulCount'] as num?)?.toInt() ?? 0;
                        final replies = (rev['replies'] as List<dynamic>?) ?? [];
                        final int starCount = (rev['rating'] as num?)?.toInt() ?? 5;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header bình luận
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                CircleAvatar(
                                  radius: 16,
                                  backgroundColor: const Color(0xFFE3F1E3),
                                  child: Text(
                                    (rev['customerName'] ?? 'K')[0].toUpperCase(),
                                    style: const TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 12),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            rev['customerName'] ?? 'Khách hàng',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                          ),
                                          const SizedBox(width: 6),
                                          if (rev['roleLabel'] != null)
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                              decoration: BoxDecoration(
                                                color: Colors.grey.shade100,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                rev['roleLabel'],
                                                style: TextStyle(fontSize: 9, color: Colors.grey.shade700),
                                              ),
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          Row(
                                            children: List.generate(5, (starIdx) {
                                              return Icon(
                                                starIdx < starCount ? Icons.star : Icons.star_border,
                                                color: const Color(0xFFFF9800),
                                                size: 13,
                                              );
                                            }),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            rev['createdAt'] ?? '',
                                            style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Nội dung nhận xét
                            Padding(
                              padding: const EdgeInsets.only(left: 42),
                              child: Text(
                                rev['comment'] ?? '',
                                style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.4),
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Nút Like / Unlike và Trả lời (Reply)
                            Padding(
                              padding: const EdgeInsets.only(left: 42),
                              child: Row(
                                children: [
                                  // Nút Hữu ích (Like/Unlike)
                                  InkWell(
                                    onTap: () => _handleToggleHelpful(rev),
                                    borderRadius: BorderRadius.circular(6),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Row(
                                        children: [
                                          Icon(
                                            isHelpful ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
                                            size: 14,
                                            color: isHelpful ? const Color(0xFF2E7D32) : Colors.grey.shade600,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            isHelpful ? 'Đã thích ($helpfulCount)' : 'Hữu ích ($helpfulCount)',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: isHelpful ? FontWeight.bold : FontWeight.normal,
                                              color: isHelpful ? const Color(0xFF2E7D32) : Colors.grey.shade700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Nút Trả lời (Reply)
                                  InkWell(
                                    onTap: () => _showReplyDialog(rev),
                                    borderRadius: BorderRadius.circular(6),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Row(
                                        children: [
                                          Icon(Icons.reply, size: 14, color: Colors.grey.shade600),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Trả lời',
                                            style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Danh sách Phản hồi (Replies) thụt lề
                            if (replies.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Padding(
                                padding: const EdgeInsets.only(left: 36),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF9FAFB),
                                    borderRadius: BorderRadius.circular(10),
                                    border: const Border(left: BorderSide(color: Color(0xFF2E7D32), width: 3)),
                                  ),
                                  child: Column(
                                    children: replies.map((rep) {
                                      final r = Map<String, dynamic>.from(rep as Map);
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 8.0),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            CircleAvatar(
                                              radius: 12,
                                              backgroundColor: const Color(0xFFE8F5E9),
                                              child: Text(
                                                (r['customerName'] ?? 'T')[0].toUpperCase(),
                                                style: const TextStyle(fontSize: 10, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Text(
                                                        r['customerName'] ?? 'Thành viên LÀNH',
                                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                                                      ),
                                                      const SizedBox(width: 6),
                                                      if (r['roleLabel'] != null)
                                                        Text(
                                                          r['roleLabel'],
                                                          style: const TextStyle(fontSize: 9, color: Color(0xFF2E7D32)),
                                                        ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    r['comment'] ?? '',
                                                    style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563)),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        );
                      },
                    ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE1EAE0))),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                widget.onAddToCart(product);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Đã thêm ${product.name} vào giỏ hàng!'),
                    backgroundColor: const Color(0xFF2E7D32),
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
              icon: const Icon(Icons.add_shopping_cart, size: 20),
              label: const Text('Thêm vào giỏ hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
