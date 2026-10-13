import 'package:flutter/material.dart';
import '../../../core/localization_service.dart';

class FarmingStandardsScreen extends StatelessWidget {
  const FarmingStandardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isEn = LocalizationService.instance.isEnglish;

    final standards = [
      {
        'icon': Icons.pest_control_outlined,
        'title': isEn ? '100% Chemical-Free Pest Control' : '100% Kiểm soát sâu bệnh sinh học',
        'desc': isEn
            ? 'Strictly zero chemical pesticides. Utilizing beneficial bio-predators, garlic-chili herbal sprays, and pheromone physical traps.'
            : 'Tuyệt đối không sử dụng thuốc trừ sâu hay hóa chất diệt cỏ. Sử dụng chế phẩm sinh học từ tỏi ớt, thiên địch bọ rùa và bẫy dính vật lý thân thiện môi trường.'
      },
      {
        'icon': Icons.water_drop_outlined,
        'title': isEn ? 'Clean Soil & Tested Spring Water' : 'Đất sạch & Nguồn nước kiểm định',
        'desc': isEn
            ? 'Soils are conditioned with microbial organic compost. Irrigation waters are tested every 6 months to ensure zero heavy metal or nitrate contamination.'
            : 'Đất trồng được luân canh ủ phân trùn quế và vi sinh bản địa. Nguồn nước ngầm hoặc nước suối tự nhiên được xét nghiệm định kỳ 6 tháng/lần, đảm bảo không nhiễm kim loại nặng.'
      },
      {
        'icon': Icons.sensors_outlined,
        'title': isEn ? 'IoT Farm Sensors & Cold-Chain' : 'Cảm biến IoT & Chuỗi lạnh bảo quản',
        'desc': isEn
            ? 'Micro-climate sensors monitor temperature and humidity 24/7. Harvested batches are vacuum-chilled within 2 hours to preserve fresh crispness.'
            : 'Hệ thống cảm biến IoT giám sát nhiệt ẩm, ánh sáng và EC đất 24/7. Sau khi hái, nông sản được sơ chế và làm mát trong chuỗi lạnh dưới 12°C trong vòng 2 giờ.'
      },
      {
        'icon': Icons.verified_user_outlined,
        'title': isEn ? 'Strict Traceability & Certification' : 'Minh bạch nguồn gốc từng lô thu hoạch',
        'desc': isEn
            ? 'Each delivery lot has a unique Batch Code linked to farm coordinates, harvest timeline, and lab pesticide residue inspection certificates.'
            : 'Mỗi gói rau củ đều có mã Lô (Batch ID) truy xuất được tọa độ nông trại, ngày thu hoạch, người chịu trách nhiệm và phiếu xét nghiệm dư lượng Nitrat trước khi xuất bán.'
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(isEn ? 'Eco-Farming Standards' : 'Tiêu Chuẩn Canh Tác Sinh Học', style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1B3A20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.eco, size: 40, color: Color(0xFF2E7D32)),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isEn ? 'PHILOSOPHY OF "PURE & FRESH"' : 'TRIẾT LÝ NÔNG SẢN "LÀNH"',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3A20), letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isEn
                        ? 'We partner directly with family farms and cooperatives committed to biological and regenerative agriculture, protecting both the consumer and Mother Nature.'
                        : 'LÀNH liên kết trực tiếp với các Hợp tác xã tâm huyết tại Đà Lạt, Mộc Châu và Miền Tây, cùng cam kết phụng sự sức khỏe người tiêu dùng bằng quy trình nông nghiệp sinh thái bền vững.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700, height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              '4 NGUYÊN TẮC CỐT LÕI TẠI NÔNG TRẠI LÀNH',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8D9E90), letterSpacing: 1.0),
            ),
            const SizedBox(height: 12),

            ...standards.map((s) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE1EAE0)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F8E9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(s['icon'] as IconData, color: const Color(0xFF2E7D32), size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s['title'] as String,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3A20)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          s['desc'] as String,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
