// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/voucher_wallet_screen.dart
// MÔ TẢ: Màn hình giao diện di động (voucher_wallet_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../data/api_service.dart';
import '../../../core/localization_service.dart';

/// Lớp giao diện / trạng thái VoucherWalletScreen
class VoucherWalletScreen extends StatefulWidget {
  final int userId;
  const VoucherWalletScreen({super.key, required this.userId});

  @override
  State<VoucherWalletScreen> createState() => _VoucherWalletScreenState();
}

/// Lớp giao diện / trạng thái _VoucherWalletScreenState
class _VoucherWalletScreenState extends State<VoucherWalletScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _vouchers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadVouchers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // Thực thi nghiệp vụ hàm _loadVouchers
  Future<void> _loadVouchers() async {
    try {
      final loyaltyData = await ApiService.getUserLoyalty(widget.userId);
      if (mounted) {
        setState(() {
          _vouchers = (loyaltyData?['vouchers'] as List<dynamic>?) ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<dynamic> get _activeVouchers =>
      _vouchers.where((v) => v['isUsed'] != true).toList();
  List<dynamic> get _usedVouchers =>
      _vouchers.where((v) => v['isUsed'] == true).toList();

  // Thực thi nghiệp vụ hàm _copyVoucherCode
  void _copyVoucherCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã sao chép mã "$code" vào bộ nhớ tạm'),
        backgroundColor: const Color(0xFF2E7D32),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          isEn ? 'Voucher Wallet' : 'Kho Voucher Của Bạn',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF2E7D32),
          unselectedLabelColor: Colors.grey,
          indicatorColor: const Color(0xFF2E7D32),
          indicatorWeight: 3,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
          tabs: [
            Tab(
              text:
                  '${isEn ? "Available" : "Khả dụng"} (${_activeVouchers.length})',
            ),
            Tab(
              text:
                  '${isEn ? "Used / Expired" : "Đã dùng / Hết hạn"} (${_usedVouchers.length})',
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : TabBarView(
              controller: _tabController,
              children: [
                _buildVoucherList(_activeVouchers, isActive: true),
                _buildVoucherList(_usedVouchers, isActive: false),
              ],
            ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildVoucherList
  Widget _buildVoucherList(List<dynamic> list, {required bool isActive}) {
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.confirmation_number_outlined,
              size: 72,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 12),
            Text(
              isActive
                  ? 'Chưa có voucher khả dụng'
                  : 'Không có voucher đã dùng',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final v = list[index];
        final code = v['code'] ?? 'LANH';
        final title = v['title'] ?? 'Mã ưu đãi';
        final discountValue = (v['discountValue'] as num?)?.toInt() ?? 0;
        final minOrder = (v['minOrderAmount'] as num?)?.toInt() ?? 0;
        final expiry = (v['expiryDate'] ?? '').toString().split('T').first;

        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isActive ? const Color(0xFFE1EAE0) : Colors.grey.shade300,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Cột bên trái: Icon và Giá trị
              Container(
                width: 100,
                padding: const EdgeInsets.symmetric(
                  vertical: 20,
                  horizontal: 8,
                ),
                decoration: BoxDecoration(
                  color: isActive
                      ? const Color(0xFFE8F5E9)
                      : Colors.grey.shade200,
                  borderRadius: const BorderRadius.horizontal(
                    left: Radius.circular(13),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      v['voucherType'] == 'ship'
                          ? Icons.local_shipping_outlined
                          : Icons.card_giftcard,
                      color: isActive ? const Color(0xFF2E7D32) : Colors.grey,
                      size: 28,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '-${discountValue ~/ 1000}k',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isActive ? const Color(0xFF2E7D32) : Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),

              // Cột bên phải: Nội dung chi tiết & Action
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: isActive
                                  ? const Color(0xFFF1F8E9)
                                  : Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: isActive
                                    ? const Color(0xFFAED581)
                                    : Colors.grey.shade400,
                              ),
                            ),
                            child: Text(
                              code,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isActive
                                    ? const Color(0xFF33691E)
                                    : Colors.grey,
                              ),
                            ),
                          ),
                          if (isActive)
                            InkWell(
                              onTap: () => _copyVoucherCode(code),
                              child: const Text(
                                'Sao chép',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.blue,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            )
                          else
                            const Text(
                              'Đã hết hạn',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isActive
                              ? const Color(0xFF1B3A20)
                              : Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Đơn tối thiểu: ${minOrder.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Hạn dùng: $expiry',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
