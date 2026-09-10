'use client';
import React from 'react';

type HeaderProps = {
  theme: string;
  toggleTheme: () => void;
  lang: string;
  setLang: (l: 'vi' | 'en') => void;
  cartCount: number;
  setIsDrawerOpen: (o: boolean) => void;
  cartBounce: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  lang,
  setLang,
  cartCount,
  setIsDrawerOpen,
  cartBounce,
}) => {
  return (
    <header>
      <div className="wrap nav-row">
        <a href="#main" className="logo">
          <svg className="mark" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
            <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
            <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          LÀNH
        </a>

        <nav className="main-nav">
          <a href="#products">Cửa hàng</a>
          <a href="#trace">Truy xuất</a>
          <a href="#subToggle">Combo</a>
        </nav>

        <div className="search-shell">
          <select className="cat-select" aria-label="Chọn danh mục">
            <option>Tất cả</option>
            <option>Rau lá</option>
            <option>Trái cây</option>
            <option>Thịt sạch</option>
            <option>Chế biến</option>
          </select>
          <input type="text" placeholder="Tìm rau cải, bơ, cam Cao Phong…" />
          <button className="go" aria-label="Tìm kiếm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
        </div>

        <div className="nav-icons">
          <button className="icon-btn mobile-search" aria-label="Tìm kiếm">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Chuyển giao diện sáng/tối" title="Sáng / Tối">
            {theme === "light" ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1M12 20v1M4.2 4.2l.7.7M18.4 18.4l.7.7M3 12h1M20 12h1M4.2 19.8l.7-.7M18.4 5.6l.7-.7"/><circle cx="12" cy="12" r="4.4"/></svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" fill="currentColor" stroke="none"/></svg>
            )}
          </button>
          <div className="lang-switch">
            <button className={lang === "vi" ? "active" : ""} onClick={() => setLang("vi")}>VI</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="icon-btn" aria-label="Tài khoản">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
          </button>
          <button className={`icon-btn ${cartBounce ? "bounce" : ""}`} onClick={() => setIsDrawerOpen(true)} aria-label="Giỏ hàng">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6"/><circle cx="9.5" cy="21" r="1.3" fill="currentColor" stroke="none"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor" stroke="none"/></svg>
            <span className="badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
