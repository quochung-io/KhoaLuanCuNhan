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
  {id:1, name:'Cải bó xôi hữu cơ', category:'Rau củ', price:'28.000₫', unit:'/ 300g', cert:'VietGAP', region:'Đà Lạt', rating:4.8, reviews:212, icon:'leaf', lot:'LOT#VN-DL-0842'},
  {id:2, name:'Cà rốt baby Đà Lạt', category:'Rau củ', price:'32.000₫', unit:'/ 500g', cert:'GlobalGAP', region:'Đà Lạt', rating:4.9, reviews:184, icon:'carrot', lot:'LOT#VN-DL-0917'},
  {id:3, name:'Cam Cao Phong', category:'Trái cây', price:'45.000₫', unit:'/ kg', cert:'VietGAP', region:'Mộc Châu', rating:4.7, reviews:301, icon:'citrus', lot:'LOT#VN-MC-1140'},
  {id:4, name:'Trứng gà ta thả vườn', category:'Rau củ', price:'52.000₫', unit:'/ hộp 10', cert:'USDA', region:'Đồng Tháp', rating:5.0, reviews:96, icon:'egg', lot:'LOT#VN-DT-0663'},
  {id:5, name:'Mật ong rừng nguyên chất', category:'Hạt', price:'135.000₫', unit:'/ 500ml', cert:'USDA', region:'Mộc Châu', rating:4.9, reviews:158, icon:'jar', lot:'LOT#VN-MC-0255'},
  {id:6, name:'Dâu tây Mộc Châu', category:'Trái cây', price:'68.000₫', unit:'/ hộp 250g', cert:'GlobalGAP', region:'Mộc Châu', rating:4.8, reviews:243, icon:'berry', lot:'LOT#VN-MC-0389'},
  {id:7, name:'Xà lách xoăn thủy canh', category:'Rau củ', price:'22.000₫', unit:'/ 250g', cert:'VietGAP', region:'Đà Lạt', rating:4.6, reviews:120, icon:'leaf', lot:'LOT#VN-DL-0721'},
  {id:8, name:'Bơ 034 Đắk Lắk', category:'Trái cây', price:'58.000₫', unit:'/ kg', cert:'VietGAP', region:'Đồng Tháp', rating:4.8, reviews:167, icon:'citrus', lot:'LOT#VN-DT-0410'},
];

// Dữ liệu đánh giá khách hàng (có phân trang & xem thêm)
const reviewsData = [
  { id: 1, name: 'Thu Hà', role: 'Nội trợ, TP.HCM', text: 'Rau tươi hơn hẳn ngoài chợ, quét mã QR thấy rõ ngày thu hoạch nên rất yên tâm cho cả nhà. Cải bó xôi và cà chua bi ăn rất ngọt nước giòn tan.', rating: 5, date: '10/09/2026', verified: true },
  { id: 2, name: 'Minh Quân', role: 'Đầu bếp nhà hàng Healthy', text: 'Nguồn nguyên liệu ổn định, củ quả đóng gói chuỗi lạnh giữ độ tươi giòn tự nhiên. Mình đặt combo tuần giao đều đặn cho bếp luôn.', rating: 5, date: '08/09/2026', verified: true },
  { id: 3, name: 'Lan Anh', role: 'Mẹ 2 con, TP. Thủ Đức', text: 'Thích nhất phần truy xuất nguồn gốc — dạy con về nông nghiệp sạch qua từng đơn hàng. Bơ 034 dẻo béo ngậy, các bé nhà mình mê tít.', rating: 5, date: '06/09/2026', verified: true },
  { id: 4, name: 'Hoàng Nam', role: 'Kỹ sư công nghệ, Q.7', text: 'Giao diện đặt hàng siêu mượt. Shipper giao trong vòng 2 tiếng, rau còn đọng sương lạnh tươi rói chuẩn kiểm định VietGAP.', rating: 5, date: '04/09/2026', verified: true },
  { id: 5, name: 'Bác sĩ Thanh Trúc', role: 'Chuyên khoa Dinh Dưỡng', text: 'Tôi thường xuyên khuyên các gia đình chọn nông sản có nguồn gốc minh bạch. LÀNH làm rất kỹ khâu kiểm định dư lượng hóa chất.', rating: 5, date: '02/09/2026', verified: true },
  { id: 6, name: 'Thanh Tùng', role: 'HLV Thể hình & Fitness', text: 'Rau xanh và các loại hạt hữu cơ ở đây rất giàu dinh dưỡng thực vật, ăn vào cơ thể nhẹ nhàng và tràn đầy năng lượng mỗi ngày.', rating: 4, date: '31/08/2026', verified: true },
  { id: 7, name: 'Ngọc Mai', role: 'Nhân viên văn phòng, Q.1', text: 'Đóng gói hút chân không và túi bảo quản rất chu đáo. Mua về trữ tủ lạnh cả tuần nấu ăn vẫn tươi nguyên như mới hái tại vườn.', rating: 5, date: '29/08/2026', verified: true },
  { id: 8, name: 'Chị Diệu Hương', role: 'Ăn chay thực dưỡng 6 năm', text: 'Nấm tươi, rau thơm và gạo ST25 ở LÀNH vị thơm ngọt tự nhiên không cần nêm nếm gia vị hóa chất. Rất ủng hộ mô hình nông sản sạch.', rating: 5, date: '26/08/2026', verified: true },
  { id: 9, name: 'Anh Tuấn Kiệt', role: 'Chủ quán Cafe Healthy Brunch', text: 'Trái cây theo mùa như dâu tây Mộc Châu và cam Cao Phong chất lượng cực kỳ đồng đều, khách uống nước ép khen ngon nức nở.', rating: 5, date: '23/08/2026', verified: true },
];

// Dữ liệu Blog Dinh Dưỡng
const blogsData = [
  {
    id: 1,
    title: '5 Cách Bảo Quản Rau Lá Xanh Tươi Giòn Đến 7 Ngày',
    desc: 'Bí quyết giữ rau sạch tươi mới trong ngăn mát mà không làm hao hụt vitamin và dưỡng chất thiết yếu của rau củ.',
    tag: 'Mẹo Nhà Bếp',
    date: '10/09/2026',
    author: 'LÀNH Kitchen',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Ăn Nông Sản Theo Mùa: Vì Sao Nên Chọn Rau Củ Quả Đúng Vụ?',
    desc: 'Nông sản thuận tự nhiên đúng mùa vừa đạt vị ngọt đậm đà nhất, vừa giàu kháng thể và giảm phát thải môi trường.',
    tag: 'Dinh Dưỡng Xanh',
    date: '08/09/2026',
    author: 'BS. Dinh Dưỡng',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Đọc Hiểu Nhãn Hữu Cơ: VietGAP, GlobalGAP và USDA Khác Gì Nhau?',
    desc: 'Cẩm nang phân biệt các tiêu chuẩn chứng nhận nông sản khắt khe nhất để bạn an tâm bảo vệ sức khỏe cả gia đình.',
    tag: 'Kiến Thức Hữu Cơ',
    date: '05/09/2026',
    author: 'KTV. Kiểm Định',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'
  }
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

const heroSlides = [
  {
    image: '/banners/farm_hero_banner_1789080079371.jpg',
    eyebrow: 'Nông Nghiệp Hữu Cơ Thông Minh',
    title: 'Nông Sản Tươi LÀNH,\nChuẩn Vị Từ Đất Mẹ.',
    desc: 'Kết nối trực tiếp với hơn 120 nông trại hữu cơ chuẩn VietGAP & GlobalGAP. Thu hoạch mỗi sớm mai, giao nhanh trong 2 giờ.',
    ctaText: 'Khám phá ngay nông sản',
    ctaLink: '/products',
    subLinkText: 'Tìm hiểu quy trình Farm to Table',
    subLink: '/traceability'
  },
  {
    image: '/banners/fruit_season_banner_1789080094055.jpg',
    eyebrow: 'Trái Cây Đúng Mùa Thu Hoạch',
    title: 'Mùa Vụ Bội Thu,\nNgọt Ngào Tươi Mới.',
    desc: 'Thưởng thức trái cây đặc sản chín cây tự nhiên từ Mộc Châu, Đà Lạt và Đồng Bằng Sông Cửu Long không chất bảo quản.',
    ctaText: 'Xem trái cây mùa vụ',
    ctaLink: '/products',
    subLinkText: 'Đăng ký Combo tuần tiện lợi',
    subLink: '/combos'
  }
];

export default function LanhLandingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tài khoản người dùng
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [addedItem, setAddedItem] = useState<number | null>(null);

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Đánh giá khách hàng (hỗ trợ người dùng tự viết đánh giá mới)
  const [reviewsList, setReviewsList] = useState(reviewsData);
  const [reviewPage, setReviewPage] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRole, setNewReviewRole] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewToast, setReviewToast] = useState<string | null>(null);

  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(reviewsList.length / reviewsPerPage);

  // Tin tức / Blog Nông sản lấy từ API các tờ báo có thật
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsFilter, setNewsFilter] = useState('all');

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // QR Modal
  const [openQrFor, setOpenQrFor] = useState<number | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Tự động chuyển Slide Hero Banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Load User & Cart từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        setNewReviewName(u.fullName || '');
      } catch (e) {}
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }

    // Load đánh giá do người dùng đã gửi từ localStorage
    const savedReviews = localStorage.getItem('custom_reviews');
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsList([...parsed, ...reviewsData]);
        }
      } catch (e) {}
    }

    // Fetch tin tức từ API báo chí chính thống (/api/news)
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data && data.articles) {
          setNewsArticles(data.articles);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingNews(false));
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

  // Lấy dữ liệu sản phẩm từ backend
  const fetchProducts = (searchVal = searchQuery) => {
    let url = 'http://localhost:5023/api/products';
    if (searchVal) url += `?search=${encodeURIComponent(searchVal)}`;

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

  const openQuickView = (p: Product) => {
    setQuickViewProduct(p);
    setQuickViewQty(1);
  };

  const activeSlideData = heroSlides[currentSlide];

  // Xử lý gửi đánh giá mới từ người dùng
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và nội dung đánh giá của bạn!');
      return;
    }

    const newRev = {
      id: Date.now(),
      name: newReviewName.trim(),
      role: newReviewRole.trim() || 'Khách hàng LÀNH Farm',
      text: newReviewText.trim(),
      rating: newReviewRating,
      date: new Date().toLocaleDateString('vi-VN'),
      verified: true
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);

    // Lưu vào localStorage
    try {
      const existingSaved = localStorage.getItem('custom_reviews');
      const parsedExisting = existingSaved ? JSON.parse(existingSaved) : [];
      localStorage.setItem('custom_reviews', JSON.stringify([newRev, ...parsedExisting]));
    } catch (e) {}

    setShowWriteReviewModal(false);
    setNewReviewText('');
    setReviewToast('Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được xuất bản.');
    setTimeout(() => setReviewToast(null), 4000);
  };

  // Tính toán danh sách đánh giá hiển thị theo phân trang
  const currentReviews = showAllReviews 
    ? reviewsList 
    : reviewsList.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage);

  return (
    <>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung</a>

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

          {/* Thanh tìm kiếm trung tâm */}
          <div className="search-shell">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Bạn muốn tìm nông sản gì hôm nay? (Rau cải, bơ sáp, dâu tây...)" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            <button className="go" onClick={() => router.push(`/products?search=${encodeURIComponent(searchQuery)}`)} aria-label="Tìm kiếm">
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

        {/* ── TẦNG 3: SUB-NAVBAR 4 MỤC CHÍNH ── */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>
                Trang chủ
              </Link>
              <Link href="/products" className="subnav-link">
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

      <main id="main">
        {/* ── 1. BANNER HERO AI SLIDER (Full width & Bắt mắt) ── */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0F2314',
          minHeight: '520px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Background Images */}
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: currentSlide === idx ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: 1
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(0.65)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(15,35,20,0.85) 0%, rgba(15,35,20,0.4) 60%, rgba(15,35,20,0.2) 100%)'
              }} />
            </div>
          ))}

          {/* Content Overlay */}
          <div className="wrap" style={{ position: 'relative', zIndex: 2, padding: '60px 24px', width: '100%' }}>
            <div style={{ maxWidth: '640px', color: '#FFFFFF' }}>
              <span style={{
                display: 'inline-block',
                backgroundColor: 'var(--green-700)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px',
                boxShadow: '0 2px 10px rgba(46, 125, 50, 0.4)'
              }}>
                {activeSlideData.eyebrow}
              </span>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '44px',
                lineHeight: '1.2',
                fontWeight: '800',
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                whiteSpace: 'pre-line',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {activeSlideData.title}
              </h1>

              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#EAF4E9',
                margin: '0 0 28px 0',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }}>
                {activeSlideData.desc}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href={activeSlideData.ctaLink}
                  className="btn btn-accent"
                  style={{
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    borderRadius: '999px',
                    boxShadow: '0 4px 20px rgba(255, 152, 0, 0.4)'
                  }}
                >
                  {activeSlideData.ctaText} →
                </Link>

                <Link
                  href={activeSlideData.subLink}
                  style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: '14.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s'
                  }}
                >
                  {activeSlideData.subLinkText}
                </Link>
              </div>
            </div>
          </div>

          {/* Slider Dots */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            zIndex: 3,
            display: 'flex',
            gap: '8px'
          }}>
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: currentSlide === i ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: currentSlide === i ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ── 2. SẢN PHẨM NỔI BẬT (Bestsellers) ── */}
        <section className="section" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div className="wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
              <div>
                <span className="eyebrow">Thu Hoạch Trong Ngày</span>
                <h2 className="section-title" style={{ marginTop: '6px', fontSize: '30px' }}>
                  Nông Sản Hữu Cơ Nổi Bật
                </h2>
              </div>
              <Link
                href="/products"
                style={{
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: 'var(--ink)',
                  textDecoration: 'none',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--line)',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                Xem tất cả →
              </Link>
            </div>

            {/* Grid 8 sản phẩm nổi bật */}
            <div className="prod-grid">
              {products.slice(0, 8).map(p => (
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

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link
                href="/products"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--ink)',
                  border: '1.5px solid var(--line)',
                  padding: '10px 32px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}
              >
                Xem tất cả
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. BLOG DINH DƯỠNG & MẸO NÔNG NGHIỆP SẠCH (TÍCH HỢP ĐIỂM TIN BÁO CHÍ NÔNG SẢN TỪ API) ── */}
        <section className="section" id="blog" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--line)', padding: '60px 0' }}>
          <div className="wrap">
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 28px auto' }}>
              <span className="eyebrow">Cẩm Nang &amp; Tin Tức Nông Nghiệp</span>
              <h2 className="section-title" style={{ marginTop: '8px', fontSize: '32px' }}>
                Blog Dinh Dưỡng &amp; Mẹo Nông Nghiệp Sạch
              </h2>
              <p style={{ color: 'var(--ink-soft)', fontSize: '15px', margin: '10px 0 0 0' }}>
                Tổng hợp kiến thức dinh dưỡng thực vật, mẹo bảo quản rau củ tươi ngon cùng điểm tin nông sản từ các tờ báo chính thống (Báo Dân Việt, Nông Nghiệp Việt Nam, VnExpress).
              </p>
            </div>

            {/* Thanh Tab phân loại chủ đề */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {[
                { key: 'all', label: 'Tất cả bài viết' },
                { key: 'news', label: 'Bản tin Báo chí Nông sản (API)' },
                { key: 'kitchen', label: 'Mẹo Nhà Bếp & Bảo Quản' },
                { key: 'nutrition', label: 'Dinh Dưỡng & Cẩm Nang Sống Khỏe' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setNewsFilter(tab.key)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    border: newsFilter === tab.key ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                    backgroundColor: newsFilter === tab.key ? 'var(--green-700)' : 'var(--bg)',
                    color: newsFilter === tab.key ? '#ffffff' : 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: newsFilter === tab.key ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Danh sách bài viết được lọc */}
            {(() => {
              // Chuẩn bị danh sách bài kết hợp
              const newsFormatted = newsArticles.map((art, idx) => ({
                id: 'news-' + (art.id || idx),
                title: art.title,
                desc: art.summary,
                tag: art.source, // Báo Dân Việt, Báo Nông Nghiệp VN, VnExpress
                date: art.pubDate,
                author: art.source,
                image: art.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
                link: art.link,
                isNews: true,
                categoryType: 'news'
              }));

              const internalBlogs = blogsData.map(b => ({
                ...b,
                isNews: false,
                categoryType: b.tag === 'Mẹo Nhà Bếp' ? 'kitchen' : 'nutrition'
              }));

              let displayList: any[] = [];
              if (newsFilter === 'all') {
                // Hiển thị xen kẽ mẹo dinh dưỡng và các bài báo nông nghiệp
                displayList = [...internalBlogs, ...newsFormatted.slice(0, 3)];
              } else if (newsFilter === 'news') {
                displayList = newsFormatted;
              } else if (newsFilter === 'kitchen') {
                displayList = internalBlogs.filter(b => b.categoryType === 'kitchen');
              } else if (newsFilter === 'nutrition') {
                displayList = internalBlogs.filter(b => b.categoryType === 'nutrition');
              }

              if (loadingNews && newsFilter === 'news') {
                return (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--ink-soft)', fontSize: '14px' }}>
                    Đang cập nhật các bài báo nông sản từ tòa soạn...
                  </div>
                );
              }

              if (displayList.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-soft)' }}>
                    Chưa có bài viết trong danh mục này.
                  </div>
                );
              }

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {displayList.map(item => (
                    <article
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid var(--line)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                    >
                      {/* Ảnh bìa */}
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: item.isNews ? 'rgba(15, 23, 42, 0.85)' : 'var(--green-700)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          letterSpacing: '0.3px',
                          backdropFilter: 'blur(4px)'
                        }}>
                          {item.tag}
                        </span>
                      </div>

                      {/* Nội dung bài viết */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{item.date}</span>
                            <span>•</span>
                            <span>{item.author}</span>
                          </div>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '16.5px', color: 'var(--ink)', lineHeight: '1.4', fontWeight: '700' }}>
                            {item.isNews ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'none' }}
                                title="Bấm để đọc bài báo gốc"
                              >
                                {item.title}
                              </a>
                            ) : (
                              item.title
                            )}
                          </h3>
                          <p style={{
                            margin: 0,
                            fontSize: '13.5px',
                            color: 'var(--ink-soft)',
                            lineHeight: '1.55',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {item.desc}
                          </p>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                          {item.isNews ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'var(--green-700)',
                                fontSize: '13px',
                                fontWeight: '700',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>Đọc bài báo gốc trên {item.tag.replace('Báo ', '')}</span>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </a>
                          ) : (
                            <span style={{ color: 'var(--green-700)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              Đọc cẩm nang chi tiết →
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── 4. KHÁCH HÀNG TIN CHỌN (ĐÁNH GIÁ CÓ XEM THÊM & PHÂN TRANG) ── */}
        <section className="section" style={{ backgroundColor: 'var(--bg)', borderTop: '1px solid var(--line)', padding: '60px 0' }}>
          <div className="wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              <div>
                <span className="eyebrow">Khách Hàng Nói Gì Về LÀNH</span>
                <h2 className="section-title" style={{ marginTop: '8px', fontSize: '32px' }}>
                  Được Tin Dùng Bởi Hơn 40.000 Gia Đình Việt
                </h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', margin: '6px 0 0 0' }}>
                  Những chia sẻ chân thực từ các bà nội trợ, đầu bếp và người tiêu dùng thông thái.
                </p>
              </div>

              {/* Nhóm nút: Viết đánh giá & Xem tất cả */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(true)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: 'var(--green-700)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(46,125,50,0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Gửi đánh giá của bạn
                </button>

                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    border: '1.5px solid var(--green-700)',
                    backgroundColor: showAllReviews ? 'var(--green-700)' : 'transparent',
                    color: showAllReviews ? '#FFFFFF' : 'var(--green-700)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {showAllReviews ? 'Thu gọn phân trang' : `Xem tất cả ${reviewsList.length} đánh giá`}
                </button>
              </div>
            </div>

            {/* Grid Đánh giá hiển thị */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {currentReviews.map(review => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid var(--line)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Hàng sao và ngày */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div className="stars" style={{ fontSize: '15px' }}>
                        <span className="fill">{'★'.repeat(review.rating)}</span>
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{review.date}</span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: '1.6', margin: '0 0 16px 0', fontStyle: 'italic' }}>
                      "{review.text}"
                    </p>
                  </div>

                  {/* Thông tin người đánh giá */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--green-700)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {review.name}
                        {review.verified && (
                          <span style={{ fontSize: '11px', color: 'var(--green-700)', fontWeight: 'bold' }} title="Đã mua hàng xác thực">
                            Đã mua
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                        {review.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang đánh giá (Hiện khi không ở chế độ Xem tất cả) */}
            {!showAllReviews && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '16px'
              }}>
                <button
                  disabled={reviewPage === 1}
                  onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    backgroundColor: reviewPage === 1 ? 'var(--line)' : 'var(--surface)',
                    color: reviewPage === 1 ? 'var(--ink-soft)' : 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: reviewPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: reviewPage === 1 ? 0.6 : 1
                  }}
                >
                  ← Trang trước
                </button>

                {Array.from({ length: totalReviewPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = reviewPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setReviewPage(pageNum)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: isActive ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: isActive ? 'var(--green-700)' : 'var(--surface)',
                        color: isActive ? '#FFFFFF' : 'var(--ink)',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={reviewPage === totalReviewPages}
                  onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    backgroundColor: reviewPage === totalReviewPages ? 'var(--line)' : 'var(--surface)',
                    color: reviewPage === totalReviewPages ? 'var(--ink-soft)' : 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: reviewPage === totalReviewPages ? 'not-allowed' : 'pointer',
                    opacity: reviewPage === totalReviewPages ? 0.6 : 1
                  }}
                >
                  Trang sau →
                </button>
              </div>
            )}
          </div>
        </section>


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

      {/* ── TOAST THÔNG BÁO ĐÁNH GIÁ THÀNH CÔNG ── */}
      {reviewToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#15803D',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 10001,
          fontSize: '13.5px',
          fontWeight: '600'
        }}>
          {reviewToast}
        </div>
      )}

      {/* ── MODAL GỬI ĐÁNH GIÁ CỦA NGƯỜI DÙNG ── */}
      {showWriteReviewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowWriteReviewModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px 28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--ink)' }}>
                  Gửi Đánh Giá Của Bạn
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Chia sẻ trải nghiệm thực tế với nông sản tươi LÀNH Farm
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWriteReviewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-soft)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Chọn số sao */}
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  Mức độ hài lòng của bạn:
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '30px',
                        cursor: 'pointer',
                        color: star <= newReviewRating ? '#EAB308' : '#D1D5DB',
                        transition: 'transform 0.1s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--green-700)', fontWeight: '600', marginTop: '4px' }}>
                  {newReviewRating === 5 && 'Tuyệt vời - Rất hài lòng'}
                  {newReviewRating === 4 && 'Hài lòng - Nông sản tươi ngon'}
                  {newReviewRating === 3 && 'Bình thường - Tạm được'}
                  {newReviewRating === 2 && 'Chưa hài lòng'}
                  {newReviewRating === 1 && 'Kém - Cần cải thiện'}
                </div>
              </div>

              {/* Họ và tên */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
                  Họ và tên của bạn: *
                </label>
                <input
                  type="text"
                  required
                  value={newReviewName}
                  onChange={e => setNewReviewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Nghề nghiệp / Khu vực */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
                  Khu vực / Nghề nghiệp:
                </label>
                <input
                  type="text"
                  value={newReviewRole}
                  onChange={e => setNewReviewRole(e.target.value)}
                  placeholder="Ví dụ: Nội trợ tại Q.7, Khách mua tại Hà Nội..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Nội dung đánh giá */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>
                  Nội dung đánh giá &amp; Cảm nhận: *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về chất lượng rau củ, đóng gói bảo quản và dịch vụ giao hàng của LÀNH Farm..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Nút submit */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWriteReviewModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--green-700)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(46,125,50,0.25)'
                  }}
                >
                  Xuất bản đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
