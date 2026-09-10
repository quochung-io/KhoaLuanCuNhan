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
