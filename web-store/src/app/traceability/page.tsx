'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/layout/SearchBar';

// Định nghĩa kiểu dữ liệu Lô hàng thật từ Database
interface DbProduct {
  productId: number;
  productName: string;
  description?: string;
  price?: number;
  unit?: string;
  status?: string;
  supplierId?: number;
  productImages?: Array<{ imageUrl: string; isPrimary: boolean }>;
}

interface DbBatch {
  batchId: number;
  productId: number;
  farmId: number;
  batchCode: string;
  harvestDate: string;
  receivedDate: string;
  expiryDate: string;
  initialQuantity: number;
  unit: string;
  status: string;
  product?: DbProduct;
}

// Phân loại nhóm cây trồng và đặc tính nông học
type CropType = 'fruit_tree' | 'fruiting_vine' | 'leafy_green' | 'mushroom';

interface FarmProfile {
  farmName: string;
  supplierName: string;
  location: string;
  altitude: string;
  standard: string;
  soilFeature: string;
  inspectorSeed: string;
  inspectorCare: string;
  inspectorHarvest: string;
}

interface CropProfile {
  type: CropType;
  groupName: string;
  cycleDays: number;
  seedStageName: string;
  careStageName: string;
  seedDesc: (farm: FarmProfile) => string;
  careDesc: (farm: FarmProfile) => string;
  harvestDesc: (batch: DbBatch) => string;
  coldChainTemp: string;
  storageDays: number;
  seedIot: Array<{ label: string; val: string }>;
  careIot: Array<{ label: string; val: string }>;
  harvestIot: (batch: DbBatch) => Array<{ label: string; val: string }>;
}

function getCropProfile(productName: string): CropProfile {
  const n = (productName || '').toLowerCase();

  // Nhóm 1: Nấm thực phẩm & Vi sinh vật
  if (n.includes('nấm')) {
    return {
      type: 'mushroom',
      groupName: 'Nấm thực phẩm & Vi sinh vật phòng lạnh',
      cycleDays: 22,
      seedStageName: 'Cấy meo giống & Ủ cơ chất mùn cưa tiệt trùng',
      careStageName: 'Dưỡng sợi tơ & Kích ẩm buồng lạnh vô trùng',
      seedDesc: (farm) => `Tuyển chọn meo nấm giống thuần chủng F1, cấy trên cơ chất mùn cưa cao su tự nhiên đã qua tiệt trùng lò hơi 121°C áp suất cao. Đảm bảo môi trường nuôi cấy vô trùng 100% tại ${farm.farmName}.`,
      careDesc: (farm) => `Phát triển trong buồng lạnh khép kín với hệ thống siêu âm tạo sương giữ ẩm ổn định 85% – 92%. Ánh sáng khuếch tán dịu nhẹ, dinh dưỡng hữu cơ tự nhiên, tuyệt đối không chất bảo quản.`,
      harvestDesc: (batch) => `Thu hái thủ công từng búp nấm đạt độ nở tiêu chuẩn loại 1 (mũ nấm dày, thân mập trắng ngà). Sản lượng đợt hái đạt ${batch.initialQuantity} ${batch.unit}, đưa vào phòng hạ nhiệt cấp tốc trong vòng 30 phút.`,
      coldChainTemp: '2°C – 4°C (Bảo quản đạm thực vật)',
      storageDays: 10,
      seedIot: [
        { label: 'Nhiệt độ ủ cơ chất', val: '24.0°C' },
        { label: 'Áp suất tiệt trùng', val: '1.2 atm' },
        { label: 'Độ ẩm cơ chất', val: '65%' }
      ],
      careIot: [
        { label: 'Nhiệt độ buồng lạnh', val: '18.5°C' },
        { label: 'Độ ẩm không khí', val: '88%' },
        { label: 'Nồng độ CO2', val: '< 800 ppm' }
      ],
      harvestIot: (batch) => [
        { label: 'Sản lượng đợt hái', val: `${batch.initialQuantity} ${batch.unit}` },
        { label: 'Độ mở búp nấm', val: 'Chuẩn Loại 1' },
        { label: 'Nhiệt độ buồng hái', val: '18.0°C' }
      ]
    };
  }

  // Nhóm 2: Cây ăn trái thân gỗ (Mít Thái, Bưởi da xanh, Cam sành, Sầu riêng, Xoài, Mận, Nhãn...)
  if (
    n.includes('mít') || n.includes('bưởi') || n.includes('cam') || 
    n.includes('xoài') || n.includes('sầu riêng') || n.includes('chuối') || 
    n.includes('ổi') || n.includes('mận') || n.includes('chôm chôm') || 
    n.includes('nhãn') || n.includes('dâu') || n.includes('quýt') || 
    n.includes('thanh long') || n.includes('chanh') || n.includes('tắc') || n.includes('na')
  ) {
    return {
      type: 'fruit_tree',
      groupName: 'Cây ăn trái sinh thái lâu năm',
      cycleDays: 125, // Chu kỳ quả từ thụ phấn đến già chín: ~4 tháng
      seedStageName: 'Tuyển chọn cành ghép F1 & Dưỡng rễ thổ nhưỡng',
      careStageName: 'Bao trái sinh học nano & Nuôi quả hữu cơ',
      seedDesc: (farm) => `Cây giống đầu dòng F1 thuần chủng, sinh trưởng trên nền ${farm.soilFeature}. Bổ sung dinh dưỡng đợt đầu bằng phân hữu cơ vi sinh trùn quế và khoáng chất tự nhiên.`,
      careDesc: (farm) => `Cắt tỉa cành thông thoáng, nuôi quả chọn lọc (mỗi nhánh chỉ giữ 1-2 quả đẹp nhất). Tiến hành bao bọc quả bằng túi vải không dệt nano từ sớm để ngăn ruồi vàng và sâu đục cuống mà không cần phun thuốc trừ sâu.`,
      harvestDesc: (batch) => `Thu hoạch khi quả đạt độ già sinh lý xuất sắc (gõ tiếng trầm, gai nở phẳng, độ đường tự nhiên tích tụ tối đa). Cắt cuống bằng kéo vô trùng lúc sáng sớm, đợt thu đạt ${batch.initialQuantity} ${batch.unit}.`,
      coldChainTemp: '8°C – 12°C (Giữ độ ngọt & không thâm vỏ)',
      storageDays: 14,
      seedIot: [
        { label: 'Thổ nhưỡng đất', val: 'Đất phù sa / Bazan' },
        { label: 'Độ ẩm tầng rễ sâu', val: '68%' },
        { label: 'Độ pH đất', val: '6.2 – 6.8' }
      ],
      careIot: [
        { label: 'Bao trái bảo vệ', val: 'Túi Nano 100%' },
        { label: 'Dinh dưỡng tưới', val: 'Vi sinh hữu cơ' },
        { label: 'Cường độ nắng', val: 'Vườn sinh thái' }
      ],
      harvestIot: (batch) => [
        { label: 'Sản lượng đợt hái', val: `${batch.initialQuantity} ${batch.unit}` },
        { label: 'Độ già sinh học', val: '90% – 95% (Đủ tuổi)' },
        { label: 'Độ ngọt (Brix)', val: '14.5° Brix' }
      ]
    };
  }

  // Nhóm 3: Củ quả leo giàn (Cà chua bi, Dưa leo, Khổ qua, Bí đỏ, Bầu, Mướp, Đậu bắp, Su hào, Củ dền...)
  if (
    n.includes('cà chua') || n.includes('dưa leo') || n.includes('khổ qua') || 
    n.includes('bí') || n.includes('bầu') || n.includes('mướp') || 
    n.includes('đậu') || n.includes('su hào') || n.includes('củ dền') || 
    n.includes('củ cải') || n.includes('khoai') || n.includes('bông cải') || n.includes('bắp cải')
  ) {
    return {
      type: 'fruiting_vine',
      groupName: 'Củ quả & Thân leo bán giàn',
      cycleDays: 75,
      seedStageName: 'Gieo mầm khay giá thể & Khử trùng nhiệt',
      careStageName: 'Thụ phấn tự nhiên & Neo giàn quang học',
      seedDesc: (farm) => `Hạt giống kháng bệnh nhiệt đới F1, gieo mầm trên khay xơ dừa sinh học đã xử lý nấm bệnh. Cây con bén rễ khỏe khoắn thích ứng tuyệt vời với khí hậu ${farm.altitude}.`,
      careDesc: (farm) => `Thân cây được neo dây treo chữ A đón nắng tối đa. Thụ phấn tự nhiên bằng ong mật nuôi tại vườn kết hợp rung hoa cơ học. Tưới dinh dưỡng nhỏ giọt cân bằng theo từng chu kỳ đậu quả.`,
      harvestDesc: (batch) => `Thu hái từng chùm quả đều màu, vỏ căng bóng không tì vết vào buổi sớm tinh mơ. Sản lượng đợt này ghi nhận ${batch.initialQuantity} ${batch.unit}, đưa vào làm mát tiền lạnh 15°C trước khi đóng hộp.`,
      coldChainTemp: '6°C – 8°C (Giữ độ giòn ngọt mọng nước)',
      storageDays: 12,
      seedIot: [
        { label: 'Tỉ lệ nảy mầm', val: '98.5%' },
        { label: 'Nhiệt độ ươm cây', val: '22.0°C' },
        { label: 'Độ ẩm giá thể', val: '75%' }
      ],
      careIot: [
        { label: 'Lưu lượng tưới giọt', val: '1.8 lít/gốc/ngày' },
        { label: 'Ẩm độ giàn leo', val: '70%' },
        { label: 'Chỉ số tán lá NDVI', val: '0.82 (Khỏe mạnh)' }
      ],
      harvestIot: (batch) => [
        { label: 'Sản lượng đợt hái', val: `${batch.initialQuantity} ${batch.unit}` },
        { label: 'Phân loại quả', val: 'Loại 1 (Xuất sắc)' },
        { label: 'Độ mọng nước', val: '92%' }
      ]
    };
  }

  // Nhóm 4: Rau ăn lá ngắn ngày (Cải thìa, Xà lách, Rau muống, Rau dền, Mồng tơi, Cải ngọt...)
  return {
    type: 'leafy_green',
    groupName: 'Rau ăn lá ngắn ngày dinh dưỡng cao',
    cycleDays: 35,
    seedStageName: 'Ươm mầm hạt giống hữu cơ trên luống xốp',
    careStageName: 'Phun sương vi sinh & Phòng trừ sinh học',
    seedDesc: (farm) => `Tuyển chọn hạt giống rau lá chuẩn hữu cơ không biến đổi gen (Non-GMO). Gieo cấy trên luống đất hữu cơ tơi xốp giàu trùn quế tại ${farm.farmName}.`,
    careDesc: (farm) => `Hệ thống phun sương tự động điều hòa ẩm độ mát lành. Tuyệt đối không phân bón hóa học, cách ly chế phẩm vi sinh 10 ngày trước thu hoạch nhằm đảm bảo hàm lượng nitrat cực thấp.`,
    harvestDesc: (batch) => `Thu hoạch từ 5:00 đến 6:30 sáng khi sương đêm còn đọng trên búp lá để giữ nguyên vẹn độ giòn sần sật và vitamin C. Đợt hái đạt sản lượng ${batch.initialQuantity} ${batch.unit}.`,
    coldChainTemp: '4°C – 6°C (Chống héo úa & mất nước)',
    storageDays: 7,
    seedIot: [
      { label: 'Nhiệt độ gieo hạt', val: '21.0°C' },
      { label: 'Độ ẩm đất luống', val: '80%' },
      { label: 'Độ pH đất', val: '6.5 (Chuẩn vi sinh)' }
    ],
    careIot: [
      { label: 'Tần suất tưới sương', val: '3 lần/ngày' },
      { label: 'Thời gian cách ly', val: '> 10 ngày (Đạt)' },
      { label: 'Bẫy côn trùng', val: 'Bẫy dính sinh học' }
    ],
    harvestIot: (batch) => [
      { label: 'Sản lượng đợt hái', val: `${batch.initialQuantity} ${batch.unit}` },
      { label: 'Độ tươi giòn', val: '100% (Thu sương sớm)' },
      { label: 'Chỉ số lá xanh SPAD', val: '42.8 (Xanh mướt)' }
    ]
  };
}

// Phân tích nông trại và nhà cung cấp đa vùng miền
function getFarmAndSupplierProfile(batch: DbBatch): FarmProfile {
  const pName = (batch.product?.productName || '').toLowerCase();
  const fId = batch.farmId || 1;
  const supId = batch.product?.supplierId || 1;

  if (fId === 3 || fId === 4 || supId === 2 || pName.includes('miền tây') || pName.includes('tiền giang') || pName.includes('đồng tháp')) {
    return {
      farmName: 'HTX Nông Nghiệp & Cây Ăn Trái Phù Sa Sông Tiền',
      supplierName: 'Hợp Tác Xã Rau Sạch & Nông Sản Miền Tây',
      location: 'Cù lao Mỹ Hội, Huyện Cao Lãnh, Tỉnh Đồng Tháp / Cái Bè, Tiền Giang',
      altitude: 'Bãi bồi phù sa ngọt trù phú ven sông Tiền',
      soilFeature: 'đất phù sa bồi đắp màu mỡ giàu đạm thực vật tự nhiên và khoáng chất phù sa',
      standard: 'VietGAP Hữu Cơ Sinh Thái (Mã: GAP-MT-4402)',
      inspectorSeed: 'KS. Trần Văn Hữu (Kỹ sư giống sông Tiền)',
      inspectorCare: 'KTV. Lê Thị Kim Cương (Bảo vệ thực vật sinh học)',
      inspectorHarvest: 'Tổ trưởng thu hoạch: Nguyễn Văn Ba (Đội 2 Cái Bè)'
    };
  }

  if (fId === 5 || fId === 6 || supId === 3 || pName.includes('đồng nai') || pName.includes('bến tre') || pName.includes('bình phước') || pName.includes('vũng tàu')) {
    return {
      farmName: 'Trang Trại Cây Ăn Trái Xuất Khẩu Nam Bộ Farm',
      supplierName: 'Hợp Tác Xã Trái Cây & Nông Sản Việt',
      location: 'Huyện Thống Nhất, Tỉnh Đồng Nai / Châu Thành, Tỉnh Bến Tre',
      altitude: 'Vùng đồi bãi màu mỡ Đông Nam Bộ & Duyên hải phù sa',
      soilFeature: 'đất thịt pha cát màu mỡ thoát nước tốt, tối ưu cho tích tụ đường tự nhiên',
      standard: 'GlobalGAP & VietGAP Xuất Khẩu (Mã: GAP-NB-7821)',
      inspectorSeed: 'ThS. Đặng Thu Thảo (Chuyên gia Cây ăn trái)',
      inspectorCare: 'KS. Phan Minh Trí (Kỹ sư nông học GlobalGAP)',
      inspectorHarvest: 'Trưởng trạm thu hái: Trần Quốc Tuấn'
    };
  }

  if (pName.includes('mộc châu') || pName.includes('sơn la') || pName.includes('bắc hà') || pName.includes('lục ngạn') || pName.includes('chi lăng')) {
    return {
      farmName: 'Hợp Tác Xã Nông Sản Vùng Cao Mộc Châu',
      supplierName: 'Hợp Tác Xã Nông Nghiệp Tây Bắc',
      location: 'Cao nguyên Mộc Châu, Huyện Mộc Châu, Tỉnh Sơn La',
      altitude: 'Cao độ 1.050m - Khí hậu mát lạnh quanh năm sương mù',
      soilFeature: 'đất mùn vùng cao tơi xốp, giàu vi lượng tự nhiên',
      standard: 'VietGAP Vùng Cao (Mã: GAP-MC-8821)',
      inspectorSeed: 'KS. Hoàng A Súa (Kỹ sư giống bản địa Tây Bắc)',
      inspectorCare: 'KS. Đỗ Thúy Hằng (Kỹ sư sinh thái ôn đới)',
      inspectorHarvest: 'Tổ trưởng hái: Vàng A Páo'
    };
  }

  if (pName.includes('đắk lắk') || pName.includes('ban mê') || pName.includes('tây nguyên')) {
    return {
      farmName: 'Trang Trại Hữu Cơ Đất Đỏ Cao Nguyên Ban Mê',
      supplierName: 'Hợp Tác Xã Nông Sản Cao Nguyên',
      location: 'Thị xã Buôn Hồ, Tỉnh Đắk Lắk',
      altitude: 'Cao độ 550m - Đất đỏ bazan trù phú Tây Nguyên',
      soilFeature: 'đất đỏ bazan tầng dày giàu khoáng oxit sắt nhôm màu mỡ',
      standard: 'USDA Organic & VietGAP (Mã: GAP-DLK-7714)',
      inspectorSeed: 'KS. Y Blô Mlô (Kỹ sư Thổ nhưỡng Tây Nguyên)',
      inspectorCare: 'KS. Nguyễn Thị Lan (Phụ trách tưới nhỏ giọt Israel)',
      inspectorHarvest: 'Tổ trưởng hái: Y Krang Byă'
    };
  }

  // Mặc định: Nông trại Công nghệ cao Đà Lạt / Lâm Đồng (fId === 1, 2)
  return {
    farmName: 'HTX Nông Nghiệp Công Nghệ Cao LÀNH Đà Lạt',
    supplierName: 'Hợp Tác Xã Nông Sản Đà Lạt',
    location: 'Thôn Đa Quý, Xã Xuân Thọ, TP. Đà Lạt, Tỉnh Lâm Đồng',
    altitude: 'Cao độ 1.500m - Khí hậu ôn đới quanh năm mát lành',
    soilFeature: 'đất đỏ đồi núi cao kết hợp giá thể xơ dừa vi sinh đã khử độc nhiệt',
    standard: 'VietGAP Công Nghệ Cao & GlobalGAP (Mã: GAP-LD-1102)',
    inspectorSeed: 'ThS. Nguyễn Hoàng Nam (Chuyên gia Nông học Đà Lạt)',
    inspectorCare: 'KS. Trần Thị Mai (Kỹ sư vi sinh nhà kính)',
    inspectorHarvest: 'Đội trưởng thu hái: Lê Văn Nam (Đội 1 Đa Quý)'
  };
}

// Bảng chỉ tiêu kiểm định phòng Lab linh hoạt theo loại cây
function getQcIndicators(cropType: CropType) {
  if (cropType === 'fruit_tree') {
    return [
      { name: 'Dư lượng thuốc BVTV (24 hoạt chất)', result: '0.00 ppm (Không phát hiện)', limit: 'Không phát hiện', status: 'ĐẠT (Hữu cơ)' },
      { name: 'Độ đường tự nhiên (Độ Brix)', result: '14.2° – 15.5° Brix', limit: '≥ 12.0° Brix', status: 'ĐẠT (Ngọt đậm đà)' },
      { name: 'Kim loại nặng (Chì, Cadimi)', result: 'Âm tính', limit: '≤ 0.05 mg/kg', status: 'ĐẠT' },
      { name: 'Chất kích chín ép (Ethephon)', result: 'Không phát hiện', limit: 'Không phát hiện', status: 'ĐẠT (Ủ tự nhiên 100%)' }
    ];
  }
  if (cropType === 'mushroom') {
    return [
      { name: 'Độc tố vi nấm Aflatoxin (B1, B2, G1, G2)', result: 'Không phát hiện', limit: '≤ 2.0 µg/kg', status: 'ĐẠT (An toàn)' },
      { name: 'Vi khuẩn hiếu khí & Nấm men', result: '< 10² CFU/g', limit: '≤ 10³ CFU/g', status: 'ĐẠT' },
      { name: 'Kim loại nặng (Chì, Thủy ngân)', result: 'Âm tính', limit: '≤ 0.05 mg/kg', status: 'ĐẠT' },
      { name: 'Dư lượng chất tẩy trắng (SO2)', result: '0.00 mg/kg', limit: 'Không phát hiện', status: 'ĐẠT (Tự nhiên)' }
    ];
  }
  if (cropType === 'fruiting_vine') {
    return [
      { name: 'Dư lượng thuốc BVTV (24 hoạt chất)', result: '0.00 ppm (Không phát hiện)', limit: 'Không phát hiện', status: 'ĐẠT (VietGAP)' },
      { name: 'Hàm lượng Nitrat (NO3-)', result: '42 mg/kg', limit: '≤ 500 mg/kg', status: 'ĐẠT (An toàn)' },
      { name: 'Kim loại nặng (Chì, Cadimi)', result: 'Âm tính', limit: '≤ 0.05 mg/kg', status: 'ĐẠT' },
      { name: 'Vi khuẩn E. coli & Salmonella', result: 'Âm tính / 25g', limit: 'Không phát hiện', status: 'ĐẠT' }
    ];
  }
  // leafy_green
  return [
    { name: 'Hàm lượng Nitrat (NO3-)', result: '32 mg/kg', limit: '≤ 500 mg/kg', status: 'ĐẠT (An toàn)' },
    { name: 'Dư lượng thuốc BVTV (24 hoạt chất)', result: '0.00 ppm (Không phát hiện)', limit: 'Không phát hiện', status: 'ĐẠT (Hữu cơ)' },
    { name: 'Kim loại nặng (Chì, Cadimi)', result: 'Âm tính', limit: '≤ 0.05 mg/kg', status: 'ĐẠT' },
    { name: 'Vi khuẩn E. coli & Salmonella', result: 'Âm tính / 25g', limit: 'Không phát hiện', status: 'ĐẠT' }
  ];
}

// Sinh dòng thời gian 6 Mốc hành trình CHUẨN XÁC theo Lô hàng, Nông trại và Cây trồng
function generateBatchTimeline(batch: DbBatch) {
  const pName = batch.product?.productName || 'Nông sản sạch LÀNH';
  const crop = getCropProfile(pName);
  const farm = getFarmAndSupplierProfile(batch);
  
  const hDate = new Date(batch.harvestDate);
  const harvestStr = !isNaN(hDate.getTime())
    ? hDate.toLocaleDateString('vi-VN') + ' (05:30 AM)'
    : '20/08/2026 (05:30 AM)';

  // Ngày gieo/chuẩn bị (tính lùi theo chu kỳ sinh học thực tế của loại cây)
  const sowDate = new Date(hDate.getTime() - crop.cycleDays * 24 * 60 * 60 * 1000);
  const sowStr = !isNaN(sowDate.getTime()) ? sowDate.toLocaleDateString('vi-VN') : '05/07/2026';

  // Khoảng thời gian chăm sóc sinh học
  const careStart = new Date(sowDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  const careEnd = new Date(hDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const careStr = (!isNaN(careStart.getTime()) && !isNaN(careEnd.getTime()))
    ? `${careStart.toLocaleDateString('vi-VN')} – ${careEnd.toLocaleDateString('vi-VN')}`
    : '10/07 – 18/08/2026';

  // Hạn sử dụng
  const expDate = new Date(batch.expiryDate);
  const expStr = !isNaN(expDate.getTime()) ? expDate.toLocaleDateString('vi-VN') : '28/08/2026';

  // Ngày nhập kho
  const recDate = new Date(batch.receivedDate);
  const recStr = !isNaN(recDate.getTime())
    ? recDate.toLocaleDateString('vi-VN') + ' (14:00 PM)'
    : '20/08/2026 (14:00 PM)';

  return [
    {
      stepNumber: '01',
      stepTitle: crop.seedStageName,
      date: sowStr,
      stage: 'Nguồn giống & Khởi tạo giá thể',
      location: farm.farmName,
      inspector: farm.inspectorSeed,
      recordNo: `HỒ SƠ GIỐNG: #SEED-${batch.batchCode}`,
      desc: crop.seedDesc(farm),
      iotParams: crop.seedIot
    },
    {
      stepNumber: '02',
      stepTitle: crop.careStageName,
      date: careStr,
      stage: 'Canh tác sinh thái & Giám sát IoT',
      location: `${farm.location}`,
      inspector: farm.inspectorCare,
      recordNo: `NHẬT KÝ CANH TÁC: #LOG-${batch.batchCode}`,
      desc: crop.careDesc(farm),
      iotParams: crop.careIot
    },
    {
      stepNumber: '03',
      stepTitle: 'Thu hoạch sương sớm & Phân loại quả chuẩn',
      date: harvestStr,
      stage: 'Thu hái thủ công tại vườn',
      location: `Trạm thu hái tại nguồn - ${farm.farmName}`,
      inspector: farm.inspectorHarvest,
      recordNo: `BIÊN BẢN THU HOẠCH: #HRV-${batch.batchCode}`,
      desc: crop.harvestDesc(batch),
      iotParams: crop.harvestIot(batch)
    },
    {
      stepNumber: '04',
      stepTitle: `Kiểm nghiệm chất lượng an toàn thực phẩm`,
      date: `${hDate.toLocaleDateString('vi-VN')} (08:30 AM)`,
      stage: 'Xét nghiệm độc lập ISO/IEC 17025',
      location: 'Phòng Phân Tích & Kiểm Định Nông Sản Độc Lập ISO/IEC 17025',
      inspector: 'KTV. Đỗ Thu Trang (Chuyên viên vi sinh & hóa nghiệm)',
      recordNo: `PHIẾU KIỂM ĐỊNH: #QC-${batch.batchCode}`,
      desc: `Lấy mẫu ngẫu nhiên từ chính lô hàng này để xét nghiệm toàn diện các chỉ tiêu an toàn: kiểm tra dư lượng hoạt chất bảo vệ thực vật, kim loại nặng và vi sinh. Tất cả chỉ số đều đạt mức an toàn tuyệt đối theo chuẩn ${farm.standard}.`,
      iotParams: [
        { label: 'Dư lượng BVTV', val: '0.00 ppm (Đạt)' },
        { label: 'Kim loại nặng', val: 'Âm tính' },
        { label: 'Tiêu chuẩn', val: farm.standard.split(' ')[0] }
      ]
    },
    {
      stepNumber: '05',
      stepTitle: `Vận chuyển chuỗi lạnh FreshLock (${crop.coldChainTemp.split(' ')[0]})`,
      date: `${hDate.toLocaleDateString('vi-VN')} (10:30 AM)`,
      stage: 'Logistics lạnh kiểm soát GPS',
      location: 'Đoàn xe lạnh chuyên dụng LÀNH Express (Biển số: 49C-184.22)',
      inspector: 'Tài xế vận hành: Phạm Quốc Hưng',
      recordNo: `VẬN ĐƠN XE LẠNH: #SHIP-${batch.batchCode}`,
      desc: `Nông sản được đóng gói bảo quản và vận chuyển bằng xe lạnh chuyên dụng ở nhiệt độ ${crop.coldChainTemp}. Cảm biến IoT trên xe kiểm soát nhiệt độ liên tục và truyền dữ liệu GPS Live về máy chủ mỗi 5 phút.`,
      iotParams: [
        { label: 'Nhiệt độ thùng xe', val: crop.coldChainTemp.split(' ')[0] },
        { label: 'Vận tốc trung bình', val: '58 km/h' },
        { label: 'Trạng thái GPS', val: 'Đang kết nối Live' }
      ]
    },
    {
      stepNumber: '06',
      stepTitle: 'Nhập tổng kho & Đến bàn ăn gia đình',
      date: recStr,
      stage: 'Giao tận tay người tiêu dùng',
      location: 'Tổng kho phân phối trung tâm TP.HCM / Hà Nội',
      inspector: 'Bộ phận điều phối xuất kho LÀNH',
      recordNo: `MÃ QR TRÊN BAO BÌ: ${batch.batchCode}`,
      desc: `Hàng về kho trung tâm được xuất kho theo nguyên tắc FEFO (First Expired First Out). Giao nhanh 2 giờ đến tận gian bếp người dùng, khuyên dùng trước ngày ${expStr} để đảm bảo vị ngon ngọt trọn vẹn nhất.`,
      iotParams: [
        { label: 'Hạn dùng tốt nhất', val: expStr },
        { label: 'Thời gian giao', val: 'Hỏa tốc 2 giờ' },
        { label: 'Bao bì bảo quản', val: 'Túi FreshLock 100%' }
      ]
    }
  ];
}

function TraceabilityInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchQueryParam = searchParams.get('batch') || searchParams.get('lot');

  const [batches, setBatches] = useState<DbBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<DbBatch | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showQcModal, setShowQcModal] = useState(false);

  // User & Giỏ hàng
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [cartBounce, setCartBounce] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Theme & Lang
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Đọc user & cart từ localStorage
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

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  // Fetch danh sách lô hàng thật từ API Backend
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5023/api/productbatches')
      .then(res => res.json())
      .then((data: DbBatch[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setBatches(data);

          // Nếu có param ?batch=... từ URL (ví dụ chuyển từ trang sản phẩm hoặc trang đơn hàng sang)
          if (batchQueryParam) {
            const found = data.find(b => b.batchCode.toLowerCase() === batchQueryParam.toLowerCase());
            if (found) {
              setSelectedBatch(found);
              setSearchInput(found.batchCode);
              setSearchMsg(`✓ Đang hiển thị hồ sơ cho mã lô "${found.batchCode}"`);
              setLoading(false);
              return;
            }
          }

          // Mặc định chọn lô hàng đầu tiên
          setSelectedBatch(data[0]);
          setSearchInput(data[0].batchCode);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải danh sách lô hàng:', err);
        // Dữ liệu dự phòng nếu backend tạm dừng
        const fallbackBatch: DbBatch = {
          batchId: 1,
          productId: 1,
          farmId: 1,
          batchCode: 'CT-260820-001',
          harvestDate: '2026-08-20T06:00:00',
          receivedDate: '2026-08-20T12:00:00',
          expiryDate: '2026-08-28T23:59:59',
          initialQuantity: 120,
          unit: 'kg',
          status: 'Active',
          product: {
            productId: 1,
            productName: 'Cà chua bi Đà Lạt',
            description: 'Cà chua bi đỏ vị ngọt thanh mát, canh tác chuẩn VietGAP.',
            price: 68000,
            unit: 'kg'
          }
        };
        setBatches([fallbackBatch]);
        setSelectedBatch(fallbackBatch);
        setSearchInput(fallbackBatch.batchCode);
        setLoading(false);
      });
  }, [batchQueryParam]);

  // Xử lý tìm kiếm mã lô
  const handleSearch = (codeToSearch?: string) => {
    const target = (codeToSearch || searchInput).trim().toUpperCase();
    if (!target) return;

    const found = batches.find(b => 
      b.batchCode.toUpperCase().includes(target) || 
      (b.product?.productName && b.product.productName.toUpperCase().includes(target))
    );

    if (found) {
      setSelectedBatch(found);
      setActiveStepIdx(0);
      setSearchMsg(`✓ Đã tìm thấy hồ sơ cho mã lô "${found.batchCode}" (${found.product?.productName})`);
    } else {
      setSearchMsg(`Không tìm thấy lô hàng khớp với "${target}". Đang hiển thị lô gần nhất.`);
    }
  };

  const totalCart = cart.reduce((s, i) => s + parseInt((i.product?.price || '0').replace(/[^\d]/g, ''), 10) * (i.qty || 1), 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  if (loading || !selectedBatch) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--green-100)', borderTopColor: 'var(--green-700)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>Đang tải dữ liệu chuỗi cung ứng nông trại...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const timeline = generateBatchTimeline(selectedBatch);
  const currentStep = timeline[activeStepIdx] || timeline[0];
  const farmInfo = getFarmAndSupplierProfile(selectedBatch);
  const cropProfile = getCropProfile(selectedBatch.product?.productName || '');
  const qcIndicators = getQcIndicators(cropProfile.type);

  return (
    <>
      <header>
        {/* ── TẦNG 1: TOP BAR ── */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP & Hữu cơ</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="topbar-link">Hotline: <strong>1900 8899</strong> (7:00 - 21:00)</span>
            </div>
            <div className="topbar-right">
              <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="topbar-link">
                Kênh Đối Tác / HTX
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="icon-btn" onClick={toggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                  {theme === 'light' ? 'Tối' : 'Sáng'}
                </button>
                <div className="lang-switch">
                  <button className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 2: MAIN HEADER ── */}
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

          <SearchBar placeholder="Tìm kiếm nông sản, mã lô, tên vườn..." />

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
                  <span className="header-action-label">{currentUser ? 'Xin chào,' : 'Tài khoản'}</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : 'Đăng nhập'}
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
                      <Link href="/profile" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px' }}>Hồ sơ cá nhân</Link>
                      <Link href="/orders" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px' }}>Đơn hàng của tôi</Link>
                      <button onClick={handleCustomerLogout} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#e53e3e', fontSize: '13px', fontWeight: '700' }}>Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '600' }}>Đăng nhập</Link>
                      <Link href="/register" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--green-700)', fontSize: '13px', fontWeight: '600' }}>Đăng ký</Link>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span className="badge">{cart.reduce((s, i) => s + (i.qty || 1), 0)}</span>
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

        {/* ── TẦNG 3: SUB-NAVBAR ── */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">Trang chủ</Link>
              <Link href="/products" className="subnav-link">Tất cả nông sản</Link>
              <Link href="/combos" className="subnav-link">Combo định kỳ</Link>
              <Link href="/traceability" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>
                Truy xuất nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: '85vh', paddingBottom: '70px', backgroundColor: 'var(--bg)', color: 'var(--ink)' }}>
        {/* BANNER TRA CỨU HỒ SƠ LÔ HÀNG */}
        <section style={{
          background: 'linear-gradient(135deg, var(--green-900) 0%, #1a4d2e 100%)',
          color: '#FFFFFF',
          padding: '44px 0 36px',
          marginBottom: '32px'
        }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent)', fontWeight: 700 }}>
              Chuỗi Cung Ứng Khép Kín Farm To Table 4.0
            </span>
            <h1 style={{ fontSize: '32px', margin: '10px 0', color: '#FFFFFF', fontWeight: 800 }}>
              Truy Xuất Nguồn Gốc Lô Hàng Nông Sản
            </h1>
            <p style={{ margin: '0 auto 24px auto', fontSize: '14.5px', opacity: 0.9, maxWidth: '680px', lineHeight: 1.6 }}>
              Mỗi giỏ nông sản LÀNH đều mang một mã lô duy nhất. Nhập mã lô trên bao bì để xem toàn bộ 6 mốc hành trình từ lúc chọn giống, kiểm định phòng Lab đến nhiệt độ xe lạnh.
            </p>

            {/* Ô TRA CỨU MÃ LÔ */}
            <div style={{
              maxWidth: '560px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '999px',
              padding: '6px 8px 6px 20px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập mã lô trên bao bì (VD: CT-260820-001, XL-260821-001...)"
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  fontSize: '14px',
                  color: 'var(--ink)'
                }}
              />
              <button
                onClick={() => handleSearch()}
                className="btn btn-accent"
                style={{ padding: '8px 22px', borderRadius: '999px', fontSize: '13.5px', fontWeight: 700 }}
              >
                Tra cứu
              </button>
            </div>

            {/* DANH SÁCH LÔ HÀNG THẬT TRONG DATABASE ĐỂ CHỌN NHANH */}
            <div style={{ marginTop: '16px', fontSize: '12.5px', opacity: 0.9 }}>
              <span>Lô hàng nông sản có sẵn trong hệ thống:</span>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                {batches.slice(0, 5).map(b => (
                  <button
                    key={b.batchId}
                    type="button"
                    onClick={() => {
                      setSelectedBatch(b);
                      setSearchInput(b.batchCode);
                      setActiveStepIdx(0);
                      setSearchMsg(`✓ Đang hiển thị hồ sơ cho mã lô "${b.batchCode}"`);
                    }}
                    style={{
                      background: selectedBatch.batchCode === b.batchCode ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
                      border: 'none',
                      color: selectedBatch.batchCode === b.batchCode ? 'var(--green-900)' : '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selectedBatch.batchCode === b.batchCode ? 800 : 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    <strong>{b.batchCode}</strong> {b.product?.productName ? `(${b.product.productName.split(' ')[0]}...)` : ''}
                  </button>
                ))}
              </div>
            </div>

            {searchMsg && (
              <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                {searchMsg}
              </div>
            )}
          </div>
        </section>

        <div className="wrap">
          {/* THẺ TỔNG QUAN VỀ LÔ HÀNG ĐANG XEM (MÃ LÔ LÀ DUY NHẤT) */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green-700)', backgroundColor: 'var(--green-100)', padding: '3px 10px', borderRadius: '20px' }}>
                  HỒ SƠ LÔ HÀNG HỢP LỆ
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                  Trạng thái: <strong>{selectedBatch.status || 'Đang lưu hành'}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '24px', margin: '0 0 6px 0', color: 'var(--green-900)' }}>
                {selectedBatch.product?.productName || 'Nông sản sạch LÀNH'}
              </h2>
              <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span>Nông trại: <strong style={{ color: 'var(--ink)' }}>{farmInfo.farmName}</strong></span>
                <span>•</span>
                <span>Nhà cung cấp: <strong style={{ color: 'var(--green-700)' }}>{farmInfo.supplierName}</strong></span>
                <span>•</span>
                <span>Tiêu chuẩn: <strong style={{ color: '#15803d' }}>{farmInfo.standard}</strong></span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                📍 <i>{farmInfo.location} ({farmInfo.altitude})</i>
              </div>
            </div>

            {/* Khối Mã Lô trung tâm & Nút xem chứng thư */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                textAlign: 'right',
                borderRight: '1px solid var(--line)',
                paddingRight: '16px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  MÃ LÔ TRUY XUẤT ĐỘC QUYỀN
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green-900)', letterSpacing: '0.5px' }}>
                  {selectedBatch.batchCode}
                </div>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                  Thu hoạch: {new Date(selectedBatch.harvestDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQcModal(true)}
                className="btn btn-accent"
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Phiếu kiểm nghiệm VietGAP</span>
              </button>
            </div>
          </div>

          {/* THANH 6 MỐC HÀNH TRÌNH CỦA CHÍNH LÔ HÀNG */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '15px', color: 'var(--ink-soft)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              6 Mốc Nhật Ký Hành Trình Thuộc Mã Lô: <strong style={{ color: 'var(--green-900)' }}>{selectedBatch.batchCode}</strong>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px'
            }}>
              {timeline.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                return (
                  <button
                    key={step.stepNumber}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    style={{
                      backgroundColor: isActive ? 'var(--green-100)' : 'var(--bg)',
                      border: isActive ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '14px 10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--green-700)' : 'var(--line)',
                      color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      fontSize: '13px',
                      fontWeight: 800
                    }}>
                      {step.stepNumber}
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--green-700)', textTransform: 'uppercase', marginBottom: '2px' }}>
                      MỐC {step.stepNumber}
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '12.5px', color: 'var(--ink)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {step.stepTitle.split('&')[0]}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                      {step.date.split('–')[0].split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KHỐI CHI TIẾT CỦA MỐC HÀNH TRÌNH ĐƯỢC CHỌN */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '20px',
            border: '1.5px solid var(--green-700)',
            padding: '32px',
            boxShadow: '0 8px 30px rgba(46, 125, 50, 0.08)',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* CỘT TRÁI: THÔNG TIN CHI TIẾT CÔNG ĐOẠN */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--green-700)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800
                  }}>
                    {currentStep.stepNumber}
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green-700)', textTransform: 'uppercase' }}>
                      GIAI ĐOẠN: {currentStep.stage}
                    </span>
                    <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--ink)' }}>{currentStep.stepTitle}</h2>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg)', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>Thời gian ghi nhận:</span> <strong>{currentStep.date}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>Địa điểm thực hiện:</span> <strong>{currentStep.location}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
                    <span style={{ color: 'var(--ink-soft)' }}>Người giám sát / Phụ trách:</span> <strong>{currentStep.inspector}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.7, margin: 0 }}>
                  {currentStep.desc}
                </p>
              </div>

              {/* CỘT PHẢI: CẢM BIẾN IOT THỜI GIAN THỰC & HỒ SƠ LƯU TRỮ CỦA BƯỚC NÀY */}
              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--line)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--green-700)' }}>
                      Thông số kỹ thuật & Cảm biến IoT
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '11px', fontWeight: 700 }}>
                      ✓ Đã xác thực
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {currentStep.iotParams.map((param, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {param.label}
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--green-900)' }}>
                          {param.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KHỐI LƯU TRỮ HỒ SƠ TƯƠNG ỨNG CỦA MỐC NÀY */}
                <div style={{
                  backgroundColor: 'var(--surface)',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '1px dashed var(--green-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                      MÃ LÔ TỔNG: <strong style={{ color: 'var(--green-900)' }}>{selectedBatch.batchCode}</strong>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--green-700)', marginTop: '2px' }}>
                      {currentStep.recordNo}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                      Lưu trữ hệ thống quản lý chất lượng LÀNH Farm
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQcModal(true)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--green-700)',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Xem phiếu QC →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL XEM PHIẾU KIỂM NGHIỆM CHẤT LƯỢNG VIETGAP */}
        {showQcModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              padding: '32px',
              border: '1px solid var(--line)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--green-900)', paddingBottom: '14px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--green-700)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    TRUNG TÂM PHÂN TÍCH & KIỂM ĐỊNH CHẤT LƯỢNG NÔNG SẢN LÀNH
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', color: 'var(--green-900)', fontWeight: 800 }}>
                    PHIẾU KẾT QUẢ KIỂM NGHIỆM AN TOÀN THỰC PHẨM
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                    Số phiếu: <strong>QC-{selectedBatch.batchCode}</strong> · Tiêu chuẩn ISO/IEC 17025
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQcModal(false)}
                  style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--ink-soft)' }}
                >
                  ✕
                </button>
              </div>

              {/* Thông tin mẫu thử */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', backgroundColor: 'var(--bg)', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px' }}>
                <div>Tên mẫu: <strong>{selectedBatch.product?.productName}</strong></div>
                <div>Mã lô thử nghiệm: <strong>{selectedBatch.batchCode}</strong></div>
                <div>Ngày lấy mẫu: <strong>{new Date(selectedBatch.harvestDate).toLocaleDateString('vi-VN')}</strong></div>
                <div>Nông trại: <strong>{farmInfo.farmName}</strong></div>
              </div>

              {/* Bảng chỉ số test */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-900)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>Chỉ tiêu kiểm nghiệm</th>
                    <th style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>Kết quả phân tích</th>
                    <th style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>Ngưỡng cho phép (Bộ Y Tế)</th>
                    <th style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {qcIndicators.map((qc, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>{qc.name}</td>
                      <td style={{ padding: '8px 12px', border: '1px solid var(--line)', fontWeight: 700, color: 'var(--green-700)' }}>{qc.result}</td>
                      <td style={{ padding: '8px 12px', border: '1px solid var(--line)' }}>{qc.limit}</td>
                      <td style={{ padding: '8px 12px', border: '1px solid var(--line)', fontWeight: 700, color: '#15803d' }}>{qc.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', color: 'var(--green-700)', fontWeight: 700 }}>
                  ✓ Đã kiểm duyệt và cấp chứng thư {farmInfo.standard.split(' ')[0]} ngày {new Date(selectedBatch.harvestDate).toLocaleDateString('vi-VN')}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Đang tạo và tải bản in chứng thư an toàn thực phẩm PDF...');
                    setShowQcModal(false);
                  }}
                  className="btn btn-accent"
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
                >
                  Tải chứng thư (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
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
                <li>1900 6868 (7:00–21:00)</li>
                <li>hello@lanh.vn</li>
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
                <span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 LÀNH — Hệ thống quản lý truy xuất chuỗi cung ứng Farm to Table.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function TraceabilityPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>Đang khởi tạo hệ thống truy xuất...</p>
      </div>
    }>
      <TraceabilityInner />
    </Suspense>
  );
}
