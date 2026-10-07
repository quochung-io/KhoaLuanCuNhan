import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../data/api_service.dart';
import '../../../data/models/cart_item_model.dart';
import '../profile/address_management_screen.dart';
import '../main_container.dart';

class CheckoutScreen extends StatefulWidget {
  final List<CartItem> cartItems;
  final VoidCallback onCheckoutSuccess;

  const CheckoutScreen({
    Key? key,
    required this.cartItems,
    required this.onCheckoutSuccess,
  }) : super(key: key);

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  List<dynamic> _addresses = [];
  Map<String, dynamic>? _selectedAddress;
  bool _isLoading = true;
  bool _isSubmitting = false;
  Map<String, dynamic>? _currentUser;
  
  final TextEditingController _noteController = TextEditingController();
  
  String _shippingMethod = 'Nhanh'; // 'Nhanh' hoặc 'HoaToc'
  int get _shippingFee => _shippingMethod == 'Nhanh' ? 25000 : 50000;
  
  String _paymentMethod = 'COD'; // 'COD', 'QRCode', 'BankApp'
  
  String? _shopVoucher;
  String? _appVoucher;

  @override
  void initState() {
    super.initState();
    _loadUserAndAddresses();
  }

  int get _userId => _currentUser?['userId'] ?? _currentUser?['id'] ?? 3;

  Future<void> _loadUserAndAddresses() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('customer_user');
    if (userStr != null) {
      _currentUser = jsonDecode(userStr);
    }
    await _fetchAddresses();
  }

  Future<void> _fetchAddresses() async {
    try {
      final addresses = await ApiService.getAddresses(_userId);
      setState(() {
        _addresses = addresses;
        if (addresses.isNotEmpty) {
          _selectedAddress = addresses.firstWhere(
            (a) => a['isDefault'] == true, 
            orElse: () => addresses.first
          );
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _navigateToSelectAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => AddressManagementScreen(
          userId: _userId,
          isSelecting: true,
          selectedAddress: _selectedAddress,
        ),
      ),
    );
    if (result != null && result is Map) {
      setState(() {
        _selectedAddress = Map<String, dynamic>.from(result);
      });
    }
  }

  int get _subTotal => widget.cartItems.fold<int>(
      0, (sum, item) => sum + item.product.price * item.qty);
      
  int get _totalAmount => _subTotal + _shippingFee;

  Future<void> _submitOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn địa chỉ giao hàng')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final orderData = {
        'customerId': _userId,
        'paymentMethod': _paymentMethod,
        'addressId': _selectedAddress!['addressId'],
        'orderItems': widget.cartItems.map((item) => {
          'productId': item.product.id,
          'quantity': item.qty,
          'unitPrice': item.product.price,
        }).toList(),
        'subtotal': _subTotal,
        'shippingFee': _shippingFee,
      };
      
      if (_noteController.text.isNotEmpty) {
        orderData['comment'] = _noteController.text;
      }

      await ApiService.createOrder(orderData);

      if (!mounted) return;
      widget.onCheckoutSuccess();
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Color(0xFF2E7D32), size: 56),
              const SizedBox(height: 14),
              const Text('Đặt hàng thành công!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 6),
              const Text(
                'Đơn hàng của bạn đang được điều phối. Bạn có thể theo dõi hành trình ở mục Cá nhân.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFF4B5D50)),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const MainContainer()),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2E7D32)),
                child: const Text('Đồng ý', style: TextStyle(color: Colors.white)),
              )
            ],
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Widget _buildFrame({required String title, required Widget child, Widget? trailing}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1B3A20))),
              if (trailing != null) trailing,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Color(0xFF2E7D32))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: const Text('Thanh toán'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            // Khung 1: Địa chỉ
            _buildFrame(
              title: 'Địa chỉ nhận hàng',
              trailing: InkWell(
                onTap: _navigateToSelectAddress,
                child: const Text('Thay đổi', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
              ),
              child: _selectedAddress == null
                  ? const Text('Chưa có địa chỉ. Vui lòng thêm địa chỉ.', style: TextStyle(color: Colors.red))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${_selectedAddress!['receiverName'] ?? 'Người nhận'} | ${_selectedAddress!['phone'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('${_selectedAddress!['addressDetail']}, ${_selectedAddress!['ward']}, ${_selectedAddress!['district']}, ${_selectedAddress!['province']}', style: const TextStyle(color: Color(0xFF4B5D50))),
                      ],
                    ),
            ),

            // Khung 2: Sản phẩm, Voucher shop, Lời nhắn
            _buildFrame(
              title: 'Thông tin sản phẩm',
              child: Column(
                children: [
                  ...widget.cartItems.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: item.product.color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(item.product.icon, color: item.product.color),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text('Số lượng: ${item.qty}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                            ],
                          ),
                        ),
                        Text('${(item.product.price * item.qty).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )),
                  const Divider(color: Color(0xFFE1EAE0)),
                  InkWell(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tính năng chọn Voucher Shop đang phát triển')));
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.storefront_outlined, color: Colors.orange, size: 20),
                              SizedBox(width: 8),
                              Text('Voucher của Shop'),
                            ],
                          ),
                          Text(_shopVoucher ?? 'Chọn hoặc nhập mã', style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                  const Divider(color: Color(0xFFE1EAE0)),
                  TextField(
                    controller: _noteController,
                    decoration: const InputDecoration(
                      hintText: 'Lời nhắn cho shop (VD: Giao giờ hành chính)',
                      hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ],
              ),
            ),

            // Khung 3: Vận chuyển
            _buildFrame(
              title: 'Phương thức vận chuyển',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RadioListTile<String>(
                    title: const Text('Giao hàng Nhanh'),
                    subtitle: const Text('25.000đ - Nhận hàng sau 2-3 ngày'),
                    value: 'Nhanh',
                    groupValue: _shippingMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _shippingMethod = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Giao hàng Hoả Tốc'),
                    subtitle: const Text('50.000đ - Nhận hàng trong 2 giờ'),
                    value: 'HoaToc',
                    groupValue: _shippingMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _shippingMethod = val!),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: const Color(0xFFFFF8E1), borderRadius: BorderRadius.circular(4)),
                    child: const Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.orange, size: 16),
                        SizedBox(width: 8),
                        Text('Đồng kiểm khi nhận hàng', style: TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Khung 4: Voucher App
            _buildFrame(
              title: 'LÀNH Voucher',
              child: InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Chưa có mã giảm giá khả dụng')));
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.confirmation_num_outlined, color: Color(0xFF2E7D32), size: 20),
                        SizedBox(width: 8),
                        Text('Chọn mã giảm giá'),
                      ],
                    ),
                    Text(_appVoucher ?? 'Chọn hoặc nhập mã', style: const TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),

            // Khung 5: Phương thức thanh toán
            _buildFrame(
              title: 'Phương thức thanh toán',
              child: Column(
                children: [
                  RadioListTile<String>(
                    title: const Text('Thanh toán khi nhận hàng (COD)'),
                    value: 'COD',
                    groupValue: _paymentMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _paymentMethod = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Thanh toán qua QR Code'),
                    value: 'QRCode',
                    groupValue: _paymentMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _paymentMethod = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Thanh toán qua App Ngân hàng'),
                    value: 'BankApp',
                    groupValue: _paymentMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) {
                      setState(() => _paymentMethod = val!);
                      // Mock dữ liệu tĩnh như yêu cầu
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tính năng chuyển hướng App Ngân hàng đang giả lập')));
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -3))],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tổng thanh toán', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  Text(
                    '${_totalAmount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Color(0xFF2E7D32)),
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Đặt hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
