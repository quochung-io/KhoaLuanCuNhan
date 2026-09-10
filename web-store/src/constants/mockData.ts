import { Product } from '../types/product';

export const productsData: Product[] = [
  {id:1, name:'Cải bó xôi hữu cơ', price:'28.000₫', unit:'/ 300g', cert:'VietGAP', region:'Đà Lạt', rating:4.8, reviews:212, icon:'leaf', lot:'LOT#VN-DL-0842'},
  {id:2, name:'Cà rốt baby Đà Lạt', price:'32.000₫', unit:'/ 500g', cert:'GlobalGAP', region:'Đà Lạt', rating:4.9, reviews:184, icon:'carrot', lot:'LOT#VN-DL-0917'},
  {id:3, name:'Cam Cao Phong', price:'45.000₫', unit:'/ kg', cert:'VietGAP', region:'Mộc Châu', rating:4.7, reviews:301, icon:'citrus', lot:'LOT#VN-MC-1140'},
  {id:4, name:'Trứng gà ta thả vườn', price:'52.000₫', unit:'/ hộp 10', cert:'USDA', region:'Đồng Tháp', rating:5.0, reviews:96, icon:'egg', lot:'LOT#VN-DT-0663'},
  {id:5, name:'Mật ong rừng nguyên chất', price:'135.000₫', unit:'/ 500ml', cert:'USDA', region:'Mộc Châu', rating:4.9, reviews:158, icon:'jar', lot:'LOT#VN-MC-0255'},
  {id:6, name:'Dâu tây Mộc Châu', price:'68.000₫', unit:'/ hộp 250g', cert:'GlobalGAP', region:'Mộc Châu', rating:4.8, reviews:243, icon:'berry', lot:'LOT#VN-MC-0389'},
  {id:7, name:'Xà lách xoăn thủy canh', price:'22.000₫', unit:'/ 250g', cert:'VietGAP', region:'Đà Lạt', rating:4.6, reviews:120, icon:'leaf', lot:'LOT#VN-DL-0721'},
  {id:8, name:'Bơ 034 Đắk Lắk', price:'58.000₫', unit:'/ kg', cert:'VietGAP', region:'Đồng Tháp', rating:4.8, reviews:167, icon:'citrus', lot:'LOT#VN-DT-0410'},
];

export const subPlans: Record<string, {name: string; desc: string; price: string}[]> = {
  week: [
    {name:'Combo Gia đình nhỏ', desc:'4 loại rau + 2 loại trái cây / tuần', price:'189.000₫'},
    {name:'Combo Gia đình lớn', desc:'7 loại rau + 3 loại trái cây / tuần', price:'329.000₫'},
    {name:'Combo Ăn chay', desc:'Rau củ quả đa dạng, không thịt trứng', price:'249.000₫'},
  ],
  month: [
    {name:'Combo Gia đình nhỏ', desc:'Giao 4 lần / tháng, tiết kiệm 10%', price:'680.000₫'},
    {name:'Combo Gia đình lớn', desc:'Giao 4 lần / tháng, tiết kiệm 12%', price:'1.180.000₫'},
    {name:'Combo Ăn chay', desc:'Giao 4 lần / tháng, tiết kiệm 10%', price:'895.000₫'},
  ]
};

export const traceSteps = [
  {icon:'sprout', title:'Gieo trồng', code:'#01', date:'12/06', detail:'Hạt giống bản địa được gieo tại nông trại đối tác, ghi nhận ngày & lô giống ngay từ đầu vào.', lot:'SEED-0842'},
  {icon:'leaf', title:'Chăm sóc', code:'#02', date:'15/06–20/07', detail:'Theo dõi tưới tiêu, không dùng thuốc bảo vệ thực vật hóa học trong suốt chu kỳ sinh trưởng.', lot:'CARE-0842-A'},
  {icon:'box', title:'Thu hoạch', code:'#03', date:'21/07', detail:'Thu hoạch trong ngày, phân loại tại vườn để đảm bảo độ tươi tối đa trước khi kiểm định.', lot:'HRV-0842-B'},
  {icon:'check', title:'Kiểm định', code:'#04', date:'21/07', detail:'Kiểm tra dư lượng và cấp chứng nhận VietGAP / GlobalGAP trước khi đóng gói.', lot:'QC-0842-C'},
  {icon:'truck', title:'Vận chuyển', code:'#05', date:'22/07', detail:'Đóng gói lạnh, vận chuyển trong vòng 2–6 giờ để giữ độ tươi khi đến tay khách hàng.', lot:'SHIP-0842-D'},
  {icon:'table', title:'Bàn ăn', code:'#06', date:'22/07', detail:'Sản phẩm đến tay bạn — quét mã QR bất cứ lúc nào để xem lại toàn bộ hành trình.', lot:'DLV-0842-E'},
];

export const reviews = [
  {name:'Thu Hà', role:'Nội trợ, TP.HCM', text:'Rau tươi hơn hẳn ngoài chợ, quét mã QR thấy rõ ngày thu hoạch nên rất yên tâm cho cả nhà.', rating:5},
  {name:'Minh Quân', role:'Đầu bếp nhà hàng', text:'Nguồn nguyên liệu ổn định, giao đúng giờ. Mình đặt combo tuần cho bếp luôn.', rating:5},
  {name:'Lan Anh', role:'Mẹ 2 con', text:'Thích nhất phần truy xuất nguồn gốc — dạy con về nông nghiệp sạch qua từng đơn hàng.', rating:4},
];

export const blogs = [
  {title:'5 cách bảo quản rau lá xanh tươi lâu hơn', desc:'Mẹo giữ rau tươi trong tủ lạnh đến 7 ngày mà không mất chất.'},
  {title:'Ăn theo mùa: vì sao nên chọn nông sản đúng vụ', desc:'Nông sản đúng vụ vừa ngon vừa tiết kiệm, lại giảm tác động môi trường.'},
  {title:'Đọc hiểu nhãn hữu cơ: VietGAP, GlobalGAP khác gì USDA?', desc:'Phân biệt các chứng nhận phổ biến để chọn đúng sản phẩm cần.'},
];
