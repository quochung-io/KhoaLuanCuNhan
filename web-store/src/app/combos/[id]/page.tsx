'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ComboItemInfo {
  name: string;
  weight: string;
  region: string;
  benefit: string;
  imageUrl: string;
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

  // Trạng thái chọn tần suất: Tuần hoặc Tháng
  const [selectedFreq, setSelectedFreq] = useState<'week' | 'month'>(comboId >= 904 ? 'month' : 'week');
  // Ngày giao ưu tiên
  const [deliveryDay, setDeliveryDay] = useState<string>('Thứ 3');
  // Khung giờ giao
  const [deliverySlot, setDeliverySlot] = useState<string>('Sáng (8:00 - 11:30)');
  // Số lượng gói
  const [quantity, setQuantity] = useState<number>(1);
  // Active Tab
  const [activeTab, setActiveTab] = useState<'items' | 'process' | 'faqs' | 'reviews'>('items');
  // Selected Image trong gallery
  const [activeImage, setActiveImage] = useState<string>(combo.gallery[0]);

  // Theme & User
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reviews & Viết đánh giá
  const [reviewsList, setReviewsList] = useState<Array<{ author: string; role: string; date: string; rating: number; comment: string }>>(combo.customerReviews);
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
  }, []);

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
  const currentPrice = selectedFreq === 'week' ? combo.weekPrice : combo.monthPrice;
  const currentPriceFormatted = currentPrice.toLocaleString('vi-VN') + '₫';

  const handleAddToCart = () => {
    const comboCartItem = {
      id: combo.id + (selectedFreq === 'month' ? 100 : 0),
      name: `${combo.name} (${selectedFreq === 'week' ? 'Giao theo tuần' : 'Gói trọn tháng'}) - ${deliveryDay}`,
      price: currentPriceFormatted,
      unit: selectedFreq === 'week' ? '/ Tuần' : '/ Tháng',
      category: 'Combo',
      cert: 'VietGAP & Hữu cơ',
      region: 'Đà Lạt & Mộc Châu',
      rating: combo.rating,
      reviews: combo.reviewsCount,
      icon: 'box',
      lot: 'LOT#VN-COMBO-' + combo.id,
      imageUrl: activeImage
    };

    setCart(prev => {
      const existing = prev.find(x => x.product.id === comboCartItem.id);
      if (existing) {
        return prev.map(x => (x.product.id === comboCartItem.id ? { ...x, qty: x.qty + quantity } : x));
      }
      return [...prev, { product: comboCartItem, qty: quantity }];
    });

    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setIsDrawerOpen(true);
    showNotification(`Đã thêm ${quantity} giỏ ${combo.name} vào giỏ hàng!`);
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
          <div className="search-shell">
            <input 
              type="text" 
              placeholder="Tìm kiếm rau củ quả, combo dinh dưỡng..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  router.push(`/products?search=${encodeURIComponent(val)}`);
                }
              }}
            />
            <button className="go" onClick={() => router.push('/products')} aria-label="Tìm kiếm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span>Tìm</span>
            </button>
          </div>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: '700' }}>
                  <span>⭐ {combo.rating}</span>
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal' }}>({combo.reviewsCount} đánh giá từ các hộ gia đình)</span>
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

              {/* 1. Chọn Chu kỳ Gói (Tuần / Tháng) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  1. Chọn chu kỳ gói:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFreq('week')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: selectedFreq === 'week' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'week' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'week' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'week' ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>Giao theo từng tuần</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>{combo.weekPrice.toLocaleString('vi-VN')}₫ / tuần</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFreq('month')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: selectedFreq === 'month' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'month' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'month' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'month' ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>Gói trọn tháng (4 tuần)</div>
                    <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>{combo.monthPrice.toLocaleString('vi-VN')}₫ (Tiết kiệm)</div>
                  </button>
                </div>
              </div>

              {/* 2. Chọn Ngày Giao Hàng Trong Tuần */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  2. Chọn ngày nhận hàng trong tuần:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Thứ 3', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDeliveryDay(day)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: deliveryDay === day ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliveryDay === day ? 'var(--green-700)' : '#ffffff',
                        color: deliveryDay === day ? '#ffffff' : 'var(--ink)',
                        fontSize: '12.5px',
                        fontWeight: deliveryDay === day ? '700' : '500',
                        cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Chọn Khung Giờ Nhận Hàng */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  3. Khung giờ giao hàng ưu tiên:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Sáng (8:00 - 11:30)', 'Chiều (14:00 - 17:30)'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliverySlot(slot)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: deliverySlot === slot ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliverySlot === slot ? 'var(--green-100)' : '#ffffff',
                        color: deliverySlot === slot ? 'var(--green-900)' : 'var(--ink)',
                        fontSize: '12.5px',
                        fontWeight: deliverySlot === slot ? '700' : '500',
                        cursor: 'pointer'
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
                  backgroundColor: '#ffffff'
                }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
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


          {/* ── TABS NỘI DUNG CHI TIẾT ── */}
          <div style={{
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
                { key: 'items', label: `Nông sản trong giỏ tuần này (${combo.items.length})` },
                { key: 'process', label: 'Quy trình từ vườn đến bàn ăn' },
                { key: 'faqs', label: 'Câu hỏi thường gặp & Chính sách' },
                { key: 'reviews', label: `Đánh giá từ khách hàng (${combo.customerReviews.length})` }
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
              
              {/* TAB 1: DANH SÁCH NÔNG SẢN TRONG GIỎ */}
              {activeTab === 'items' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 6px 0' }}>
                      Thực đơn dự kiến tuần này
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0 }}>
                      Mỗi tuần thực đơn được luân phiên thay đổi theo vụ thu hoạch tại các nhà màng hợp tác xã, cam kết đủ 4 nhóm màu sắc rau củ quả.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {combo.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                        backgroundColor: 'var(--bg)'
                      }}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--line)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{item.name}</strong>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--green-700)' }}>{item.weight}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Vùng trồng: <strong>{item.region}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '3px', fontStyle: 'italic' }}>
                            {item.benefit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '24px',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF9C3',
                    border: '1px solid #FDE047',
                    fontSize: '13px',
                    color: '#854D0E'
                  }}>
                    <strong>Lưu ý về đổi món:</strong> Bạn có thể nhắn tin cho LÀNH trước 24 giờ ngày giao nếu muốn đổi bất kỳ loại rau củ nào trong danh sách trên sang món khác mà gia đình ưa thích hơn.
                  </div>
                </div>
              )}

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

              {/* TAB 4: ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
                        Nhận xét thực tế từ khách hàng ({reviewsList.length})
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: '700', marginTop: '2px' }}>
                        Điểm trung bình: {combo.rating} / 5.0 ⭐ (100% người dùng hài lòng)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowReviewForm(!showReviewForm)}
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!myName.trim() || !myComment.trim()) {
                          alert('Vui lòng nhập họ tên và nhận xét của bạn!');
                          return;
                        }
                        const newRev = {
                          author: myName.trim(),
                          role: myRole.trim() || 'Khách hàng LÀNH Farm',
                          date: new Date().toLocaleDateString('vi-VN'),
                          rating: myRating,
                          comment: myComment.trim()
                        };
                        setReviewsList([newRev, ...reviewsList]);
                        setMyComment('');
                        setShowReviewForm(false);
                        showNotification('Cảm ơn bạn! Đánh giá của bạn đã được xuất bản.');
                      }}
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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Họ và tên *</label>
                          <input
                            type="text"
                            required
                            value={myName}
                            onChange={e => setMyName(e.target.value)}
                            placeholder="Nhập tên của bạn"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Khu vực / Nghề nghiệp</label>
                          <input
                            type="text"
                            value={myRole}
                            onChange={e => setMyRole(e.target.value)}
                            placeholder="Ví dụ: Mẹ bỉm sữa, Q.2..."
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviewsList.map((rev, idx) => (
                      <div key={idx} style={{
                        padding: '18px 20px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                        backgroundColor: 'var(--bg)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{rev.author}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--ink-soft)', marginLeft: '8px' }}>({rev.role})</span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#eab308' }}>
                            {'★'.repeat(rev.rating)}
                          </div>
                        </div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5' }}>
                          "{rev.comment}"
                        </p>
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                          Ngày đánh giá: {rev.date} • Đã mua combo định kỳ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── CÁC GÓI COMBO KHÁC ĐƯỢC QUAN TÂM ── */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-900)', marginBottom: '16px' }}>
              Các gói Combo khác của LÀNH Farm
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { id: 901, name: 'Combo Gia Đình Nhỏ', price: '189.000₫ / tuần', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80' },
                { id: 902, name: 'Combo Gia Đình Lớn', price: '329.000₫ / tuần', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80' },
                { id: 903, name: 'Combo Thuần Chay Sạch', price: '249.000₫ / tuần', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80' }
              ].filter(c => c.id !== combo.id).map(c => (
                <div key={c.id} style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow)'
                }}>
                  <img src={c.img} alt={c.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)' }}>{c.name}</h4>
                    <div style={{ color: 'var(--green-900)', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>{c.price}</div>
                    <Link
                      href={`/combos/${c.id}`}
                      style={{
                        marginTop: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--green-100)',
                        color: 'var(--green-900)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      Xem chi tiết gói
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
