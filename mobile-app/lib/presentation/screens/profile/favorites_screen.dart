// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/favorites_screen.dart
// MÔ TẢ: Màn hình giao diện di động (favorites_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/models/combo_model.dart';
import '../../../data/api_service.dart';
import '../../../core/utils/favorites_service.dart';
import '../product_detail/product_detail_screen.dart';
import '../combos/combo_customize_screen.dart';

/// Lớp giao diện / trạng thái FavoritesScreen
class FavoritesScreen extends StatefulWidget {
  final void Function(Product, {int qty})? onAddToCart;
  const FavoritesScreen({super.key, this.onAddToCart});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

/// Lớp giao diện / trạng thái _FavoritesScreenState
class _FavoritesScreenState extends State<FavoritesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Product> _favoriteProducts = [];
  List<Map<String, dynamic>> _favoriteCombos = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadFavorites();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _loadFavorites
  Future<void> _loadFavorites() async {
    final prods = await FavoritesService.getFavoriteProducts();
    final combos = await FavoritesService.getFavoriteCombos();

    if (mounted) {
      setState(() {
        _favoriteProducts = prods;
        _favoriteCombos = combos;
        _isLoading = false;
      });
    }
  }

  // Thực thi nghiệp vụ hàm _removeFavoriteProduct
  Future<void> _removeFavoriteProduct(int id) async {
    await FavoritesService.removeFavoriteProduct(id);
    setState(() {
      _favoriteProducts.removeWhere((p) => p.id == id);
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã xóa nông sản khỏi danh sách yêu thích'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  // Thực thi nghiệp vụ hàm _removeFavoriteCombo
  Future<void> _removeFavoriteCombo(int id) async {
    await FavoritesService.removeFavoriteCombo(id);
    setState(() {
      _favoriteCombos.removeWhere(
        (c) => ((c['id'] ?? c['comboId']) as num).toInt() == id,
      );
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã xóa combo khỏi danh sách yêu thích'),
          duration: Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: const Text(
          'Danh Sách Yêu Thích',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0.5,
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF2E7D32),
          unselectedLabelColor: const Color(0xFF8D9E90),
          indicatorColor: const Color(0xFF2E7D32),
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
          tabs: [
            Tab(text: 'Nông Sản (${_favoriteProducts.length})'),
            Tab(text: 'Gói Combo (${_favoriteCombos.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : TabBarView(
              controller: _tabController,
              children: [_buildProductsTab(), _buildCombosTab()],
            ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildProductsTab
  Widget _buildProductsTab() {
    if (_favoriteProducts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.favorite_border, size: 68, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(
              'Bạn chưa lưu nông sản yêu thích nào',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _favoriteProducts.length,
      itemBuilder: (context, index) {
        final p = _favoriteProducts[index];
        final imgUrl = ApiService.fixImageUrl(p.imageUrl);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE1EAE0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Ảnh nông sản
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => ProductDetailScreen(
                        product: p,
                        onAddToCart: widget.onAddToCart ?? (prod, {qty = 1}) {},
                      ),
                    ),
                  ).then((_) => _loadFavorites());
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: imgUrl.isNotEmpty
                      ? Image.network(
                          imgUrl,
                          width: 75,
                          height: 75,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 75,
                            height: 75,
                            color: const Color(0xFFE8F5E9),
                            child: Icon(p.icon, color: p.color, size: 36),
                          ),
                        )
                      : Container(
                          width: 75,
                          height: 75,
                          color: const Color(0xFFE8F5E9),
                          child: Icon(p.icon, color: p.color, size: 36),
                        ),
                ),
              ),
              const SizedBox(width: 12),

              // Thông tin chi tiết
              Expanded(
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (ctx) => ProductDetailScreen(
                          product: p,
                          onAddToCart:
                              widget.onAddToCart ?? (prod, {qty = 1}) {},
                        ),
                      ),
                    ).then((_) => _loadFavorites());
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p.name,
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
                        '${p.cert} · ${p.region}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF2E7D32),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            '${p.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: Color(0xFF2E7D32),
                            ),
                          ),
                          Text(
                            ' / ${p.unit}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Nút thao tác
              Column(
                children: [
                  IconButton(
                    icon: const Icon(Icons.favorite, color: Colors.red),
                    onPressed: () => _removeFavoriteProduct(p.id),
                    tooltip: 'Bỏ thích',
                  ),
                  if (widget.onAddToCart != null)
                    IconButton(
                      icon: const Icon(
                        Icons.add_shopping_cart,
                        color: Color(0xFF2E7D32),
                      ),
                      onPressed: () {
                        widget.onAddToCart!(p, qty: 1);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Đã thêm 1 ${p.unit} "${p.name}" vào giỏ hàng',
                            ),
                            duration: const Duration(seconds: 1),
                            backgroundColor: const Color(0xFF2E7D32),
                          ),
                        );
                      },
                      tooltip: 'Thêm vào giỏ',
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // Thực thi nghiệp vụ hàm _buildCombosTab
  Widget _buildCombosTab() {
    if (_favoriteCombos.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 68,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 12),
            Text(
              'Bạn chưa lưu gói combo nào vào yêu thích',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _favoriteCombos.length,
      itemBuilder: (context, index) {
        final c = _favoriteCombos[index];
        final id = ((c['id'] ?? c['comboId']) as num).toInt();
        final name = (c['name'] ?? 'Gói Combo').toString();
        final price = (c['price'] ?? '0₫').toString();
        final rawPrice = (c['rawPrice'] as num?)?.toDouble() ?? 0.0;
        final imageUrl = ApiService.fixImageUrl(
          (c['imageUrl'] ?? '').toString(),
        );
        final supplierName = (c['supplierName'] ?? 'HTX LÀNH').toString();
        final type = (c['type'] ?? 'combotuan').toString();
        final desc = (c['desc'] ?? '').toString();

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE1EAE0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(
                  imageUrl,
                  width: 75,
                  height: 75,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 75,
                    height: 75,
                    color: const Color(0xFFE8F5E9),
                    child: const Icon(
                      Icons.eco,
                      color: Color(0xFF2E7D32),
                      size: 36,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
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
                      supplierName,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF2E7D32),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      price,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF2E7D32),
                      ),
                    ),
                  ],
                ),
              ),

              Column(
                children: [
                  IconButton(
                    icon: const Icon(Icons.favorite, color: Colors.red),
                    onPressed: () => _removeFavoriteCombo(id),
                    tooltip: 'Bỏ thích',
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.visibility_outlined,
                      color: Color(0xFF2E7D32),
                    ),
                    onPressed: () {
                      final sampleList = ComboPlan.getSampleCombos();
                      final plan = sampleList.firstWhere(
                        (item) => item.id == id,
                        orElse: () => ComboPlan(
                          id: id,
                          name: name,
                          desc: desc,
                          price: price,
                          rawPrice: rawPrice,
                          supplierId: (c['supplierId'] as num?)?.toInt() ?? 1,
                          supplierName: supplierName,
                          badge: c['badge']?.toString(),
                          imageUrl: imageUrl,
                          type: type,
                          features: const [
                            'Nông sản tươi thu hoạch sớm',
                            'Chuẩn VietGAP & Hữu cơ',
                          ],
                          sampleItems: const [
                            'Rau củ hữu cơ',
                            'Trái cây theo mùa',
                          ],
                        ),
                      );
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (ctx) => ComboCustomizeScreen(
                            combo: plan,
                            onAddToCart:
                                widget.onAddToCart ?? (prod, {qty = 1}) {},
                          ),
                        ),
                      ).then((_) => _loadFavorites());
                    },
                    tooltip: 'Xem chi tiết combo',
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
