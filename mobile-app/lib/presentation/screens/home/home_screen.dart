import 'package:flutter/material.dart';
import '../../../data/models/product_model.dart';
import '../product_detail/product_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(Product) onAddToCart;
  const HomeScreen({super.key, required this.onAddToCart});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedRegion = 'Tất cả';
  String _selectedCert = 'Tất cả';
  String _selectedCategory = 'Tất cả';
  String _selectedSort = 'Mặc định';

  @override
  Widget build(BuildContext context) {
    // 1. Lọc sản phẩm theo Vùng, Chuẩn và Loại sản phẩm
    var filteredProducts = productsData.where((p) {
      final matchesRegion = _selectedRegion == 'Tất cả' || p.region == _selectedRegion;
      final matchesCert = _selectedCert == 'Tất cả' || p.cert.contains(_selectedCert);
      final matchesCategory = _selectedCategory == 'Tất cả' || p.category == _selectedCategory;
      return matchesRegion && matchesCert && matchesCategory;
    }).toList();

    // 2. Sắp xếp sản phẩm theo Giá / Đánh giá
    if (_selectedSort == 'Giá tăng dần') {
      filteredProducts.sort((a, b) => a.price.compareTo(b.price));
    } else if (_selectedSort == 'Giá giảm dần') {
      filteredProducts.sort((a, b) => b.price.compareTo(a.price));
    } else if (_selectedSort == 'Đánh giá cao') {
      filteredProducts.sort((a, b) => b.rating.compareTo(a.rating));
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: Color(0xFF2E7D32),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.eco, color: Colors.white, size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'LÀNH',
              style: TextStyle(
                fontFamily: 'Fraunces',
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Color(0xFF1B3A20),
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner eyebrow & title
              const Text(
                'NÔNG SẢN HỮU CƠ · TRUY XUẤT MINH BẠCH',
                style: TextStyle(
                  color: Color(0xFF2E7D32),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Rau sạch tận gốc,\nrõ ràng đến từng lô hàng',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1B3A20),
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 16),

              // Bento Combo Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE3F1E3), Color(0xFFF1F8F1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: const Color(0xFFE1EAE0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF2E7D32).withValues(alpha: 0.2)),
                      ),
                      child: const Text(
                        '🔥 COMBO TUẦN TIẾT KIỆM',
                        style: TextStyle(
                          color: Color(0xFF2E7D32),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Combo Nông Sản Gia Đình',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '4 loại rau + 2 loại trái cây hữu cơ giao tận nhà mỗi tuần.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4B5D50),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '189.000₫',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            final combo = Product(
                              id: 99,
                              name: 'Combo Nông Sản Gia Đình',
                              price: 189000,
                              unit: 'tuần',
                              cert: 'Hữu cơ',
                              region: 'Nhiều vùng',
                              rating: 5.0,
                              reviews: 42,
                              icon: Icons.shopping_basket_outlined,
                              color: const Color(0xFF2E7D32),
                              lot: 'COMBO-WEEKLY',
                              description: 'Combo dinh dưỡng tiện lợi.',
                            );
                            widget.onAddToCart(combo);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF9800),
                            foregroundColor: const Color(0xFF3A2200),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                          child: const Text('Đăng ký gói', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        )
                      ],
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Bộ lọc & Sắp xếp
              const Text(
                'Lọc & Sắp xếp Nông sản',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1B3A20),
                ),
              ),
              const SizedBox(height: 10),

              // Horizontal Filters & Sort Chips
              SizedBox(
                height: 38,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildFilterChip('Sắp xếp:', ['Mặc định', 'Giá tăng dần', 'Giá giảm dần', 'Đánh giá cao'], _selectedSort, (val) {
                      setState(() => _selectedSort = val);
                    }, icon: Icons.sort),
                    const SizedBox(width: 8),
                    _buildFilterChip('Loại:', ['Tất cả', 'Rau củ', 'Trái cây', 'Thực phẩm'], _selectedCategory, (val) {
                      setState(() => _selectedCategory = val);
                    }, icon: Icons.category_outlined),
                    const SizedBox(width: 8),
                    _buildFilterChip('Vùng:', ['Tất cả', 'Đà Lạt', 'Mộc Châu', 'Đồng Tháp'], _selectedRegion, (val) {
                      setState(() => _selectedRegion = val);
                    }, icon: Icons.location_on_outlined),
                    const SizedBox(width: 8),
                    _buildFilterChip('Chuẩn:', ['Tất cả', 'VietGAP', 'GlobalGAP', 'USDA'], _selectedCert, (val) {
                      setState(() => _selectedCert = val);
                    }, icon: Icons.verified_outlined),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Danh sách sản phẩm (Grid)
              filteredProducts.isEmpty
                  ? Container(
                      height: 150,
                      alignment: Alignment.center,
                      child: const Text(
                        'Không tìm thấy sản phẩm phù hợp.',
                        style: TextStyle(color: Color(0xFF4B5D50)),
                      ),
                    )
                  : GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.72,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                      ),
                      itemCount: filteredProducts.length,
                      itemBuilder: (context, index) {
                        final product = filteredProducts[index];
                        return _buildProductCard(context, product);
                      },
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String prefix, List<String> options, String selectedValue, Function(String) onSelected, {IconData? icon}) {
    return PopupMenuButton<String>(
      onSelected: onSelected,
      itemBuilder: (context) {
        return options.map((opt) {
          return PopupMenuItem<String>(
            value: opt,
            child: Text(opt, style: const TextStyle(fontSize: 13)),
          );
        }).toList();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selectedValue != 'Tất cả' && selectedValue != 'Mặc định' ? const Color(0xFFE3F1E3) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFFE1EAE0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: const Color(0xFF2E7D32)),
              const SizedBox(width: 4),
            ],
            Text(
              '$prefix ',
              style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 12),
            ),
            Text(
              selectedValue,
              style: const TextStyle(color: Color(0xFF2E7D32), fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const Icon(Icons.arrow_drop_down, color: Color(0xFF2E7D32), size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(BuildContext context, Product product) {
    return GestureDetector(
      onTap: () {
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
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE1EAE0)),
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
            // Top Image/Icon area
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: product.color.withValues(alpha: 0.06),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                ),
                child: Hero(
                  tag: 'product-icon-${product.id}',
                  child: Icon(
                    product.icon,
                    size: 54,
                    color: product.color,
                  ),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cert & Category tags
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F1E3),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.cert,
                          style: const TextStyle(
                            color: Color(0xFF2E7D32),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        product.category,
                        style: const TextStyle(
                          color: Color(0xFF8D9E90),
                          fontSize: 9,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Name
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Color(0xFF1B3A20),
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${product.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: Color(0xFF2E7D32),
                        ),
                      ),
                      Text(
                        ' / ${product.unit}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xFF8D9E90),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Add to cart button
                  SizedBox(
                    width: double.infinity,
                    height: 32,
                    child: ElevatedButton(
                      onPressed: () => widget.onAddToCart(product),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add, size: 14),
                          SizedBox(width: 2),
                          Text('Thêm giỏ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
