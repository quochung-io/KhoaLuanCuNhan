'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/layout/SearchBar';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Đồng bộ Header, Theme, Lang, User, Cart, Search với hệ thống LÀNH Farm
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

  // Đóng dropdown khi click ra ngoài
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
    localStorage.removeItem('auth_token');
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


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Vui lòng điền đầy đủ email/tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }

      localStorage.setItem('customer_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      const role = (data.user.role || '').toUpperCase();
      if (role === 'ADMIN') {
        window.location.href = 'http://localhost:5173/dashboard';
      } else if (role === 'SUPPLIER') {
        window.location.href = 'http://localhost:5174/dashboard';
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
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
                  <button className={lang === "vi" ? "active" : ''} onClick={() => setLang("vi")}>VI</button>
                  <button className={lang === "en" ? "active" : ''} onClick={() => setLang("en")}>EN</button>
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

          <SearchBar />

          <div className="header-actions">
            {/* Tài khoản */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                className="header-action-item" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                title="Tài khoản cá nhân"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div className="header-action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="header-action-text">
                  <span className="header-action-label">Tài khoản</span>
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
              className={`header-cart-btn ${cartBounce ? 'bounce' : ''}`}
              onClick={() => setIsDrawerOpen(true)}
              title="Xem giỏ hàng"
            >
              <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span className="badge">{totalItemsCount}</span>
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

      {/* ── BREADCRUMB NHẸ NHÀNG ── */}
      <div style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ padding: '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
            <Link href="/" style={{ color: 'var(--green-700)', fontWeight: '600', textDecoration: 'none' }}>
              Trang chủ
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '500' }}>Đăng nhập tài khoản</span>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH: SPLIT-SCREEN FARM SHOWCASE ĐỒNG BỘ TRANG CHỦ ── */}
      <main id="main" style={{ 
        minHeight: 'calc(100vh - 420px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '48px 20px', 
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(227, 241, 227, 0.45) 100%)' 
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(22, 36, 26, 0.08), 0 1px 3px rgba(22, 36, 26, 0.05)',
          border: '1px solid var(--line)',
          width: '100%',
          maxWidth: '1040px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))'
        }}>
          {/* CỘT TRÁI: HERO SHOWCASE NÔNG TRẠI LÀNH FARM */}
          <div style={{
            position: 'relative',
            background: `linear-gradient(180deg, rgba(27, 58, 32, 0.84) 0%, rgba(15, 36, 18, 0.94) 100%), url('/banners/farm_hero_banner_1789080079371.jpg') center/cover no-repeat`,
            color: '#ffffff',
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '560px'
          }}>
            {/* Phần trên: Badge & Tiêu đề thương hiệu */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.04em',
                marginBottom: '22px'
              }}>
                <span style={{ fontSize: '14px' }}>🌿</span>
                <span>NÔNG SẢN SẠCH CHUẨN VIETGAP &amp; HỮU CƠ</span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 3.2vw, 36px)',
                fontWeight: '700',
                lineHeight: '1.2',
                margin: '0 0 16px 0',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.25)'
              }}>
                Nông Sản Tươi LÀNH,<br />
                <span style={{ color: '#86efac' }}>Chuẩn Vị Từ Đất Mẹ.</span>
              </h2>

              <p style={{
                fontSize: '14.5px',
                lineHeight: '1.65',
                color: 'rgba(255, 255, 255, 0.88)',
                margin: '0 0 28px 0',
                maxWidth: '420px'
              }}>
                Kết nối trực tiếp hơn 120 nông trại hữu cơ Đà Lạt &amp; Mộc Châu. 
                Đăng nhập để nhận ưu đãi tích điểm và theo dõi đơn hàng tươi sạch tận nhà.
              </p>

              {/* 3 Cam kết vàng của LÀNH Farm */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    🚚
                  </div>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#ffffff' }}>Giao xe lạnh 2H</strong>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>Giữ nguyên độ tươi sương sớm mỗi ngày</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    🛡️
                  </div>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#ffffff' }}>Bảo hành 1 đổi 1</strong>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>Hoàn tiền 100% nếu nông sản dập úng</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    🎁
                  </div>
                  <div>
                    <strong style={{ fontSize: '13.5px', display: 'block', color: '#ffffff' }}>Đặc quyền LÀNH Rewards</strong>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>Tích điểm hoàn tiền 5% cho từng đơn hàng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần dưới: Customer Testimonial Card thu nhỏ */}
            <div style={{
              marginTop: '32px',
              padding: '16px 18px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ color: '#facc15', fontSize: '13px', letterSpacing: '2px' }}>★★★★★</div>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>15.000+ KH tin dùng</span>
              </div>
              <p style={{ fontSize: '12.5px', fontStyle: 'italic', margin: 0, color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.5' }}>
                &ldquo;Rau quả tại LÀNH Farm rất ngọt và tươi, củ quả nguyên cuống lá xanh mướt. Mình rất yên tâm nấu cho các bé.&rdquo;
              </p>
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#86efac', fontWeight: '600' }}>
                Nguyễn Minh Anh • Khách hàng thân thiết
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐĂNG NHẬP SANG TRỌNG & THÂN THIỆN */}
          <div style={{
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)'
          }}>
            {/* Header Form */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
                  <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
                  <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--green-900)', letterSpacing: '0.5px' }}>
                  LÀNH FARM
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: '700',
                color: 'var(--ink)',
                margin: '0 0 8px 0'
              }}>
                Chào mừng bạn trở lại!
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: '1.5' }}>
                Đăng nhập tài khoản để tiếp tục mua sắm &amp; tích lũy điểm thưởng.
              </p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Field 1: Email hoặc Tên đăng nhập */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: 'var(--ink)' 
                }}>
                  Email hoặc Tên đăng nhập
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-soft)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ví dụ: minhanh@gmail.com"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--green-700)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--line)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Field 2: Mật khẩu */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                    Mật khẩu
                  </label>
                  <Link 
                    href="/forgot-password" 
                    style={{ 
                      fontSize: '12.5px', 
                      color: 'var(--green-700)', 
                      fontWeight: '600', 
                      textDecoration: 'none' 
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ink-soft)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--ink)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--green-700)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--line)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--ink-soft)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
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

              {/* Tùy chọn: Ghi nhớ đăng nhập */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--green-700)', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '13px', color: 'var(--ink-soft)', cursor: 'pointer', userSelect: 'none' }}>
                  Ghi nhớ đăng nhập trên thiết bị này
                </label>
              </div>

              {/* Nút Đăng nhập chính */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: 'var(--green-700)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 18px rgba(46, 125, 50, 0.28)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.backgroundColor = 'var(--green-900)';
                    (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.backgroundColor = 'var(--green-700)';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                    </svg>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
            </form>

            {/* Phân cách */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0',
              color: 'var(--ink-soft)'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }}></div>
              <span style={{ padding: '0 12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                HOẶC
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line)' }}></div>
            </div>

            {/* Khối chuyển sang Đăng ký */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--line)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '13.5px', color: 'var(--ink-soft)', display: 'block', marginBottom: '6px' }}>
                Bạn chưa có tài khoản thành viên?
              </span>
              <Link
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--green-700)',
                  fontWeight: '700',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                <span>Đăng ký thành viên ngay</span>
                <span>→</span>
              </Link>
            </div>

            {/* Cam kết bảo mật ở đáy form */}
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '11.5px',
              color: 'var(--ink-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Thông tin được bảo mật 100% theo tiêu chuẩn chứng chỉ SSL</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER CHUẨN ĐỒNG BỘ 4 CỘT TRANG CHỦ ── */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="logo" style={{ color: 'var(--green-900)' }}>LÀNH</div>
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
                <li>1900 8899 (7:00–21:00)</li>
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
            <span>© 2026 LÀNH Farm — Hệ Thống Mua Bán Nông Sản &amp; Truy Xuất Nguồn Gốc.</span>
            <span>Chuẩn VietGAP &amp; Hữu Cơ Từ Vườn Đến Bàn Ăn.</span>
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
