import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../../../data/models/cart_item_model.dart';
import '../checkout/checkout_screen.dart';
import '../trace/farming_diary_screen.dart';
import '../auth/login_screen.dart';
import 'review_screen.dart';
import '../../../core/utils/favorites_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  final void Function(Product, {int qty}) onAddToCart;

  const ProductDetailScreen({super.key, required this.product, required this.onAddToCart});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _commentController = TextEditingController();
  final _replyController = TextEditingController();

  bool _isLoadingReviews = false;
  List<Map<String, dynamic>> _realReviews = [];
  int _totalReviewCount = 0;
  double _avgRating = 5.0;
  
  bool _isLoadingDetails = false;
  Product? _fetchedProduct;
  List<Product> _frequentlyBoughtTogether = [];
  List<Product> _relatedProducts = [];
  bool _isFavorite = false;
  dynamic _replyingReviewId;

  // Trạng thái chỉnh sửa trực tiếp trên bình luận (Inline Editing)
  int? _editingReviewId;
  int? _editingReplyId;
  int _editingRating = 5;
  final TextEditingController _inlineEditController = TextEditingController();
  bool _isSavingInlineEdit = false;

  // Thông tin người dùng hiện tại (Tự động tải từ phiên đăng nhập thực tế)
  int? _currentUserId;
  String _currentUserName = 'Khách vãng lai';

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
    _checkFavorite();
    _fetchProductDetails();
  }

  Future<void> _checkFavorite() async {
    final isFav = await FavoritesService.isFavoriteProduct(widget.product.id);
    if (mounted) setState(() => _isFavorite = isFav);
  }

  Future<void> _toggleFavorite() async {
    final product = _fetchedProduct ?? widget.product;
    final nowFav = await FavoritesService.toggleFavoriteProduct(product);
    if (mounted) {
      setState(() => _isFavorite = nowFav);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(nowFav ? 'Đã thêm "${product.name}" vào danh sách yêu thích' : 'Đã bỏ yêu thích "${product.name}"'),
          duration: const Duration(seconds: 1),
          backgroundColor: nowFav ? const Color(0xFF2E7D32) : Colors.grey.shade700,
        ),
      );
    }
  }

  Future<void> _loadCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('customer_user');
      if (userStr != null) {
        final userData = jsonDecode(userStr);
        if (mounted) {
          setState(() {
            final rawId = userData['userId'] ?? userData['id'];
            _currentUserId = rawId != null ? (rawId as num).toInt() : null;
            _currentUserName = (userData['fullName'] ?? 'Khách hàng').toString();
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _currentUserId = null;
            _currentUserName = 'Khách vãng lai';
          });
        }
      }
    } catch (_) {}
    _fetchRealReviews();
  }

  // Kiểm tra trạng thái đăng nhập trước khi thực hiện thao tác tương tác
  bool _checkLoginRequired(String actionName) {
    if (_currentUserId == null || _currentUserId! <= 0) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.lock_outline, color: Color(0xFF2E7D32)),
              SizedBox(width: 8),
              Text('Yêu cầu đăng nhập', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text('Vui lòng đăng nhập để $actionName.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Để sau', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ).then((_) => _loadCurrentUser());
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
              child: const Text('Đăng nhập ngay', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return false;
    }
    return true;
  }

  @override
  void dispose() {
    _commentController.dispose();
    _replyController.dispose();
    _inlineEditController.dispose();
    super.dispose();
  }

  Future<void> _fetchProductDetails() async {
    setState(() => _isLoadingDetails = true);
    try {
      final productData = await ApiService.getProductById(widget.product.id);
      final freqBoughtData = await ApiService.getFrequentlyBoughtTogether(widget.product.id);
      final allProductsData = await ApiService.getProducts();

      if (mounted) {
        setState(() {
          if (productData != null) {
            _fetchedProduct = Product.fromJson(productData);
          }
          if (freqBoughtData.isNotEmpty) {
            _frequentlyBoughtTogether = freqBoughtData.map((e) => Product.fromJson(e)).toList();
          }
          
          final categoryToMatch = _fetchedProduct?.category ?? widget.product.category;
          _relatedProducts = allProductsData
              .map((e) => Product.fromJson(e as Map<String, dynamic>))
              .where((p) => p.id != widget.product.id && p.category == categoryToMatch)
              .take(4)
              .toList();

          _isLoadingDetails = false;
        });
      }
    } catch (e) {
      debugPrint('Lỗi khi tải chi tiết sản phẩm: $e');
      if (mounted) {
        setState(() => _isLoadingDetails = false);
      }
    }
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
        setState(() {
          _realReviews = [];
          _totalReviewCount = 0;
          _avgRating = widget.product.rating;
          _isLoadingReviews = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _realReviews = [];
          _totalReviewCount = 0;
          _isLoadingReviews = false;
        });
      }
    }
  }

  // Thao tác Thích / Bỏ thích (Like or Unlike)
  Future<void> _handleToggleHelpful(Map<String, dynamic> review) async {
    if (!_checkLoginRequired('thích đánh giá này')) return;
    final int reviewId = review['reviewId'] ?? 0;
    final bool currentLiked = review['isHelpfulByMe'] == true;
    final int currentCount = (review['helpfulCount'] as num?)?.toInt() ?? 0;

    // Optimistic UI update
    setState(() {
      review['isHelpfulByMe'] = !currentLiked;
      review['helpfulCount'] = currentLiked ? (currentCount > 0 ? currentCount - 1 : 0) : currentCount + 1;
    });

    if (reviewId > 0 && reviewId < 1000 && _currentUserId != null) {
      await ApiService.toggleReviewHelpful(reviewId: reviewId, userId: _currentUserId!);
    }
  }

  // Trả lời bình luận của khách hàng khác (Viết thẳng trên giao diện, không popup)
  void _toggleReplyInline(Map<String, dynamic> parentReview, int index) {
    if (!_checkLoginRequired('trả lời bình luận này')) return;
    final revId = parentReview['reviewId'] ?? index;
    setState(() {
      if (_replyingReviewId == revId) {
        _replyingReviewId = null;
      } else {
        _replyingReviewId = revId;
        _replyController.clear();
        final authorName = parentReview['customerName'] ?? 'Khách hàng';
        _replyController.text = '@$authorName ';
      }
    });
  }

  Future<void> _submitReplyInline(Map<String, dynamic> parentReview) async {
    if (!_checkLoginRequired('trả lời bình luận này')) return;
    final text = _replyController.text.trim();
    if (text.isEmpty) return;

    final newReply = {
      'customerName': _currentUserName,
      'roleLabel': '👤 Khách hàng',
      'comment': text,
      'createdAt': 'Vừa xong',
      'helpfulCount': 0,
    };

    setState(() {
      _replyingReviewId = null;
      if (parentReview['replies'] == null) {
        parentReview['replies'] = <Map<String, dynamic>>[];
      }
      (parentReview['replies'] as List).add(newReply);
    });

    final int reviewId = (parentReview['reviewId'] as num?)?.toInt() ?? 0;
    if (reviewId > 0 && _currentUserId != null) {
      await ApiService.replyReview(
        reviewId: reviewId,
        customerId: _currentUserId!,
        customerName: _currentUserName,
        comment: text,
      );
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã gửi phản hồi thành công!'),
          backgroundColor: Color(0xFF2E7D32),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  // Viết đánh giá nông sản mới
  void _showAddReviewDialog() async {
    if (!_checkLoginRequired('viết đánh giá')) return;
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ReviewScreen(
          product: widget.product,
          currentUserId: _currentUserId!,
          currentUserName: _currentUserName,
        ),
      ),
    );

    if (!mounted) return;
    if (result != null && result is Map<String, dynamic>) {
      setState(() {
        _realReviews.insert(0, result);
        _totalReviewCount += 1;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cảm ơn bạn đã gửi đánh giá!'),
          backgroundColor: Color(0xFF2E7D32),
        ),
      );
    }
  }

  // Bật chế độ chỉnh sửa trực tiếp ngay tại bình luận (Inline Editing)
  void _startInlineEdit(
    Map<String, dynamic> rev, {
    Map<String, dynamic>? parentRev,
  }) {
    if (_currentUserId == null || _currentUserId! <= 0) return;
    final bool isReply = parentRev != null;
    final int id = ((rev['reviewId'] ?? rev['id']) as num?)?.toInt() ?? 0;

    setState(() {
      _replyingReviewId = null; // Đóng form trả lời nếu đang mở
      if (isReply) {
        _editingReplyId = id;
        _editingReviewId = null;
      } else {
        _editingReviewId = id;
        _editingReplyId = null;
        _editingRating = (rev['rating'] as num?)?.toInt() ?? 5;
      }
      _inlineEditController.text = rev['comment']?.toString() ?? '';
    });
  }

  void _cancelInlineEdit() {
    setState(() {
      _editingReviewId = null;
      _editingReplyId = null;
      _inlineEditController.clear();
      _isSavingInlineEdit = false;
    });
  }

  // Lưu nội dung chỉnh sửa trực tiếp
  Future<void> _saveInlineEdit(
    Map<String, dynamic> rev, {
    Map<String, dynamic>? parentRev,
  }) async {
    if (_currentUserId == null || _currentUserId! <= 0) return;
    final bool isReply = parentRev != null;
    final int reviewId = ((rev['reviewId'] ?? rev['id']) as num?)?.toInt() ?? 0;
    final newText = _inlineEditController.text.trim();

    if (newText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập nội dung nhận xét!'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSavingInlineEdit = true);
    final success = await ApiService.updateReview(
      reviewId: reviewId,
      userId: _currentUserId!,
      comment: newText,
      rating: isReply ? null : _editingRating,
    );

    if (!mounted) return;
    setState(() => _isSavingInlineEdit = false);

    if (success) {
      setState(() {
        rev['comment'] = newText;
        if (!isReply) {
          rev['rating'] = _editingRating;
        }
        rev['updatedAt'] = 'Vừa cập nhật';
        _editingReviewId = null;
        _editingReplyId = null;
        _inlineEditController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isReply
                ? 'Đã cập nhật phản hồi thành công!'
                : 'Đã cập nhật đánh giá thành công!',
          ),
          backgroundColor: const Color(0xFF2E7D32),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không thể cập nhật đánh giá. Vui lòng thử lại!'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Thiết kế lại Menu khi ấn vào 3 chấm (dạng Bottom Sheet chứa các Thẻ Action sang trọng)
  void _showReviewOptionsMenu(
    Map<String, dynamic> rev, {
    Map<String, dynamic>? parentRev,
  }) {
    final bool isReply = parentRev != null;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 16,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Thanh gạt modal bar
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            // Tiêu đề modal
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.more_horiz_rounded,
                    color: Color(0xFF374151),
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  isReply ? 'Tùy chọn phản hồi' : 'Tùy chọn đánh giá',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const Spacer(),
                InkWell(
                  onTap: () => Navigator.pop(ctx),
                  borderRadius: BorderRadius.circular(20),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(Icons.close, size: 20, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Thẻ tùy chọn 1: Chỉnh sửa trực tiếp
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  Navigator.pop(ctx);
                  _startInlineEdit(rev, parentRev: parentRev);
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.edit_outlined,
                          color: Color(0xFF374151),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          isReply ? 'Chỉnh sửa phản hồi' : 'Chỉnh sửa đánh giá',
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: Color(0xFF9CA3AF),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Thẻ tùy chọn 2: Xóa
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  Navigator.pop(ctx);
                  _showDeleteReviewDialog(rev, parentRev: parentRev);
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.delete_outline_rounded,
                          color: Color(0xFF374151),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Text(
                          isReply ? 'Xóa phản hồi' : 'Xóa đánh giá',
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 14,
                        color: Color(0xFF9CA3AF),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  // Thiết kế lại Form xác nhận xóa đánh giá (Hiện đại, bo góc 24, icon nổi bật, trích đoạn bình luận)
  void _showDeleteReviewDialog(
    Map<String, dynamic> rev, {
    Map<String, dynamic>? parentRev,
  }) {
    if (_currentUserId == null || _currentUserId! <= 0) return;
    final bool isReply = parentRev != null;
    final int reviewId = ((rev['reviewId'] ?? rev['id']) as num?)?.toInt() ?? 0;
    final String commentText = rev['comment']?.toString() ?? '';

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        elevation: 8,
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon thùng rác nổi bật với nền đỏ nhạt
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFFEE2E2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.delete_forever_rounded,
                  color: Color(0xFFDC2626),
                  size: 34,
                ),
              ),
              const SizedBox(height: 16),

              // Tiêu đề
              Text(
                isReply ? 'Xác nhận xóa phản hồi?' : 'Xác nhận xóa đánh giá?',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF111827),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),

              // Nội dung cảnh báo
              Text(
                isReply
                    ? 'Phản hồi này sẽ bị xóa hoàn toàn khỏi cuộc trò chuyện và không thể hoàn tác.'
                    : 'Đánh giá này cùng toàn bộ các câu trả lời kèm theo sẽ bị gỡ bỏ vĩnh viễn khỏi sản phẩm.',
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF6B7280),
                  height: 1.45,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 14),

              // Khung trích dẫn nội dung sắp xóa
              if (commentText.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.format_quote_rounded,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          commentText,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: Color(0xFF4B5563),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 22),

              // Hàng nút bấm: Hủy bỏ & Xóa vĩnh viễn
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Color(0xFFD1D5DB)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Hủy bỏ',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        if (_editingReviewId == reviewId || _editingReplyId == reviewId) {
                          _cancelInlineEdit();
                        }

                        final success = await ApiService.deleteReview(
                          reviewId: reviewId,
                          userId: _currentUserId!,
                        );

                        if (!mounted) return;

                        if (success) {
                          setState(() {
                            if (isReply) {
                              final repliesList = parentRev?['replies'] as List<dynamic>?;
                              repliesList?.removeWhere(
                                (r) => ((r['reviewId'] ?? r['id']) as num?)?.toInt() == reviewId,
                              );
                            } else {
                              _realReviews.removeWhere(
                                (r) => ((r['reviewId'] ?? r['id']) as num?)?.toInt() == reviewId,
                              );
                              if (_totalReviewCount > 0) _totalReviewCount -= 1;
                            }
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                isReply
                                    ? 'Đã xóa phản hồi thành công!'
                                    : 'Đã xóa đánh giá thành công!',
                              ),
                              backgroundColor: const Color(0xFF2E7D32),
                            ),
                          );
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Xóa đánh giá thất bại. Vui lòng thử lại!'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.delete_rounded, size: 16, color: Colors.white),
                      label: const Text(
                        'Xóa vĩnh viễn',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDC2626),
                        foregroundColor: Colors.white,
                        elevation: 2,
                        shadowColor: const Color(0xFFDC2626).withOpacity(0.4),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  int _selectedQty = 1;

  @override
  Widget build(BuildContext context) {
    final product = _fetchedProduct ?? widget.product;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết nông sản'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? Colors.red : const Color(0xFF1B3A20),
            ),
            tooltip: _isFavorite ? 'Bỏ yêu thích' : 'Yêu thích',
            onPressed: _toggleFavorite,
          ),
        ],
      ),
      body: _isLoadingDetails
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32)))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Ảnh minh họa sản phẩm
                  Container(
                    width: double.infinity,
                    height: 240,
                    decoration: BoxDecoration(
                      color: product.color.withValues(alpha: 0.08),
                    ),
                    child: (product.imageUrl != null && product.imageUrl!.isNotEmpty)
                        ? Image.network(
                            ApiService.fixImageUrl(product.imageUrl),
                            width: double.infinity,
                            height: 240,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Center(
                              child: Hero(
                                tag: 'product-icon-${product.id}',
                                child: Icon(
                                  product.icon,
                                  size: 100,
                                  color: product.color,
                                ),
                              ),
                            ),
                          )
                        : Center(
                            child: Hero(
                              tag: 'product-icon-${product.id}',
                              child: Icon(
                                product.icon,
                                size: 100,
                                color: product.color,
                              ),
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

                  if (_relatedProducts.isNotEmpty) ...[
                    const Text(
                      'NÔNG SẢN CÙNG LOẠI CÓ THỂ BẠN THÍCH',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 195,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _relatedProducts.length,
                        separatorBuilder: (ctx, i) => const SizedBox(width: 12),
                        itemBuilder: (ctx, i) {
                          final p = _relatedProducts[i];
                          return InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => ProductDetailScreen(
                                    product: p,
                                    onAddToCart: widget.onAddToCart,
                                  ),
                                ),
                              );
                            },
                            child: Container(
                              width: 135,
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFE1EAE0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      height: 75,
                                      width: double.infinity,
                                      color: p.color.withValues(alpha: 0.08),
                                      child: (p.imageUrl != null && p.imageUrl!.isNotEmpty)
                                          ? Image.network(
                                              ApiService.fixImageUrl(p.imageUrl),
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) => Center(
                                                child: Icon(p.icon, size: 36, color: p.color),
                                              ),
                                            )
                                          : Center(
                                              child: Icon(p.icon, size: 36, color: p.color),
                                            ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    p.name,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const Spacer(),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${p.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () {
                                          widget.onAddToCart(p, qty: 1);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Đã thêm "${p.name}" vào giỏ hàng!'),
                                              backgroundColor: const Color(0xFF2E7D32),
                                              duration: const Duration(seconds: 1),
                                            ),
                                          );
                                        },
                                        borderRadius: BorderRadius.circular(6),
                                        child: Container(
                                          padding: const EdgeInsets.all(5),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF2E7D32),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(
                                            Icons.add_shopping_cart,
                                            size: 14,
                                            color: Colors.white,
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
                      ),
                    ),
                    const SizedBox(height: 28),
                  ],


                  if (_frequentlyBoughtTogether.isNotEmpty) ...[
                    // GỢI Ý MUA CÙNG (NÔNG SẢN THƯỜNG MUA KÈM)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.auto_awesome, color: Color(0xFF2E7D32), size: 16),
                                const SizedBox(width: 6),
                                const Text(
                                  'GỢI Ý MUA CÙNG',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1B3A20),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Nông sản thường mua kèm với món này',
                              style: TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 205,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _frequentlyBoughtTogether.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final item = _frequentlyBoughtTogether[index];
                          return InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ProductDetailScreen(
                                    product: item,
                                    onAddToCart: widget.onAddToCart,
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              width: 145,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.03),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Hình ảnh hoặc Icon nông sản tươi sạch
                                  ClipRRect(
                                    borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
                                    child: Container(
                                      height: 95,
                                      width: double.infinity,
                                      color: item.color.withValues(alpha: 0.08),
                                      child: (item.imageUrl != null && item.imageUrl!.isNotEmpty)
                                          ? Image.network(
                                              ApiService.fixImageUrl(item.imageUrl),
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) => Center(
                                                child: Icon(item.icon, size: 40, color: item.color),
                                              ),
                                            )
                                          : Center(
                                              child: Icon(item.icon, size: 40, color: item.color),
                                            ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(8),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                item.name,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: Color(0xFF1B3A20),
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                item.unit.isNotEmpty ? item.unit : 'Túi',
                                                style: const TextStyle(
                                                  fontSize: 10,
                                                  color: Color(0xFF6B7280),
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            crossAxisAlignment: CrossAxisAlignment.center,
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  '${item.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF2E7D32),
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              InkWell(
                                                onTap: () {
                                                  widget.onAddToCart(item, qty: 1);
                                                  ApiService.trackRecommendation(
                                                    productId: item.id,
                                                    eventType: 'cart',
                                                    userId: _currentUserId,
                                                    contextUsed: 'frequently_bought_together',
                                                  );
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    SnackBar(
                                                      content: Text('Đã thêm "${item.name}" vào giỏ hàng!'),
                                                      backgroundColor: const Color(0xFF2E7D32),
                                                      duration: const Duration(seconds: 1),
                                                    ),
                                                  );
                                                },
                                                borderRadius: BorderRadius.circular(20),
                                                child: Container(
                                                  padding: const EdgeInsets.all(5),
                                                  decoration: const BoxDecoration(
                                                    color: Color(0xFF2E7D32),
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: const Icon(
                                                    Icons.add,
                                                    size: 16,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

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
                        final int revId = ((rev['reviewId'] ?? rev['id']) as num?)?.toInt() ?? (i + 1);
                        final int reviewCustomerId = (rev['customerId'] as num?)?.toInt() ?? 0;
                        final bool isMyReview = _currentUserId != null && _currentUserId! > 0 && reviewCustomerId == _currentUserId;

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
                                          Flexible(
                                            child: Text(
                                              rev['customerName'] ?? 'Khách hàng',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                          ),
                                          if (isMyReview)
                                            Container(
                                              margin: const EdgeInsets.only(left: 6),
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFFE8F5E9),
                                                borderRadius: BorderRadius.circular(4),
                                                border: Border.all(color: const Color(0xFFC8E6C9), width: 0.8),
                                              ),
                                              child: const Text(
                                                'Bạn',
                                                style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                              ),
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
                                          if (rev['updatedAt'] != null && rev['updatedAt'].toString().isNotEmpty) ...[
                                            const SizedBox(width: 4),
                                            const Text(
                                              '(Đã sửa)',
                                              style: TextStyle(color: Colors.grey, fontSize: 10, fontStyle: FontStyle.italic),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                if (isMyReview)
                                  InkWell(
                                    onTap: () => _showReviewOptionsMenu(rev),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      padding: const EdgeInsets.all(5),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade100,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.more_vert,
                                        size: 16,
                                        color: Color(0xFF4B5563),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Nội dung nhận xét (hoặc Ô chỉnh sửa trực tiếp)
                            if (_editingReviewId != null && _editingReviewId == revId) ...[
                              Container(
                                margin: const EdgeInsets.only(left: 42, top: 4, bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF9FAFB),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFF2E7D32), width: 1.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.04),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.edit_note_rounded, color: Color(0xFF2E7D32), size: 18),
                                        const SizedBox(width: 6),
                                        const Text(
                                          'Chỉnh sửa đánh giá',
                                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                        ),
                                        const Spacer(),
                                        InkWell(
                                          onTap: _isSavingInlineEdit ? null : _cancelInlineEdit,
                                          child: const Icon(Icons.close, size: 18, color: Colors.grey),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    // Chọn số sao trực tiếp
                                    Row(
                                      children: [
                                        const Text(
                                          'Số sao:',
                                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF374151)),
                                        ),
                                        const SizedBox(width: 6),
                                        Row(
                                          children: List.generate(5, (sIdx) {
                                            final starVal = sIdx + 1;
                                            return GestureDetector(
                                              onTap: _isSavingInlineEdit ? null : () => setState(() => _editingRating = starVal),
                                              child: Padding(
                                                padding: const EdgeInsets.symmetric(horizontal: 2),
                                                child: Icon(
                                                  starVal <= _editingRating ? Icons.star_rounded : Icons.star_border_rounded,
                                                  color: const Color(0xFFFF9800),
                                                  size: 24,
                                                ),
                                              ),
                                            );
                                          }),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    TextField(
                                      controller: _inlineEditController,
                                      maxLines: 3,
                                      maxLength: 1000,
                                      autofocus: true,
                                      enabled: !_isSavingInlineEdit,
                                      style: const TextStyle(fontSize: 13, color: Color(0xFF1F2937)),
                                      decoration: InputDecoration(
                                        hintText: 'Nhập nội dung nhận xét của bạn...',
                                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                                        filled: true,
                                        fillColor: Colors.white,
                                        counterText: '',
                                        contentPadding: const EdgeInsets.all(10),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5)),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        TextButton(
                                          onPressed: _isSavingInlineEdit ? null : _cancelInlineEdit,
                                          child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                        ),
                                        const SizedBox(width: 8),
                                        ElevatedButton.icon(
                                          onPressed: _isSavingInlineEdit ? null : () => _saveInlineEdit(rev),
                                          icon: _isSavingInlineEdit
                                              ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                              : const Icon(Icons.check, size: 14, color: Colors.white),
                                          label: Text(
                                            _isSavingInlineEdit ? 'Đang lưu...' : 'Lưu thay đổi',
                                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF2E7D32),
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ] else ...[
                              Padding(
                                padding: const EdgeInsets.only(left: 42),
                                child: Text(
                                  rev['comment'] ?? '',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.4),
                                ),
                              ),
                            ],
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
                                    onTap: () => _toggleReplyInline(rev, i),
                                    borderRadius: BorderRadius.circular(6),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.reply,
                                            size: 14,
                                            color: _replyingReviewId == (rev['reviewId'] ?? i)
                                                ? const Color(0xFF2E7D32)
                                                : Colors.grey.shade600,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            _replyingReviewId == (rev['reviewId'] ?? i) ? 'Đang trả lời' : 'Trả lời',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: _replyingReviewId == (rev['reviewId'] ?? i)
                                                  ? FontWeight.bold
                                                  : FontWeight.normal,
                                              color: _replyingReviewId == (rev['reviewId'] ?? i)
                                                  ? const Color(0xFF2E7D32)
                                                  : Colors.grey.shade700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Khung nhập câu trả lời trực tiếp (Inline Reply Form)
                            if (_replyingReviewId == (rev['reviewId'] ?? i)) ...[
                              const SizedBox(height: 10),
                              Padding(
                                padding: const EdgeInsets.only(left: 36),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF0FDF4),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF86EFAC)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.reply, size: 14, color: Color(0xFF2E7D32)),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Trả lời @${rev['customerName'] ?? 'Khách hàng'}',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                          ),
                                          const Spacer(),
                                          InkWell(
                                            onTap: () => setState(() => _replyingReviewId = null),
                                            child: const Icon(Icons.close, size: 16, color: Colors.grey),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      TextField(
                                        controller: _replyController,
                                        maxLines: 2,
                                        autofocus: true,
                                        style: const TextStyle(fontSize: 13),
                                        decoration: InputDecoration(
                                          hintText: 'Nhập câu trả lời của bạn...',
                                          hintStyle: const TextStyle(fontSize: 12, color: Colors.grey),
                                          filled: true,
                                          fillColor: Colors.white,
                                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF2E7D32))),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          TextButton(
                                            onPressed: () => setState(() => _replyingReviewId = null),
                                            child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                          ),
                                          const SizedBox(width: 8),
                                          ElevatedButton.icon(
                                            onPressed: () => _submitReplyInline(rev),
                                            icon: const Icon(Icons.send, size: 14, color: Colors.white),
                                            label: const Text('Gửi', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF2E7D32),
                                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],

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
                                      final int replyCustomerId = (r['customerId'] as num?)?.toInt() ?? 0;
                                      final int replyReviewId = ((r['reviewId'] ?? r['id']) as num?)?.toInt() ?? 0;
                                      final bool isMyReply = _currentUserId != null && _currentUserId! > 0 && replyCustomerId == _currentUserId;

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
                                                      if (isMyReply)
                                                        Container(
                                                          margin: const EdgeInsets.only(left: 4),
                                                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                                          decoration: BoxDecoration(
                                                            color: const Color(0xFFE8F5E9),
                                                            borderRadius: BorderRadius.circular(3),
                                                          ),
                                                          child: const Text(
                                                            'Bạn',
                                                            style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                                          ),
                                                        ),
                                                      const SizedBox(width: 6),
                                                      if (r['roleLabel'] != null)
                                                        Text(
                                                          r['roleLabel'],
                                                          style: const TextStyle(fontSize: 9, color: Color(0xFF2E7D32)),
                                                        ),
                                                      const Spacer(),
                                                      if (isMyReply)
                                                        InkWell(
                                                          onTap: () => _showReviewOptionsMenu(r, parentRev: rev),
                                                          borderRadius: BorderRadius.circular(12),
                                                          child: Container(
                                                            padding: const EdgeInsets.all(3),
                                                            decoration: BoxDecoration(
                                                              color: Colors.grey.shade100,
                                                              shape: BoxShape.circle,
                                                            ),
                                                            child: const Icon(
                                                              Icons.more_vert,
                                                              size: 13,
                                                              color: Color(0xFF4B5563),
                                                            ),
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 2),
                                                  if (_editingReplyId != null && _editingReplyId == replyReviewId) ...[
                                                    Container(
                                                      margin: const EdgeInsets.only(top: 4, bottom: 6),
                                                      padding: const EdgeInsets.all(8),
                                                      decoration: BoxDecoration(
                                                        color: Colors.white,
                                                        borderRadius: BorderRadius.circular(8),
                                                        border: Border.all(color: const Color(0xFF2E7D32), width: 1.5),
                                                      ),
                                                      child: Column(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        children: [
                                                          Row(
                                                            children: [
                                                              const Icon(Icons.edit_note_rounded, color: Color(0xFF2E7D32), size: 15),
                                                              const SizedBox(width: 4),
                                                              const Text(
                                                                'Chỉnh sửa phản hồi',
                                                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                                                              ),
                                                              const Spacer(),
                                                              InkWell(
                                                                onTap: _isSavingInlineEdit ? null : _cancelInlineEdit,
                                                                child: const Icon(Icons.close, size: 15, color: Colors.grey),
                                                              ),
                                                            ],
                                                          ),
                                                          const SizedBox(height: 6),
                                                          TextField(
                                                            controller: _inlineEditController,
                                                            maxLines: 2,
                                                            autofocus: true,
                                                            enabled: !_isSavingInlineEdit,
                                                            style: const TextStyle(fontSize: 12),
                                                            decoration: InputDecoration(
                                                              hintText: 'Chỉnh sửa phản hồi của bạn...',
                                                              hintStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                                                              filled: true,
                                                              fillColor: const Color(0xFFF9FAFB),
                                                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: Colors.grey.shade300)),
                                                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 1.5)),
                                                            ),
                                                          ),
                                                          const SizedBox(height: 6),
                                                          Row(
                                                            mainAxisAlignment: MainAxisAlignment.end,
                                                            children: [
                                                              TextButton(
                                                                onPressed: _isSavingInlineEdit ? null : _cancelInlineEdit,
                                                                child: const Text('Hủy', style: TextStyle(color: Colors.grey, fontSize: 11)),
                                                              ),
                                                              const SizedBox(width: 6),
                                                              ElevatedButton.icon(
                                                                onPressed: _isSavingInlineEdit ? null : () => _saveInlineEdit(r, parentRev: rev),
                                                                icon: _isSavingInlineEdit
                                                                    ? const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                                                    : const Icon(Icons.check, size: 12, color: Colors.white),
                                                                label: Text(
                                                                  _isSavingInlineEdit ? 'Đang lưu' : 'Lưu',
                                                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                                                ),
                                                                style: ElevatedButton.styleFrom(
                                                                  backgroundColor: const Color(0xFF2E7D32),
                                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ] else ...[
                                                    Text(
                                                      r['comment'] ?? '',
                                                      style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563)),
                                                    ),
                                                  ],
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Số lượng:', style: TextStyle(fontWeight: FontWeight.bold)),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (_selectedQty > 1) {
                            setState(() => _selectedQty--);
                          }
                        },
                        icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF8D9E90)),
                      ),
                      Text('$_selectedQty', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(
                        onPressed: () => setState(() => _selectedQty++),
                        icon: const Icon(Icons.add_circle_outline, color: Color(0xFF2E7D32)),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        widget.onAddToCart(product, qty: _selectedQty);
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.add_shopping_cart, size: 18),
                      label: const Text('Thêm vào giỏ', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF2E7D32),
                        side: const BorderSide(color: Color(0xFF2E7D32)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // Tạo 1 giỏ hàng tạm với item này
                        final tempCart = [CartItem(product: product, qty: _selectedQty)];
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => CheckoutScreen(
                              cartItems: tempCart,
                              onCheckoutSuccess: () {
                                Navigator.pop(context); // Quay về trang chi tiết hoặc Home tuỳ ý
                              },
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.shopping_bag, size: 18),
                      label: const Text('Mua ngay', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.small(
        heroTag: 'product_detail_back_fab',
        onPressed: () => Navigator.pop(context),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 4,
        tooltip: 'Quay lại',
        child: const Icon(Icons.arrow_back, size: 20),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
    );
  }
}
