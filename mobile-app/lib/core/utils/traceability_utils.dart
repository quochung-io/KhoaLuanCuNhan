import 'package:flutter/material.dart';

enum CropType { fruitTree, fruitingVine, leafyGreen, mushroom }

class FarmProfile {
  final String farmName;
  final String supplierName;
  final String location;
  final String altitude;
  final String standard;
  final String soilFeature;
  final String inspectorSeed;
  final String inspectorCare;
  final String inspectorHarvest;

  FarmProfile({
    required this.farmName,
    required this.supplierName,
    required this.location,
    required this.altitude,
    required this.standard,
    required this.soilFeature,
    required this.inspectorSeed,
    required this.inspectorCare,
    required this.inspectorHarvest,
  });
}

class CropProfile {
  final CropType type;
  final String groupName;
  final int cycleDays;
  final String seedStageName;
  final String careStageName;
  final String Function(FarmProfile) seedDesc;
  final String Function(FarmProfile) careDesc;
  final String Function(String, String) harvestDesc; // (initialQuantity, unit)
  final String coldChainTemp;
  final int storageDays;
  final List<Map<String, String>> seedIot;
  final List<Map<String, String>> careIot;
  final List<Map<String, String>> Function(String, String) harvestIot;

  CropProfile({
    required this.type,
    required this.groupName,
    required this.cycleDays,
    required this.seedStageName,
    required this.careStageName,
    required this.seedDesc,
    required this.careDesc,
    required this.harvestDesc,
    required this.coldChainTemp,
    required this.storageDays,
    required this.seedIot,
    required this.careIot,
    required this.harvestIot,
  });
}

class TraceabilityUtils {
  static CropProfile getCropProfile(String productName) {
    final n = productName.toLowerCase();

    // Nhóm 1: Nấm thực phẩm & Vi sinh vật
    if (n.contains('nấm')) {
      return CropProfile(
        type: CropType.mushroom,
        groupName: 'Nấm thực phẩm & Vi sinh vật phòng lạnh',
        cycleDays: 22,
        seedStageName: 'Cấy meo giống & Ủ cơ chất mùn cưa tiệt trùng',
        careStageName: 'Dưỡng sợi tơ & Kích ẩm buồng lạnh vô trùng',
        seedDesc: (farm) => 'Tuyển chọn meo nấm giống thuần chủng F1, cấy trên cơ chất mùn cưa cao su tự nhiên đã qua tiệt trùng lò hơi 121°C áp suất cao. Đảm bảo môi trường nuôi cấy vô trùng 100% tại ${farm.farmName}.',
        careDesc: (farm) => 'Phát triển trong buồng lạnh khép kín với hệ thống siêu âm tạo sương giữ ẩm ổn định 85% – 92%. Ánh sáng khuếch tán dịu nhẹ, dinh dưỡng hữu cơ tự nhiên, tuyệt đối không chất bảo quản.',
        harvestDesc: (qty, unit) => 'Thu hái thủ công từng búp nấm đạt độ nở tiêu chuẩn loại 1 (mũ nấm dày, thân mập trắng ngà). Sản lượng đợt hái đạt $qty $unit, đưa vào phòng hạ nhiệt cấp tốc trong vòng 30 phút.',
        coldChainTemp: '2°C – 4°C (Bảo quản đạm thực vật)',
        storageDays: 10,
        seedIot: [
          {'label': 'Nhiệt độ ủ cơ chất', 'val': '24.0°C'},
          {'label': 'Áp suất tiệt trùng', 'val': '1.2 atm'},
          {'label': 'Độ ẩm cơ chất', 'val': '65%'},
        ],
        careIot: [
          {'label': 'Nhiệt độ buồng lạnh', 'val': '18.5°C'},
          {'label': 'Độ ẩm không khí', 'val': '88%'},
          {'label': 'Nồng độ CO2', 'val': '< 800 ppm'},
        ],
        harvestIot: (qty, unit) => [
          {'label': 'Sản lượng đợt hái', 'val': '$qty $unit'},
          {'label': 'Độ mở búp nấm', 'val': 'Chuẩn Loại 1'},
          {'label': 'Nhiệt độ buồng hái', 'val': '18.0°C'},
        ],
      );
    }

    // Nhóm 2: Cây ăn trái thân gỗ
    if (n.contains('mít') || n.contains('bưởi') || n.contains('cam') ||
        n.contains('xoài') || n.contains('sầu riêng') || n.contains('chuối') ||
        n.contains('ổi') || n.contains('mận') || n.contains('chôm chôm') ||
        n.contains('nhãn') || n.contains('dâu') || n.contains('quýt') ||
        n.contains('thanh long') || n.contains('chanh') || n.contains('tắc') || n.contains('na')) {
      return CropProfile(
        type: CropType.fruitTree,
        groupName: 'Cây ăn trái sinh thái lâu năm',
        cycleDays: 125,
        seedStageName: 'Tuyển chọn cành ghép F1 & Dưỡng rễ thổ nhưỡng',
        careStageName: 'Bao trái sinh học nano & Nuôi quả hữu cơ',
        seedDesc: (farm) => 'Cây giống đầu dòng F1 thuần chủng, sinh trưởng trên nền ${farm.soilFeature}. Bổ sung dinh dưỡng đợt đầu bằng phân hữu cơ vi sinh trùn quế và khoáng chất tự nhiên.',
        careDesc: (farm) => 'Cắt tỉa cành thông thoáng, nuôi quả chọn lọc (mỗi nhánh chỉ giữ 1-2 quả đẹp nhất). Tiến hành bao bọc quả bằng túi vải không dệt nano từ sớm để ngăn ruồi vàng và sâu đục cuống mà không cần phun thuốc trừ sâu.',
        harvestDesc: (qty, unit) => 'Thu hoạch khi quả đạt độ già sinh lý xuất sắc (gõ tiếng trầm, gai nở phẳng, độ đường tự nhiên tích tụ tối đa). Cắt cuống bằng kéo vô trùng lúc sáng sớm, đợt thu đạt $qty $unit.',
        coldChainTemp: '8°C – 12°C (Giữ độ ngọt & không thâm vỏ)',
        storageDays: 14,
        seedIot: [
          {'label': 'Thổ nhưỡng đất', 'val': 'Đất phù sa / Bazan'},
          {'label': 'Độ ẩm tầng rễ sâu', 'val': '68%'},
          {'label': 'Độ pH đất', 'val': '6.2 – 6.8'},
        ],
        careIot: [
          {'label': 'Bao trái bảo vệ', 'val': 'Túi Nano 100%'},
          {'label': 'Dinh dưỡng tưới', 'val': 'Vi sinh hữu cơ'},
          {'label': 'Cường độ nắng', 'val': 'Vườn sinh thái'},
        ],
        harvestIot: (qty, unit) => [
          {'label': 'Sản lượng đợt hái', 'val': '$qty $unit'},
          {'label': 'Độ già sinh học', 'val': '90% – 95% (Đủ tuổi)'},
          {'label': 'Độ ngọt (Brix)', 'val': '14.5° Brix'},
        ],
      );
    }

    // Nhóm 3: Củ quả leo giàn
    if (n.contains('cà chua') || n.contains('dưa leo') || n.contains('khổ qua') ||
        n.contains('bí') || n.contains('bầu') || n.contains('mướp') ||
        n.contains('đậu') || n.contains('su hào') || n.contains('củ dền') ||
        n.contains('củ cải') || n.contains('khoai') || n.contains('bông cải') || n.contains('bắp cải')) {
      return CropProfile(
        type: CropType.fruitingVine,
        groupName: 'Củ quả & Thân leo bán giàn',
        cycleDays: 75,
        seedStageName: 'Gieo mầm khay giá thể & Khử trùng nhiệt',
        careStageName: 'Thụ phấn tự nhiên & Neo giàn quang học',
        seedDesc: (farm) => 'Hạt giống kháng bệnh nhiệt đới F1, gieo mầm trên khay xơ dừa sinh học đã xử lý nấm bệnh. Cây con bén rễ khỏe khoắn thích ứng tuyệt vời với khí hậu ${farm.altitude}.',
        careDesc: (farm) => 'Thân cây được neo dây treo chữ A đón nắng tối đa. Thụ phấn tự nhiên bằng ong mật nuôi tại vườn kết hợp rung hoa cơ học. Tưới dinh dưỡng nhỏ giọt cân bằng theo từng chu kỳ đậu quả.',
        harvestDesc: (qty, unit) => 'Thu hái từng chùm quả đều màu, vỏ căng bóng không tì vết vào buổi sớm tinh mơ. Sản lượng đợt này ghi nhận $qty $unit, đưa vào làm mát tiền lạnh 15°C trước khi đóng hộp.',
        coldChainTemp: '6°C – 8°C (Giữ độ giòn ngọt mọng nước)',
        storageDays: 12,
        seedIot: [
          {'label': 'Tỉ lệ nảy mầm', 'val': '98.5%'},
          {'label': 'Nhiệt độ ươm cây', 'val': '22.0°C'},
          {'label': 'Độ ẩm giá thể', 'val': '75%'},
        ],
        careIot: [
          {'label': 'Lưu lượng tưới giọt', 'val': '1.8 lít/gốc/ngày'},
          {'label': 'Ẩm độ giàn leo', 'val': '70%'},
          {'label': 'Chỉ số tán lá NDVI', 'val': '0.82 (Khỏe mạnh)'},
        ],
        harvestIot: (qty, unit) => [
          {'label': 'Sản lượng đợt hái', 'val': '$qty $unit'},
          {'label': 'Phân loại quả', 'val': 'Loại 1 (Xuất sắc)'},
          {'label': 'Độ mọng nước', 'val': '92%'},
        ],
      );
    }

    // Nhóm 4: Rau ăn lá ngắn ngày (Mặc định)
    return CropProfile(
      type: CropType.leafyGreen,
      groupName: 'Rau ăn lá ngắn ngày dinh dưỡng cao',
      cycleDays: 35,
      seedStageName: 'Ươm mầm hạt giống hữu cơ trên luống xốp',
      careStageName: 'Phun sương vi sinh & Phòng trừ sinh học',
      seedDesc: (farm) => 'Tuyển chọn hạt giống rau lá chuẩn hữu cơ không biến đổi gen (Non-GMO). Gieo cấy trên luống đất hữu cơ tơi xốp giàu trùn quế tại ${farm.farmName}.',
      careDesc: (farm) => 'Hệ thống phun sương tự động điều hòa ẩm độ mát lành. Tuyệt đối không phân bón hóa học, cách ly chế phẩm vi sinh 10 ngày trước thu hoạch nhằm đảm bảo hàm lượng nitrat cực thấp.',
      harvestDesc: (qty, unit) => 'Thu hoạch từ 5:00 đến 6:30 sáng khi sương đêm còn đọng trên búp lá để giữ nguyên vẹn độ giòn sần sật và vitamin C. Đợt hái đạt sản lượng $qty $unit.',
      coldChainTemp: '4°C – 6°C (Chống héo úa & mất nước)',
      storageDays: 7,
      seedIot: [
        {'label': 'Nhiệt độ gieo hạt', 'val': '21.0°C'},
        {'label': 'Độ ẩm đất luống', 'val': '80%'},
        {'label': 'Độ pH đất', 'val': '6.5 (Chuẩn vi sinh)'},
      ],
      careIot: [
        {'label': 'Tần suất tưới sương', 'val': '3 lần/ngày'},
        {'label': 'Thời gian cách ly', 'val': '> 10 ngày (Đạt)'},
        {'label': 'Bẫy côn trùng', 'val': 'Bẫy dính sinh học'},
      ],
      harvestIot: (qty, unit) => [
        {'label': 'Sản lượng đợt hái', 'val': '$qty $unit'},
        {'label': 'Độ tươi giòn', 'val': '100% (Thu sương sớm)'},
        {'label': 'Chỉ số lá xanh SPAD', 'val': '42.8 (Xanh mướt)'},
      ],
    );
  }

  static FarmProfile getFarmProfile(String productName, String originalFarmName) {
    final pName = productName.toLowerCase();

    if (pName.contains('miền tây') || pName.contains('tiền giang') || pName.contains('đồng tháp')) {
      return FarmProfile(
        farmName: 'HTX Nông Nghiệp & Cây Ăn Trái Phù Sa Sông Tiền',
        supplierName: 'Hợp Tác Xã Rau Sạch & Nông Sản Miền Tây',
        location: 'Cù lao Mỹ Hội, Huyện Cao Lãnh, Tỉnh Đồng Tháp / Cái Bè, Tiền Giang',
        altitude: 'Bãi bồi phù sa ngọt trù phú ven sông Tiền',
        soilFeature: 'đất phù sa bồi đắp màu mỡ giàu đạm thực vật tự nhiên và khoáng chất phù sa',
        standard: 'VietGAP Hữu Cơ Sinh Thái (Mã: GAP-MT-4402)',
        inspectorSeed: 'KS. Trần Văn Hữu (Kỹ sư giống sông Tiền)',
        inspectorCare: 'KTV. Lê Thị Kim Cương (Bảo vệ thực vật sinh học)',
        inspectorHarvest: 'Tổ trưởng thu hoạch: Nguyễn Văn Ba (Đội 2 Cái Bè)',
      );
    }

    if (pName.contains('đồng nai') || pName.contains('bến tre') || pName.contains('bình phước') || pName.contains('vũng tàu')) {
      return FarmProfile(
        farmName: 'Trang Trại Cây Ăn Trái Xuất Khẩu Nam Bộ Farm',
        supplierName: 'Hợp Tác Xã Trái Cây & Nông Sản Việt',
        location: 'Huyện Thống Nhất, Tỉnh Đồng Nai / Châu Thành, Tỉnh Bến Tre',
        altitude: 'Vùng đồi bãi màu mỡ Đông Nam Bộ & Duyên hải phù sa',
        soilFeature: 'đất thịt pha cát màu mỡ thoát nước tốt, tối ưu cho tích tụ đường tự nhiên',
        standard: 'GlobalGAP & VietGAP Xuất Khẩu (Mã: GAP-NB-7821)',
        inspectorSeed: 'ThS. Đặng Thu Thảo (Chuyên gia Cây ăn trái)',
        inspectorCare: 'KS. Phan Minh Trí (Kỹ sư nông học GlobalGAP)',
        inspectorHarvest: 'Trưởng trạm thu hái: Trần Quốc Tuấn',
      );
    }

    if (pName.contains('mộc châu') || pName.contains('sơn la') || pName.contains('bắc hà') || pName.contains('lục ngạn') || pName.contains('chi lăng')) {
      return FarmProfile(
        farmName: 'Hợp Tác Xã Nông Sản Vùng Cao Mộc Châu',
        supplierName: 'Hợp Tác Xã Nông Nghiệp Tây Bắc',
        location: 'Cao nguyên Mộc Châu, Huyện Mộc Châu, Tỉnh Sơn La',
        altitude: 'Cao độ 1.050m - Khí hậu mát lạnh quanh năm sương mù',
        soilFeature: 'đất mùn vùng cao tơi xốp, giàu vi lượng tự nhiên',
        standard: 'VietGAP Vùng Cao (Mã: GAP-MC-8821)',
        inspectorSeed: 'KS. Hoàng A Súa (Kỹ sư giống bản địa Tây Bắc)',
        inspectorCare: 'KS. Đỗ Thúy Hằng (Kỹ sư sinh thái ôn đới)',
        inspectorHarvest: 'Tổ trưởng hái: Vàng A Páo',
      );
    }

    if (pName.contains('đắk lắk') || pName.contains('ban mê') || pName.contains('tây nguyên')) {
      return FarmProfile(
        farmName: 'Trang Trại Hữu Cơ Đất Đỏ Cao Nguyên Ban Mê',
        supplierName: 'Hợp Tác Xã Nông Sản Cao Nguyên',
        location: 'Thị xã Buôn Hồ, Tỉnh Đắk Lắk',
        altitude: 'Cao độ 550m - Đất đỏ bazan trù phú Tây Nguyên',
        soilFeature: 'đất đỏ bazan tầng dày giàu khoáng oxit sắt nhôm màu mỡ',
        standard: 'USDA Organic & VietGAP (Mã: GAP-DLK-7714)',
        inspectorSeed: 'KS. Y Blô Mlô (Kỹ sư Thổ nhưỡng Tây Nguyên)',
        inspectorCare: 'KS. Nguyễn Thị Lan (Phụ trách tưới nhỏ giọt Israel)',
        inspectorHarvest: 'Tổ trưởng hái: Y Krang Byă',
      );
    }

    // Mặc định: Nông trại Công nghệ cao Đà Lạt / Lâm Đồng
    return FarmProfile(
      farmName: originalFarmName.isNotEmpty ? originalFarmName : 'HTX Nông Nghiệp Công Nghệ Cao LÀNH Đà Lạt',
      supplierName: 'Hợp Tác Xã Nông Sản Đà Lạt',
      location: 'Thôn Đa Quý, Xã Xuân Thọ, TP. Đà Lạt, Tỉnh Lâm Đồng',
      altitude: 'Cao độ 1.500m - Khí hậu ôn đới quanh năm mát lành',
      soilFeature: 'đất đỏ đồi núi cao kết hợp giá thể xơ dừa vi sinh đã khử độc nhiệt',
      standard: 'VietGAP Công Nghệ Cao & GlobalGAP (Mã: GAP-LD-1102)',
      inspectorSeed: 'ThS. Nguyễn Hoàng Nam (Chuyên gia Nông học Đà Lạt)',
      inspectorCare: 'KS. Trần Thị Mai (Kỹ sư vi sinh nhà kính)',
      inspectorHarvest: 'Đội trưởng thu hái: Lê Văn Nam (Đội 1 Đa Quý)',
    );
  }

  static List<Map<String, dynamic>> generateTimeline(String lotCode, String productName, String originalFarmName) {
    final crop = getCropProfile(productName);
    final farm = getFarmProfile(productName, originalFarmName);

    final hDate = DateTime.now().subtract(const Duration(days: 2));
    final harvestStr = '${hDate.day.toString().padLeft(2, '0')}/${hDate.month.toString().padLeft(2, '0')}/${hDate.year} (05:30 AM)';

    final sowDate = hDate.subtract(Duration(days: crop.cycleDays));
    final sowStr = '${sowDate.day.toString().padLeft(2, '0')}/${sowDate.month.toString().padLeft(2, '0')}/${sowDate.year}';

    final careStart = sowDate.add(const Duration(days: 4));
    final careEnd = hDate.subtract(const Duration(days: 2));
    final careStr = '${careStart.day.toString().padLeft(2, '0')}/${careStart.month.toString().padLeft(2, '0')} – ${careEnd.day.toString().padLeft(2, '0')}/${careEnd.month.toString().padLeft(2, '0')}/${careEnd.year}';

    final expDate = hDate.add(Duration(days: crop.storageDays));
    final expStr = '${expDate.day.toString().padLeft(2, '0')}/${expDate.month.toString().padLeft(2, '0')}/${expDate.year}';

    final recDate = DateTime.now().subtract(const Duration(hours: 12));
    final recStr = '${recDate.day.toString().padLeft(2, '0')}/${recDate.month.toString().padLeft(2, '0')}/${recDate.year} (14:00 PM)';

    final qty = '120'; // Mặc định
    final unit = 'kg'; // Mặc định

    return [
      {
        'stage': 'Chặng 1: ${crop.seedStageName}',
        'date': sowStr,
        'icon': Icons.landscape_outlined,
        'engineer': farm.inspectorSeed,
        'details': crop.seedDesc(farm),
        'status': 'Đạt chuẩn ${farm.standard.split(" ")[0]}',
        'recordNo': 'HỒ SƠ GIỐNG: #SEED-$lotCode',
        'image': 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 2: ${crop.careStageName}',
        'date': careStr,
        'icon': Icons.grass_outlined,
        'engineer': farm.inspectorCare,
        'details': crop.careDesc(farm),
        'status': 'Tươi xanh, phát triển tối ưu',
        'recordNo': 'NHẬT KÝ CANH TÁC: #LOG-$lotCode',
        'image': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 3: Thu hoạch sương sớm & Phân loại',
        'date': harvestStr,
        'icon': Icons.inventory_2_outlined,
        'engineer': farm.inspectorHarvest,
        'details': crop.harvestDesc(qty, unit),
        'status': 'Đóng gói chuỗi lạnh ${crop.coldChainTemp}',
        'recordNo': 'BIÊN BẢN THU HOẠCH: #HRV-$lotCode',
        'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 4: Kiểm nghiệm Lab QC ISO/IEC 17025',
        'date': '${hDate.day.toString().padLeft(2, '0')}/${hDate.month.toString().padLeft(2, '0')}/${hDate.year} (08:30 AM)',
        'icon': Icons.science_outlined,
        'engineer': 'Phòng Phân Tích & Kiểm Định Nông Sản',
        'details': 'Lấy mẫu ngẫu nhiên từ lô hàng kiểm tra dư lượng hoạt chất bảo vệ thực vật, kim loại nặng và vi sinh. Tất cả chỉ số đạt chuẩn ${farm.standard}.',
        'status': 'Dư lượng = 0 ppm (Tuyệt đối an toàn)',
        'recordNo': 'PHIẾU KIỂM ĐỊNH: #QC-$lotCode',
        'image': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 5: Vận chuyển chuỗi lạnh FreshLock',
        'date': '${hDate.day.toString().padLeft(2, '0')}/${hDate.month.toString().padLeft(2, '0')}/${hDate.year} (10:30 AM)',
        'icon': Icons.local_shipping_outlined,
        'engineer': 'Tài xế vận hành: Phạm Quốc Hưng',
        'details': 'Nông sản được đóng gói bảo quản và vận chuyển bằng xe lạnh chuyên dụng ở nhiệt độ ${crop.coldChainTemp}. Cảm biến IoT truyền dữ liệu GPS Live về máy chủ.',
        'status': 'Nhiệt độ thùng xe: ${crop.coldChainTemp.split(" ")[0]}',
        'recordNo': 'VẬN ĐƠN XE LẠNH: #SHIP-$lotCode',
        'image': 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=500&auto=format&fit=crop&q=80',
      },
      {
        'stage': 'Chặng 6: Nhập tổng kho & Đến bàn ăn',
        'date': recStr,
        'icon': Icons.check_circle_outline,
        'engineer': 'Bộ phận điều phối LÀNH',
        'details': 'Hàng về kho trung tâm được xuất kho theo nguyên tắc FEFO. Giao hỏa tốc 2 giờ, khuyên dùng trước ngày $expStr.',
        'status': 'Hạn dùng: $expStr',
        'recordNo': 'MÃ QR TRÊN BAO BÌ: $lotCode',
        'image': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      },
    ];
  }
}
