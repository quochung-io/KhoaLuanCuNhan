'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ProductImage {
  productImageId: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

interface ProductDetail {
  productId: number;
  supplierId: number;
  categoryId: number;
  productName: string;
  description: string;
  price: number;
  unit: string;
  status: string;
  category?: Category;
  productImages?: ProductImage[];
}

interface BatchInfo {
  batchId: number;
  productId: number;
  batchCode: string;
  harvestDate: string;
  expiryDate: string;
  initialQuantity: number;
  unit: string;
  status: string;
}

interface CartItem {
  product: {
    id: number;
    name: string;
    price: string;
    unit: string;
    category: string;
    cert: string;
    region: string;
    rating: number;
    reviews: number;
    icon: string;
    lot: string;
    imageUrl?: string;
  };
  qty: number;
}

// Hàm phân tích vùng trồng theo tên sản phẩm
function getRegionByName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('mộc châu') || n.includes('bắc hà') || n.includes('sapa') || n.includes('tây bắc') || n.includes('hà giang') || n.includes('sơn la') || n.includes('điện biên')) {
    return 'Mộc Châu (Sơn La)';
  }
  if (n.includes('đồng tháp') || n.includes('bến tre') || n.includes('tiền giang') || n.includes('long an') || n.includes('cần thơ') || n.includes('vĩnh long') || n.includes('sóc trăng') || n.includes('an giang')) {
    return 'Đồng Tháp Mười (Miền Tây)';
  }
  if (n.includes('hưng yên') || n.includes('hải dương') || n.includes('bắc giang') || n.includes('hà nội') || n.includes('kinh môn')) {
    return 'Hưng Yên (Đồng bằng Bắc Bộ)';
  }
  if (n.includes('đắk lắk') || n.includes('buôn ma thuột') || n.includes('gia lai') || n.includes('kon tum')) {
    return 'Đắk Lắk (Tây Nguyên)';
  }
  if (n.includes('ninh thuận') || n.includes('bình thuận')) {
    return 'Ninh Thuận (Duyên hải Nam Trung Bộ)';
  }
  return 'Đà Lạt (Lâm Đồng)';
}

// Thông tin trang trại xuất xứ
function getFarmInfo(region: string) {
  if (region.includes('Mộc Châu')) {
    return {
      farmName: 'HTX Nông Nghiệp Sạch Cao Nguyên Mộc Châu',
      altitude: '1.050m so với mực nước biển',
      address: 'Xã Phiêng Luông, Huyện Mộc Châu, Tỉnh Sơn La',
      certCode: 'GLOBALGAP-MC-88291',
      soil: 'Đất mùn feralit đỏ vàng giàu vi lượng tự nhiên',
      water: 'Nguồn nước suối ngầm khe núi Mộc Châu tinh khiết'
    };
  }
  if (region.includes('Đồng Tháp')) {
    return {
      farmName: 'Nông Trại Sinh Thái Phù Sa Đồng Tháp Farm',
      altitude: 'Vùng trũng phù sa màu mỡ sông Tiền',
      address: 'Huyện Tháp Mười, Tỉnh Đồng Tháp',
      certCode: 'VIETGAP-DT-44102',
      soil: 'Đất phù sa bồi đắp hữu cơ tự nhiên mỗi năm',
      water: 'Nguồn nước tự nhiên lắng lọc hệ sinh thái sen & bèo'
    };
  }
  if (region.includes('Hưng Yên')) {
    return {
      farmName: 'Vùng Trồng Đặc Sản Phù Sa Sông Hồng',
      altitude: 'Đồng bằng châu thổ Bắc Bộ',
      address: 'Xã Hồng Nam, Thành phố Hưng Yên',
      certCode: 'VIETGAP-HY-33921',
      soil: 'Đất phù sa bãi bồi ven sông Hồng tơi xốp',
      water: 'Nước tưới tiêu tự nhiên được kiểm định không kim loại nặng'
    };
  }
  if (region.includes('Đắk Lắk')) {
    return {
      farmName: 'Trang Trại Hữu Cơ Cao Nguyên Ban Mê',
      altitude: '500m so với mực nước biển',
      address: 'Thị xã Buôn Hồ, Tỉnh Đắk Lắk',
      certCode: 'USDA-DLK-77140',
      soil: 'Đất đỏ bazan trù phú tầng canh tác dày',
      water: 'Giếng khoan tầng đá ong sâu 80m qua lọc thẩm thấu'
    };
  }
  return {
    farmName: 'HTX Rau Quả Công Nghệ Cao Lành Đà Lạt',
    altitude: '1.500m - Khí hậu ôn đới quanh năm mát mẻ',
    address: 'Thôn Đa Quý, Xã Xuân Thọ, TP. Đà Lạt, Tỉnh Lâm Đồng',
    certCode: 'VIETGAP-LD-11029',
    soil: 'Đất feralit bazan giàu mùn hữu cơ đã khử khuẩn',
    water: 'Hệ thống tưới nhỏ giọt Israel từ nguồn nước ngầm tự nhiên'
  };
}

// Bảng giá trị dinh dưỡng chuẩn cho từng nhóm sản phẩm
function getNutritionFacts(name: string, category: string) {
  const n = name.toLowerCase();
  
  // Gạo & Tinh bột
  if (category === 'Gạo' || n.includes('gạo') || n.includes('nếp')) {
    return {
      serving: '100g gạo thô',
      calories: '350 - 365 kcal',
      protein: '7.5g',
      carbs: '78g',
      fat: '0.8g',
      fiber: n.includes('lứt') ? '3.5g (Giàu chất xơ)' : '1.3g',
      vitamins: [
        { name: 'Vitamin B1 (Thiamine)', value: '0.35 mg (30% DV)', desc: 'Tăng cường năng lượng hệ thần kinh' },
        { name: 'Vitamin B6', value: '0.28 mg (22% DV)', desc: 'Hỗ trợ chuyển hóa axit amin' },
        { name: 'Anthocyanin / Chất chống oxy hóa', value: n.includes('tím') ? 'Rất cao (Sắc tố tím)' : 'Vừa phải', desc: 'Bảo vệ tế bào, chống lão hóa' }
      ],
      minerals: [
        { name: 'Magiê (Mg)', value: '110 mg (28% DV)' },
        { name: 'Phốt pho (P)', value: '150 mg (21% DV)' },
        { name: 'Sắt (Fe)', value: '1.6 mg (12% DV)' },
        { name: 'Kẽm (Zn)', value: '1.8 mg (18% DV)' }
      ],
      healthBenefits: [
        'Cung cấp năng lượng bền bỉ không gây tăng vọt đường huyết nhanh.',
        'Hạt gạo nguyên chất không chất bảo quản, không đánh bóng hoá chất tẩy trắng.',
        'Hương thơm thanh khiết tự nhiên, cơm để nguội vẫn mềm dẻo đậm đà.',
        'Lành tính, thích hợp cho cả người già, trẻ nhỏ và người ăn thực dưỡng.'
      ]
    };
  }

  // Hạt & Đậu
  if (category === 'Hạt' || n.includes('hạt') || n.includes('đậu') || n.includes('macca') || n.includes('điều') || n.includes('yến mạch') || n.includes('ngô')) {
    return {
      serving: '100g hạt sấy lạnh tự nhiên',
      calories: '450 - 580 kcal',
      protein: '18 - 24g (Đạm thực vật tinh sạch)',
      carbs: '28 - 35g',
      fat: '35 - 45g (Axit béo Omega-3, 6, 9 có lợi)',
      fiber: '8.5g (Hỗ trợ tiêu hóa cực tốt)',
      vitamins: [
        { name: 'Vitamin E (Alpha-tocopherol)', value: '5.2 mg (35% DV)', desc: 'Chống oxy hóa, sáng da mượt tóc' },
        { name: 'Vitamin B-Complex', value: 'Đa dạng B1, B2, B9', desc: 'Cân bằng dẫn truyền thần kinh' },
        { name: 'Folate (Vitamin B9)', value: '62 mcg (16% DV)', desc: 'Tái tạo tế bào máu mới' }
      ],
      minerals: [
        { name: 'Magiê (Mg)', value: '260 mg (65% DV)' },
        { name: 'Đồng & Kẽm', value: '2.1 mg (30% DV)' },
        { name: 'Canxi (Ca)', value: '115 mg (12% DV)' },
        { name: 'Kali (K)', value: '680 mg (20% DV)' }
      ],
      healthBenefits: [
        'Giàu chất béo không bão hòa đơn và đa, bảo vệ sức khỏe tim mạch và giảm cholesterol xấu.',
        'Nguồn đạm thực vật hoàn hảo cho người tập luyện thể thao, ăn thuần chay hoặc eat clean.',
        'Chỉ số đường huyết (GI) thấp giúp no lâu, hạn chế cảm giác thèm ăn vặt.',
        'Bổ sung omega và khoáng chất nuôi dưỡng tế bào não bộ và cải thiện trí nhớ.'
      ]
    };
  }

  // Rau thơm & Gia vị
  if (category === 'Rau thơm' || n.includes('hành') || n.includes('ngò') || n.includes('húng') || n.includes('tía tô') || n.includes('ớt') || n.includes('tỏi') || n.includes('gừng') || n.includes('thì là') || n.includes('sả')) {
    return {
      serving: '100g rau thơm tươi nguyên cành',
      calories: '28 - 42 kcal',
      protein: '2.8g',
      carbs: '5.2g',
      fat: '0.4g',
      fiber: '3.1g',
      vitamins: [
        { name: 'Vitamin C', value: '45 mg (50% DV)', desc: 'Kháng viêm, tăng cường đề kháng' },
        { name: 'Vitamin A & Beta-carotene', value: '380 mcg RAE', desc: 'Sáng mắt và bảo vệ niêm mạc hô hấp' },
        { name: 'Tinh dầu tự nhiên (Essential oils)', value: 'Hoạt chất Allicin / Eugenol / Curcumin', desc: 'Kháng khuẩn, ấm bụng, kích thích tiêu hóa' }
      ],
      minerals: [
        { name: 'Sắt hữu cơ (Fe)', value: '2.8 mg (20% DV)' },
        { name: 'Kali (K)', value: '420 mg (12% DV)' },
        { name: 'Canxi (Ca)', value: '95 mg (10% DV)' },
        { name: 'Mangan (Mn)', value: '0.6 mg (26% DV)' }
      ],
      healthBenefits: [
        'Hàm lượng tinh dầu tự nhiên đậm đà, giúp kích thích dịch vị tiêu hóa và bữa ăn ngon miệng hơn.',
        'Chứa các hợp chất kháng khuẩn tự nhiên hỗ trợ phòng ngừa cảm mạo và giữ ấm đường ruột.',
        'Giải độc nhẹ nhàng, hỗ trợ hạ huyết áp và thanh lọc cơ thể.',
        'Thu hoạch tươi mới trong ngày nên giữ trọn vẹn mùi hương nồng nàn đặc trưng.'
      ]
    };
  }

  // Trái cây tươi
  if (category === 'Trái cây' || n.includes('cam') || n.includes('bưởi') || n.includes('xoài') || n.includes('bơ') || n.includes('dâu') || n.includes('sầu riêng') || n.includes('dưa') || n.includes('nho') || n.includes('chuối')) {
    return {
      serving: '100g phần thịt quả tươi ngon',
      calories: n.includes('bơ') ? '160 kcal' : n.includes('sầu riêng') ? '147 kcal' : '45 - 65 kcal',
      protein: '1.2g',
      carbs: '12 - 16g (Đường tự nhiên Fructose thanh dịu)',
      fat: n.includes('bơ') ? '14.7g (Chất béo thực vật lành mạnh)' : '0.2g',
      fiber: '2.8g (Pectin tự nhiên thanh lọc ruột)',
      vitamins: [
        { name: 'Vitamin C', value: '55 - 85 mg (80% - 100% DV)', desc: 'Tăng sinh collagen, da sáng khỏe' },
        { name: 'Vitamin A & Flavonoids', value: '450 IU', desc: 'Chống oxy hóa mạnh mẽ' },
        { name: 'Folate & Axit hữu cơ', value: '32 mcg', desc: 'Cân bằng điện giải và giảm mệt mỏi' }
      ],
      minerals: [
        { name: 'Kali (K)', value: '280 mg (8% DV)' },
        { name: 'Canxi (Ca)', value: '24 mg' },
        { name: 'Magiê (Mg)', value: '18 mg' },
        { name: 'Photpho (P)', value: '20 mg' }
      ],
      healthBenefits: [
        'Vị ngọt thanh tự nhiên từ đường hoa quả Fructose nguyên chất, giải khát và nạp năng lượng nhanh.',
        'Dồi dào Vitamin C và enzyme sinh học giúp trẻ hóa tế bào da và tăng cường hệ miễn dịch.',
        'Hàm lượng nước sinh học chiếm 85-90% giúp cấp nước và thanh lọc cơ thể suốt ngày dài.',
        'Không chín ép bằng hóa chất độc hại, trái cây chín mọng thơm lừng tự nhiên trên cành.'
      ]
    };
  }

  // Rau củ quả (Mặc định)
  return {
    serving: '100g rau củ sạch sơ chế',
    calories: '25 - 45 kcal',
    protein: '2.2g',
    carbs: '6.4g',
    fat: '0.2g',
    fiber: '3.4g (Chất xơ thô & hòa tan)',
    vitamins: [
      { name: 'Vitamin C', value: '38 mg (45% DV)', desc: 'Tăng cường sức đề kháng tế bào' },
      { name: 'Vitamin A (Beta-carotene)', value: '720 mcg (80% DV)', desc: 'Tốt cho thị lực và màng tế bào' },
      { name: 'Vitamin K1', value: '85 mcg (70% DV)', desc: 'Hỗ trợ đông máu và chắc khỏe xương' }
    ],
    minerals: [
      { name: 'Kali (K)', value: '380 mg (11% DV)' },
      { name: 'Canxi sinh học (Ca)', value: '68 mg (7% DV)' },
      { name: 'Sắt thực vật (Fe)', value: '1.4 mg (10% DV)' },
      { name: 'Magiê (Mg)', value: '32 mg (8% DV)' }
    ],
    healthBenefits: [
      'Chất xơ tự nhiên dồi dào giúp hỗ trợ hệ vi sinh đường ruột hoạt động trơn tru, nhuận tràng.',
      'Lượng calo rất thấp, lý tưởng cho thực đơn giữ gìn vóc dáng, giảm cân an toàn và kiểm soát đường huyết.',
      'Cung cấp chất chống oxy hóa tự nhiên giúp trung hòa các gốc tự do, làm chậm quá trình lão hóa tế bào.',
      'Canh tác hữu cơ chuẩn VietGAP đảm bảo độ giòn ngọt nguyên bản, thơm ngon khi luộc hoặc xào.'
    ]
  };
}

// Hướng dẫn bảo quản thông minh
function getStorageInstructions(category: string, name: string) {
  const n = name.toLowerCase();
  if (category === 'Gạo' || category === 'Hạt' || n.includes('gạo') || n.includes('hạt') || n.includes('đậu')) {
    return {
      temp: 'Nhiệt độ phòng (20°C - 26°C), nơi khô ráo, tránh ánh nắng trực tiếp',
      duration: '6 - 12 tháng kể từ ngày đóng gói',
      steps: [
        'Bảo quản trong hũ thủy tinh, hộp đậy kín hoặc túi zip kín khí để tránh độ ẩm và mối mọt xâm nhập.',
        'Không để sản phẩm sát mặt đất hoặc nơi ẩm thấp; đặt trên kệ cao ráo, thoáng mát.',
        'Đối với hạt đã rang sấy ăn liền: Đóng chặt miệng túi sau mỗi lần dùng, có thể bảo quản trong ngăn mát tủ lạnh để giữ độ giòn thơm lâu hơn.'
      ]
    };
  }

  if (category === 'Trái cây') {
    return {
      temp: '8°C - 12°C trong ngăn mát tủ lạnh (hoặc nơi thoáng gió nếu quả chưa chín mềm)',
      duration: '5 - 10 ngày tùy loại quả',
      steps: [
        'Đối với quả chưa chín tới (bơ, xoài, chuối): Để ở nhiệt độ phòng nơi thoáng mát đến khi tỏa hương thơm và mềm tay thì mới cất tủ lạnh.',
        'Không rửa trái cây bằng nước trước khi bảo quản; chỉ rửa sạch dưới vòi nước chảy ngay trước khi ăn.',
        'Bọc từng quả bằng giấy báo sạch hoặc túi giấy đục lỗ để tránh đọng hơi nước làm quả bị thâm dập.'
      ]
    };
  }

  if (category === 'Rau thơm') {
    return {
      temp: '3°C - 6°C trong ngăn bảo quản rau củ',
      duration: '4 - 7 ngày giữ nguyên hương thơm',
      steps: [
        'Nhặt bỏ các lá úa dập (nếu có), không rửa nước nếu chưa dùng ngay.',
        'Bọc nhẹ rau thơm trong khăn giấy khô hoặc giấy sáp thực phẩm rồi cho vào hộp nhựa kín/túi zip.',
        'Có thể cắm gốc rau thơm (như ngò, húng) vào một cốc nước nhỏ như cắm hoa để rau tươi rói nhiều ngày.'
      ]
    };
  }

  // Mặc định: Rau củ quả
  return {
    temp: '4°C - 8°C (Ngăn rau củ quả chuyên dụng của tủ lạnh)',
    duration: '5 - 7 ngày đối với rau lá, 10 - 20 ngày đối với các loại củ quả',
    steps: [
      'Để rau củ khô ráo trước khi cho vào tủ lạnh. Tránh để dính nước vì độ ẩm cao sẽ dễ làm thối nhũn lá.',
      'Sử dụng túi lưới hoặc hộp nhựa có lỗ thông khí để rau hô hấp tự nhiên mà không bị bí hơi.',
      'Các loại củ như khoai tây, khoai lang, hành tây, tỏi: KHÔNG để tủ lạnh, chỉ cần để nơi khô ráo, thoáng khí, tránh ánh sáng để không bị mọc mầm.'
    ]
  };
}

interface SecondaryImage {
  url: string;
  label: string;
}

function getSecondaryImages(category: string, productName: string, dbImages?: ProductImage[]): SecondaryImage[] {
  const n = productName.toLowerCase();
  
  let defaultSubImages: SecondaryImage[] = [];

  if (category === 'Trái cây' || n.includes('cam') || n.includes('bưởi') || n.includes('xoài') || n.includes('dâu') || n.includes('bơ') || n.includes('sầu riêng') || n.includes('dưa') || n.includes('nho')) {
    defaultSubImages = [
      { url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80', label: 'Quả tươi tại vườn' },
      { url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80', label: 'Vườn trĩu quả' },
      { url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80', label: 'Cắt lát mọng nước' },
      { url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&auto=format&fit=crop&q=80', label: 'Đóng gói lạnh' },
      { url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&auto=format&fit=crop&q=80', label: 'Thưởng thức tươi' }
    ];
  } else if (category === 'Gạo' || n.includes('gạo') || n.includes('nếp')) {
    defaultSubImages = [
      { url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80', label: 'Hạt gạo đều mẩy' },
      { url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80', label: 'Đồng lúa chín vàng' },
      { url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80', label: 'Thu hoạch cơ giới' },
      { url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80', label: 'Túi hút chân không' },
      { url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80', label: 'Cơm nóng dẻo thơm' }
    ];
  } else if (category === 'Hạt' || n.includes('hạt') || n.includes('đậu') || n.includes('macca') || n.includes('điều') || n.includes('ngô')) {
    defaultSubImages = [
      { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', label: 'Hạt chắc mẩy' },
      { url: 'https://images.unsplash.com/photo-1536591375315-1b838421c0f0?w=800&auto=format&fit=crop&q=80', label: 'Sấy lạnh tự nhiên' },
      { url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80', label: 'Nông trại thu hái' },
      { url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=800&auto=format&fit=crop&q=80', label: 'Hũ thủy tinh kín' },
      { url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80', label: 'Ngũ cốc dinh dưỡng' }
    ];
  } else if (category === 'Rau thơm' || n.includes('hành') || n.includes('ngò') || n.includes('húng') || n.includes('tía tô') || n.includes('ớt') || n.includes('tỏi') || n.includes('gừng')) {
    defaultSubImages = [
      { url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80', label: 'Bó thơm tươi rói' },
      { url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80', label: 'Cận cảnh lá non' },
      { url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80', label: 'Vườn gia vị hữu cơ' },
      { url: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80', label: 'Sơ chế sạch sẽ' },
      { url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80', label: 'Món ăn dậy mùi' }
    ];
  } else {
    // Mặc định: Rau củ quả
    defaultSubImages = [
      { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', label: 'Cận cảnh độ tươi giòn' },
      { url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80', label: 'Vườn rau công nghệ' },
      { url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80', label: 'Hái sáng tinh mơ' },
      { url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&auto=format&fit=crop&q=80', label: 'Đóng gói chuẩn VietGAP' },
      { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', label: 'Salad giòn ngọt' }
    ];
  }

  const SUB_LABELS = [
    'Cận cảnh độ tươi ngon',
    'Vườn trồng / Trang trại',
    'Thu hoạch tại vườn',
    'Đóng gói sạch FreshLock',
    'Chế biến món ăn ngon'
  ];

  const result: SecondaryImage[] = [];
  if (dbImages && dbImages.length > 1) {
    const primaryImg = dbImages.find(img => img.isPrimary) || dbImages[0];
    const extra = dbImages.filter(img => img.productImageId !== primaryImg.productImageId);
    extra.forEach((img, idx) => {
      result.push({
        url: img.imageUrl,
        label: SUB_LABELS[idx] || `Góc ảnh ${idx + 1}`
      });
    });
  }

  let defaultIdx = 0;
  while (result.length < 5 && defaultIdx < defaultSubImages.length) {
    result.push({
      url: defaultSubImages[defaultIdx].url,
      label: defaultSubImages[defaultIdx].label
    });
    defaultIdx++;
  }

  return result.slice(0, 5);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'intro' | 'nutrition' | 'origin' | 'storage'>('intro');
  const [addedToast, setAddedToast] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Đọc user và cart từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Cập nhật cart vào localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (newCart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(newCart));
    } else {
      localStorage.removeItem('cart');
    }
  };

  // Fetch chi tiết sản phẩm và lô hàng
  useEffect(() => {
    if (!productId) return;
    setSelectedImage(null);
    setLoading(true);

    // 1. Fetch chi tiết sản phẩm
    fetch(`http://localhost:5023/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Sản phẩm không tồn tại');
        return res.json();
      })
      .then((data: ProductDetail) => {
        setProduct(data);
        setLoading(false);

        // Fetch sản phẩm liên quan cùng Category
        fetch('http://localhost:5023/api/products')
          .then(r => r.json())
          .then((all: any[]) => {
            if (all) {
              const rel = all
                .filter(p => p.productId !== Number(productId) && (p.categoryId === data.categoryId || p.category?.categoryName === data.category?.categoryName))
                .slice(0, 4);
              setRelatedProducts(rel);
            }
          })
          .catch(() => {});
      })
      .catch(err => {
        console.error('Lỗi fetch sản phẩm:', err);
        setLoading(false);
      });

    // 2. Fetch lô hàng của sản phẩm
    fetch(`http://localhost:5023/api/productbatches?productId=${productId}`)
      .then(res => res.json())
      .then((batchList: BatchInfo[]) => {
        if (Array.isArray(batchList)) {
          setBatches(batchList);
        }
      })
      .catch(() => {});
  }, [productId]);

  // Thêm vào giỏ hàng
  const handleAddToCart = (redirectCheckout = false) => {
    if (!product) return;

    const img = product.productImages && product.productImages.length > 0
      ? (product.productImages.find(i => i.isPrimary)?.imageUrl || product.productImages[0].imageUrl)
      : undefined;

    const region = getRegionByName(product.productName);
    const categoryName = product.category?.categoryName || 'Rau củ';
    const cert = (product.status === 'Active' || !product.status) ? 'VietGAP' : product.status;
    const lotCode = batches.length > 0 ? batches[0].batchCode : `LOT#VN-${productId.padStart(4, '0')}`;

    const itemToAdd = {
      id: product.productId,
      name: product.productName,
      price: product.price.toLocaleString('vi-VN') + '₫',
      unit: ' / ' + product.unit,
      category: categoryName,
      cert: cert,
      region: region,
      rating: 4.9,
      reviews: 168,
      icon: 'leaf',
      lot: lotCode,
      imageUrl: img
    };

    const existingIndex = cart.findIndex(x => x.product.id === product.productId);
    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = cart.map((item, index) => 
        index === existingIndex ? { ...item, qty: item.qty + quantity } : item
      );
    } else {
      updatedCart = [...cart, { product: itemToAdd, qty: quantity }];
    }

    saveCart(updatedCart);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 800);

    if (redirectCheckout) {
      router.push('/checkout');
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const updateCartQty = (id: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const removeCartItem = (id: number) => {
    const updated = cart.filter(item => item.product.id !== id);
    saveCart(updated);
  };

  const subtotalNumber = cart.reduce((acc, item) => {
    const p = parseInt(item.product.price.replace(/[^\d]/g, '')) || 0;
    return acc + (p * item.qty);
  }, 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--green-100)', borderTopColor: 'var(--green-700)', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>Đang tải thông tin nông sản sạch...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '40px' }}>
        <h2 style={{ fontSize: '28px', color: 'var(--green-900)' }}>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--ink-soft)' }}>Sản phẩm bạn đang tìm kiếm có thể đã hết vụ hoặc không tồn tại trên hệ thống.</p>
        <Link href="/" className="btn btn-accent">
          ← Về trang chủ cửa hàng
        </Link>
      </div>
    );
  }

  const categoryName = product.category?.categoryName || 'Rau củ';
  const region = getRegionByName(product.productName);
  const farm = getFarmInfo(region);
  const nutrition = getNutritionFacts(product.productName, categoryName);
  const storage = getStorageInstructions(categoryName, product.productName);

  const mainImage = product.productImages && product.productImages.length > 0
    ? (product.productImages.find(i => i.isPrimary)?.imageUrl || product.productImages[0].imageUrl)
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80';

  const subImages = getSecondaryImages(categoryName, product.productName, product.productImages);
  const currentMainImage = selectedImage || mainImage;

  const primaryBatch = batches.length > 0 ? batches[0] : null;
  const lotCode = primaryBatch?.batchCode || `LOT#VN-${product.productId.toString().padStart(4, '0')}`;
  const harvestDate = primaryBatch?.harvestDate 
    ? new Date(primaryBatch.harvestDate).toLocaleDateString('vi-VN') 
    : 'Thu hoạch sáng nay';
  const expiryDate = primaryBatch?.expiryDate 
    ? new Date(primaryBatch.expiryDate).toLocaleDateString('vi-VN') 
    : 'Khuyên dùng trong 7 ngày';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Toast thông báo thêm thành công */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--green-700)',
          color: '#fff',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 600,
          animation: 'slideIn 0.3s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          <span>Đã thêm {quantity} {product.unit} vào giỏ hàng thành công!</span>
        </div>
      )}

      {/* HEADER TỐI GIẢN & HIỆN ĐẠI */}
      <header style={{ position: 'sticky', top: 0, zIndex: 60, background: 'color-mix(in srgb, var(--bg) 92%, transparent)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mark" style={{ width: '32px', height: '32px', display: 'inline-block' }}>
                <svg viewBox="0 0 40 40" fill="none" style={{ width: '100%', height: '100%' }}>
                  <rect width="40" height="40" rx="10" fill="var(--green-700)"/>
                  <path d="M12 28C12 18 20 12 28 12C28 22 20 28 12 28Z" fill="#A5D6A7"/>
                  <path d="M12 28L28 12" stroke="var(--green-900)" strokeWidth="2"/>
                </svg>
              </span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.5px' }}>LÀNH</span>
            </Link>

            <Link href="/" style={{ fontSize: '13.5px', color: 'var(--ink-soft)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--line)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Quay lại danh sách sản phẩm
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {currentUser ? (
              <span style={{ fontSize: '13.5px', color: 'var(--green-700)', fontWeight: 600 }}>
                Chào, {currentUser.fullName || currentUser.username}
              </span>
            ) : (
              <Link href="/login" style={{ fontSize: '13px', color: 'var(--ink-soft)', textDecoration: 'none', fontWeight: 500 }}>
                Đăng nhập
              </Link>
            )}

            <button 
              className={`icon-btn ${cartBounce ? "bounce" : ""}`} 
              onClick={() => setIsDrawerOpen(true)} 
              aria-label="Giỏ hàng"
              style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--line)', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6"/><circle cx="9.5" cy="21" r="1.3" fill="currentColor" stroke="none"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor" stroke="none"/></svg>
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--green-700)', color: '#fff', fontSize: '11px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="wrap" style={{ padding: '36px 20px 80px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '28px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>{categoryName}</Link>
          <span>/</span>
          <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>{product.productName}</span>
        </nav>

        {/* HERO SẢN PHẨM: 2 CỘT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'start', marginBottom: '64px' }}>
          {/* CỘT ẢNH & THẺ CHỨNG NHẬN */}
          <div>
            {/* 1 ẢNH CHÍNH LỚN */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'var(--surface)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              border: '1px solid var(--line)',
              aspectRatio: '4/3'
            }}>
              <img 
                src={currentMainImage} 
                alt={product.productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.35s ease' }}
              />
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ background: 'var(--green-700)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', letterSpacing: '0.3px' }}>
                  {categoryName}
                </span>
                <span style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px' }}>
                  {product.status || 'VietGAP'}
                </span>
                {selectedImage && (
                  <button 
                    onClick={() => setSelectedImage(null)}
                    style={{ background: '#2E7D32', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                    title="Bấm để quay lại ảnh chính"
                  >
                    ↺ Về ảnh chính
                  </button>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--green-900)', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  <span>Mã lô: <strong>{lotCode}</strong></span>
                </div>
                <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Quét QR truy xuất ✓</span>
              </div>
            </div>

            {/* 5 ẢNH PHỤ NHỎ Ở PHÍA DƯỚI ẢNH CHÍNH */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  5 Góc ảnh thực tế (nhấp để phóng to ảnh chính)
                </span>
                {selectedImage && (
                  <button 
                    onClick={() => setSelectedImage(null)}
                    style={{ fontSize: '11.5px', color: 'var(--green-700)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Xem lại ảnh chính
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {subImages.map((sub, index) => {
                  const isActive = selectedImage === sub.url;
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(sub.url)}
                      title={`Xem góc ảnh: ${sub.label}`}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        aspectRatio: '1 / 1',
                        border: isActive ? '2.5px solid var(--green-700)' : '1.5px solid var(--line)',
                        boxShadow: isActive ? '0 4px 14px rgba(46,125,50,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        opacity: isActive ? 1 : 0.8,
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        background: 'var(--surface)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.borderColor = 'var(--green-500)';
                          e.currentTarget.style.transform = 'scale(1.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.borderColor = 'var(--line)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <img 
                        src={sub.url} 
                        alt={sub.label} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: isActive ? 'var(--green-700)' : 'rgba(22,36,26,0.7)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 600,
                        textAlign: 'center',
                        padding: '2px 3px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {sub.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Khối cam kết dưới ảnh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '18px' }}>
              <div style={{ background: 'var(--surface)', padding: '14px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ color: 'var(--green-700)', marginBottom: '4px' }}>🌱</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>100% Tự nhiên</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Không hóa chất BVTV</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '14px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ color: 'var(--green-700)', marginBottom: '4px' }}>❄️</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Chuỗi lạnh FreshLock</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Giữ nguyên độ tươi</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '14px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ color: 'var(--green-700)', marginBottom: '4px' }}>🛡️</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Đổi trả 24h</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Nếu dập úa lỗi hàng</div>
              </div>
            </div>
          </div>

          {/* CỘT THÔNG TIN & MUA HÀNG */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--green-700)', fontWeight: 600, background: 'var(--green-100)', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/></svg>
              Xuất xứ nông trại: {region}
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', fontWeight: 700, color: 'var(--green-900)', lineHeight: 1.15, marginBottom: '12px' }}>
              {product.productName}
            </h1>

            {/* Đánh giá sao */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', fontSize: '13.5px' }}>
              <div style={{ color: '#FFB800', letterSpacing: '2px' }}>★★★★★</div>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>4.9</span>
              <span style={{ color: 'var(--ink-soft)' }}>· 186 lượt đánh giá từ khách mua</span>
              <span style={{ color: 'var(--line)' }}>|</span>
              <span style={{ color: '#2E7D32', fontWeight: 600 }}>Đã bán 1.400+ kg</span>
            </div>

            {/* Giá tiền */}
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--green-700)', letterSpacing: '-0.5px' }}>
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span style={{ fontSize: '16px', color: 'var(--ink-soft)', fontWeight: 500 }}>
                  / {product.unit}
                </span>
                <span style={{ marginLeft: 'auto', background: '#E8F5E9', color: '#2E7D32', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
                  ✓ Còn hàng thu hoạch mới
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '8px' }}>
                Giá đã bao gồm VAT và kiểm định chất lượng VietGAP tại nguồn.
              </p>
            </div>

            {/* Thông tin nhanh: Hạn sử dụng & Vùng trồng */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày thu hoạch</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>{harvestDate}</div>
              </div>
              <div style={{ background: 'var(--surface)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hạn sử dụng (FEFO)</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#C0392B', marginTop: '2px' }}>{expiryDate}</div>
              </div>
            </div>

            {/* Chọn số lượng & Nút Mua */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: '999px', padding: '4px' }}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Giảm"
                >
                  -
                </button>
                <span style={{ width: '48px', textAlign: 'center', fontWeight: 700, fontSize: '15px' }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Tăng"
                >
                  +
                </button>
              </div>

              <button 
                onClick={() => handleAddToCart(false)}
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '14px 24px', borderRadius: '999px', borderColor: 'var(--green-700)', color: 'var(--green-700)', fontWeight: 700, fontSize: '14.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6"/></svg>
                Thêm vào giỏ hàng
              </button>

              <button 
                onClick={() => handleAddToCart(true)}
                className="btn btn-accent" 
                style={{ flex: 1, padding: '14px 24px', borderRadius: '999px', fontWeight: 700, fontSize: '14.5px' }}
              >
                Mua ngay
              </button>
            </div>

            {/* Cam kết vận chuyển */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--ink-soft)', padding: '10px 14px', background: 'var(--green-100)', borderRadius: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2"><rect x="1" y="7" width="13" height="9"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>
              <span>Giao hàng lạnh FreshLock trong <strong>2 giờ</strong> tại TP.HCM &amp; Hà Nội. Miễn phí từ 300.000₫.</span>
            </div>
          </div>
        </div>

        {/* 4 KHỐI THÔNG TIN BẮT BUỘC THEO YÊU CẦU: TABS ĐIỀU HƯỚNG */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--line)', paddingBottom: '2px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('intro')}
              style={{
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: '15px',
                color: activeTab === 'intro' ? 'var(--green-700)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'intro' ? '3px solid var(--green-700)' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              📖 Giới thiệu sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              style={{
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: '15px',
                color: activeTab === 'nutrition' ? 'var(--green-700)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'nutrition' ? '3px solid var(--green-700)' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              🥗 Giá trị dinh dưỡng
            </button>
            <button
              onClick={() => setActiveTab('origin')}
              style={{
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: '15px',
                color: activeTab === 'origin' ? 'var(--green-700)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'origin' ? '3px solid var(--green-700)' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              📍 Xuất xứ &amp; Vùng trồng
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              style={{
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: '15px',
                color: activeTab === 'storage' ? 'var(--green-700)' : 'var(--ink-soft)',
                borderBottom: activeTab === 'storage' ? '3px solid var(--green-700)' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              ⏳ Hạn sử dụng &amp; Bảo quản
            </button>
          </div>

          {/* TAB CONTENT 1: GIỚI THIỆU SẢN PHẨM */}
          {activeTab === 'intro' && (
            <div style={{ background: 'var(--surface)', padding: '36px', borderRadius: '24px', marginTop: '24px', border: '1px solid var(--line)', lineHeight: 1.7 }}>
              <div style={{ maxWidth: '850px' }}>
                <h3 style={{ fontSize: '22px', color: 'var(--green-900)', marginBottom: '16px' }}>
                  Về {product.productName}
                </h3>
                <p style={{ fontSize: '15.5px', color: 'var(--ink)', marginBottom: '20px', whiteSpace: 'pre-line' }}>
                  {product.description || `${product.productName} được canh tác hữu cơ theo quy trình chuẩn sạch, thu hoạch thủ công vào sáng sớm nhằm giữ nguyên vị ngon ngọt tự nhiên và dinh dưỡng cao nhất.`}
                </p>

                <h4 style={{ fontSize: '17px', color: 'var(--green-900)', marginTop: '28px', marginBottom: '12px' }}>
                  Đặc điểm nổi bật &amp; Phương pháp canh tác
                </h4>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14.5px', color: 'var(--ink-soft)' }}>
                  <li style={{ listStyleType: 'disc' }}>
                    <strong>Không thuốc trừ sâu hoá học:</strong> Áp dụng phương pháp phòng ngừa sinh học bằng bẫy pheromone tự nhiên và thiên địch.
                  </li>
                  <li style={{ listStyleType: 'disc' }}>
                    <strong>Không phân bón hóa học kích thích tăng trưởng:</strong> Chỉ sử dụng phân trùn quế và ủ phân hữu cơ vi sinh giàu khoáng chất.
                  </li>
                  <li style={{ listStyleType: 'disc' }}>
                    <strong>Thu hoạch đúng độ chín ngon nhất:</strong> Đạt tiêu chuẩn kích thước, màu sắc và hương vị tự nhiên đặc trưng của giống.
                  </li>
                  <li style={{ listStyleType: 'disc' }}>
                    <strong>Phù hợp cho cả gia đình:</strong> An toàn tuyệt đối cho người già, trẻ nhỏ, phụ nữ mang thai và người theo chế độ ăn thực dưỡng sạch.
                  </li>
                </ul>

                <div style={{ marginTop: '28px', padding: '18px 24px', background: 'var(--green-100)', borderRadius: '16px', borderLeft: '4px solid var(--green-700)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--green-900)', fontSize: '15px', marginBottom: '4px' }}>
                    💡 Gợi ý thưởng thức &amp; Chế biến ngon
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: 0 }}>
                    Nông sản tươi sạch tại LÀNH có vị ngọt đậm thanh khiết tự nhiên. Thích hợp dùng ăn trực tiếp, làm salad tươi giòn, ép nước detox dinh dưỡng hoặc nấu canh/xào nhẹ lửa để giữ trọn vẹn vitamin và khoáng chất.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: GIÁ TRỊ DINH DƯỠNG (NUTRITION FACTS) */}
          {activeTab === 'nutrition' && (
            <div style={{ background: 'var(--surface)', padding: '36px', borderRadius: '24px', marginTop: '24px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
                {/* BẢNG NUTRITION FACTS CHUẨN */}
                <div style={{ border: '2px solid var(--green-900)', borderRadius: '16px', padding: '20px', background: '#FAFCF8' }}>
                  <div style={{ borderBottom: '8px solid var(--green-900)', paddingBottom: '6px' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--green-900)', letterSpacing: '-0.5px' }}>Nutrition Facts</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Khẩu phần: <strong>{nutrition.serving}</strong></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '4px solid var(--green-900)', padding: '10px 0' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Năng lượng / Calories</div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--green-700)' }}>{nutrition.calories}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>% Giá trị hàng ngày (DV)*</div>
                  </div>

                  <div style={{ borderBottom: '1px solid #ddd', padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span><strong>Chất đạm (Protein)</strong></span>
                    <span style={{ fontWeight: 700 }}>{nutrition.protein}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid #ddd', padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span><strong>Chất béo (Total Fat)</strong></span>
                    <span style={{ fontWeight: 700 }}>{nutrition.fat}</span>
                  </div>
                  <div style={{ borderBottom: '1px solid #ddd', padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span><strong>Carbohydrate</strong></span>
                    <span style={{ fontWeight: 700 }}>{nutrition.carbs}</span>
                  </div>
                  <div style={{ borderBottom: '4px solid var(--green-900)', padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span><strong>Chất xơ (Dietary Fiber)</strong></span>
                    <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>{nutrition.fiber}</span>
                  </div>

                  {/* Vitamin & Khoáng */}
                  <div style={{ marginTop: '12px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green-900)', marginBottom: '8px' }}>Vitamin &amp; Dưỡng chất nổi bật:</div>
                    {nutrition.vitamins.map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #e0e0e0' }}>
                        <span>{v.name}</span>
                        <span style={{ fontWeight: 600, color: 'var(--green-700)' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--green-900)', marginBottom: '8px' }}>Khoáng chất thiết yếu:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {nutrition.minerals.map((m, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #eee' }}>
                          <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{m.name}:</span> <strong style={{ fontSize: '12.5px' }}>{m.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* LỢI ÍCH SỨC KHỎE */}
                <div>
                  <h3 style={{ fontSize: '20px', color: 'var(--green-900)', marginBottom: '16px' }}>
                    Lợi ích sức khỏe khi dùng {product.productName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {nutrition.healthBenefits.map((b, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', background: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                          ✓
                        </div>
                        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.5 }}>
                          {b}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px', padding: '16px', background: '#FFF8E1', borderRadius: '16px', border: '1px solid #FFE082' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F57F17', marginBottom: '4px' }}>
                      🌟 Tiêu chuẩn Nông Nghiệp Xanh LÀNH
                    </div>
                    <p style={{ fontSize: '13px', color: '#795548', margin: 0 }}>
                      Sản phẩm được giữ nguyên vỏ hoặc lớp bảo vệ tự nhiên để bảo tồn tối đa hàm lượng khoáng chất và chất xơ hòa tan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: XUẤT XỨ & VÙNG TRỒNG */}
          {activeTab === 'origin' && (
            <div style={{ background: 'var(--surface)', padding: '36px', borderRadius: '24px', marginTop: '24px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--green-700)', background: 'var(--green-100)', padding: '4px 10px', borderRadius: '20px', marginBottom: '12px' }}>
                    ĐỊA ĐIỂM CANH TÁC CHÍNH XÁC
                  </div>
                  <h3 style={{ fontSize: '24px', color: 'var(--green-900)', marginBottom: '8px' }}>
                    {farm.farmName}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
                    📍 {farm.address}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Mã chứng nhận nông trại</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green-700)', marginTop: '2px' }}>{farm.certCode}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Độ cao &amp; Khí hậu</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{farm.altitude}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Thổ nhưỡng đất trồng</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{farm.soil}</div>
                    </div>
                    <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', textTransform: 'uppercase', fontWeight: 600 }}>Nguồn nước tưới tiêu</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{farm.water}</div>
                    </div>
                  </div>
                </div>

                {/* Khối Mã QR & Quy trình truy xuất */}
                <div style={{ background: 'var(--green-100)', padding: '28px', borderRadius: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', padding: '18px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '18px' }}>
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.6">
                      <rect x="2" y="2" width="7" height="7"/>
                      <rect x="15" y="2" width="7" height="7"/>
                      <rect x="2" y="15" width="7" height="7"/>
                      <path d="M15 15h3v3h-3zM21 15v3M15 21h3M21 21v.01M5 5h1M18 5h1M5 18h1"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--green-900)' }}>
                    Mã Lô Hàng: {lotCode}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '6px', maxWidth: '300px' }}>
                    Quét mã QR trên tem nhãn gói hàng để xem nhật ký gieo trồng, người phụ trách thu hoạch và kết quả kiểm nghiệm dư lượng Nitrat.
                  </p>
                  <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--green-700)', fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    Đã kiểm tra dư lượng đạt tiêu chuẩn 0%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: HẠN SỬ DỤNG & HƯỚNG DẪN BẢO QUẢN */}
          {activeTab === 'storage' && (
            <div style={{ background: 'var(--surface)', padding: '36px', borderRadius: '24px', marginTop: '24px', border: '1px solid var(--line)' }}>
              <div style={{ maxWidth: '850px' }}>
                <h3 style={{ fontSize: '22px', color: 'var(--green-900)', marginBottom: '20px' }}>
                  Hạn sử dụng &amp; Nguyên tắc bảo quản chuẩn LÀNH
                </h3>

                {/* Khối hạn sử dụng FEFO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>NGÀY THU HOẠCH TẠI VƯỜN</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green-700)', marginTop: '4px' }}>{harvestDate}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Đóng gói lạnh trong vòng 4 giờ</div>
                  </div>

                  <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>HẠN SỬ DỤNG TỐT NHẤT (BEST BEFORE)</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#C0392B', marginTop: '4px' }}>{expiryDate}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Quy trình xuất kho FEFO nghiêm ngặt</div>
                  </div>

                  <div style={{ background: 'var(--bg)', padding: '18px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>NHIỆT ĐỘ BẢO QUẢN LÝ TƯỞNG</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green-900)', marginTop: '4px' }}>{storage.temp}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Duy trì vị giòn ngọt nguyên bản</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '17px', color: 'var(--green-900)', marginBottom: '14px' }}>
                  Các bước bảo quản đúng cách tại gia đình:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {storage.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--green-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', padding: '16px 20px', background: '#FFF3E0', borderRadius: '14px', border: '1px solid #FFE0B2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <p style={{ fontSize: '13px', color: '#E65100', margin: 0 }}>
                    <strong>Lưu ý:</strong> Nông sản hữu cơ không sử dụng chất chống mốc và chất ức chế sinh trưởng. Quý khách vui lòng kiểm tra và dùng theo hạn sử dụng khuyến cáo để đảm bảo chất lượng dinh dưỡng tối ưu nhất.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUY TRÌNH MINH BẠCH FARM-TO-TABLE */}
        <section style={{ marginTop: '64px', marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span className="eyebrow" style={{ justifyContent: 'center' }}>Chuỗi cung ứng khép kín</span>
            <h2 style={{ fontSize: '28px', color: 'var(--green-900)', marginTop: '8px' }}>Từ Nông Trại Xanh Đến Bàn Ăn Của Bạn</h2>
            <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', marginTop: '6px' }}>Mỗi sản phẩm đều trải qua 6 bước kiểm định nghiêm ngặt</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { step: '01', title: 'Gieo hạt bản địa', desc: 'Chọn lọc hạt giống thuần chủng không biến đổi gen (Non-GMO).' },
              { step: '02', title: 'Chăm sóc sinh học', desc: 'Sử dụng phân hữu cơ vi sinh, không dùng thuốc trừ sâu độc hại.' },
              { step: '03', title: 'Thu hái thủ công', desc: 'Hái vào sáng sớm tinh mơ khi sương vừa tan để giữ trọn độ giòn.' },
              { step: '04', title: 'Kiểm định chất lượng', desc: 'Test nhanh dư lượng nitrat và kim loại nặng trước đóng gói.' },
              { step: '05', title: 'Đóng gói lạnh FreshLock', desc: 'Bảo quản nhiệt độ mát, dán mã QR truy xuất từng túi hàng.' },
              { step: '06', title: 'Giao siêu tốc 2H', desc: 'Đến tận tay người tiêu dùng giữ nguyên hương vị tươi ngon.' }
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--line)', position: 'relative' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--green-100)', WebkitTextStroke: '1px var(--green-700)', position: 'absolute', top: '14px', right: '16px' }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '15px', color: 'var(--green-900)', marginBottom: '6px', fontWeight: 700 }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SẢN PHẨM CÙNG DANH MỤC */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <div>
                <span className="eyebrow">Gợi ý nông sản</span>
                <h2 style={{ fontSize: '24px', color: 'var(--green-900)', marginTop: '6px' }}>Sản phẩm cùng danh mục {categoryName}</h2>
              </div>
              <Link href="/" style={{ fontSize: '13.5px', color: 'var(--green-700)', fontWeight: 600, textDecoration: 'none' }}>
                Xem tất cả →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {relatedProducts.map(rp => {
                const rpImg = rp.productImages && rp.productImages.length > 0
                  ? (rp.productImages.find((img: any) => img.isPrimary)?.imageUrl || rp.productImages[0].imageUrl)
                  : null;
                const rpRegion = getRegionByName(rp.productName);

                return (
                  <Link 
                    key={rp.productId} 
                    href={`/products/${rp.productId}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--line)', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
                      <div style={{ width: '100%', height: '170px', background: 'var(--green-100)', position: 'relative' }}>
                        {rpImg ? (
                          <img src={rpImg} alt={rp.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🥬</div>
                        )}
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--green-700)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px' }}>
                          {rp.status || 'VietGAP'}
                        </span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Xuất xứ: {rpRegion}</span>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--green-900)', marginTop: '4px', marginBottom: '8px', lineHeight: 1.3, height: '38px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rp.productName}
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green-700)' }}>
                            {rp.price.toLocaleString('vi-VN')}₫
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            / {rp.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* DRAWER GIỎ HÀNG */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} 
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 998,
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface)',
          zIndex: 999,
          boxShadow: '-4px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green-900)' }}>
            Giỏ hàng ({cart.reduce((s, i) => s + i.qty, 0)})
          </h3>
          <button onClick={() => setIsDrawerOpen(false)} style={{ padding: '6px', borderRadius: '50%', background: 'var(--bg)', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
              <p style={{ fontSize: '15px' }}>Giỏ hàng của bạn đang trống</p>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-ghost"
                style={{ marginTop: '16px', fontSize: '13px', padding: '10px 20px', borderRadius: '999px' }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={item.product.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--green-100)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥬</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{item.product.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: 600, marginTop: '2px' }}>{item.product.price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '20px', padding: '2px' }}>
                        <button onClick={() => updateCartQty(item.product.id, -1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg)', fontSize: '14px', fontWeight: 700 }}>-</button>
                        <span style={{ width: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg)', fontSize: '14px', fontWeight: 700 }}>+</button>
                      </div>
                      <button onClick={() => removeCartItem(item.product.id)} style={{ color: '#C0392B', fontSize: '12px', marginLeft: 'auto', background: 'none', cursor: 'pointer' }}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '15px' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Tạm tính:</span>
              <span style={{ fontWeight: 800, color: 'var(--green-700)', fontSize: '18px' }}>
                {subtotalNumber.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <button 
              onClick={() => {
                if (!currentUser) {
                  alert('Vui lòng đăng nhập trước khi thanh toán!');
                  router.push('/login');
                  return;
                }
                setIsDrawerOpen(false);
                router.push('/checkout');
              }}
              className="btn btn-accent" 
              style={{ width: '100%', padding: '14px', borderRadius: '999px', fontWeight: 700, fontSize: '15px' }}
            >
              Tiến hành thanh toán →
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', padding: '48px 0 24px' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '36px' }}>
          <div>
            <div className="logo" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green-900)' }}>LÀNH</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Hệ thống nông sản sạch minh bạch nguồn gốc từ hơn 120 nông trại hữu cơ chuẩn VietGAP &amp; GlobalGAP.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '14.5px', color: 'var(--green-900)', marginBottom: '12px' }}>Danh mục sản phẩm</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
              <Link href="/">Rau củ hữu cơ</Link>
              <Link href="/">Trái cây đặc sản</Link>
              <Link href="/">Rau thơm &amp; Gia vị</Link>
              <Link href="/">Hạt &amp; Đậu dinh dưỡng</Link>
              <Link href="/">Gạo đặc sản</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14.5px', color: 'var(--green-900)', marginBottom: '12px' }}>Cam kết dịch vụ</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
              <span>✓ 100% Không hóa chất BVTV</span>
              <span>✓ Giao lạnh nhanh trong 2 giờ</span>
              <span>✓ Đổi trả miễn phí trong 24 giờ</span>
              <span>✓ Truy xuất nguồn gốc QR lô hàng</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14.5px', color: 'var(--green-900)', marginBottom: '12px' }}>Liên hệ hỗ trợ</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Hotline: <strong>1900 8888</strong> (7h30 - 21h00)<br/>
              Email: nongsanlanh@lanhfarm.vn<br/>
              Trụ sở: TP. Hồ Chí Minh, Việt Nam
            </p>
          </div>
        </div>
        <div className="wrap" style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--line)', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
          © 2026 LÀNH Farm - Nông sản hữu cơ &amp; Truy xuất nguồn gốc.
        </div>
      </footer>
    </div>
  );
}
