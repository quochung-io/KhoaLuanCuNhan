// ============================================================================
// TỆP MÃ NGUỒN: mobile-app/lib/presentation/screens/profile/points_screen.dart
// MÔ TẢ: Màn hình giao diện di động (points_screen.dart) thuộc ứng dụng Flutter LÀNH Farm Mobile App.
// ============================================================================
import 'package:flutter/material.dart';
import '../../../data/api_service.dart';
import '../../../core/localization_service.dart';

/// Lớp giao diện / trạng thái PointsScreen
class PointsScreen extends StatefulWidget {
  final int userId;
  const PointsScreen({super.key, required this.userId});

  @override
  State<PointsScreen> createState() => _PointsScreenState();
}

/// Lớp giao diện / trạng thái _PointsScreenState
class _PointsScreenState extends State<PointsScreen> {
  int _currentPoints = 0;
  String _tierName = 'Mới';
  double _totalSpentYear = 0;
  List<dynamic> _tiers = [];
  List<dynamic> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLoyalty();
  }

  // Thực thi nghiệp vụ hàm _loadLoyalty
  Future<void> _loadLoyalty() async {
    try {
      final data = await ApiService.getUserLoyalty(widget.userId);
      if (mounted && data != null) {
        setState(() {
          _currentPoints = data['currentPoints'] ?? 0;
          _tierName = data['tier'] ?? 'Mới';
          _totalSpentYear = (data['totalSpentYear'] as num?)?.toDouble() ?? 0.0;
          _tiers = (data['tiers'] as List<dynamic>?) ?? [];
          _history = (data['history'] as List<dynamic>?) ?? [];
          _isLoading = false;
        });
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getTierIcon(String tier) {
    if (tier.contains('Bạc')) return '🥈';
    if (tier.contains('Vàng')) return '🥇';
    if (tier.contains('Kim Cương')) return '💎';
    return '🌱';
  }

  LinearGradient _getTierGradient(String tier) {
    if (tier.contains('Kim Cương')) {
      return const LinearGradient(
        colors: [Color(0xFF0052D4), Color(0xFF4364F7), Color(0xFF6FB1FC)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (tier.contains('Vàng')) {
      return const LinearGradient(
        colors: [Color(0xFFF7971E), Color(0xFFFFD200)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (tier.contains('Bạc')) {
      return const LinearGradient(
        colors: [Color(0xFF757F9A), Color(0xFFD7DDE8)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    return const LinearGradient(
      colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          isEn ? 'Points & Membership' : 'Điểm Thưởng & Hạng Thành Viên',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Thẻ thành viên VIP
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: _getTierGradient(_tierName),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'THẺ THÀNH VIÊN LÀNH',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.8),
                                fontSize: 11,
                                letterSpacing: 1.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    _getTierIcon(_tierName),
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    _tierName,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Điểm khả dụng',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              _currentPoints.toString().replaceAllMapped(
                                RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
                                (Match m) => '${m[1]}.',
                              ),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'L-Points',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Chi tiêu năm: ${_totalSpentYear.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}đ',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const Text(
                                'Tích lũy tự động khi nhận hàng',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 2. Đặc quyền các hạng thành viên
                  const Text(
                    'ĐẶC QUYỀN HẠNG THÀNH VIÊN',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8D9E90),
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 12),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildTierBenefitCard(
                          '🌱 Hạng Mới',
                          'Chi tiêu: 0đ',
                          'Tích 1% điểm cho mọi đơn hàng nông sản VietGAP.',
                        ),
                        _buildTierBenefitCard(
                          '🥈 Hạng Bạc',
                          'Chi tiêu: 2.000.000đ',
                          'Tích 1.5% điểm, tặng 1 mã Freeship mỗi tháng.',
                        ),
                        _buildTierBenefitCard(
                          '🥇 Hạng Vàng',
                          'Chi tiêu: 5.000.000đ',
                          'Tích 2% điểm, 3 mã Freeship/tháng & quà sinh nhật.',
                        ),
                        _buildTierBenefitCard(
                          '💎 Kim Cương',
                          'Chi tiêu: 10.000.000đ',
                          'Tích 3% điểm, miễn phí giao trọn đời, tài trợ cây giống.',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 3. Lịch sử điểm thưởng
                  const Text(
                    'LỊCH SỬ BIẾN ĐỘNG ĐIỂM',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF8D9E90),
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (_history.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(
                        'Chưa có lịch sử giao dịch điểm',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 13,
                        ),
                      ),
                    )
                  else
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE1EAE0)),
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _history.length,
                        separatorBuilder: (ctx, i) =>
                            const Divider(height: 1, color: Color(0xFFF0F4F0)),
                        itemBuilder: (context, index) {
                          final item = _history[index];
                          final points =
                              (item['pointsDelta'] as num?)?.toInt() ?? 0;
                          final desc = item['description'] ?? 'Biến động điểm';
                          final date = (item['createdAt'] ?? '')
                              .toString()
                              .split('T')
                              .first;
                          final isPlus = points >= 0;

                          return ListTile(
                            leading: CircleAvatar(
                              radius: 18,
                              backgroundColor: isPlus
                                  ? const Color(0xFFE8F5E9)
                                  : const Color(0xFFFFEBEE),
                              child: Icon(
                                isPlus ? Icons.add : Icons.remove,
                                color: isPlus
                                    ? const Color(0xFF2E7D32)
                                    : Colors.red,
                                size: 18,
                              ),
                            ),
                            title: Text(
                              desc,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Text(
                              date,
                              style: const TextStyle(
                                fontSize: 11,
                                color: Colors.grey,
                              ),
                            ),
                            trailing: Text(
                              '${isPlus ? "+" : ""}$points L',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: isPlus
                                    ? const Color(0xFF2E7D32)
                                    : Colors.red,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  // Thực thi nghiệp vụ hàm _buildTierBenefitCard
  Widget _buildTierBenefitCard(String title, String condition, String desc) {
    return Container(
      width: 170,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE1EAE0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: Color(0xFF1B3A20),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            condition,
            style: const TextStyle(
              fontSize: 10.5,
              color: Color(0xFF2E7D32),
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            desc,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade700,
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}
