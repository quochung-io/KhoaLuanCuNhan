// Danh sách chuẩn 63 Tỉnh/Thành phố Việt Nam dự phòng (Fallback)
// Đảm bảo hệ thống không bị crash khi API bên ngoài gặp sự cố hoặc timeout
export interface ProvinceItem {
  code: number;
  name: string;
}

export interface DistrictItem {
  code: number;
  name: string;
  province_code?: number;
}

export interface WardItem {
  code: number;
  name: string;
  district_code?: number;
}

export const VIETNAM_PROVINCES: ProvinceItem[] = [
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 87, name: 'Tỉnh Đồng Tháp' },
  { code: 75, name: 'Tỉnh Đồng Nai' },
  { code: 74, name: 'Tỉnh Bình Dương' },
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
  { code: 66, name: 'Tỉnh Đắk Lắk' },
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
  { code: 46, name: 'Thành phố Huế' },
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

// Helper gọi fetch có timeout tự ngắt kết nối an toàn
export async function fetchWithTimeout(url: string, timeoutMs: number = 3000): Promise<Response> {
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
