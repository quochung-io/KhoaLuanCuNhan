// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/constants/mockData.ts
// MÔ TẢ: Tệp cấu hình/dữ liệu (mockData.ts) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================
import { Product } from '../types/product';

export const productsData: Product[] = [];

export const subPlans: Record<string, {name: string; desc: string; price: string}[]> = {};

export const traceSteps: any[] = [];

export const reviews: any[] = [];

export const blogs = [
  {title:'5 cách bảo quản rau lá xanh tươi lâu hơn', desc:'Mẹo giữ rau tươi trong tủ lạnh đến 7 ngày mà không mất chất.'},
  {title:'Ăn theo mùa: vì sao nên chọn nông sản đúng vụ', desc:'Nông sản đúng vụ vừa ngon vừa tiết kiệm, lại giảm tác động môi trường.'},
  {title:'Đọc hiểu nhãn hữu cơ: VietGAP, GlobalGAP khác gì USDA?', desc:'Phân biệt các chứng nhận phổ biến để chọn đúng sản phẩm cần.'},
];
