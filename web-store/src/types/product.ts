// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/types/product.ts
// MÔ TẢ: Tệp cấu hình/dữ liệu (product.ts) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================
export type Product = {
  id: number;
  name: string;
  price: string;
  unit: string;
  cert: string;
  region: string;
  rating: number;
  reviews: number;
  icon: string;
  lot: string;
};

export type CartItem = {
  product: Product;
  qty: number;
};
