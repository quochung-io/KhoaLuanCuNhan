'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VIETNAM_PROVINCES, fetchWithTimeout, ProvinceItem, DistrictItem, WardItem } from '@/constants/vietnamProvinces';

type Product = {
  id: number;
  name: string;
  price: string;
  unit: string;
  icon: string;
  imageUrl?: string;
};

type CartItem = {
  product: Product;
  qty: number;
};

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
  isDefault?: boolean;
};

type Voucher = {
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  tag: string;
};

const VOUCHER_WALLET: Voucher[] = [
  {
    code: 'LANHNEW',
    title: 'Giảm 15% Đơn Đầu Tiên',
    description: 'Ưu đãi thành viên mới của nông sản LÀNH',
    discountType: 'percent',
    discountValue: 15,
    minOrder: 100000,
    maxDiscount: 40000,
    expiryDate: '31/12/2026',
    tag: 'TÂN THỦ'
  },
  {
    code: 'FREESHIP30K',
    title: 'Miễn Phí Vận Chuyển 30.000₫',
    description: 'Trừ trực tiếp 30.000₫ phí giao hàng',
    discountType: 'fixed',
    discountValue: 30000,
    minOrder: 150000,
    expiryDate: '30/11/2026',
    tag: 'FREESHIP'
  },
  {
    code: 'ORGANIC50K',
    title: 'Giảm 50.000₫ Đơn Từ 300K',
    description: 'Áp dụng cho mọi đơn hàng từ 300.000₫',
    discountType: 'fixed',
    discountValue: 50000,
    minOrder: 300000,
    expiryDate: '15/12/2026',
    tag: 'TIẾT KIỆM'
  },
  {
    code: 'DALATFARM',
    title: 'Giảm 20.000₫ Nông Sản Đà Lạt',
    description: 'Ưu đãi cho đơn hàng rau củ quả Đà Lạt',
    discountType: 'fixed',
    discountValue: 20000,
    minOrder: 120000,
    expiryDate: '25/10/2026',
    tag: 'ĐÀ LẠT'
  }
];

export default function CheckoutPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Danh sách địa chỉ từ server
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Trạng thái modal / form thêm địa chỉ mới
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProvince, setNewProvince] = useState('TP.HCM');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [newAddressType, setNewAddressType] = useState('Nhà ở');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');

  // Dữ liệu Hành chính Quốc gia (API Provinces Open-API)
  const [provincesList, setProvincesList] = useState<ProvinceItem[]>([]);
  const [districtsList, setDistrictsList] = useState<DistrictItem[]>([]);
  const [wardsList, setWardsList] = useState<WardItem[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Voucher kho lưu trữ & Áp dụng
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [customVoucherCode, setCustomVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState('');

  // Phương thức thanh toán (COD | BANK | MOMO)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK' | 'MOMO'>('COD');

  // Modal QR Code thanh toán
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [finalPayAmount, setFinalPayAmount] = useState<number>(0);
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(600);
  const [isQrExpired, setIsQrExpired] = useState<boolean>(false);
  const [qrExpiryTime, setQrExpiryTime] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string>('');

  // Trạng thái giao diện, tài khoản
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Đếm ngược QR 10 phút dựa trên Date.now()
  useEffect(() => {
    if (showQrModal) {
      const durationMs = 10 * 60 * 1000;
      const newExpiry = Date.now() + durationMs;
      setQrExpiryTime(newExpiry);
      setQrSecondsLeft(600);
      setIsQrExpired(false);
    }
  }, [showQrModal]);

  useEffect(() => {
    if (!showQrModal || !qrExpiryTime) return;

    const tick = () => {
      const remainingMs = qrExpiryTime - Date.now();
      const seconds = Math.max(0, Math.floor(remainingMs / 1000));
      setQrSecondsLeft(seconds);
      if (seconds <= 0) {
        setIsQrExpired(true);
      } else {
        setIsQrExpired(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [showQrModal, qrExpiryTime]);

  const handleRefreshQr = () => {
    const newExpiry = Date.now() + 10 * 60 * 1000;
    setQrExpiryTime(newExpiry);
    setQrSecondsLeft(600);
    setIsQrExpired(false);
  };

  const handleCopy = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    router.push('/');
  };

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load user & cart
  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    fetchAddresses(parsedUser.userId);
  }, [router]);

  const fetchAddresses = async (userId: number) => {
    setIsLoadingAddresses(true);
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/user/${userId}`);
      if (res.ok) {
        const data: CustomerAddress[] = await res.json();
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.addressId);
        } else {
          setSelectedAddressId('new');
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải địa chỉ:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
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

  const subtotal = calculateSubtotal();
  const shippingFee = 30000;

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    if (subtotal < selectedVoucher.minOrder) return 0;

    if (selectedVoucher.discountType === 'percent') {
      const calculated = (subtotal * selectedVoucher.discountValue) / 100;
      return selectedVoucher.maxDiscount ? Math.min(calculated, selectedVoucher.maxDiscount) : calculated;
    } else {
      return selectedVoucher.discountValue;
    }
  };

  const discountAmount = calculateDiscount();
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyVoucher = (voucher: Voucher) => {
    setVoucherError('');
    if (subtotal < voucher.minOrder) {
      setVoucherError(`Đơn hàng cần đạt tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này.`);
      return;
    }
    setSelectedVoucher(voucher);
    setVoucherSuccessMsg(`Đã áp dụng mã "${voucher.code}"`);
    setShowVoucherModal(false);
    setTimeout(() => setVoucherSuccessMsg(''), 3000);
  };

  const handleApplyCustomCode = () => {
    setVoucherError('');
    if (!customVoucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      return;
    }
    const code = customVoucherCode.trim().toUpperCase();
    const found = VOUCHER_WALLET.find(v => v.code === code);
    if (!found) {
      setVoucherError(`Mã "${code}" không hợp lệ hoặc đã hết hạn.`);
      return;
    }
    handleApplyVoucher(found);
  };

  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherSuccessMsg('');
    setVoucherError('');
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
        setProvincesList(VIETNAM_PROVINCES);
      } catch {
        setProvincesList(VIETNAM_PROVINCES);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Xử lý khi chọn Tỉnh/Thành -> Tải danh sách Quận/Huyện tương ứng
  const handleProvinceChange = async (provinceName: string) => {
    setNewProvince(provinceName);
    setNewDistrict('');
    setNewWard('');
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
    setNewDistrict(districtName);
    setNewWard('');
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

  const handleOpenAddModal = () => {
    setNewReceiverName(currentUser?.fullName || '');
    setNewPhone(currentUser?.phone || '');
    setNewProvince('');
    setNewDistrict('');
    setNewWard('');
    setDistrictsList([]);
    setWardsList([]);
    setNewAddressDetail('');
    setNewAddressType('Nhà ở');
    setNewIsDefault(addresses.length === 0);
    setAddressModalError('');
    setShowAddAddressModal(true);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressModalError('');

    if (!newReceiverName.trim() || !newPhone.trim() || !newDistrict.trim() || !newWard.trim() || !newAddressDetail.trim()) {
      setAddressModalError('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }

    setIsSavingNewAddress(true);
    try {
      const payload = {
        userId: currentUser.userId,
        receiverName: newReceiverName.trim(),
        phone: newPhone.trim(),
        province: newProvince.trim(),
        district: newDistrict.trim(),
        ward: newWard.trim(),
        addressDetail: newAddressDetail.trim(),
        addressType: newAddressType,
        isDefault: newIsDefault || addresses.length === 0
      };

      const res = await fetch('http://localhost:5023/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Không thể lưu địa chỉ mới.');
      }

      const created: CustomerAddress = await res.json();
      await fetchAddresses(currentUser.userId);
      setSelectedAddressId(created.addressId);
      setShowAddAddressModal(false);
    } catch (err: any) {
      setAddressModalError(err.message || 'Lỗi lưu địa chỉ.');
    } finally {
      setIsSavingNewAddress(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    if (selectedAddressId === 'new') {
      setError('Vui lòng chọn hoặc thêm địa chỉ nhận hàng.');
      return;
    }

    const currentSelected = addresses.find(a => a.addressId === selectedAddressId);
    if (!currentSelected) {
      setError('Vui lòng chọn địa chỉ giao hàng hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => {
        const rawPrice = item.product.price.replace(/[^\d]/g, '');
        const unitPrice = parseInt(rawPrice, 10) || 0;
        return {
          productId: item.product.id,
          quantity: item.qty,
          unitPrice: unitPrice,
          discountAmount: 0
        };
      });

      const payload = {
        customerId: currentUser.userId,
        subtotal: subtotal,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
        addressId: currentSelected.addressId,
        orderItems: orderItems
      };

      const res = await fetch('http://localhost:5023/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }

      const orderData = await res.json();
      setCreatedOrder(orderData);
      setFinalPayAmount(orderData.totalAmount || totalAmount);
      localStorage.removeItem('cart');
      setCart([]);

      if (paymentMethod === 'BANK' || paymentMethod === 'MOMO') {
        setShowQrModal(true);
      } else {
        router.push('/orders');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đặt hàng. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const toVND = (num: number) => num.toLocaleString('vi-VN') + ' ₫';
  const totalItemsCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      {/* ── HEADER ── */}
      <header>
        {/* TẦNG 1: TOP BAR */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch VietGAP &amp; Hữu cơ</span>
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
                  <button className={lang === 'vi' ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang('en')}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2: MAIN HEADER */}
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

          <div className="search-shell">
            <input 
              type="text" 
              placeholder="Tìm kiếm nông sản sạch..." 
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

          <div className="header-actions">
            {/* Tài khoản */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="header-action-item" 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
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
                  <span className="header-action-label">{currentUser ? 'Xin chào,' : 'Tài khoản'}</span>
                  <span className="header-action-value" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : 'Đăng nhập'}
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
                  {currentUser ? (
                    <>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
                        <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{currentUser.fullName}</div>
                        <div style={{ marginTop: '2px' }}>{currentUser.email}</div>
                      </div>
                      <Link 
                        href="/profile"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: '500',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        Hồ sơ &amp; Sổ địa chỉ
                      </Link>
                      <Link 
                        href="/orders"
                        style={{
                          display: 'block',
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
                          color: '#dc2626',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Đăng nhập
                      </Link>
                      <Link 
                        href="/register"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: 'var(--green-700)',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Đăng ký thành viên
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Giỏ Hàng */}
            <div 
              className={`header-cart-btn ${cartBounce ? 'bounce' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
              onClick={() => setIsDrawerOpen(true)}
              title="Xem giỏ hàng"
            >
              <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><span className="badge">{totalItemsCount}</span>
              </div>
              <div className="header-action-text">
                <span className="header-action-label">Giỏ hàng</span>
                <span className="header-action-value" style={{ color: 'var(--green-900)' }}>
                  {toVND(subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 3: SUB-NAVBAR */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">Trang chủ</Link>
              <Link href="/products" className="subnav-link">Tất cả nông sản</Link>
              <Link href="/combos" className="subnav-link">Combo định kỳ</Link>
              <Link href="/traceability" className="subnav-link">Truy xuất nguồn gốc</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── NỘI DUNG CHÍNH TRANG CHECKOUT (THIẾT KẾ ĐƠN GIẢN, TINH GỌN, DỄ ĐỌC) ── */}
      <main style={{ minHeight: '80vh', padding: '32px 0 60px', backgroundColor: '#f8fafc' }}>
        <div className="wrap">
          {/* Breadcrumb quay lại */}
          <div style={{ marginBottom: '16px' }}>
            <Link 
              href="/products" 
              style={{ color: '#475569', textDecoration: 'none', fontSize: '13.5px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 24px 0', letterSpacing: '-0.3px' }}>
            Thanh toán đơn hàng
          </h1>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '28px', alignItems: 'start' }}>
            {/* CỘT TRÁI: ĐỊA CHỈ & PHƯƠNG THỨC THANH TOÁN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. ĐỊA CHỈ NHẬN HÀNG */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    1. Địa chỉ nhận hàng
                  </h2>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    + Thêm địa chỉ mới
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13.5px' }}>
                    Đang tải danh sách địa chỉ...
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontWeight: '600', color: '#334155', marginBottom: '4px', fontSize: '14px' }}>
                      Chưa có địa chỉ giao hàng
                    </div>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 14px 0' }}>
                      Vui lòng thêm địa chỉ nhận hàng để tiếp tục đặt đơn.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      style={{
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Thêm địa chỉ ngay
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      const isCompany = addr.addressType === 'Công ty';

                      return (
                        <div
                          key={addr.addressId}
                          onClick={() => setSelectedAddressId(addr.addressId)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.addressId)}
                              style={{ accentColor: '#15803d', marginTop: '3px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                                  {addr.receiverName}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>|</span>
                                <span style={{ color: '#475569', fontSize: '13.5px' }}>
                                  {addr.phone}
                                </span>

                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569'
                                }}>
                                  {isCompany ? 'Công ty' : 'Nhà ở'}
                                </span>

                                {addr.isDefault && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534'
                                  }}>
                                    Mặc định
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.45' }}>
                                {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. PHƯƠNG THỨC THANH TOÁN */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
                  2. Phương thức thanh toán
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* COD */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: paymentMethod === 'COD' ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === 'COD' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      style={{ accentColor: '#15803d', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        Kiểm tra hàng tươi sạch và thanh toán tiền mặt trực tiếp khi giao tới.
                      </div>
                    </div>
                  </label>

                  {/* Chuyển khoản VietQR */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: paymentMethod === 'BANK' ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === 'BANK' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK"
                      checked={paymentMethod === 'BANK'}
                      onChange={() => setPaymentMethod('BANK')}
                      style={{ accentColor: '#15803d', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        Chuyển khoản Ngân hàng (VietQR)
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        Quét mã QR chuyển khoản nhanh 24/7 qua ứng dụng của bất kỳ ngân hàng nào (TPBank).
                      </div>
                    </div>
                  </label>

                  {/* Ví MoMo */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: paymentMethod === 'MOMO' ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === 'MOMO' ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      style={{ accentColor: '#15803d', marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        Ví điện tử MoMo
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        Quét mã QR thanh toán nhanh chóng qua ứng dụng Ví MoMo.
                      </div>
                    </div>
                  </label>
                </div>

                {/* Nút đặt hàng */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0 || addresses.length === 0}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    backgroundColor: (loading || cart.length === 0 || addresses.length === 0) ? '#94a3b8' : '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: (loading || cart.length === 0 || addresses.length === 0) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {loading ? 'Đang xử lý đặt hàng...' : `Đặt hàng (${toVND(totalAmount)})`}
                </button>
              </div>

            </div>

            {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ GIẢM GIÁ */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
                Đơn hàng ({totalItemsCount} món)
              </h2>
              
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '13.5px' }}>
                  Giỏ hàng của bạn đang trống.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundColor: '#f8fafc',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}>
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80'} 
                          alt={item.product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {item.product.price} {item.product.unit}
                        </div>
                      </div>
                      {/* Điều chỉnh số lượng */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#fff' }}>
                        <button 
                          type="button"
                          onClick={() => updateCartQty(item.product.id, -1)}
                          style={{ border: 'none', background: 'none', padding: '3px 7px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}
                        >-</button>
                        <span style={{ padding: '0 6px', fontSize: '12.5px', fontWeight: '600', minWidth: '16px', textAlign: 'center', color: '#0f172a' }}>
                          {item.qty}
                        </span>
                        <button 
                          type="button"
                          onClick={() => updateCartQty(item.product.id, 1)}
                          style={{ border: 'none', background: 'none', padding: '3px 7px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}
                        >+</button>
                      </div>
                      {/* Nút xóa */}
                      <button 
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px', padding: '4px', marginLeft: '4px' }}
                        title="Xóa món này"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Khối Mã giảm giá */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Mã giảm giá</span>
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(true)}
                    style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                  >
                    Xem mã có sẵn →
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customVoucherCode}
                    onChange={(e) => setCustomVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã ưu đãi..."
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomCode}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#334155',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Áp dụng
                  </button>
                </div>

                {voucherError && (
                  <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>
                    {voucherError}
                  </div>
                )}

                {selectedVoucher && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px',
                    padding: '8px 10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ fontSize: '12.5px' }}>
                      <strong style={{ color: '#15803d' }}>{selectedVoucher.code}</strong> - {selectedVoucher.title}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {/* Chi tiết chi phí */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#64748b' }}>
                  <span>Tạm tính tiền hàng</span>
                  <span style={{ color: '#0f172a', fontWeight: '500' }}>{toVND(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#64748b' }}>
                  <span>Phí vận chuyển tiêu chuẩn</span>
                  <span style={{ color: '#0f172a', fontWeight: '500' }}>{toVND(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#15803d', fontWeight: '600' }}>
                    <span>Giảm giá ({selectedVoucher?.code})</span>
                    <span>-{toVND(discountAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                  <span>Tổng thanh toán</span>
                  <span style={{ color: '#15803d', fontSize: '18px' }}>{toVND(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL THÊM ĐỊA CHỈ MỚI ── */}
      {showAddAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                Thêm địa chỉ nhận hàng
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {addressModalError && (
              <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '14px', border: '1px solid #fecaca' }}>
                {addressModalError}
              </div>
            )}

            <form onSubmit={handleSaveNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                  Loại địa chỉ
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setNewAddressType('Nhà ở')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: newAddressType === 'Nhà ở' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                      backgroundColor: newAddressType === 'Nhà ở' ? '#f0fdf4' : '#ffffff',
                      color: newAddressType === 'Nhà ở' ? '#15803d' : '#475569',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Nhà ở
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAddressType('Công ty')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: newAddressType === 'Công ty' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                      backgroundColor: newAddressType === 'Công ty' ? '#f0fdf4' : '#ffffff',
                      color: newAddressType === 'Công ty' ? '#15803d' : '#475569',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Công ty
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                    Họ tên người nhận *
                  </label>
                  <input
                    type="text"
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0912345678"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    value={newProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">{loadingProvinces ? 'Đang tải tỉnh...' : '-- Chọn Tỉnh --'}</option>
                    {provincesList.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                    Quận / Huyện *
                  </label>
                  {districtsList.length > 0 ? (
                    <select
                      value={newDistrict}
                      disabled={!newProvince || loadingDistricts}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: !newProvince ? '#f1f5f9' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !newProvince ? 0.6 : 1,
                        cursor: !newProvince ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">
                        {!newProvince ? '-- Chọn Tỉnh trước --' : loadingDistricts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}
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
                      value={newDistrict}
                      disabled={!newProvince}
                      onChange={(e) => {
                        setNewDistrict(e.target.value);
                        setNewWard('');
                      }}
                      placeholder={!newProvince ? 'Chọn Tỉnh trước' : loadingDistricts ? 'Đang tải...' : 'Nhập Quận/Huyện'}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: !newProvince ? '#f1f5f9' : '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !newProvince ? 0.6 : 1
                      }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                    Phường / Xã *
                  </label>
                  {wardsList.length > 0 ? (
                    <select
                      value={newWard}
                      disabled={!newDistrict || loadingWards}
                      onChange={(e) => setNewWard(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: !newDistrict ? '#f1f5f9' : '#ffffff',
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !newDistrict ? 0.6 : 1,
                        cursor: !newDistrict ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">
                        {!newDistrict ? '-- Chọn Huyện trước --' : loadingWards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}
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
                      value={newWard}
                      disabled={!newDistrict}
                      onChange={(e) => setNewWard(e.target.value)}
                      placeholder={!newDistrict ? 'Chọn Huyện trước' : loadingWards ? 'Đang tải...' : 'Nhập Phường/Xã'}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: !newDistrict ? '#f1f5f9' : '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                        opacity: !newDistrict ? 0.6 : 1
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                  Địa chỉ chi tiết (Số nhà, tên đường) *
                </label>
                <input
                  type="text"
                  value={newAddressDetail}
                  onChange={(e) => setNewAddressDetail(e.target.value)}
                  placeholder="123 Lê Lợi..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    style={{ accentColor: '#15803d', width: '15px', height: '15px' }}
                  />
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewAddress}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: isSavingNewAddress ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSavingNewAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL MÃ GIẢM GIÁ CÓ SẴN ── */}
      {showVoucherModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '22px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                Mã giảm giá có sẵn
              </h3>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {VOUCHER_WALLET.map(v => {
                const isEligible = subtotal >= v.minOrder;
                const isSelected = selectedVoucher?.code === v.code;

                return (
                  <div
                    key={v.code}
                    style={{
                      border: isSelected ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      backgroundColor: isSelected ? '#f0fdf4' : (isEligible ? '#ffffff' : '#f8fafc'),
                      opacity: isEligible ? 1 : 0.6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '11.5px'
                        }}>
                          {v.code}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                          {v.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {v.description}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Đơn tối thiểu {v.minOrder.toLocaleString('vi-VN')}₫ • HSD: {v.expiryDate}
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #fca5a5',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: '500',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Bỏ chọn
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!isEligible}
                          onClick={() => handleApplyVoucher(v)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isEligible ? '#15803d' : '#cbd5e1',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: isEligible ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Dùng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL QR CODE THANH TOÁN (THIẾT KẾ ĐƠN GIẢN, DỄ ĐỌC, CHUẨN XÁC) ── */}
      {showQrModal && (() => {
        const payAmount = finalPayAmount || createdOrder?.totalAmount || totalAmount;
        const orderCode = createdOrder?.orderCode || 'DH-ORDER';

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '430px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px 20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              position: 'relative'
            }}>
              
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                {paymentMethod === 'MOMO' ? 'Thanh toán qua Ví MoMo' : 'Thanh toán chuyển khoản VietQR'}
              </h3>
              
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                Mã đơn: <strong style={{ color: '#0f172a' }}>#{orderCode}</strong>
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
                Số tiền: <strong style={{ color: '#15803d', fontSize: '15px' }}>{toVND(payAmount)}</strong>
              </div>

              {/* Đếm ngược thời gian */}
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: isQrExpired ? '#fee2e2' : '#f1f5f9',
                color: isQrExpired ? '#991b1b' : '#334155',
                fontSize: '12.5px',
                fontWeight: '500',
                marginBottom: '16px'
              }}>
                {isQrExpired ? (
                  <span>Mã QR đã hết hạn</span>
                ) : (
                  <span>
                    Hiệu lực thanh toán còn:{' '}
                    <strong style={{ fontFamily: 'monospace', fontSize: '13.5px', color: '#0f172a' }}>
                      {Math.floor(qrSecondsLeft / 60).toString().padStart(2, '0')}:{(qrSecondsLeft % 60).toString().padStart(2, '0')}
                    </strong>
                  </span>
                )}
              </div>

              {/* Khung QR Code */}
              {isQrExpired ? (
                <div style={{
                  padding: '24px 16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '10px',
                  border: '1px dashed #fca5a5',
                  marginBottom: '16px'
                }}>
                  <div style={{ color: '#991b1b', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
                    Mã thanh toán đã hết thời gian (10 phút)
                  </div>
                  <p style={{ color: '#64748b', fontSize: '12.5px', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                    Đơn hàng của bạn vẫn được lưu. Bạn có thể tạo mã mới để tiếp tục chuyển tiền.
                  </p>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    style={{
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Tạo mã QR mới
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'inline-block'
                  }}>
                    <img
                      src={paymentMethod === 'MOMO'
                        ? ('https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=' + encodeURIComponent('2|99|0942367010|BUI QUOC HUNG|lanhfarm@momo|0|0|' + Math.round(payAmount) + '|' + orderCode))
                        : ('https://img.vietqr.io/image/TPB-00002120078-compact2.png?amount=' + Math.round(payAmount) + '&addInfo=' + encodeURIComponent(orderCode) + '&accountName=' + encodeURIComponent('BÙI QUỐC HÙNG'))}
                      alt="Mã QR thanh toán"
                      style={{ width: '200px', height: 'auto', display: 'block' }}
                    />
                  </div>

                  {/* Thông tin tài khoản nhận tiền */}
                  <div style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12.5px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {paymentMethod === 'MOMO' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Ví điện tử:</span>
                          <strong style={{ color: '#0f172a' }}>Ví MoMo</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Số điện thoại:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '13px' }}>0942 367 010</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy('0942367010', 'phone')}
                              style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              {copiedField === 'phone' ? 'Đã chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Chủ ví:</span>
                          <strong style={{ color: '#0f172a' }}>BÙI QUỐC HÙNG</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Số tiền:</span>
                          <strong style={{ color: '#15803d', fontSize: '13.5px' }}>{toVND(payAmount)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Lời nhắn:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{orderCode}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(orderCode, 'code')}
                              style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              {copiedField === 'code' ? 'Đã chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                          <strong style={{ color: '#0f172a' }}>TPBank (Ngân hàng Tiên Phong)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '13px' }}>0000 2120 078</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy('00002120078', 'stk')}
                              style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              {copiedField === 'stk' ? 'Đã chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                          <strong style={{ color: '#0f172a' }}>BÙI QUỐC HÙNG</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Số tiền:</span>
                          <strong style={{ color: '#15803d', fontSize: '13.5px' }}>{toVND(payAmount)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{orderCode}</strong>
                            <button
                              type="button"
                              onClick={() => handleCopy(orderCode, 'code')}
                              style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              {copiedField === 'code' ? 'Đã chép' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                Mở ứng dụng {paymentMethod === 'MOMO' ? 'MoMo' : 'ngân hàng'} để quét mã QR và xác nhận chuyển tiền.
              </p>

              {/* Nút hành động duy nhất */}
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  router.push('/orders');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Tôi đã hoàn tất chuyển tiền
              </button>
            </div>
          </div>
        );
      })()}

      {/* FOOTER */}
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
            <div className="drawer-head" style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>Giỏ hàng của bạn</h3>
              <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="drawer-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {cart.length === 0 ? (
                <div className="drawer-empty" style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '40px 0' }}>Giỏ hàng đang trống.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} className="drawer-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="thumb" style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80'} 
                          alt={item.product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div className="info" style={{ flex: 1 }}>
                        <b style={{ display: 'block', fontSize: '14px', color: 'var(--ink)' }}>{item.product.name}</b>
                        <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{item.product.price} {item.product.unit}</span>
                        <div className="qty-ctrl" style={{ display: 'flex', alignItems: 'center', marginTop: '6px', border: '1px solid var(--line)', borderRadius: '4px', width: 'fit-content' }}>
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
            <div className="drawer-foot" style={{ padding: '20px', borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface)' }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold', color: 'var(--ink)' }}>
                <span>Tạm tính</span>
                <span>{toVND(subtotal)}</span>
              </div>
              <button 
                className="btn btn-accent" 
                onClick={() => { setIsDrawerOpen(false); }}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Đóng
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
