'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ICONS: Record<string, React.ReactNode> = {
  leaf: <svg viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.8"><path d="M12 21c-5-1-8-5-8-10A7 7 0 0112 3a7 7 0 018 8c0 5-3 9-8 10z"/><path d="M12 21V9"/></svg>,
  carrot: <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="1.8"><path d="M14 3l3 3M17 2l2 2M19 5l2-1M4 20l9-9 3 3-9 9-4 1 1-4z"/></svg>,
  citrus: <svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="1.8"><circle cx="12" cy="13" r="7"/><path d="M12 6c1-2 3-3 4-3"/><path d="M12 13l4-4M12 13l-4 4M12 13l4 4M12 13l-4-4"/></svg>,
  egg: <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8"><path d="M12 21c4 0 7-3.5 7-8 0-5-4-10-7-10S5 8 5 13c0 4.5 3 8 7 8z"/></svg>,
  jar: <svg viewBox="0 0 24 24" fill="none" stroke="#2E5C8A" strokeWidth="1.8"><path d="M8 3h8v3H8z"/><path d="M6 6h12l-1 15H7L6 6z"/></svg>,
  berry: <svg viewBox="0 0 24 24" fill="none" stroke="#8E44AD" strokeWidth="1.8"><circle cx="9" cy="14" r="4"/><circle cx="15" cy="14" r="4"/><path d="M12 10V5M12 5c1-1.5 3-2 4-1.5"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-9 9-4-4"/></svg>
};

type Product = {
  id: number;
  name: string;
  price: string;
  rawPrice: number;
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

const initialProducts: Product[] = [
  {id:1, name:'Cải bó xôi hữu cơ', category:'Rau củ', price:'28.000₫', rawPrice: 28000, unit:'/ 300g', cert:'VietGAP', region:'Đà Lạt', rating:4.8, reviews:212, icon:'leaf', lot:'LOT#VN-DL-0842'},
  {id:2, name:'Cà rốt baby Đà Lạt', category:'Rau củ', price:'32.000₫', rawPrice: 32000, unit:'/ 500g', cert:'GlobalGAP', region:'Đà Lạt', rating:4.9, reviews:184, icon:'carrot', lot:'LOT#VN-DL-0917'},
  {id:3, name:'Cam Cao Phong', category:'Trái cây', price:'45.000₫', rawPrice: 45000, unit:'/ kg', cert:'VietGAP', region:'Mộc Châu', rating:4.7, reviews:301, icon:'citrus', lot:'LOT#VN-MC-1140'},
  {id:4, name:'Trứng gà ta thả vườn', category:'Rau củ', price:'52.000₫', rawPrice: 52000, unit:'/ hộp 10', cert:'USDA', region:'Đồng Tháp', rating:5.0, reviews:96, icon:'egg', lot:'LOT#VN-DT-0663'},
  {id:5, name:'Mật ong rừng nguyên chất', category:'Hạt', price:'135.000₫', rawPrice: 135000, unit:'/ 500ml', cert:'USDA', region:'Mộc Châu', rating:4.9, reviews:158, icon:'jar', lot:'LOT#VN-MC-0255'},
  {id:6, name:'Dâu tây Mộc Châu', category:'Trái cây', price:'68.000₫', rawPrice: 68000, unit:'/ hộp 250g', cert:'GlobalGAP', region:'Mộc Châu', rating:4.8, reviews:243, icon:'berry', lot:'LOT#VN-MC-0389'},
  {id:7, name:'Xà lách xoăn thủy canh', category:'Rau củ', price:'22.000₫', rawPrice: 22000, unit:'/ 250g', cert:'VietGAP', region:'Đà Lạt', rating:4.6, reviews:120, icon:'leaf', lot:'LOT#VN-DL-0721'},
  {id:8, name:'Bơ 034 Đắk Lắk', category:'Trái cây', price:'58.000₫', rawPrice: 58000, unit:'/ kg', cert:'VietGAP', region:'Đồng Tháp', rating:4.8, reviews:167, icon:'citrus', lot:'LOT#VN-DT-0410'},
];

type CartItem = {
  product: Product;
  qty: number;
};

type SuggestionItem = {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
};

export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
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
  const [addedItem, setAddedItem] = useState<number | null>(null);

  // Bộ lọc & Sắp xếp
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCert, setFilterCert] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc' | 'rating-desc'>('default');

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  const [openQrFor, setOpenQrFor] = useState<number | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Load User & Cart từ localStorage
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

  // Lưu giỏ hàng khi thay đổi
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Gọi API lấy danh sách sản phẩm
  const fetchProducts = (searchVal = searchQuery, minP = minPrice, maxP = maxPrice) => {
    setLoading(true);
    let url = 'http://localhost:5023/api/products';
    const params: string[] = [];
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    if (minP !== '') params.push(`minPrice=${minP}`);
    if (maxP !== '') params.push(`maxPrice=${maxP}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data && Array.isArray(data)) {
          const mapped = data.map((item: any) => {
            let icon = 'leaf';
            const nameLower = (item.productName || '').toLowerCase();
            if (nameLower.includes('cà rốt') || nameLower.includes('củ')) icon = 'carrot';
            else if (nameLower.includes('cam') || nameLower.includes('chanh') || nameLower.includes('quýt') || nameLower.includes('bưởi') || nameLower.includes('sầu riêng') || nameLower.includes('bơ')) icon = 'citrus';
            else if (nameLower.includes('trứng') || nameLower.includes('gà') || nameLower.includes('thịt')) icon = 'egg';
            else if (nameLower.includes('mật ong') || nameLower.includes('mứt') || nameLower.includes('hũ') || nameLower.includes('lọ')) icon = 'jar';
            else if (nameLower.includes('dâu') || nameLower.includes('berry') || nameLower.includes('nho')) icon = 'berry';

            let imageUrl = '';
            if (item.productImages && item.productImages.length > 0) {
              const primary = item.productImages.find((img: any) => img.isPrimary);
              imageUrl = primary ? primary.imageUrl : item.productImages[0].imageUrl;
            }

            let region = 'Đà Lạt';
            if (nameLower.includes('mộc châu') || nameLower.includes('bắc hà') || nameLower.includes('tây bắc') || nameLower.includes('sapa') || nameLower.includes('hàm yên') || nameLower.includes('chi lăng')) {
              region = 'Mộc Châu';
            } else if (nameLower.includes('đồng tháp') || nameLower.includes('miền tây') || nameLower.includes('bến tre') || nameLower.includes('tiền giang') || nameLower.includes('long an') || nameLower.includes('vũng tàu') || nameLower.includes('hưng yên') || nameLower.includes('ninh thuận')) {
              region = 'Đồng Tháp';
            }

            const regCode = region === 'Mộc Châu' ? 'MC' : region === 'Đồng Tháp' ? 'DT' : 'DL';
            const cert = (item.status === 'Active' || !item.status) ? 'VietGAP' : item.status;
            const catName = item.category?.categoryName || 'Rau củ';
            const rawPrice = Number(item.price) || 0;

            return {
              id: Number(item.productId),
              name: item.productName,
              price: rawPrice.toLocaleString('vi-VN') + '₫',
              rawPrice: rawPrice,
              unit: ' / ' + item.unit,
              category: catName,
              cert: cert,
              region: region,
              rating: Number((4.6 + (Number(item.productId) % 5) * 0.1).toFixed(1)),
              reviews: 80 + (Number(item.productId) % 7) * 25,
              icon: icon,
              lot: 'LOT#VN-' + regCode + '-' + (1000 + Number(item.productId)),
              imageUrl: imageUrl || undefined
            };
          });
          setProducts(mapped);
        }
      })
      .catch(err => console.error('Lỗi khi gọi API sản phẩm:', err))
      .finally(() => setLoading(false));
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(x => x.product.id === product.id);
      if (existing) {
        return prev.map(x => (x.product.id === product.id ? { ...x, qty: x.qty + quantity } : x));
      }
      return [...prev, { product, qty: quantity }];
    });
    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setAddedItem(product.id);
    setTimeout(() => setAddedItem(null), 900);
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

  const totalCart = cart.reduce((s, i) => s + (i.product.rawPrice || parseInt(i.product.price.replace(/[^\d]/g, ''), 10)) * i.qty, 0);
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

  const openQuickView = (p: Product) => {
    setQuickViewProduct(p);
    setQuickViewQty(1);
  };

  // Lọc và Sắp xếp
  const filteredProducts = products.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchCert = filterCert === 'all' || p.cert === filterCert;
    const matchRegion = filterRegion === 'all' || p.region === filterRegion;
    return matchCat && matchCert && matchRegion;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.rawPrice - b.rawPrice;
    if (sortOrder === 'price-desc') return b.rawPrice - a.rawPrice;
    if (sortOrder === 'rating-desc') return b.rating - a.rating;
    return 0;
  });

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
              placeholder="Bạn muốn tìm nông sản gì? (Rau cải, bơ sáp, dâu tây...)" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchProducts();
              }}
            />
            <button className="go" onClick={() => fetchProducts()} aria-label="Tìm kiếm">
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
                      src={s.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=100&auto=format&fit=crop&q=80'} 
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

        {/* ── TẦNG 3: SUB-NAVBAR 4 MỤC ĐIỀU HƯỚNG CHÍNH ── */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">
                Trang chủ
              </Link>
              <Link href="/products" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>
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

      <main style={{ minHeight: '80vh', paddingBottom: '60px' }}>
        {/* Banner tiêu đề trang */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)',
          color: '#FFFFFF',
          padding: '36px 0',
          marginBottom: '28px',
          boxShadow: '0 4px 15px rgba(27, 58, 32, 0.15)'
        }}>
          <div className="wrap">
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent)', fontWeight: 'bold' }}>
              Danh mục sản phẩm chính thức
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: '8px 0 6px 0', color: '#FFFFFF' }}>
              Tất Cả Nông Sản Sạch &amp; Hữu Cơ
            </h1>
            <p style={{ margin: 0, fontSize: '14.5px', opacity: 0.9, maxWidth: '650px' }}>
              Nông sản tươi xanh thu hoạch mỗi sáng sớm từ các HTX đối tác tại Đà Lạt, Mộc Châu, Đồng Tháp. Kiểm định nghiêm ngặt chuẩn VietGAP, GlobalGAP và USDA Organic.
            </p>
          </div>
        </div>

        <div className="wrap">
          {/* THANH BỘ LỌC TỔNG HỢP & SẮP XẾP */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            {/* Hàng 1: Danh mục & Sắp xếp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginRight: '6px' }}>Danh mục:</span>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'Rau củ', label: 'Rau củ hữu cơ' },
                  { id: 'Trái cây', label: 'Trái cây theo mùa' },
                  { id: 'Rau thơm', label: 'Rau thơm gia vị' },
                  { id: 'Hạt', label: 'Các loại hạt & Mật' },
                  { id: 'Gạo', label: 'Gạo đặc sản' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    className={`chip ${filterCategory === cat.id ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
                    onClick={() => setFilterCategory(cat.id)}
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sắp xếp theo giá */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>⇅ Sắp xếp:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
              </div>
            </div>

            {/* Hàng 2: Vùng miền, Chứng nhận & Khoảng giá */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', paddingTop: '14px', borderTop: '1px dashed var(--line)' }}>
              {/* Vùng miền */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Vùng miền:</span>
                {['all', 'Đà Lạt', 'Mộc Châu', 'Đồng Tháp'].map(r => (
                  <button
                    key={r}
                    className={`chip ${filterRegion === r ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
                    onClick={() => setFilterRegion(r)}
                  >
                    {r === 'all' ? 'Tất cả vùng' : r}
                  </button>
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--line)' }}></div>

              {/* Chứng nhận */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Chứng nhận:</span>
                {['all', 'VietGAP', 'GlobalGAP', 'USDA'].map(c => (
                  <button
                    key={c}
                    className={`chip ${filterCert === c ? 'active' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`}
                    onClick={() => setFilterCert(c)}
                  >
                    {c === 'all' ? 'Tất cả chuẩn' : (c === 'USDA' ? 'USDA Organic' : c)}
                  </button>
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--line)' }}></div>

              {/* Khoảng giá */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>Khoảng giá:</span>
                <input 
                  type="number" 
                  placeholder="Tối thiểu" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100px', fontSize: '12.5px', outline: 'none' }}
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Tối đa" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--line)', width: '100px', fontSize: '12.5px', outline: 'none' }}
                />
                <button 
                  className="chip active" 
                  onClick={() => fetchProducts()}
                  style={{ cursor: 'pointer', border: 'none', background: 'var(--green-700)', color: 'white', fontWeight: 'bold' }}
                >
                  Lọc
                </button>
              </div>

              {/* Nút Xóa lọc nếu có đang lọc */}
              {(minPrice !== '' || maxPrice !== '' || filterCategory !== 'all' || filterCert !== 'all' || filterRegion !== 'all' || searchQuery !== '') && (
                <button 
                  className="chip" 
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterCert('all');
                    setFilterRegion('all');
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchQuery('');
                    setSortOrder('default');
                    fetchProducts('', '', '');
                  }}
                  style={{ cursor: 'pointer', border: '1px solid #e53e3e', color: '#e53e3e', marginLeft: 'auto', fontWeight: '600' }}
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Kết quả đếm */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '14.5px', color: 'var(--ink-soft)' }}>
              Hiển thị <strong style={{ color: 'var(--green-700)' }}>{sortedProducts.length}</strong> sản phẩm phù hợp
            </span>
          </div>

          {/* GRID SẢN PHẨM */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>
              
              Đang tải danh sách nông sản...
            </div>
          ) : sortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--line)' }}>
              
              <h3 style={{ fontSize: '18px', color: 'var(--ink)', marginBottom: '8px' }}>Không tìm thấy sản phẩm nào</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                Hãy thử chọn lại danh mục hoặc bỏ bớt các điều kiện lọc giá, vùng miền.
              </p>
              <button
                className="btn btn-accent"
                onClick={() => {
                  setFilterCategory('all');
                  setFilterCert('all');
                  setFilterRegion('all');
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchQuery('');
                  fetchProducts('', '', '');
                }}
              >
                Xem tất cả nông sản
              </button>
            </div>
          ) : (
            <div className="prod-grid">
              {sortedProducts.map(p => (
                <div key={p.id} className="prod-card" style={{ cursor: 'pointer' }} onClick={() => openQuickView(p)}>
                  <div className="prod-media" style={{ background: 'var(--green-100)', position: 'relative' }}>
                    <div style={{ display: 'block', width: '100%', height: '100%' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        ICONS[p.icon] || ICONS['leaf']
                      )}
                    </div>
                    <div className="tag-row" style={{ pointerEvents: 'auto' }}>
                      <span className="tag-cert" style={{ background: '#2E7D32', color: '#fff', fontWeight: 600 }}>{p.category}</span>
                      <span className="tag-cert">{p.cert}</span>
                      <button className="qr-btn" onClick={(e) => { e.stopPropagation(); setOpenQrFor(p.id); }} aria-label="Xem truy xuất nguồn gốc" title="Xem mã lô truy xuất">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>
                      </button>
                    </div>
                    <div className={`qr-panel ${openQrFor === p.id ? 'show' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`} onClick={(e) => e.stopPropagation()}>
                      <button className="qr-close" onClick={(e) => { e.stopPropagation(); setOpenQrFor(null); }} aria-label="Đóng">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.6"><rect x="2" y="2" width="7" height="7"/><rect x="15" y="2" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/><path d="M15 15h3v3h-3zM21 15v3M15 21h3M21 21v.01M5 5h1M18 5h1M5 18h1"/></svg>
                      <span className="lot">{p.lot}</span>
                      <p>Thu hoạch tại {p.region} · Kiểm định {p.cert}<br/>Quét mã để xem nhật ký canh tác đầy đủ</p>
                    </div>
                  </div>
                  <div className="prod-body">
                    <span className="prod-origin">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                      Xuất xứ: {p.region}
                    </span>
                    <span className="prod-name" style={{ cursor: 'pointer', transition: 'color 0.2s' }}>
                      {p.name}
                    </span>
                    <div className="stars">
                      <span className="fill">★★★★★</span> {p.rating} · {p.reviews} đánh giá
                    </div>
                    <div className="price-row">
                      <span className="price">{p.price}<span>{p.unit}</span></span>
                      <button 
                        className={`add-btn ${addedItem === p.id ? 'added' : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }} 
                        aria-label="Thêm vào giỏ"
                        title="Thêm nhanh vào giỏ"
                      >
                        {addedItem === p.id ? ICONS.check : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── QUICK VIEW MODAL (XEM NHANH SẢN PHẨM) ── */}
      {quickViewProduct && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '24px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              border: '1px solid var(--line)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '0',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng Quick View */}
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: 'var(--ink)'
              }}
              aria-label="Đóng xem nhanh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            {/* Cột trái: Hình ảnh sản phẩm lớn */}
            <div style={{
              backgroundColor: 'var(--green-100)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '340px'
            }}>
              {quickViewProduct.imageUrl ? (
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '120px', height: '120px' }}>
                  {ICONS[quickViewProduct.icon] || ICONS['leaf']}
                </div>
              )}

              {/* Tag nhãn trên ảnh */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '6px' }}>
                <span style={{ backgroundColor: 'var(--green-700)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  {quickViewProduct.category}
                </span>
                <span style={{ backgroundColor: '#FFFFFF', color: 'var(--green-900)', border: '1px solid var(--green-700)', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                  {quickViewProduct.cert}
                </span>
              </div>
            </div>

            {/* Cột phải: Thông tin & Mua hàng */}
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                  <span>Xuất xứ: <strong>{quickViewProduct.region}</strong></span>
                  <span>•</span>
                  <span>Mã lô: <strong>{quickViewProduct.lot}</strong></span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                  {quickViewProduct.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className="stars" style={{ fontSize: '14px' }}>
                    <span className="fill">★★★★★</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{quickViewProduct.rating}</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>({quickViewProduct.reviews} lượt đánh giá)</span>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green-900)' }}>
                    {quickViewProduct.price}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                    {quickViewProduct.unit}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  <strong>Cam kết chất lượng:</strong> Nông sản tươi hái sáng sớm tại nông trại đối tác LÀNH. Bảo quản chuỗi lạnh 4°C giữ trọn vẹn vitamin, không dư lượng hóa chất độc hại.
                </p>

                {/* Chọn số lượng */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>Số lượng:</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid var(--line)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => setQuickViewQty(q => Math.max(1, q - 1))}
                      style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      {quickViewQty}
                    </span>
                    <button
                      onClick={() => setQuickViewQty(q => q + 1)}
                      style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg)', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút thao tác */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                    }}
                    className="btn btn-accent"
                    style={{ padding: '12px', fontSize: '13.5px', fontWeight: 'bold', justifyContent: 'center' }}
                  >
                    Thêm Vào Giỏ
                  </button>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                      router.push('/checkout');
                    }}
                    style={{
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      backgroundColor: 'var(--green-700)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Mua Ngay
                  </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Link
                    href={`/products/${quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    style={{
                      fontSize: '13px',
                      color: 'var(--green-700)',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Xem chi tiết đầy đủ &amp; Nhật ký canh tác →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  ) : (
                    ICONS[item.product.icon] || ICONS['leaf']
                  )}
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
