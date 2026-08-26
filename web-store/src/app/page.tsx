'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '@ecc/shared';
import { productsData, subPlans, traceSteps, reviews, blogs } from '../constants/mockData';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/product/ProductCard';
import { TraceabilityTimeline } from '../components/sections/TraceabilityTimeline';
import { CartDrawer } from '../components/cart/CartDrawer';

export default function LanhLandingPage() {
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("vi");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  const [filterCert, setFilterCert] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  
  const [openQrFor, setOpenQrFor] = useState<number | null>(null);
  const [subFreq, setSubFreq] = useState("week");
  const [activeTrace, setActiveTrace] = useState(0);
  const [activeReviewDot, setActiveReviewDot] = useState(0);

  const reviewTrackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Observer hiệu ứng reveal chuyển động
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, .cat-card').forEach(el => {
      el.classList.add("reveal");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(x => x.product.id === product.id);
      if (existing) {
        return prev.map(x => x.product.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...prev, { product, qty: 1 }];
    });
    
    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 900);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev => prev.map(x => {
      if (x.product.id === id) {
        return { ...x, qty: Math.max(1, x.qty + delta) };
      }
      return x;
    }));
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(x => x.product.id !== id));

  const totalCart = cart.reduce((s, i) => s + parseInt(i.product.price.replace(/[^\d]/g, ''), 10) * i.qty, 0);
  const toVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const scrollToReview = (i: number) => {
    setActiveReviewDot(i);
    if (reviewTrackRef.current) {
      const cards = reviewTrackRef.current.querySelectorAll('.review-card');
      if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung</a>

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        setLang={(l) => setLang(l)}
        cartCount={cartCount}
        setIsDrawerOpen={setIsDrawerOpen}
        cartBounce={cartBounce}
      />

      <main id="main">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Nông sản hữu cơ · Truy xuất minh bạch</span>
              <h1>Rau sạch tận gốc,<br/><em>rõ ràng</em> đến từng lô hàng.</h1>
              <p>LÀNH kết nối bạn trực tiếp với hơn 120 nông trại đạt chuẩn VietGAP &amp; hữu cơ — mỗi sản phẩm đều có nhật ký canh tác quét được bằng mã QR.</p>
              <div className="hero-cta">
                <a href="#products" className="btn btn-accent">Khám phá ngay
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
                <a href="#trace" className="btn btn-ghost">Xem quy trình Farm to Table</a>
              </div>
              <div className="trust-row">
                <div className="trust-item">
                  <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2.2"><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg></span>
                  <span>Chuẩn VietGAP<br/>được kiểm định</span>
                </div>
                <div className="trust-item">
                  <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2.2"><path d="M12 21C7 17 3 13.5 3 9a5 5 0 019-3 5 5 0 019 3c0 4.5-4 8-9 12z"/></svg></span>
                  <span>100% Hữu cơ<br/>không hóa chất</span>
                </div>
                <div className="trust-item">
                  <span className="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2.2"><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"/></svg></span>
                  <span>Giao nhanh<br/>trong 2 giờ</span>
                </div>
              </div>
            </div>

            <div className="hero-art reveal">
              <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#DCEEDC"/><stop offset="1" stopColor="#F9FBF8"/>
                  </linearGradient>
                </defs>
                <rect width="480" height="480" fill="url(#sky)"/>
                <circle cx="380" cy="90" r="46" fill="#FF9800" opacity=".85"/>
                <g opacity=".9">
                  <path d="M0 260 Q120 220 240 260 T480 260 V480 H0 Z" fill="#4CAF50"/>
                  <path d="M0 300 Q120 270 240 300 T480 300 V480 H0 Z" fill="#2E7D32"/>
                  <path d="M0 350 Q120 325 240 350 T480 350 V480 H0 Z" fill="#1B3A20"/>
                </g>
                <g stroke="#1B3A20" strokeWidth="2" opacity=".35">
                  <line x1="40" y1="260" x2="10" y2="480"/><line x1="110" y1="255" x2="90" y2="480"/>
                  <line x1="180" y1="258" x2="170" y2="480"/><line x1="250" y1="255" x2="255" y2="480"/>
                  <line x1="320" y1="258" x2="335" y2="480"/><line x1="390" y1="255" x2="410" y2="480"/>
                </g>
                <circle cx="90" cy="150" r="5" fill="#2E7D32"/><circle cx="150" cy="130" r="4" fill="#4CAF50"/>
                <circle cx="220" cy="160" r="6" fill="#2E7D32"/><circle cx="60" cy="190" r="4" fill="#4CAF50"/>
              </svg>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="section">
          <div className="wrap">
            <span className="eyebrow">Danh mục</span>
            <h2 className="section-title" style={{marginTop:'12px'}}>Chọn theo nhu cầu bữa ăn của bạn</h2>
            <div className="cat-grid">
              <div className="cat-card reveal">
                <div className="ic-wrap" style={{background:'#E3F1E3'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><path d="M12 21c-4-1-7-4-7-9a7 7 0 0114 0c0 5-3 8-7 9z"/><path d="M12 21V9"/></svg></div>
                <h3>Rau lá &amp; củ quả</h3>
                <p>Cải bó xôi, xà lách, cà rốt, khoai tây hữu cơ</p>
                <span className="count">248 sản phẩm</span>
              </div>
              <div className="cat-card reveal">
                <div className="ic-wrap" style={{background:'#FFF1DC'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2"><circle cx="12" cy="13" r="7"/><path d="M12 6c1-2 3-3 4-3"/></svg></div>
                <h3>Trái cây tươi</h3>
                <p>Cam Cao Phong, bơ 034, xoài cát Hòa Lộc</p>
                <span className="count">176 sản phẩm</span>
              </div>
              <div className="cat-card reveal">
                <div className="ic-wrap" style={{background:'#FBE4E4'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M8 7V5a4 4 0 018 0v2"/></svg></div>
                <h3>Thịt sạch &amp; trứng</h3>
                <p>Gà thả vườn, heo hữu cơ, trứng gà ta</p>
                <span className="count">92 sản phẩm</span>
              </div>
              <div className="cat-card reveal">
                <div className="ic-wrap" style={{background:'#E3ECF7'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E5C8A" strokeWidth="2"><path d="M8 3h8l1 5H7l1-5z"/><path d="M6 8h12l-1 13H7L6 8z"/></svg></div>
                <h3>Nông sản chế biến</h3>
                <p>Mứt, nước ép lạnh, gạo lứt, mật ong rừng</p>
                <span className="count">64 sản phẩm</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTS LIST */}
        <section className="section" id="products" style={{paddingTop:0}}>
          <div className="wrap">
            <span className="eyebrow">Sản phẩm nổi bật</span>
            <h2 className="section-title" style={{marginTop:'12px'}}>Thu hoạch hôm nay, giao tận cửa nhà bạn</h2>

            <div className="filter-bar">
              <span className="filter-label">Chứng nhận</span>
              {['all', 'VietGAP', 'GlobalGAP', 'USDA'].map(c => (
                <button key={c} className={`chip ${filterCert === c ? 'active' : ''}`} onClick={() => setFilterCert(c)}>
                  {c === 'all' ? 'Tất cả' : (c === 'USDA' ? 'USDA Organic' : c)}
                </button>
              ))}
              <div className="chip-sep"></div>
              <span className="filter-label">Vùng miền</span>
              {['all', 'Đà Lạt', 'Mộc Châu', 'Đồng Tháp'].map(r => (
                <button key={r} className={`chip ${filterRegion === r ? 'active' : ''}`} onClick={() => setFilterRegion(r)}>
                  {r === 'all' ? 'Tất cả' : r}
                </button>
              ))}
            </div>

            <div className="prod-grid">
              {productsData.filter(p => (filterCert === 'all' || p.cert === filterCert) && (filterRegion === 'all' || p.region === filterRegion)).map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  addedItem={addedItem}
                  openQrFor={openQrFor}
                  setOpenQrFor={setOpenQrFor}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* COMBOS SECTION */}
        <section className="section" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="sub-section">
              <div className="sub-grid">
                <div>
                  <span className="eyebrow">Đăng ký định kỳ</span>
                  <h2>Combo rau sạch tuần &amp; tháng — không lo hết rau giữa tuần</h2>
                  <p>Chọn một combo, LÀNH tự động đóng gói và giao đúng lịch. Có thể tạm dừng hoặc đổi món bất cứ lúc nào.</p>
                  <div className="sub-toggle" id="subToggle">
                    <button className={subFreq === 'week' ? 'active' : ''} onClick={() => setSubFreq('week')}>Theo tuần</button>
                    <button className={subFreq === 'month' ? 'active' : ''} onClick={() => setSubFreq('month')}>Theo tháng</button>
                  </div>
                </div>
                <div className="sub-cards">
                  {subPlans[subFreq].map(plan => (
                    <div key={plan.name} className="sub-card">
                      <div><div className="name">{plan.name}</div><div className="desc">{plan.desc}</div></div>
                      <div className="price">{plan.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRACEABILITY TIMELINE */}
        <TraceabilityTimeline
          traceSteps={traceSteps}
          activeTrace={activeTrace}
          setActiveTrace={setActiveTrace}
        />

        {/* REVIEWS & BLOGS */}
        <section className="section">
          <div className="wrap rb-grid">
            <div>
              <span className="eyebrow">Khách hàng nói gì</span>
              <h2 className="section-title" style={{marginTop:'12px', maxWidth:'100%'}}>Được tin dùng bởi hơn 40.000 gia đình</h2>
              <div className="review-track" ref={reviewTrackRef}>
                {reviews.map((r, i) => (
                  <div key={i} className="review-card">
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <p>"{r.text}"</p>
                    <div className="review-who">
                      <div className="avatar">{r.name.charAt(0)}</div>
                      <div><b>{r.name}</b><span>{r.role}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="nav-dots">
                {reviews.map((_, i) => (
                  <button key={i} className={i === activeReviewDot ? 'active' : ''} onClick={() => scrollToReview(i)}></button>
                ))}
              </div>
            </div>
            <div>
              <span className="eyebrow">Blog dinh dưỡng</span>
              <h2 className="section-title" style={{marginTop:'12px', fontSize:'26px'}}>Mẹo ăn sạch mỗi ngày</h2>
              <div className="blog-list">
                {blogs.map((b, i) => (
                  <a key={i} className="blog-item" href="#">
                    <span className="num">0{i + 1}</span>
                    <div><h4>{b.title}</h4><p>{b.desc}</p></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <CartDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        cart={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        totalCart={totalCart}
        toVND={toVND}
      />
    </>
  );
}
