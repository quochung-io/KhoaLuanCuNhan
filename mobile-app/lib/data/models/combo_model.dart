class SelectableProduceItem {
  final int id;
  final String name;
  final String weight;
  final String region;
  final String category;
  final String benefit;
  final String imageUrl;

  const SelectableProduceItem({
    required this.id,
    required this.name,
    required this.weight,
    required this.region,
    required this.category,
    required this.benefit,
    required this.imageUrl,
  });
}

class ComboPlan {
  final int id;
  final String name;
  final String desc;
  final String price;
  final double rawPrice;
  final String? badge;
  final int supplierId;
  final String supplierName;
  final List<String> features;
  final List<String> sampleItems;
  final String imageUrl;
  final String type; // 'combotuan' | 'combothang' | 'combokhac'
  final int maxSelectableItems;

  const ComboPlan({
    required this.id,
    required this.name,
    required this.desc,
    required this.price,
    required this.rawPrice,
    this.badge,
    required this.supplierId,
    required this.supplierName,
    required this.features,
    required this.sampleItems,
    required this.imageUrl,
    required this.type,
    this.maxSelectableItems = 4,
  });

  static List<SelectableProduceItem> getProducePool() {
    return getProducePoolBySupplier(1);
  }

  static List<SelectableProduceItem> getProducePoolBySupplier(int supplierId) {
    if (supplierId == 2) {
      // Hợp tác xã Rau Sạch Miền Tây (Đồng Tháp)
      return const [
        SelectableProduceItem(
          id: 201,
          name: 'Rau mồng tơi vườn phù sa',
          weight: '500g',
          region: 'HTX Rau Miền Tây',
          category: 'Rau ăn lá',
          benefit: 'Nhuận tràng, thanh nhiệt, giàu chất nhầy tự nhiên',
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 202,
          name: 'Rau ngót Nhật sạch non mướt',
          weight: '400g',
          region: 'HTX Rau Miền Tây',
          category: 'Rau ăn lá',
          benefit: 'Lành tính, giàu đạm thực vật và canxi tốt cho mẹ & bé',
          imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 203,
          name: 'Mướp hương đồng quê',
          weight: '2 quả (~700g)',
          region: 'HTX Rau Miền Tây',
          category: 'Củ quả',
          benefit: 'Vị ngọt thanh dịu mát, giải nhiệt mùa hè hiệu quả',
          imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 204,
          name: 'Bầu sao non Miền Tây',
          weight: '1 quả (~900g)',
          region: 'HTX Rau Miền Tây',
          category: 'Củ quả',
          benefit: 'Thịt bầu mềm ngọt, nấu canh tôm đồng hoặc luộc chấm kho quẹt',
          imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 205,
          name: 'Đậu bắp baby xanh giòn',
          weight: '500g',
          region: 'HTX Rau Miền Tây',
          category: 'Củ quả',
          benefit: 'Tốt cho khớp và dạ dày, ít calo giàu chất xơ',
          imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 206,
          name: 'Nấm rơm tươi quê búp tròn',
          weight: '350g',
          region: 'HTX Rau Miền Tây',
          category: 'Nấm sạch',
          benefit: 'Nấm rơm ủ rơm rạ tự nhiên, giòn béo giàu đạm',
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80',
        ),
      ];
    } else if (supplierId == 3) {
      // Hợp tác xã Trái Cây Việt (Nam Bộ)
      return const [
        SelectableProduceItem(
          id: 301,
          name: 'Bưởi da xanh ruột hồng Bến Tre',
          weight: '1 quả (~1.4kg)',
          region: 'HTX Trái Cây Việt',
          category: 'Trái cây đặc sản',
          benefit: 'Tép bưởi mọng ngọt thanh, tróc vỏ dễ dàng, giàu Vitamin C',
          imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 302,
          name: 'Cam sành Hàm Yên / Bến Tre',
          weight: '1.5 kg',
          region: 'HTX Trái Cây Việt',
          category: 'Trái cây đặc sản',
          benefit: 'Mọng nước ngọt đậm, tăng cường sức đề kháng tối đa',
          imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 303,
          name: 'Xoài cát Hòa Lộc Tiền Giang',
          weight: '1.0 kg',
          region: 'HTX Trái Cây Việt',
          category: 'Trái cây đặc sản',
          benefit: 'Thơm lừng, thịt xoài vàng óng mịn màng không xơ',
          imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 304,
          name: 'Dưa hấu không hạt Mặt Trời Đỏ',
          weight: '1 quả (~2.2kg)',
          region: 'HTX Trái Cây Việt',
          category: 'Trái cây đặc sản',
          benefit: 'Ruột đỏ au giòn ngọt, giải nhiệt tức thì trong ngày nóng',
          imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 305,
          name: 'Ổi nữ hoàng ruột trắng giòn',
          weight: '1.2 kg',
          region: 'HTX Trái Cây Việt',
          category: 'Trái cây đặc sản',
          benefit: 'Giòn xốp vị ngọt thanh, hàm lượng Vitamin C gấp 4 lần cam',
          imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80',
        ),
      ];
    } else if (supplierId == 4) {
      // HTX Nông Nghiệp An Phú (Mộc Châu)
      return const [
        SelectableProduceItem(
          id: 401,
          name: 'Bí đỏ hồ lô ăn dặm cho bé',
          weight: '1 quả (~800g)',
          region: 'HTX An Phú',
          category: 'Củ quả',
          benefit: 'Vị ngọt bùi béo tự nhiên, dễ nghiền mịn cho bé ăn dặm',
          imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 402,
          name: 'Cà rốt baby giòn ngọt Mộc Châu',
          weight: '500g',
          region: 'HTX An Phú',
          category: 'Củ quả',
          benefit: 'Giàu Beta-carotene và vitamin nhóm B giúp bé sáng mắt',
          imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 403,
          name: 'Dâu tây Mộc Châu giống Nhật',
          weight: '300g',
          region: 'HTX An Phú',
          category: 'Trái cây đặc sản',
          benefit: 'Chua ngọt hài hòa, thơm ngào ngạt, kích thích vị giác bé',
          imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop&q=80',
        ),
        SelectableProduceItem(
          id: 404,
          name: 'Khoai lang mật nướng dẻo',
          weight: '1.0 kg',
          region: 'HTX An Phú',
          category: 'Củ quả',
          benefit: 'Giàu chất xơ tốt cho hệ tiêu hóa còn non nớt của trẻ',
          imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80',
        ),
      ];
    }

    // Mặc định: Hợp tác xã Nông Sản Đà Lạt (ID 1)
    return const [
      SelectableProduceItem(
        id: 1,
        name: 'Cải bó xôi hữu cơ (Spinach)',
        weight: '350g',
        region: 'HTX Đà Lạt',
        category: 'Rau ăn lá',
        benefit: 'Giàu sắt, acid folic và chất chống oxy hóa tự nhiên',
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 2,
        name: 'Cà rốt baby giòn ngọt',
        weight: '500g',
        region: 'HTX Đà Lạt',
        category: 'Củ quả',
        benefit: 'Hàm lượng Beta-carotene dồi dào, tốt cho thị lực',
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 3,
        name: 'Xà lách xoăn thủy canh Frisee',
        weight: '300g',
        region: 'HTX Đà Lạt',
        category: 'Rau ăn lá',
        benefit: 'Tươi giòn mọng nước, lý tưởng cho món salad trộn',
        imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 4,
        name: 'Bí đỏ hồ lô hạt dẻ',
        weight: '1 quả (~800g)',
        region: 'HTX Đà Lạt',
        category: 'Củ quả',
        benefit: 'Vị ngọt bùi béo tự nhiên, bổ não và tăng đề kháng',
        imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 5,
        name: 'Súp lơ xanh bông lớn (Broccoli)',
        weight: '1 búp (~600g)',
        region: 'HTX Đà Lạt',
        category: 'Rau ăn lá',
        benefit: 'Chứa Sulforaphane kháng viêm và thanh lọc tế bào',
        imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 6,
        name: 'Cà chua bi Cherry đỏ mọng',
        weight: '400g',
        region: 'HTX Đà Lạt',
        category: 'Củ quả',
        benefit: 'Hàm lượng Lycopene cực cao, dưỡng da chống lão hóa',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 7,
        name: 'Bơ sáp 034 dẻo béo',
        weight: '1.0 kg',
        region: 'HTX Đà Lạt',
        category: 'Trái cây đặc sản',
        benefit: 'Chứa acid béo Omega-3 không bão hòa tốt cho tim mạch',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 8,
        name: 'Nấm đùi gà tươi hữu cơ',
        weight: '300g',
        region: 'HTX Đà Lạt',
        category: 'Nấm sạch',
        benefit: 'Giòn ngọt thơm lừng, bổ sung protein thực vật lành tính',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80',
      ),
      SelectableProduceItem(
        id: 9,
        name: 'Cải xoăn Kale hữu cơ',
        weight: '350g',
        region: 'HTX Đà Lạt',
        category: 'Rau ăn lá',
        benefit: 'Nữ hoàng rau xanh giàu Vitamin K, Canxi và Lutein',
        imageUrl: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=300&auto=format&fit=crop&q=80',
      ),
    ];
  }

  static List<ComboPlan> getSampleCombos() {
    return [
      // 🥗 1. COMBO TUẦN
      const ComboPlan(
        id: 901,
        name: 'Combo Gia Đình Nhỏ (Tuần)',
        desc: 'Phù hợp gia đình 2–3 người nấu ăn mỗi ngày. Nông sản tươi hái sớm trong ngày.',
        price: '189.000₫',
        rawPrice: 189000,
        badge: 'Phổ biến nhất',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        type: 'combotuan',
        maxSelectableItems: 6,
        features: [
          '4 loại rau ăn lá & củ quả theo mùa',
          '2 loại trái cây tươi thu hoạch trong ngày',
          'Giao 1 lần / tuần từ Thứ 2 đến Chủ Nhật',
          'Khách tự do chọn đổi nông sản cùng HTX',
        ],
        sampleItems: [
          'Cải bó xôi (350g)',
          'Cà rốt baby (500g)',
          'Xà lách xoăn (300g)',
          'Bí đỏ hồ lô (1 quả)',
          'Bơ sáp 034 (1kg)',
        ],
      ),
      const ComboPlan(
        id: 902,
        name: 'Combo Gia Đình Lớn (Tuần)',
        desc: 'Đáp ứng khẩu phần cho gia đình 4–6 thành viên. Đầy ắp rau xanh và trái cây chín cây.',
        price: '329.000₫',
        rawPrice: 329000,
        badge: 'Tiết kiệm 15%',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
        type: 'combotuan',
        maxSelectableItems: 10,
        features: [
          '7 loại rau xanh & củ quả hữu cơ',
          '3 loại trái cây VietGAP & GlobalGAP',
          'Tặng kèm 1 vỉ trứng gà ta thảo mộc',
          'Giao định kỳ tận bếp theo khung giờ hẹn',
        ],
        sampleItems: [
          'Cải ngọt hữu cơ (500g)',
          'Súp lơ xanh (1 búp)',
          'Cà chua bi (400g)',
          'Bơ sáp 034 (1kg)',
          'Khoai lang mật (1kg)',
          'Trứng gà ta thảo mộc',
        ],
      ),
      const ComboPlan(
        id: 903,
        name: 'Combo Thuần Chay Sạch (Tuần)',
        desc: 'Giàu đạm thực vật, vitamin & khoáng chất dưỡng sinh thanh lọc cơ thể.',
        price: '249.000₫',
        rawPrice: 249000,
        badge: 'Thuần chay Organic',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
        type: 'combotuan',
        maxSelectableItems: 8,
        features: [
          '6 loại rau củ & nấm tươi hữu cơ',
          '2 loại hạt dinh dưỡng / ngũ cốc đặc sản',
          'Đạt chuẩn hữu cơ 100% không hóa chất',
          'Kèm thực đơn gợi ý món chay ngon mỗi ngày',
        ],
        sampleItems: [
          'Nấm đùi gà tươi (300g)',
          'Cải xoăn Kale (350g)',
          'Bí đỏ hồ lô (1 quả)',
          'Cải bó xôi (350g)',
          'Hạt sen tươi Huế',
        ],
      ),

      // 📅 2. COMBO THÁNG (TIẾT KIỆM 18%)
      const ComboPlan(
        id: 904,
        name: 'Combo Gia Đình Nhỏ (Gói Tháng)',
        desc: 'Giao 4 đợt / tháng (mỗi tuần 1 giỏ tươi mới) — Tiết kiệm chi phí và thời gian đi chợ.',
        price: '680.000₫',
        rawPrice: 680000,
        badge: 'Tiết kiệm 10%',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        type: 'combothang',
        maxSelectableItems: 6,
        features: [
          'Giao 4 lần / tháng (mỗi tuần 1 giỏ tươi ngon)',
          'Tổng cộng 16 phần rau + 8 phần trái cây',
          'Linh hoạt đổi ngày giao khi bận công tác',
          'Freeship toàn bộ 4 lượt giao tận bếp',
        ],
        sampleItems: [
          'Thực đơn luân phiên 4 tuần không trùng lặp',
          'Tự do chọn các loại rau yêu thích',
        ],
      ),
      const ComboPlan(
        id: 905,
        name: 'Combo Gia Đình Lớn (Gói Tháng)',
        desc: 'Chăm sóc sức khỏe cả nhà trọn vẹn cả tháng với nông sản chuẩn xuất khẩu thượng hạng.',
        price: '1.180.000₫',
        rawPrice: 1180000,
        badge: 'Tiết kiệm 18%',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
        type: 'combothang',
        maxSelectableItems: 10,
        features: [
          'Giao 4 lần / tháng đầy ắp nông sản cao cấp',
          'Tổng cộng 28 phần rau + 12 phần trái cây + 4 vỉ trứng',
          'Ưu tiên giữ các mặt hàng đặc sản vụ mùa hiếm',
          'Miễn phí 100% chi phí vận chuyển 4 tuần',
        ],
        sampleItems: [
          'Giao xe lạnh tận cửa vào khung giờ bạn chọn',
          'Quét mã QR truy xuất từng mẻ thu hoạch',
        ],
      ),
      const ComboPlan(
        id: 906,
        name: 'Combo Thuần Chay Sạch (Gói Tháng)',
        desc: 'Thanh lọc cơ thể, dinh dưỡng bền vững với đa dạng nấm hữu cơ và đậu hạt cao cấp.',
        price: '895.000₫',
        rawPrice: 895000,
        badge: 'Tiết kiệm 12%',
        supplierId: 1,
        supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
        type: 'combothang',
        maxSelectableItems: 8,
        features: [
          'Giao 4 lần / tháng, rau củ nấm tươi mới hái',
          'Tặng kèm 1 hũ mật ong hoa rừng nguyên chất',
          'Cung cấp đủ dưỡng chất cho người ăn thực dưỡng',
          'Được chuyên gia tư vấn dinh dưỡng định kỳ',
        ],
        sampleItems: [
          'Đa dạng nấm sạch và đậu đỗ hữu cơ',
          'Rau củ giàu sắt và chất xơ hòa tan',
        ],
      ),

      // ✨ 3. COMBO KHÁC (CHƯƠNG TRÌNH & ĐẶC SẢN HTX)
      const ComboPlan(
        id: 907,
        name: 'Combo Ăn Dặm Hữu Cơ Bé Yêu',
        desc: 'Nông sản công nghệ cao GlobalGAP chọn lọc độ tuổi ăn dặm từ HTX An Phú.',
        price: '195.000₫',
        rawPrice: 195000,
        badge: 'Chương trình HTX',
        supplierId: 4,
        supplierName: 'HTX Nông Nghiệp An Phú',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        type: 'combokhac',
        maxSelectableItems: 4,
        features: [
          '100% nông sản canh tác nhà màng không phun hóa chất',
          'Củ quả ngọt tự nhiên, dễ nghiền mịn và hấp chín',
          'Chứng nhận GlobalGAP kiểm nghiệm nitrat an toàn cho bé',
          'Giao hỏa tốc buổi sáng sớm',
        ],
        sampleItems: [
          'Bí đỏ ăn dặm (800g)',
          'Cà rốt ngọt baby (500g)',
          'Dâu tây Mộc Châu (300g)',
          'Khoai lang mật (1kg)',
        ],
      ),
      const ComboPlan(
        id: 908,
        name: 'Combo Trái Cây Miệt Vườn Nam Bộ',
        desc: 'Tuyển chọn trái cây nhiệt đới chín cây thơm ngọt từ HTX Trái Cây Việt.',
        price: '275.000₫',
        rawPrice: 275000,
        badge: 'Đặc sản chín cây',
        supplierId: 3,
        supplierName: 'Hợp tác xã Trái Cây Việt',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
        type: 'combokhac',
        maxSelectableItems: 5,
        features: [
          'Bưởi da xanh ruột hồng Bến Tre chuẩn xuất khẩu',
          'Xoài cát Hòa Lộc Tiền Giang thơm lừng',
          'Cam sành mọng nước tăng đề kháng',
          'Hái đúng độ chín cây, không ủ đất đèn hóa chất',
        ],
        sampleItems: [
          'Bưởi da xanh (1.4kg)',
          'Cam sành (1.5kg)',
          'Xoài cát Hòa Lộc (1kg)',
          'Dưa hấu không hạt (2kg)',
        ],
      ),
    ];
  }
}
