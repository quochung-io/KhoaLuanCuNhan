import 'package:flutter/material.dart';

class Product {
  final int id;
  final String name;
  final int price;
  final String unit;
  final String category; // 'Rau củ', 'Trái cây', 'Thực phẩm'
  final String cert;
  final String region;
  final double rating;
  final int reviews;
  final IconData icon;
  final Color color;
  final String lot;
  final String description;
  final List<String> reviewList;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    this.category = 'Rau củ',
    required this.cert,
    required this.region,
    required this.rating,
    required this.reviews,
    required this.icon,
    required this.color,
    required this.lot,
    required this.description,
    this.reviewList = const [
      'Sản phẩm rất tươi ngon, giao hàng đúng hẹn!',
      'Chuẩn VietGAP, bao bì đóng gói sạch sẽ.',
      'Sẽ tiếp tục ủng hộ nông sản LÀNH!'
    ],
  });
}

final List<Product> productsData = [
  Product(
    id: 1,
    name: 'Cải bó xôi hữu cơ',
    price: 28000,
    unit: '300g',
    category: 'Rau củ',
    cert: 'VietGAP',
    region: 'Đà Lạt',
    rating: 4.8,
    reviews: 212,
    icon: Icons.eco_outlined,
    color: const Color(0xFF2E7D32),
    lot: 'LOT#VN-DL-0842',
    description: 'Rau cải bó xôi được canh tác hữu cơ hoàn toàn tại nông trại Đà Lạt, giàu sắt và chất xơ, không sử dụng thuốc trừ sâu hóa học.',
    reviewList: [
      'Rau cải bó xôi rất non và ngọt, nấu canh ngon tuyệt!',
      'Giao nhanh trong 2h, rau vẫn còn tươi nguyên sương.'
    ],
  ),
  Product(
    id: 2,
    name: 'Cà rốt baby Đà Lạt',
    price: 32000,
    unit: '500g',
    category: 'Rau củ',
    cert: 'GlobalGAP',
    region: 'Đà Lạt',
    rating: 4.9,
    reviews: 184,
    icon: Icons.agriculture_outlined,
    color: const Color(0xFFFF9800),
    lot: 'LOT#VN-DL-0917',
    description: 'Cà rốt baby giòn ngọt, thu hoạch non tại vườn hữu cơ, thích hợp ăn sống, làm nước ép hoặc chế biến thức ăn cho bé.',
    reviewList: [
      'Cà rốt giòn và ngọt đậm đà, ép nước uống rất thơm.',
      'Bé nhà mình rất thích ăn sống loại này.'
    ],
  ),
  Product(
    id: 3,
    name: 'Cam Cao Phong',
    price: 45000,
    unit: 'kg',
    category: 'Trái cây',
    cert: 'VietGAP',
    region: 'Mộc Châu',
    rating: 4.7,
    reviews: 301,
    icon: Icons.spa_outlined,
    color: const Color(0xFFFF9800),
    lot: 'LOT#VN-MC-1140',
    description: 'Cam vỏ mỏng, mọng nước, vị ngọt thanh tự nhiên được trồng theo chuẩn VietGAP tại thung lũng Cao Phong.',
    reviewList: [
      'Cam mọng nước, vắt nước cho cả nhà uống giải nhiệt rất tốt.',
      'Vỏ mỏng, tép cam vàng óng tự nhiên.'
    ],
  ),
  Product(
    id: 4,
    name: 'Trứng gà ta thả vườn',
    price: 52000,
    unit: 'hộp 10 quả',
    category: 'Thực phẩm',
    cert: 'USDA Organic',
    region: 'Đồng Tháp',
    rating: 5.0,
    reviews: 96,
    icon: Icons.egg_outlined,
    color: const Color(0xFFC0392B),
    lot: 'LOT#VN-DT-0663',
    description: 'Trứng từ giống gà ta thả vườn tự nhiên, ăn ngũ cốc hữu cơ, lòng đỏ sậm màu, béo thơm và giàu dinh dưỡng.',
    reviewList: [
      'Lòng đỏ rất to và thơm, trứng mới thu hoạch trong ngày!',
      'Đóng khay chống sốc rất cẩn thận, không vỡ quả nào.'
    ],
  ),
  Product(
    id: 5,
    name: 'Mật ong rừng nguyên chất',
    price: 135000,
    unit: '500ml',
    category: 'Thực phẩm',
    cert: 'USDA Organic',
    region: 'Mộc Châu',
    rating: 4.9,
    reviews: 158,
    icon: Icons.filter_vintage_outlined,
    color: const Color(0xFFD4AC0D),
    lot: 'LOT#VN-MC-0255',
    description: 'Mật ong rừng khai thác tự nhiên tại các vùng hoa hoang dã Mộc Châu, không pha tạp, vị ngọt đậm đà tinh khiết.',
    reviewList: [
      'Mật ong đặc quánh, thơm mùi hoa rừng tự nhiên.',
      'Dùng pha nước ấm uống mỗi sáng rất tốt cho tiêu hóa.'
    ],
  ),
  Product(
    id: 6,
    name: 'Dâu tây Mộc Châu',
    price: 68000,
    unit: 'hộp 250g',
    category: 'Trái cây',
    cert: 'GlobalGAP',
    region: 'Mộc Châu',
    rating: 4.8,
    reviews: 243,
    icon: Icons.favorite_border_rounded,
    color: const Color(0xFFC0392B),
    lot: 'LOT#VN-MC-0389',
    description: 'Dâu tây chín mọng đỏ, chua ngọt hài hòa, canh tác nhà màng ứng dụng công nghệ tưới tiêu nhỏ giọt đạt chuẩn GlobalGAP.',
    reviewList: [
      'Dâu tây ngọt thơm, không bị dập nát khi giao hàng.',
      'Giá hợp lý cho chất lượng chuẩn GlobalGAP.'
    ],
  ),
];
