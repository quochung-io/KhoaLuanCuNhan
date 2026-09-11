import 'package:flutter/material.dart';
import '../../data/models/product_model.dart';
import '../../data/models/cart_item_model.dart';
import 'home/home_screen.dart';
import 'trace/trace_screen.dart';
import 'cart/cart_screen.dart';
import 'profile/profile_screen.dart';

class MainContainer extends StatefulWidget {
  final Map<String, dynamic>? user;
  const MainContainer({super.key, this.user});

  @override
  State<MainContainer> createState() => MainContainerState();
}

class MainContainerState extends State<MainContainer> {
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

  String? _scannedLotCode;
  void navigateToTrace(String lotCode) {
    setState(() {
      _scannedLotCode = lotCode;
      _currentIndex = 1;
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
      ProfileScreen(user: widget.user),
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
              color: Colors.black.withValues(alpha: 0.04),
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
