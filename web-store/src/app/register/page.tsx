'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    unit: string;
    category?: string;
    imageUrl?: string;
    icon?: string;
  };
  qty: number;
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Header, theme, cart, search đồng bộ 100%
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Trạng thái Modal OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [otpModalMsg, setOtpModalMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {}
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Đóng dropdown tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
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
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
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
  const totalItemsCount = cart.reduce((s, i) => s + i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  // Validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;

  const handleOpenOtpModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setOtpModalMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (!nameRegex.test(fullName.trim()) || fullName.trim().length < 2) {
      setError('Họ và tên chỉ được chứa chữ cái và tối thiểu từ 2 ký tự.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError('Định dạng Email không hợp lệ (Ví dụ: example@gmail.com).');
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ (phải đủ 10 số, đầu số 03, 05, 07, 08, 09).');
      return;
    }

    if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Mật khẩu phải tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    setShowOtpModal(true);
    setOtpCode('');
  };

  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    setOtpModalMsg(null);
    try {
      const recipient = otpMethod === 'EMAIL' ? email.trim() : phone.trim();
      const res = await fetch('http://localhost:5023/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, type: otpMethod })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Không thể gửi mã OTP.');
      }

      setTimer(60);
      setOtpModalMsg({
        type: 'success',
        text: `Đã gửi mã OTP xác thực tới ${recipient}`
      });
    } catch (err: any) {
      setOtpModalMsg({
        type: 'error',
        text: err.message || 'Lỗi gửi mã OTP. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmRegister = async () => {
    if (otpCode.trim().length !== 6) {
      setOtpModalMsg({
        type: 'error',
        text: 'Vui lòng nhập đủ 6 chữ số mã OTP.'
      });
      return;
    }

    setLoading(true);
    setOtpModalMsg(null);
    try {
      const res = await fetch('http://localhost:5023/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          otp: otpCode.trim(),
          verifyMethod: otpMethod
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      setShowOtpModal(false);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setOtpModalMsg({
        type: 'error',
        text: err.message || 'Có lỗi khi xác thực mã OTP.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung</a>

      {/* ── HEADER 3 TẦNG ĐỒNG BỘ 100% ── */}
      <header>
        {/* TẦNG 1: TOP BAR TIỆN ÍCH */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP &amp; Hữu cơ</span>
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

          <div className="search-shell" style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Bạn muốn tìm nông sản gì? (Rau cải, bơ sáp, dâu tây...)" 
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
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                listStyle: 'none',
                padding: 0,
                margin: '4px 0 0 0',
                zIndex: 999,
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                textAlign: 'left'
              }}>
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
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <img 
                      src={s.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=80&h=80&q=80'} 
                      alt={s.productName} 
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{s.productName}</strong>
                      <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                        {s.price.toLocaleString('vi-VN')}₫<span style={{ color: 'var(--ink-soft)', fontWeight: 'normal' }}> / {s.unit}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                  {toVND(totalCart)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 3: SUB-NAVBAR 4 MỤC CHÍNH */}
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

      {/* ── NỘI DUNG FORM ĐĂNG KÝ (TỐI GIẢN, RÕ RÀNG) ── */}
      <main id="main" style={{ minHeight: 'calc(100vh - 400px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', backgroundColor: '#f8fafc' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          width: '100%',
          maxWidth: '460px',
          padding: '32px 28px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
              Đăng ký tài khoản
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
              Trở thành thành viên của LÀNH Farm để nhận nhiều ưu đãi
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '18px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '18px',
              fontSize: '13px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleOpenOtpModal}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Họ và tên *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Mật khẩu *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự gồm chữ và số"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    paddingRight: '38px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Nhập lại mật khẩu *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu để xác nhận"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Tiếp tục xác thực OTP
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: '#15803d', fontWeight: '600', textDecoration: 'none' }}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </main>

      {/* ── MODAL XÁC THỰC OTP ĐĂNG KÝ (THIẾT KẾ PHẲNG, GỌN GÀNG) ── */}
      {showOtpModal && (
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
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '430px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Xác thực mã OTP
              </h3>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
              Chọn phương thức nhận mã OTP để hoàn tất tạo tài khoản.
            </p>

            {otpModalMsg && (
              <div style={{
                backgroundColor: otpModalMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${otpModalMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                color: otpModalMsg.type === 'error' ? '#991b1b' : '#166534',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '14px',
                fontSize: '12.5px'
              }}>
                {otpModalMsg.text}
              </div>
            )}

            {/* Chọn hình thức gửi */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setOtpMethod('EMAIL')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: otpMethod === 'EMAIL' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: otpMethod === 'EMAIL' ? '#f0fdf4' : '#ffffff',
                  color: otpMethod === 'EMAIL' ? '#15803d' : '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Email ({email})
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('SMS')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: otpMethod === 'SMS' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                  backgroundColor: otpMethod === 'SMS' ? '#f0fdf4' : '#ffffff',
                  color: otpMethod === 'SMS' ? '#15803d' : '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                SMS ({phone})
              </button>
            </div>

            {/* Nút gửi mã OTP */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSendingOtp || timer > 0}
                style={{
                  width: '100%',
                  padding: '9px',
                  backgroundColor: timer > 0 ? '#f1f5f9' : '#334155',
                  color: timer > 0 ? '#64748b' : '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: (isSendingOtp || timer > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {timer > 0 ? `Gửi lại sau (${timer}s)` : (isSendingOtp ? 'Đang gửi...' : 'Gửi mã OTP xác thực')}
              </button>
            </div>

            {/* Ô nhập 6 số OTP */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Nhập mã OTP 6 chữ số
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '18px',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontWeight: '700',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRegister}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER CHUẨN ĐỒNG BỘ 4 CỘT ── */}
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

      {/* ── CART DRAWER ĐỒNG BỘ ── */}
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
                      <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa" style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#dc2626' }}>
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
                <span>{toVND(totalCart)}</span>
              </div>
              <button 
                className="btn btn-accent" 
                onClick={() => {
                  setIsDrawerOpen(false);
                  router.push('/checkout');
                }}
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
