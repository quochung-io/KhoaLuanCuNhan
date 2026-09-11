'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

type HeaderProps = {
  theme: string;
  toggleTheme: () => void;
  lang: string;
  setLang: (l: 'vi' | 'en') => void;
  cartCount: number;
  setIsDrawerOpen: (o: boolean) => void;
  cartBounce: boolean;
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

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  lang,
  setLang,
  cartCount,
  setIsDrawerOpen,
  cartBounce,
  currentUser,
  onOpenAuthModal,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  suggestions = [],
  showSuggestions = false,
  setShowSuggestions,
}) => {
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'color-mix(in srgb, var(--bg, #F9FBF8) 92%, transparent)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--line, #E1EAE0)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      {/* Top micro bar for quick promo / contacts */}
      <div style={{
        backgroundColor: 'var(--green-900, #1B3A20)',
        color: '#EAF4E9',
        fontSize: '11.5px',
        padding: '5px 0',
        fontWeight: '500'
      }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🌱 100% Nông sản hữu cơ kiểm định VietGAP & GlobalGAP</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span>🚚 Giao nhanh 2H nội thành</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="tel:19006868" style={{ color: '#EAF4E9', textDecoration: 'none' }}>📞 Hotline: 1900 6868</a>
            <span style={{ opacity: 0.6 }}>|</span>
            <a href="#trace" style={{ color: 'var(--accent, #FF9800)', fontWeight: 'bold' }}>🔍 Tra cứu nguồn gốc lô hàng</a>
          </div>
        </div>
      </div>

      {/* Main Nav Row */}
      <div className="wrap nav-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 0' }}>
        
        {/* Logo */}
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <svg style={{ width: '36px', height: '36px' }} viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="var(--green-700, #2E7D32)"/>
            <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500, #4CAF50)"/>
            <path d="M20 30V16" stroke="var(--green-900, #1B3A20)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display, serif)', fontWeight: '800', fontSize: '24px', color: 'var(--green-900, #1B3A20)', lineHeight: '1' }}>
              LÀNH
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--ink-soft, #4B5D50)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
              Nông sản sạch
            </div>
          </div>
        </Link>

        {/* Main Navigation Links */}
        <nav className="main-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', fontWeight: '600' }}>
          <Link href="/#products" style={{ color: 'var(--ink, #16241A)', textDecoration: 'none', transition: 'color 0.2s' }}>
            🌾 Cửa hàng
          </Link>
          <Link href="/#trace" style={{ color: 'var(--ink, #16241A)', textDecoration: 'none', transition: 'color 0.2s' }}>
            🏷️ Truy xuất
          </Link>
          <Link href="/#subToggle" style={{ color: 'var(--ink, #16241A)', textDecoration: 'none', transition: 'color 0.2s' }}>
            📦 Combo Tuần
          </Link>
          <Link href="/orders" style={{ color: 'var(--ink, #16241A)', textDecoration: 'none', transition: 'color 0.2s' }}>
            📋 Đơn hàng
          </Link>
        </nav>

        {/* Search Bar with Autocomplete Suggestions */}
        <div className="search-shell" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--surface, #FFFFFF)',
          border: '1.5px solid var(--line, #E1EAE0)',
          borderRadius: '999px',
          padding: '4px 6px 4px 16px',
          position: 'relative',
          boxShadow: 'var(--shadow, 0 2px 8px rgba(0,0,0,0.04))',
          maxWidth: '520px'
        }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions && setShowSuggestions(false), 250)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearchSubmit) {
                onSearchSubmit();
              }
            }}
            placeholder="Tìm cải bó xôi, bơ Đắk Lắk, cam Cao Phong..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'none',
              flex: 1,
              fontSize: '13.5px',
              color: 'var(--ink, #16241A)',
              fontFamily: 'var(--font-body, sans-serif)'
            }}
          />
          <button 
            type="button" 
            onClick={() => onSearchSubmit && onSearchSubmit()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--green-700, #2E7D32)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              border: 'none'
            }}
            aria-label="Tìm kiếm"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
          </button>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: 'var(--surface, #ffffff)',
              border: '1px solid var(--line, #E1EAE0)',
              borderRadius: '16px',
              listStyle: 'none',
              padding: '8px 0',
              margin: 0,
              zIndex: 9999,
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              maxHeight: '340px',
              overflowY: 'auto'
            }}>
              <li style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 'bold', color: 'var(--ink-soft, #888)', textTransform: 'uppercase' }}>
                Gợi ý sản phẩm
              </li>
              {suggestions.map((s, idx) => (
                <li 
                  key={idx}
                  onClick={() => {
                    if (setShowSuggestions) setShowSuggestions(false);
                    router.push(`/products/${s.productId}`);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--green-100, #F4F8F4)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <img 
                    src={s.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&auto=format&fit=crop&q=80'} 
                    alt={s.productName} 
                    style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px', backgroundColor: 'var(--green-100)' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--ink, #16241A)' }}>{s.productName}</span>
                    <span style={{ fontSize: '12px', color: '#E53E3E', fontWeight: '700' }}>
                      {s.price.toLocaleString('vi-VN')}₫ <span style={{ color: 'var(--ink-soft, #718096)', fontWeight: 'normal' }}>/ {s.unit}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--green-700, #2E7D32)', fontWeight: '600' }}>Xem →</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Action Icons & User Auth Controls */}
        <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          
          {/* Theme Switch */}
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            aria-label="Chuyển giao diện sáng/tối" 
            title={theme === 'light' ? "Chuyển chế độ Tối" : "Chuyển chế độ Sáng"}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface, #fff)',
              border: '1px solid var(--line, #E1EAE0)',
              cursor: 'pointer'
            }}
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1M12 20v1M4.2 4.2l.7.7M18.4 18.4l.7.7M3 12h1M20 12h1M4.2 19.8l.7-.7M18.4 5.6l.7-.7"/><circle cx="12" cy="12" r="4.4"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" fill="currentColor" stroke="none"/></svg>
            )}
          </button>

          {/* User Auth Section */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            {currentUser ? (
              // Trạng thái: ĐÃ ĐĂNG NHẬP
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--green-100, #E3F1E3)',
                  border: '1.5px solid var(--green-700, #2E7D32)',
                  color: 'var(--green-900, #1B3A20)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--green-700, #2E7D32)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.fullName || currentUser.email}
                </span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>
            ) : (
              // Trạng thái: CHƯA ĐĂNG NHẬP (Nút Đăng nhập / Đăng ký hiện trực tiếp trên Header)
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : router.push('/login')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--surface, #FFFFFF)',
                    border: '1.5px solid var(--green-700, #2E7D32)',
                    color: 'var(--green-700, #2E7D32)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : router.push('/register')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--green-700, #2E7D32)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* User Dropdown Menu */}
            {showUserDropdown && currentUser && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: 'var(--surface, #FFFFFF)',
                border: '1px solid var(--line, #E1EAE0)',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                zIndex: 9999,
                width: '210px',
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line, #E1EAE0)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--ink, #16241A)' }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--ink-soft, #888)' }}>{currentUser.email}</div>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: currentUser.roleId === 1 ? '#FEE2E2' : currentUser.roleId === 2 ? '#FEF3C7' : 'var(--green-100, #E3F1E3)',
                    color: currentUser.roleId === 1 ? '#991B1B' : currentUser.roleId === 2 ? '#92400E' : 'var(--green-900, #1B3A20)'
                  }}>
                    {currentUser.roleId === 1 ? '🛡️ Quản trị viên' : currentUser.roleId === 2 ? '🏢 Nhà cung cấp' : '👤 Khách hàng'}
                  </span>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: 'var(--ink, #16241A)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s'
                  }}
                >
                  👤 Trang cá nhân
                </Link>

                <Link
                  href="/orders"
                  onClick={() => setShowUserDropdown(false)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: 'var(--ink, #16241A)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s'
                  }}
                >
                  📦 Đơn hàng của tôi
                </Link>

                {currentUser.roleId === 1 && (
                  <a
                    href="http://localhost:5173/dashboard"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#B91C1C',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600'
                    }}
                  >
                    ⚙️ Bảng Quản trị (Admin)
                  </a>
                )}

                {currentUser.roleId === 2 && (
                  <a
                    href="http://localhost:5174/dashboard"
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: '#D97706',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600'
                    }}
                  >
                    🏪 Cổng Nhà Cung Cấp
                  </a>
                )}

                <div style={{ height: '1px', backgroundColor: 'var(--line, #E1EAE0)', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: '#DC2626',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'none',
                    fontWeight: '600'
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon Button */}
          <button 
            className={`icon-btn ${cartBounce ? "bounce" : ""}`} 
            onClick={() => setIsDrawerOpen(true)} 
            aria-label="Giỏ hàng"
            title="Xem giỏ hàng"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--green-700, #2E7D32)',
              color: '#ffffff',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)'
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6"/>
              <circle cx="9.5" cy="21" r="1.3" fill="currentColor" stroke="none"/>
              <circle cx="17.5" cy="21" r="1.3" fill="currentColor" stroke="none"/>
            </svg>
            {cartCount > 0 && (
              <span className="badge" style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent, #FF9800)',
                color: '#3A2200',
                fontSize: '11px',
                fontWeight: '800',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
