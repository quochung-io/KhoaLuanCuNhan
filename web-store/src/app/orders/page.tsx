'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  orderItemId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  product?: {
    productName: string;
    unit: string;
    productImages?: Array<{ imageUrl: string; isPrimary: boolean }>;
  };
}

interface Order {
  orderId: number;
  orderCode: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  address?: {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    addressType?: string;
  };
  orderItems: OrderItem[];
}

interface CartItem {
  product: {
    id: number;
    name: string;
    price: string;
    unit: string;
    icon: string;
    imageUrl?: string;
  };
  qty: number;
}

export default function CustomerOrdersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Theme, Lang, Points
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [userPoints, setUserPoints] = useState<number | null>(null);

  // Bộ lọc trạng thái & Tìm kiếm đơn hàng
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState<string>('');

  // Custom Modal Xác nhận Hủy đơn & Toast thông báo (Thay thế alert/confirm)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [payQrSecondsLeft, setPayQrSecondsLeft] = useState<number>(600);
  const [isPayQrExpired, setIsPayQrExpired] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Quy ước duy nhất 1 trạng thái đơn hàng xuyên suốt toàn hệ thống
  const getOrderUnifiedStatus = (order: Order) => {
    const oStatus = order.orderStatus?.toLowerCase() || '';
    const pStatus = order.paymentStatus?.toLowerCase() || '';
    const isOnline = order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO';

    if (oStatus === 'cancelled') {
      return {
        key: 'cancelled',
        label: 'Đã hủy',
        bgColor: '#FFEBEE',
        color: '#C62828'
      };
    }
    if (oStatus === 'delivered' || oStatus === 'completed') {
      return {
        key: 'completed',
        label: 'Hoàn tất',
        bgColor: '#E8F5E9',
        color: '#2E7D32'
      };
    }
    if (oStatus === 'shipping') {
      return {
        key: 'shipping',
        label: 'Đang giao hàng',
        bgColor: '#E3F2FD',
        color: '#0D47A1'
      };
    }
    // Trạng thái chờ xử lý (pending)
    if (isOnline && pStatus !== 'paid') {
      const minsLeft = getRemainingMinutes(order.createdAt);
      if (minsLeft <= 0) {
        return {
          key: 'cancelled',
          label: 'Đã hủy (Quá hạn)',
          bgColor: '#FFEBEE',
          color: '#C62828'
        };
      }
      return {
        key: 'unpaid',
        label: 'Chờ thanh toán',
        bgColor: '#FFF3E0',
        color: '#E65100'
      };
    }
    return {
      key: 'pending',
      label: 'Chờ xác nhận',
      bgColor: '#FEF9C3',
      color: '#854D0E'
    };
  };

  // In / Tải hóa đơn PDF chuẩn A4 (sử dụng hộp thoại in trình duyệt, cho phép Lưu thành PDF)
  const printOrderToPDF = (order: Order) => {
    const orderDate = parseServerDate(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('vi-VN') + ' ' + orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const unifiedStatus = getOrderUnifiedStatus(order);

    let payMethodText = 'Thanh toán khi nhận hàng (COD)';
    if (order.paymentMethod === 'MOMO') payMethodText = 'Ví điện tử MoMo';
    else if (order.paymentMethod === 'BANK') payMethodText = 'Chuyển khoản Ngân hàng (VietQR)';

    const fullAddress = [order.address?.addressDetail, order.address?.ward, order.address?.district, order.address?.province].filter(Boolean).join(', ');
    const discount = (order.subtotal || 0) + (order.shippingFee || 0) - (order.totalAmount || 0);

    const printContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hoa_Don_${order.orderCode} - LANH Farm</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      padding: 36px 40px;
      border-radius: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #15803d;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      color: #15803d;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 600;
      color: #4b5563;
      margin-top: 2px;
    }
    .company-info {
      font-size: 12px;
      color: #4b5563;
      line-height: 1.6;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 4px;
    }
    .order-meta {
      font-size: 12.5px;
      color: #4b5563;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 14px 16px;
    }
    .info-box-title {
      font-size: 12px;
      font-weight: 700;
      color: #15803d;
      text-transform: uppercase;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .table th {
      background-color: #f3f4f6;
      color: #374151;
      font-weight: 700;
      font-size: 12px;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #d1d5db;
    }
    .table td {
      padding: 11px 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    .summary-table {
      width: 340px;
      margin-left: auto;
      margin-bottom: 28px;
    }
    .summary-table td {
      padding: 6px 0;
      font-size: 13px;
    }
    .total-row {
      font-size: 16px;
      font-weight: 800;
      color: #15803d;
      border-top: 1px solid #d1d5db;
      padding-top: 8px !important;
    }
    .footer-note {
      text-align: center;
      border-top: 1px dashed #d1d5db;
      padding-top: 16px;
      color: #6b7280;
      font-size: 12px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      margin-bottom: 40px;
      padding: 0 40px;
      text-align: center;
    }
    .signatures .sign-box {
      font-size: 13px;
    }
    .signatures .sign-title {
      font-weight: 700;
      margin-bottom: 60px;
    }
    @media print {
      body {
        padding: 0;
        background: none;
      }
      .invoice-card {
        border: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 18px; display: flex; justify-content: flex-end; gap: 10px; max-width: 820px; margin-left: auto; margin-right: auto;">
    <button onclick="window.print()" style="padding: 10px 22px; background: #15803d; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; box-shadow: 0 2px 6px rgba(21,128,61,0.3);">
      In / Tải PDF (Ctrl + P)
    </button>
    <button onclick="window.close()" style="padding: 10px 18px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">
      Đóng
    </button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-name">LÀNH FARM</div>
        <div class="brand-sub">NÔNG SẢN SẠCH CHUẨN VIETGAP & HỮU CƠ</div>
        <div class="company-info" style="margin-top: 8px;">
          Hotline CSKH: 1900 8899 (7:00 - 21:00)<br>
          Email: nongsanlanh@lanhfarm.vn<br>
          Website: https://lanhfarm.vn
        </div>
      </div>
      <div class="invoice-title">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <div class="order-meta">Mã đơn: <strong>#${order.orderCode}</strong></div>
        <div class="order-meta">Ngày đặt: ${formattedDate}</div>
        <div class="order-meta" style="margin-top: 4px;">
          Trạng thái: <span style="font-weight: 700; color: ${unifiedStatus.color};">${unifiedStatus.label}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">Thông tin người nhận</div>
        <div><strong>${order.address?.receiverName || 'Khách hàng'}</strong></div>
        <div>Điện thoại: ${order.address?.phone || 'Chưa cập nhật'}</div>
        <div>Địa chỉ: ${fullAddress || 'Nhận tại cửa hàng'}</div>
        <div>Loại địa chỉ: ${order.address?.addressType || 'Nhà ở'}</div>
      </div>
      <div class="info-box">
        <div class="info-box-title">Thanh toán & Giao hàng</div>
        <div>Hình thức: <strong>${payMethodText}</strong></div>
        <div>Thời gian đặt: ${formattedDate}</div>
        <div>Đơn vị vận chuyển: Giao hàng nhanh LÀNH Express</div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">STT</th>
          <th>Tên sản phẩm</th>
          <th style="width: 80px; text-align: center;">Đơn vị</th>
          <th style="width: 70px; text-align: center;">SL</th>
          <th style="width: 120px; text-align: right;">Đơn giá</th>
          <th style="width: 130px; text-align: right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems.map((item, idx) => `
          <tr>
            <td style="text-align: center; color: #6b7280;">${idx + 1}</td>
            <td><strong>${item.product?.productName || 'Nông sản LÀNH'}</strong></td>
            <td style="text-align: center;">${item.product?.unit || 'kg'}</td>
            <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
            <td style="text-align: right;">${item.unitPrice.toLocaleString('vi-VN')} ₫</td>
            <td style="text-align: right; font-weight: 700;">${item.totalAmount.toLocaleString('vi-VN')} ₫</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="color: #6b7280;">Tạm tính tiền hàng:</td>
        <td style="text-align: right; font-weight: 600;">${(order.subtotal || 0).toLocaleString('vi-VN')} ₫</td>
      </tr>
      <tr>
        <td style="color: #6b7280;">Phí vận chuyển:</td>
        <td style="text-align: right; font-weight: 600;">${(order.shippingFee || 0).toLocaleString('vi-VN')} ₫</td>
      </tr>
      ${discount > 0 ? `
      <tr>
        <td style="color: #15803d; font-weight: 600;">Giảm giá Voucher:</td>
        <td style="text-align: right; font-weight: 600; color: #15803d;">-${discount.toLocaleString('vi-VN')} ₫</td>
      </tr>
      ` : ''}
      <tr>
        <td class="total-row">Tổng thanh toán:</td>
        <td class="total-row" style="text-align: right; font-size: 18px; color: #dc2626;">
          ${(order.totalAmount || 0).toLocaleString('vi-VN')} ₫
        </td>
      </tr>
    </table>

    <div class="signatures">
      <div class="sign-box">
        <div class="sign-title">Người mua hàng</div>
        <div>(Ký, ghi rõ họ tên)</div>
      </div>
      <div class="sign-box">
        <div class="sign-title">Đại diện LÀNH Farm</div>
        <div>(Ký và đóng dấu)</div>
      </div>
    </div>

    <div class="footer-note">
      Cảm ơn Quý khách đã tin tưởng và đồng hành cùng nông sản sạch LÀNH Farm!<br>
      Mọi thắc mắc và hỗ trợ đổi trả trong vòng 24h, xin liên hệ Hotline: <strong>1900 8899</strong>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      showToast('Đang mở cửa sổ in / lưu hóa đơn PDF');
    } else {
      showToast('Vui lòng cho phép mở popup trên trình duyệt để in hoặc tải hóa đơn PDF.', 'error');
    }
  };


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Giỏ hàng đồng bộ
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const router = useRouter();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const loadOrders = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5023/api/orders/customer/${userId}`);
      if (!res.ok) {
        throw new Error('Không thể tải lịch sử đơn hàng.');
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  // Helper parse thời gian chính xác từ API và tự động bù trừ múi giờ
  const parseServerDate = (dateStr?: string) => {
    if (!dateStr) return new Date();
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();

    // Kiểm tra độ lệch: nếu chênh khoảng 6-8 tiếng (do backend trả về UTC không kèm Z), tự động cộng bù 7 tiếng
    const diffHours = (Date.now() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours >= 6.5 && diffHours <= 7.5) {
      d = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    }
    return d;
  };

  const getRemainingMinutes = (createdAt?: string) => {
    if (!createdAt) return 30;
    const orderDate = parseServerDate(createdAt);
    const now = Date.now();
    const diffMins = Math.max(0, (now - orderDate.getTime()) / (1000 * 60));
    return Math.max(0, Math.ceil(30 - diffMins));
  };

  // Xử lý hủy đơn hàng (Cho phép trong vòng 30 phút kể từ lúc đặt)
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  useEffect(() => {
    if (!orderToPay) return;
    setPayQrSecondsLeft(600);
    setIsPayQrExpired(false);
    const expiry = Date.now() + 600 * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setPayQrSecondsLeft(remaining);
      if (remaining <= 0) {
        setIsPayQrExpired(true);
      }
    };

    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [orderToPay]);


  const onCancelClick = (order: Order) => {
    const minsLeft = getRemainingMinutes(order.createdAt);
    if (minsLeft <= 0) {
      showToast('Đã quá thời hạn 30 phút kể từ lúc đặt hàng. Vui lòng liên hệ Hotline 1900 8899 để được hỗ trợ!', 'error');
      return;
    }
    setOrderToCancel(order);
  };

  const confirmAndCancelOrder = async () => {
    if (!orderToCancel) return;
    const targetOrder = orderToCancel;
    setCancellingId(targetOrder.orderId);

    try {
      const res = await fetch(`http://localhost:5023/api/orders/${targetOrder.orderId}/cancel`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Không thể hủy đơn hàng.' }));
        throw new Error(errData.message || 'Lỗi khi hủy đơn hàng.');
      }

      showToast(`Đã hủy thành công đơn hàng #${targetOrder.orderCode}!`, 'success');
      setOrderToCancel(null);
      if (currentUser) {
        loadOrders(currentUser.userId);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi hủy đơn hàng. Vui lòng thử lại sau.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Mua lại các sản phẩm trong đơn hàng
  const handleReorder = (order: Order) => {
    if (!order.orderItems || order.orderItems.length === 0) return;
    
    let currentCart: CartItem[] = [];
    const stored = localStorage.getItem('cart');
    if (stored) {
      try { currentCart = JSON.parse(stored); } catch {}
    }

    order.orderItems.forEach(item => {
      const existing = currentCart.find(c => c.product.id === item.productId);
      if (existing) {
        existing.qty += item.quantity;
      } else {
        currentCart.push({
          product: {
            id: item.productId,
            name: item.product?.productName || 'Nông sản LÀNH',
            price: item.unitPrice.toLocaleString('vi-VN') + '₫',
            unit: ' / ' + (item.product?.unit || 'kg'),
            icon: 'leaf',
            imageUrl: item.product?.productImages && item.product.productImages.length > 0 ? item.product.productImages[0].imageUrl : undefined
          },
          qty: item.quantity
        });
      }
    });

    setCart([...currentCart]);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setIsDrawerOpen(true);
  };

  // Lọc đơn hàng theo Tab và Query tìm kiếm
  const filteredOrders = orders.filter(order => {
    const unified = getOrderUnifiedStatus(order);
    const matchesTab = orderFilterStatus === 'all' || unified.key === orderFilterStatus;
    
    if (!matchesTab) return false;
    if (!searchOrderQuery.trim()) return true;

    const q = searchOrderQuery.toLowerCase().trim();
    const matchesCode = order.orderCode?.toLowerCase().includes(q);
    const matchesProduct = order.orderItems?.some(i => i.product?.productName?.toLowerCase().includes(q));

    return matchesCode || matchesProduct;
  });

  useEffect(() => {
    // Load tài khoản
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
      
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    loadOrders(parsedUser.userId);

    // Fetch số điểm thực
    fetch(`http://localhost:5023/api/loyalty/${parsedUser.userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.currentPoints !== undefined) {
          setUserPoints(data.currentPoints);
        }
      })
      .catch(() => {});

    // Load giỏ hàng
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [router]);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    router.push('/');
  };

  const updateCartQty = (id: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeFromCart = (id: number) => {
    const updated = cart.filter(item => item.product.id !== id);
    setCart(updated);
    if (updated.length > 0) {
      localStorage.setItem('cart', JSON.stringify(updated));
    } else {
      localStorage.removeItem('cart');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const rawPrice = item.product.price.replace(/[^\d]/g, '');
      const unitPrice = parseInt(rawPrice, 10) || 0;
      return total + (unitPrice * item.qty);
    }, 0);
  };

  const totalCart = calculateSubtotal();

  const getStatusBadge = (order: Order) => {
    const status = getOrderUnifiedStatus(order);
    return (
      <span style={{
        padding: '5px 12px',
        borderRadius: '6px',
        fontSize: '11.5px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        backgroundColor: status.bgColor,
        color: status.color,
        display: 'inline-block',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {status.label}
      </span>
    );
  };

  const getProductImage = (item: OrderItem) => {
    if (item.product?.productImages && item.product.productImages.length > 0) {
      const primary = item.product.productImages.find(img => img.isPrimary);
      return primary ? primary.imageUrl : item.product.productImages[0].imageUrl;
    }
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80';
  };

  const toVND = (num: number) => num.toLocaleString('vi-VN') + ' ₫';

  return (
    <>
      {/* ── HEADER 3 TẦNG ĐỒNG BỘ CHUẨN TMĐT 100% ── */}
      {/* ── HEADER 3 TẦNG ĐỒNG BỘ CHUẨN TMĐT 100% ── */}
      <header>
        {/* ── TẦNG 1: TOP BAR TIỆN ÍCH ── */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP & Hữu cơ</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="topbar-link">Hotline: <strong>1900 8899</strong> (7:00 - 21:00)</span>
            </div>
            <div className="topbar-right">
              <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="topbar-link">
                Kênh Đối Tác / HTX
              </a>
              <span style={{ opacity: 0.4 }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="icon-btn" onClick={toggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                  {theme === "light" ? "Tối" : "Sáng"}
                </button>
                <div className="lang-switch">
                  <button className={lang === "vi" ? "active" : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang("vi")}>VI</button>
                  <button className={lang === "en" ? "active" : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang("en")}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 2: MAIN HEADER (LOGO, SEARCH, USER, CART) ── */}
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            <svg className="mark" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
              <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <div>
              <span style={{ letterSpacing: '1px' }}>LÀNH</span>
              <div style={{ fontSize: '10.5px', fontWeight: '500', color: 'var(--green-700)', marginTop: '-4px' }}>NÔNG SẢN TƯƠI SẠCH</div>
            </div>
          </Link>

          {/* Ô tìm kiếm chuyển về trang sản phẩm */}
          <div className="search-shell">
            <input 
              type="text" 
              placeholder="Bạn muốn tìm nông sản gì hôm nay? (Rau cải, bơ sáp, dâu tây...)" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  router.push(`/products?search=${encodeURIComponent(val)}`);
                }
              }}
            />
            <button className="go" onClick={() => router.push('/products')} aria-label="Tìm kiếm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span>Tìm</span>
            </button>
          </div>

          {/* Nhóm nút tác vụ Header */}
          <div className="header-actions">
            {/* Mục Tài khoản */}
            <div style={{ position: 'relative' }}>
              <button 
                className="header-action-item" 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                style={{ border: 'none', background: 'none' }}
              >
                <span className="header-action-icon">
                  {currentUser && currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt="Avatar" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }} 
                    />
                  ) : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}
                </span>
                <div className="header-action-text">
                  <span className="header-action-label">Xin chào,</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : "Tài khoản"}
                  </span>
                </div>
              </button>
              
              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  width: '200px',
                  padding: '6px 0',
                  textAlign: 'left'
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{currentUser?.fullName}</div>
                    <div style={{ marginTop: '2px' }}>{currentUser?.email}</div>
                  </div>
                  <Link 
                    href="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderBottom: '1px solid var(--line)'
                    }}
                  >
                    Hồ sơ & Sổ địa chỉ
                  </Link>
                  <Link 
                    href="/orders"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      textDecoration: 'none',
                      color: 'var(--green-700)',
                      fontSize: '13px',
                      fontWeight: '700',
                      borderBottom: '1px solid var(--line)',
                      backgroundColor: 'var(--green-100)'
                    }}
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <button 
                    onClick={handleCustomerLogout}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#e53e3e',
                      fontSize: '13px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Nút Giỏ Hàng nổi bật */}
            <div 
              className={`header-cart-btn ${cartBounce ? "bounce" : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
              onClick={() => setIsDrawerOpen(true)}
              title="Xem giỏ hàng"
            >
              <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <div className="header-action-text">
                <span className="header-action-label">Giỏ hàng</span>
                <span className="header-action-value" style={{ color: 'var(--green-900)' }}>
                  {toVND(totalCart)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 3: SUB-NAVBAR 4 MỤC ── */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">
                Trang chủ
              </Link>
              <Link href="/products" className="subnav-link">
                Tất cả nông sản
              </Link>
              <Link href="/combos" className="subnav-link">
                Combo định kỳ
              </Link>
              <Link href="/traceability" className="subnav-link">
                Truy xuất nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY NỘI DUNG CHÍNH (ĐỒNG BỘ NỀN VÀ PHONG CÁCH LÀNH FARM) ── */}
      <main style={{
        backgroundColor: 'var(--bg)',
        minHeight: '85vh',
        padding: '36px 20px 60px',
        color: 'var(--ink)'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          
          {/* Breadcrumb điều hướng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: 'var(--green-700)', fontWeight: '600' }}>Quản lý đơn hàng</span>
          </div>

          {/* Tiêu đề & Thanh công cụ */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--green-900)',
                fontWeight: '800',
                fontSize: '28px',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Đơn hàng của tôi
              </h1>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', margin: '6px 0 0 0' }}>
                Theo dõi quá trình vận chuyển, kiểm tra chứng nhận nông sản & hóa đơn giao dịch.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => currentUser && loadOrders(currentUser.userId)} 
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--line)', 
                  color: 'var(--ink)',
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow)'
                }}
              >
                Làm mới
              </button>
              <Link 
                href="/profile" 
                style={{ 
                  backgroundColor: 'var(--green-100)', 
                  border: '1px solid var(--green-500)', 
                  color: 'var(--green-900)',
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Sổ địa chỉ & Điểm thưởng
              </Link>
            </div>
          </div>

          {/* Thanh Tabs Lọc Trạng Thái Đơn Hàng */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface)',
            padding: '6px',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)',
            marginBottom: '20px',
            overflowX: 'auto'
          }}>
            {[
              { key: 'all', label: 'Tất cả đơn', count: orders.length },
              { key: 'unpaid', label: 'Chờ thanh toán', count: orders.filter(o => getOrderUnifiedStatus(o).key === 'unpaid').length },
              { key: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => getOrderUnifiedStatus(o).key === 'pending').length },
              { key: 'shipping', label: 'Đang giao hàng', count: orders.filter(o => getOrderUnifiedStatus(o).key === 'shipping').length },
              { key: 'completed', label: 'Hoàn tất', count: orders.filter(o => getOrderUnifiedStatus(o).key === 'completed').length },
              { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => getOrderUnifiedStatus(o).key === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setOrderFilterStatus(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  backgroundColor: orderFilterStatus === tab.key ? 'var(--green-700)' : 'transparent',
                  color: orderFilterStatus === tab.key ? '#ffffff' : 'var(--ink-soft)',
                  fontWeight: orderFilterStatus === tab.key ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    backgroundColor: orderFilterStatus === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--green-100)',
                    color: orderFilterStatus === tab.key ? '#ffffff' : 'var(--green-900)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Ô Tìm Kiếm Tra Cứu Đơn Hàng Nhanh */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            backgroundColor: 'var(--surface)',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              placeholder="Tra cứu nhanh theo Mã đơn hàng (VD: ORD...) hoặc tên sản phẩm..."
              value={searchOrderQuery}
              onChange={(e) => setSearchOrderQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '13.5px',
                color: 'var(--ink)'
              }}
            />
            {searchOrderQuery && (
              <button 
                onClick={() => setSearchOrderQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: '13px' }}
              >
                ✕ Xóa
              </button>
            )}
          </div>

          {error && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '14px 20px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', border: '1px solid #FFCDD2' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-soft)', fontSize: '15px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              Đang tải danh sách đơn hàng...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              padding: '70px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--surface)',
              border: '1.5px dashed var(--line)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow)'
            }}>
              
              <h3 style={{ fontSize: '18px', color: 'var(--ink)', margin: '0 0 8px 0', fontWeight: '700' }}>
                {searchOrderQuery ? `Không tìm thấy đơn hàng nào khớp với "${searchOrderQuery}"` : 'Chưa có đơn hàng nào trong mục này'}
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: '0 0 24px 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                {searchOrderQuery ? 'Bạn hãy kiểm tra lại mã đơn hàng hoặc tên sản phẩm tìm kiếm nhé.' : 'Hãy khám phá các loại rau củ quả hữu cơ, tươi sạch từ hợp tác xã và đặt hàng ngay nhé!'}
              </p>
              <Link href="/" style={{
                backgroundColor: 'var(--green-700)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(46,125,50,0.2)'
              }}>
                Mua sắm nông sản ngay
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredOrders.map(order => {
                const isDelivered = order.orderStatus?.toLowerCase() === 'delivered';
                const isShipping = order.orderStatus?.toLowerCase() === 'shipping';
                const isPending = order.orderStatus?.toLowerCase() === 'pending';
                const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';

                return (
                  <div key={order.orderId} style={{
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden',
                    transition: 'border-color .2s ease'
                  }}>
                    {/* Hàng 1: Header Thẻ Đơn Hàng */}
                    <div style={{
                      padding: '16px 20px',
                      backgroundColor: 'var(--bg)',
                      borderBottom: '1px solid var(--line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '14.5px',
                          fontWeight: '800',
                          color: 'var(--green-900)',
                          backgroundColor: 'var(--green-100)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          #{order.orderCode}
                        </span>
                        <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                          Đặt ngày: <strong>{parseServerDate(order.createdAt).toLocaleDateString('vi-VN')}</strong> lúc {parseServerDate(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getStatusBadge(order)}
                      </div>
                    </div>

                    {/* Hàng 2: Địa chỉ giao hàng & Tiến độ đơn */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                      {order.address && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                          fontSize: '13px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            
                            <div>
                              <div style={{ color: 'var(--ink)', fontWeight: '600' }}>
                                Người nhận: {order.address.receiverName} <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal' }}>({order.address.phone})</span>
                              </div>
                              <div style={{ color: 'var(--ink-soft)', marginTop: '2px', fontSize: '12.5px' }}>
                                {order.address.addressDetail}, {order.address.ward}, {order.address.district}, {order.address.province}
                              </div>
                            </div>
                          </div>

                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: order.address.addressType === 'Công ty' ? '#EBF8FF' : '#F0FFF4',
                            color: order.address.addressType === 'Công ty' ? '#2B6CB0' : '#276749',
                            border: `1px solid ${order.address.addressType === 'Công ty' ? '#BEE3F8' : '#C6F6D5'}`
                          }}>
                            {order.address.addressType === 'Công ty' ? 'Văn phòng / Công ty' : 'Địa chỉ Nhà ở'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hàng 3: Danh sách sản phẩm trong đơn */}
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {order.orderItems.map(item => (
                        <div key={item.orderItemId} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img 
                              src={getProductImage(item)} 
                              alt={item.product?.productName} 
                              style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '8px',
                                objectFit: 'cover',
                                border: '1px solid var(--line)'
                              }}
                            />
                            <div>
                              <strong style={{ color: 'var(--ink)', fontSize: '14px', display: 'block' }}>
                                {item.product?.productName || 'Nông sản LÀNH Farm'}
                              </strong>
                              <div style={{ color: 'var(--ink-soft)', fontSize: '12.5px', marginTop: '3px' }}>
                                Đơn giá: {toVND(item.unitPrice)} <span style={{ color: 'var(--ink-soft)' }}>/ {item.product?.unit || 'kg'}</span> • Số lượng: <strong style={{ color: 'var(--ink)' }}>{item.quantity}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '14.5px' }}>
                              {toVND(item.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hàng 4: Chi tiết thanh toán & Điểm thưởng tích lũy */}
                    <div style={{
                      backgroundColor: 'var(--bg)',
                      padding: '16px 20px',
                      borderTop: '1px solid var(--line)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                        <div style={{ color: 'var(--ink-soft)' }}>
                          Hình thức: <strong style={{ color: 'var(--ink)' }}>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'Chuyển khoản VietQR'}</strong>
                        </div>
                        <div style={{ color: 'var(--green-700)', fontSize: '12.5px', fontWeight: '600' }}>
                          ⭐ Điểm tích lũy từ đơn này: +{Math.round((order.totalAmount || 0) * 0.02 / 10).toLocaleString('vi-VN')} điểm
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>Tổng tiền thanh toán:</span>
                          <div style={{ color: '#e53e3e', fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '1px' }}>
                            {toVND(order.totalAmount)}
                          </div>
                        </div>

                        {/* Nút Hủy Đơn Hàng (Chỉ hiển thị khi đơn Chờ xác nhận và trong vòng 30 phút) */}
                        {(() => {
  if (order.orderStatus?.toLowerCase() !== 'pending') return null;
  const minsLeft = getRemainingMinutes(order.createdAt);
  const canCancel = minsLeft > 0;

  if (!canCancel) {
    return (
      <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)', fontStyle: 'italic', maxWidth: '140px', textAlign: 'right' }}>
        Quá 30 phút, không thể tự hủy
      </span>
    );
  }

  return (
    <button
      onClick={() => onCancelClick(order)}
      disabled={cancellingId === order.orderId}
      title={`Bạn có thể hủy đơn này trong vòng ${minsLeft} phút tới`}
      style={{
        padding: '9px 14px',
        borderRadius: '8px',
        border: '1px solid #FEB2B2',
        backgroundColor: '#FFF5F5',
        color: '#C53030',
        fontWeight: '700',
        fontSize: '12.5px',
        cursor: cancellingId === order.orderId ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all .2s'
      }}
    >
      {cancellingId === order.orderId ? 'Đang hủy...' : `Hủy đơn (${minsLeft}p)`}
    </button>
  );
})()}

                        {/* Nút Quét mã thanh toán lại (chỉ hiển thị khi còn trong hạn 30 phút) */}
                        {order.orderStatus?.toLowerCase() === 'pending' && order.paymentStatus?.toLowerCase() !== 'paid' && order.paymentMethod !== 'COD' && getRemainingMinutes(order.createdAt) > 0 && (
                          <button
                            onClick={() => setOrderToPay(order)}
                            style={{
                              padding: '9px 15px',
                              borderRadius: '8px',
                              border: '1px solid #3182CE',
                              backgroundColor: '#EBF8FF',
                              color: '#2B6CB0',
                              fontWeight: '700',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(49,130,206,0.15)',
                              transition: 'all .2s'
                            }}
                          >
                            Quét mã thanh toán lại
                          </button>
                        )}
                        {order.orderStatus?.toLowerCase() === 'pending' && order.paymentStatus?.toLowerCase() !== 'paid' && order.paymentMethod !== 'COD' && getRemainingMinutes(order.createdAt) <= 0 && (
                          <span style={{ fontSize: '11.5px', color: '#9CA3AF', fontStyle: 'italic', maxWidth: '140px', textAlign: 'right' }}>
                            Hết hạn thanh toán (Quá 30p)
                          </span>
                        )}

                        {/* Nút Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--line)',
                            backgroundColor: '#ffffff',
                            color: 'var(--ink)',
                            fontWeight: '600',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          Xem chi tiết
                        </button>

                        {/* Nút In hóa đơn PDF */}
                        <button
                          type="button"
                          onClick={() => printOrderToPDF(order)}
                          title="In hoặc lưu hóa đơn dưới dạng file PDF"
                          style={{
                            padding: '9px 13px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#15803d',
                            fontWeight: '600',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          In hóa đơn PDF
                        </button>

                        {/* Nút Mua Lại nhanh chóng */}
                        <button
                          onClick={() => handleReorder(order)}
                          style={{
                            padding: '9px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--green-700)',
                            backgroundColor: 'var(--green-700)',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(46,125,50,0.2)'
                          }}
                        >
                          Mua lại
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        
        </div>
      </main>

      {/* MODAL XÁC NHẬN HỦY ĐƠN HÀNG (Không còn alert / confirm trình duyệt) */}
      {orderToCancel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            textAlign: 'center',
            border: '1px solid var(--line)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px auto'
            }}>
              ⚠️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1F2937', margin: '0 0 10px 0' }}>
              Xác nhận hủy đơn hàng
            </h3>
            <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Bạn có chắc chắn muốn hủy đơn hàng <strong style={{ color: '#15803D' }}>#{orderToCancel.orderCode}</strong> không?<br />
              <span style={{ fontSize: '12.5px', color: '#6B7280' }}>Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận.</span>
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setOrderToCancel(null)}
                disabled={cancellingId === orderToCancel.orderId}
                style={{
                  flex: 1,
                  padding: '11px 18px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Giữ lại đơn
              </button>
              <button
                onClick={confirmAndCancelOrder}
                disabled={cancellingId === orderToCancel.orderId}
                style={{
                  flex: 1,
                  padding: '11px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: cancellingId === orderToCancel.orderId ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                {cancellingId === orderToCancel.orderId ? 'Đang hủy...' : 'Đồng ý hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* MODAL QUÉT MÃ THANH TOÁN LẠI (Dành cho khách hàng bị out ra hoặc chuyển tab) */}
      {orderToPay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px 22px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            position: 'relative',
            border: '1px solid var(--line)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: orderToPay.paymentMethod === 'MOMO' ? '#FFF0F6' : '#EBF8FF',
              color: orderToPay.paymentMethod === 'MOMO' ? '#A50064' : '#2B6CB0',
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              ""
            </div>

            <h3 style={{ fontSize: '18.5px', fontWeight: '800', color: '#1A202C', margin: '0 0 4px 0' }}>
              Thanh toán lại cho đơn #{orderToPay.orderCode}
            </h3>
            
            <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 12px 0' }}>
              Số tiền cần chuyển: <strong style={{ color: '#E53E3E', fontSize: '16px' }}>{toVND(orderToPay.totalAmount)}</strong>
            </p>

            {/* Đồng hồ hiệu lực QR 10 phút */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: isPayQrExpired ? '#FED7D7' : '#FEFCBF',
              color: isPayQrExpired ? '#C53030' : '#B7791F',
              fontWeight: '700',
              fontSize: '12px',
              marginBottom: '14px'
            }}>
              <span>{isPayQrExpired ? 'Mã QR đã hết hạn' : 'Thời gian quét mã:'}</span>
              {!isPayQrExpired && (
                <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {Math.floor(payQrSecondsLeft / 60).toString().padStart(2, '0')}:{(payQrSecondsLeft % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Khung ảnh QR VietQR hoặc MoMo */}
            <div style={{
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px'
            }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <img
                  src={orderToPay.paymentMethod === 'MOMO'
                    ? ('https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent('2|99|0942367010|BUI QUOC HUNG|lanhfarm@momo|0|0|' + Math.round(orderToPay.totalAmount) + '|' + orderToPay.orderCode))
                    : ('https://img.vietqr.io/image/TPB-00002120078-compact2.png?amount=' + Math.round(orderToPay.totalAmount) + '&addInfo=' + encodeURIComponent(orderToPay.orderCode) + '&accountName=' + encodeURIComponent('BÙI QUỐC HÙNG'))}
                  alt="VietQR thanh toán đơn hàng"
                  style={{ width: '200px', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Thông tin chuyển khoản phân biệt MoMo và TPBank */}
              <div style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #EDF2F7',
                fontSize: '12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {orderToPay.paymentMethod === 'MOMO' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Ví điện tử:</span>
                      <strong style={{ color: '#A50064' }}>Ví MoMo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#718096' }}>Số điện thoại MoMo:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#A50064', fontFamily: 'monospace', fontSize: '13.5px' }}>0942 367 010</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('0942367010');
                            showToast('Đã sao chép Số điện thoại MoMo!', 'success');
                          }}
                          style={{ border: 'none', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Tên chủ ví:</span>
                      <strong style={{ color: '#2D3748' }}>BÙI QUỐC HÙNG</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#718096' }}>Lời nhắn (Nội dung):</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#C53030', fontFamily: 'monospace' }}>{orderToPay.orderCode}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(orderToPay.orderCode);
                            showToast('Đã sao chép Mã đơn hàng!', 'success');
                          }}
                          style={{ border: 'none', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Ngân hàng:</span>
                      <strong style={{ color: '#2D3748' }}>TPBank (Ngân hàng Tiên Phong)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#718096' }}>Số tài khoản:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#2E7D32', fontFamily: 'monospace', fontSize: '13.5px' }}>0000 2120 078</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('00002120078');
                            showToast('Đã sao chép Số tài khoản TPBank!', 'success');
                          }}
                          style={{ border: 'none', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>Chủ tài khoản:</span>
                      <strong style={{ color: '#2D3748' }}>BÙI QUỐC HÙNG</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#718096' }}>Nội dung CK:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ color: '#C53030', fontFamily: 'monospace' }}>{orderToPay.orderCode}</strong>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(orderToPay.orderCode);
                            showToast('Đã sao chép Mã đơn hàng!', 'success');
                          }}
                          style={{ border: 'none', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setOrderToPay(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#EDF2F7',
                  color: '#4A5568',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Đóng lại
              </button>
              <button
                onClick={() => {
                  setOrderToPay(null);
                  showToast('Đã ghi nhận! Đơn hàng của bạn sẽ được nhân viên đối soát thanh toán sớm nhất.', 'success');
                }}
                style={{
                  flex: 1.3,
                  padding: '10px 16px',
                  backgroundColor: '#2E7D32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(46,125,50,0.25)'
                }}
              >
                Tôi đã chuyển khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO NỔI BẬT (Tự biến mất sau 4 giây) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 10000,
          backgroundColor: toast.type === 'success' ? '#15803D' : '#DC2626',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: '600',
          maxWidth: '420px'
        }}>
          
          <span>{toast.message}</span>
        </div>
      )}


      {/* ── FOOTER GIỐNG TRANG CHỦ ── */}
            {/* ── MODAL CHI TIẾT ĐƠN HÀNG ── */}
      {selectedOrderDetails && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
                    Chi tiết đơn hàng #{selectedOrderDetails.orderCode}
                  </h3>
                  {getStatusBadge(selectedOrderDetails)}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Thời gian đặt: {parseServerDate(selectedOrderDetails.createdAt).toLocaleDateString('vi-VN')} lúc {parseServerDate(selectedOrderDetails.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-soft)', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Thông tin nhận hàng & Thanh toán */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Thông tin người nhận
                </div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '14px' }}>
                  {selectedOrderDetails.address?.receiverName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', marginTop: '2px' }}>
                  Số điện thoại: {selectedOrderDetails.address?.phone}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px', lineHeight: '1.4' }}>
                  {selectedOrderDetails.address?.addressDetail}, {selectedOrderDetails.address?.ward}, {selectedOrderDetails.address?.district}, {selectedOrderDetails.address?.province}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569' }}>
                    {selectedOrderDetails.address?.addressType || 'Nhà ở'}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Phương thức thanh toán
                </div>
                <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '14px' }}>
                  {selectedOrderDetails.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : selectedOrderDetails.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' : 'Chuyển khoản Ngân hàng (VietQR)'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                  Trạng thái: <strong>{selectedOrderDetails.paymentStatus?.toLowerCase() === 'paid' ? 'Đã hoàn tất thanh toán' : 'Chưa nhận được thanh toán'}</strong>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '10px' }}>
                Sản phẩm đã đặt ({selectedOrderDetails.orderItems?.length || 0})
              </div>
              <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                {selectedOrderDetails.orderItems?.map((item, idx) => (
                  <div key={item.orderItemId || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: idx < selectedOrderDetails.orderItems.length - 1 ? '1px solid var(--line)' : 'none',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={getProductImage(item)}
                        alt={item.product?.productName}
                        style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--line)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--ink)' }}>
                          {item.product?.productName || 'Nông sản LÀNH'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                          {toVND(item.unitPrice)} / {item.product?.unit || 'kg'} × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>
                      {toVND(item.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tóm tắt chi phí */}
            <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                <span>Tạm tính tiền hàng:</span>
                <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{toVND(selectedOrderDetails.subtotal || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                <span>Phí vận chuyển tiêu chuẩn:</span>
                <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{toVND(selectedOrderDetails.shippingFee || 0)}</span>
              </div>
              {((selectedOrderDetails.subtotal || 0) + (selectedOrderDetails.shippingFee || 0) - (selectedOrderDetails.totalAmount || 0) > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#15803d', fontWeight: '600', marginBottom: '6px' }}>
                  <span>Giảm giá Voucher:</span>
                  <span>-{toVND((selectedOrderDetails.subtotal || 0) + (selectedOrderDetails.shippingFee || 0) - (selectedOrderDetails.totalAmount || 0))}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: 'var(--ink)', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '6px' }}>
                <span>Tổng cộng thanh toán:</span>
                <span style={{ color: '#e53e3e', fontSize: '18px' }}>{toVND(selectedOrderDetails.totalAmount)}</span>
              </div>
            </div>

            {/* Footer Modal với nút Xuất hóa đơn CSV */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => printOrderToPDF(selectedOrderDetails)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  border: '1.5px solid #15803d',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                In hóa đơn PDF
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedOrderDetails.orderStatus?.toLowerCase() === 'pending' && selectedOrderDetails.paymentStatus?.toLowerCase() !== 'paid' && selectedOrderDetails.paymentMethod !== 'COD' && getRemainingMinutes(selectedOrderDetails.createdAt) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrderDetails;
                      setSelectedOrderDetails(null);
                      setOrderToPay(ord);
                    }}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Thanh toán ngay
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo">LÀNH</div>
              <p>Nền tảng nông sản hữu cơ minh bạch — kết nối trực tiếp nông trại Việt Nam đến bữa ăn của bạn.</p>
              <div className="cert-row">
                <span className="cert-pill">VietGAP</span>
                <span className="cert-pill">GlobalGAP</span>
                <span className="cert-pill">USDA Organic</span>
              </div>
            </div>
            <div>
              <h5>Liên hệ</h5>
              <ul>
                <li>1900 6868 (7:00–21:00)</li>
                <li>hello@lanh.vn</li>
                <li>92 Nguyễn Huệ, Q.1, TP.HCM</li>
              </ul>
            </div>
            <div>
              <h5>Chính sách</h5>
              <ul>
                <li>Vận chuyển &amp; giao nhận</li>
                <li>Đổi trả trong 24h</li>
                <li>Bảo mật thông tin</li>
                <li>Điều khoản dịch vụ</li>
              </ul>
            </div>
            <div>
              <h5>Thanh toán</h5>
              <div className="pay-icons">
                <span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX, Đại học ABC.</span>
            <span>Thiết kế minh họa cho mục đích học thuật.</span>
          </div>
        </div>
      </footer>

      {/* ── OVERLAY VÀ DRAWER GIỎ HÀNG ── */}
      {isDrawerOpen && (
        <>
          <div className="overlay show" onClick={() => setIsDrawerOpen(false)} style={{ zIndex: 999 }}></div>
          <aside className="drawer show" aria-label="Giỏ hàng" style={{ zIndex: 1000 }}>
            <div className="drawer-head" style={{ padding: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Giỏ hàng của bạn</h3>
              <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="drawer-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {cart.length === 0 ? (
                <div className="drawer-empty" style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>Giỏ hàng đang trống.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} className="drawer-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="thumb" style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #edf2f7' }}>
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80'} 
                          alt={item.product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div className="info" style={{ flex: 1 }}>
                        <b style={{ display: 'block', fontSize: '14px', color: '#2d3748' }}>{item.product.name}</b>
                        <span style={{ fontSize: '12px', color: '#718096' }}>{item.product.price} {item.product.unit}</span>
                        <div className="qty-ctrl" style={{ display: 'flex', alignItems: 'center', marginTop: '6px', border: '1px solid #cbd5e0', borderRadius: '4px', width: 'fit-content' }}>
                          <button onClick={() => updateCartQty(item.product.id, -1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '13px', padding: '0 6px', fontWeight: 'bold' }}>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product.id, 1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa" style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#e53e3e' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="drawer-foot" style={{ padding: '20px', borderTop: '1px solid #edf2f7', backgroundColor: '#fcfdfc' }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                <span>Tạm tính</span>
                <span>{toVND(totalCart)}</span>
              </div>
              <button 
                className="btn btn-accent" 
                onClick={() => { setIsDrawerOpen(false); router.push('/checkout'); }}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Thanh toán ngay
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
