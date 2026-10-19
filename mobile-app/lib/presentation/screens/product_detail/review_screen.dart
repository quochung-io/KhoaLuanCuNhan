import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../data/models/product_model.dart';
import '../../../core/localization_service.dart';

class ReviewScreen extends StatefulWidget {
  final Product product;
  final int currentUserId;
  final String currentUserName;

  const ReviewScreen({
    super.key,
    required this.product,
    required this.currentUserId,
    required this.currentUserName,
  });

  @override
  State<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends State<ReviewScreen> {
  final _commentController = TextEditingController();
  double _productRating = 5.0;
  double _sellerRating = 5.0;
  bool _isSubmitting = false;

  // Danh sách hình ảnh và video người dùng đính kèm
  final List<Map<String, String>> _mediaList = [
    {
      'type': 'image',
      'url':
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
    },
  ];

  final List<String> _quickTags = [
    'Rau củ rất tươi ngon 🌱',
    'Đóng gói chu đáo 📦',
    'Giao hàng đúng giờ ⏰',
    'Độ ngọt tự nhiên 🍎',
    'Sẽ ủng hộ định kỳ ⭐',
  ];
  final Set<String> _selectedTags = {};

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _addMediaMock(String type) {
    if (type == 'image') {
      setState(() {
        _mediaList.add({
          'type': 'image',
          'url':
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
        });
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã thêm 1 ảnh chụp nông sản thực tế!'),
          duration: Duration(seconds: 1),
        ),
      );
    } else {
      setState(() {
        _mediaList.add({
          'type': 'video',
          'url':
              'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500',
        });
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã đính kèm 1 clip video mở hộp nông sản!'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  void _removeMedia(int index) {
    setState(() {
      _mediaList.removeAt(index);
    });
  }

  Future<void> _submitReview() async {
    final commentText = _commentController.text.trim();
    if (commentText.isEmpty && _selectedTags.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Vui lòng nhập nội dung đánh giá hoặc chọn nhận xét nhanh',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final finalComment = _selectedTags.isNotEmpty
        ? '${_selectedTags.join(' · ')}\n$commentText'.trim()
        : commentText;

    final imageUrls = _mediaList
        .where((m) => m['type'] == 'image')
        .map((m) => m['url']!)
        .toList();

    try {
      final newRev = {
        'reviewId': DateTime.now().millisecondsSinceEpoch,
        'customerId': widget.currentUserId,
        'customerName': widget.currentUserName,
        'roleLabel': '👤 Khách hàng (Đã mua hàng)',
        'rating': _productRating.toInt(),
        'comment': finalComment,
        'createdAt': 'Vừa xong',
        'helpfulCount': 0,
        'isHelpfulByMe': false,
        'media': _mediaList,
        'replies': <Map<String, dynamic>>[],
      };

      await ApiService.submitReview(
        productId: widget.product.id,
        customerId: widget.currentUserId,
        customerName: widget.currentUserName,
        rating: _productRating.toInt(),
        comment: finalComment,
        imageUrls: imageUrls,
      );

      if (mounted) {
        Navigator.pop(context, newRev);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi gửi đánh giá: $e'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() => _isSubmitting = false);
      }
    }
  }

  String _getRatingLabel(double rating) {
    if (rating >= 5) return 'Tuyệt vời, rất hài lòng 😍';
    if (rating >= 4) return 'Nông sản tươi ngon, hài lòng 😊';
    if (rating >= 3) return 'Chất lượng bình thường 😐';
    if (rating >= 2) return 'Chưa hài lòng 🙁';
    return 'Rất tệ, cần hoàn tiền 😡';
  }

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          isEn ? 'Review Produce' : 'Đánh Giá Nông Sản',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Thông tin sản phẩm đang đánh giá
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child:
                        widget.product.imageUrl != null &&
                            widget.product.imageUrl!.isNotEmpty
                        ? Image.network(
                            widget.product.imageUrl!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 60,
                              height: 60,
                              color: const Color(0xFFE8F5E9),
                              child: Icon(
                                widget.product.icon,
                                color: widget.product.color,
                                size: 30,
                              ),
                            ),
                          )
                        : Container(
                            width: 60,
                            height: 60,
                            color: const Color(0xFFE8F5E9),
                            child: Icon(
                              widget.product.icon,
                              color: widget.product.color,
                              size: 30,
                            ),
                          ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.product.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Color(0xFF1B3A20),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.product.cert} · ${widget.product.region}',
                          style: const TextStyle(
                            fontSize: 11.5,
                            color: Color(0xFF2E7D32),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Chấm sao sản phẩm
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Column(
                children: [
                  const Text(
                    'Chất lượng nông sản',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Color(0xFF1B3A20),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final star = index + 1.0;
                      return IconButton(
                        icon: Icon(
                          star <= _productRating
                              ? Icons.star
                              : Icons.star_border,
                          color: const Color(0xFFFFB300),
                          size: 36,
                        ),
                        onPressed: () => setState(() => _productRating = star),
                      );
                    }),
                  ),
                  Text(
                    _getRatingLabel(_productRating),
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 12),

                  // Đánh giá nhà bán hàng
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Dịch vụ nhà cung cấp & HTX:',
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B3A20),
                        ),
                      ),
                      Row(
                        children: List.generate(5, (index) {
                          final star = index + 1.0;
                          return GestureDetector(
                            onTap: () => setState(() => _sellerRating = star),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 2,
                              ),
                              child: Icon(
                                star <= _sellerRating
                                    ? Icons.star
                                    : Icons.star_border,
                                color: Colors.orange,
                                size: 20,
                              ),
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Nhận xét nhanh & Nội dung chi tiết
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Nhận xét nhanh:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Color(0xFF1B3A20),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _quickTags.map((tag) {
                      final isSelected = _selectedTags.contains(tag);
                      return FilterChip(
                        label: Text(tag),
                        selected: isSelected,
                        selectedColor: const Color(0xFFE8F5E9),
                        backgroundColor: const Color(0xFFF7FAF7),
                        labelStyle: TextStyle(
                          fontSize: 11.5,
                          color: isSelected
                              ? const Color(0xFF2E7D32)
                              : Colors.black87,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                        onSelected: (val) {
                          setState(() {
                            if (val) {
                              _selectedTags.add(tag);
                            } else {
                              _selectedTags.remove(tag);
                            }
                          });
                        },
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _commentController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText:
                          'Hãy chia sẻ cảm nhận chân thực về độ tươi, mùi vị, cách đóng gói bảo quản...',
                      hintStyle: const TextStyle(
                        fontSize: 12.5,
                        color: Colors.grey,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF9FAF9),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Khu vực thêm Hình ảnh & Clip video
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Hình ảnh & Clip thực tế (Tối đa 5)',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12.5,
                          color: Color(0xFF1B3A20),
                        ),
                      ),
                      Text(
                        '${_mediaList.length}/5',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        // Nút thêm ảnh
                        GestureDetector(
                          onTap: () => _addMediaMock('image'),
                          child: Container(
                            width: 70,
                            height: 70,
                            margin: const EdgeInsets.only(right: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF7FAF7),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: const Color(0xFF2E7D32),
                                style: BorderStyle.solid,
                              ),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.add_a_photo_outlined,
                                  color: Color(0xFF2E7D32),
                                  size: 24,
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Thêm ảnh',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Color(0xFF2E7D32),
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Nút thêm clip video
                        GestureDetector(
                          onTap: () => _addMediaMock('video'),
                          child: Container(
                            width: 70,
                            height: 70,
                            margin: const EdgeInsets.only(right: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF8E1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.orange),
                            ),
                            child: const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.videocam_outlined,
                                  color: Colors.orange,
                                  size: 24,
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Thêm clip',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.orange,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Danh sách thumbnail đã thêm
                        ...List.generate(_mediaList.length, (index) {
                          final item = _mediaList[index];
                          final isVideo = item['type'] == 'video';

                          return Stack(
                            children: [
                              Container(
                                width: 70,
                                height: 70,
                                margin: const EdgeInsets.only(right: 10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  image: DecorationImage(
                                    image: NetworkImage(item['url']!),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                child: isVideo
                                    ? Container(
                                        decoration: BoxDecoration(
                                          color: Colors.black.withValues(
                                            alpha: 0.35,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: const Center(
                                          child: Icon(
                                            Icons.play_circle_fill,
                                            color: Colors.white,
                                            size: 28,
                                          ),
                                        ),
                                      )
                                    : null,
                              ),
                              Positioned(
                                top: 2,
                                right: 12,
                                child: GestureDetector(
                                  onTap: () => _removeMedia(index),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Nút Gửi Đánh Giá
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitReview,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        isEn ? 'Submit Review' : 'Gửi Đánh Giá Ngay',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
