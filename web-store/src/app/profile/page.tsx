'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VIETNAM_PROVINCES, fetchWithTimeout } from '@/constants/vietnamProvinces';

type CustomerAddress = {
  addressId: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  addressType?: string; // "Nhà ở" | "Công ty"
  isDefault: boolean;
};

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

type CartItem = {
  product: {
    id: number;
    name: string;
    price: string;
    rawPrice?: number;
    unit: string;
    category?: string;
    imageUrl?: string;
    icon?: string;
    cert?: string;
    region?: string;
    rating?: number;
    reviews?: number;
    lot?: string;
  };
  qty: number;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'loyalty' | 'vouchers' | 'orders'>('profile');

  // Loyalty Points State & Data
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [userTier, setUserTier] = useState<string>('Mới');
  const [totalSpentYear, setTotalSpentYear] = useState(0);
  const nextTierSpend = 2000000;
  const [loyaltySubTab, setLoyaltySubTab] = useState<'benefits' | 'rewards' | 'history'>('benefits');
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');

  // Kho Lưu Trữ Vouchers
  const [userVouchers, setUserVouchers] = useState<any[]>([]);

  // Lịch sử đơn hàng
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Form Thông tin cá nhân
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sổ địa chỉ
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');
  const [addressErrorMsg, setAddressErrorMsg] = useState('');

  // Modal Thêm / Sửa địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formReceiverName, setFormReceiverName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProvince, setFormProvince] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formAddressDetail, setFormAddressDetail] = useState('');
  const [formAddressType, setFormAddressType] = useState('Nhà ở');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Dữ liệu Hành chính Quốc gia (API Provinces Open-API)
  const [provincesList, setProvincesList] = useState<Array<{ code: number; name: string }>>([]);
  const [districtsList, setDistrictsList] = useState<Array<{ code: number; name: string }>>([]);
  const [wardsList, setWardsList] = useState<Array<{ code: number; name: string }>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Đồng bộ Layout Header, Theme, Search, Cart
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const router = useRouter();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const stored = localStorage.getItem('customer_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);
    setCurrentUser(userData);
    setFullName(userData.fullName || '');
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setAvatarUrl(userData.avatarUrl || '');

    fetchAddresses(userData.userId);
    fetchOrders(userData.userId);
    fetchLoyalty(userData.userId);

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {}
    }
  }, [router]);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setUser(null);
    setShowUserDropdown(false);
    router.push('/login');
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 0) {
      fetch(`http://localhost:5023/api/products/autocomplete?prefix=${encodeURIComponent(val)}`)
        .then(res => res.json())
        .then((data: SuggestionItem[]) => {
          setSuggestions(data || []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(x => {
        if (x.product.id === id) {
          return { ...x, qty: Math.max(1, x.qty + delta) };
        }
        return x;
      });
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const updated = prev.filter(x => x.product.id !== id);
      if (updated.length > 0) {
        localStorage.setItem('cart', JSON.stringify(updated));
      } else {
        localStorage.removeItem('cart');
      }
      return updated;
    });
  };

  const totalCart = cart.reduce((s, i) => s + (parseInt(i.product.price.replace(/[^\d]/g, ''), 10) || 0) * i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const fetchAddresses = async (userId: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/user/${userId}`);
      if (res.ok) {
        const data: CustomerAddress[] = await res.json();
        setAddresses(data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách địa chỉ:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async (userId: number) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`http://localhost:5023/api/orders/customer/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Mua lại các sản phẩm trong đơn hàng
  const handleReorder = (order: any) => {
    if (!order.orderItems || order.orderItems.length === 0) return;
    
    let currentCart: CartItem[] = [];
    const stored = localStorage.getItem('cart');
    if (stored) {
      try { currentCart = JSON.parse(stored); } catch {}
    }

    order.orderItems.forEach((item: any) => {
      const existing = currentCart.find(c => c.product.id === item.productId);
      if (existing) {
        existing.qty += item.quantity;
      } else {
        currentCart.push({
          product: {
            id: item.productId,
            name: item.product?.productName || 'Nông sản LÀNH',
            price: item.unitPrice ? (item.unitPrice.toLocaleString('vi-VN') + '₫') : '0₫',
            rawPrice: item.unitPrice,
            unit: ' / ' + (item.product?.unit || 'kg'),
            category: item.product?.category?.categoryName || 'Nông sản',
            cert: 'VietGAP',
            region: 'Đà Lạt',
            rating: 5,
            reviews: 10,
            icon: 'leaf',
            lot: item.lotCode || ('LOT#VN-REC-' + item.productId),
            imageUrl: item.product?.productImages && item.product.productImages.length > 0 ? item.product.productImages[0].imageUrl : undefined
          },
          qty: item.quantity
        });
      }
    });

    setCart([...currentCart]);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    setIsDrawerOpen(true);
    showToast(`Đã thêm ${order.orderItems.length} sản phẩm từ đơn #${order.orderCode} vào giỏ hàng!`, 'success');
  };

  // In / Tải hóa đơn PDF chuẩn A4
  const printOrderToPDF = (order: any) => {
    if (!order) return;
    let orderDate = new Date();
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) orderDate = d;
    }
    const formattedDate = orderDate.toLocaleDateString('vi-VN') + ' ' + orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

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
    @page { size: A4; margin: 15mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; background: #ffffff; padding: 24px; font-size: 13px; line-height: 1.5; }
    .invoice-card { max-width: 820px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 36px 40px; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #15803d; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-name { font-size: 24px; font-weight: 800; color: #15803d; letter-spacing: 0.5px; }
    .brand-sub { font-size: 11px; font-weight: 600; color: #4b5563; margin-top: 2px; }
    .company-info { font-size: 12px; color: #4b5563; line-height: 1.6; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
    .order-meta { font-size: 12.5px; color: #4b5563; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 14px 16px; border-radius: 6px; }
    .box-title { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
    .table-container { margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f3f4f6; color: #374151; font-weight: 700; font-size: 12px; padding: 10px 14px; border: 1px solid #e5e7eb; }
    td { padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 12.5px; vertical-align: middle; }
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .totals-table { width: 320px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
    .totals-row.grand { border-top: 2px solid #111827; padding-top: 10px; margin-top: 6px; font-weight: 800; font-size: 16px; color: #15803d; }
    .footer-note { border-top: 1px dashed #d1d5db; padding-top: 18px; text-align: center; font-size: 11.5px; color: #6b7280; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-name">🌿 LÀNH FARM</div>
        <div class="brand-sub">NÔNG SẢN SẠCH & CHUỖI CUNG ỨNG MINH BẠCH</div>
        <div class="company-info" style="margin-top: 6px;">
          Hotline: 1900 8899 | Email: contact@lanhfarm.vn<br/>
          Website: https://lanhfarm.vn
        </div>
      </div>
      <div class="invoice-title">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <div class="order-meta">Mã đơn: <strong>#${order.orderCode}</strong></div>
        <div class="order-meta">Ngày đặt: ${formattedDate}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-box">
        <div class="box-title">ĐƠN VỊ VẬN CHUYỂN & NHẬN HÀNG</div>
        <div><strong>Người nhận:</strong> ${order.address?.receiverName || user?.fullName || 'Khách hàng'}</div>
        <div><strong>Điện thoại:</strong> ${order.address?.phone || user?.phone || 'N/A'}</div>
        <div><strong>Địa chỉ:</strong> ${fullAddress || 'Địa chỉ tiêu chuẩn'}</div>
      </div>
      <div class="info-box">
        <div class="box-title">THANH TOÁN & GIAO HÀNG</div>
        <div><strong>Hình thức:</strong> ${payMethodText}</div>
        <div><strong>Trạng thái:</strong> ${order.paymentStatus?.toLowerCase() === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
        <div><strong>Trạng thái đơn:</strong> ${order.orderStatus || 'Đang xử lý'}</div>
      </div>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th>Tên nông sản / Sản phẩm</th>
            <th style="width: 100px; text-align: center;">Đơn vị</th>
            <th style="width: 80px; text-align: center;">Số lượng</th>
            <th style="width: 120px; text-align: right;">Đơn giá</th>
            <th style="width: 130px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${(order.orderItems || []).map((item: any, idx: number) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td><strong>${item.product?.productName || 'Nông sản LÀNH'}</strong></td>
              <td style="text-align: center;">${item.product?.unit || 'kg'}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${toVND(item.unitPrice || 0)}</td>
              <td style="text-align: right;"><strong>${toVND(item.totalAmount || 0)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row"><span>Tạm tính tiền hàng:</span><span>${toVND(order.subtotal || 0)}</span></div>
        <div class="totals-row"><span>Phí vận chuyển:</span><span>${toVND(order.shippingFee || 0)}</span></div>
        ${discount > 0 ? `<div class="totals-row" style="color: #15803d; font-weight: 600;"><span>Giảm giá Voucher:</span><span>-${toVND(discount)}</span></div>` : ''}
        <div class="totals-row grand"><span>TỔNG CỘNG:</span><span>${toVND(order.totalAmount || 0)}</span></div>
      </div>
    </div>
    <div class="footer-note">
      Cảm ơn quý khách đã tin dùng nông sản tươi sạch chuẩn VietGAP tại LÀNH Farm!<br/>
      Mọi thắc mắc hoặc yêu cầu hỗ trợ khiếu nại, vui lòng liên hệ tổng đài 1900 8899 trong vòng 48h.
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
      showToast('Đang mở cửa sổ in hóa đơn PDF');
    } else {
      showToast('Vui lòng cho phép mở popup trên trình duyệt để in hoặc tải hóa đơn PDF.', 'error');
    }
  };

  const fetchLoyalty = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:5023/api/loyalty/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLoyaltyPoints(data.currentPoints ?? 0);
        setTotalSpentYear(data.totalSpentYear ?? 0);
        setUserTier(data.tier ?? 'Mới');
        if (data.history) setPointHistory(data.history);
        if (data.vouchers) setUserVouchers(data.vouchers);
      }
    } catch (err) {
      console.error('Lỗi lấy thông tin Loyalty:', err);
    }
  };

  const handleRedeemGift = async (pointsRequired: number, title: string, isVoucher: boolean, voucherType?: string, discountValue: number = 0, minOrderAmount: number = 0) => {
    setRedeemSuccess('');
    setRedeemError('');

    if (!user) return;
    if (loyaltyPoints < pointsRequired) {
      setRedeemError('Bạn không đủ điểm tích lũy để đổi quà này.');
      return;
    }

    try {
      const payload = {
        userId: user.userId,
        pointsRequired,
        rewardTitle: title,
        isVoucher,
        voucherType,
        discountValue,
        minOrderAmount
      };

      const res = await fetch('http://localhost:5023/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Đổi điểm thất bại.');
      }

      const resData = await res.json();
      setRedeemSuccess(resData.message || 'Đổi thành công!');
      // Reload dữ liệu thật từ DB
      fetchLoyalty(user.userId);
    } catch (err: any) {
      setRedeemError(err.message || 'Lỗi khi gọi API đổi điểm.');
    }
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setProfileError('Họ tên, Email và Số điện thoại không được để trống.');
      return;
    }

    setProfileLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim()
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(`http://localhost:5023/api/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Cập nhật thông tin thất bại.');
      }

      // Cập nhật lại localStorage
      const updatedUser = {
        ...user,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim()
      };
      localStorage.setItem('customer_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      setPassword('');

      setProfileSuccess('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Tải danh sách Tỉnh/Thành từ Open API Quốc Gia (Kèm Fallback an toàn)
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetchWithTimeout('https://provinces.open-api.vn/api/p/', 3000);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProvincesList(data);
            return;
          }
        }
        // Fallback danh sách 63 tỉnh thành chuẩn Việt Nam nếu API phản hồi không hợp lệ
        setProvincesList(VIETNAM_PROVINCES);
      } catch {
        // Tự động chuyển về danh sách dự phòng nội bộ nếu API bên ngoài bị timeout hoặc nghẽn mạng
        setProvincesList(VIETNAM_PROVINCES);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Xử lý khi chọn Tỉnh/Thành -> Tải danh sách Quận/Huyện tương ứng
  const handleProvinceChange = async (provinceName: string) => {
    setFormProvince(provinceName);
    setFormDistrict('');
    setFormWard('');
    setDistrictsList([]);
    setWardsList([]);

    const foundProvince = provincesList.find(p => p.name === provinceName);
    if (foundProvince) {
      setLoadingDistricts(true);
      try {
        const res = await fetchWithTimeout(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`, 3000);
        if (res.ok) {
          const data = await res.json();
          setDistrictsList(data.districts || []);
        } else {
          setDistrictsList([]);
        }
      } catch {
        setDistrictsList([]);
      } finally {
        setLoadingDistricts(false);
      }
    }
  };

  // Xử lý khi chọn Quận/Huyện -> Tải danh sách Phường/Xã tương ứng
  const handleDistrictChange = async (districtName: string) => {
    setFormDistrict(districtName);
    setFormWard('');
    setWardsList([]);

    const foundDistrict = districtsList.find(d => d.name === districtName);
    if (foundDistrict) {
      setLoadingWards(true);
      try {
        const res = await fetchWithTimeout(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`, 3000);
        if (res.ok) {
          const data = await res.json();
          setWardsList(data.wards || []);
        } else {
          setWardsList([]);
        }
      } catch {
        setWardsList([]);
      } finally {
        setLoadingWards(false);
      }
    }
  };

  // Mở modal thêm địa chỉ mới
  const handleOpenAddModal = async () => {
    setEditingAddressId(null);
    setFormReceiverName(user?.fullName || '');
    setFormPhone(user?.phone || '');
    setFormProvince('');
    setFormDistrict('');
    setFormWard('');
    setDistrictsList([]);
    setWardsList([]);
    setFormAddressDetail('');
    setFormAddressType('Nhà ở');
    setFormIsDefault(addresses.length === 0);
    setModalError('');
    setShowAddressModal(true);
  };

  // Mở modal sửa địa chỉ
  const handleOpenEditModal = async (addr: CustomerAddress) => {
    setEditingAddressId(addr.addressId);
    setFormReceiverName(addr.receiverName);
    setFormPhone(addr.phone);
    setFormProvince(addr.province);
    setFormDistrict(addr.district);
    setFormWard(addr.ward);
    setFormAddressDetail(addr.addressDetail);
    setFormAddressType(addr.addressType || 'Nhà ở');
    setFormIsDefault(addr.isDefault);
    setModalError('');
    setShowAddressModal(true);

    // Tự động load lại danh sách Quận/Huyện và Phường/Xã tương ứng với địa chỉ đang sửa
    const foundProvince = provincesList.find(p => p.name === addr.province);
    if (foundProvince) {
      try {
        const resD = await fetchWithTimeout(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`, 3000);
        if (resD.ok) {
          const dataD = await resD.json();
          const dists = dataD.districts || [];
          setDistrictsList(dists);

          const foundDistrict = dists.find((d: any) => d.name === addr.district);
          if (foundDistrict) {
            const resW = await fetchWithTimeout(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`, 3000);
            if (resW.ok) {
              const dataW = await resW.json();
              setWardsList(dataW.wards || []);
            }
          }
        }
      } catch {
        // Bắt lỗi an toàn
      }
    }
  };

  // Thiết lập địa chỉ mặc định
  const handleSetDefault = async (addressId: number) => {
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/${addressId}/set-default`, {
        method: 'PUT'
      });
      if (!res.ok) {
        throw new Error('Không thể thiết lập địa chỉ mặc định.');
      }
      setAddressSuccessMsg('Đã đặt làm địa chỉ giao hàng mặc định!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setAddressErrorMsg(err.message || 'Lỗi đặt địa chỉ mặc định.');
      setTimeout(() => setAddressErrorMsg(''), 3000);
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này?')) return;

    try {
      const res = await fetch(`http://localhost:5023/api/addresses/${addressId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Không thể xóa địa chỉ.');
      }
      setAddressSuccessMsg('Đã xóa địa chỉ thành công!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setAddressErrorMsg(err.message || 'Lỗi khi xóa địa chỉ.');
      setTimeout(() => setAddressErrorMsg(''), 3000);
    }
  };

  // Lưu địa chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formReceiverName.trim() || !formPhone.trim() || !formDistrict.trim() || !formWard.trim() || !formAddressDetail.trim()) {
      setModalError('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        userId: user.userId,
        receiverName: formReceiverName.trim(),
        phone: formPhone.trim(),
        province: formProvince.trim(),
        district: formDistrict.trim(),
        ward: formWard.trim(),
        addressDetail: formAddressDetail.trim(),
        addressType: formAddressType,
        isDefault: formIsDefault || addresses.length === 0
      };

      let res;
      if (editingAddressId) {
        res = await fetch(`http://localhost:5023/api/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5023/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Không thể lưu địa chỉ.');
      }

      setShowAddressModal(false);
      setAddressSuccessMsg(editingAddressId ? 'Cập nhật địa chỉ thành công!' : 'Đã thêm địa chỉ nhận hàng mới!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setModalError(err.message || 'Lỗi lưu địa chỉ.');
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <p style={{ color: 'var(--ink)' }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung</a>

      {/* ── 1. HEADER CHÍNH XÁC ĐỒNG BỘ 100% VỚI TRANG CHỦ ── */}
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
                  <button className={lang === "vi" ? "active" : ''} onClick={() => setLang("vi")}>VI</button>
                  <button className={lang === "en" ? "active" : ''} onClick={() => setLang("en")}>EN</button>
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

          {/* Thanh tìm kiếm trung tâm */}
          <div className="search-shell">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Bạn muốn tìm nông sản gì hôm nay? (Rau cải, bơ sáp, dâu tây...)" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            <button className="go" onClick={handleSearchSubmit} aria-label="Tìm kiếm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span>Tìm</span>
            </button>
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list" style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                listStyle: 'none',
                padding: '6px 0',
                margin: 0,
                zIndex: 999,
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                textAlign: 'left'
              }}>
                <li style={{ padding: '6px 14px', fontSize: '11.5px', color: 'var(--ink-soft)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Gợi ý sản phẩm phù hợp
                </li>
                {suggestions.map((s, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => {
                      setShowSuggestions(false);
                      router.push(`/products/${s.productId}`);
                    }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background .15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--green-100)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <img 
                      src={s.imageUrl || 'https://via.placeholder.com/38'} 
                      alt={s.productName} 
                      style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--line)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{s.productName}</strong>
                      <span style={{ fontSize: '12px', color: '#e53e3e', fontWeight: '700' }}>
                        {s.price.toLocaleString('vi-VN')} đ<span style={{ color: 'var(--ink-soft)', fontWeight: 'normal', fontSize: '11px' }}> / {s.unit}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                  {user && user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }} 
                    />
                  ) : ''}
                </span>
                <div className="header-action-text">
                  <span className="header-action-label">Xin chào,</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user ? user.fullName : "Tài khoản"}
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
                    <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{user.fullName}</div>
                    <div style={{ marginTop: '2px' }}>{user.email}</div>
                  </div>
                  <Link 
                    href="/profile"
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
                      color: 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderBottom: '1px solid var(--line)'
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
              className={`header-cart-btn ${cartBounce ? "bounce" : ''}`}
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

      {/* ── 2. NỘI DUNG PROFILE ── */}
      <main id="main" style={{ minHeight: 'calc(100vh - 350px)', padding: '40px 16px', backgroundColor: 'var(--bg)' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* CỘT TRÁI: MENU CÁC TAG DỌC (SIDEBAR NAVIGATION) */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 16px',
            boxShadow: 'var(--shadow-lift)',
            position: 'sticky',
            top: '90px'
          }}>
            {/* User Mini Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--line)', marginBottom: '14px' }}>
              <img 
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                alt="Avatar" 
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }} 
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fullName || user?.fullName || 'Khách hàng'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                  {userTier === 'Gold' ? 'Hạng Vàng' : `Hạng ${userTier}`}
                </div>
              </div>
            </div>

            {/* Danh sách các Tag Dọc */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'profile' ? 'var(--green-100)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--green-900)' : 'var(--ink)',
                  fontWeight: activeTab === 'profile' ? '700' : '500',
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>Thông tin cá nhân</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'addresses' ? 'var(--green-100)' : 'transparent',
                  color: activeTab === 'addresses' ? 'var(--green-900)' : 'var(--ink)',
                  fontWeight: activeTab === 'addresses' ? '700' : '500',
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>Sổ địa chỉ nhận hàng</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('loyalty')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'loyalty' ? 'var(--green-100)' : 'transparent',
                  color: activeTab === 'loyalty' ? 'var(--green-900)' : 'var(--ink)',
                  fontWeight: activeTab === 'loyalty' ? '700' : '500',
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>Điểm & Hạng thành viên</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vouchers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'vouchers' ? 'var(--green-100)' : 'transparent',
                  color: activeTab === 'vouchers' ? 'var(--green-900)' : 'var(--ink)',
                  fontWeight: activeTab === 'vouchers' ? '700' : '500',
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>Kho lưu trữ Voucher</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'orders' ? 'var(--green-100)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--green-900)' : 'var(--ink)',
                  fontWeight: activeTab === 'orders' ? '700' : '500',
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                
                <span>Lịch sử đơn hàng</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: KHỐI BLOCK THÔNG TIN CHÍNH (CONTENT BLOCK) */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lift)',
            padding: '28px 32px'
          }}>
            {/* Tiêu đề Block */}
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div className="eyebrow" style={{ marginBottom: '4px' }}>
                {activeTab === 'profile' && 'Hồ sơ cá nhân'}
                {activeTab === 'addresses' && 'Địa chỉ giao nhận'}
                {activeTab === 'loyalty' && 'Chương trình thân thiết'}
                {activeTab === 'vouchers' && 'Ưu đãi & Khuyến mãi'}
                {activeTab === 'orders' && 'Quản lý đơn mua'}
              </div>
              <h2 style={{ fontSize: '22px', color: 'var(--ink)', margin: 0, fontWeight: '800' }}>
                {activeTab === 'profile' && 'Thông Tin Cá Nhân'}
                {activeTab === 'addresses' && 'Sổ Địa Chỉ Nhận Hàng'}
                {activeTab === 'loyalty' && 'Điểm Thưởng & Hạng Thành Viên'}
                {activeTab === 'vouchers' && 'Kho Lưu Trữ Voucher'}
                {activeTab === 'orders' && 'Lịch Sử Đơn Hàng Nông Sản'}
              </h2>
            </div>
            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
              <div>
                {profileError && (
                  <div style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13.5px' }}>
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div style={{ backgroundColor: 'var(--green-100)', border: '1px solid var(--green-500)', color: 'var(--green-900)', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13.5px' }}>
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '6px' }}>
                    <img 
                      src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt="Avatar" 
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--green-700)',
                        backgroundColor: 'var(--green-100)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', marginBottom: '5px' }}>
                        Đường dẫn URL ảnh đại diện
                      </label>
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Dán URL ảnh đại diện của bạn"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--line)',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--ink)',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập địa chỉ email"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                      Đổi mật khẩu mới (Để trống nếu không đổi)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          paddingRight: '40px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--line)',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--ink)',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--ink-soft)' }}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn btn-dark"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      opacity: profileLoading ? 0.7 : 1,
                      marginTop: '8px'
                    }}
                  >
                    {profileLoading ? 'ĐANG LƯU THAY ĐỔI...' : 'LƯU THÔNG TIN CÁ NHÂN'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: SỔ ĐỊA CHỈ NHẬN HÀNG */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)', fontWeight: '700' }}>
                      Danh Sách Địa Chỉ Giao Hàng
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--ink-soft)' }}>
                      Quản lý địa chỉ giao hàng của bạn và chọn địa chỉ mặc định.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="btn btn-accent"
                    style={{
                      padding: '9px 18px',
                      fontSize: '13.5px',
                      fontWeight: '700'
                    }}
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>

                {addressSuccessMsg && (
                  <div style={{ backgroundColor: 'var(--green-100)', border: '1px solid var(--green-500)', color: 'var(--green-900)', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13.5px' }}>
                    {addressSuccessMsg}
                  </div>
                )}

                {addressErrorMsg && (
                  <div style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13.5px' }}>
                    {addressErrorMsg}
                  </div>
                )}

                {addressLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-soft)' }}>
                    Đang tải danh sách địa chỉ...
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line)' }}>
                    
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--ink)' }}>Bạn chưa lưu địa chỉ nào</h4>
                    <p style={{ margin: '0 0 18px 0', color: 'var(--ink-soft)', fontSize: '13.5px' }}>
                      Hãy thêm địa chỉ nhận hàng để việc đặt hàng thuận tiện hơn.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="btn btn-accent"
                      style={{ fontSize: '13px' }}
                    >
                      + Thêm địa chỉ đầu tiên
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {addresses.map(addr => {
                      const isCompany = addr.addressType === 'Công ty';

                      return (
                        <div
                          key={addr.addressId}
                          style={{
                            border: addr.isDefault ? '2px solid var(--green-700)' : '1px solid var(--line)',
                            backgroundColor: addr.isDefault ? 'var(--green-100)' : 'var(--surface)',
                            borderRadius: 'var(--radius-md)',
                            padding: '18px 20px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '15.5px', color: 'var(--ink)' }}>
                                  {addr.receiverName}
                                </span>
                                <span style={{ color: 'var(--line)' }}>|</span>
                                <span style={{ color: 'var(--ink-soft)', fontWeight: '500', fontSize: '13.5px' }}>
                                  {addr.phone}
                                </span>

                                {/* Badge loại địa chỉ */}
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11.5px',
                                  fontWeight: '600',
                                  backgroundColor: isCompany ? '#EBF8FF' : 'var(--bg)',
                                  color: isCompany ? '#2B6CB0' : 'var(--green-700)',
                                  border: `1px solid ${isCompany ? '#BEE3F8' : 'var(--line)'}`
                                }}>
                                  {isCompany ? 'Công ty' : 'Nhà ở'}
                                </span>

                                {/* Badge Địa chỉ mặc định */}
                                {addr.isDefault && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    backgroundColor: '#FFFBEB',
                                    color: '#B45309',
                                    border: '1px solid #FDE68A'
                                  }}>
                                    Mặc định
                                  </span>
                                )}
                              </div>

                              <div style={{ color: 'var(--ink)', fontSize: '13.5px', lineHeight: '1.5' }}>
                                <div>{addr.addressDetail}</div>
                                <div style={{ color: 'var(--ink-soft)' }}>{addr.ward}, {addr.district}, {addr.province}</div>
                              </div>
                            </div>

                            {/* Hành động */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(addr)}
                                className="btn btn-ghost"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12.5px'
                                }}
                              >
                                Sửa
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.addressId)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #FED7D7',
                                  padding: '6px 12px',
                                  borderRadius: '999px',
                                  color: '#E53E3E',
                                  fontSize: '12.5px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>

                          {/* Nút đặt mặc định nếu chưa phải mặc định */}
                          {!addr.isDefault && (
                            <div style={{ marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.addressId)}
                                style={{
                                  background: 'none',
                                  border: '1px solid var(--green-700)',
                                  color: 'var(--green-700)',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Đặt làm địa chỉ mặc định
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ĐIỂM THƯỞNG & HẠNG THÀNH VIÊN (LOYALTY PROGRAM) */}
            {activeTab === 'loyalty' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Thông báo thao tác đổi điểm */}
                {redeemSuccess && (
                  <div style={{ backgroundColor: 'var(--green-100)', border: '1px solid var(--green-500)', color: 'var(--green-900)', padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{redeemSuccess}</span>
                    <button type="button" onClick={() => setRedeemSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>
                )}
                {redeemError && (
                  <div style={{ backgroundColor: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{redeemError}</span>
                    <button type="button" onClick={() => setRedeemError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </div>
                )}

                {/* 1. Thẻ Tóm Tắt Điểm & Hạng Đơn Giản */}
                <div style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '4px' }}>Điểm tích lũy hiện có</div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--green-700)' }}>
                        {loyaltyPoints.toLocaleString('vi-VN')} <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--ink)' }}>điểm</span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                        (Quy đổi tương đương: <strong>{(loyaltyPoints * 10).toLocaleString('vi-VN')} đ</strong> khi thanh toán)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '4px' }}>Hạng thành viên</div>
                      <div style={{ display: 'inline-block', backgroundColor: 'var(--green-100)', color: 'var(--green-900)', fontWeight: '700', fontSize: '15px', padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--green-500)' }}>
                        Hạng {userTier === 'Gold' ? 'Vàng' : userTier}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px' }}>
                        Tích <strong>2%</strong> giá trị mỗi đơn hàng
                      </div>
                    </div>
                  </div>

                  {/* Thanh tiến trình đơn giản */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                      <span>Chi tiêu tích lũy: <strong style={{ color: 'var(--ink)' }}>{totalSpentYear.toLocaleString('vi-VN')} đ</strong></span>
                      <span>Mục tiêu Hạng Kim Cương: <strong style={{ color: 'var(--ink)' }}>{nextTierSpend.toLocaleString('vi-VN')} đ</strong></span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalSpentYear / nextTierSpend) * 100)}%`, height: '100%', backgroundColor: 'var(--green-700)', borderRadius: '999px' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px' }}>
                      Chi tiêu thêm <strong>{(nextTierSpend - totalSpentYear).toLocaleString('vi-VN')} đ</strong> để nâng hạng Kim Cương (Tích 3% + Freeship không giới hạn).
                    </div>
                  </div>
                </div>

                {/* 2. Menu Chức Năng Đơn Giản */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLoyaltySubTab('benefits')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: loyaltySubTab === 'benefits' ? '1px solid var(--green-700)' : '1px solid transparent',
                      backgroundColor: loyaltySubTab === 'benefits' ? 'var(--green-100)' : 'transparent',
                      color: loyaltySubTab === 'benefits' ? 'var(--green-900)' : 'var(--ink-soft)',
                      fontWeight: loyaltySubTab === 'benefits' ? '700' : '500',
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    1. Bảng quyền lợi & Hạng
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoyaltySubTab('rewards')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: loyaltySubTab === 'rewards' ? '1px solid var(--green-700)' : '1px solid transparent',
                      backgroundColor: loyaltySubTab === 'rewards' ? 'var(--green-100)' : 'transparent',
                      color: loyaltySubTab === 'rewards' ? 'var(--green-900)' : 'var(--ink-soft)',
                      fontWeight: loyaltySubTab === 'rewards' ? '700' : '500',
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    2. Đổi mã giảm giá & Quà tặng
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoyaltySubTab('history')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: loyaltySubTab === 'history' ? '1px solid var(--green-700)' : '1px solid transparent',
                      backgroundColor: loyaltySubTab === 'history' ? 'var(--green-100)' : 'transparent',
                      color: loyaltySubTab === 'history' ? 'var(--green-900)' : 'var(--ink-soft)',
                      fontWeight: loyaltySubTab === 'history' ? '700' : '500',
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    3. Lịch sử tích / dùng điểm
                  </button>
                </div>

                {/* SUB-TAB 1: BẢNG HẠNG VÀ CƠ CHẾ TÍCH ĐIỂM DỄ ĐỌC */}
                {loyaltySubTab === 'benefits' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Bảng phân hạng dạng Table rõ ràng */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--line)' }}>
                            <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--ink)' }}>Hạng</th>
                            <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--ink)' }}>Chi tiêu tối thiểu</th>
                            <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--ink)' }}>Tỷ lệ tích điểm</th>
                            <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--ink)' }}>Ưu đãi vận chuyển & Quà</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '600' }}>Thành viên Mới</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>0 đ</td>
                            <td style={{ padding: '12px 14px', color: 'var(--green-700)', fontWeight: '600' }}>1.0% (1.000đ = 1đ)</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>Tặng 500 điểm khi tạo tài khoản</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '600' }}>Hạng Bạc</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>2.000.000 đ</td>
                            <td style={{ padding: '12px 14px', color: 'var(--green-700)', fontWeight: '600' }}>1.5%</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>1 mã Freeship / tháng, x2 điểm sinh nhật</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--green-100)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--green-900)' }}>Hạng Vàng (Bạn)</td>
                            <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--green-900)' }}>5.000.000 đ</td>
                            <td style={{ padding: '12px 14px', color: 'var(--green-900)', fontWeight: '700' }}>2.0%</td>
                            <td style={{ padding: '12px 14px', color: 'var(--green-900)' }}>3 mã Freeship / tháng, quà đặc sản sinh nhật</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '600' }}>Kim Cương</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>10.000.000 đ</td>
                            <td style={{ padding: '12px 14px', color: 'var(--green-700)', fontWeight: '600' }}>3.0%</td>
                            <td style={{ padding: '12px 14px', color: 'var(--ink-soft)' }}>Miễn phí ship toàn bộ, hỗ trợ riêng</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Cách tích thêm điểm */}
                    <div style={{ backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '18px', border: '1px solid var(--line)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--ink)', fontWeight: '700' }}>
                        Cách tích lũy thêm điểm thưởng:
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                        <div>• <strong>Mua nông sản VietGAP:</strong> Tự động x1.5 điểm</div>
                        <div>• <strong>Đánh giá sản phẩm:</strong> +500 điểm / đánh giá</div>
                        <div>• <strong>Trả lại thùng carton/xốp:</strong> +500 điểm / lần</div>
                        <div>• <strong>Quét mã QR truy xuất IoT:</strong> +100 điểm / lượt</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: ĐỔI MÃ GIẢM GIÁ & QUÀ TẶNG RÕ RÀNG */}
                {loyaltySubTab === 'rewards' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)' }}>
                      Chọn mã giảm giá hoặc quà tặng bạn muốn đổi bằng điểm:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Mục 1 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--ink)' }}>Mã giảm giá 20.000 đ</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>Áp dụng cho đơn hàng từ 150.000 đ</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--green-700)', fontSize: '14px' }}>2.000 điểm</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemGift(2000, 'Mã giảm giá 20.000 đ', true, 'cash', 20000, 150000)}
                            className="btn btn-accent"
                            style={{ padding: '6px 16px', fontSize: '13px' }}
                          >
                            Đổi mã
                          </button>
                        </div>
                      </div>

                      {/* Mục 2 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--ink)' }}>Mã giảm giá 50.000 đ</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>Áp dụng cho đơn hàng từ 350.000 đ</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--green-700)', fontSize: '14px' }}>5.000 điểm</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemGift(5000, 'Mã giảm giá 50.000 đ', true, 'cash', 50000, 350000)}
                            className="btn btn-accent"
                            style={{ padding: '6px 16px', fontSize: '13px' }}
                          >
                            Đổi mã
                          </button>
                        </div>
                      </div>

                      {/* Mục 3 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--ink)' }}>Túi vải Canvas đi chợ LÀNH Eco</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>Gửi kèm vào đơn hàng tiếp theo</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--green-700)', fontSize: '14px' }}>6.500 điểm</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemGift(6500, 'Túi vải Canvas LÀNH Eco', false)}
                            className="btn btn-accent"
                            style={{ padding: '6px 16px', fontSize: '13px' }}
                          >
                            Đổi quà
                          </button>
                        </div>
                      </div>

                      {/* Mục 4 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--ink)' }}>Tài trợ 1 Cây giống nông dân</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '2px' }}>Ủng hộ cây giống bưởi da xanh cho nông hộ liên kết</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--green-700)', fontSize: '14px' }}>3.000 điểm</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemGift(3000, 'Tài trợ 1 Cây giống bưởi da xanh', false)}
                            style={{
                              backgroundColor: 'var(--green-700)',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 16px',
                              borderRadius: '999px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Đóng góp
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: LỊCH SỬ GIAO DỊCH ĐIỂM DẠNG BẢNG MINH BẠCH */}
                {loyaltySubTab === 'history' && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '10px 12px', color: 'var(--ink-soft)', fontWeight: '600' }}>Thời gian</th>
                          <th style={{ padding: '10px 12px', color: 'var(--ink-soft)', fontWeight: '600' }}>Nội dung hoạt động</th>
                          <th style={{ padding: '10px 12px', color: 'var(--ink-soft)', fontWeight: '600', textAlign: 'right' }}>Biến động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointHistory.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--ink-soft)' }}>
                              Chưa có lịch sử giao dịch điểm nào.
                            </td>
                          </tr>
                        ) : (
                          pointHistory.map((item, idx) => (
                            <tr key={item.transactionId || idx} style={{ borderBottom: '1px solid var(--line)' }}>
                              <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                              </td>
                              <td style={{ padding: '12px', color: 'var(--ink)', fontWeight: '500' }}>
                                {item.description}
                              </td>
                              <td style={{ padding: '12px', color: item.pointsDelta > 0 ? 'var(--green-700)' : '#c62828', fontWeight: '700', textAlign: 'right' }}>
                                {item.pointsDelta > 0 ? `+${item.pointsDelta.toLocaleString('vi-VN')} đ` : `${item.pointsDelta.toLocaleString('vi-VN')} đ`}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KHO LƯU TRỮ VOUCHER */}
            {activeTab === 'vouchers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '13.5px', color: 'var(--ink-soft)' }}>
                    Tổng số: <strong>{userVouchers.length}</strong> voucher (<strong>{userVouchers.filter(v => !v.isUsed).length}</strong> khả dụng)
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('loyalty')}
                    className="btn btn-accent"
                    style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  >
                    + Đổi thêm voucher từ Điểm thưởng
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {userVouchers.map(v => (
                    <div
                      key={v.voucherId || v.id}
                      style={{
                        border: v.isUsed ? '1px dashed var(--line)' : '1px solid var(--line)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: v.isUsed ? 'var(--bg)' : 'var(--surface)',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: v.isUsed ? 0.6 : 1,
                        position: 'relative'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: v.voucherType === 'ship' ? '#EBF8FF' : '#FEF3C7',
                            color: v.voucherType === 'ship' ? '#2B6CB0' : '#B45309'
                          }}>
                            {v.voucherType === 'ship' ? 'FREESHIP' : 'GIẢM GIÁ'}
                          </span>
                          {v.isUsed ? (
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--ink-soft)' }}>Đã sử dụng</span>
                          ) : (
                            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--green-700)' }}>Khả dụng</span>
                          )}
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)', fontWeight: '700' }}>
                          {v.title || v.name}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                          Áp dụng đơn từ: <strong>{(v.minOrderAmount || v.minOrder || 0).toLocaleString('vi-VN')} đ</strong>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>MÃ VOUCHER</div>
                          <code style={{ fontSize: '13px', fontWeight: '800', color: 'var(--green-700)', letterSpacing: '0.5px' }}>{v.code}</code>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>HẠN DÙNG</div>
                          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--ink)' }}>
                            {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : v.expiry || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: LỊCH SỬ ĐƠN HÀNG */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Thanh tìm kiếm đơn hàng & Lọc trạng thái */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Ô tìm kiếm */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Tìm theo mã đơn hàng (#ORD-...) hoặc tên nông sản..."
                      value={searchOrderQuery}
                      onChange={(e) => setSearchOrderQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 40px',
                        borderRadius: '10px',
                        border: '1.5px solid var(--line)',
                        fontSize: '13.5px',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--ink)',
                        outline: 'none',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    />
                    <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    {searchOrderQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchOrderQuery('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: '#e2e8f0',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Thanh lọc trạng thái đơn & Nút làm mới */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'pending', label: 'Chờ duyệt' },
                        { key: 'shipping', label: 'Đang giao' },
                        { key: 'delivered', label: 'Hoàn thành' },
                        { key: 'cancelled', label: 'Đã hủy' }
                      ].map(f => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setOrderFilterStatus(f.key)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: orderFilterStatus === f.key ? '1px solid var(--green-700)' : '1px solid var(--line)',
                            backgroundColor: orderFilterStatus === f.key ? 'var(--green-100)' : 'var(--surface)',
                            color: orderFilterStatus === f.key ? 'var(--green-900)' : 'var(--ink-soft)',
                            fontWeight: orderFilterStatus === f.key ? '700' : '500',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s'
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                        Tìm thấy <strong>{orders.filter(order => {
                          const oStatus = order.orderStatus?.toLowerCase() || 'pending';
                          let matchesTab = true;
                          if (orderFilterStatus === 'pending') matchesTab = oStatus === 'pending';
                          else if (orderFilterStatus === 'shipping') matchesTab = oStatus === 'shipping';
                          else if (orderFilterStatus === 'delivered') matchesTab = oStatus === 'delivered' || oStatus === 'completed';
                          else if (orderFilterStatus === 'cancelled') matchesTab = oStatus === 'cancelled';
                          if (!matchesTab) return false;
                          if (!searchOrderQuery.trim()) return true;
                          const q = searchOrderQuery.toLowerCase().trim();
                          return order.orderCode?.toLowerCase().includes(q) || order.orderItems?.some((i: any) => i.product?.productName?.toLowerCase().includes(q));
                        }).length}</strong> đơn
                      </span>

                      <button
                        type="button"
                        onClick={() => user && fetchOrders(user.userId)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--line)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--ink)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        Làm mới
                      </button>
                    </div>
                  </div>
                </div>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--ink-soft)', fontSize: '14px' }}>
                    Đang tải danh sách đơn hàng...
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', border: '1.5px dashed var(--line)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
                      Bạn chưa có đơn hàng nào
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 18px 0' }}>
                      Khám phá các loại rau củ, trái cây sạch từ nông trại và đặt hàng ngay hôm nay.
                    </p>
                    <Link href="/" className="btn btn-dark" style={{ padding: '10px 22px', fontSize: '13.5px', textDecoration: 'none' }}>
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders
                      .filter(order => {
                        const oStatus = order.orderStatus?.toLowerCase() || 'pending';
                        let matchesTab = true;
                        if (orderFilterStatus === 'pending') matchesTab = oStatus === 'pending';
                        else if (orderFilterStatus === 'shipping') matchesTab = oStatus === 'shipping';
                        else if (orderFilterStatus === 'delivered') matchesTab = oStatus === 'delivered' || oStatus === 'completed';
                        else if (orderFilterStatus === 'cancelled') matchesTab = oStatus === 'cancelled';
                        if (!matchesTab) return false;
                        if (!searchOrderQuery.trim()) return true;
                        const q = searchOrderQuery.toLowerCase().trim();
                        return order.orderCode?.toLowerCase().includes(q) || order.orderItems?.some((i: any) => i.product?.productName?.toLowerCase().includes(q));
                      })
                      .map(order => {
                        const oStatus = order.orderStatus?.toLowerCase() || 'pending';
                        const statusColor = 
                          (oStatus === 'delivered' || oStatus === 'completed') ? { bg: 'var(--green-100)', color: 'var(--green-700)', text: 'Đã hoàn tất' } :
                          oStatus === 'shipping' ? { bg: '#E3F2FD', color: '#0D47A1', text: 'Đang giao hàng' } :
                          oStatus === 'cancelled' ? { bg: '#FFEBEE', color: '#C62828', text: 'Đã hủy' } :
                          { bg: '#FFF3E0', color: '#E65100', text: 'Chờ xác nhận' };

                        return (
                          <div
                            key={order.orderId}
                            style={{
                              border: '1px solid var(--line)',
                              borderRadius: 'var(--radius-md)',
                              padding: '20px',
                              backgroundColor: 'var(--surface)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '14px',
                              transition: 'box-shadow 0.2s',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* Header Đơn */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: '600' }}>MÃ ĐƠN:</span>
                                  <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14.5px', color: 'var(--ink)' }}>#{order.orderCode}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                                  Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.color
                                }}>
                                  {statusColor.text}
                                </span>
                              </div>
                            </div>

                            {/* Danh sách món hàng có kèm ảnh đại diện */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {order.orderItems?.map((item: any, idx: number) => {
                                const imgUrl = item.product?.productImages?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
                                return (
                                  <div key={item.orderItemId || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <img 
                                        src={imgUrl} 
                                        alt={item.product?.productName || 'Nông sản'} 
                                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--line)' }}
                                      />
                                      <div>
                                        <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '13.5px' }}>
                                          {item.product?.productName || 'Nông sản LÀNH'}
                                        </div>
                                        <div style={{ color: 'var(--ink-soft)', fontSize: '12px', marginTop: '2px' }}>
                                          {toVND(item.unitPrice || 0)} / {item.product?.unit || 'kg'} × <strong>{item.quantity}</strong>
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>
                                      {toVND(item.totalAmount || 0)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Footer Tổng tiền & Thanh tác vụ (Xem chi tiết, In PDF, Mua lại) */}
                            <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Tổng thanh toán:</span>
                                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#e53e3e' }}>
                                    {toVND(order.totalAmount || 0)}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--green-700)', fontWeight: '600', marginTop: '2px' }}>
                                  ⭐ Tích lũy: +{Math.round((order.totalAmount || 0) * 0.02 / 10).toLocaleString('vi-VN')} điểm
                                </div>
                              </div>

                              {/* Nhóm nút tác vụ */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {/* Nút Xem chi tiết */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(order)}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--line)',
                                    backgroundColor: '#ffffff',
                                    color: 'var(--ink)',
                                    fontWeight: '600',
                                    fontSize: '12.5px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                  Chi tiết
                                </button>

                                {/* Nút In hóa đơn PDF */}
                                <button
                                  type="button"
                                  onClick={() => printOrderToPDF(order)}
                                  style={{
                                    padding: '8px 14px',
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
                                  title="In hoặc tải hóa đơn PDF chuẩn A4"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                  In PDF
                                </button>

                                {/* Nút Mua Lại */}
                                <button
                                  type="button"
                                  onClick={() => handleReorder(order)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'var(--green-700)',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(46,125,50,0.25)',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6M21 12A9 9 0 0 0 6 5.3L3 8M21 22v-6h-6M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
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
            )}
          </div>
        </div>
      </main>

      {/* Modal Thêm / Chỉnh sửa địa chỉ */}
      {showAddressModal && (
        <div className="overlay show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            padding: '28px',
            boxShadow: 'var(--shadow-lift)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)', fontWeight: '700' }}>
                {editingAddressId ? 'Cập Nhật Địa Chỉ Giao Hàng' : 'Thêm Địa Chỉ Giao Hàng Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--ink-soft)' }}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Loại địa chỉ: Nhà ở / Công ty */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                  Loại địa chỉ <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormAddressType('Nhà ở')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: formAddressType === 'Nhà ở' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: formAddressType === 'Nhà ở' ? 'var(--green-100)' : 'transparent',
                      color: formAddressType === 'Nhà ở' ? 'var(--green-900)' : 'var(--ink-soft)',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Nhà ở
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAddressType('Công ty')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: formAddressType === 'Công ty' ? '2px solid #2B6CB0' : '1px solid var(--line)',
                      backgroundColor: formAddressType === 'Công ty' ? '#EBF8FF' : 'transparent',
                      color: formAddressType === 'Công ty' ? '#2B6CB0' : 'var(--ink-soft)',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Công ty
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                  Tên người nhận <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formReceiverName}
                  onChange={(e) => setFormReceiverName(e.target.value)}
                  placeholder="Nhập họ tên người nhận hàng"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                  Số điện thoại người nhận <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Nhập số điện thoại liên lạc"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink)' }}>
                    Tỉnh/Thành <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select
                    value={formProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--line)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">{loadingProvinces ? 'Đang tải tỉnh...' : '-- Chọn Tỉnh/Thành --'}</option>
                    {provincesList.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink)' }}>
                    Quận/Huyện <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  {districtsList.length > 0 ? (
                    <select
                      value={formDistrict}
                      disabled={!formProvince || loadingDistricts}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: !formProvince ? 'var(--line-subtle, #eee)' : 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !formProvince ? 0.6 : 1,
                        cursor: !formProvince ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">
                        {!formProvince ? '-- Chọn Tỉnh trước --' : loadingDistricts ? 'Đang nạp quận...' : '-- Chọn Quận/Huyện --'}
                      </option>
                      {districtsList.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formDistrict}
                      disabled={!formProvince}
                      onChange={(e) => {
                        setFormDistrict(e.target.value);
                        setFormWard('');
                      }}
                      placeholder={!formProvince ? 'Chọn Tỉnh trước' : loadingDistricts ? 'Đang nạp quận...' : 'Nhập Quận/Huyện'}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: !formProvince ? 'var(--line-subtle, #eee)' : 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !formProvince ? 0.6 : 1
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink)' }}>
                    Phường/Xã <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  {wardsList.length > 0 ? (
                    <select
                      value={formWard}
                      disabled={!formDistrict || loadingWards}
                      onChange={(e) => setFormWard(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: !formDistrict ? 'var(--line-subtle, #eee)' : 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !formDistrict ? 0.6 : 1,
                        cursor: !formDistrict ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">
                        {!formDistrict ? '-- Chọn Huyện trước --' : loadingWards ? 'Đang nạp xã...' : '-- Chọn Phường/Xã --'}
                      </option>
                      {wardsList.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formWard}
                      disabled={!formDistrict}
                      onChange={(e) => setFormWard(e.target.value)}
                      placeholder={!formDistrict ? 'Chọn Huyện trước' : loadingWards ? 'Đang nạp xã...' : 'Nhập Phường/Xã'}
                      style={{
                        width: '100%',
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--line)',
                        backgroundColor: !formDistrict ? 'var(--line-subtle, #eee)' : 'var(--bg)',
                        color: 'var(--ink)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !formDistrict ? 0.6 : 1
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                  Địa chỉ chi tiết <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formAddressDetail}
                  onChange={(e) => setFormAddressDetail(e.target.value)}
                  placeholder="Số nhà, tên đường, tòa nhà/phòng..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--green-700)' }}
                />
                <label htmlFor="defaultAddressCheck" style={{ fontSize: '13px', color: 'var(--ink)', cursor: 'pointer' }}>
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '12px', fontSize: '13.5px' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn btn-dark"
                  style={{ flex: 2, padding: '12px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer', opacity: modalLoading ? 0.7 : 1 }}
                >
                  {modalLoading ? 'ĐANG LƯU...' : editingAddressId ? 'CẬP NHẬT ĐỊA CHỈ' : 'LƯU ĐỊA CHỈ MỚI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. FOOTER CHÍNH XÁC ĐỒNG BỘ 100% VỚI TRANG CHỦ ── */}
      <footer className="foot">
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

      {/* ── 4. CART DRAWER ĐỒNG BỘ ── */}
      <div className={`overlay ${isDrawerOpen ? 'show' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <aside className={`drawer ${isDrawerOpen ? 'show' : ''}`} aria-label="Giỏ hàng">
        <div className="drawer-head">
          <h3>Giỏ hàng của bạn</h3>
          <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">Giỏ hàng đang trống.</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="drawer-item">
                <div className="thumb">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (<div style={{ width: '100%', height: '100%', backgroundColor: 'var(--line, #e2e8f0)', borderRadius: '4px' }} />)}
                </div>
                <div className="info">
                  <b>{item.product.name}</b>
                  <span>{item.product.price} {item.product.unit}</span>
                  <div className="qty-ctrl">
                    <button onClick={() => updateCartQty(item.product.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.product.id, 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div className="row"><span>Tạm tính</span><span>{toVND(totalCart)}</span></div>
          <button 
            className="btn btn-accent" 
            onClick={() => {
              setIsDrawerOpen(false);
              router.push('/checkout');
            }} 
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>

      {/* ── 5. MODAL XEM CHI TIẾT ĐƠN HÀNG ── */}
      {selectedOrderDetails && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--line)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--line)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--ink)' }}>
                    Chi tiết đơn hàng #{selectedOrderDetails.orderCode}
                  </h3>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                  Đặt lúc: {selectedOrderDetails.createdAt ? new Date(selectedOrderDetails.createdAt).toLocaleString('vi-VN') : 'N/A'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
                title="Đóng cửa sổ"
              >
                ✕
              </button>
            </div>

            {/* 2 Khối Thông tin Giao hàng & Thanh toán */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg, #f8fafc)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Địa chỉ nhận hàng
                </div>
                <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '14px' }}>
                  {selectedOrderDetails.address?.receiverName || user?.fullName || 'Khách hàng'} • {selectedOrderDetails.address?.phone || user?.phone || 'N/A'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px', lineHeight: '1.4' }}>
                  {[selectedOrderDetails.address?.addressDetail, selectedOrderDetails.address?.ward, selectedOrderDetails.address?.district, selectedOrderDetails.address?.province].filter(Boolean).join(', ') || 'Địa chỉ tiêu chuẩn'}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569' }}>
                    {selectedOrderDetails.address?.addressType || 'Nhà ở'}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg, #f8fafc)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Phương thức thanh toán
                </div>
                <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '14px' }}>
                  {selectedOrderDetails.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : selectedOrderDetails.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' : 'Chuyển khoản Ngân hàng (VietQR)'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                  Trạng thái: <strong style={{ color: selectedOrderDetails.paymentStatus?.toLowerCase() === 'paid' ? '#15803d' : '#d97706' }}>
                    {selectedOrderDetails.paymentStatus?.toLowerCase() === 'paid' ? 'Đã hoàn tất thanh toán' : 'Chưa nhận được thanh toán'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '10px' }}>
                Sản phẩm đã đặt ({selectedOrderDetails.orderItems?.length || 0})
              </div>
              <div style={{ border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' }}>
                {selectedOrderDetails.orderItems?.map((item: any, idx: number) => {
                  const imgUrl = item.product?.productImages?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
                  return (
                    <div key={item.orderItemId || idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: idx < (selectedOrderDetails.orderItems?.length || 0) - 1 ? '1px solid var(--line)' : 'none',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={imgUrl}
                          alt={item.product?.productName}
                          style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--line)' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--ink)' }}>
                            {item.product?.productName || 'Nông sản LÀNH'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            {toVND(item.unitPrice || 0)} / {item.product?.unit || 'kg'} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ink)' }}>
                        {toVND(item.totalAmount || 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tóm tắt chi phí */}
            <div style={{ backgroundColor: 'var(--bg, #f8fafc)', padding: '16px', borderRadius: '10px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                <span>Tạm tính tiền hàng:</span>
                <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{toVND(selectedOrderDetails.subtotal || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                <span>Phí vận chuyển:</span>
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
                <span style={{ color: '#e53e3e', fontSize: '18px' }}>{toVND(selectedOrderDetails.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Footer Modal với các nút hành động */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => printOrderToPDF(selectedOrderDetails)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#ffffff',
                  color: '#15803d',
                  border: '1.5px solid #15803d',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                In hóa đơn PDF
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleReorder(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: 'var(--green-700)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(46,125,50,0.25)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6M21 12A9 9 0 0 0 6 5.3L3 8M21 22v-6h-6M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                  Mua lại đơn này
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
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

      {/* ── 6. THÔNG BÁO TOAST NỔI ── */}
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
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}
    </>
  );
}
