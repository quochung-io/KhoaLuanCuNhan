import 'package:flutter/material.dart';
import '../../../data/models/combo_model.dart';
import '../../../data/models/product_model.dart';
import '../../../data/api_service.dart';
import '../../../core/utils/favorites_service.dart';
import 'combo_customize_screen.dart';
import '../chat/chat_screen.dart';

class CombosScreen extends StatefulWidget {
  final void Function(Product, {int qty})? onAddToCart;
  final VoidCallback? onOpenCart;
  final int cartCount;

  const CombosScreen({
    super.key,
    this.onAddToCart,
    this.onOpenCart,
    this.cartCount = 0,
  });

  @override
  State<CombosScreen> createState() => _CombosScreenState();
}

class _CombosScreenState extends State<CombosScreen> {
  String _selectedType = 'combotuan'; // 'combotuan' | 'combothang' | 'combokhac'
  String _selectedSupplier = 'all'; // 'all' | '1' | '2' | '3' | '4'
  final List<ComboPlan> _combos = ComboPlan.getSampleCombos();
  Set<int> _favoriteComboIds = {};

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final list = await FavoritesService.getFavoriteCombos();
    if (mounted) {
      setState(() {
        _favoriteComboIds = list.map((c) => ((c['id'] ?? c['comboId']) as num).toInt()).toSet();
      });
    }
  }

  Future<void> _toggleFavorite(ComboPlan combo) async {
    final isFav = await FavoritesService.toggleFavoriteCombo(combo);
    if (mounted) {
      setState(() {
        if (isFav) {
          _favoriteComboIds.add(combo.id);
        } else {
          _favoriteComboIds.remove(combo.id);
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isFav ? 'Đã thêm combo "${combo.name}" vào yêu thích' : 'Đã xóa combo "${combo.name}" khỏi yêu thích'),
          duration: const Duration(seconds: 1),
          backgroundColor: const Color(0xFF2E7D32),
        ),
      );
    }
  }

  final List<Map<String, String>> _suppliers = [
    {'key': 'all', 'label': 'Tất Cả Đối Tác HTX'},
    {'key': '1', 'label': 'HTX Nông Sản Đà Lạt'},
    {'key': '2', 'label': 'HTX Rau Miền Tây'},
    {'key': '3', 'label': 'HTX Trái Cây Việt'},
    {'key': '4', 'label': 'HTX Nông Nghiệp An Phú'},
  ];

  List<ComboPlan> get _filteredCombos {
    return _combos.where((c) {
      final matchType = c.type == _selectedType;
      final matchSupplier = _selectedSupplier == 'all' || c.supplierId.toString() == _selectedSupplier;
      return matchType && matchSupplier;
    }).toList();
  }

  void _openCustomizeScreen(ComboPlan combo) {
    if (widget.onAddToCart == null) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ComboCustomizeScreen(
          combo: combo,
          onAddToCart: widget.onAddToCart!,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Gói Combo Nông Sản Định Kỳ',
          style: TextStyle(
            color: Color(0xFF1B3A20),
            fontWeight: FontWeight.bold,
            fontSize: 16.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline, color: Color(0xFF2E7D32)),
            tooltip: 'Tư vấn nông sản',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ChatScreen(title: 'Tư vấn Gói Combo')),
              );
            },
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined, color: Color(0xFF2E7D32)),
                tooltip: 'Giỏ hàng',
                onPressed: widget.onOpenCart,
              ),
              if (widget.cartCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      widget.cartCount > 99 ? '99+' : '${widget.cartCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Banner Khuyến mãi Combo chuẩn Web Store
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2E7D32).withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF9800),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'TIẾT KIỆM ĐẾN 20% & FREESHIP TẬN BẾP',
                          style: TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Đi Chợ Định Kỳ Tiện Lợi',
                        style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Khách hàng tự do chọn đổi nông sản cùng HTX trước mỗi đợt giao 24h. Thu hoạch sáng sớm và giao xe lạnh.',
                        style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 11.5, height: 1.3),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.local_shipping_outlined, color: Colors.white, size: 28),
                ),
              ],
            ),
          ),

          // 3 TAB CHUYỂN ĐỔI CHUẨN WEB: COMBO TUẦN / COMBO THÁNG / COMBO KHÁC
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildTypeTab('combotuan', '🥗 Combo Tuần'),
                const SizedBox(width: 6),
                _buildTypeTab('combothang', '📅 Combo Tháng (-18%)'),
                const SizedBox(width: 6),
                _buildTypeTab('combokhac', '✨ Khác'),
              ],
            ),
          ),

          // BỘ LỌC NHÀ CUNG CẤP YÊU THÍCH (GIỐNG 100% TRÊN WEB)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _suppliers.map((s) {
                  final isSelected = _selectedSupplier == s['key'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(s['label']!),
                      selected: isSelected,
                      selectedColor: const Color(0xFFE8F5E9),
                      backgroundColor: const Color(0xFFF4F6F4),
                      labelStyle: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFF4A5568),
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedSupplier = s['key']!);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 8),

          // DANH SÁCH CÁC GÓI COMBO
          Expanded(
            child: _filteredCombos.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('🌱', style: TextStyle(fontSize: 44)),
                          const SizedBox(height: 12),
                          const Text(
                            'Hiện chưa có gói combo nào trong mục này',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1B3A20)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Các gói combo ưu đãi mới sẽ sớm được cập nhật. Vui lòng chọn gói Combo Tuần hoặc Combo Tháng có sẵn.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    itemCount: _filteredCombos.length,
                    itemBuilder: (context, index) {
                      final combo = _filteredCombos[index];
                      return _buildComboCard(combo);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeTab(String key, String label) {
    final isSelected = _selectedType == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedType = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF2E7D32) : const Color(0xFFF1F5F1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? const Color(0xFF2E7D32) : Colors.transparent,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : const Color(0xFF4A5568),
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              fontSize: 11.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildComboCard(ComboPlan combo) {
    return GestureDetector(
      onTap: () => _openCustomizeScreen(combo),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: combo.badge != null ? const Color(0xFF2E7D32) : const Color(0xFFE5ECE5),
            width: combo.badge != null ? 1.5 : 1.0,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ảnh bìa
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                  child: Image.network(
                    ApiService.fixImageUrl(combo.imageUrl),
                    height: 120, // Chiều cao ảnh nhỏ gọn
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 120,
                      color: const Color(0xFFE8F5E9),
                      child: const Icon(Icons.eco, size: 40, color: Color(0xFF2E7D32)),
                    ),
                  ),
                ),
                if (combo.badge != null)
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF9800),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 4),
                        ],
                      ),
                      child: Text(
                        combo.badge!,
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                // Nút yêu thích Combo
                Positioned(
                  top: 8,
                  right: 8,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _toggleFavorite(combo),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.9),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4),
                          ],
                        ),
                        child: Icon(
                          _favoriteComboIds.contains(combo.id) ? Icons.favorite : Icons.favorite_border,
                          size: 18,
                          color: _favoriteComboIds.contains(combo.id) ? Colors.red : Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tên Combo và Nhà cung cấp
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          combo.name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B3A20),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.storefront, size: 12, color: Color(0xFF166534)),
                            const SizedBox(width: 4),
                            Text(
                              combo.supplierName,
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Giá tiền
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        combo.price,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        combo.type == 'combotuan'
                            ? '/ tuần'
                            : (combo.type == 'combothang' ? '/ tháng' : '/ gói'),
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Mô tả ngắn gọn
                  Text(
                    combo.desc,
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Nút xem chi tiết ảo (chỉ để UI thêm rõ ràng)
                  Align(
                    alignment: Alignment.centerRight,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Xem chi tiết',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: const Color(0xFF2E7D32)),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_forward_ios, size: 10, color: Color(0xFF2E7D32)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
