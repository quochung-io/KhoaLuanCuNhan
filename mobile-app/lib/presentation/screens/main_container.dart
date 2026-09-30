import 'package:flutter/material.dart';
import '../../data/models/product_model.dart';
import '../../data/models/cart_item_model.dart';
import 'home/home_screen.dart';
import 'combos/combos_screen.dart';
import 'trace/trace_screen.dart';
import 'notifications/notifications_screen.dart';
import 'profile/profile_screen.dart';
import 'cart/cart_screen.dart';

class MainContainer extends StatefulWidget {
  final Map<String, dynamic>? user;
  const MainContainer({super.key, this.user});

  @override
  State<MainContainer> createState() => MainContainerState();
}

class MainContainerState extends State<MainContainer> {
  int _currentIndex = 0;
  final List<CartItem> _cart = [];

  int get _cartCount => _cart.fold<int>(0, (sum, item) => sum + item.qty);

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
        content: Text('Đã thêm ${product.name} vào giỏ hàng (+1)'),
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

  void _openCart() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => CartScreen(
          cartItems: _cart,
          onUpdateQty: _updateQty,
          onCheckoutSuccess: _clearCart,
        ),
      ),
    );
  }

  String? _scannedLotCode;
  void navigateToTrace(String lotCode) {
    setState(() {
      _scannedLotCode = lotCode;
      _currentIndex = 2; // Index của tab Truy Xuất
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      HomeScreen(
        onAddToCart: _addToCart,
        onOpenCart: _openCart,
        cartCount: _cartCount,
      ),
      CombosScreen(
        onAddToCart: _addToCart,
      ),
      TraceScreen(
        initialLotCode: _scannedLotCode,
        onClearCode: () => _scannedLotCode = null,
      ),
      const NotificationsScreen(),
      ProfileScreen(
        user: widget.user,
        cartItems: _cart,
        onUpdateCartQty: _updateQty,
        onClearCart: _clearCart,
        onOpenCart: _openCart,
      ),
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
              color: Colors.black.withValues(alpha: 0.05),
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
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Trang chủ',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.card_giftcard_outlined),
              activeIcon: Icon(Icons.card_giftcard),
              label: 'Gói Combo',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner),
              activeIcon: Icon(Icons.qr_code_scanner_outlined),
              label: 'Truy xuất',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.notifications_none_outlined),
              activeIcon: Icon(Icons.notifications),
              label: 'Thông báo',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.person_outline),
                  if (_cartCount > 0)
                    Positioned(
                      top: -2,
                      right: -4,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: Color(0xFFE53935),
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(minWidth: 8, minHeight: 8),
                      ),
                    ),
                ],
              ),
              activeIcon: const Icon(Icons.person),
              label: 'Cá nhân',
            ),
          ],
        ),
      ),
    );
  }
}
