import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import '../../../data/api_service.dart';
import '../../../data/models/cart_item_model.dart';
import '../profile/address_management_screen.dart';
import '../main_container.dart';
import 'payment_qr_screen.dart';

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
  Map<String, dynamic>? _selectedAddress;
  bool _isLoading = true;
  bool _isSubmitting = false;
  Map<String, dynamic>? _currentUser;

  final TextEditingController _noteController = TextEditingController();

  String _shippingMethod = 'Nhanh'; // 'Nhanh' hoặc 'HoaToc'
  int get _shippingFee => _shippingMethod == 'Nhanh' ? 25000 : 50000;

  String _paymentMethod = 'COD'; // 'COD', 'QRCode', 'MoMo'

  // Voucher states
  Map<String, dynamic>? _selectedShopVoucher;
  Map<String, dynamic>? _selectedPlatformVoucher;
  List<dynamic> _shopVouchers = [];
  List<dynamic> _platformVouchers = [];
  bool _isLoadingVouchers = false;

  @override
  void initState() {
    super.initState();
    _loadUserAndAddresses();
  }

  int get _userId => _currentUser?['userId'] ?? _currentUser?['id'] ?? 3;

  String _formatCurrency(num amount) {
    return '${amount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ';
  }

  Future<void> _loadUserAndAddresses() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('customer_user');
    if (userStr != null) {
      _currentUser = jsonDecode(userStr);
    }
    await _fetchAddresses();
    await _fetchCheckoutVouchers();
  }

  Future<void> _fetchAddresses() async {
    try {
      final addresses = await ApiService.getAddresses(_userId);
      setState(() {
        if (addresses.isNotEmpty) {
          _selectedAddress = addresses.firstWhere(
            (a) => a['isDefault'] == true,
            orElse: () => addresses.first,
          );
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchCheckoutVouchers() async {
    setState(() => _isLoadingVouchers = true);
    try {
      final res = await ApiService.getCheckoutVouchers(
        userId: _userId,
        subtotal: _subTotal,
        shippingFee: _shippingFee,
      );
      if (mounted) {
        setState(() {
          _shopVouchers = res['shopVouchers'] ?? [];
          _platformVouchers = res['platformVouchers'] ?? [];

          // Đồng bộ lại voucher đang chọn nếu có thay đổi tính hợp lệ
          if (_selectedShopVoucher != null) {
            final currentId = _selectedShopVoucher!['voucherId'];
            final updated = _shopVouchers.firstWhere(
              (v) => v['voucherId'] == currentId,
              orElse: () => null,
            );
            if (updated != null && updated['isValid'] == true) {
              _selectedShopVoucher = Map<String, dynamic>.from(updated);
            } else {
              _selectedShopVoucher = null;
            }
          }

          if (_selectedPlatformVoucher != null) {
            final currentId = _selectedPlatformVoucher!['voucherId'];
            final updated = _platformVouchers.firstWhere(
              (v) => v['voucherId'] == currentId,
              orElse: () => null,
            );
            if (updated != null && updated['isValid'] == true) {
              _selectedPlatformVoucher = Map<String, dynamic>.from(updated);
            } else {
              _selectedPlatformVoucher = null;
            }
          }
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isLoadingVouchers = false);
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
    0,
    (sum, item) => sum + item.product.price * item.qty,
  );

  int get _shopDiscount {
    if (_selectedShopVoucher == null) return 0;
    return (_selectedShopVoucher!['discountAmount'] as num?)?.toInt() ?? 0;
  }

  int get _platformDiscount {
    if (_selectedPlatformVoucher == null) return 0;
    return (_selectedPlatformVoucher!['discountAmount'] as num?)?.toInt() ?? 0;
  }

  int get _subTotalAfterShop => (_subTotal - _shopDiscount).clamp(0, _subTotal);

  int get _totalAmount {
    final vType = (_selectedPlatformVoucher?['voucherType'] ?? '')
        .toString()
        .toLowerCase();
    if (vType == 'ship') {
      final effectiveShip = (_shippingFee - _platformDiscount).clamp(
        0,
        _shippingFee,
      );
      return _subTotalAfterShop + effectiveShip;
    } else {
      final effectiveBase = (_subTotalAfterShop - _platformDiscount).clamp(
        0,
        999999999,
      );
      return effectiveBase + _shippingFee;
    }
  }

  Future<void> _submitOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn địa chỉ giao hàng')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final orderData = <String, dynamic>{
        'customerId': _userId,
        'paymentMethod': _paymentMethod,
        'addressId': _selectedAddress!['addressId'],
        'orderItems': widget.cartItems
            .map(
              (item) => {
                'productId': item.product.id,
                'quantity': item.qty,
                'unitPrice': item.product.price,
              },
            )
            .toList(),
        'subtotal': _subTotal,
        'shippingFee': _shippingFee,
      };

      if (_selectedShopVoucher != null) {
        orderData['shopVoucherId'] = _selectedShopVoucher!['voucherId'];
        orderData['shopVoucherCode'] = _selectedShopVoucher!['code'];
      }
      if (_selectedPlatformVoucher != null) {
        orderData['platformVoucherId'] = _selectedPlatformVoucher!['voucherId'];
        orderData['platformVoucherCode'] = _selectedPlatformVoucher!['code'];
      }

      if (_noteController.text.isNotEmpty) {
        orderData['comment'] = _noteController.text;
      }

      final res = await ApiService.createOrder(orderData);

      if (!mounted) return;
      widget.onCheckoutSuccess();

      if (_paymentMethod == 'MoMo') {
        final rawId = res['orderId'] ?? res['id'];
        final int orderId = rawId is num
            ? rawId.toInt()
            : int.tryParse(rawId.toString()) ?? 0;
        final String orderCode =
            (res['orderCode'] ?? 'DH-${DateTime.now().millisecondsSinceEpoch}')
                .toString();

        String? momoDeeplink;
        String? momoPayUrl;

        try {
          final momoRes = await ApiService.createMomoPayment(orderId);
          momoDeeplink = momoRes['deeplink'] as String?;
          momoPayUrl = momoRes['payUrl'] as String?;

          // Mở deeplink MoMo bằng url_launcher (externalApplication)
          if (momoDeeplink != null && momoDeeplink.isNotEmpty) {
            final uri = Uri.parse(momoDeeplink);
            final launched = await launchUrl(
              uri,
              mode: LaunchMode.externalApplication,
            ).catchError((_) => false);
            if (!launched && momoPayUrl != null && momoPayUrl.isNotEmpty) {
              await launchUrl(
                Uri.parse(momoPayUrl),
                mode: LaunchMode.externalApplication,
              ).catchError((_) => false);
            }
          } else if (momoPayUrl != null && momoPayUrl.isNotEmpty) {
            await launchUrl(
              Uri.parse(momoPayUrl),
              mode: LaunchMode.externalApplication,
            ).catchError((_) => false);
          }
        } catch (e) {
          debugPrint('Lỗi tạo thanh toán MoMo: $e');
        }

        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (ctx) => PaymentQRScreen(
              orderId: orderId,
              orderCode: orderCode,
              totalAmount: _totalAmount,
              paymentMethod: 'MoMo',
              userId: _userId,
              createdAt: DateTime.now(),
              momoDeeplink: momoDeeplink,
              momoPayUrl: momoPayUrl,
            ),
          ),
        );
      } else if (_paymentMethod == 'QRCode') {
        final rawId = res['orderId'] ?? res['id'];
        final int orderId = rawId is num
            ? rawId.toInt()
            : int.tryParse(rawId.toString()) ?? 0;
        final String orderCode =
            (res['orderCode'] ?? 'DH-${DateTime.now().millisecondsSinceEpoch}')
                .toString();

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (ctx) => PaymentQRScreen(
              orderId: orderId,
              orderCode: orderCode,
              totalAmount: _totalAmount,
              paymentMethod: 'QRCode',
              userId: _userId,
              createdAt: DateTime.now(),
            ),
          ),
        );
      } else {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.check_circle,
                  color: Color(0xFF2E7D32),
                  size: 56,
                ),
                const SizedBox(height: 14),
                const Text(
                  'Đặt hàng thành công!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
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
                      MaterialPageRoute(
                        builder: (context) => const MainContainer(),
                      ),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2E7D32),
                  ),
                  child: const Text(
                    'Đồng ý',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
      // Nếu voucher lỗi (hết hạn hoặc thay đổi), cập nhật lại
      _fetchCheckoutVouchers();
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  // ── BOTTOM SHEET CHỌN VOUCHER ──────────────────────────────
  void _openVoucherModal({int initialTab = 0}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        Map<String, dynamic>? tempShop = _selectedShopVoucher;
        Map<String, dynamic>? tempPlatform = _selectedPlatformVoucher;

        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return DefaultTabController(
              length: 2,
              initialIndex: initialTab,
              child: Container(
                height: MediaQuery.of(context).size.height * 0.75,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    // Handle bar
                    Container(
                      margin: const EdgeInsets.only(top: 10, bottom: 6),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    // Header
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Kho Voucher Khách Hàng',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1B3A20),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => Navigator.pop(ctx),
                          ),
                        ],
                      ),
                    ),
                    // Tabs
                    TabBar(
                      labelColor: const Color(0xFF2E7D32),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: const Color(0xFF2E7D32),
                      indicatorWeight: 3,
                      tabs: [
                        Tab(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.storefront_outlined, size: 18),
                              const SizedBox(width: 6),
                              Text('Voucher Shop (${_shopVouchers.length})'),
                            ],
                          ),
                        ),
                        Tab(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.confirmation_num_outlined,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'LÀNH Voucher (${_platformVouchers.length})',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 1),
                    // Tab views
                    Expanded(
                      child: TabBarView(
                        children: [
                          // Tab 1: Voucher của Shop
                          _buildVoucherList(
                            vouchers: _shopVouchers,
                            selectedVoucher: tempShop,
                            isShopTab: true,
                            onSelect: (v) {
                              setModalState(() {
                                if (tempShop?['voucherId'] == v['voucherId']) {
                                  tempShop = null; // Bỏ chọn
                                } else {
                                  tempShop = Map<String, dynamic>.from(v);
                                }
                              });
                            },
                          ),
                          // Tab 2: LÀNH Voucher
                          _buildVoucherList(
                            vouchers: _platformVouchers,
                            selectedVoucher: tempPlatform,
                            isShopTab: false,
                            onSelect: (v) {
                              setModalState(() {
                                if (tempPlatform?['voucherId'] ==
                                    v['voucherId']) {
                                  tempPlatform = null; // Bỏ chọn
                                } else {
                                  tempPlatform = Map<String, dynamic>.from(v);
                                }
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                    // Footer Apply Button
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.06),
                            blurRadius: 8,
                            offset: const Offset(0, -3),
                          ),
                        ],
                      ),
                      child: SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _selectedShopVoucher = tempShop;
                              _selectedPlatformVoucher = tempPlatform;
                            });
                            Navigator.pop(ctx);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF2E7D32),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Áp dụng',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildVoucherList({
    required List<dynamic> vouchers,
    required Map<String, dynamic>? selectedVoucher,
    required bool isShopTab,
    required Function(Map<String, dynamic>) onSelect,
  }) {
    if (_isLoadingVouchers) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
      );
    }

    if (vouchers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isShopTab
                  ? Icons.storefront_outlined
                  : Icons.confirmation_num_outlined,
              size: 56,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 12),
            Text(
              isShopTab
                  ? 'Chưa có voucher của shop nào trong kho'
                  : 'Chưa có LÀNH voucher nào trong kho',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
            const SizedBox(height: 6),
            Text(
              'Hãy đổi điểm tích luỹ hoặc lưu thêm ưu đãi',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: vouchers.length,
      itemBuilder: (context, index) {
        final v = Map<String, dynamic>.from(vouchers[index]);
        final bool isValid = v['isValid'] == true;
        final bool isSelected = selectedVoucher?['voucherId'] == v['voucherId'];
        final num discountAmount = v['discountAmount'] ?? 0;
        final String code = (v['code'] ?? '').toString();
        final String title = (v['title'] ?? 'Ưu đãi').toString();
        final String expiryDate = (v['expiryDate'] ?? '').toString();
        final num minOrder = v['minOrderAmount'] ?? 0;
        final String? invalidReason = v['invalidReason']?.toString();

        final Color primaryColor = isShopTab
            ? Colors.orange
            : const Color(0xFF2E7D32);

        return Opacity(
          opacity: isValid ? 1.0 : 0.55,
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: isValid ? Colors.white : const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? primaryColor
                    : (isValid ? Colors.grey.shade300 : Colors.grey.shade200),
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isValid
                  ? [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: InkWell(
              onTap: isValid ? () => onSelect(v) : null,
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    // Icon cột trái
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        isShopTab ? Icons.storefront : Icons.local_shipping,
                        color: primaryColor,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Nội dung chi tiết
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: primaryColor.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  code,
                                  style: TextStyle(
                                    color: primaryColor,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Đơn tối thiểu: ${_formatCurrency(minOrder)}',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          Text(
                            'HSD: $expiryDate',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade500,
                            ),
                          ),
                          if (isValid && discountAmount > 0)
                            Padding(
                              padding: const EdgeInsets.only(top: 3),
                              child: Text(
                                'Giảm: -${_formatCurrency(discountAmount)}',
                                style: const TextStyle(
                                  color: Color(0xFF166534),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          if (!isValid && invalidReason != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 3),
                              child: Text(
                                invalidReason,
                                style: const TextStyle(
                                  color: Color(0xFFDC2626),
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Checkbox / Radio
                    if (isValid)
                      IconButton(
                        onPressed: () => onSelect(v),
                        icon: Icon(
                          isSelected
                              ? Icons.check_circle
                              : Icons.radio_button_unchecked,
                          color: isSelected
                              ? primaryColor
                              : Colors.grey.shade400,
                          size: 24,
                        ),
                      )
                    else
                      Icon(Icons.block, color: Colors.grey.shade400, size: 20),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildFrame({
    required String title,
    required Widget child,
    Widget? trailing,
  }) {
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
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Color(0xFF1B3A20),
                ),
              ),
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
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
        ),
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
                child: const Text(
                  'Thay đổi',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              child: _selectedAddress == null
                  ? const Text(
                      'Chưa có địa chỉ. Vui lòng thêm địa chỉ.',
                      style: TextStyle(color: Colors.red),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_selectedAddress!['receiverName'] ?? 'Người nhận'} | ${_selectedAddress!['phone'] ?? ''}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${_selectedAddress!['addressDetail']}, ${_selectedAddress!['ward']}, ${_selectedAddress!['district']}, ${_selectedAddress!['province']}',
                          style: const TextStyle(color: Color(0xFF4B5D50)),
                        ),
                      ],
                    ),
            ),

            // Khung 2: Sản phẩm, Voucher shop, Lời nhắn
            _buildFrame(
              title: 'Thông tin sản phẩm',
              child: Column(
                children: [
                  ...widget.cartItems.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              width: 50,
                              height: 50,
                              color: item.product.color.withOpacity(0.1),
                              child:
                                  (item.product.imageUrl != null &&
                                      item.product.imageUrl!.isNotEmpty)
                                  ? Image.network(
                                      ApiService.fixImageUrl(
                                        item.product.imageUrl,
                                      ),
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              Center(
                                                child: Icon(
                                                  item.product.icon,
                                                  color: item.product.color,
                                                ),
                                              ),
                                    )
                                  : Center(
                                      child: Icon(
                                        item.product.icon,
                                        color: item.product.color,
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
                                  item.product.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Số lượng: ${item.qty}',
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${(item.product.price * item.qty).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Divider(color: Color(0xFFE1EAE0)),
                  // Voucher của Shop
                  InkWell(
                    onTap: () => _openVoucherModal(initialTab: 0),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(
                                Icons.storefront_outlined,
                                color: Colors.orange,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Voucher của Shop',
                                style: TextStyle(fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                          _selectedShopVoucher != null
                              ? Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF7ED),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: Colors.orange.shade300,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        '${_selectedShopVoucher!['code']} (-${_formatCurrency(_shopDiscount)})',
                                        style: const TextStyle(
                                          color: Colors.orange,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12.5,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      InkWell(
                                        onTap: () => setState(
                                          () => _selectedShopVoucher = null,
                                        ),
                                        child: const Icon(
                                          Icons.close,
                                          size: 15,
                                          color: Colors.orange,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : Row(
                                  children: [
                                    Text(
                                      _shopVouchers.isNotEmpty
                                          ? 'Chọn voucher (${_shopVouchers.length})'
                                          : 'Chưa có mã',
                                      style: TextStyle(
                                        color: _shopVouchers.isNotEmpty
                                            ? Colors.orange
                                            : Colors.grey,
                                        fontSize: 13,
                                        fontWeight: _shopVouchers.isNotEmpty
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                      ),
                                    ),
                                    const Icon(
                                      Icons.chevron_right,
                                      size: 18,
                                      color: Colors.grey,
                                    ),
                                  ],
                                ),
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
                    onChanged: (val) {
                      setState(() => _shippingMethod = val!);
                      _fetchCheckoutVouchers();
                    },
                  ),
                  RadioListTile<String>(
                    title: const Text('Giao hàng Hoả Tốc'),
                    subtitle: const Text('50.000đ - Nhận hàng trong 2 giờ'),
                    value: 'HoaToc',
                    groupValue: _shippingMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) {
                      setState(() => _shippingMethod = val!);
                      _fetchCheckoutVouchers();
                    },
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: Colors.orange,
                          size: 16,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Đồng kiểm khi nhận hàng',
                          style: TextStyle(
                            color: Colors.orange,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Khung 4: Voucher App (LÀNH Voucher)
            _buildFrame(
              title: 'LÀNH Voucher',
              child: InkWell(
                onTap: () => _openVoucherModal(initialTab: 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(
                            Icons.confirmation_num_outlined,
                            color: Color(0xFF2E7D32),
                            size: 20,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Ưu đãi từ sàn LÀNH',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      _selectedPlatformVoucher != null
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDF4),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: const Color(0xFF86EFAC),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${_selectedPlatformVoucher!['code']} (-${_formatCurrency(_platformDiscount)})',
                                    style: const TextStyle(
                                      color: Color(0xFF166534),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12.5,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  InkWell(
                                    onTap: () => setState(
                                      () => _selectedPlatformVoucher = null,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      size: 15,
                                      color: Color(0xFF166534),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : Row(
                              children: [
                                Text(
                                  _platformVouchers.isNotEmpty
                                      ? 'Chọn mã (${_platformVouchers.length})'
                                      : 'Chưa có mã',
                                  style: TextStyle(
                                    color: _platformVouchers.isNotEmpty
                                        ? const Color(0xFF2E7D32)
                                        : Colors.grey,
                                    fontSize: 13,
                                    fontWeight: _platformVouchers.isNotEmpty
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                  ),
                                ),
                                const Icon(
                                  Icons.chevron_right,
                                  size: 18,
                                  color: Colors.grey,
                                ),
                              ],
                            ),
                    ],
                  ),
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
                    title: const Text('Thanh toán qua QR Code (VietQR 24/7)'),
                    value: 'QRCode',
                    groupValue: _paymentMethod,
                    activeColor: const Color(0xFF2E7D32),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _paymentMethod = val!),
                  ),
                  RadioListTile<String>(
                    title: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFA50064),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'MoMo',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text('Thanh toán qua Ví MoMo'),
                      ],
                    ),
                    value: 'MoMo',
                    groupValue: _paymentMethod,
                    activeColor: const Color(0xFFA50064),
                    contentPadding: EdgeInsets.zero,
                    onChanged: (val) => setState(() => _paymentMethod = val!),
                  ),
                ],
              ),
            ),

            // Khung 6: Tóm tắt chi phí thanh toán
            _buildFrame(
              title: 'Chi tiết thanh toán',
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng tiền hàng',
                        style: TextStyle(color: Color(0xFF4B5D50)),
                      ),
                      Text(_formatCurrency(_subTotal)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Phí vận chuyển',
                        style: TextStyle(color: Color(0xFF4B5D50)),
                      ),
                      Text(_formatCurrency(_shippingFee)),
                    ],
                  ),
                  if (_shopDiscount > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.storefront,
                              color: Colors.orange,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Voucher Shop (${_selectedShopVoucher!['code']})',
                              style: const TextStyle(color: Colors.orange),
                            ),
                          ],
                        ),
                        Text(
                          '-${_formatCurrency(_shopDiscount)}',
                          style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (_platformDiscount > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.local_shipping,
                              color: Color(0xFF166534),
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'LÀNH Voucher (${_selectedPlatformVoucher!['code']})',
                              style: const TextStyle(color: Color(0xFF166534)),
                            ),
                          ],
                        ),
                        Text(
                          '-${_formatCurrency(_platformDiscount)}',
                          style: const TextStyle(
                            color: Color(0xFF166534),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                  const Divider(color: Color(0xFFE1EAE0), height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng thanh toán',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: Color(0xFF1B3A20),
                        ),
                      ),
                      Text(
                        _formatCurrency(_totalAmount),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                          color: Color(0xFF2E7D32),
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
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tổng thanh toán',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  Text(
                    _formatCurrency(_totalAmount),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Color(0xFF2E7D32),
                    ),
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 14,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Đặt hàng',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
