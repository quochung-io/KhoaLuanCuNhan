export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPPLIER: 'Supplier',
  CUSTOMER: 'Customer',
} as const;
