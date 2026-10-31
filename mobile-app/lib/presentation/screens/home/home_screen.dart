// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/home/home_screen.dart
// MÔ TẢ: Màn hình giao diện di động (home_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../../../data/api_service.dart';
import '../../../core/utils/favorites_service.dart';
import '../product_detail/product_detail_screen.dart';

import '../chat/chat_screen.dart';

/// Lớp giao diện / trạng thái HomeScreen
class HomeScreen extends StatefulWidget {
  final void Function(Product, {int qty}) onAddToCart;
  final VoidCallback? onOpenCart;
  final int cartCount;

  const HomeScreen({
    super.key,
    required this.onAddToCart,
    this.onOpenCart,
    this.cartCount = 0,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

/// Lớp giao diện / trạng thái _HomeScreenState
class _HomeScreenState extends State<HomeScreen> {
  String _selectedCategory = 'Tất cả';
  String _selectedSort = 'Mặc định';
  String _searchQuery = '';

  List<String> _categories = ['Tất cả'];
  Set<int> _favoriteProductIds = {};
  List<Product> _allProducts = [];
  List<dynamic> _carsRecommendations = [];
  Map<String, dynamic> _carsContext = {};
  bool _isLoadingProducts = true;
  bool _isLoadingCars = false;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _loadFavorites();
    _fetchRealProducts();
    _fetchCarsRecommendations();
  }

  // Thực thi nghiệp vụ hàm _loadFavorites
  Future<void> _loadFavorites() async {
    final favs = await FavoritesService.getFavoriteProducts();
    if (mounted) {
      setState(() {
        _favoriteProductIds = favs.map((p) => p.id).toSet();
      });
    }
  }

  // Thực thi nghiệp vụ hàm _toggleFavorite
  Future<void> _toggleFavorite(Product p) async {
    final nowFav = await FavoritesService.toggleFavoriteProduct(p);
    if (mounted) {
      setState(() {
        if (nowFav) {
          _favoriteProductIds.add(p.id);
        } else {
          _favoriteProductIds.remove(p.id);
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            nowFav
                ? 'Đã thêm "${p.name}" vào yêu thích'
                : 'Đã bỏ yêu thích "${p.name}"',
          ),
          duration: const Duration(seconds: 1),
          backgroundColor: nowFav
              ? const Color(0xFF2E7D32)
              : Colors.grey.shade700,
        ),
      );
    }
  }

  // Thực thi nghiệp vụ hàm _fetchCategories
  Future<void> _fetchCategories() async {
    try {
      final data = await ApiService.getCategories();
      if (data.isNotEmpty && mounted) {
        final cats = <String>['Tất cả'];
        for (var item in data) {
          final name = (item['categoryName'] ?? item['name'] ?? '').toString();
          final id = item['categoryId'] ?? item['id'];
          if (name.isNotEmpty &&
              id != 5 &&
              !name.toLowerCase().contains('combo') &&
              !cats.contains(name)) {
            cats.add(name);
          }
        }
        setState(() => _categories = cats);
      }
    } catch (_) {}
  }

  // Thực thi nghiệp vụ hàm _fetchRealProducts
  Future<void> _fetchRealProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final data = await ApiService.getProducts();
      if (data.isNotEmpty && mounted) {
        final List<Product> loaded = [];
        for (var item in data) {
          final prod = Product.fromJson(item as Map<String, dynamic>);
          // LOẠI BỎ TRIỆT ĐỂ TẤT CẢ GÓI COMBO KHỎI TRANG CHỦ
          if (prod.id >= 900 ||
              prod.name.toLowerCase().contains('combo') ||
              prod.category.toLowerCase().contains('combo')) {
            continue;
          }
          loaded.add(prod);
        }
        setState(() {
          _allProducts = loaded;
          _isLoadingProducts = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingProducts = false);
    }
  }

  // Thực thi nghiệp vụ hàm _fetchCarsRecommendations
  Future<void> _fetchCarsRecommendations() async {
    setState(() => _isLoadingCars = true);
    try {
      final res = await ApiService.getContextAwareRecommendations();
      if (mounted && res.isNotEmpty) {
        final recs = (res['recommendations'] as List<dynamic>?) ?? [];
        // Lọc bỏ combo khỏi khối gợi ý CARS
        final cleanRecs = recs.where((r) {
          final name = (r['productName'] ?? r['name'] ?? '')
              .toString()
              .toLowerCase();
          final id = r['productId'] ?? 0;
          return !name.contains('combo') && id < 900;
        }).toList();

        setState(() {
          _carsRecommendations = cleanRecs;
          _carsContext = (res['context'] as Map<String, dynamic>?) ?? {};
          _isLoadingCars = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingCars = false);
    }
  }

  String _formatCurrency(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫';
  }

  @override
  Widget build(BuildContext context) {
    // Lọc theo danh mục và tìm kiếm
    var filtered = _allProducts.where((p) {
      final matchCat =
          _selectedCategory == 'Tất cả' ||
          p.category.toLowerCase().contains(_selectedCategory.toLowerCase());
      final matchSearch =
          _searchQuery.trim().isEmpty ||
          p.name.toLowerCase().contains(_searchQuery.toLowerCase().trim());
      return matchCat && matchSearch;
    }).toList();

    // Sắp xếp
    if (_selectedSort == 'Giá tăng dần') {
      filtered.sort((a, b) => a.price.compareTo(b.price));
    } else if (_selectedSort == 'Giá giảm dần') {
      filtered.sort((a, b) => b.price.compareTo(a.price));
    } else if (_selectedSort == 'Đánh giá cao') {
      filtered.sort((a, b) => b.rating.compareTo(a.rating));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        titleSpacing: 12,
        title: Row(
          children: [
            // Thanh tìm kiếm Autocomplete
            Expanded(
              child: SizedBox(
                height: 40,
                child: Autocomplete<String>(
                  optionsBuilder: (TextEditingValue textEditingValue) async {
                    final prefix = textEditingValue.text;
                    if (prefix.trim().isEmpty) {
                      return const Iterable<String>.empty();
                    }
                    final suggestions = await ApiService.getAutocomplete(
                      prefix,
                    );
                    return suggestions;
                  },
                  onSelected: (String selection) {
                    setState(() {
                      _searchQuery = selection;
                    });
                  },
                  fieldViewBuilder:
                      (
                        context,
                        textEditingController,
                        focusNode,
                        onFieldSubmitted,
                      ) {
                        return TextField(
                          controller: textEditingController,
                          focusNode: focusNode,
                          onChanged: (val) {
                            setState(() => _searchQuery = val);
                          },
                          onSubmitted: (val) {
                            onFieldSubmitted();
                          },
                          decoration: InputDecoration(
                            hintText: 'Tìm kiếm nông sản...',
                            hintStyle: TextStyle(
                              fontSize: 12.5,
                              color: Colors.grey.shade400,
                            ),
                            prefixIcon: const Icon(
                              Icons.search,
                              color: Color(0xFF2E7D32),
                              size: 18,
                            ),
                            filled: true,
                            fillColor: const Color(0xFFF4F8F4),
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 0,
                              horizontal: 12,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        );
                      },
                  optionsViewBuilder: (context, onSelected, options) {
                    return Align(
                      alignment: Alignment.topLeft,
                      child: Material(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(
                            maxHeight: 200,
                            maxWidth: 250,
                          ),
                          child: ListView.builder(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            itemCount: options.length,
                            itemBuilder: (BuildContext context, int index) {
                              final option = options.elementAt(index);
                              return InkWell(
                                onTap: () => onSelected(option),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 16,
                                  ),
                                  child: Text(
                                    option,
                                    style: const TextStyle(fontSize: 13),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(width: 8),

            // Nút Chat
            IconButton(
              icon: const Icon(
                Icons.chat_bubble_outline,
                color: Color(0xFF2E7D32),
                size: 22,
              ),
              tooltip: 'Tư vấn nông sản',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ChatScreen()),
                );
              },
            ),
            const SizedBox(width: 12),

            // Nút Giỏ hàng có badge +1
            Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.shopping_cart_outlined,
                    color: Color(0xFF2E7D32),
                    size: 23,
                  ),
                  tooltip: 'Giỏ hàng',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: widget.onOpenCart,
                ),
                if (widget.cartCount > 0)
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        widget.cartCount > 99 ? '99+' : '${widget.cartCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 4),
          ],
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // HERO BANNER
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1B5E20), Color(0xFF388E3C)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(
                            0xFF2E7D32,
                          ).withValues(alpha: 0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'CHUẨN HỮU CƠ VIETGAP',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Nông Sản Tươi Lành\nRõ Ràng Đến Từng Lô Hàng',
                          style: TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Thu hoạch sớm trong ngày tại nông trại Đà Lạt & Miền Tây.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── KHỐI GỢI Ý THÔNG MINH CARS ────────────────────────────
                  if (_carsRecommendations.isNotEmpty || _isLoadingCars) ...[
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF8E1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(
                            Icons.auto_awesome,
                            color: Color(0xFFFFA000),
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Gợi Ý Nông Sản Tươi Lành Hôm Nay',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B3A20),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _carsContext['timeOfDay'] != null
                          ? 'Đề xuất phù hợp với ${_carsContext['timeOfDay']} · Tiết trời ${_carsContext['weather'] ?? 'Mát mẻ'}'
                          : 'Được chọn lọc theo thời tiết & mùa vụ để mang đến cho bạn bữa ăn tươi ngon, trọn vị nhất.',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 12),

                    SizedBox(
                      height: 175,
                      child: _isLoadingCars
                          ? const Center(
                              child: CircularProgressIndicator(
                                color: Color(0xFF2E7D32),
                              ),
                            )
                          : ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: _carsRecommendations.length,
                              itemBuilder: (context, idx) {
                                final rec = _carsRecommendations[idx];
                                final pName =
                                    rec['productName'] ??
                                    rec['name'] ??
                                    'Nông sản';
                                final pPrice = rec['price'] ?? 30000;
                                final pUnit = rec['unit'] ?? 'kg';
                                final pScore = rec['score'] != null
                                    ? (rec['score'] * 100).toInt()
                                    : 95;
                                final imgUrl = rec['imageUrl'];

                                final num rawPrice = pPrice is num
                                    ? pPrice
                                    : (double.tryParse(pPrice.toString()) ??
                                          30000);
                                final int intPrice = rawPrice.toInt();
                                final String formattedPrice = _formatCurrency(
                                  intPrice,
                                );

                                final bool isOutOfStock =
                                    rec['isOutOfStock'] == true ||
                                    (((rec['availableStock'] ??
                                                        rec['stockQuantity'])
                                                    as num?)
                                                ?.toInt() ??
                                            1) <=
                                        0;

                                final prod = Product(
                                  id: rec['productId'] ?? 99,
                                  name: pName,
                                  price: intPrice,
                                  unit: pUnit,
                                  cert: 'VietGAP',
                                  region: 'Đà Lạt',
                                  rating: 4.9,
                                  reviews: 88,
                                  icon: Icons.eco,
                                  color: const Color(0xFF2E7D32),
                                  lot: 'LOT-CARS',
                                  description:
                                      'Nông sản được gợi ý theo thời tiết & mùa vụ.',
                                  imageUrl: imgUrl,
                                  isOutOfStock: isOutOfStock,
                                );

                                return GestureDetector(
                                  onTap: () {
                                    ApiService.trackRecommendation(
                                      productId: prod.id,
                                      eventType: 'click',
                                    );
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            ProductDetailScreen(
                                              product: prod,
                                              onAddToCart: widget.onAddToCart,
                                            ),
                                      ),
                                    );
                                  },
                                  child: Container(
                                    width: 145,
                                    margin: const EdgeInsets.only(right: 12),
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                        color: const Color(0xFFE5ECE5),
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.03,
                                          ),
                                          blurRadius: 6,
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Stack(
                                          children: [
                                            ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              child: imgUrl != null
                                                  ? Image.network(
                                                      ApiService.fixImageUrl(
                                                        imgUrl,
                                                      ),
                                                      height: 70,
                                                      width: double.infinity,
                                                      fit: BoxFit.cover,
                                                      errorBuilder:
                                                          (
                                                            context,
                                                            error,
                                                            stackTrace,
                                                          ) =>
                                                              _buildFallbackImg(
                                                                70,
                                                              ),
                                                    )
                                                  : _buildFallbackImg(70),
                                            ),
                                            Positioned(
                                              top: 4,
                                              right: 4,
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 5,
                                                      vertical: 2,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFF2E7D32,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  '$pScore% match',
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 8.5,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          pName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const Spacer(),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                '$formattedPrice/$pUnit',
                                                style: const TextStyle(
                                                  color: Color(0xFF2E7D32),
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (prod.isOutOfStock)
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 6,
                                                      vertical: 2,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFFFEE2E2,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: const Text(
                                                  'Hết hàng',
                                                  style: TextStyle(
                                                    color: Color(0xFFDC2626),
                                                    fontSize: 9.5,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              )
                                            else
                                              GestureDetector(
                                                onTap: () {
                                                  ApiService.trackRecommendation(
                                                    productId: prod.id,
                                                    eventType: 'cart',
                                                  );
                                                  widget.onAddToCart(prod);
                                                  ScaffoldMessenger.of(
                                                    context,
                                                  ).showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                        'Đã thêm "$pName" vào giỏ hàng!',
                                                      ),
                                                      backgroundColor:
                                                          const Color(
                                                            0xFF2E7D32,
                                                          ),
                                                      duration: const Duration(
                                                        seconds: 1,
                                                      ),
                                                    ),
                                                  );
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.all(
                                                    4,
                                                  ),
                                                  decoration:
                                                      const BoxDecoration(
                                                        color: Color(
                                                          0xFFE8F5E9,
                                                        ),
                                                        shape: BoxShape.circle,
                                                      ),
                                                  child: const Icon(
                                                    Icons.add,
                                                    size: 14,
                                                    color: Color(0xFF2E7D32),
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
                    const SizedBox(height: 20),
                  ],

                  // DANH MỤC NÔNG SẢN
                  const Text(
                    'Khám Phá Danh Mục',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B3A20),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _categories
                          .map(
                            (c) => Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: _buildCategoryChip(c),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // TIÊU ĐỀ LƯỚI SẢN PHẨM & SẮP XẾP
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Nông Sản Sạch (${filtered.length})',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B3A20),
                        ),
                      ),
                      DropdownButton<String>(
                        value: _selectedSort,
                        underline: const SizedBox(),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF2E7D32),
                          fontWeight: FontWeight.w600,
                        ),
                        icon: const Icon(
                          Icons.arrow_drop_down,
                          color: Color(0xFF2E7D32),
                        ),
                        items:
                            [
                                  'Mặc định',
                                  'Giá tăng dần',
                                  'Giá giảm dần',
                                  'Đánh giá cao',
                                ]
                                .map(
                                  (s) => DropdownMenuItem(
                                    value: s,
                                    child: Text(s),
                                  ),
                                )
                                .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedSort = val);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // LƯỚI SẢN PHẨM
                  if (_isLoadingProducts)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: CircularProgressIndicator(
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                    )
                  else if (filtered.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 48,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 10),
                            const Text(
                              'Không tìm thấy nông sản phù hợp',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.68,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        final product = filtered[index];
                        return _buildProductCard(product);
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildCategoryChip
  Widget _buildCategoryChip(String cat) {
    final isSelected = _selectedCategory == cat;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = cat),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2E7D32) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF2E7D32)
                : const Color(0xFFE5ECE5),
          ),
        ),
        child: Text(
          cat,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF4A5568),
          ),
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildProductCard
  Widget _buildProductCard(Product product) {
    return GestureDetector(
      onTap: () {
        // Track hành vi click
        ApiService.trackRecommendation(
          productId: product.id,
          eventType: 'click',
        );
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailScreen(
              product: product,
              onAddToCart: widget.onAddToCart,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE5ECE5)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(14),
                  ),
                  child:
                      (product.imageUrl != null && product.imageUrl!.isNotEmpty)
                      ? Image.network(
                          ApiService.fixImageUrl(product.imageUrl),
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              _buildFallbackImg(120),
                        )
                      : _buildFallbackImg(120),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: () => _toggleFavorite(product),
                    child: Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        _favoriteProductIds.contains(product.id)
                            ? Icons.favorite
                            : Icons.favorite_border,
                        size: 16,
                        color: _favoriteProductIds.contains(product.id)
                            ? Colors.red
                            : Colors.grey.shade600,
                      ),
                    ),
                  ),
                ),
                if (product.isOutOfStock)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.25),
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(14),
                        ),
                      ),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'HẾT HÀNG',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      product.cert,
                      style: const TextStyle(
                        fontSize: 9.5,
                        color: Color(0xFF2E7D32),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Color(0xFF1B3A20),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'ĐVT: ${product.unit}',
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatCurrency(product.price),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13.5,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                      if (product.isOutOfStock)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFFFCA5A5)),
                          ),
                          child: const Text(
                            'Hết hàng',
                            style: TextStyle(
                              fontSize: 10.5,
                              color: Color(0xFFDC2626),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        )
                      else
                        GestureDetector(
                          onTap: () {
                            ApiService.trackRecommendation(
                              productId: product.id,
                              eventType: 'cart',
                            );
                            widget.onAddToCart(product);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFF2E7D32),
                              shape: BoxShape.circle,
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
          ],
        ),
      ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildFallbackImg
  Widget _buildFallbackImg(double height) {
    return Container(
      height: height,
      width: double.infinity,
      color: const Color(0xFFE8F5E9),
      child: const Center(
        child: Icon(Icons.eco, color: Color(0xFF2E7D32), size: 36),
      ),
    );
  }
}
