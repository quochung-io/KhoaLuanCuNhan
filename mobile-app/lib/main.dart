import 'package:flutter/material.dart';

void main() {
  runApp(const LanhApp());
}

class LanhApp extends StatelessWidget {
  const LanhApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LÀNH - Nông sản hữu cơ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'sans-serif',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2E7D32),
          primary: const Color(0xFF2E7D32),
          secondary: const Color(0xFFFF9800),
          background: const Color(0xFFF9FBF8),
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FBF8),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF9FBF8),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            color: Color(0xFF16241A),
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
          iconTheme: IconThemeData(color: Color(0xFF16241A)),
        ),
      ),
      home: const MainContainer(),
    );
  }
}

// Model Product đồng bộ dữ liệu với web LÀNH
class Product {
  final int id;
  final String name;
  final int price;
  final String unit;
  final String cert;
  final String region;
  final double rating;
  final int reviews;
  final IconData icon;
  final Color color;
  final String lot;
  final String description;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    required this.cert,
    required this.region,
    required this.rating,
    required this.reviews,
    required this.icon,
    required this.color,
    required this.lot,
    required this.description,
  });
}

final List<Product> productsData = [
  Product(
    id: 1,
    name: 'Cải bó xôi hữu cơ',
    price: 28000,
    unit: '300g',
    cert: 'VietGAP',
    region: 'Đà Lạt',
    rating: 4.8,
    reviews: 212,
    icon: Icons.eco_outlined,
    color: const Color(0xFF2E7D32),
    lot: 'LOT#VN-DL-0842',
    description: 'Rau cải bó xôi được canh tác hữu cơ hoàn toàn tại nông trại Đà Lạt, giàu sắt và chất xơ, không sử dụng thuốc trừ sâu hóa học.',
  ),
  Product(
    id: 2,
    name: 'Cà rốt baby Đà Lạt',
    price: 32000,
    unit: '500g',
    cert: 'GlobalGAP',
    region: 'Đà Lạt',
    rating: 4.9,
    reviews: 184,
    icon: Icons.agriculture_outlined,
    color: const Color(0xFFFF9800),
    lot: 'LOT#VN-DL-0917',
    description: 'Cà rốt baby giòn ngọt, thu hoạch non tại vườn hữu cơ, thích hợp ăn sống, làm nước ép hoặc chế biến thức ăn cho bé.',
  ),
  Product(
    id: 3,
    name: 'Cam Cao Phong',
    price: 45000,
    unit: 'kg',
    cert: 'VietGAP',
    region: 'Mộc Châu',
    rating: 4.7,
    reviews: 301,
    icon: Icons.spa_outlined,
    color: const Color(0xFFFF9800),
    lot: 'LOT#VN-MC-1140',
    description: 'Cam vỏ mỏng, mọng nước, vị ngọt thanh tự nhiên được trồng theo chuẩn VietGAP tại thung lũng Cao Phong.',
  ),
  Product(
    id: 4,
    name: 'Trứng gà ta thả vườn',
    price: 52000,
    unit: 'hộp 10 quả',
    cert: 'USDA Organic',
    region: 'Đồng Tháp',
    rating: 5.0,
    reviews: 96,
    icon: Icons.egg_outlined,
    color: const Color(0xFFC0392B),
    lot: 'LOT#VN-DT-0663',
    description: 'Trứng từ giống gà ta thả vườn tự nhiên, ăn ngũ cốc hữu cơ, lòng đỏ sậm màu, béo thơm và giàu dinh dưỡng.',
  ),
  Product(
    id: 5,
    name: 'Mật ong rừng nguyên chất',
    price: 135000,
    unit: '500ml',
    cert: 'USDA Organic',
    region: 'Mộc Châu',
    rating: 4.9,
    reviews: 158,
    icon: Icons.filter_vintage_outlined,
    color: const Color(0xFFD4AC0D),
    lot: 'LOT#VN-MC-0255',
    description: 'Mật ong rừng khai thác tự nhiên tại các vùng hoa hoang dã Mộc Châu, không pha tạp, vị ngọt đậm đà tinh khiết.',
  ),
  Product(
    id: 6,
    name: 'Dâu tây Mộc Châu',
    price: 68000,
    unit: 'hộp 250g',
    cert: 'GlobalGAP',
    region: 'Mộc Châu',
    rating: 4.8,
    reviews: 243,
    icon: Icons.favorite_border_rounded,
    color: const Color(0xFFC0392B),
    lot: 'LOT#VN-MC-0389',
    description: 'Dâu tây chín mọng đỏ, chua ngọt hài hòa, canh tác nhà màng ứng dụng công nghệ tưới tiêu nhỏ giọt đạt chuẩn GlobalGAP.',
  ),
];

class CartItem {
  final Product product;
  int qty;

  CartItem({required this.product, this.qty = 1});
}

// Container chính để quản lý State chung (Giỏ hàng) và điều hướng BottomNavigationBar
class MainContainer extends StatefulWidget {
  const MainContainer({super.key});

  @override
  State<MainContainer> createState() => _MainContainerState();
}

class _MainContainerState extends State<MainContainer> {
  int _currentIndex = 0;
  final List<CartItem> _cart = [];

  void _addToCart(Product product) {
    setState(() {
      final index = _cart.indexWhere((item) => item.product.id == product.id);
      if (index >= 0) {
        _cart[index].qty++;
      } else {
        _cart.add(CartItem(product: product));
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã thêm ${product.name} vào giỏ hàng'),
        duration: const Duration(seconds: 1),
        backgroundColor: const Color(0xFF2E7D32),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _updateQty(int productId, int delta) {
    setState(() {
      final index = _cart.indexWhere((item) => item.product.id == productId);
      if (index >= 0) {
        _cart[index].qty += delta;
        if (_cart[index].qty <= 0) {
          _cart.removeAt(index);
        }
      }
    });
  }

  void _clearCart() {
    setState(() {
      _cart.clear();
    });
  }

  // Chuyển Tab và tự động điền mã QR nếu quét thành công
  String? _scannedLotCode;
  void _navigateToTrace(String lotCode) {
    setState(() {
      _scannedLotCode = lotCode;
      _currentIndex = 1; // Mở Tab Truy xuất
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(onAddToCart: _addToCart),
      TraceScreen(
        initialLotCode: _scannedLotCode,
        onClearCode: () => _scannedLotCode = null,
      ),
      CartScreen(
        cartItems: _cart,
        onUpdateQty: _updateQty,
        onCheckoutSuccess: _clearCart,
      ),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF2E7D32),
          unselectedItemColor: const Color(0xFF8D9E90),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined),
              activeIcon: Icon(Icons.shopping_bag),
              label: 'Cửa hàng',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner_outlined),
              activeIcon: Icon(Icons.qr_code_scanner),
              label: 'Truy xuất',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                label: Text(
                  _cart.fold<int>(0, (sum, item) => sum + item.qty).toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 10),
                ),
                isLabelVisible: _cart.isNotEmpty,
                child: const Icon(Icons.shopping_cart_outlined),
              ),
              activeIcon: Badge(
                label: Text(
                  _cart.fold<int>(0, (sum, item) => sum + item.qty).toString(),
                  style: const TextStyle(color: Colors.white, fontSize: 10),
                ),
                isLabelVisible: _cart.isNotEmpty,
                child: const Icon(Icons.shopping_cart),
              ),
              label: 'Giỏ hàng',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Cá nhân',
            ),
          ],
        ),
      ),
    );
  }
}

// ================= 1. HOMESCREEN (CỬA HÀNG) =================
class HomeScreen extends StatefulWidget {
  final Function(Product) onAddToCart;
  const HomeScreen({super.key, required this.onAddToCart});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedRegion = 'Tất cả';
  String _selectedCert = 'Tất cả';

  @override
  Widget build(BuildContext context) {
    // Lọc sản phẩm
    final filteredProducts = productsData.where((p) {
      final matchesRegion = _selectedRegion == 'Tất cả' || p.region == _selectedRegion;
      final matchesCert = _selectedCert == 'Tất cả' || p.cert.contains(_selectedCert);
      return matchesRegion && matchesCert;
    }).toList();

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
                        border: Border.all(color: const Color(0xFF2E7D32).withOpacity(0.2)),
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
                      mainAxisAlignment: MainAxisAlignment.between,
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
                            // Tạo product combo giả lập
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

              // Bộ lọc danh mục (Chips)
              const Text(
                'Lọc theo nguồn gốc & chứng nhận',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1B3A20),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildFilterChip('Vùng:', ['Tất cả', 'Đà Lạt', 'Mộc Châu', 'Đồng Tháp'], _selectedRegion, (val) {
                      setState(() {
                        _selectedRegion = val;
                      });
                    }),
                    const SizedBox(width: 8),
                    _buildFilterChip('Chuẩn:', ['Tất cả', 'VietGAP', 'GlobalGAP', 'USDA'], _selectedCert, (val) {
                      setState(() {
                        _selectedCert = val;
                      });
                    }),
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

  // Widget tạo Dropdown/Filter Chip
  Widget _buildFilterChip(String prefix, List<String> options, String selectedValue, Function(String) onSelected) {
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
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: const Color(0xFFE1EAE0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
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

  // Thẻ sản phẩm UI tương đồng web LÀNH
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
              color: Colors.black.withOpacity(0.02),
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
                  color: product.color.withOpacity(0.06),
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
                  // Cert & Origin tags
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
                        product.region,
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

// ================= 2. TRACESCREEN (TRUY XUẤT NGUỒN GỐC & SCAN QR) =================
class TraceScreen extends StatefulWidget {
  final String? initialLotCode;
  final VoidCallback? onClearCode;

  const TraceScreen({super.key, this.initialLotCode, this.onClearCode});

  @override
  State<TraceScreen> createState() => _TraceScreenState();
}

class _TraceScreenState extends State<TraceScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _hasSearched = false;
  bool _isScanning = false;
  String? _scannedCode;
  Product? _tracedProduct;

  @override
  void initState() {
    super.initState();
    if (widget.initialLotCode != null) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  @override
  void didUpdateWidget(covariant TraceScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialLotCode != null) {
      _controller.text = widget.initialLotCode!;
      _performTrace(widget.initialLotCode!);
      if (widget.onClearCode != null) widget.onClearCode!();
    }
  }

  void _performTrace(String lotCode) {
    setState(() {
      _hasSearched = true;
      // Tìm sản phẩm có mã lô khớp
      final found = productsData.firstWhere(
        (p) => p.lot.toLowerCase() == lotCode.trim().toLowerCase(),
        orElse: () => productsData[0], // fallback sang Cải bó xôi nếu gõ linh tinh
      );
      _tracedProduct = found;
    });
  }

  // Giả lập quét mã QR với hiệu ứng động
  void _startQrScan() {
    setState(() {
      _isScanning = true;
    });
    // Giả lập quét thành công sau 2.5 giây
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted && _isScanning) {
        setState(() {
          _isScanning = false;
          _scannedCode = 'LOT#VN-DL-0842'; // Lô hàng Cải Bó Xôi
          _controller.text = _scannedCode!;
          _performTrace(_scannedCode!);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Quét mã QR thành công!'),
            backgroundColor: Color(0xFF2E7D32),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Truy xuất nguồn gốc'),
      ),
      body: _isScanning
          ? _buildQrScannerOverlay()
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'NHẬT KÝ HÀNH TRÌNH NÔNG SẢN',
                      style: TextStyle(
                        color: Color(0xFF2E7D32),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Nhập mã lô hoặc Quét QR',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B3A20),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Thanh nhập mã + Button Scan
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            decoration: InputDecoration(
                              hintText: 'Nhập mã ví dụ: LOT#VN-DL-0842',
                              hintStyle: const TextStyle(color: Color(0xFF8D9E90), fontSize: 13),
                              fillColor: Colors.white,
                              filled: true,
                              prefixIcon: const Icon(Icons.search, color: Color(0xFF2E7D32)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFFE1EAE0)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFF2E7D32)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: _startQrScan,
                          child: Container(
                            height: 48,
                            width: 48,
                            decoration: BoxDecoration(
                              color: const Color(0xFFE3F1E3),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF2E7D32).withOpacity(0.2)),
                            ),
                            child: const Icon(Icons.qr_code_scanner, color: Color(0xFF2E7D32)),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () => _performTrace(_controller.text),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Truy xuất', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Kết quả truy xuất
                    if (_hasSearched && _tracedProduct != null) ...[
                      _buildTracedProductHeader(_tracedProduct!),
                      const SizedBox(height: 24),
                      const Text(
                        'HÀNH TRÌNH CANH TÁC & VẬN CHUYỂN',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B3A20),
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildTraceTimeline(),
                    ] else if (!_hasSearched) ...[
                      // Giao diện chào khi chưa tìm kiếm
                      Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 40),
                            Icon(Icons.history_edu_outlined, size: 72, color: const Color(0xFF2E7D32).withOpacity(0.15)),
                            const SizedBox(height: 12),
                            const Text(
                              'Nhật ký Farm-to-Table',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                            ),
                            const SizedBox(height: 6),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 24.0),
                              child: Text(
                                'Quét mã QR trên tem nhãn nông sản LÀNH để kiểm tra nguồn gốc, hạt giống, quá trình thu hoạch và chứng nhận kiểm định.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12, height: 1.4),
                              ),
                            ),
                          ],
                        ),
                      )
                    ]
                  ],
                ),
              ),
            ),
    );
  }

  // UI quét mã QR giả lập
  Widget _buildQrScannerOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.9),
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Lớp hướng dẫn quét
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'QUÉT MÃ QR NÔNG SẢN LÀNH',
                style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              const SizedBox(height: 8),
              const Text(
                'Đặt mã QR nằm bên trong khung quét',
                style: TextStyle(color: Colors.white70, fontSize: 11),
              ),
              const SizedBox(height: 32),
              // Khung quét
              Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF4CAF50), width: 3),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Stack(
                  children: [
                    // Hiệu ứng tia quét di chuyển giả lập (Animated line)
                    _ScanningLineAnimation(),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              // Nút hủy
              OutlinedButton(
                onPressed: () {
                  setState(() {
                    _isScanning = false;
                  });
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white50),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: const Text('Hủy bỏ'),
              )
            ],
          )
        ],
      ),
    );
  }

  // Header thông tin sản phẩm được truy xuất
  Widget _buildTracedProductHeader(Product product) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: product.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(product.icon, color: product.color, size: 32),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1B3A20)),
                ),
                const SizedBox(height: 2),
                Text(
                  'Lô sản xuất: ${product.lot}',
                  style: const TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  'Chuẩn: ${product.cert} · Nguồn gốc: ${product.region}',
                  style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // Timeline hành trình Farm-to-Table
  Widget _buildTraceTimeline() {
    final List<Map<String, String>> steps = [
      {'icon': '🌱', 'title': 'Gieo trồng', 'date': '12/06/2026', 'code': 'SEED-0842', 'desc': 'Hạt giống hữu cơ đạt chuẩn được gieo trồng tại nông trại kiểm định Đà Lạt.'},
      {'icon': '💧', 'title': 'Chăm sóc', 'date': '15/06–20/07', 'code': 'CARE-0842-A', 'desc': 'Tưới nước tự động, bón phân hữu cơ sinh học, không hóa chất.'},
      {'icon': '🧺', 'title': 'Thu hoạch', 'date': '21/07/2026', 'code': 'HRV-0842-B', 'desc': 'Thu hoạch thủ công vào lúc sáng sớm để giữ độ tươi giòn.'},
      {'icon': '🔬', 'title': 'Kiểm định', 'date': '21/07/2026', 'code': 'QC-0842-C', 'desc': 'Kiểm tra dư lượng nitrat và vi sinh vật gây hại, đạt chuẩn xuất vườn.'},
      {'icon': '🚚', 'title': 'Vận chuyển', 'date': '22/07/2026', 'code': 'SHIP-0842-D', 'desc': 'Đóng gói trong thùng mát và vận chuyển bằng xe đông lạnh chuyên dụng.'},
      {'icon': '🍽️', 'title': 'Bàn ăn', 'date': 'Hiện tại', 'code': 'DLV-0842-E', 'desc': 'Sản phẩm đến tay bạn tại cửa hàng hoặc giao hàng trong 2 giờ.'},
    ];

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: steps.length,
      itemBuilder: (context, index) {
        final step = steps[index];
        final isLast = index == steps.length - 1;
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cột bên trái: Timeline và đường thẳng nối
            Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE3F1E3),
                    shape: BoxShape.circle,
                  ),
                  child: Text(step['icon']!, style: const TextStyle(fontSize: 16)),
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 60,
                    color: const Color(0xFFE1EAE0),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            // Cột bên phải: Thông tin bước
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text(
                        step['title']!,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3A20)),
                      ),
                      Text(
                        step['date']!,
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Mã nhật ký: ${step['code']}',
                    style: const TextStyle(fontSize: 10, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    step['desc']!,
                    style: const TextStyle(color: Color(0xFF4B5D50), fontSize: 12, height: 1.3),
                  ),
                  const SizedBox(height: 14),
                ],
              ),
            )
          ],
        );
      },
    );
  }
}

// Hiệu ứng tia quét chuyển động của màn hình Scan QR Code
class _ScanningLineAnimation extends StatefulWidget {
  @override
  State<_ScanningLineAnimation> createState() => _ScanningLineAnimationState();
}

class _ScanningLineAnimationState extends State<_ScanningLineAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.0, end: 236.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Positioned(
          top: _animation.value,
          left: 2,
          right: 2,
          child: Container(
            height: 3,
            decoration: BoxDecoration(
              color: const Color(0xFF4CAF50),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF4CAF50).withOpacity(0.8),
                  blurRadius: 8,
                  spreadRadius: 2,
                )
              ],
            ),
          ),
        );
      },
    );
  }
}

// ================= 3. CARTSCREEN (GIỎ HÀNG & THANH TOÁN GIẢ LẬP) =================
class CartScreen extends StatelessWidget {
  final List<CartItem> cartItems;
  final Function(int, int) onUpdateQty;
  final VoidCallback onCheckoutSuccess;

  const CartScreen({
    super.key,
    required this.cartItems,
    required this.onUpdateQty,
    required this.onCheckoutSuccess,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = cartItems.fold<int>(0, (sum, item) => sum + item.product.price * item.qty);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng của bạn'),
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: const Color(0xFF2E7D32).withOpacity(0.2)),
                  const SizedBox(height: 12),
                  const Text('Giỏ hàng trống', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B3A20))),
                  const SizedBox(height: 6),
                  const Text('Hãy chọn các bó rau tươi ngon ở tab Cửa hàng nhé.', style: TextStyle(color: Color(0xFF8D9E90), fontSize: 12)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return _buildCartItemTile(context, item);
                    },
                  ),
                ),
                _buildOrderSummaryPanel(context, totalAmount),
              ],
            ),
    );
  }

  Widget _buildCartItemTile(BuildContext context, CartItem item) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: item.product.color.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(item.product.icon, color: item.product.color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3A20)),
                ),
                const SizedBox(height: 2),
                Text(
                  'Đơn giá: ${item.product.price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                ),
              ],
            ),
          ),
          // Điều khiển số lượng
          Row(
            children: [
              IconButton(
                onPressed: () => onUpdateQty(item.product.id, -1),
                icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF8D9E90), size: 20),
              ),
              Text(
                item.qty.toString(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              IconButton(
                onPressed: () => onUpdateQty(item.product.id, 1),
                icon: const Icon(Icons.add_circle_outline, color: Color(0xFF2E7D32), size: 20),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildOrderSummaryPanel(BuildContext context, int totalAmount) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text('Tổng tiền hàng:', style: TextStyle(color: Color(0xFF4B5D50))),
                Text(
                  '${totalAmount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text('Phí vận chuyển:', style: TextStyle(color: Color(0xFF4B5D50))),
                Text(
                  'Miễn phí',
                  style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const Divider(color: Color(0xFFE1EAE0), height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                const Text('Cần thanh toán:', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                Text(
                  '${totalAmount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}₫',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                ),
              ],
            ),
            const SizedBox(height: 18),
            // Thanh toán giả lập (Mock Checkout Flow)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  _showMockCheckoutDialog(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
                ),
                child: const Text('Thanh toán giả lập', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  void _showMockCheckoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.payment, color: Color(0xFFFF9800)),
              SizedBox(width: 8),
              Text('Giả lập thanh toán', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: const Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Đây là tính năng thanh toán giả lập (Sandbox) phục vụ việc chạy demo khóa luận tốt nghiệp.',
                style: TextStyle(fontSize: 13, color: Color(0xFF4B5D50), height: 1.4),
              ),
              SizedBox(height: 10),
              Text(
                'Hệ thống sẽ ghi nhận trạng thái đơn hàng là ĐÃ THANH TOÁN và trừ tồn kho các lô hàng tương ứng theo chuẩn FEFO.',
                style: TextStyle(fontSize: 13, color: Color(0xFF4B5D50), height: 1.4),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Hủy', style: TextStyle(color: Color(0xFF8D9E90))),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                onCheckoutSuccess();
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF2E7D32), size: 56),
                        const SizedBox(height: 14),
                        const Text('Đặt hàng thành công!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 6),
                        const Text(
                          'Đơn hàng của bạn đang được điều phối giao trong 2 giờ. Bạn có thể theo dõi hành trình ở mục Cá nhân.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50)),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
                          child: const Text('Đồng ý', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
              child: const Text('Xác nhận thanh toán', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}

// ================= 4. DETAILSCREEN (CHI TIẾT SẢN PHẨM & TRUY XUẤT) =================
class ProductDetailScreen extends StatelessWidget {
  final Product product;
  final Function(Product) onAddToCart;

  const ProductDetailScreen({super.key, required this.product, required this.onAddToCart});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết nông sản'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hình ảnh icon đại diện sản phẩm
            Container(
              width: double.infinity,
              height: 220,
              decoration: BoxDecoration(
                color: product.color.withOpacity(0.06),
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
                  // Tags chứng nhận
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

                  // Đánh giá sao
                  Row(
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFF9800), size: 18),
                      const SizedBox(width: 2),
                      Text(
                        product.rating.toString(),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${product.reviews} đánh giá)',
                        style: const TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
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
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                      ),
                      Text(
                        ' / ${product.unit}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF8D9E90)),
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

                  // Thông tin mã lô sản phẩm (Truy xuất)
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
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            const Text('Mã lô truy xuất:', style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50))),
                            Text(
                              product.lot,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Sản phẩm này có nhật ký canh tác đầy đủ. Bạn có thể sử dụng mã lô trên để tra cứu toàn bộ nguồn gốc.',
                          style: TextStyle(fontSize: 11, color: Color(0xFF8D9E90), height: 1.3),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 36,
                          child: OutlinedButton(
                            onPressed: () {
                              // Đóng màn hình chi tiết và chuyển sang Tab Truy xuất nguồn gốc
                              Navigator.pop(context);
                              final mainState = context.findAncestorStateOfType<_MainContainerState>();
                              if (mainState != null) {
                                mainState._navigateToTrace(product.lot);
                              }
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFF2E7D32)),
                              foregroundColor: const Color(0xFF2E7D32),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.qr_code, size: 14),
                                SizedBox(width: 4),
                                Text('Xem nhật ký canh tác', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: const Color(0xFFE1EAE0))),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: () {
                onAddToCart(product);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
              ),
              child: const Text('Thêm vào giỏ hàng', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ),
      ),
    );
  }
}

// ================= 5. PROFILESCREEN (TRANG CÁ NHÂN & LỊCH SỬ) =================
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cá nhân'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // User Avatar Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              color: Colors.white,
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Color(0xFFE3F1E3),
                    child: Icon(Icons.person, size: 36, color: Color(0xFF2E7D32)),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Bùi Quốc Hưng',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF1B3A20)),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'quochung.io@gmail.com · Khách hàng Thân thiết',
                    style: TextStyle(color: Color(0xFF8D9E90), fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Lịch sử Đơn hàng
            _buildProfileSectionHeader('Đơn hàng của tôi'),
            _buildMenuTile(
              icon: Icons.history,
              title: 'Lịch sử mua hàng',
              subtitle: 'Xem lại các đơn hàng đã mua',
              onTap: () {},
            ),
            _buildMenuTile(
              icon: Icons.local_shipping_outlined,
              title: 'Theo dõi đơn hàng',
              subtitle: 'Đơn hàng đang giao trong 2 giờ',
              onTap: () {},
            ),
            const SizedBox(height: 12),

            // Quản lý tài khoản
            _buildProfileSectionHeader('Tài khoản'),
            _buildMenuTile(
              icon: Icons.location_on_outlined,
              title: 'Địa chỉ nhận hàng',
              subtitle: 'Thiết lập vị trí giao hàng để gợi ý độ tươi tối ưu',
              onTap: () {},
            ),
            _buildMenuTile(
              icon: Icons.favorite_outline,
              title: 'Sản phẩm đã thích',
              subtitle: 'Lưu trữ các nông sản bạn quan tâm',
              onTap: () {},
            ),
            const SizedBox(height: 12),

            // Hỗ trợ & Thông tin
            _buildProfileSectionHeader('Ứng dụng LÀNH'),
            _buildMenuTile(
              icon: Icons.info_outline,
              title: 'Về dự án khóa luận ECC',
              subtitle: 'Đại học Công Thương TP.HCM (HUIT)',
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0, top: 12, bottom: 6),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFF2E7D32),
            letterSpacing: 1.0,
          ),
        ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      color: Colors.white,
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: const Color(0xFF2E7D32)),
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20))),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF8D9E90))),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFFE1EAE0)),
      ),
    );
  }
}
