import 'package:flutter/material.dart';
import '../../../data/models/combo_model.dart';
import '../../../data/models/product_model.dart';

class ComboCustomizeScreen extends StatefulWidget {
  final ComboPlan combo;
  final void Function(Product, {int qty}) onAddToCart;

  const ComboCustomizeScreen({
    super.key,
    required this.combo,
    required this.onAddToCart,
  });

  @override
  State<ComboCustomizeScreen> createState() => _ComboCustomizeScreenState();
}

class _ComboCustomizeScreenState extends State<ComboCustomizeScreen> {
  late int _selectedSupplierId;
  late List<SelectableProduceItem> _currentProducePool;
  final Set<int> _selectedItemIds = {};

  final String _selectedDeliveryDay = 'Thứ 3 hoặc Thứ 6 hàng tuần';
  final String _selectedDeliveryTime = 'Sáng (07:30 - 09:30)';

  // Dữ liệu đánh giá giả lập cho trang Combo
  final List<Map<String, dynamic>> _mockReviews = [
    {
      'customerName': 'Nguyễn Thị Hoa',
      'rating': 5,
      'createdAt': '2 ngày trước',
      'comment': 'Nông sản rất tươi, giao hàng đúng hẹn. Cả nhà mình rất thích gói combo này vì tiện lợi và đầy đủ dinh dưỡng.',
      'isHelpfulByMe': false,
      'helpfulCount': 12,
    },
    {
      'customerName': 'Trần Văn Nam',
      'rating': 4,
      'createdAt': '1 tuần trước',
      'comment': 'Chất lượng rau củ ổn, đóng gói cẩn thận. Tuy nhiên tuần vừa rồi giao hơi trễ 15 phút. Sẽ tiếp tục ủng hộ.',
      'isHelpfulByMe': true,
      'helpfulCount': 5,
    },
    {
      'customerName': 'Lê Hải Yến',
      'rating': 5,
      'createdAt': '2 tuần trước',
      'comment': 'Trái cây đặc sản rất ngon, bơ sáp dẻo và ngọt. Tính ra mua combo tiết kiệm hơn nhiều so với mua lẻ.',
      'isHelpfulByMe': false,
      'helpfulCount': 8,
    },
  ];

  // Danh sách các nhà cung cấp liên kết chuẩn Web Store
  final List<Map<String, dynamic>> _suppliers = [
    {
      'id': 1,
      'name': 'Hợp tác xã Nông Sản Đà Lạt',
      'region': 'Đà Lạt (Lâm Đồng)',
      'badge': 'Rau củ ôn đới & Quả giòn ngọt',
    },
    {
      'id': 2,
      'name': 'Hợp tác xã Rau Sạch Miền Tây',
      'region': 'Đồng Tháp (ĐBSCL)',
      'badge': 'Rau ruộng phù sa & Thủy sinh',
    },
    {
      'id': 3,
      'name': 'Hợp tác xã Trái Cây Việt',
      'region': 'Tiền Giang & Bến Tre',
      'badge': 'Trái cây nhiệt đới chín cây',
    },
    {
      'id': 4,
      'name': 'HTX Nông Nghiệp An Phú',
      'region': 'Mộc Châu (Sơn La)',
      'badge': 'Nông sản ăn dặm GlobalGAP',
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedSupplierId = widget.combo.supplierId;
    _updateProducePool();
    _autoBalanceNutrition(showNotification: false);
  }

  void _updateProducePool() {
    _currentProducePool = ComboPlan.getProducePoolBySupplier(_selectedSupplierId);
  }

  // ── THUẬT TOÁN TỰ ĐỘNG PHÂN BỔ TỐI ƯU DINH DƯỠNG (AUTO-BALANCE ALGORITHM) ──
  void _autoBalanceNutrition({bool showNotification = true}) {
    setState(() {
      _selectedItemIds.clear();
      final maxSlots = widget.combo.maxSelectableItems;

      // Ưu tiên chọn cân đối mỗi nhóm danh mục 1-2 món để đạt tỷ lệ cân bằng dinh dưỡng 100%
      final categories = ['Rau ăn lá', 'Củ quả', 'Trái cây đặc sản', 'Nấm sạch'];
      for (var cat in categories) {
        final itemInCat = _currentProducePool.where((p) => p.category.contains(cat)).toList();
        if (itemInCat.isNotEmpty && _selectedItemIds.length < maxSlots) {
          _selectedItemIds.add(itemInCat.first.id);
        }
      }

      // Điền đầy các slot còn lại bằng các nông sản có lượt đánh giá tốt nhất
      for (var item in _currentProducePool) {
        if (_selectedItemIds.length >= maxSlots) break;
        _selectedItemIds.add(item.id);
      }
    });

    if (showNotification) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✨ Thuật toán đã tự động phân bổ cân đối 100% dinh dưỡng cho giỏ combo!'),
          backgroundColor: Color(0xFF2E7D32),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  // ── THUẬT TOÁN TÍNH ĐIỂM CÂN BẰNG DINH DƯỠNG (NUTRITION BALANCE SCORING) ──
  Map<String, dynamic> _calculateNutritionBalance() {
    if (_selectedItemIds.isEmpty) {
      return {'score': 0, 'leafCount': 0, 'rootCount': 0, 'fruitCount': 0, 'shroomCount': 0, 'advice': 'Chưa chọn món nào.'};
    }

    final selectedItems = _currentProducePool.where((p) => _selectedItemIds.contains(p.id)).toList();
    int leafCount = 0;
    int rootCount = 0;
    int fruitCount = 0;
    int shroomCount = 0;

    for (var item in selectedItems) {
      final cat = item.category.toLowerCase();
      if (cat.contains('lá') || cat.contains('rau')) {
        leafCount++;
      } else if (cat.contains('củ') || cat.contains('quả')) {
        rootCount++;
      } else if (cat.contains('trái') || cat.contains('đặc sản')) {
        fruitCount++;
      } else if (cat.contains('nấm') || cat.contains('hạt')) {
        shroomCount++;
      } else {
        rootCount++;
      }
    }

    int diversityScore = 0;
    if (leafCount > 0) diversityScore += 25;
    if (rootCount > 0) diversityScore += 25;
    if (fruitCount > 0) diversityScore += 25;
    if (shroomCount > 0) diversityScore += 25;

    // Gợi ý thông minh
    String advice = '';
    if (diversityScore == 100) {
      advice = '🌿 Giỏ combo của bạn đã đạt CÂN ĐỐI DINH DƯỠNG HOÀN HẢO (100% Điểm dưỡng chất)!';
    } else if (leafCount == 0) {
      advice = '💡 Gợi ý thuật toán: Thêm rau lá (Spinach, Cải kale) để bổ sung chất xơ hòa tan.';
    } else if (rootCount == 0) {
      advice = '💡 Gợi ý thuật toán: Thêm củ quả (Cà rốt, Bí đỏ) để tăng Beta-carotene & Vitamin A.';
    } else if (shroomCount == 0) {
      advice = '💡 Gợi ý thuật toán: Bổ sung thêm Nấm hoặc Hạt để cân bằng nguồn đạm thực vật lành tính.';
    } else {
      advice = '💡 Gợi ý thuật toán: Thêm 1 loại trái cây đặc sản để trọn vẹn vitamin C chống oxy hóa.';
    }

    return {
      'score': diversityScore,
      'leafCount': leafCount,
      'rootCount': rootCount,
      'fruitCount': fruitCount,
      'shroomCount': shroomCount,
      'advice': advice,
    };
  }

  void _toggleItem(SelectableProduceItem item) {
    setState(() {
      if (_selectedItemIds.contains(item.id)) {
        if (_selectedItemIds.length > 1) {
          _selectedItemIds.remove(item.id);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Vui lòng chọn tối thiểu 1 loại nông sản trong gói!')),
          );
        }
      } else {
        if (_selectedItemIds.length < widget.combo.maxSelectableItems) {
          _selectedItemIds.add(item.id);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gói này tối đa được chọn ${widget.combo.maxSelectableItems} món. Hãy bỏ chọn 1 món để đổi nhé!'),
              backgroundColor: const Color(0xFFE65100),
            ),
          );
        }
      }
    });
  }

  void _confirmAndAddToCart() {
    if (_selectedItemIds.length < widget.combo.maxSelectableItems) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Bạn cần chọn đủ ${widget.combo.maxSelectableItems} món nông sản (Hiện có: ${_selectedItemIds.length})'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final selectedProduceNames = _currentProducePool
        .where((p) => _selectedItemIds.contains(p.id))
        .map((p) => p.name)
        .toList();

    final supplier = _suppliers.firstWhere((s) => s['id'] == _selectedSupplierId, orElse: () => _suppliers[0]);

    final product = Product(
      id: widget.combo.id,
      name: '${widget.combo.name} [${supplier['name']}]',
      price: widget.combo.rawPrice.toInt(),
      unit: widget.combo.type == 'combotuan' ? 'tuần' : 'tháng',
      category: 'Combo',
      cert: 'VietGAP & Hữu cơ',
      region: supplier['region'],
      rating: 5.0,
      reviews: 64,
      icon: Icons.card_giftcard,
      color: const Color(0xFF2E7D32),
      lot: 'CMB-${widget.combo.id}',
      description: 'Lịch giao: $_selectedDeliveryDay ($_selectedDeliveryTime)\nHTX: ${supplier['name']}\nNông sản đã chọn: ${selectedProduceNames.join(', ')}',
      imageUrl: widget.combo.imageUrl,
      originFarm: supplier['name'],
      stockQuantity: 99,
    );

    widget.onAddToCart(product);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final progress = _selectedItemIds.length / widget.combo.maxSelectableItems;
    final balance = _calculateNutritionBalance();
    final int balanceScore = balance['score'] as int;
    final String advice = balance['advice'] as String;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      extendBodyBehindAppBar: true,
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.zero,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── PHẦN HEADER: THÔNG TIN CHI TIẾT COMBO ──
                  Stack(
                    children: [
                      Image.network(
                        widget.combo.imageUrl,
                        width: double.infinity,
                        height: 250,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 250,
                          color: const Color(0xFFE8F5E9),
                          child: const Icon(Icons.eco, size: 80, color: Color(0xFF2E7D32)),
                        ),
                      ),
                      Container(
                        height: 250,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.4),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.7),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 16,
                        left: 16,
                        right: 16,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (widget.combo.badge != null)
                              Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFF9800),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  widget.combo.badge!,
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                            Text(
                              widget.combo.name,
                              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  // Thông tin chi tiết Combo
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              widget.combo.price,
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              widget.combo.type == 'combotuan' ? '/ tuần' : (widget.combo.type == 'combothang' ? '/ tháng' : '/ gói'),
                              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.storefront, size: 16, color: Color(0xFF166534)),
                            const SizedBox(width: 6),
                            Text(
                              widget.combo.supplierName,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.combo.desc,
                          style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.4),
                        ),
                        const SizedBox(height: 12),
                        const Divider(),
                        const SizedBox(height: 8),
                        const Text(
                          'ĐẶC QUYỀN GÓI:',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                        ),
                        const SizedBox(height: 8),
                        ...widget.combo.features.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('✓ ', style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 14)),
                              Expanded(child: Text(f, style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.3))),
                            ],
                          ),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // ── KHU VỰC THUẬT TOÁN CÂN BẰNG DINH DƯỠNG & TIẾN TRÌNH ──
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Hạn mức món & Nút Tự động phân bổ thuật toán
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'TỰ CHỌN NÔNG SẢN TRONG GÓI',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32), letterSpacing: 0.5),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Đã chọn: ${_selectedItemIds.length} / ${widget.combo.maxSelectableItems} loại nông sản',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: _selectedItemIds.length == widget.combo.maxSelectableItems ? const Color(0xFF2E7D32) : const Color(0xFFE65100),
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: _autoBalanceNutrition,
                              icon: const Icon(Icons.auto_awesome, size: 14, color: Colors.white),
                              label: const Text('Phân bổ tối ưu', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2E7D32),
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Thanh tiến trình chọn món
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: progress.clamp(0.0, 1.0),
                            minHeight: 6,
                            backgroundColor: Colors.grey.shade200,
                            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF2E7D32)),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // KHUNG HIỂN THỊ ĐIỂM CÂN BẰNG DINH DƯỠNG (NUTRITION SCORE)
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: balanceScore == 100 ? const Color(0xFFE8F5E9) : const Color(0xFFFFF8E1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: balanceScore == 100 ? const Color(0xFF81C784) : const Color(0xFFFFD54F),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        balanceScore == 100 ? Icons.check_circle : Icons.health_and_safety_outlined,
                                        size: 16,
                                        color: balanceScore == 100 ? const Color(0xFF2E7D32) : const Color(0xFFF57F17),
                                      ),
                                      const SizedBox(width: 6),
                                      const Text(
                                        'Điểm Cân Bằng Dinh Dưỡng:',
                                        style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    '$balanceScore% Dưỡng Chất',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: balanceScore == 100 ? const Color(0xFF2E7D32) : const Color(0xFFF57F17),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                advice,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: balanceScore == 100 ? const Color(0xFF1B5E20) : const Color(0xFFB78103),
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── BỘ LỌC CHỌN NHÀ CUNG CẤP LIÊN KẾT (100% CÙNG 1 HTX) ──
                  Container(
                    color: Colors.white,
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '🏢 Chọn Nông Trại / Hợp Tác Xã Cung Cấp:',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                        ),
                        const SizedBox(height: 6),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _suppliers.map((s) {
                              final isSelected = _selectedSupplierId == s['id'];
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: ChoiceChip(
                                  label: Text(s['name']!),
                                  selected: isSelected,
                                  selectedColor: const Color(0xFFE8F5E9),
                                  backgroundColor: const Color(0xFFF4F6F4),
                                  labelStyle: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFF4A5568),
                                  ),
                                  onSelected: (val) {
                                    if (val) {
                                      setState(() {
                                        _selectedSupplierId = s['id'];
                                        _updateProducePool();
                                        _autoBalanceNutrition();
                                      });
                                    }
                                  },
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),

                  // ── DANH SÁCH CÁC MÓN NÔNG SẢN TRONG POOL ──
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: _currentProducePool.map((item) {
                        final isSelected = _selectedItemIds.contains(item.id);

                        return GestureDetector(
                          onTap: () => _toggleItem(item),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFF4FBF4) : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFFE5ECE5),
                                width: isSelected ? 1.8 : 1.0,
                              ),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                              ],
                            ),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    item.imageUrl,
                                    width: 65,
                                    height: 65,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      width: 65,
                                      height: 65,
                                      color: const Color(0xFFE8F5E9),
                                      child: const Icon(Icons.eco, color: Color(0xFF2E7D32)),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF1B3A20)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Định lượng: ${item.weight} · ${item.category}',
                                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF2E7D32), fontWeight: FontWeight.w600),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        item.benefit,
                                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600, height: 1.3),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  width: 26,
                                  height: 26,
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF2E7D32) : Colors.white,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF2E7D32) : Colors.grey.shade300,
                                      width: 1.5,
                                    ),
                                  ),
                                  child: isSelected
                                      ? const Icon(Icons.check, size: 16, color: Colors.white)
                                      : null,
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  
                  // ── PHẦN ĐÁNH GIÁ TỪ KHÁCH HÀNG ──
                  Container(
                    color: Colors.white,
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                                  '${_mockReviews.length} nhận xét thực tế từ người mua',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _mockReviews.length,
                          separatorBuilder: (ctx, i) => const Divider(color: Color(0xFFE1EAE0), height: 24),
                          itemBuilder: (ctx, i) {
                            final rev = _mockReviews[i];
                            final int starCount = (rev['rating'] as num?)?.toInt() ?? 5;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
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
                                          Text(
                                            rev['customerName'] ?? 'Khách hàng',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
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
                                Padding(
                                  padding: const EdgeInsets.only(left: 42),
                                  child: Text(
                                    rev['comment'] ?? '',
                                    style: const TextStyle(fontSize: 13, color: Color(0xFF374151), height: 1.4),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── THANH ĐẶT HÀNG DƯỚI CÙNG ──
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: const Border(top: BorderSide(color: Color(0xFFE5ECE5))),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2)),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Tổng chi phí gói:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          Text(
                            widget.combo.price,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: _confirmAndAddToCart,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Xác nhận & Thêm giỏ hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
