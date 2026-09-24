'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/layout/SearchBar';

interface ComboItemInfo {
  name: string;
  weight: string;
  region: string;
  benefit: string;
  imageUrl: string;
}

export interface SelectableProduceItem {
  id: number;
  name: string;
  weight: string;
  region: string;
  category: string;
  benefit: string;
  imageUrl: string;
}

export const DALAT_PRODUCE_POOL: SelectableProduceItem[] = [
  {
    id: 1,
    name: 'Cải bó xôi hữu cơ (Spinach)',
    weight: '350g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Rau ăn lá',
    benefit: 'Giàu sắt, acid folic và chất chống oxy hóa tự nhiên',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    name: 'Cà rốt baby giòn ngọt',
    weight: '500g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Củ quả',
    benefit: 'Hàm lượng Beta-carotene dồi dào, tốt cho thị lực',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    name: 'Xà lách xoăn thủy canh Frisee',
    weight: '300g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Rau ăn lá',
    benefit: 'Tươi giòn mọng nước, lý tưởng cho món salad trộn',
    imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    name: 'Bí đỏ hồ lô hạt dẻ',
    weight: '1 quả (~800g)',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Củ quả',
    benefit: 'Vị ngọt bùi béo tự nhiên, bổ não và tăng đề kháng',
    imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    name: 'Súp lơ xanh bông lớn (Broccoli)',
    weight: '1 búp (~600g)',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Rau ăn hoa',
    benefit: 'Chứa Sulforaphane kháng viêm và thanh lọc tế bào',
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    name: 'Cà chua bi Cherry đỏ mọng',
    weight: '400g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Trái cây củ quả',
    benefit: 'Hàm lượng Lycopene cực cao, dưỡng da chống lão hóa',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 7,
    name: 'Bắp non (Ngô bao tử) giòn ngọt',
    weight: '500g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Củ quả',
    benefit: 'Ngọt bùi giòn xốp, nấu súp hoặc xào thịt thanh mát',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 8,
    name: 'Bơ sáp 034 dẻo béo',
    weight: '1.0 kg',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Trái cây đặc sản',
    benefit: 'Chứa acid béo Omega-3 không bão hòa tốt cho tim mạch',
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 9,
    name: 'Cải ngọt hữu cơ cọng giòn',
    weight: '500g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Rau ăn lá',
    benefit: 'Thanh nhiệt giải độc, nấu canh ngọt dịu tự nhiên',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 10,
    name: 'Nấm đùi gà tươi hữu cơ',
    weight: '300g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Nấm sạch',
    benefit: 'Giòn ngọt thơm lừng, bổ sung protein thực vật lành tính',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 11,
    name: 'Dưa leo baby giòn mát',
    weight: '800g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Củ quả',
    benefit: 'Cung cấp nước và khoáng chất, ăn sống giòn ngọt',
    imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 12,
    name: 'Cải xoăn Kale hữu cơ',
    weight: '350g',
    region: 'HTX Đà Lạt (Lâm Đồng)',
    category: 'Rau ăn lá',
    benefit: 'Nữ hoàng rau xanh giàu Vitamin K, Canxi và Lutein',
    imageUrl: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=300&auto=format&fit=crop&q=80'
  }
];

export interface SupplierProfile {
  id: number;
  name: string;
  shortName: string;
  region: string;
  badge: string;
  producePool: SelectableProduceItem[];
}

export const SUPPLIERS_PROFILES: SupplierProfile[] = [
  {
    id: 1,
    name: 'Hợp tác xã Nông Sản Đà Lạt (Lâm Đồng)',
    shortName: 'HTX Đà Lạt',
    region: 'Đà Lạt & Lạc Dương (Lâm Đồng)',
    badge: 'Rau củ ôn đới & quả ngọt mát',
    producePool: DALAT_PRODUCE_POOL
  },
  {
    id: 2,
    name: 'Hợp tác xã Rau Sạch Miền Tây (Đồng Tháp)',
    shortName: 'HTX Rau Miền Tây',
    region: 'Đồng Tháp & Cần Thơ (ĐBSCL)',
    badge: 'Rau ruộng phù sa & thủy sinh',
    producePool: [
      { id: 201, name: 'Bầu sao non Miền Tây', weight: '1 quả (~700g)', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Củ quả', benefit: 'Thanh nhiệt giải độc, nấu canh tôm ngọt mát', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80' },
      { id: 202, name: 'Rau dền đỏ hữu cơ phù sa', weight: '500g', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Rau ăn lá', benefit: 'Giàu sắt và vitamin A, nấu canh bổ huyết', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80' },
      { id: 203, name: 'Mướp hương quê ngọt lịm', weight: '2 quả (~600g)', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Củ quả', benefit: 'Hương thơm tự nhiên, thanh nhiệt mát gan', imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80' },
      { id: 204, name: 'Đậu bắp baby xanh giòn', weight: '500g', region: 'HTX Rau Miền Tây (Cần Thơ)', category: 'Củ quả', benefit: 'Chất nhầy tự nhiên bảo vệ niêm mạc dạ dày', imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80' },
      { id: 205, name: 'Dưa leo Nam Bộ cọng giòn', weight: '800g', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Củ quả', benefit: 'Nhiều nước, giải khát và làm đẹp da', imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300&auto=format&fit=crop&q=80' },
      { id: 206, name: 'Khổ qua rừng trái nhỏ', weight: '400g', region: 'HTX Rau Miền Tây (An Giang)', category: 'Củ quả', benefit: 'Hạ đường huyết, tăng cường tiêu hóa', imageUrl: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=300&auto=format&fit=crop&q=80' },
      { id: 207, name: 'Rau mồng tơi vườn nhà', weight: '500g', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Rau ăn lá', benefit: 'Nhuận tràng, giải nhiệt mùa hè rất tốt', imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop&q=80' },
      { id: 208, name: 'Cải thìa trắng xào tỏi', weight: '500g', region: 'HTX Rau Miền Tây (Cần Thơ)', category: 'Rau ăn lá', benefit: 'Giòn ngọt cọng dày, giàu vitamin C và chất xơ', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80' },
      { id: 209, name: 'Bông bí tươi hái sớm', weight: '300g', region: 'HTX Rau Miền Tây (Đồng Tháp)', category: 'Rau ăn hoa', benefit: 'Đặc sản đồng quê xào tỏi giòn bùi bổ dưỡng', imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 3,
    name: 'Hợp tác xã Trái Cây Việt (Đồng Nai & Bến Tre)',
    shortName: 'HTX Trái Cây Việt',
    region: 'Đồng Nai & Bến Tre',
    badge: 'Trái cây đặc sản chín cây',
    producePool: [
      { id: 301, name: 'Xoài cát Hòa Lộc chín cây', weight: '1.2 kg', region: 'HTX Trái Cây Việt (Tiền Giang)', category: 'Trái cây đặc sản', benefit: 'Thơm lừng, thịt dẻo ngọt đậm đà trứ danh', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=80' },
      { id: 302, name: 'Bưởi da xanh ruột hồng', weight: '1 quả (~1.4kg)', region: 'HTX Trái Cây Việt (Bến Tre)', category: 'Trái cây đặc sản', benefit: 'Tép đỏ giòn mọng, ráo nước không hạt', imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&auto=format&fit=crop&q=80' },
      { id: 303, name: 'Cam sành Bến Tre mọng nước', weight: '1.5 kg', region: 'HTX Trái Cây Việt (Bến Tre)', category: 'Trái cây đặc sản', benefit: 'Giàu vitamin C tự nhiên, vỏ mỏng tép vàng', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&auto=format&fit=crop&q=80' },
      { id: 304, name: 'Chôm chôm nhãn giòn ngọt', weight: '1.0 kg', region: 'HTX Trái Cây Việt (Đồng Nai)', category: 'Trái cây đặc sản', benefit: 'Tróc vỏ, cơm giòn ngọt lịm thơm mát', imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&auto=format&fit=crop&q=80' },
      { id: 305, name: 'Chuối Laba dẻo thơm', weight: '1 nải (~1.2kg)', region: 'HTX Trái Cây Việt (Lâm Đồng)', category: 'Trái cây đặc sản', benefit: 'Giàu kali, dẻo ngọt tự nhiên tốt tiêu hóa', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80' },
      { id: 306, name: 'Thanh long ruột đỏ VietGAP', weight: '1.2 kg', region: 'HTX Trái Cây Việt (Bình Thuận)', category: 'Trái cây đặc sản', benefit: 'Chống oxy hóa, màu đỏ tự nhiên ngọt thanh', imageUrl: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=300&auto=format&fit=crop&q=80' },
      { id: 307, name: 'Mít Thái giòn bóc múi sẵn', weight: '500g', region: 'HTX Trái Cây Việt (Tiền Giang)', category: 'Trái cây đặc sản', benefit: 'Múi dày vàng óng, giòn rụm ngọt ngào', imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 4,
    name: 'HTX Nông Nghiệp An Phú (Đơn Dương - Lâm Đồng)',
    shortName: 'HTX An Phú',
    region: 'Đơn Dương (Lâm Đồng)',
    badge: 'Nông nghiệp công nghệ cao GlobalGAP',
    producePool: [
      { id: 401, name: 'Cà chua beef GlobalGAP quả to', weight: '600g', region: 'HTX An Phú (Đơn Dương)', category: 'Củ quả công nghệ cao', benefit: 'Thịt quả dày mọng, chuyên làm sốt và nướng', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80' },
      { id: 402, name: 'Ớt chuông Sweet ba màu', weight: '500g', region: 'HTX An Phú (Đơn Dương)', category: 'Củ quả công nghệ cao', benefit: 'Giàu Vitamin A & C, ăn sống giòn không hăng cay', imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&auto=format&fit=crop&q=80' },
      { id: 403, name: 'Cà chua bi sô-cô-la ngọt đậm', weight: '400g', region: 'HTX An Phú (Đơn Dương)', category: 'Củ quả công nghệ cao', benefit: 'Vị ngọt đậm đà, màu nâu sô-cô-la giàu dưỡng chất', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80' },
      { id: 404, name: 'Xà lách Romaine hữu cơ nhà màng', weight: '400g', region: 'HTX An Phú (Đơn Dương)', category: 'Rau ăn lá', benefit: 'Thân lá giòn mướt, tuyệt vời làm salad Caesar', imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop&q=80' },
      { id: 405, name: 'Cần tây hữu cơ giòn ngọt ép nước', weight: '600g', region: 'HTX An Phú (Đơn Dương)', category: 'Rau ăn lá', benefit: 'Thanh lọc cơ thể, hỗ trợ thanh nhiệt và sáng da', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80' },
      { id: 406, name: 'Dưa leo Baby snack giòn tan', weight: '500g', region: 'HTX An Phú (Đơn Dương)', category: 'Củ quả', benefit: 'Vỏ mỏng không đắng, ăn trực tiếp giòn rụm', imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=300&auto=format&fit=crop&q=80' },
      { id: 407, name: 'Củ dền đỏ bổ máu', weight: '600g', region: 'HTX An Phú (Đơn Dương)', category: 'Củ quả', benefit: 'Giàu Folate và Nitrat tự nhiên, tốt cho huyết áp', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80' },
      { id: 408, name: 'Nấm ngọc châm trắng hữu cơ', weight: '300g', region: 'HTX An Phú (Đơn Dương)', category: 'Nấm sạch', benefit: 'Thân dài giòn thơm, nấu súp hoặc xào nấm tuyệt hảo', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' }
    ]
  }
];

function getComboSlotCount(id: number): number {
  if (id === 902 || id === 905) return 5; // Gia Đình Lớn: 5 món
  if (id === 903 || id === 906 || id === 908 || id === 909) return 4; // Thuần Chay / Trái Cây / Lẩu: 4 món
  return 3; // Gia Đình Nhỏ (901, 904) hoặc Ăn Dặm (907) / Salad (910): 3 món
}

interface ComboDetail {
  id: number;
  name: string;
  subtitle: string;
  desc: string;
  badge?: string;
  weekPrice: number;
  monthPrice: number;
  rating: number;
  reviewsCount: number;
  servingSize: string;
  gallery: string[];
  features: string[];
  items: ComboItemInfo[];
  harvestProcess: Array<{ time: string; step: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  customerReviews: Array<{ author: string; role: string; date: string; rating: number; comment: string }>;
}

const combosDatabase: Record<number, ComboDetail> = {
  901: {
    id: 901,
    name: 'Combo Gia Đình Nhỏ (Tuần)',
    subtitle: 'Nông sản sạch theo mùa tuyển chọn cho gia đình 2–3 người nấu ăn mỗi ngày',
    desc: 'Giải pháp đi chợ thông minh dành cho gia đình trẻ. Giỏ combo cung cấp đầy đủ 4 nhóm chất cần thiết gồm rau ăn lá giàu diệp lục, củ quả hữu cơ giàu chất xơ hòa tan và trái cây chín cây giàu vitamin. Toàn bộ được thu hoạch sớm tại vườn lúc 4h sáng và giao ngay trong ngày.',
    badge: 'Phổ biến nhất',
    weekPrice: 189000,
    monthPrice: 680000,
    rating: 4.9,
    reviewsCount: 142,
    servingSize: '2 - 3 người (Khoảng 5 - 6 bữa ăn nấu tại nhà)',
    gallery: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      '4 loại rau ăn lá & củ quả theo mùa chuẩn VietGAP & Hữu cơ',
      '2 loại trái cây đặc sản chín cây thu hoạch trong ngày',
      'Giao tận bếp định kỳ vào Thứ 3 hoặc Thứ 6 hàng tuần',
      'Miễn phí đổi loại rau củ không hợp khẩu vị trước 24 giờ',
      'Freeship 100% trong bán kính 10km nội thành'
    ],
    items: [
      {
        name: 'Cải bó xôi hữu cơ (Spinach)',
        weight: '350g',
        region: 'Đà Lạt (Lâm Đồng)',
        benefit: 'Giàu sắt, acid folic và chất chống oxy hóa tự nhiên',
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Cà rốt baby giòn ngọt',
        weight: '500g',
        region: 'Mộc Châu (Sơn La)',
        benefit: 'Hàm lượng Beta-carotene dồi dào, tốt cho thị lực và làn da',
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Xà lách xoăn thủy canh Frisee',
        weight: '300g',
        region: 'Đà Lạt (Lâm Đồng)',
        benefit: 'Tươi giòn mọng nước, lý tưởng cho món salad trộn thanh nhiệt',
        imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Bí đỏ hồ lô hạt dẻ',
        weight: '1 quả (~800g)',
        region: 'Đắk Lắk (Tây Nguyên)',
        benefit: 'Vị ngọt bùi béo tự nhiên, bổ não và tăng sức đề kháng',
        imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Cam sành Cao Phong chín mọng',
        weight: '1.2 kg',
        region: 'Hòa Bình',
        benefit: 'Cung cấp 100% nhu cầu Vitamin C hàng ngày cho cả gia đình',
        imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Bơ sáp 034 dẻo béo',
        weight: '1.0 kg',
        region: 'Bảo Lộc (Lâm Đồng)',
        benefit: 'Chứa chất béo đơn không bão hòa Omega-3 có lợi cho tim mạch',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80'
      }
    ],
    harvestProcess: [
      { time: '04:00 Sáng', step: 'Thu hoạch thủ công', desc: 'Xã viên thu hoạch nông sản lúc sương sớm để giữ trọn vẹn độ giòn ngọt và dưỡng chất tự nhiên.' },
      { time: '06:30 Sáng', step: 'Kiểm định & Sơ chế', desc: 'Rửa sục ozone khử khuẩn, phân loại kích cỡ và đóng gói trong túi thở sinh học tự hủy.' },
      { time: '08:00 Sáng', step: 'Vận chuyển xe lạnh', desc: 'Xếp giỏ nông sản vào thùng giữ nhiệt bảo ôn 12-15°C để rau củ không bị héo úa trên đường.' },
      { time: '09:30 - 11:30', step: 'Giao tận cửa bếp', desc: 'Shipper chuyên trách trao tận tay khách hàng kèm biên bản truy xuất nguồn gốc từng món.' }
    ],
    faqs: [
      { q: 'Nếu trong combo có món tôi không thích ăn thì sao?', a: 'Bạn chỉ cần nhắn tin hoặc báo qua Hotline 1900 8899 trước 24 giờ ngày giao, LÀNH sẽ đổi sang loại nông sản khác có giá trị tương đương hoàn toàn miễn phí.' },
      { q: 'Gia đình tôi đi công tác hoặc du lịch có được tạm hoãn gói không?', a: 'Hoàn toàn được! Bạn có thể tạm dừng gói trong 1 - 4 tuần. Lượt giao chưa dùng sẽ được bảo lưu tự động sang các tuần kế tiếp mà không phát sinh bất kỳ khoản phí nào.' },
      { q: 'Rau củ bảo quản trong tủ lạnh được bao lâu?', a: 'Do rau được hái tươi và giao ngay trong ngày (không qua kho tồn), rau ăn lá giữ tươi ngon từ 5-7 ngày, củ quả và trái cây để được từ 10-15 ngày trong ngăn mát tủ lạnh.' },
      { q: 'Tôi có thể thanh toán từng tuần hay trả trước cả tháng?', a: 'Bạn có thể chọn thanh toán theo từng tuần khi nhận hàng (COD) hoặc đăng ký gói tháng qua chuyển khoản/MoMo để được giảm giá thêm 10% và miễn phí vận chuyển trọn vẹn.' }
    ],
    customerReviews: [
      { author: 'Chị Mai Lan', role: 'Nhân viên văn phòng - Q.7, TP.HCM', date: '08/09/2026', rating: 5, comment: 'Từ ngày đăng ký combo tuần của LÀNH mình không cần phải dậy sớm đi chợ nữa. Rau củ tươi rói, nấu canh ngọt lịm. Đặc biệt là cam Cao Phong mọng nước và ngọt thanh.' },
      { author: 'Anh Quốc Bảo', role: 'Kỹ sư công nghệ - Cầu Giấy, Hà Nội', date: '04/09/2026', rating: 5, comment: 'Đóng gói rất sạch sẽ, túi giấy bảo vệ môi trường. Cải bó xôi và bơ 034 chất lượng vượt trội so với siêu thị gần nhà. Đáng tiền từng đồng.' },
      { author: 'Cô Thanh Hằng', role: 'Nội trợ - Hải Châu, Đà Nẵng', date: '01/09/2026', rating: 5, comment: 'Nhà có 2 vợ chồng và bé 3 tuổi dùng gói này vừa vặn trong tuần, không bị thừa mứa vứt bỏ lãng phí. Tuần trước đổi bắp cải lấy súp lơ xanh được hỗ trợ rất nhiệt tình.' }
    ]
  },
  902: {
    id: 902,
    name: 'Combo Gia Đình Lớn (Tuần)',
    subtitle: 'Khẩu phần thịnh soạn cho gia đình 4–6 thành viên với thực đơn rau củ quả phong phú',
    desc: 'Combo thiết kế chuyên biệt cho gia đình nhiều thế hệ (ông bà, bố mẹ và con nhỏ). Giỏ combo dung lượng lớn gồm 7 loại rau xanh hữu cơ đa dạng, 3 loại trái cây đặc sản đạt chuẩn VietGAP/GlobalGAP và tặng kèm 1 vỉ trứng gà ta thảo mộc mỗi tuần.',
    badge: 'Tiết kiệm 15%',
    weekPrice: 329000,
    monthPrice: 1180000,
    rating: 5.0,
    reviewsCount: 98,
    servingSize: '4 - 6 người (Khoảng 10 - 14 bữa ăn đầy đủ rau xanh)',
    gallery: [
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      '7 loại rau xanh và củ quả hữu cơ đa dạng sắc màu',
      '3 loại trái cây thượng hạng đạt chuẩn VietGAP & GlobalGAP',
      'Tặng kèm 1 vỉ trứng gà ta thả vườn ăn thảo mộc (10 quả)',
      'Giao định kỳ đúng hẹn tận bếp theo khung giờ bạn chọn',
      'Được ưu tiên chọn các loại đặc sản vụ mùa sản lượng hiếm'
    ],
    items: [
      { name: 'Cải ngọt hữu cơ cọng giòn', weight: '600g', region: 'Đà Lạt', benefit: 'Thanh nhiệt giải độc, giàu chất xơ', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80' },
      { name: 'Súp lơ xanh bông lớn (Broccoli)', weight: '1 búp (~600g)', region: 'Đà Lạt', benefit: 'Chứa Sulforaphane kháng viêm và hỗ trợ ngừa ung thư', imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop&q=80' },
      { name: 'Cà chua bi Cherry đỏ mọng', weight: '400g', region: 'Đà Lạt', benefit: 'Hàm lượng Lycopene cực cao, chống oxy hóa', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80' },
      { name: 'Bắp cải giòn ngọt Mộc Châu', weight: '1 bắp (~1.2kg)', region: 'Mộc Châu', benefit: 'Lá dày cuộn chặt, giữ vị ngọt tự nhiên khi luộc xào', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80' },
      { name: 'Khoai lang mật nướng dẻo', weight: '1.5 kg', region: 'Đắk Lắk', benefit: 'Chỉ số đường huyết thấp, giàu khoáng chất', imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80' },
      { name: 'Bưởi da xanh ruột hồng Bến Tre', weight: '1 quả (~1.5kg)', region: 'Bến Tre', benefit: 'Tép bưởi mọng tróc vỏ dễ dàng, ngọt đậm không the', imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&auto=format&fit=crop&q=80' },
      { name: 'Dâu tây Mộc Châu giống Nhật', weight: '300g', region: 'Mộc Châu', benefit: 'Thơm ngào ngạt, vị chua ngọt hài hòa cho bé ăn vặt', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop&q=80' },
      { name: 'Trứng gà ta thảo mộc (Quà tặng)', weight: 'Vỉ 10 quả', region: 'Ba Vì (Hà Nội)', benefit: 'Lòng đỏ vàng sậm đậm đà, không kháng sinh', imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=300&auto=format&fit=crop&q=80' }
    ],
    harvestProcess: [
      { time: '04:00 Sáng', step: 'Thu hoạch đồng loạt', desc: 'Chọn lọc tại 3 nhà màng liên kết VietGAP quy chuẩn.' },
      { time: '06:00 Sáng', step: 'Khử khuẩn ozone', desc: 'Loại bỏ hoàn toàn bụi cát và tạp chất hữu cơ tự nhiên.' },
      { time: '07:30 Sáng', step: 'Kiểm soát nhiệt độ', desc: 'Bảo quản mát liên tục trong suốt hành trình xe thùng lạnh.' },
      { time: '09:00 - 11:30', step: 'Bàn giao đến nhà', desc: 'Giao kiện hàng lớn đóng thùng bảo ôn giữ lạnh sạch đẹp.' }
    ],
    faqs: [
      { q: 'Gói lớn có tặng thêm gì không?', a: 'Mỗi tuần bạn được tặng 1 vỉ 10 trứng gà ta thả vườn ăn thảo mộc tươi mới.' },
      { q: 'Có thể chia làm 2 lần giao trong 1 tuần được không?', a: 'Với gói lớn bạn có thể yêu cầu tách làm 2 lần giao (Thứ 3 và Thứ 6) với phụ phí ship ưu đãi chỉ 15.000₫/lượt phụ.' }
    ],
    customerReviews: [
      { author: 'Chị Bích Trâm', role: 'Gia đình 5 người - Cầu Giấy, Hà Nội', date: '06/09/2026', rating: 5, comment: 'Thùng nông sản rất to và chất lượng. Bắp cải ngọt lịm, dâu tây bé nhà mình mê tít. Cả nhà ăn cả tuần vẫn còn tươi ngon.' },
      { author: 'Bác Minh Tâm', role: 'Cán bộ hưu trí - Q.Bình Thạnh, TP.HCM', date: '02/09/2026', rating: 5, comment: 'Rau ăn lá rất non và thơm mùi rau truyền thống, không bị nhớt như mua ngoài chợ. Rất an tâm cho sức khỏe người già.' }
    ]
  },
  903: {
    id: 903,
    name: 'Combo Thuần Chay Sạch (Tuần)',
    subtitle: 'Cung cấp nguồn đạm thực vật tinh sạch, vitamin & khoáng chất cân bằng cho người ăn chay',
    desc: 'Thiết kế khoa học cho người ăn chay trường, ăn chay bán phần hoặc theo đuổi chế độ thực dưỡng thanh lọc cơ thể. Giỏ hàng tập trung vào các loại nấm sạch nuôi trồng tự nhiên, đậu hũ non hữu cơ, ngũ cốc đặc sản và các loại rau lá giàu đạm thực vật.',
    badge: 'Thuần chay 100%',
    weekPrice: 249000,
    monthPrice: 895000,
    rating: 4.8,
    reviewsCount: 76,
    servingSize: '2 - 3 người ăn chay trường',
    gallery: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      '6 loại rau củ & nấm tươi hữu cơ giàu đạm thực vật',
      '2 loại hạt dinh dưỡng / ngũ cốc đặc sản không chất bảo quản',
      'Đạt chứng nhận hữu cơ không phân bón hóa học',
      'Kèm cẩm nang thực đơn gợi ý món chay ngon mỗi ngày'
    ],
    items: [
      { name: 'Nấm đùi gà tươi hữu cơ', weight: '250g', region: 'Đà Lạt', benefit: 'Giòn ngọt, giàu Protein và Polysaccharide tăng miễn dịch', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' },
      { name: 'Nấm bào ngư xám sạch', weight: '300g', region: 'Đồng Nai', benefit: 'Thịt nấm dày, bổ sung acid amin thiết yếu cho cơ thể', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' },
      { name: 'Đậu hũ non hữu cơ làm thủ công', weight: '2 hộp (~500g)', region: 'LÀNH Kitchen', benefit: 'Làm từ 100% hạt đậu nành không biến đổi gen (Non-GMO)', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=300&auto=format&fit=crop&q=80' },
      { name: 'Cải xoăn Kale hữu cơ Đà Lạt', weight: '350g', region: 'Đà Lạt', benefit: 'Siêu thực phẩm xanh giàu Vitamin K, Canxi và Lutein', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop&q=80' },
      { name: 'Hạt sen tươi Huế bóc vỏ bỏ tim', weight: '250g', region: 'Huế', benefit: 'Dưỡng tâm an thần, cải thiện chất lượng giấc ngủ', imageUrl: 'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=300&auto=format&fit=crop&q=80' },
      { name: 'Gạo lứt huyết rồng hữu cơ', weight: '1.0 kg', region: 'Sóc Trăng', benefit: 'Giàu chất xơ, vitamin nhóm B và khoáng chất tự nhiên', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80' }
    ],
    harvestProcess: [
      { time: '04:30 Sáng', step: 'Hái nấm & Rau tươi', desc: 'Nấm được thu hái đúng lứa giữ độ giòn ngọt tối đa.' },
      { time: '06:30 Sáng', step: 'Đóng hộp bảo quản', desc: 'Đậu hũ non và nấm được đóng khay chuyên dụng chống dập nát.' },
      { time: '08:30 Sáng', step: 'Chuyển xe lạnh', desc: 'Giữ nhiệt độ ổn định để nấm tươi nguyên vẹn dưỡng chất.' }
    ],
    faqs: [
      { q: 'Người ăn chay trường dùng gói này có bị thiếu chất không?', a: 'Không hề, thực đơn được đội ngũ chuyên gia dinh dưỡng cân đối tỷ lệ đạm thực vật từ nấm, hạt và vitamin từ rau củ để đảm bảo năng lượng tràn trề suốt tuần.' }
    ],
    customerReviews: [
      { author: 'Chị Diệu Tâm', role: 'Phật tử - Q.10, TP.HCM', date: '05/09/2026', rating: 5, comment: 'Đậu hũ non béo ngậy và thơm lừng mùi đậu nành quê. Nấm tươi sạch không hề có mùi thuốc khử. Rất biết ơn LÀNH đã có gói này.' }
    ]
  },
  907: {
    id: 907,
    name: 'Combo Ăn Dặm Hữu Cơ Bé Yêu',
    subtitle: 'Nông sản công nghệ cao GlobalGAP chọn lọc độ tuổi ăn dặm cho bé',
    desc: 'Thiết kế riêng cho các mẹ chăm bé bắt đầu ăn dặm hoặc ăn thô. Nông sản canh tác nhà màng đạt chuẩn GlobalGAP từ HTX An Phú, không dư lượng thuốc BVTV, giàu khoáng chất tự nhiên.',
    badge: 'Chương trình HTX',
    weekPrice: 195000,
    monthPrice: 720000,
    rating: 4.9,
    reviewsCount: 64,
    servingSize: 'Bé từ 6 - 24 tháng (Chế biến ăn dặm cả tuần)',
    gallery: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      '100% nông sản canh tác nhà màng không phun thuốc hóa học',
      'Củ quả ngọt tự nhiên, dễ nghiền mịn và hấp chín',
      'Chứng nhận GlobalGAP kiểm nghiệm kim loại nặng',
      'Giao tận nơi định kỳ vào buổi sáng sớm'
    ],
    items: [],
    harvestProcess: [
      { time: '05:00 Sáng', step: 'Thu hoạch nhà màng', desc: 'Thu hoạch quả củ đúng độ non ngọt tự nhiên cho bé.' },
      { time: '07:00 Sáng', step: 'Sơ chế & Kiểm định vi sinh', desc: 'Khử khuẩn bằng nước ion kiềm, đóng khay đạt chuẩn.' },
      { time: '09:00 Sáng', step: 'Giao tận cửa', desc: 'Vận chuyển giữ lạnh giao đến tay mẹ bỉm sữa.' }
    ],
    faqs: [
      { q: 'Sản phẩm có an toàn tuyệt đối cho bé ăn dặm?', a: 'Toàn bộ nông sản được kiểm nghiệm định kỳ chỉ số nitrat và kim loại nặng đạt chuẩn an toàn cho trẻ sơ sinh và trẻ nhỏ.' }
    ],
    customerReviews: [
      { author: 'Mẹ Bắp', role: 'Mẹ bỉm sữa - Bình Thạnh, TP.HCM', date: '12/09/2026', rating: 5, comment: 'Bé nhà mình mới ăn dặm, trộm vía bí đỏ và cà rốt nghiền ngọt lịm bé ăn hết veo. Yên tâm hơn mua ngoài chợ nhiều.' }
    ]
  },
  908: {
    id: 908,
    name: 'Combo Trái Cây Miệt Vườn Nam Bộ',
    subtitle: 'Hương vị trái cây nhiệt đới chín cây thơm ngọt từ HTX Trái Cây Việt',
    desc: 'Tuyển chọn những loại trái cây đặc sản nổi tiếng Nam Bộ như Xoài cát Hòa Lộc, Bưởi da xanh ruột hồng, Cam sành, Chôm chôm nhãn... Được hái đúng lứa chín cây tự nhiên, không ủ hóa chất ép chín.',
    badge: 'Đặc sản chín cây',
    weekPrice: 269000,
    monthPrice: 980000,
    rating: 5.0,
    reviewsCount: 88,
    servingSize: '3 - 5 người (Trái cây tươi tráng miệng cả tuần)',
    gallery: [
      'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Trái cây hái trực tiếp từ vườn Bến Tre & Tiền Giang',
      'Độ ngọt tự nhiên (Brix cao), không ngâm thuốc kích chín',
      'Bảo hiểm tươi ngon dập nát 1 đổi 1 tận nơi'
    ],
    items: [],
    harvestProcess: [
      { time: '05:30 Sáng', step: 'Hái trái chín cây', desc: 'Chọn những trái đạt độ đường cao nhất trên cây.' },
      { time: '08:00 Sáng', step: 'Bọc xốp chống dập', desc: 'Đóng thùng chuyên dụng có lỗ thở bảo quản tươi mới.' },
      { time: '10:00 Sáng', step: 'Giao hàng', desc: 'Chuyển thẳng từ nhà vườn đến bàn ăn.' }
    ],
    faqs: [
      { q: 'Trái cây có bị xanh sượng không?', a: 'Nhà vườn cam kết trái cây chín già tự nhiên, ngọt đậm thơm nức mũi.' }
    ],
    customerReviews: [
      { author: 'Chị Ngọc Mai', role: 'Văn phòng - Q.1, TP.HCM', date: '10/09/2026', rating: 5, comment: 'Bưởi da xanh tép hồng giòn rụm, xoài cát thơm lừng cả phòng. Trái cây chuẩn miệt vườn ăn khác biệt hẳn.' }
    ]
  },
  909: {
    id: 909,
    name: 'Combo Rau Đồng Nấu Lẩu Thực Dưỡng',
    subtitle: 'Bộ sưu tập rau đồng ruộng phù sa dân dã thanh mát từ HTX Rau Sạch Miền Tây',
    desc: 'Tập hợp các loại rau đồng quê ngọt thanh giải nhiệt: Bầu sao, rau mồng tơi, mướp hương, rau dền đỏ, đậu bắp non, bông bí. Rất thích hợp cho các bữa cơm gia đình đầm ấm hoặc lẩu cá, lẩu cua đồng.',
    badge: 'Hương vị quê nhà',
    weekPrice: 175000,
    monthPrice: 640000,
    rating: 4.8,
    reviewsCount: 52,
    servingSize: '3 - 4 người (Thực đơn cơm canh ngọt mát)',
    gallery: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570586435880-8031c5107297?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Rau đồng phù sa mọc tự nhiên trên đất sông Tiền, sông Hậu',
      'Hái sương sớm mỗi sáng, tươi non không xơ',
      'Được nhặt sạch rễ sơ bộ trước khi đóng túi'
    ],
    items: [],
    harvestProcess: [
      { time: '04:00 Sáng', step: 'Hái rau đồng', desc: 'Bà con nông dân hái rau non trong sương sớm.' },
      { time: '06:00 Sáng', step: 'Rửa nước giếng khoan', desc: 'Làm sạch bùn phù sa và đóng gói thoáng khí.' }
    ],
    faqs: [
      { q: 'Rau để được bao lâu trong tủ lạnh?', a: 'Rau tươi tự nhiên nên giữ được 5-7 ngày trong ngăn mát túi zip.' }
    ],
    customerReviews: [
      { author: 'Cô Ba Thu', role: 'Nội trợ - Q.5, TP.HCM', date: '07/09/2026', rating: 5, comment: 'Rau dền và mồng tơi nấu canh cua ngọt ngào hương vị quê nhà. Nhớ lại bữa cơm mẹ nấu ngày xưa.' }
    ]
  },
  910: {
    id: 910,
    name: 'Combo Salad Eat-Clean Năng Lượng',
    subtitle: 'Xà lách thủy canh, cải xoăn Kale và củ quả giòn ngọt giữ dáng đẹp da',
    desc: 'Giải pháp hoàn hảo cho người tập luyện thể thao, theo chế độ Eat-Clean, Keto hoặc giảm cân lành mạnh. Cung cấp nguồn chất xơ, vitamin và khoáng chất dồi dào ít calo.',
    badge: 'Eat-Clean Healthy',
    weekPrice: 215000,
    monthPrice: 790000,
    rating: 4.9,
    reviewsCount: 71,
    servingSize: '1 - 2 người (Ăn kèm salad hoặc ép nước xanh cả tuần)',
    gallery: [
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Xà lách Frisee, Romaine giòn mọng chuẩn nhà kính Đà Lạt',
      'Cải Kale hữu cơ bổ dưỡng ép nước detox thanh lọc cơ thể',
      'Cà chua cherry ngọt mọng nước ăn trực tiếp'
    ],
    items: [],
    harvestProcess: [
      { time: '04:30 Sáng', step: 'Cắt tỉa xà lách thủy canh', desc: 'Giữ nguyên gốc xốp giữ ẩm đến khi giao.' }
    ],
    faqs: [
      { q: 'Rau có rửa ăn liền được không?', a: 'Rau trồng thủy canh nhà kính rất sạch, bạn chỉ cần tráng qua nước lọc là dùng được ngay.' }
    ],
    customerReviews: [
      { author: 'Chị Hà My', role: 'HLV Yoga - Phú Nhuận, TP.HCM', date: '11/09/2026', rating: 5, comment: 'Xà lách giòn rụm và ngọt mát, cải Kale ép nước không hề bị đắng. Mình đã đăng ký gói tháng luôn rồi!' }
    ]
  }
};

// Fallback logic nếu combo là 904, 905, 906 (Combo Tháng tương ứng của 901, 902, 903)
function getComboData(id: number): ComboDetail {
  if (combosDatabase[id]) return combosDatabase[id];
  if (id === 904) {
    const base = combosDatabase[901];
    return {
      ...base,
      id: 904,
      name: 'Combo Gia Đình Nhỏ (Tháng)',
      subtitle: 'Giao 4 đợt / tháng — Tiết kiệm hơn, thực đơn xoay vòng tươi mới mỗi tuần',
      badge: 'Tiết kiệm 10%'
    };
  }
  if (id === 905) {
    const base = combosDatabase[902];
    return {
      ...base,
      id: 905,
      name: 'Combo Gia Đình Lớn (Tháng)',
      subtitle: 'Giao 4 đợt / tháng trọn vẹn chăm sóc sức khỏe cả nhà suốt tháng',
      badge: 'Tiết kiệm 18%'
    };
  }
  if (id === 906) {
    const base = combosDatabase[903];
    return {
      ...base,
      id: 906,
      name: 'Combo Thuần Chay Sạch (Tháng)',
      subtitle: 'Giao 4 đợt / tháng dinh dưỡng cân bằng và thanh lọc cơ thể bền vững',
      badge: 'Tiết kiệm 12%'
    };
  }
  // Fallback mặc định về 901
  return combosDatabase[901];
}

export default function ComboDetailPage() {
  const params = useParams();
  const router = useRouter();
  const comboId = Number(params.id) || 901;
  const combo = getComboData(comboId);

  // Chu kỳ gói: Tuần (1 lần/tuần), 2 Tuần (2 lần giao), Tháng (4 lần giao)
  const [selectedFreq, setSelectedFreq] = useState<'week' | 'biweek' | 'month'>(comboId >= 904 ? 'month' : 'week');
  // Ngày giao ưu tiên: Đủ 7 ngày từ Thứ 2 tới Chủ Nhật
  const [deliveryDay, setDeliveryDay] = useState<string>('Thứ 3');
  // Khung giờ giao: Chỉ hoạt động từ 7h tới 17h
  const [deliverySlot, setDeliverySlot] = useState<string>('07:00 - 09:30 (Sáng sớm)');
  // Số lượng gói
  const [quantity, setQuantity] = useState<number>(1);
  // Active Tab: Bỏ tab items, mặc định hiển thị reviews
  const [activeTab, setActiveTab] = useState<'reviews' | 'process' | 'faqs'>('reviews');
  // Selected Image trong gallery
  const [activeImage, setActiveImage] = useState<string>(combo.gallery[0]);

  // Customizable Produce Picker state
  const maxSlots = getComboSlotCount(combo.id);

  // Xác định Nhà cung cấp ban đầu
  const getInitialSupplierId = (id: number): number => {
    if (id === 908) return 3; // HTX Trái Cây Việt
    if (id === 909) return 2; // HTX Rau Miền Tây
    if (id === 907) return 4; // HTX An Phú
    return 1; // HTX Đà Lạt
  };

  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(() => getInitialSupplierId(combo.id));
  const activeSupplier = SUPPLIERS_PROFILES.find(s => s.id === selectedSupplierId) || SUPPLIERS_PROFILES[0];
  const comboSupplier = activeSupplier.name;

  // State lưu danh sách món nông sản do khách hàng tự chọn từ pool của nhà cung cấp hiện tại
  const [selectedProduce, setSelectedProduce] = useState<SelectableProduceItem[]>(() => {
    const sup = SUPPLIERS_PROFILES.find(s => s.id === getInitialSupplierId(combo.id)) || SUPPLIERS_PROFILES[0];
    return sup.producePool.slice(0, maxSlots);
  });

  // Chuyển đổi Nhà Cung Cấp: Cập nhật pool nông sản tương ứng (100% cùng 1 NCC)
  const handleSelectSupplier = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    const newSup = SUPPLIERS_PROFILES.find(s => s.id === supplierId) || SUPPLIERS_PROFILES[0];
    setSelectedProduce(newSup.producePool.slice(0, maxSlots));
    showNotification(`Đã chuyển sang ${newSup.name}. Danh mục nông sản đã được cập nhật!`);
  };

  const toggleSelectProduce = (item: SelectableProduceItem) => {
    const isSelected = selectedProduce.some(x => x.id === item.id);
    if (isSelected) {
      if (selectedProduce.length <= 1) {
        showNotification('Giỏ combo cần có ít nhất 1 món nông sản!');
        return;
      }
      setSelectedProduce(prev => prev.filter(x => x.id !== item.id));
    } else {
      if (selectedProduce.length >= maxSlots) {
        showNotification(`Gói combo này bạn được chọn tối đa ${maxSlots} món. Hãy bấm bỏ bớt 1 món trước khi chọn món mới nhé!`);
        return;
      }
      setSelectedProduce(prev => [...prev, item]);
    }
  };

  // Theme & User
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reviews từ Database thật
  const [realReviews, setRealReviews] = useState<Array<{
    reviewId: number;
    productId: number;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    helpfulCount: number;
    isHelpfulByMe?: boolean;
    userRole?: string;
    roleLabel?: string;
    replies?: Array<{
      reviewId: number;
      customerName: string;
      comment: string;
      createdAt: string;
      userRole?: string;
      roleLabel?: string;
    }>;
  }>>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myName, setMyName] = useState('');
  const [myRole, setMyRole] = useState('');
  const [myComment, setMyComment] = useState('');

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchComboReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`http://localhost:5023/api/reviews/product/${comboId}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.reviews || []);
        const mapped = list.map((r: any) => ({
          ...r,
          reviewId: Number(r.reviewId || r.id),
          customerName: r.customerName || r.name || 'Khách hàng',
          comment: r.comment || r.text || '',
          createdAt: r.createdAt || r.date || '',
          replies: (r.replies || []).map((rep: any) => ({
            ...rep,
            reviewId: Number(rep.reviewId || rep.id),
            customerName: rep.customerName || rep.name || 'Thành viên LÀNH',
            comment: rep.comment || rep.text || '',
            createdAt: rep.createdAt || rep.date || ''
          }))
        }));
        setRealReviews(mapped);
      } else {
        setRealReviews([]);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
      setRealReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Tự động cuộn xuống khu vực đánh giá nếu URL có hash #reviews
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#reviews') {
      setActiveTab('reviews');
      setTimeout(() => {
        const el = document.getElementById('reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const handleLikeReview = async (reviewId: number) => {
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để bấm thích đánh giá!');
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5023/api/reviews/${reviewId}/helpful?userId=${uId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRealReviews(prev => prev.map(r => 
          r.reviewId === reviewId 
            ? { ...r, helpfulCount: data.helpfulCount, isHelpfulByMe: data.liked } 
            : r
        ));
      } else {
        alert(data.message || 'Không thể xử lý hữu ích.');
      }
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleSendReply = async (parentReviewId: number) => {
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để gửi phản hồi đánh giá!');
      router.push('/login');
      return;
    }
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch(`http://localhost:5023/api/reviews/${parentReviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: uId,
          comment: replyText.trim()
        })
      });
      if (res.ok) {
        showNotification('Đã gửi phản hồi thành công!');
        setReplyText('');
        setReplyingReviewId(null);
        fetchComboReviews();
      } else {
        const err = await res.json();
        alert(err.message || 'Gửi phản hồi thất bại.');
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để gửi đánh giá!');
      router.push('/login');
      return;
    }
    if (!myComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5023/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: comboId,
          customerId: uId,
          customerName: currentUser?.fullName || myName.trim() || 'Khách hàng LÀNH',
          email: currentUser?.email || null,
          rating: myRating,
          comment: myComment.trim(),
          imageUrls: []
        })
      });
      if (res.ok) {
        showNotification('Cảm ơn bạn! Đánh giá đã được lưu vào hệ thống.');
        setMyComment('');
        setShowReviewForm(false);
        fetchComboReviews();
      } else {
        const err = await res.json();
        alert(err.message || 'Gửi đánh giá thất bại');
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) {}
    }
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) {}
    }
    fetchComboReviews();
  }, [comboId]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Tính giá hiện tại theo chu kỳ được chọn
  let currentPrice = combo.weekPrice;
  let freqLabel = 'Giao theo tuần';
  let freqUnit = '/ tuần (1 lần giao)';
  let freqCartUnit = 'Gói/Tuần';
  if (selectedFreq === 'biweek') {
    currentPrice = Math.round(combo.weekPrice * 1.9);
    freqLabel = 'Gói 2 tuần';
    freqUnit = '/ 2 tuần (2 lần giao)';
    freqCartUnit = 'Gói/2 tuần';
  } else if (selectedFreq === 'month') {
    currentPrice = combo.monthPrice;
    freqLabel = 'Gói trọn tháng';
    freqUnit = '/ tháng (4 lần giao)';
    freqCartUnit = 'Gói/Tháng';
  }
  const currentPriceFormatted = currentPrice.toLocaleString('vi-VN') + '₫';

  const handleAddToCart = () => {
    if (selectedProduce.length < maxSlots) {
      showNotification(`Vui lòng chọn đủ ${maxSlots} món nông sản tươi ngon cho gói combo này (Hiện tại bạn mới chọn ${selectedProduce.length}/${maxSlots} món)!`);
      const el = document.getElementById('custom-picker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const finalComboId = selectedFreq === 'month' 
      ? (combo.id <= 903 ? combo.id + 3 : combo.id) 
      : (combo.id >= 904 ? combo.id - 3 : combo.id);

    const selectedSummary = selectedProduce.map(p => p.name).join(', ');

    const comboCartItem = {
      id: finalComboId,
      name: `${combo.name} (${freqLabel} - ${activeSupplier.shortName}) - Giao ${deliveryDay} (${deliverySlot})`,
      price: currentPriceFormatted,
      unit: freqCartUnit,
      category: 'Combo Tự Chọn',
      cert: 'VietGAP & Hữu cơ',
      region: comboSupplier,
      rating: combo.rating,
      reviews: combo.reviewsCount,
      icon: 'box',
      lot: 'LOT#VN-COMBO-' + finalComboId,
      imageUrl: activeImage,
      selectedItems: selectedProduce,
      selectedSummary: selectedSummary
    };

    setCart(prev => {
      const existing = prev.find(x => x.product.id === comboCartItem.id);
      if (existing) {
        return prev.map(x => (x.product.id === comboCartItem.id ? { ...x, qty: x.qty + quantity, product: comboCartItem } : x));
      }
      return [...prev, { product: comboCartItem, qty: quantity }];
    });

    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setIsDrawerOpen(true);
    showNotification(`Đã thêm ${quantity} giỏ ${combo.name} [${selectedSummary}] vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 300);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(x => {
        if (x.product.id === id) {
          return { ...x, qty: Math.max(1, x.qty + delta) };
        }
        return x;
      })
    );
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(x => x.product.id !== id));
  const totalCart = cart.reduce((s, i) => s + parseInt(i.product.price.replace(/[^\d]/g, ''), 10) * i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  return (
    <>
      {/* ── HEADER 3 TẦNG ĐỒNG BỘ 100% ── */}
      <header>
        {/* TẦNG 1: TOP BAR TIỆN ÍCH */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP & Hữu cơ</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="topbar-link">Hotline CSKH: <strong>1900 8899</strong> (7:00 - 21:00)</span>
            </div>
            <div className="topbar-right">
              <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="topbar-link">
                Kênh Đối Tác / HTX
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="icon-btn" onClick={toggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                  {theme === "light" ? "Tối" : "Sáng"}
                </button>
                <div className="lang-switch">
                  <button className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2: MAIN HEADER */}
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            <svg className="mark" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
              <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <div>
              <span style={{ letterSpacing: '1px' }}>LÀNH</span>
              <div style={{ fontSize: '10.5px', fontWeight: '500', color: 'var(--green-700)', marginTop: '-4px' }}>NÔNG SẢN TƯƠI SẠCH</div>
            </div>
          </Link>

          {/* Ô Tìm kiếm */}
          <SearchBar />

          {/* Nhóm nút tác vụ Header */}
          <div className="header-actions">
            {/* Tài khoản */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="header-action-item" 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                style={{ border: 'none', background: 'none' }}
              >
                <span className="header-action-icon">
                  {currentUser && currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt="Avatar" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }} 
                    />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </span>
                <div className="header-action-text">
                  <span className="header-action-label">Xin chào,</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : "Tài khoản"}
                  </span>
                </div>
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  width: '200px',
                  padding: '6px 0',
                  textAlign: 'left'
                }}>
                  {currentUser ? (
                    <>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{currentUser.fullName}</div>
                        <div style={{ marginTop: '2px' }}>{currentUser.email}</div>
                      </div>
                      <Link href="/profile" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid var(--line)' }}>
                        Hồ sơ & Sổ địa chỉ
                      </Link>
                      <Link href="/orders" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid var(--line)' }}>
                        Đơn hàng của tôi
                      </Link>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('customer_user');
                          setCurrentUser(null);
                          setShowUserDropdown(false);
                          window.location.reload();
                        }}
                        style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#e53e3e', fontSize: '13px', fontWeight: '700' }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '600' }}>
                        Đăng nhập
                      </Link>
                      <Link href="/register" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--green-700)', fontSize: '13px', fontWeight: '600' }}>
                        Đăng ký thành viên
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Giỏ Hàng */}
            <div 
              className={`header-cart-btn ${cartBounce ? 'bounce' : ''}`}
              onClick={() => setIsDrawerOpen(true)}
              title="Xem giỏ hàng"
            >
              <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <div className="header-action-text">
                <span className="header-action-label">Giỏ hàng</span>
                <span className="header-action-value" style={{ color: 'var(--green-900)' }}>
                  {toVND(totalCart)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 3: SUB-NAVBAR */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">Trang chủ</Link>
              <Link href="/products" className="subnav-link">Tất cả nông sản</Link>
              <Link href="/combos" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>Combo định kỳ</Link>
              <Link href="/traceability" className="subnav-link">Truy xuất nguồn gốc</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── NỘI DUNG CHÍNH TRANG CHI TIẾT COMBO ── */}
      <main style={{ backgroundColor: 'var(--bg)', minHeight: '85vh', padding: '28px 20px 70px', color: 'var(--ink)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Trang chủ</Link>
            <span>/</span>
            <Link href="/combos" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Combo định kỳ</Link>
            <span>/</span>
            <span style={{ color: 'var(--green-700)', fontWeight: '600' }}>{combo.name}</span>
          </div>

          {/* Toast thông báo nhanh */}
          {toast && (
            <div style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              backgroundColor: 'var(--green-700)',
              color: '#ffffff',
              padding: '12px 22px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 9999,
              fontSize: '13.5px',
              fontWeight: '600'
            }}>
              {toast}
            </div>
          )}

          {/* ── HERO SECTION: 2 CỘT (HÌNH ẢNH & THÔNG TIN ĐẶT COMBO) ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '36px',
            backgroundColor: 'var(--surface)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)',
            marginBottom: '40px'
          }}>
            {/* CỘT TRÁI: THƯ VIỆN ẢNH COMBO */}
            <div>
              {/* Ảnh chính lớn */}
              <div style={{
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--line)',
                marginBottom: '14px',
                backgroundColor: '#f1f5f9'
              }}>
                {combo.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    zIndex: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {combo.badge}
                  </span>
                )}
                <img
                  src={activeImage}
                  alt={combo.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Hàng ảnh thu nhỏ (Thumbnails) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {combo.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    style={{
                      padding: 0,
                      border: activeImage === img ? '2.5px solid var(--green-700)' : '1px solid var(--line)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '75px',
                      cursor: 'pointer',
                      opacity: activeImage === img ? 1 : 0.7,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>

              {/* Thẻ cam kết bảo đảm chất lượng */}
              <div style={{
                marginTop: '20px',
                backgroundColor: 'var(--bg)',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid var(--line)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>100% Thu hoạch sớm</strong>
                  Hái lúc 4h sáng, giao trong ngày
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Đổi món trong 24h</strong>
                  Linh hoạt theo khẩu vị gia đình
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Freeship toàn bộ</strong>
                  Giao định kỳ tận bếp đúng hẹn
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Bảo hiểm tươi ngon</strong>
                  Đổi trả 1-1 nếu dập úa khi nhận
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT & CẤU HÌNH ĐẶT GÓI COMBO */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'var(--green-100)',
                  color: 'var(--green-900)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Combo Đang Mùa Rộ
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Mã: LOT#VN-COMBO-{combo.id}
                </span>
              </div>

              <h1 style={{
                fontSize: '26px',
                fontWeight: '800',
                color: 'var(--green-900)',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {combo.name}
              </h1>

              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                {combo.subtitle}
              </p>

              {/* Đánh giá & Số lượng người dùng */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', fontSize: '13px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <div 
                  onClick={() => {
                    setActiveTab('reviews');
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title="Bấm để cuộn xuống xem các đánh giá của gói combo"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: '700', cursor: 'pointer' }}
                >
                  <span>⭐ {combo.rating}</span>
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal', textDecoration: 'underline' }}>({combo.reviewsCount} đánh giá từ các hộ gia đình)</span>
                </div>
                <span style={{ color: 'var(--line)' }}>|</span>
                <span style={{ color: 'var(--green-700)', fontWeight: '600' }}>Đang phục vụ 350+ hộ gia đình</span>
              </div>

              {/* Khung Giá Gói Combo */}
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '30px', fontWeight: '800', color: '#e53e3e', fontFamily: 'var(--font-display)' }}>
                    {currentPriceFormatted}
                  </span>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-soft)', fontWeight: '500' }}>
                    {selectedFreq === 'week' ? '/ tuần (1 lần giao)' : '/ tháng (4 lần giao tận nơi)'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--green-700)', marginTop: '4px', fontWeight: '600' }}>
                  {selectedFreq === 'month' ? 'Tiết kiệm đến 18% so với đặt lẻ từng tuần & Miễn phí ship toàn bộ 4 tuần' : 'Tự động giao đúng lịch hàng tuần, có thể hủy hoặc tạm ngưng bất cứ lúc nào'}
                </div>
              </div>

              {/* 1. Chọn Chu kỳ Gói (Tuần / 2 Tuần / Trọn Tháng) */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>
                    1. Chọn chu kỳ gói:
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--green-700)', fontWeight: '600' }}>
                    * Có thể thay đổi linh hoạt bất cứ lúc nào
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFreq('week')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'week' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'week' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'week' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'week' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Theo tuần</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>1 đợt / tuần</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFreq('biweek')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'biweek' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'biweek' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'biweek' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'biweek' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Gói 2 tuần</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>2 đợt giao</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFreq('month')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'month' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'month' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'month' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'month' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Trọn tháng</div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>4 đợt (Tiết kiệm)</div>
                  </button>
                </div>
              </div>

              {/* 2. Chọn Ngày Giao Hàng Trong Tuần (Hoạt động từ Thứ 2 tới Chủ Nhật) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  2. Chọn ngày nhận hàng trong tuần (Giao đều đặn cả tuần Thứ 2 - CN):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDeliveryDay(day)}
                      style={{
                        padding: '7px 8px',
                        borderRadius: '6px',
                        border: deliveryDay === day ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliveryDay === day ? 'var(--green-700)' : '#ffffff',
                        color: deliveryDay === day ? '#ffffff' : 'var(--ink)',
                        fontSize: '12px',
                        fontWeight: deliveryDay === day ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Chọn Khung Giờ Nhận Hàng (Chỉ giao hàng từ 7h tới 17h chiều) */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>
                    3. Khung giờ giao hàng ưu tiên:
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    (Khung giờ từ 7h00 - 17h00 hàng ngày)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    '07:00 - 09:30 (Sáng sớm)',
                    '09:30 - 12:00 (Trưa)',
                    '13:30 - 15:30 (Đầu giờ chiều)',
                    '15:30 - 17:00 (Cuối buổi chiều)'
                  ].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliverySlot(slot)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: deliverySlot === slot ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliverySlot === slot ? 'var(--green-100)' : '#ffffff',
                        color: deliverySlot === slot ? 'var(--green-900)' : 'var(--ink)',
                        fontSize: '11.5px',
                        fontWeight: deliverySlot === slot ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Chọn Số Lượng & Các Nút Hành Động */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                    aria-label="Giảm"
                    title="Giảm 1 (hoặc dùng phím mũi tên Xuống)"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) {
                        setQuantity(1);
                      } else {
                        setQuantity(Math.max(1, Math.min(999, val)));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setQuantity(q => Math.min(999, q + 1));
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setQuantity(q => Math.max(1, q - 1));
                      }
                    }}
                    onBlur={() => {
                      if (!quantity || quantity < 1) setQuantity(1);
                    }}
                    style={{
                      width: '46px',
                      height: '36px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      MozAppearance: 'textfield'
                    }}
                    title="Nhập số lượng hoặc dùng phím mũi tên Lên/Xuống trên bàn phím"
                    aria-label="Số lượng gói combo"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                    aria-label="Tăng"
                    title="Tăng 1 (hoặc dùng phím mũi tên Lên)"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--green-700)',
                    backgroundColor: '#ffffff',
                    color: 'var(--green-700)',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  style={{
                    flex: 1.2,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--green-700)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  Đặt combo ngay
                </button>
              </div>

            </div>
          </div>


          {/* ── BƯỚC TỰ CHỌN NÔNG SẢN TƯƠI SẠCH (CUSTOM PRODUCE PICKER) ── */}
          <div id="custom-picker" style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: 'var(--shadow)'
          }}>
            {/* Header: Đơn giản, không màu mè */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 4px 0' }}>
                  Lựa chọn nông sản cho combo (Tự chọn {maxSlots} món)
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Khách hàng tùy ý chọn Nhà cung cấp và nông sản yêu thích. Toàn bộ nông sản trong combo thuộc cùng một nhà cung cấp.
                </div>
              </div>

              {/* Tiến độ chọn món gọn gàng */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: selectedProduce.length === maxSlots ? '#DCFCE7' : '#FEF3C7',
                border: selectedProduce.length === maxSlots ? '1px solid #86EFAC' : '1px solid #FDE68A',
                fontSize: '12.5px',
                fontWeight: '700',
                color: selectedProduce.length === maxSlots ? '#15803D' : '#92400E'
              }}>
                <span>Tiến độ:</span>
                <span style={{ fontSize: '14px' }}>{selectedProduce.length}/{maxSlots} món</span>
                {selectedProduce.length === maxSlots ? (
                  <span>(✓ Đủ món)</span>
                ) : (
                  <span style={{ fontWeight: 'normal' }}>(Chọn thêm {maxSlots - selectedProduce.length} món)</span>
                )}
              </div>
            </div>

            {/* BỘ CHỌN NHÀ CUNG CẤP YÊU THÍCH (TỐI GIẢN) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                🏢 Chọn Nhà Cung Cấp cung ứng gói combo:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {SUPPLIERS_PROFILES.map(sup => {
                  const isCurSup = selectedSupplierId === sup.id;
                  return (
                    <button
                      key={sup.id}
                      type="button"
                      onClick={() => handleSelectSupplier(sup.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isCurSup ? '2px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: isCurSup ? '#F0FDF4' : '#ffffff',
                        color: isCurSup ? 'var(--green-900)' : 'var(--ink)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px' }}>{sup.shortName}</strong>
                        {isCurSup && (
                          <span style={{ fontSize: '11px', color: 'var(--green-700)', fontWeight: '700' }}>✓ Đang chọn</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{sup.region}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thông tin nhà cung cấp hiện tại */}
            <div style={{
              fontSize: '12.5px',
              color: 'var(--ink-soft)',
              backgroundColor: 'var(--bg)',
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '18px',
              border: '1px solid var(--line)'
            }}>
              Đang xem danh mục của: <strong style={{ color: 'var(--green-900)' }}>{activeSupplier.name}</strong> • {activeSupplier.badge}
            </div>

            {/* Produce Cards Grid: Thiết kế đơn giản, không màu mè */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {activeSupplier.producePool.map(item => {
                const isSelected = selectedProduce.some(x => x.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectProduce(item)}
                    style={{
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: isSelected ? '#F0FDF4' : '#ffffff',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ height: '110px', overflow: 'hidden', position: 'relative', backgroundColor: '#f8fafc' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.category}
                      </span>
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'var(--green-700)',
                          color: '#ffffff',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          ✓ Đã chọn
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{item.name}</strong>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--green-700)', marginLeft: '4px' }}>{item.weight}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                        {item.region}
                      </div>

                      <button
                        type="button"
                        style={{
                          marginTop: 'auto',
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '5px',
                          border: isSelected ? '1px solid var(--green-700)' : '1px solid var(--line)',
                          backgroundColor: isSelected ? 'var(--green-700)' : '#ffffff',
                          color: isSelected ? '#ffffff' : 'var(--ink)',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ Đã chọn' : '+ Chọn món'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TABS NỘI DUNG CHI TIẾT (BỎ TAB ITEMS, MẶC ĐỊNH HIỂN THỊ ĐÁNH GIÁ) ── */}
          <div 
            id="reviews-section"
            style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            marginBottom: '48px'
          }}>
            {/* Header Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--line)',
              backgroundColor: 'var(--bg)',
              overflowX: 'auto'
            }}>
              {[
                { key: 'reviews', label: `⭐ Đánh giá từ khách hàng (${realReviews.length})` },
                { key: 'process', label: 'Quy trình từ vườn đến bàn ăn' },
                { key: 'faqs', label: 'Câu hỏi thường gặp & Chính sách' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '14px 24px',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '3px solid var(--green-700)' : '3px solid transparent',
                    backgroundColor: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--green-900)' : 'var(--ink-soft)',
                    fontWeight: activeTab === tab.key ? '700' : '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body Tabs */}
            <div style={{ padding: '32px' }}>

              {/* TAB 2: QUY TRÌNH TỪ VƯỜN ĐẾN BÀN ĂN */}
              {activeTab === 'process' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 16px 0' }}>
                    Hành trình 6 giờ từ nông trại đến gian bếp của bạn
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {combo.harvestProcess.map((proc, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                        <div style={{
                          backgroundColor: 'var(--green-100)',
                          color: 'var(--green-900)',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          {proc.time}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--ink)' }}>
                            {proc.step}
                          </h4>
                          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                            {proc.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CÂU HỎI THƯỜNG GẶP */}
              {activeTab === 'faqs' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 16px 0' }}>
                    Những câu hỏi thường gặp khi đăng ký combo định kỳ
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {combo.faqs.map((faq, idx) => (
                      <div key={idx} style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--bg)',
                        borderRadius: '10px',
                        border: '1px solid var(--line)'
                      }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--green-900)', marginBottom: '6px' }}>
                          Q: {faq.q}
                        </div>
                        <div style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5' }}>
                          {faq.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ĐÁNH GIÁ CỦA KHÁCH HÀNG (DỮ LIỆU THẬT DATABASE, LIKE & REPLY) */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
                        Nhận xét thực tế từ khách hàng ({realReviews.length})
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: '700', marginTop: '2px' }}>
                        Điểm trung bình: {combo.rating} / 5.0 ⭐ (100% đánh giá thực)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          alert('Vui lòng đăng nhập tài khoản để viết đánh giá!');
                          router.push('/login');
                          return;
                        }
                        setShowReviewForm(!showReviewForm);
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: showReviewForm ? '#f1f5f9' : 'var(--green-700)',
                        color: showReviewForm ? 'var(--ink)' : '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {showReviewForm ? 'Đóng biểu mẫu' : 'Viết đánh giá của bạn'}
                    </button>
                  </div>

                  {/* FORM GỬI ĐÁNH GIÁ TRỰC TIẾP */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleCreateReview}
                      style={{
                        backgroundColor: 'var(--bg)',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        marginBottom: '24px'
                      }}
                    >
                      <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: 'var(--ink)', fontWeight: '700' }}>
                        Chia sẻ cảm nhận của bạn về gói {combo.name}
                      </h4>

                      {/* Chọn sao */}
                      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>Đánh giá:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setMyRating(star)}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: star <= myRating ? '#EAB308' : '#D1D5DB'
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--green-700)', fontWeight: '600' }}>
                          ({myRating} sao)
                        </span>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Nhận xét chi tiết *</label>
                        <textarea
                          required
                          rows={3}
                          value={myComment}
                          onChange={e => setMyComment(e.target.value)}
                          placeholder="Chia sẻ về độ tươi ngon của nông sản trong giỏ, hương vị, việc đóng gói bảo quản..."
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--line)', background: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: 'var(--green-700)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Gửi đánh giá
                        </button>
                      </div>
                    </form>
                  )}

                  {loadingReviews ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink-soft)' }}>
                      Đang tải đánh giá từ máy chủ...
                    </div>
                  ) : realReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg)', borderRadius: '14px', border: '1.5px dashed var(--line)' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌱</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green-900)' }}>Chưa có đánh giá nào cho gói combo này</div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', marginBottom: '16px' }}>
                        Hãy là người đầu tiên trải nghiệm gói nông sản tươi này và để lại nhận xét nhé!
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            alert('Vui lòng đăng nhập tài khoản để viết đánh giá!');
                            router.push('/login');
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'var(--green-700)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                        }}
                      >
                        ✍️ Viết đánh giá đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {realReviews.map((rev, revIdx) => (
                        <div key={rev.reviewId || (rev as any).id || `rev-${revIdx}`} className="review-item" style={{
                          padding: '18px 20px',
                          borderRadius: '12px',
                          border: '1px solid var(--line)',
                          backgroundColor: 'var(--bg)',
                          fontFamily: 'var(--font-review)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong className="review-author-name" style={{ fontSize: '14.5px', color: 'var(--ink)', fontWeight: 600 }}>
                                {rev.customerName || 'Khách hàng'}
                              </strong>
                              {rev.roleLabel && (
                                <span style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontWeight: '600',
                                  backgroundColor: rev.userRole === 'Admin' ? '#FEF3C7' : (rev.userRole === 'Supplier' ? '#E0F2FE' : '#F1F5F9'),
                                  color: rev.userRole === 'Admin' ? '#B45309' : (rev.userRole === 'Supplier' ? '#0369A1' : '#475569')
                                }}>
                                  {rev.roleLabel}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#FFB800', letterSpacing: '1px' }}>
                              {'★'.repeat(rev.rating || 5)}
                            </div>
                          </div>
                          
                          <p 
                            className="review-content-text"
                            style={{ 
                              margin: '0 0 10px 0', 
                              fontSize: '14.5px', 
                              color: 'var(--ink)', 
                              lineHeight: '1.65',
                              fontFamily: 'var(--font-review)',
                              fontWeight: 400
                            }}
                          >
                            "{rev.comment}"
                          </p>

                          {/* Footer của Review: Ngày đăng + Nút Like + Nút Trả lời */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '10px',
                            borderTop: '1px dashed var(--line)',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <div className="review-meta-text" style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'} • Đã mua combo
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {/* Nút Thích */}
                              <button
                                type="button"
                                onClick={() => handleLikeReview(rev.reviewId)}
                                style={{
                                  background: rev.isHelpfulByMe ? 'var(--green-100)' : '#ffffff',
                                  border: rev.isHelpfulByMe ? '1px solid var(--green-700)' : '1px solid var(--line)',
                                  borderRadius: '999px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: rev.isHelpfulByMe ? '700' : '500',
                                  color: rev.isHelpfulByMe ? 'var(--green-900)' : 'var(--ink-soft)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>👍</span>
                                <span>{rev.isHelpfulByMe ? `Đã thích (${rev.helpfulCount || 0})` : `Hữu ích (${rev.helpfulCount || 0})`}</span>
                              </button>

                              {/* Nút Trả lời */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser) {
                                    alert('Vui lòng đăng nhập tài khoản để trả lời đánh giá!');
                                    router.push('/login');
                                    return;
                                  }
                                  setReplyingReviewId(replyingReviewId === rev.reviewId ? null : rev.reviewId);
                                  setReplyText('');
                                }}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid var(--line)',
                                  borderRadius: '999px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: 'var(--ink-soft)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>💬</span>
                                <span>Trả lời</span>
                              </button>
                            </div>
                          </div>

                          {/* KHUNG NHẬP TRẢ LỜI (REPLY) */}
                          {replyingReviewId === rev.reviewId && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px 14px',
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid var(--green-200)'
                            }}>
                              <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--green-900)', marginBottom: '6px' }}>
                                Trả lời nhận xét của {rev.customerName}:
                              </div>
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Nhập câu trả lời của bạn..."
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  fontSize: '13px',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit'
                                }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setReplyingReviewId(null)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--line)',
                                    background: '#ffffff',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={submittingReply}
                                  onClick={() => handleSendReply(rev.reviewId)}
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--green-700)',
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: submittingReply ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* DANH SÁCH CÁC PHẢN HỒI CON (REPLIES LỒNG NHAU) */}
                          {rev.replies && rev.replies.length > 0 && (
                            <div style={{
                              marginTop: '12px',
                              paddingLeft: '14px',
                              borderLeft: '2.5px solid var(--green-700)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              {rev.replies.map((rep, repIdx) => (
                                <div key={rep.reviewId || (rep as any).id || `rep-${repIdx}`} style={{
                                  backgroundColor: '#ffffff',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--line)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                                        {rep.customerName}
                                      </strong>
                                      {rep.roleLabel && (
                                        <span style={{
                                          fontSize: '10.5px',
                                          padding: '1px 6px',
                                          borderRadius: '999px',
                                          fontWeight: '600',
                                          backgroundColor: rep.userRole === 'Admin' ? '#FEF3C7' : (rep.userRole === 'Supplier' ? '#E0F2FE' : '#F1F5F9'),
                                          color: rep.userRole === 'Admin' ? '#B45309' : (rep.userRole === 'Supplier' ? '#0369A1' : '#475569')
                                        }}>
                                          {rep.roleLabel}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                                      {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5' }}>
                                    {rep.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── CÁC GÓI COMBO GỢI Ý TỪ CÁC NHÀ CUNG CẤP KHÁC ── */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-900)', margin: '0 0 4px 0' }}>
                  📦 Gợi ý các gói Combo từ Nhà Cung Cấp &amp; Đối Tác khác
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Khám phá thêm các chương trình và combo định kỳ tươi sạch đa dạng từ các Hợp tác xã uy tín
                </p>
              </div>
              <Link href="/combos" style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: '700', textDecoration: 'none' }}>
                Xem tất cả gói combo &rarr;
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {[
                { 
                  id: 907, 
                  name: 'Combo Ăn Dặm Hữu Cơ Bé Yêu', 
                  supplier: 'HTX Nông Nghiệp An Phú', 
                  region: 'Đơn Dương - Lâm Đồng', 
                  price: '195.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
                  badge: 'GlobalGAP'
                },
                { 
                  id: 908, 
                  name: 'Combo Trái Cây Miệt Vườn Nam Bộ', 
                  supplier: 'HTX Trái Cây Việt', 
                  region: 'Đồng Nai & Bến Tre', 
                  price: '269.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
                  badge: 'Đặc sản chín cây'
                },
                { 
                  id: 909, 
                  name: 'Combo Rau Đồng Nấu Lẩu Thực Dưỡng', 
                  supplier: 'HTX Rau Sạch Miền Tây', 
                  region: 'Đồng Tháp', 
                  price: '175.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=80',
                  badge: 'Hương vị quê nhà'
                },
                { 
                  id: 910, 
                  name: 'Combo Salad Eat-Clean Năng Lượng', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '215.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=80',
                  badge: 'Eat-Clean Healthy'
                },
                { 
                  id: 901, 
                  name: 'Combo Gia Đình Nhỏ (Tuần)', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '189.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
                  badge: 'Phổ biến nhất'
                },
                { 
                  id: 903, 
                  name: 'Combo Thuần Chay Sạch (Tuần)', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '249.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
                  badge: 'Thuần chay 100%'
                }
              ].filter(c => c.id !== combo.id).slice(0, 4).map(c => (
                <div key={c.id} style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow)',
                  position: 'relative'
                }}>
                  <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(21, 128, 61, 0.9)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {c.badge}
                    </span>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🏢</span> <strong>{c.supplier}</strong>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', color: 'var(--ink)', fontWeight: '700', lineHeight: '1.4' }}>
                      {c.name}
                    </h4>
                    <div style={{ color: '#e53e3e', fontWeight: '800', fontSize: '15px', marginBottom: '14px', marginTop: 'auto' }}>
                      {c.price}
                    </div>

                    <Link
                      href={`/combos/${c.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--green-700)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '12.5px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Chọn Nông Sản &amp; Đặt Combo &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER 4 CỘT CHUẨN LÀNH FARM ── */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">LÀNH</div>
              <p>Nền tảng nông sản hữu cơ minh bạch — kết nối trực tiếp nông trại Việt Nam đến bữa ăn của bạn.</p>
              <div className="cert-row">
                <span className="cert-pill">VietGAP</span>
                <span className="cert-pill">GlobalGAP</span>
                <span className="cert-pill">USDA Organic</span>
              </div>
            </div>
            <div>
              <h5>Liên hệ</h5>
              <ul>
                <li>1900 8899 (7:00–21:00)</li>
                <li>nongsanlanh@lanhfarm.vn</li>
                <li>92 Nguyễn Huệ, Q.1, TP.HCM</li>
              </ul>
            </div>
            <div>
              <h5>Chính sách</h5>
              <ul>
                <li>Vận chuyển &amp; giao nhận</li>
                <li>Đổi trả trong 24h</li>
                <li>Bảo mật thông tin</li>
                <li>Điều khoản dịch vụ</li>
              </ul>
            </div>
            <div>
              <h5>Thanh toán</h5>
              <div className="pay-icons">
                <span>VISA</span><span>MoMo</span><span>VietQR</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX Nông Nghiệp Thông Minh.</span>
            <span>Nông sản tươi ngon, trọn vẹn niềm tin.</span>
          </div>
        </div>
      </footer>

      {/* ── DRAWER GIỎ HÀNG ── */}
      <div className={`overlay ${isDrawerOpen ? 'show' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <aside className={`drawer ${isDrawerOpen ? 'show' : ''}`} aria-label="Giỏ hàng">
        <div className="drawer-head">
          <h3>Giỏ hàng của bạn</h3>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">Giỏ hàng đang trống.</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="drawer-item">
                <div className="thumb">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (<div style={{ width: '100%', height: '100%', backgroundColor: 'var(--line, #e2e8f0)', borderRadius: '4px' }} />)}
                </div>
                <div className="info">
                  <b>{item.product.name}</b>
                  {item.product.selectedSummary && (
                    <div style={{ fontSize: '11px', color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', marginTop: '3px', lineHeight: '1.4' }}>
                      🥗 Đã chọn: {item.product.selectedSummary}
                    </div>
                  )}
                  <span>{item.product.price} {item.product.unit}</span>
                  <div className="qty-ctrl">
                    <button onClick={() => updateCartQty(item.product.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.product.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div className="row"><span>Tạm tính</span><span>{toVND(totalCart)}</span></div>
          <button 
            className="btn btn-accent" 
            onClick={() => {
              if (!currentUser) {
                alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
                router.push('/login');
                return;
              }
              if (cart.length === 0) return;
              setIsDrawerOpen(false);
              router.push('/checkout');
            }}
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>
    </>
  );
}
