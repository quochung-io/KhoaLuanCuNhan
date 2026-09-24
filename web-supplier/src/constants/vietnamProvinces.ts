// Danh mục Tỉnh / Thành phố và Quận / Huyện Việt Nam
// Hỗ trợ đồng bộ Province Open API (https://provinces.open-api.vn/)
// Kèm cơ chế Fallback đầy đủ 63 Tỉnh Thành phòng trường hợp mạng chập chờn

export interface ProvinceItem {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
}

export interface DistrictItem {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  province_code?: number;
}

// Danh sách chuẩn 63 Tỉnh/Thành phố dự phòng (mã theo Tổng cục Thống kê)
export const FALLBACK_PROVINCES: ProvinceItem[] = [
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 66, name: 'Tỉnh Đắk Lắk' },
  { code: 75, name: 'Tỉnh Đồng Nai' },
  { code: 74, name: 'Tỉnh Bình Dương' },
  { code: 87, name: 'Tỉnh Đồng Tháp' },
  { code: 46, name: 'Thành phố Huế' },
  { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { code: 80, name: 'Tỉnh Long An' },
  { code: 82, name: 'Tỉnh Tiền Giang' },
  { code: 83, name: 'Tỉnh Bến Tre' },
  { code: 84, name: 'Tỉnh Trà Vinh' },
  { code: 86, name: 'Tỉnh Vĩnh Long' },
  { code: 89, name: 'Tỉnh An Giang' },
  { code: 91, name: 'Tỉnh Kiên Giang' },
  { code: 93, name: 'Tỉnh Hậu Giang' },
  { code: 94, name: 'Tỉnh Sóc Trăng' },
  { code: 95, name: 'Tỉnh Bạc Liêu' },
  { code: 96, name: 'Tỉnh Cà Mau' },
  { code: 67, name: 'Tỉnh Đắk Nông' },
  { code: 64, name: 'Tỉnh Gia Lai' },
  { code: 62, name: 'Tỉnh Kon Tum' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 58, name: 'Tỉnh Ninh Thuận' },
  { code: 60, name: 'Tỉnh Bình Thuận' },
  { code: 52, name: 'Tỉnh Bình Định' },
  { code: 54, name: 'Tỉnh Phú Yên' },
  { code: 49, name: 'Tỉnh Quảng Nam' },
  { code: 51, name: 'Tỉnh Quảng Ngãi' },
  { code: 45, name: 'Tỉnh Quảng Trị' },
  { code: 44, name: 'Tỉnh Quảng Bình' },
  { code: 42, name: 'Tỉnh Hà Tĩnh' },
  { code: 40, name: 'Tỉnh Nghệ An' },
  { code: 38, name: 'Tỉnh Thanh Hóa' },
  { code: 37, name: 'Tỉnh Ninh Bình' },
  { code: 36, name: 'Tỉnh Nam Định' },
  { code: 35, name: 'Tỉnh Hà Nam' },
  { code: 34, name: 'Tỉnh Thái Bình' },
  { code: 33, name: 'Tỉnh Hưng Yên' },
  { code: 30, name: 'Tỉnh Hải Dương' },
  { code: 27, name: 'Tỉnh Bắc Ninh' },
  { code: 26, name: 'Tỉnh Vĩnh Phúc' },
  { code: 25, name: 'Tỉnh Phú Thọ' },
  { code: 24, name: 'Tỉnh Bắc Giang' },
  { code: 22, name: 'Tỉnh Quảng Ninh' },
  { code: 20, name: 'Tỉnh Lạng Sơn' },
  { code: 19, name: 'Tỉnh Thái Nguyên' },
  { code: 17, name: 'Tỉnh Hoà Bình' },
  { code: 15, name: 'Tỉnh Yên Bái' },
  { code: 14, name: 'Tỉnh Sơn La' },
  { code: 12, name: 'Tỉnh Lai Châu' },
  { code: 11, name: 'Tỉnh Điện Biên' },
  { code: 10, name: 'Tỉnh Lào Cai' },
  { code: 8, name: 'Tỉnh Tuyên Quang' },
  { code: 6, name: 'Tỉnh Bắc Kạn' },
  { code: 4, name: 'Tỉnh Cao Bằng' },
  { code: 2, name: 'Tỉnh Hà Giang' },
  { code: 70, name: 'Tỉnh Bình Phước' },
  { code: 72, name: 'Tỉnh Tây Ninh' }
];

// Fallback danh sách quận huyện cho tỉnh nông sản trọng điểm
export const FALLBACK_DISTRICTS: Record<number, DistrictItem[]> = {
  // Lâm Đồng (code 68)
  68: [
    { code: 672, name: 'Thành phố Đà Lạt', province_code: 68 },
    { code: 673, name: 'Thành phố Bảo Lộc', province_code: 68 },
    { code: 674, name: 'Huyện Đam Rông', province_code: 68 },
    { code: 675, name: 'Huyện Lạc Dương', province_code: 68 },
    { code: 676, name: 'Huyện Lâm Hà', province_code: 68 },
    { code: 677, name: 'Huyện Đơn Dương', province_code: 68 },
    { code: 678, name: 'Huyện Đức Trọng', province_code: 68 },
    { code: 679, name: 'Huyện Di Linh', province_code: 68 },
    { code: 680, name: 'Huyện Bảo Lâm', province_code: 68 },
    { code: 681, name: 'Huyện Đạ Huoai', province_code: 68 },
    { code: 682, name: 'Huyện Đạ Tẻh', province_code: 68 },
    { code: 683, name: 'Huyện Cát Tiên', province_code: 68 }
  ],
  // TP Hồ Chí Minh (code 79)
  79: [
    { code: 760, name: 'Quận 1', province_code: 79 },
    { code: 761, name: 'Quận 12', province_code: 79 },
    { code: 764, name: 'Quận Gò Vấp', province_code: 79 },
    { code: 765, name: 'Quận Bình Thạnh', province_code: 79 },
    { code: 766, name: 'Quận Tân Bình', province_code: 79 },
    { code: 767, name: 'Quận Tân Phú', province_code: 79 },
    { code: 768, name: 'Quận Phú Nhuận', province_code: 79 },
    { code: 769, name: 'Thành phố Thủ Đức', province_code: 79 },
    { code: 770, name: 'Quận 3', province_code: 79 },
    { code: 771, name: 'Quận 10', province_code: 79 },
    { code: 772, name: 'Quận 11', province_code: 79 },
    { code: 773, name: 'Quận 4', province_code: 79 },
    { code: 774, name: 'Quận 5', province_code: 79 },
    { code: 775, name: 'Quận 6', province_code: 79 },
    { code: 776, name: 'Quận 8', province_code: 79 },
    { code: 777, name: 'Quận Bình Tân', province_code: 79 },
    { code: 778, name: 'Quận 7', province_code: 79 },
    { code: 783, name: 'Huyện Củ Chi', province_code: 79 },
    { code: 784, name: 'Huyện Hóc Môn', province_code: 79 },
    { code: 785, name: 'Huyện Bình Chánh', province_code: 79 },
    { code: 786, name: 'Huyện Nhà Bè', province_code: 79 },
    { code: 787, name: 'Huyện Cần Giờ', province_code: 79 }
  ],
  // Hà Nội (code 1)
  1: [
    { code: 1, name: 'Quận Ba Đình', province_code: 1 },
    { code: 2, name: 'Quận Hoàn Kiếm', province_code: 1 },
    { code: 3, name: 'Quận Tây Hồ', province_code: 1 },
    { code: 4, name: 'Quận Long Biên', province_code: 1 },
    { code: 5, name: 'Quận Cầu Giấy', province_code: 1 },
    { code: 6, name: 'Quận Đống Đa', province_code: 1 },
    { code: 7, name: 'Quận Hai Bà Trưng', province_code: 1 },
    { code: 8, name: 'Quận Hoàng Mai', province_code: 1 },
    { code: 9, name: 'Quận Thanh Xuân', province_code: 1 },
    { code: 16, name: 'Huyện Sóc Sơn', province_code: 1 },
    { code: 17, name: 'Huyện Đông Anh', province_code: 1 },
    { code: 18, name: 'Huyện Gia Lâm', province_code: 1 },
    { code: 19, name: 'Quận Nam Từ Liêm', province_code: 1 },
    { code: 20, name: 'Huyện Thanh Trì', province_code: 1 },
    { code: 21, name: 'Quận Bắc Từ Liêm', province_code: 1 },
    { code: 250, name: 'Huyện Mê Linh', province_code: 1 },
    { code: 268, name: 'Quận Hà Đông', province_code: 1 },
    { code: 269, name: 'Thị xã Sơn Tây', province_code: 1 }
  ],
  // Đắk Lắk (code 66)
  66: [
    { code: 643, name: 'Thành phố Buôn Ma Thuột', province_code: 66 },
    { code: 644, name: 'Thị Xã Buôn Hồ', province_code: 66 },
    { code: 645, name: 'Huyện Ea H\'leo', province_code: 66 },
    { code: 646, name: 'Huyện Ea Súp', province_code: 66 },
    { code: 647, name: 'Huyện Buôn Đôn', province_code: 66 },
    { code: 648, name: 'Huyện Cư M\'gar', province_code: 66 },
    { code: 649, name: 'Huyện Krông Búk', province_code: 66 },
    { code: 650, name: 'Huyện Krông Năng', province_code: 66 },
    { code: 651, name: 'Huyện Ea Kar', province_code: 66 },
    { code: 652, name: 'Huyện M\'Đrắk', province_code: 66 },
    { code: 653, name: 'Huyện Krông Bông', province_code: 66 },
    { code: 654, name: 'Huyện Krông Pắc', province_code: 66 },
    { code: 655, name: 'Huyện Krông A Na', province_code: 66 },
    { code: 656, name: 'Huyện Lắk', province_code: 66 },
    { code: 657, name: 'Huyện Cư Kuin', province_code: 66 }
  ],
  // Đồng Nai (code 75)
  75: [
    { code: 731, name: 'Thành phố Biên Hòa', province_code: 75 },
    { code: 732, name: 'Thành phố Long Khánh', province_code: 75 },
    { code: 734, name: 'Huyện Tân Phú', province_code: 75 },
    { code: 735, name: 'Huyện Vĩnh Cửu', province_code: 75 },
    { code: 736, name: 'Huyện Định Quán', province_code: 75 },
    { code: 737, name: 'Huyện Trảng Bom', province_code: 75 },
    { code: 738, name: 'Huyện Thống Nhất', province_code: 75 },
    { code: 739, name: 'Huyện Cẩm Mỹ', province_code: 75 },
    { code: 740, name: 'Huyện Long Thành', province_code: 75 },
    { code: 741, name: 'Huyện Xuân Lộc', province_code: 75 },
    { code: 742, name: 'Huyện Nhơn Trạch', province_code: 75 }
  ],
  // Đồng Tháp (code 87)
  87: [
    { code: 866, name: 'Thành phố Cao Lãnh', province_code: 87 },
    { code: 867, name: 'Thành phố Sa Đéc', province_code: 87 },
    { code: 868, name: 'Thành phố Hồng Ngự', province_code: 87 },
    { code: 869, name: 'Huyện Tân Hồng', province_code: 87 },
    { code: 870, name: 'Huyện Hồng Ngự', province_code: 87 },
    { code: 871, name: 'Huyện Tam Nông', province_code: 87 },
    { code: 872, name: 'Huyện Tháp Mười', province_code: 87 },
    { code: 873, name: 'Huyện Cao Lãnh', province_code: 87 },
    { code: 874, name: 'Huyện Thanh Bình', province_code: 87 },
    { code: 875, name: 'Huyện Lấp Vò', province_code: 87 },
    { code: 876, name: 'Huyện Lai Vung', province_code: 87 },
    { code: 877, name: 'Huyện Châu Thành', province_code: 87 }
  ]
};

// Danh sách các vùng nông sản trọng điểm để hiển thị tag chọn nhanh
export const QUICK_PROVINCE_TAGS = [
  { name: 'Lâm Đồng', fullName: 'Tỉnh Lâm Đồng' },
  { name: 'TP. Hồ Chí Minh', fullName: 'Thành phố Hồ Chí Minh' },
  { name: 'Hà Nội', fullName: 'Thành phố Hà Nội' },
  { name: 'Đắk Lắk', fullName: 'Tỉnh Đắk Lắk' },
  { name: 'Đồng Nai', fullName: 'Tỉnh Đồng Nai' },
  { name: 'Đồng Tháp', fullName: 'Tỉnh Đồng Tháp' },
  { name: 'Bình Dương', fullName: 'Tỉnh Bình Dương' },
  { name: 'Cần Thơ', fullName: 'Thành phố Cần Thơ' },
  { name: 'Hải Phòng', fullName: 'Thành phố Hải Phòng' },
  { name: 'Đà Nẵng', fullName: 'Thành phố Đà Nẵng' }
];

// Helper gọi fetch có timeout tự động ngắt nếu mạng quá chậm
export async function fetchWithTimeout(url: string, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm thông minh không phân biệt có dấu / không dấu
export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};
