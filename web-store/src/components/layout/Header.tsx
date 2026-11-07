'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/components/layout/Header.tsx
// MÔ TẢ: Component giao diện dùng chung (Header.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import SearchBar from './SearchBar';

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

type HeaderProps = {
  theme?: string;
  toggleTheme?: () => void;
  lang?: string;
  setLang?: (l: 'vi' | 'en') => void;
  cartCount?: number;
  totalCart?: number;
  setIsDrawerOpen?: (o: boolean) => void;
  cartBounce?: boolean;
  currentUser?: any;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  suggestions?: SuggestionItem[];
  showSuggestions?: boolean;
  setShowSuggestions?: (show: boolean) => void;
};

const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  lang = 'vi',
  setLang,
  cartCount,
  totalCart,
  setIsDrawerOpen,
  cartBounce = false,
  currentUser,
  onLogout,
}) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [localUser, setLocalUser] = useState<any>(null);
  const [localCartCount, setLocalCartCount] = useState<number>(0);
  const [localTotalCart, setLocalTotalCart] = useState<number>(0);
  const [localTheme, setLocalTheme] = useState<string>('light');
  const [localLang, setLocalLang] = useState<'vi' | 'en'>('vi');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('customer_user');
        if (u) setLocalUser(JSON.parse(u));

        const c = localStorage.getItem('cart');
        if (c) {
          const parsed = JSON.parse(c);
          if (Array.isArray(parsed)) {
            setLocalCartCount(parsed.reduce((s: number, i: any) => s + (i.qty || 1), 0));
            setLocalTotalCart(parsed.reduce((s: number, i: any) => {
              const p = i.product?.rawPrice || i.product?.price || i.price || 0;
              const numP = typeof p === 'string' ? parseInt(p.replace(/\D/g, ''), 10) || 0 : Number(p);
              return s + (numP * (i.qty || 1));
            }, 0));
          }
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        setLocalTheme(savedTheme);
      } catch (e) {}
    }
  }, []);

  const activeUser = currentUser !== undefined ? currentUser : localUser;
  const activeCartCount = cartCount !== undefined ? cartCount : localCartCount;
  const activeTotalCart = totalCart !== undefined ? totalCart : localTotalCart;
  const activeTheme = theme || localTheme;
  const activeLang = lang || localLang;

  const handleToggleTheme = toggleTheme || (() => {
    const next = activeTheme === 'light' ? 'dark' : 'light';
    setLocalTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next);
      document.body.setAttribute('data-theme', next);
    }
  });

  // Hàm xử lý sự kiện tương tác người dùng (handleSetLang)
  const handleSetLang = (l: 'vi' | 'en') => {
    if (l === 'en') {
      alert('Phiên bản tiếng Anh (English) đang được hoàn thiện. Hệ thống LÀNH Farm hiện phục vụ tốt nhất bằng Tiếng Việt!');
      return;
    }
    if (setLang) {
      setLang(l);
    } else {
      setLocalLang(l);
    }
  };

  const handleLogout = onLogout || (() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_user');
      localStorage.removeItem('auth_token');
      setLocalUser(null);
      window.location.reload();
    }
  });

  // Hàm xử lý sự kiện tương tác người dùng (handleCartClick)
  const handleCartClick = () => {
    if (setIsDrawerOpen) {
      setIsDrawerOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  // Click ngoài đóng dropdown
  useEffect(() => {
    // Hàm xử lý sự kiện tương tác người dùng (handleClickOutside)
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* ── TẦNG 1: TOP BAR TIỆN ÍCH ── */}
      <div className="header-topbar">
        <div className="wrap topbar-row">
          <div className="topbar-left">
            <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP &amp; Hữu cơ</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span className="topbar-link">Hotline: <strong>1900 8899</strong> (7:00 - 21:00)</span>
          </div>
          <div className="topbar-right">
            <span style={{ opacity: 0.4 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="icon-btn" onClick={handleToggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                {activeTheme === 'light' ? 'Tối' : 'Sáng'}
              </button>
              <div className="lang-switch">
                <button className={activeLang === 'vi' ? 'active' : ''} onClick={() => handleSetLang('vi')}>VI</button>
                <button className={activeLang === 'en' ? 'active' : ''} onClick={() => handleSetLang('en')}>EN</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TẦNG 2: MAIN HEADER ── */}
      <div className="wrap nav-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu điều hướng"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link href="/" className="logo">
            <svg className="mark" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--green-700)" />
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)" />
              <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <div>
              <span style={{ letterSpacing: '1px' }}>LÀNH</span>
              <div className="logo-subtext" style={{ fontSize: '10.5px', fontWeight: '500', color: 'var(--green-700)', marginTop: '-4px' }}>NÔNG SẢN TƯƠI SẠCH</div>
            </div>
          </Link>
        </div>

        {/* Thanh tìm kiếm trung tâm */}
        <SearchBar />

        {/* Nhóm nút tác vụ Header */}
        <div className="header-actions">
          {/* Mục Tài khoản */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              className="header-action-item"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{ border: 'none', background: 'none' }}
              type="button"
            >
              <span className="header-action-icon">
                {activeUser && activeUser.avatarUrl ? (
                  <img
                    src={activeUser.avatarUrl}
                    alt="Avatar"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-700)' }}
                  />
                ) : activeUser ? (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--green-700)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {(activeUser?.fullName || activeUser?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
                  </svg>
                )}
              </span>
              <div className="header-action-text">
                <span className="header-action-label">{activeUser ? 'Xin chào,' : 'Tài khoản'}</span>
                <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeUser ? (activeUser.fullName || activeUser.email) : 'Đăng nhập'}
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
                {activeUser ? (
                  <>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-soft)' }}>
                      <div style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '13.5px' }}>{activeUser?.fullName || activeUser?.email}</div>
                      <div style={{ marginTop: '2px', wordBreak: 'break-all' }}>{activeUser?.email}</div>
                      {activeUser.roleId === 1 && (
                        <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                          🛡️ Quản trị viên
                        </span>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserDropdown(false)}
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
                      👤 Hồ sơ &amp; Sổ địa chỉ
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowUserDropdown(false)}
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
                      📦 Lịch sử đơn hàng
                    </Link>
                    {activeUser.roleId === 1 && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const portalBase = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
                            ? 'https://web-portal-rho-tawny.vercel.app'
                            : 'http://localhost:5173';
                          const token = localStorage.getItem('auth_token') || '';
                          const userStr = localStorage.getItem('customer_user') || '';
                          const url = token && userStr
                            ? `${portalBase}/?sso_token=${encodeURIComponent(token)}&sso_user=${encodeURIComponent(userStr)}`
                            : portalBase;
                          window.open(url, '_blank');
                        }}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          textDecoration: 'none',
                          color: '#B91C1C',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        ⚙️ Bảng Quản trị (Admin)
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
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
                      🚪 Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setShowUserDropdown(false)}
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
                      onClick={() => setShowUserDropdown(false)}
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

          {/* Nút Giỏ Hàng nổi bật (ID 16: Thêm đầy đủ role và aria-label cho công nghệ trợ năng) */}
          <div
            className={`header-cart-btn ${cartBounce ? 'bounce' : ''}`}
            onClick={handleCartClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCartClick();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Xem giỏ hàng, hiện có ${activeCartCount} sản phẩm, tổng tiền ${formatVND(activeTotalCart)}`}
            title="Xem giỏ hàng"
          >
            <div className="header-action-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="badge">{activeCartCount}</span>
            </div>
            <div className="header-action-text">
              <span className="header-action-label">Giỏ hàng</span>
              <span className="header-action-value" style={{ color: 'var(--green-900)' }}>
                {formatVND(activeTotalCart)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TẦNG 3: SUB-NAVBAR 4 MỤC CHÍNH (DESKTOP) ── */}
      <div className="header-subnav">
        <div className="wrap subnav-row">
          <div className="subnav-links">
            <Link
              href="/"
              className={`subnav-link ${pathname === '/' ? 'active' : ''}`}
              style={pathname === '/' ? { color: 'var(--green-700)', fontWeight: '700' } : {}}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className={`subnav-link ${pathname.startsWith('/products') ? 'active' : ''}`}
              style={pathname.startsWith('/products') ? { color: 'var(--green-700)', fontWeight: '700' } : {}}
            >
              Tất cả nông sản
            </Link>
            <Link
              href="/combos"
              className={`subnav-link ${pathname.startsWith('/combos') ? 'active' : ''}`}
              style={pathname.startsWith('/combos') ? { color: 'var(--green-700)', fontWeight: '700' } : {}}
            >
              Combo định kỳ
            </Link>
            <Link
              href="/traceability"
              className={`subnav-link ${pathname.startsWith('/traceability') ? 'active' : ''}`}
              style={pathname.startsWith('/traceability') ? { color: 'var(--green-700)', fontWeight: '700' } : {}}
            >
              Truy xuất nguồn gốc
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER NAVIGATION MENU (ID 3: Menu Hamburger cho điện thoại) ── */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '310px',
              height: '100%',
              backgroundColor: 'var(--surface)',
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              animation: 'slideInLeft 0.25s ease-out',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="var(--green-700)" />
                  <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)" />
                  <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--green-900)', letterSpacing: '0.5px' }}>LÀNH FARM</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
                style={{ border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Thông tin tài khoản ngắn gọn */}
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg)', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--line)' }}>
              {activeUser ? (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Xin chào,</div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>{activeUser.fullName || activeUser.email}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: '6px', backgroundColor: 'var(--green-700)', color: '#fff', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ flex: 1, textAlign: 'center', padding: '7px 0', borderRadius: '6px', border: '1px solid var(--green-700)', color: 'var(--green-700)', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Danh mục điều hướng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {[
                { href: '/', label: 'Trang chủ', icon: '🏠' },
                { href: '/products', label: 'Tất cả nông sản', icon: '🥦' },
                { href: '/combos', label: 'Combo định kỳ', icon: '📦' },
                { href: '/traceability', label: 'Truy xuất nguồn gốc', icon: '🔍' },
                { href: '/orders', label: 'Lịch sử đơn hàng', icon: '📋' },
                { href: '/profile', label: 'Hồ sơ & Sổ địa chỉ', icon: '👤' },
              ].map((m) => {
                const isActive = pathname === m.href;
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive ? 'var(--green-700)' : 'var(--ink)',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? 'var(--green-100)' : 'transparent',
                      fontSize: '14px'
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Nút đăng xuất nếu đã đăng nhập */}
            {activeUser && (
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🚪</span>
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
