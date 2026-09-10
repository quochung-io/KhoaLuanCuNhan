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
  seed: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>,
  sprout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21V10M12 10C12 6 9 4 5 4c0 4 2 7 7 7zM12 12c0-4 3-6 7-6 0 4-2 7-7 7"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-9 9-4-4"/></svg>,
  box: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="7" width="13" height="9"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>,
  table: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M5 10v9M19 10v9M3 6h18l-1 4H4l-1-4z"/></svg>,
};

type Product = {
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

const productsData: Product[] = [
  {id:1, name:'Cải bó xôi hữu cơ', category:'Rau củ', price:'28.000₫', unit:'/ 300g', cert:'VietGAP', region:'Đà Lạt', rating:4.8, reviews:212, icon:'leaf', lot:'LOT#VN-DL-0842'},
  {id:2, name:'Cà rốt baby Đà Lạt', category:'Rau củ', price:'32.000₫', unit:'/ 500g', cert:'GlobalGAP', region:'Đà Lạt', rating:4.9, reviews:184, icon:'carrot', lot:'LOT#VN-DL-0917'},
  {id:3, name:'Cam Cao Phong', category:'Trái cây', price:'45.000₫', unit:'/ kg', cert:'VietGAP', region:'Mộc Châu', rating:4.7, reviews:301, icon:'citrus', lot:'LOT#VN-MC-1140'},
  {id:4, name:'Trứng gà ta thả vườn', category:'Rau củ', price:'52.000₫', unit:'/ hộp 10', cert:'USDA', region:'Đồng Tháp', rating:5.0, reviews:96, icon:'egg', lot:'LOT#VN-DT-0663'},
  {id:5, name:'Mật ong rừng nguyên chất', category:'Hạt', price:'135.000₫', unit:'/ 500ml', cert:'USDA', region:'Mộc Châu', rating:4.9, reviews:158, icon:'jar', lot:'LOT#VN-MC-0255'},
  {id:6, name:'Dâu tây Mộc Châu', category:'Trái cây', price:'68.000₫', unit:'/ hộp 250g', cert:'GlobalGAP', region:'Mộc Châu', rating:4.8, reviews:243, icon:'berry', lot:'LOT#VN-MC-0389'},
  {id:7, name:'Xà lách xoăn thủy canh', category:'Rau củ', price:'22.000₫', unit:'/ 250g', cert:'VietGAP', region:'Đà Lạt', rating:4.6, reviews:120, icon:'leaf', lot:'LOT#VN-DL-0721'},
  {id:8, name:'Bơ 034 Đắk Lắk', category:'Trái cây', price:'58.000₫', unit:'/ kg', cert:'VietGAP', region:'Đồng Tháp', rating:4.8, reviews:167, icon:'citrus', lot:'LOT#VN-DT-0410'},
];

const subPlans: Record<string, {name: string; desc: string; price: string}[]> = {
  week: [
    {name:'Combo Gia đình nhỏ', desc:'4 loại rau + 2 loại trái cây / tuần', price:'189.000₫'},
    {name:'Combo Gia đình lớn', desc:'7 loại rau + 3 loại trái cây / tuần', price:'329.000₫'},
    {name:'Combo Ăn chay', desc:'Rau củ quả đa dạng, không thịt trứng', price:'249.000₫'},
  ],
  month: [
    {name:'Combo Gia đình nhỏ', desc:'Giao 4 lần / tháng, tiết kiệm 10%', price:'680.000₫'},
    {name:'Combo Gia đình lớn', desc:'Giao 4 lần / tháng, tiết kiệm 12%', price:'1.180.000₫'},
    {name:'Combo Ăn chay', desc:'Giao 4 lần / tháng, tiết kiệm 10%', price:'895.000₫'},
  ]
};

const traceSteps = [
  {icon:'sprout', title:'Gieo trồng', code:'#01', date:'12/06', detail:'Hạt giống bản địa được gieo tại nông trại đối tác, ghi nhận ngày & lô giống ngay từ đầu vào.', lot:'SEED-0842'},
  {icon:'leaf', title:'Chăm sóc', code:'#02', date:'15/06–20/07', detail:'Theo dõi tưới tiêu, không dùng thuốc bảo vệ thực vật hóa học trong suốt chu kỳ sinh trưởng.', lot:'CARE-0842-A'},
  {icon:'box', title:'Thu hoạch', code:'#03', date:'21/07', detail:'Thu hoạch trong ngày, phân loại tại vườn để đảm bảo độ tươi tối đa trước khi kiểm định.', lot:'HRV-0842-B'},
  {icon:'check', title:'Kiểm định', code:'#04', date:'21/07', detail:'Kiểm tra dư lượng và cấp chứng nhận VietGAP / GlobalGAP trước khi đóng gói.', lot:'QC-0842-C'},
  {icon:'truck', title:'Vận chuyển', code:'#05', date:'22/07', detail:'Đóng gói lạnh, vận chuyển trong vòng 2–6 giờ để giữ độ tươi khi đến tay khách hàng.', lot:'SHIP-0842-D'},
  {icon:'table', title:'Bàn ăn', code:'#06', date:'22/07', detail:'Sản phẩm đến tay bạn — quét mã QR bất cứ lúc nào để xem lại toàn bộ hành trình.', lot:'DLV-0842-E'},
];

const reviews = [
  {name:'Thu Hà', role:'Nội trợ, TP.HCM', text:'Rau tươi hơn hẳn ngoài chợ, quét mã QR thấy rõ ngày thu hoạch nên rất yên tâm cho cả nhà.', rating:5},
  {name:'Minh Quân', role:'Đầu bếp nhà hàng', text:'Nguồn nguyên liệu ổn định, giao đúng giờ. Mình đặt combo tuần cho bếp luôn.', rating:5},
  {name:'Lan Anh', role:'Mẹ 2 con', text:'Thích nhất phần truy xuất nguồn gốc — dạy con về nông nghiệp sạch qua từng đơn hàng.', rating:4},
];

const blogs = [
  {title:'5 cách bảo quản rau lá xanh tươi lâu hơn', desc:'Mẹo giữ rau tươi trong tủ lạnh đến 7 ngày mà không mất chất.'},
  {title:'Ăn theo mùa: vì sao nên chọn nông sản đúng vụ', desc:'Nông sản đúng vụ vừa ngon vừa tiết kiệm, lại giảm tác động môi trường.'},
  {title:'Đọc hiểu nhãn hữu cơ: VietGAP, GlobalGAP khác gì USDA?', desc:'Phân biệt các chứng nhận phổ biến để chọn đúng sản phẩm cần.'},
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

export default function LanhLandingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(productsData);
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("vi");

  const handleGoToCheckout = () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập trước khi thực hiện thanh toán!");
      router.push("/login");
      return;
    }
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    setIsDrawerOpen(false);
    router.push("/checkout");
  };



  // States tài khoản người dùng
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('customer_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    window.location.reload();
  };

  // States tìm kiếm và lọc giá
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const fetchProducts = (searchVal = searchQuery, minP = minPrice, maxP = maxPrice) => {
    let url = 'http://localhost:5023/api/products';
    const params: string[] = [];
    if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
    if (minP !== "") params.push(`minPrice=${minP}`);
    if (maxP !== "") params.push(`maxPrice=${maxP}`);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data) {
          const mapped = data.map((item: any) => {
            let icon = 'leaf';
            const nameLower = item.productName.toLowerCase();
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

            return {
              id: Number(item.productId),
              name: item.productName,
              price: item.price.toLocaleString('vi-VN') + '₫',
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
      .catch(err => console.error('Lỗi khi gọi API sản phẩm:', err));
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

  const handleSelectSuggestion = (val: string) => {
    setSearchQuery(val);
    setShowSuggestions(false);
    fetchProducts(val);
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const [cart, setCart] = useState<CartItem[]>([]);

  // Đồng bộ giỏ hàng với localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Lỗi đọc giỏ hàng", e);
      }
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  const [filterCategory, setFilterCategory] = useState("all");
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

  // Observer
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

  return (
    <>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung</a>

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

          <div className="search-shell" style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Tìm rau cải, bơ, cam Cao Phong…" 
            />
            <button className="go" onClick={() => fetchProducts()} aria-label="Tìm kiếm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            </button>
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                listStyle: 'none',
                padding: 0,
                margin: 0,
                zIndex: 999,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <img 
                      src={s.imageUrl || 'https://via.placeholder.com/35'} 
                      alt={s.productName} 
                      style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--green-100)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '13px', color: '#111' }}>{s.productName}</strong>
                      <span style={{ fontSize: '11px', color: '#e53e3e', fontWeight: 'bold' }}>
                        {s.price.toLocaleString('vi-VN')}đ<span style={{ color: '#718096', fontWeight: 'normal' }}> / {s.unit}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
            <div style={{ position: 'relative' }}>
              <button 
                className="icon-btn" 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                aria-label="Tài khoản"
                title={currentUser ? `Xin chào, ${currentUser.fullName}` : "Tài khoản"}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                {currentUser && currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="Avatar" 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--green-700)' }} 
                  />
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                )}
                {currentUser && <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--green-700)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.fullName}</span>}
              </button>
              
              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  width: '160px',
                  padding: '5px 0',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {currentUser ? (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666' }}>
                        Vai trò: {currentUser.roleId === 1 ? 'Admin' : (currentUser.roleId === 2 ? 'Supplier' : 'Khách hàng')}
                      </div>
                      <Link 
                        href="/profile"
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          textDecoration: 'none',
                          color: '#333',
                          fontSize: '13px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        Trang cá nhân
                      </Link>
                      <Link 
                        href="/orders"
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          textDecoration: 'none',
                          color: '#333',
                          fontSize: '13px',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        Lịch sử đơn hàng
                      </Link>
                      <button 
                        onClick={handleCustomerLogout}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#c62828',
                          fontSize: '13px',
                          fontWeight: 'bold'
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
                          padding: '8px 12px',
                          textDecoration: 'none',
                          color: '#333',
                          fontSize: '13px'
                        }}
                      >
                        Đăng nhập
                      </Link>
                      <Link 
                        href="/register"
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          textDecoration: 'none',
                          color: '#333',
                          fontSize: '13px'
                        }}
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <button className={`icon-btn ${cartBounce ? "bounce" : ""}`} onClick={() => setIsDrawerOpen(true)} aria-label="Giỏ hàng">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6"/><circle cx="9.5" cy="21" r="1.3" fill="currentColor" stroke="none"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor" stroke="none"/></svg>
              <span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main">
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

        <section className="section">
          <div className="wrap">
            <span className="eyebrow">Danh mục</span>
            <h2 className="section-title" style={{marginTop:'12px'}}>Chọn theo nhu cầu bữa ăn của bạn</h2>
            <div className="cat-grid">
              <div 
                className="cat-card reveal" 
                style={{ cursor: 'pointer', border: filterCategory === 'Rau củ' ? '2px solid var(--green-700)' : 'none' }}
                onClick={() => { setFilterCategory('Rau củ'); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}); }}
              >
                <div className="ic-wrap" style={{background:'#E3F1E3'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><path d="M12 21c-4-1-7-4-7-9a7 7 0 0114 0c0 5-3 8-7 9z"/><path d="M12 21V9"/></svg></div>
                <h3>Rau củ</h3>
                <p>Cải thìa, bắp cải, súp lơ, củ dền, cà chua, cà rốt, nấm tươi</p>
                <span className="count">53 sản phẩm</span>
              </div>
              <div 
                className="cat-card reveal" 
                style={{ cursor: 'pointer', border: filterCategory === 'Trái cây' ? '2px solid var(--green-700)' : 'none' }}
                onClick={() => { setFilterCategory('Trái cây'); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}); }}
              >
                <div className="ic-wrap" style={{background:'#FFF1DC'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2"><circle cx="12" cy="13" r="7"/><path d="M12 6c1-2 3-3 4-3"/></svg></div>
                <h3>Trái cây</h3>
                <p>Sầu riêng, bưởi da xanh, xoài cát, dưa hấu, măng cụt, bơ</p>
                <span className="count">44 sản phẩm</span>
              </div>
              <div 
                className="cat-card reveal" 
                style={{ cursor: 'pointer', border: filterCategory === 'Rau thơm' ? '2px solid var(--green-700)' : 'none' }}
                onClick={() => { setFilterCategory('Rau thơm'); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}); }}
              >
                <div className="ic-wrap" style={{background:'#E8F5E9'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><path d="M12 2a10 10 0 0110 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0112 2z"/><path d="M12 6v6l4 2"/></svg></div>
                <h3>Rau thơm</h3>
                <p>Hành lá, ngò gai, tía tô, kinh giới, diếp cá, thì là, ớt, tỏi</p>
                <span className="count">16 sản phẩm</span>
              </div>
              <div 
                className="cat-card reveal" 
                style={{ cursor: 'pointer', border: filterCategory === 'Hạt' ? '2px solid var(--green-700)' : 'none' }}
                onClick={() => { setFilterCategory('Hạt'); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}); }}
              >
                <div className="ic-wrap" style={{background:'#FFF8E1'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F57F17" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></div>
                <h3>Hạt</h3>
                <p>Hạt điều, hạt sen, macca, yến mạch, ngô nếp, các loại đậu</p>
                <span className="count">19 sản phẩm</span>
              </div>
              <div 
                className="cat-card reveal" 
                style={{ cursor: 'pointer', border: filterCategory === 'Gạo' ? '2px solid var(--green-700)' : 'none' }}
                onClick={() => { setFilterCategory('Gạo'); document.getElementById('products')?.scrollIntoView({behavior: 'smooth'}); }}
              >
                <div className="ic-wrap" style={{background:'#EDE7F6'}}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#673AB7" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
                <h3>Gạo</h3>
                <p>ST25, gạo lứt tím, Séng Cù, Nàng Thơm Chợ Đào, nếp nương</p>
                <span className="count">8 sản phẩm</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="products" style={{paddingTop:0}}>
          <div className="wrap">
            <span className="eyebrow">Sản phẩm nổi bật</span>
            <h2 className="section-title" style={{marginTop:'12px'}}>Thu hoạch hôm nay, giao tận cửa nhà bạn</h2>

            <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span className="filter-label">Danh mục</span>
              {['all', 'Trái cây', 'Rau củ', 'Rau thơm', 'Hạt', 'Gạo'].map(cat => (
                <button 
                  key={cat} 
                  className={`chip ${filterCategory === cat ? 'active' : ''}`} 
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              ))}
              <div className="chip-sep"></div>

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
              <div className="chip-sep"></div>
              <span className="filter-label">Khoảng giá (đ)</span>
              <input 
                type="number" 
                placeholder="Giá tối thiểu" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid #ddd', width: '110px', outline: 'none' }}
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Giá tối đa" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid #ddd', width: '110px', outline: 'none' }}
              />
              <button 
                className="chip active" 
                onClick={() => fetchProducts()}
                style={{ cursor: 'pointer', border: 'none', background: 'var(--green-700)', color: 'white' }}
              >
                Lọc giá
              </button>
              {(minPrice !== "" || maxPrice !== "" || filterCategory !== "all" || filterCert !== "all" || filterRegion !== "all") && (
                <button 
                  className="chip" 
                  onClick={() => { setFilterCategory("all"); setFilterCert("all"); setFilterRegion("all"); setMinPrice(""); setMaxPrice(""); fetchProducts(searchQuery, "", ""); }}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="prod-grid">
              {products.filter(p => 
                (filterCategory === 'all' || p.category === filterCategory) &&
                (filterCert === 'all' || p.cert === filterCert) && 
                (filterRegion === 'all' || p.region === filterRegion)
              ).map(p => (
                <div key={p.id} className="prod-card">
                  <div className="prod-media" style={{background:'var(--green-100)', position: 'relative'}}>
                    <Link href={`/products/${p.id}`} style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        ICONS[p.icon]
                      )}
                    </Link>
                    <div className="tag-row" style={{ pointerEvents: 'auto' }}>
                      <span className="tag-cert" style={{ background: '#2E7D32', color: '#fff', fontWeight: 600 }}>{p.category}</span>
                      <span className="tag-cert">{p.cert}</span>
                      <button className="qr-btn" onClick={(e) => { e.stopPropagation(); setOpenQrFor(p.id); }} aria-label="Xem truy xuất nguồn gốc">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>
                      </button>
                    </div>
                    <div className={`qr-panel ${openQrFor === p.id ? 'show' : ''}`}>
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
                    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <span className="prod-name" style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--green-700)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}>
                        {p.name}
                      </span>
                    </Link>
                    <div className="stars">
                      <span className="fill">★★★★★</span> {p.rating} · {p.reviews} đánh giá
                    </div>
                    <div className="price-row">
                      <span className="price">{p.price}<span>{p.unit}</span></span>
                      <button className={`add-btn ${addedItem === p.id ? 'added' : ''}`} onClick={() => addToCart(p)} aria-label="Thêm vào giỏ">
                        {addedItem === p.id ? ICONS.check : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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

        <section className="section" id="trace">
          <div className="wrap">
            <span className="eyebrow">Farm to Table</span>
            <h2 className="section-title" style={{marginTop:'12px'}}>Theo dấu từng lô hàng — từ hạt giống đến bàn ăn</h2>
            <p className="section-sub">Chạm vào từng mốc để xem chi tiết. Mỗi bước đều được ghi log và gắn liền với mã lô truy xuất riêng.</p>

            <div className="trace-strip">
              {traceSteps.map((s, i) => (
                <button key={s.code} className={`trace-step ${i === activeTrace ? 'active' : ''}`} onClick={() => setActiveTrace(i)}>
                  <span className="trace-dot">{ICONS[s.icon]}</span>
                  <span className="trace-code">{s.code}</span>
                  <h4>{s.title}</h4>
                  <span className="t">{s.date}</span>
                </button>
              ))}
            </div>
            
            <div className="trace-detail">
              <div className="stamp">{ICONS[traceSteps[activeTrace].icon]}</div>
              <div>
                <h4>{traceSteps[activeTrace].title} — {traceSteps[activeTrace].date}</h4>
                <p>{traceSteps[activeTrace].detail}</p>
              </div>
              <div className="lot-box"><b>Mã lô truy xuất</b>{traceSteps[activeTrace].lot}<br/>VN-2026 · Nông trại đối tác LÀNH</div>
            </div>
          </div>
        </section>

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
            <div className="drawer-empty">Giỏ hàng đang trống.<br/>Hãy thêm vài món rau sạch nhé 🌱</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="drawer-item">
                <div className="thumb">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    ICONS[item.product.icon]
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
