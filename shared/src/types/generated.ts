/**
 * TU DONG SINH TU BACKEND OPENAPI SCHEMA - KHONG CHINH SUA BANG TAY
 * Generated at: 2026-09-12T19:14:04.387Z
 */

export interface Address {
  addressId?: number;
  userId?: number;
  receiverName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  addressType?: string;
}

export interface Category {
  categoryId?: number;
  categoryName?: string;
  parentCategoryId?: number;
  status?: string;
}

export interface CreateReviewRequest {
  productId?: number;
  customerId?: number;
  customerName?: string;
  email?: string;
  orderId?: number;
  rating?: number;
  comment?: string;
  imageUrls?: string[];
}

export interface ForgotPasswordRequest {
  email?: string;
}

export interface HelpfulVoteRequest {
  userId?: number;
}

export interface LoginDto {
  username?: string;
  password?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface Order {
  orderId?: number;
  customerId?: number;
  orderCode?: string;
  addressId?: number;
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: User;
  address?: Address;
  orderItems?: OrderItem[];
}

export interface OrderCreateDto {
  customerId?: number;
  subtotal?: number;
  discountAmount?: number;
  shippingFee?: number;
  paymentMethod?: string;
  orderItems?: OrderItemDto[];
  addressId?: number;
  receiverName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  addressType?: string;
  setAsDefault?: boolean;
}

export interface OrderItem {
  orderItemId?: number;
  orderId?: number;
  productId?: number;
  batchId?: number;
  quantity?: number;
  unitPrice?: number;
  discountAmount?: number;
  totalAmount?: number;
  product?: Product;
  batch?: ProductBatch;
}

export interface OrderItemDto {
  productId?: number;
  quantity?: number;
  unitPrice?: number;
  discountAmount?: number;
}

export interface Product {
  productId?: number;
  supplierId?: number;
  categoryId?: number;
  productName?: string;
  description?: string;
  price?: number;
  unit?: string;
  status?: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  productImages?: ProductImage[];
  averageRating?: number;
  reviewsCount?: number;
}

export interface ProductBatch {
  batchId?: number;
  productId?: number;
  farmId?: number;
  batchCode?: string;
  harvestDate?: string;
  receivedDate?: string;
  expiryDate?: string;
  initialQuantity?: number;
  unit?: string;
  status?: string;
  createdAt?: string;
  product?: Product;
}

export interface ProductImage {
  productImageId?: number;
  productId?: number;
  imageUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface RedeemRequest {
  userId?: number;
  pointsRequired?: number;
  rewardTitle?: string;
  isVoucher?: boolean;
  voucherType?: string;
  discountValue?: number;
  minOrderAmount?: number;
}

export interface RegisterDto {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface RegisterRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
  verifyMethod?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  otp?: string;
  newPassword?: string;
}

export interface SendOtpRequest {
  recipient?: string;
  type?: string;
}

export interface SyncProductImagesDto {
  imageUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface TrackBehaviorDto {
  userId?: number;
  sessionId?: string;
  productId?: number;
  actionType?: string;
  searchKeyword?: string;
  recommendationType?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  imageUrls?: string[];
}

export interface User {
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  roleId?: number;
  status?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

