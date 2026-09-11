'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type CartItem = {
  product: {
    id: number;
    name: string;
    price: string;
    unit: string;
    category: string;
    cert: string;
    region: string;
    rating: number;
    reviews: number;
    icon: string;
    lot: string;
    imageUrl?: string;
  };
  qty: number;
};

const subPlans: Record<string, Array<{
  id: number;
  name: string;
  desc: string;
  price: string;
  rawPrice: number;
  badge?: string;
  features: string[];
  sampleItems: string[];
  imageUrl: string;
}>> = {
  week: [
    {
      id: 901,
      name: 'Combo Gia Đình Nhỏ (Tuần)',
      desc: 'Phù hợp gia đình 2–3 người nấu ăn mỗi ngày',
      price: '189.000₫',
      rawPrice: 189000,
      badge: 'Phổ biến nhất',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      features: [
        '4 loại rau ăn lá & củ quả theo mùa',
        '2 loại trái cây tươi thu hoạch trong ngày',
        'Giao 1 lần / tuần vào thứ 3 hoặc thứ 6',
        'Miễn phí đổi món trước 24h'
      ],
      sampleItems: ['Cải bó xôi (300g)', 'Cà rốt baby (500g)', 'Xà lách xoăn (250g)', 'Bí đỏ hồ lô (1 quả)', 'Cam Cao Phong (1kg)', 'Bơ 034 (1kg)']
    },
    {
      id: 902,
      name: 'Combo Gia Đình Lớn (Tuần)',
      desc: 'Đáp ứng khẩu phần cho gia đình 4–6 thành viên',
      price: '329.000₫',
      rawPrice: 329000,
      badge: 'Tiết kiệm 15%',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      features: [
        '7 loại rau xanh hữu cơ đa dạng',
        '3 loại trái cây VietGAP & GlobalGAP',
        'Tặng kèm 1 vỉ trứng gà ta thảo mộc',
        'Giao định kỳ tận bếp đúng giờ hẹn'
      ],
      sampleItems: ['Cải ngọt hữu cơ (500g)', 'Súp lơ xanh (1 búp)', 'Cà chua bi Cherry (300g)', 'Bắp cải giòn (1 bắp)', 'Khoai lang mật (1kg)', 'Đậu que Nhật (400g)', 'Dưa chuột baby (500g)', 'Dâu tây Mộc Châu (250g)', 'Bưởi da xanh (1 quả)', 'Xoài cát Hòa Lộc (1kg)']
    },
    {
      id: 903,
      name: 'Combo Thuần Chay Sạch (Tuần)',
      desc: 'Giàu đạm thực vật, vitamin & khoáng chất',
      price: '249.000₫',
      rawPrice: 249000,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      features: [
        '6 loại rau củ & nấm tươi hữu cơ',
        '2 loại hạt dinh dưỡng / ngũ cốc đặc sản',
        'Đạt chuẩn hữu cơ 100% không phân hóa học',
        'Kèm thực đơn gợi ý món chay ngon mỗi ngày'
      ],
      sampleItems: ['Nấm đùi gà tươi (200g)', 'Nấm bào ngư xám (250g)', 'Đậu hũ non hữu cơ (2 hộp)', 'Củ dền đỏ (500g)', 'Cải kale xoăn (300g)', 'Hạt sen tươi Huế (250g)', 'Gạo lứt đỏ ST (1kg)', 'Chuối laba Đà Lạt (1 nải)']
    }
  ],
  month: [
    {
      id: 904,
      name: 'Combo Gia Đình Nhỏ (Tháng)',
      desc: 'Giao 4 đợt / tháng — Tươi mới mỗi tuần',
      price: '680.000₫',
      rawPrice: 68000,
      badge: 'Tiết kiệm 10%',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      features: [
        'Giao 4 lần / tháng (mỗi tuần 1 giỏ tươi)',
        'Tổng cộng 16 phần rau + 8 phần trái cây',
        'Linh hoạt dời lịch khi bận / đi công tác',
        'Freeship toàn bộ 4 lượt giao hàng'
      ],
      sampleItems: ['Thực đơn xoay vòng 4 tuần không trùng lặp', 'Có thể tùy chỉnh theo sở thích gia đình']
    },
    {
      id: 905,
      name: 'Combo Gia Đình Lớn (Tháng)',
      desc: 'Chăm sóc sức khỏe cả nhà trọn vẹn cả tháng',
      price: '1.180.000₫',
      rawPrice: 1180000,
      badge: 'Tiết kiệm 18%',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      features: [
        'Giao 4 lần / tháng đầy ắp nông sản thượng hạng',
        'Tổng cộng 28 phần rau + 12 phần trái cây + 4 vỉ trứng',
        'Ưu tiên giữ các mặt hàng đặc sản vụ mùa hiếm',
        'Hỗ trợ đổi rau theo mùa không phụ phí'
      ],
      sampleItems: ['Giao tận nhà vào khung giờ bạn chọn', 'Quét mã QR truy xuất từng mẻ giao']
    },
    {
      id: 906,
      name: 'Combo Thuần Chay Sạch (Tháng)',
      desc: 'Thanh lọc cơ thể, dinh dưỡng bền vững',
      price: '895.000₫',
      rawPrice: 895000,
      badge: 'Tiết kiệm 12%',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      features: [
        'Giao 4 lần / tháng, rau củ nấm tươi mới hái',
        'Tặng kèm 1 hũ mật ong hoa rừng nguyên chất',
        'Cung cấp đủ dinh dưỡng cho người ăn chay trường',
        'Được chuyên gia tư vấn dinh dưỡng trực tiếp'
      ],
      sampleItems: ['Đa dạng các loại nấm sạch và đậu hạt', 'Rau củ giàu sắt và chất xơ hòa tan']
    }
  ]
};

export default function CombosPage() {
  const router = useRouter();
  const [subFreq, setSubFreq] = useState<'week' | 'month'>('week');
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');

  // Tài khoản
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  const handleAddComboToCart = (plan: any) => {
    const comboProduct = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      unit: subFreq === 'week' ? '/ Tuần' : '/ Tháng',
      category: 'Combo',
      cert: 'VietGAP & Hữu cơ',
      region: 'Đà Lạt & Mộc Châu',
      rating: 5.0,
      reviews: 95,
      icon: 'box',
      lot: 'LOT#VN-COMBO-' + plan.id,
      imageUrl: plan.imageUrl
    };

    setCart(prev => {
      const existing = prev.find(x => x.product.id === plan.id);
      if (existing) {
        return prev.map(x => (x.product.id === plan.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { product: comboProduct, qty: 1 }];
    });

    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setIsDrawerOpen(true);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev =>
      prev.map(x => {
        if (x.product.id === id) {
          return { ...x, qty: Math.max(1, x.qty + delta) };
        }
        return x;
      })
    );
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(x => x.product.id !== id));

  const totalCart = cart.reduce((s, i) => s + parseInt(i.product.price.replace(/[^\d]/g, ''), 10) * i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const handleGoToCheckout = () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước khi thực hiện thanh toán!');
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }
    setIsDrawerOpen(false);
    router.push('/checkout');
  };

  return (
    <>
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
                  <button className={lang === 'vi' ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)} onClick={() => setLang('en')}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TẦNG 2: MAIN HEADER ── */}
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
              placeholder="Tìm kiếm sản phẩm, nông sản tươi..." 
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
            <div style={{ position: 'relative' }} ref={dropdownRef}>
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

            {/* Nút Giỏ Hàng nổi bật */}
            <div 
              className={`header-cart-btn ${cartBounce ? 'bounce' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
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
              <Link href="/combos" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>
                Combo định kỳ
              </Link>
              <Link href="/traceability" className="subnav-link">
                Truy xuất nguồn gốc
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: '80vh', paddingBottom: '70px' }}>
        {/* Banner Tiêu đề */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-900) 0%, #164024 100%)',
          color: '#FFFFFF',
          padding: '40px 0',
          marginBottom: '32px',
          boxShadow: '0 4px 15px rgba(27, 58, 32, 0.15)'
        }}>
          <div className="wrap" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent)', fontWeight: 'bold' }}>
              Giải pháp đi chợ thông minh &amp; tiện lợi
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', margin: '10px 0', color: '#FFFFFF' }}>
              Combo Nông Sản Định Kỳ Tuần &amp; Tháng
            </h1>
            <p style={{ margin: '0 auto', fontSize: '15px', opacity: 0.9, maxWidth: '650px', lineHeight: '1.6' }}>
              Không còn lo lắng "Hôm nay ăn gì?", LÀNH tự động tuyển chọn rau củ quả tươi nhất từ vườn, đóng gói cẩn thận và giao tận cửa theo đúng lịch hẹn của bạn.
            </p>

            {/* Toggle Chuyển đổi Tuần / Tháng */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '4px',
              borderRadius: '999px',
              marginTop: '24px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <button
                onClick={() => setSubFreq('week')}
                style={{
                  padding: '8px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: subFreq === 'week' ? '#FFFFFF' : 'transparent',
                  color: subFreq === 'week' ? 'var(--green-900)' : '#FFFFFF'
                }}
              >
                Giao Theo Tuần
              </button>
              <button
                onClick={() => setSubFreq('month')}
                style={{
                  padding: '8px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: subFreq === 'month' ? '#FFFFFF' : 'transparent',
                  color: subFreq === 'month' ? 'var(--green-900)' : '#FFFFFF'
                }}
              >
                Gói Trọn Tháng (Tiết kiệm hơn)
              </button>
            </div>
          </div>
        </div>

        <div className="wrap">
          {/* Lưới các gói Combo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            marginBottom: '48px'
          }}>
            {subPlans[subFreq].map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '20px',
                  border: plan.badge ? '2px solid var(--green-700)' : '1px solid var(--line)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Badge nếu có */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'var(--accent)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 2,
                    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)'
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Hình ảnh đại diện */}
                <Link href={`/combos/${plan.id}`} style={{ height: '180px', overflow: 'hidden', position: 'relative', display: 'block', textDecoration: 'none' }}>
                  <img
                    src={plan.imageUrl}
                    alt={plan.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                    padding: '16px 20px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{plan.name}</h3>
                  </div>
                </Link>

                {/* Nội dung chi tiết */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 16px 0', minHeight: '38px' }}>
                    {plan.desc}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green-900)' }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                      {subFreq === 'week' ? ' / tuần' : ' / tháng (4 lần giao)'}
                    </span>
                  </div>

                  {/* Danh sách quyền lợi */}
                  <div style={{ marginBottom: '20px', flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--green-700)', marginBottom: '10px' }}>
                      Quyền lợi gói:
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: 'var(--ink)' }}>
                          <span style={{ color: 'var(--green-700)', fontWeight: 'bold' }}>✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Thực đơn mẫu */}
                  <div style={{
                    backgroundColor: 'var(--bg)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>Thành phần dự kiến:</div>
                    <div style={{ color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                      {plan.sampleItems.join(' · ')}
                    </div>
                  </div>

                  {/* Nhóm nút tác vụ: Xem chi tiết & Đặt gói */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link
                      href={`/combos/${plan.id}`}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--green-700)',
                        backgroundColor: '#ffffff',
                        color: 'var(--green-700)',
                        fontWeight: '700',
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      onClick={() => handleAddComboToCart(plan)}
                      style={{
                        flex: 1.2,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '11px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'var(--green-700)',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(46,125,50,0.2)',
                        transition: 'all 0.2s'
                      }}
                    >
                      Đặt combo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phần Cam kết & Câu hỏi thường gặp */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '20px',
            border: '1px solid var(--line)',
            padding: '36px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--green-900)', textAlign: 'center', marginBottom: '24px' }}>
              Vì sao bạn nên chọn Combo Định Kỳ tại LÀNH Farm?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)' }}>Giao Đúng Lịch Hẹn</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                    Chọn ngày giao phù hợp (Thứ 3 hoặc Thứ 6), shipper giao đến tận bếp trước bữa cơm chiều.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)' }}>Đổi Món Linh Hoạt</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                    Nếu có món bé không thích ăn, bạn có thể báo trước 24 giờ để đổi sang loại rau quả khác có giá trị tương đương.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ fontSize: '28px' }}>⏸️</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)' }}>Tạm Dừng Bất Cứ Lúc Nào</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                    Đi du lịch hoặc về quê? Bạn có thể tạm dừng gói trong 1-2 tuần mà không bị mất quyền lợi hay mất phí.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: 'var(--ink)' }}>100% Truy Xuất Nguồn Gốc</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                    Mỗi combo đều có mã QR riêng gắn liền với nhật ký thu hoạch của từng hợp tác xã thành viên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {/* Cart Drawer */}
      <div className={`overlay ${isDrawerOpen ? 'show' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`} onClick={() => setIsDrawerOpen(false)}></div>
      <aside className={`drawer ${isDrawerOpen ? 'show' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`} aria-label="Giỏ hàng">
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
            onClick={handleGoToCheckout} 
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>
    </>
  );
}
