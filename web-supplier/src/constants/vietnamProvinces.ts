// Danh sách đầy đủ 63 Tỉnh / Thành phố mới nhất của Việt Nam
// Hỗ trợ tìm kiếm không dấu, có dấu và gợi ý tự động cho người dùng

export const VIETNAM_PROVINCES = [
  'Lâm Đồng',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Thừa Thiên Huế',
  'Đắk Lắk',
  'Đồng Nai',
  'Bình Dương',
  'Đồng Tháp',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Nông',
  'Điện Biên',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái'
];

export const GROUPED_PROVINCES = [
  {
    label: '⭐ Thành phố Trực thuộc Trung ương',
    options: [
      { value: 'Hà Nội', label: 'Hà Nội (Thủ đô)' },
      { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh (Sài Gòn)' },
      { value: 'Đà Nẵng', label: 'Thành phố Đà Nẵng' },
      { value: 'Hải Phòng', label: 'Thành phố Hải Phòng' },
      { value: 'Cần Thơ', label: 'Thành phố Cần Thơ' },
      { value: 'Thừa Thiên Huế', label: 'Thừa Thiên Huế (TP. Huế)' }
    ]
  },
  {
    label: '🌲 Tây Nguyên & Vùng Nông sản Đặc sản',
    options: [
      { value: 'Lâm Đồng', label: 'Lâm Đồng (Đà Lạt)' },
      { value: 'Đắk Lắk', label: 'Đắk Lắk (Buôn Ma Thuột)' },
      { value: 'Đắk Nông', label: 'Đắk Nông (Gia Nghĩa)' },
      { value: 'Gia Lai', label: 'Gia Lai (Pleiku)' },
      { value: 'Kon Tum', label: 'Kon Tum' }
    ]
  },
  {
    label: '🌾 Đông Nam Bộ & Đồng Bằng Sông Cửu Long',
    options: [
      { value: 'Đồng Nai', label: 'Đồng Nai (Biên Hòa)' },
      { value: 'Bình Dương', label: 'Bình Dương (Thủ Dầu Một)' },
      { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
      { value: 'Tây Ninh', label: 'Tây Ninh' },
      { value: 'Bình Phước', label: 'Bình Phước' },
      { value: 'Long An', label: 'Long An' },
      { value: 'Tiền Giang', label: 'Tiền Giang (Mỹ Tho)' },
      { value: 'Bến Tre', label: 'Bến Tre' },
      { value: 'Đồng Tháp', label: 'Đồng Tháp (Cao Lãnh, Sa Đéc)' },
      { value: 'Vĩnh Long', label: 'Vĩnh Long' },
      { value: 'Trà Vinh', label: 'Trà Vinh' },
      { value: 'Hậu Giang', label: 'Hậu Giang' },
      { value: 'Sóc Trăng', label: 'Sóc Trăng' },
      { value: 'Bạc Liêu', label: 'Bạc Liêu' },
      { value: 'Cà Mau', label: 'Cà Mau' },
      { value: 'Kiên Giang', label: 'Kiên Giang (Rạch Giá, Phú Quốc)' },
      { value: 'An Giang', label: 'An Giang (Long Xuyên, Châu Đốc)' }
    ]
  },
  {
    label: '🌊 Duyên Hải Nam Trung Bộ',
    options: [
      { value: 'Khánh Hòa', label: 'Khánh Hòa (Nha Trang)' },
      { value: 'Ninh Thuận', label: 'Ninh Thuận (Phan Rang)' },
      { value: 'Bình Thuận', label: 'Bình Thuận (Phan Thiết)' },
      { value: 'Bình Định', label: 'Bình Định (Quy Nhơn)' },
      { value: 'Phú Yên', label: 'Phú Yên (Tuy Hòa)' },
      { value: 'Quảng Nam', label: 'Quảng Nam (Tam Kỳ, Hội An)' },
      { value: 'Quảng Ngãi', label: 'Quảng Ngãi' }
    ]
  },
  {
    label: '🏞️ Bắc Trung Bộ & Miền Bắc',
    options: [
      { value: 'Quảng Trị', label: 'Quảng Trị' },
      { value: 'Quảng Bình', label: 'Quảng Bình' },
      { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
      { value: 'Nghệ An', label: 'Nghệ An (Vinh)' },
      { value: 'Thanh Hóa', label: 'Thanh Hóa' },
      { value: 'Ninh Bình', label: 'Ninh Bình' },
      { value: 'Nam Định', label: 'Nam Định' },
      { value: 'Hà Nam', label: 'Hà Nam' },
      { value: 'Thái Bình', label: 'Thái Bình' },
      { value: 'Hưng Yên', label: 'Hưng Yên' },
      { value: 'Hải Dương', label: 'Hải Dương' },
      { value: 'Bắc Ninh', label: 'Bắc Ninh' },
      { value: 'Vĩnh Phúc', label: 'Vĩnh Phúc' },
      { value: 'Phú Thọ', label: 'Phú Thọ' },
      { value: 'Bắc Giang', label: 'Bắc Giang' },
      { value: 'Quảng Ninh', label: 'Quảng Ninh (Hạ Long)' },
      { value: 'Lạng Sơn', label: 'Lạng Sơn' },
      { value: 'Thái Nguyên', label: 'Thái Nguyên' },
      { value: 'Hòa Bình', label: 'Hòa Bình' },
      { value: 'Yên Bái', label: 'Yên Bái' },
      { value: 'Sơn La', label: 'Sơn La' },
      { value: 'Lai Châu', label: 'Lai Châu' },
      { value: 'Điện Biên', label: 'Điện Biên' },
      { value: 'Lào Cai', label: 'Lào Cai (Sa Pa)' },
      { value: 'Tuyên Quang', label: 'Tuyên Quang' },
      { value: 'Bắc Kạn', label: 'Bắc Kạn' },
      { value: 'Cao Bằng', label: 'Cao Bằng' },
      { value: 'Hà Giang', label: 'Hà Giang' }
    ]
  }
];

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm thông minh
export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};
