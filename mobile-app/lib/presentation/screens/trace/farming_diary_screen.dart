import 'package:flutter/material.dart';

class FarmingDiaryScreen extends StatelessWidget {
  final String lotCode;
  final String productName;
  final String farmName;

  const FarmingDiaryScreen({
    super.key,
    this.lotCode = 'LOT#VN-DL-0842',
    this.productName = 'Cải bó xôi hữu cơ (Spinach)',
    this.farmName = 'Hợp tác xã Nông Sản Đà Lạt (Lâm Đồng)',
  });

  @override
  Widget build(BuildContext context) {
    final stages = [
      {
        'stage': 'Chặng 1: Xử lý đất & Thổ nhưỡng sinh học',
        'date': '15/07/2026',
        'icon': Icons.landscape_outlined,
        'engineer': 'KS. Trần Văn Hùng (Viện Nông Nghiệp Tây Nguyên)',
        'details': 'Đo độ pH đất đạt 6.5 lý tưởng. Bón lót phân trùn quế ủ hoai mục và chế phẩm vi sinh bản địa IMO để kích hoạt hệ vi sinh vật có lợi.',
        'status': 'Đạt chuẩn hữu cơ',
        'image': 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 2: Gieo hạt & Ươm cây con',
        'date': '22/07/2026',
        'icon': Icons.grass_outlined,
        'engineer': 'KS. Nguyễn Thị Lan (Trưởng bộ phận Vườn ươm)',
        'details': 'Sử dụng hạt giống F1 thuần chủng đạt chuẩn Non-GMO (Không biến đổi gen). Ươm trên khay xơ dừa tiệt trùng hơi nước trong nhà màng.',
        'status': 'Tỷ lệ nảy mầm 98%',
        'image': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 3: Chăm sóc & Tưới tiêu tự động',
        'date': '05/08/2026',
        'icon': Icons.water_drop_outlined,
        'engineer': 'KS. Trần Văn Hùng',
        'details': 'Ứng dụng hệ thống tưới nhỏ giọt tự động công nghệ Israel. Bổ sung dinh dưỡng đạm cá thủy phân và dịch chuối ủ vi sinh định kỳ 5 ngày/lần.',
        'status': 'Tươi xanh, phát triển tối ưu',
        'image': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 4: Kiểm soát sâu bệnh bằng thiên địch',
        'date': '15/08/2026',
        'icon': Icons.bug_report_outlined,
        'engineer': 'Chuyên gia bảo vệ thực vật Lê Minh',
        'details': 'Triển khai bẫy Pheromone sinh học và thả bọ rùa thiên địch để kiểm soát sâu tơ tự nhiên. Cam kết 100% không dùng thuốc trừ sâu hóa học.',
        'status': 'Không hóa chất BVTV',
        'image': 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 5: Kiểm nghiệm Lab QC ISO/IEC 17025',
        'date': '22/08/2026',
        'icon': Icons.science_outlined,
        'engineer': 'Phòng Kiểm Nghiệm Độc Lập Quatest 3',
        'details': 'Lấy ngẫu nhiên 5 mẫu nông sản kiểm tra 392 chỉ tiêu dư lượng hóa chất, kim loại nặng (Chì, Cadimi) và vi khuẩn đường ruột (E.coli, Salmonella).',
        'status': 'Dư lượng = 0 ppm (Tuyệt đối an toàn)',
        'image': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 6: Thu hoạch & Đóng gói xe lạnh',
        'date': '24/08/2026',
        'icon': Icons.inventory_2_outlined,
        'engineer': 'Tổ Thu Hoạch HTX Nông Sản Đà Lạt',
        'details': 'Thu hoạch sớm lúc 05:30 sáng khi nhiệt độ mát và sương còn đọng. Sơ chế, cắt tỉa lá già và đóng hộp sinh học dập mã QR truy xuất từng mẻ.',
        'status': 'Đóng gói chuỗi lạnh 10°C',
        'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FA),
      appBar: AppBar(
        title: const Text('Nhật Ký Canh Tác Sinh Học', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Thẻ tóm tắt Lô nông sản
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF2E7D32).withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 3)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                        child: Text(lotCode, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFFFF9800), borderRadius: BorderRadius.circular(4)),
                        child: const Text('VIETGAP CERTIFIED', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    productName,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white70, size: 14),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(farmName, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Danh sách các chặng nhật ký canh tác
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: stages.map((st) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE5ECE5)),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Ảnh thực địa của chặng canh tác
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                          child: Image.network(
                            st['image'] as String,
                            height: 140,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              height: 140,
                              color: const Color(0xFFE8F5E9),
                              child: const Icon(Icons.eco, color: Color(0xFF2E7D32), size: 40),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: const BoxDecoration(color: Color(0xFFE8F5E9), shape: BoxShape.circle),
                                    child: Icon(st['icon'] as IconData, color: const Color(0xFF2E7D32), size: 18),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          st['stage'] as String,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF1B3A20)),
                                        ),
                                        Text('Ngày ghi nhận: ${st['date']}', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(
                                st['details'] as String,
                                style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700, height: 1.4),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: const Color(0xFFF7FBF7), borderRadius: BorderRadius.circular(8)),
                                child: Row(
                                  children: [
                                    const Icon(Icons.badge_outlined, size: 14, color: Color(0xFF2E7D32)),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        'Phụ trách: ${st['engineer']}',
                                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF2E7D32), fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.check_circle, size: 14, color: Color(0xFF4CAF50)),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Kết quả: ${st['status']}',
                                    style: const TextStyle(fontSize: 11.5, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
