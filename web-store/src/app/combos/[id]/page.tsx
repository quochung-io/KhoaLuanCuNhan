'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/app/combos/[id]/page.tsx
// MÔ TẢ: Trang giao diện khách hàng (combos/[id]/page.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Next.js).
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/layout/SearchBar';

interface ComboItemInfo {
  name: string;
  weight: string;
  region: string;
  benefit: string;
  imageUrl: string;
}

export interface SelectableProduceItem {
  id: number;
  name: string;
  weight: string;
  region: string;
  category: string;
  benefit: string;
  imageUrl: string;
}

export interface SupplierProfile {
  id: number;
  name: string;
  shortName: string;
  region: string;
  badge: string;
  producePool: SelectableProduceItem[];
}

// Tải và truy xuất dữ liệu (getComboSlotCount)
function getComboSlotCount(id: number): number {
  if (id === 902 || id === 905) return 5;
  if (id === 903 || id === 906 || id === 908 || id === 909) return 4;
  return 3;
}

interface ComboDetail {
  id: number;
  name: string;
  subtitle: string;
  desc: string;
  badge?: string;
  weekPrice: number;
  monthPrice: number;
  rating: number;
  reviewsCount: number;
  servingSize: string;
  gallery: string[];
  features: string[];
  items: ComboItemInfo[];
  harvestProcess: Array<{ time: string; step: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  customerReviews: Array<{ author: string; role: string; date: string; rating: number; comment: string }>;
  cert?: string;
  region?: string;
  lotCode?: string;
  category?: string;
}

const emptyCombo: ComboDetail = {
  id: 0,
  name: '',
  subtitle: '',
  desc: '',
  badge: undefined,
  weekPrice: 0,
  monthPrice: 0,
  rating: 0,
  reviewsCount: 0,
  servingSize: '',
  gallery: [],
  features: [],
  items: [],
  harvestProcess: [
    { time: '04:00 Sáng', step: 'Thu hoạch sương sớm', desc: 'Bà con nông dân thu hoạch nông sản tươi mát đầu ngày từ nông trại đối tác.' },
    { time: '06:30 Sáng', step: 'Kiểm định & Phân loại', desc: 'Làm sạch sơ bộ, kiểm tra tiêu chuẩn chất lượng và đóng gói bảo quản.' },
    { time: '08:00 Sáng', step: 'Vận chuyển FreshLock', desc: 'Đóng thùng giữ nhiệt và chuyển lên xe bảo ôn chuyên dụng.' },
    { time: '09:30 - 11:30', step: 'Giao tận nơi', desc: 'Shipper trao tận tay giỏ nông sản kèm thông tin truy xuất nguồn gốc.' }
  ],
  faqs: [
    { q: 'Nếu trong combo có món tôi không thích ăn thì sao?', a: 'Quý khách có thể đổi sang loại nông sản khác có giá trị tương đương hoàn toàn miễn phí trước 24 giờ.' },
    { q: 'Gia đình tôi đi công tác có thể tạm hoãn gói không?', a: 'Quý khách có thể tạm hoãn gói và các đợt giao chưa dùng sẽ được bảo lưu sang các tuần tiếp theo.' }
  ],
  customerReviews: []
};

// Thực thi nghiệp vụ hàm ComboDetailPage
export default function ComboDetailPage() {
  const params = useParams();
  const router = useRouter();
  const comboId = Number(params.id) || 0;
  const [combo, setCombo] = useState<ComboDetail>({ ...emptyCombo, id: comboId });
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  // Chu kỳ gói: Tuần (1 lần/tuần), 2 Tuần (2 lần giao), Tháng (4 lần giao)
  const [selectedFreq, setSelectedFreq] = useState<'week' | 'biweek' | 'month'>('week');
  // Ngày giao ưu tiên: Đủ 7 ngày từ Thứ 2 tới Chủ Nhật
  const [deliveryDay, setDeliveryDay] = useState<string>('Thứ 3');
  // Khung giờ giao: Chỉ hoạt động từ 7h tới 17h
  const [deliverySlot, setDeliverySlot] = useState<string>('07:00 - 09:30 (Sáng sớm)');
  // Số lượng gói
  const [quantity, setQuantity] = useState<number>(1);
  // Active Tab: Bỏ tab items, mặc định hiển thị reviews
  const [activeTab, setActiveTab] = useState<'reviews' | 'process' | 'faqs'>('reviews');
  // Selected Image trong gallery
  const [activeImage, setActiveImage] = useState<string>('');

  // Customizable Produce Picker state
  const maxSlots = getComboSlotCount(combo.id);

  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || (suppliers.length > 0 ? suppliers[0] : null);
  const comboSupplier = activeSupplier ? activeSupplier.name : (combo.region || '');

  // State lưu danh sách món nông sản do khách hàng tự chọn từ pool của nhà cung cấp hiện tại
  const [selectedProduce, setSelectedProduce] = useState<SelectableProduceItem[]>([]);

  // Chuyển đổi Nhà Cung Cấp: Cập nhật pool nông sản tương ứng (100% cùng 1 NCC)
  const handleSelectSupplier = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    const newSup = suppliers.find(s => s.id === supplierId);
    if (newSup) {
      setSelectedProduce(newSup.producePool.slice(0, maxSlots));
      showNotification(`Đã chuyển sang ${newSup.name}. Danh mục nông sản đã được cập nhật!`);
    }
  };

  // Điều khiển đóng/mở giao diện hoặc hộp thoại (toggleSelectProduce)
  const toggleSelectProduce = (item: SelectableProduceItem) => {
    const isSelected = selectedProduce.some(x => x.id === item.id);
    if (isSelected) {
      if (selectedProduce.length <= 1) {
        showNotification('Giỏ combo cần có ít nhất 1 món nông sản!');
        return;
      }
      setSelectedProduce(prev => prev.filter(x => x.id !== item.id));
    } else {
      if (selectedProduce.length >= maxSlots) {
        showNotification(`Gói combo này bạn được chọn tối đa ${maxSlots} món. Hãy bấm bỏ bớt 1 món trước khi chọn món mới nhé!`);
        return;
      }
      setSelectedProduce(prev => [...prev, item]);
    }
  };

  // Theme & User
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('vi');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reviews từ Database thật
  const [realReviews, setRealReviews] = useState<Array<{
    reviewId: number;
    productId: number;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    helpfulCount: number;
    isHelpfulByMe?: boolean;
    userRole?: string;
    roleLabel?: string;
    replies?: Array<{
      reviewId: number;
      customerName: string;
      comment: string;
      createdAt: string;
      userRole?: string;
      roleLabel?: string;
    }>;
  }>>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myName, setMyName] = useState('');
  const [myRole, setMyRole] = useState('');
  const [myComment, setMyComment] = useState('');

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Tải và truy xuất dữ liệu (fetchComboReviews)
  const fetchComboReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/reviews/product/${comboId}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.reviews || []);
        const mapped = list.map((r: any) => ({
          ...r,
          reviewId: Number(r.reviewId || r.id),
          customerName: r.customerName || r.name || 'Khách hàng',
          comment: r.comment || r.text || '',
          createdAt: r.createdAt || r.date || '',
          replies: (r.replies || []).map((rep: any) => ({
            ...rep,
            reviewId: Number(rep.reviewId || rep.id),
            customerName: rep.customerName || rep.name || 'Thành viên LÀNH',
            comment: rep.comment || rep.text || '',
            createdAt: rep.createdAt || rep.date || ''
          }))
        }));
        setRealReviews(mapped);
      } else {
        setRealReviews([]);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
      setRealReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Tự động cuộn xuống khu vực đánh giá nếu URL có hash #reviews
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#reviews') {
      setActiveTab('reviews');
      setTimeout(() => {
        const el = document.getElementById('reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  // Hàm xử lý sự kiện tương tác người dùng (handleLikeReview)
  const handleLikeReview = async (reviewId: number) => {
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để bấm thích đánh giá!');
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/reviews/${reviewId}/helpful?userId=${uId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setRealReviews(prev => prev.map(r => 
          r.reviewId === reviewId 
            ? { ...r, helpfulCount: data.helpfulCount, isHelpfulByMe: data.liked } 
            : r
        ));
      } else {
        alert(data.message || 'Không thể xử lý hữu ích.');
      }
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  // Hàm xử lý sự kiện tương tác người dùng (handleSendReply)
  const handleSendReply = async (parentReviewId: number) => {
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để gửi phản hồi đánh giá!');
      router.push('/login');
      return;
    }
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/reviews/${parentReviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: uId,
          comment: replyText.trim()
        })
      });
      if (res.ok) {
        showNotification('Đã gửi phản hồi thành công!');
        setReplyText('');
        setReplyingReviewId(null);
        fetchComboReviews();
      } else {
        const err = await res.json();
        alert(err.message || 'Gửi phản hồi thất bại.');
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Hàm xử lý sự kiện tương tác người dùng (handleCreateReview)
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const uId = currentUser?.id || currentUser?.userId;
    if (!uId) {
      alert('Vui lòng đăng nhập tài khoản để gửi đánh giá!');
      router.push('/login');
      return;
    }
    if (!myComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: comboId,
          customerId: uId,
          customerName: currentUser?.fullName || myName.trim() || 'Khách hàng LÀNH',
          email: currentUser?.email || null,
          rating: myRating,
          comment: myComment.trim(),
          imageUrls: []
        })
      });
      if (res.ok) {
        showNotification('Cảm ơn bạn! Đánh giá đã được lưu vào hệ thống.');
        setMyComment('');
        setShowReviewForm(false);
        fetchComboReviews();
      } else {
        const err = await res.json();
        alert(err.message || 'Gửi đánh giá thất bại');
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Điều khiển đóng/mở giao diện hoặc hộp thoại (toggleTheme)
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch (e) {}
    }
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) {}
    }
    fetchComboReviews();

    // 1. Fetch chi tiết combo từ API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/products/${comboId}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: any) => {
        if (!data) return;
        setCombo(prev => {
          const gallery = (data.productImages && data.productImages.length > 0)
            ? data.productImages.map((img: any) => img.imageUrl)
            : prev.gallery;
          if (gallery.length > 0) {
            setActiveImage(gallery[0]);
          }
          return {
            ...prev,
            id: data.productId,
            name: data.productName,
            subtitle: data.description ? data.description.slice(0, 120) : prev.subtitle,
            desc: data.description || prev.desc,
            weekPrice: data.price,
            monthPrice: data.originalPrice || Math.round(data.price * 3.6),
            rating: data.averageRating || prev.rating,
            reviewsCount: data.reviewsCount || prev.reviewsCount,
            gallery: gallery,
            cert: data.cert || data.status || '',
            region: data.region || data.origin || data.farmName || '',
            lotCode: data.lotCode || data.productBatches?.[0]?.batchCode || '',
            category: data.categoryName || 'Combo'
          };
        });
      })
      .catch(() => {});

    // 2. Fetch danh sách sản phẩm thật từ Database để làm kho nông sản tự chọn
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/products`)
      .then(res => (res.ok ? res.json() : null))
      .then((items: any[]) => {
        if (!Array.isArray(items) || items.length === 0) return;
        const freshProduce = items.filter(p => p.categoryId !== 5 && p.status !== 'Pending');
        if (freshProduce.length === 0) return;

        // Tạo dynamic suppliers từ danh sách products thật trong DB
        const supMap = new Map<number, SupplierProfile>();
        freshProduce.forEach(p => {
          const sId = p.supplierId || 1;
          const sName = p.supplier?.supplierName || p.farmName || `Hợp tác xã #${sId}`;
          const sRegion = p.region || p.origin || p.farmName || p.supplier?.province || '';
          if (!supMap.has(sId)) {
            supMap.set(sId, {
              id: sId,
              name: sName,
              shortName: sName.split('(')[0].trim(),
              region: sRegion,
              badge: p.categoryName || 'Nông sản sạch',
              producePool: []
            });
          }
          supMap.get(sId)!.producePool.push({
            id: p.productId,
            name: p.productName,
            weight: p.unit ? `1 ${p.unit}` : '500g',
            region: sRegion,
            category: p.categoryName || 'Nông sản sạch',
            benefit: p.description ? p.description.slice(0, 80) : '',
            imageUrl: p.productImages?.[0]?.imageUrl || ''
          });
        });
        const dynamicSups = Array.from(supMap.values());
        if (dynamicSups.length > 0) {
          setSuppliers(dynamicSups);
          setSelectedSupplierId(prev => (prev > 0 ? prev : dynamicSups[0].id));
          setSelectedProduce(prev => (prev.length > 0 ? prev : dynamicSups[0].producePool.slice(0, maxSlots)));
        }
      })
      .catch(() => {});
  }, [comboId]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Tính giá hiện tại theo chu kỳ được chọn
  let currentPrice = combo.weekPrice;
  let freqLabel = 'Giao theo tuần';
  let freqUnit = '/ tuần (1 lần giao)';
  let freqCartUnit = 'Gói/Tuần';
  if (selectedFreq === 'biweek') {
    currentPrice = Math.round(combo.weekPrice * 1.9);
    freqLabel = 'Gói 2 tuần';
    freqUnit = '/ 2 tuần (2 lần giao)';
    freqCartUnit = 'Gói/2 tuần';
  } else if (selectedFreq === 'month') {
    currentPrice = combo.monthPrice;
    freqLabel = 'Gói trọn tháng';
    freqUnit = '/ tháng (4 lần giao)';
    freqCartUnit = 'Gói/Tháng';
  }
  const currentPriceFormatted = currentPrice.toLocaleString('vi-VN') + '₫';

  // Hàm xử lý sự kiện tương tác người dùng (handleAddToCart)
  const handleAddToCart = () => {
    if (selectedProduce.length < maxSlots) {
      showNotification(`Vui lòng chọn đủ ${maxSlots} món nông sản tươi ngon cho gói combo này (Hiện tại bạn mới chọn ${selectedProduce.length}/${maxSlots} món)!`);
      const el = document.getElementById('custom-picker');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const finalComboId = combo.id;
    const supShortName = activeSupplier?.shortName ? ` - ${activeSupplier.shortName}` : '';
    const selectedSummary = selectedProduce.map(p => p.name).join(', ');

    const comboCartItem = {
      id: finalComboId,
      name: `${combo.name} (${freqLabel}${supShortName}) - Giao ${deliveryDay} (${deliverySlot})`,
      price: currentPriceFormatted,
      unit: freqCartUnit,
      category: combo.category || 'Combo Tự Chọn',
      cert: combo.cert || '',
      region: combo.region || comboSupplier || '',
      rating: combo.rating,
      reviews: combo.reviewsCount,
      icon: 'box',
      lot: combo.lotCode || '',
      imageUrl: activeImage,
      selectedItems: selectedProduce,
      selectedSummary: selectedSummary
    };

    setCart(prev => {
      const existing = prev.find(x => x.product.id === comboCartItem.id);
      if (existing) {
        return prev.map(x => (x.product.id === comboCartItem.id ? { ...x, qty: x.qty + quantity, product: comboCartItem } : x));
      }
      return [...prev, { product: comboCartItem, qty: quantity }];
    });

    setCartBounce(false);
    setTimeout(() => setCartBounce(true), 10);
    setIsDrawerOpen(true);
    showNotification(`Đã thêm ${quantity} giỏ ${combo.name} [${selectedSummary}] vào giỏ hàng!`);
  };

  // Hàm xử lý sự kiện tương tác người dùng (handleBuyNow)
  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 300);
  };

  // Cập nhật và đồng bộ dữ liệu (updateCartQty)
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

  return (
    <>
      {/* ── HEADER 3 TẦNG ĐỒNG BỘ 100% ── */}
      <header>
        {/* TẦNG 1: TOP BAR TIỆN ÍCH */}
        <div className="header-topbar">
          <div className="wrap topbar-row">
            <div className="topbar-left">
              <span><strong>LÀNH Farm</strong> - Nông sản sạch chuẩn VietGAP & Hữu cơ</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="topbar-link">Hotline CSKH: <strong>1900 8899</strong> (7:00 - 21:00)</span>
            </div>
            <div className="topbar-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="icon-btn" onClick={toggleTheme} style={{ width: '24px', height: '24px' }} title="Sáng / Tối">
                  {theme === "light" ? "Tối" : "Sáng"}
                </button>
                <div className="lang-switch">
                  <button className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>VI</button>
                  <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
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

          {/* Ô Tìm kiếm */}
          <SearchBar />

          {/* Nhóm nút tác vụ Header */}
          <div className="header-actions">
            {/* Tài khoản */}
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
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                </span>
                <div className="header-action-text">
                  <span className="header-action-label">Xin chào,</span>
                  <span className="header-action-value" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser ? currentUser.fullName : "Tài khoản"}
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
                      <Link href="/profile" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid var(--line)' }}>
                        Hồ sơ & Sổ địa chỉ
                      </Link>
                      <Link href="/orders" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid var(--line)' }}>
                        Đơn hàng của tôi
                      </Link>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('customer_user');
                          setCurrentUser(null);
                          setShowUserDropdown(false);
                          window.location.reload();
                        }}
                        style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#e53e3e', fontSize: '13px', fontWeight: '700' }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: '600' }}>
                        Đăng nhập
                      </Link>
                      <Link href="/register" style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--green-700)', fontSize: '13px', fontWeight: '600' }}>
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
                <span className="badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
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

        {/* TẦNG 3: SUB-NAVBAR */}
        <div className="header-subnav">
          <div className="wrap subnav-row">
            <div className="subnav-links">
              <Link href="/" className="subnav-link">Trang chủ</Link>
              <Link href="/products" className="subnav-link">Tất cả nông sản</Link>
              <Link href="/combos" className="subnav-link active" style={{ color: 'var(--green-700)', fontWeight: '700' }}>Combo định kỳ</Link>
              <Link href="/traceability" className="subnav-link">Truy xuất nguồn gốc</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── NỘI DUNG CHÍNH TRANG CHI TIẾT COMBO ── */}
      <main style={{ backgroundColor: 'var(--bg)', minHeight: '85vh', padding: '28px 20px 70px', color: 'var(--ink)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Trang chủ</Link>
            <span>/</span>
            <Link href="/combos" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>Combo định kỳ</Link>
            <span>/</span>
            <span style={{ color: 'var(--green-700)', fontWeight: '600' }}>{combo.name}</span>
          </div>

          {/* Toast thông báo nhanh */}
          {toast && (
            <div style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              backgroundColor: 'var(--green-700)',
              color: '#ffffff',
              padding: '12px 22px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 9999,
              fontSize: '13.5px',
              fontWeight: '600'
            }}>
              {toast}
            </div>
          )}

          {/* ── HERO SECTION: 2 CỘT (HÌNH ẢNH & THÔNG TIN ĐẶT COMBO) ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '36px',
            backgroundColor: 'var(--surface)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)',
            marginBottom: '40px'
          }}>
            {/* CỘT TRÁI: THƯ VIỆN ẢNH COMBO */}
            <div>
              {/* Ảnh chính lớn */}
              <div style={{
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--line)',
                marginBottom: '14px',
                backgroundColor: '#f1f5f9'
              }}>
                {combo.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    zIndex: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {combo.badge}
                  </span>
                )}
                <img
                  src={activeImage}
                  alt={combo.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Hàng ảnh thu nhỏ (Thumbnails) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {combo.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    style={{
                      padding: 0,
                      border: activeImage === img ? '2.5px solid var(--green-700)' : '1px solid var(--line)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '75px',
                      cursor: 'pointer',
                      opacity: activeImage === img ? 1 : 0.7,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>

              {/* Thẻ cam kết bảo đảm chất lượng */}
              <div style={{
                marginTop: '20px',
                backgroundColor: 'var(--bg)',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid var(--line)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>100% Thu hoạch sớm</strong>
                  Hái lúc 4h sáng, giao trong ngày
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Đổi món trong 24h</strong>
                  Linh hoạt theo khẩu vị gia đình
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Freeship toàn bộ</strong>
                  Giao định kỳ tận bếp đúng hẹn
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                  <strong style={{ color: 'var(--green-700)', display: 'block' }}>Bảo hiểm tươi ngon</strong>
                  Đổi trả 1-1 nếu dập úa khi nhận
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT & CẤU HÌNH ĐẶT GÓI COMBO */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: 'var(--green-100)',
                  color: 'var(--green-900)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Combo Đang Mùa Rộ
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Mã: LOT#VN-COMBO-{combo.id}
                </span>
              </div>

              <h1 style={{
                fontSize: '26px',
                fontWeight: '800',
                color: 'var(--green-900)',
                margin: '0 0 8px 0',
                lineHeight: '1.3'
              }}>
                {combo.name}
              </h1>

              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                {combo.subtitle}
              </p>

              {/* Đánh giá & Số lượng người dùng */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', fontSize: '13px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
                <div 
                  onClick={() => {
                    setActiveTab('reviews');
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  title="Bấm để cuộn xuống xem các đánh giá của gói combo"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: '700', cursor: 'pointer' }}
                >
                  <span>⭐ {combo.rating}</span>
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 'normal', textDecoration: 'underline' }}>({combo.reviewsCount} đánh giá từ các hộ gia đình)</span>
                </div>
                <span style={{ color: 'var(--line)' }}>|</span>
                <span style={{ color: 'var(--green-700)', fontWeight: '600' }}>Đang phục vụ 350+ hộ gia đình</span>
              </div>

              {/* Khung Giá Gói Combo */}
              <div style={{
                backgroundColor: 'var(--bg)',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '30px', fontWeight: '800', color: '#e53e3e', fontFamily: 'var(--font-display)' }}>
                    {currentPriceFormatted}
                  </span>
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-soft)', fontWeight: '500' }}>
                    {selectedFreq === 'week' ? '/ tuần (1 lần giao)' : '/ tháng (4 lần giao tận nơi)'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--green-700)', marginTop: '4px', fontWeight: '600' }}>
                  {selectedFreq === 'month' ? 'Tiết kiệm đến 18% so với đặt lẻ từng tuần & Miễn phí ship toàn bộ 4 tuần' : 'Tự động giao đúng lịch hàng tuần, có thể hủy hoặc tạm ngưng bất cứ lúc nào'}
                </div>
              </div>

              {/* 1. Chọn Chu kỳ Gói (Tuần / 2 Tuần / Trọn Tháng) */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>
                    1. Chọn chu kỳ gói:
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--green-700)', fontWeight: '600' }}>
                    * Có thể thay đổi linh hoạt bất cứ lúc nào
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFreq('week')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'week' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'week' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'week' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'week' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Theo tuần</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>1 đợt / tuần</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFreq('biweek')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'biweek' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'biweek' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'biweek' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'biweek' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Gói 2 tuần</div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>2 đợt giao</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFreq('month')}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: selectedFreq === 'month' ? '2px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: selectedFreq === 'month' ? 'var(--green-100)' : '#ffffff',
                      color: selectedFreq === 'month' ? 'var(--green-900)' : 'var(--ink)',
                      fontWeight: selectedFreq === 'month' ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>Trọn tháng</div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>4 đợt (Tiết kiệm)</div>
                  </button>
                </div>
              </div>

              {/* 2. Chọn Ngày Giao Hàng Trong Tuần (Hoạt động từ Thứ 2 tới Chủ Nhật) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                  2. Chọn ngày nhận hàng trong tuần (Giao đều đặn cả tuần Thứ 2 - CN):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setDeliveryDay(day)}
                      style={{
                        padding: '7px 8px',
                        borderRadius: '6px',
                        border: deliveryDay === day ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliveryDay === day ? 'var(--green-700)' : '#ffffff',
                        color: deliveryDay === day ? '#ffffff' : 'var(--ink)',
                        fontSize: '12px',
                        fontWeight: deliveryDay === day ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Chọn Khung Giờ Nhận Hàng (Chỉ giao hàng từ 7h tới 17h chiều) */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>
                    3. Khung giờ giao hàng ưu tiên:
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    (Khung giờ từ 7h00 - 17h00 hàng ngày)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    '07:00 - 09:30 (Sáng sớm)',
                    '09:30 - 12:00 (Trưa)',
                    '13:30 - 15:30 (Đầu giờ chiều)',
                    '15:30 - 17:00 (Cuối buổi chiều)'
                  ].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliverySlot(slot)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: deliverySlot === slot ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: deliverySlot === slot ? 'var(--green-100)' : '#ffffff',
                        color: deliverySlot === slot ? 'var(--green-900)' : 'var(--ink)',
                        fontSize: '11.5px',
                        fontWeight: deliverySlot === slot ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Chọn Số Lượng & Các Nút Hành Động */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                    aria-label="Giảm"
                    title="Giảm 1 (hoặc dùng phím mũi tên Xuống)"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) {
                        setQuantity(1);
                      } else {
                        setQuantity(Math.max(1, Math.min(999, val)));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setQuantity(q => Math.min(999, q + 1));
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setQuantity(q => Math.max(1, q - 1));
                      }
                    }}
                    onBlur={() => {
                      if (!quantity || quantity < 1) setQuantity(1);
                    }}
                    style={{
                      width: '46px',
                      height: '36px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      MozAppearance: 'textfield'
                    }}
                    title="Nhập số lượng hoặc dùng phím mũi tên Lên/Xuống trên bàn phím"
                    aria-label="Số lượng gói combo"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    style={{ border: 'none', background: 'none', padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', userSelect: 'none' }}
                    aria-label="Tăng"
                    title="Tăng 1 (hoặc dùng phím mũi tên Lên)"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--green-700)',
                    backgroundColor: '#ffffff',
                    color: 'var(--green-700)',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  style={{
                    flex: 1.2,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--green-700)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  Đặt combo ngay
                </button>
              </div>

            </div>
          </div>


          {/* ── BƯỚC TỰ CHỌN NÔNG SẢN TƯƠI SẠCH (CUSTOM PRODUCE PICKER) ── */}
          <div id="custom-picker" style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--line)',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: 'var(--shadow)'
          }}>
            {/* Header: Đơn giản, không màu mè */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 4px 0' }}>
                  Lựa chọn nông sản cho combo (Tự chọn {maxSlots} món)
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Khách hàng tùy ý chọn Nhà cung cấp và nông sản yêu thích. Toàn bộ nông sản trong combo thuộc cùng một nhà cung cấp.
                </div>
              </div>

              {/* Tiến độ chọn món gọn gàng */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: selectedProduce.length === maxSlots ? '#DCFCE7' : '#FEF3C7',
                border: selectedProduce.length === maxSlots ? '1px solid #86EFAC' : '1px solid #FDE68A',
                fontSize: '12.5px',
                fontWeight: '700',
                color: selectedProduce.length === maxSlots ? '#15803D' : '#92400E'
              }}>
                <span>Tiến độ:</span>
                <span style={{ fontSize: '14px' }}>{selectedProduce.length}/{maxSlots} món</span>
                {selectedProduce.length === maxSlots ? (
                  <span>(✓ Đủ món)</span>
                ) : (
                  <span style={{ fontWeight: 'normal' }}>(Chọn thêm {maxSlots - selectedProduce.length} món)</span>
                )}
              </div>
            </div>

            {/* BỘ CHỌN NHÀ CUNG CẤP YÊU THÍCH (TỐI GIẢN) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>
                🏢 Chọn Nhà Cung Cấp cung ứng gói combo:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {suppliers.map(sup => {
                  const isCurSup = selectedSupplierId === sup.id;
                  return (
                    <button
                      key={sup.id}
                      type="button"
                      onClick={() => handleSelectSupplier(sup.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isCurSup ? '2px solid var(--green-700)' : '1px solid var(--line)',
                        backgroundColor: isCurSup ? '#F0FDF4' : '#ffffff',
                        color: isCurSup ? 'var(--green-900)' : 'var(--ink)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px' }}>{sup.shortName}</strong>
                        {isCurSup && (
                          <span style={{ fontSize: '11px', color: 'var(--green-700)', fontWeight: '700' }}>✓ Đang chọn</span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{sup.region}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thông tin nhà cung cấp hiện tại */}
            {activeSupplier && (
              <div style={{
                fontSize: '12.5px',
                color: 'var(--ink-soft)',
                backgroundColor: 'var(--bg)',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '18px',
                border: '1px solid var(--line)'
              }}>
                Đang xem danh mục của: <strong style={{ color: 'var(--green-900)' }}>{activeSupplier.name}</strong> • {activeSupplier.badge}
              </div>
            )}

            {/* Produce Cards Grid: Thiết kế đơn giản, không màu mè */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px'
            }}>
              {(activeSupplier?.producePool || []).map(item => {
                const isSelected = selectedProduce.some(x => x.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectProduce(item)}
                    style={{
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--green-700)' : '1px solid var(--line)',
                      backgroundColor: isSelected ? '#F0FDF4' : '#ffffff',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ height: '110px', overflow: 'hidden', position: 'relative', backgroundColor: '#f8fafc' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.category}
                      </span>
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'var(--green-700)',
                          color: '#ffffff',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          ✓ Đã chọn
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{item.name}</strong>
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--green-700)', marginLeft: '4px' }}>{item.weight}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                        {item.region}
                      </div>

                      <button
                        type="button"
                        style={{
                          marginTop: 'auto',
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '5px',
                          border: isSelected ? '1px solid var(--green-700)' : '1px solid var(--line)',
                          backgroundColor: isSelected ? 'var(--green-700)' : '#ffffff',
                          color: isSelected ? '#ffffff' : 'var(--ink)',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ Đã chọn' : '+ Chọn món'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TABS NỘI DUNG CHI TIẾT (BỎ TAB ITEMS, MẶC ĐỊNH HIỂN THỊ ĐÁNH GIÁ) ── */}
          <div 
            id="reviews-section"
            style={{
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            marginBottom: '48px'
          }}>
            {/* Header Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--line)',
              backgroundColor: 'var(--bg)',
              overflowX: 'auto'
            }}>
              {[
                { key: 'reviews', label: `⭐ Đánh giá từ khách hàng (${realReviews.length})` },
                { key: 'process', label: 'Quy trình từ vườn đến bàn ăn' },
                { key: 'faqs', label: 'Câu hỏi thường gặp & Chính sách' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '14px 24px',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? '3px solid var(--green-700)' : '3px solid transparent',
                    backgroundColor: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--green-900)' : 'var(--ink-soft)',
                    fontWeight: activeTab === tab.key ? '700' : '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body Tabs */}
            <div style={{ padding: '32px' }}>

              {/* TAB 2: QUY TRÌNH TỪ VƯỜN ĐẾN BÀN ĂN */}
              {activeTab === 'process' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 16px 0' }}>
                    Hành trình 6 giờ từ nông trại đến gian bếp của bạn
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {combo.harvestProcess.map((proc, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                        <div style={{
                          backgroundColor: 'var(--green-100)',
                          color: 'var(--green-900)',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          {proc.time}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--ink)' }}>
                            {proc.step}
                          </h4>
                          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: '1.5' }}>
                            {proc.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CÂU HỎI THƯỜNG GẶP */}
              {activeTab === 'faqs' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: '0 0 16px 0' }}>
                    Những câu hỏi thường gặp khi đăng ký combo định kỳ
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {combo.faqs.map((faq, idx) => (
                      <div key={idx} style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--bg)',
                        borderRadius: '10px',
                        border: '1px solid var(--line)'
                      }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--green-900)', marginBottom: '6px' }}>
                          Q: {faq.q}
                        </div>
                        <div style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5' }}>
                          {faq.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ĐÁNH GIÁ CỦA KHÁCH HÀNG (DỮ LIỆU THẬT DATABASE, LIKE & REPLY) */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
                        Nhận xét thực tế từ khách hàng ({realReviews.length})
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: '700', marginTop: '2px' }}>
                        Điểm trung bình: {combo.rating} / 5.0 ⭐ (100% đánh giá thực)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          alert('Vui lòng đăng nhập tài khoản để viết đánh giá!');
                          router.push('/login');
                          return;
                        }
                        setShowReviewForm(!showReviewForm);
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: showReviewForm ? '#f1f5f9' : 'var(--green-700)',
                        color: showReviewForm ? 'var(--ink)' : '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {showReviewForm ? 'Đóng biểu mẫu' : 'Viết đánh giá của bạn'}
                    </button>
                  </div>

                  {/* FORM GỬI ĐÁNH GIÁ TRỰC TIẾP */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleCreateReview}
                      style={{
                        backgroundColor: 'var(--bg)',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        marginBottom: '24px'
                      }}
                    >
                      <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: 'var(--ink)', fontWeight: '700' }}>
                        Chia sẻ cảm nhận của bạn về gói {combo.name}
                      </h4>

                      {/* Chọn sao */}
                      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>Đánh giá:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setMyRating(star)}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: star <= myRating ? '#EAB308' : '#D1D5DB'
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--green-700)', fontWeight: '600' }}>
                          ({myRating} sao)
                        </span>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '4px' }}>Nhận xét chi tiết *</label>
                        <textarea
                          required
                          rows={3}
                          value={myComment}
                          onChange={e => setMyComment(e.target.value)}
                          placeholder="Chia sẻ về độ tươi ngon của nông sản trong giỏ, hương vị, việc đóng gói bảo quản..."
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--line)', background: '#ffffff', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: 'var(--green-700)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Gửi đánh giá
                        </button>
                      </div>
                    </form>
                  )}

                  {loadingReviews ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink-soft)' }}>
                      Đang tải đánh giá từ máy chủ...
                    </div>
                  ) : realReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--bg)', borderRadius: '14px', border: '1.5px dashed var(--line)' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌱</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--green-900)' }}>Chưa có đánh giá nào cho gói combo này</div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', marginBottom: '16px' }}>
                        Hãy là người đầu tiên trải nghiệm gói nông sản tươi này và để lại nhận xét nhé!
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            alert('Vui lòng đăng nhập tài khoản để viết đánh giá!');
                            router.push('/login');
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'var(--green-700)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                        }}
                      >
                        ✍️ Viết đánh giá đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {realReviews.map((rev, revIdx) => (
                        <div key={rev.reviewId || (rev as any).id || `rev-${revIdx}`} className="review-item" style={{
                          padding: '18px 20px',
                          borderRadius: '12px',
                          border: '1px solid var(--line)',
                          backgroundColor: 'var(--bg)',
                          fontFamily: 'var(--font-review)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong className="review-author-name" style={{ fontSize: '14.5px', color: 'var(--ink)', fontWeight: 600 }}>
                                {rev.customerName || 'Khách hàng'}
                              </strong>
                              {rev.roleLabel && (
                                <span style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontWeight: '600',
                                  backgroundColor: rev.userRole === 'Admin' ? '#FEF3C7' : (rev.userRole === 'Supplier' ? '#E0F2FE' : '#F1F5F9'),
                                  color: rev.userRole === 'Admin' ? '#B45309' : (rev.userRole === 'Supplier' ? '#0369A1' : '#475569')
                                }}>
                                  {rev.roleLabel}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#FFB800', letterSpacing: '1px' }}>
                              {'★'.repeat(rev.rating || 5)}
                            </div>
                          </div>
                          
                          <p 
                            className="review-content-text"
                            style={{ 
                              margin: '0 0 10px 0', 
                              fontSize: '14.5px', 
                              color: 'var(--ink)', 
                              lineHeight: '1.65',
                              fontFamily: 'var(--font-review)',
                              fontWeight: 400
                            }}
                          >
                            "{rev.comment}"
                          </p>

                          {/* Footer của Review: Ngày đăng + Nút Like + Nút Trả lời */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '10px',
                            borderTop: '1px dashed var(--line)',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            <div className="review-meta-text" style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'} • Đã mua combo
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {/* Nút Thích */}
                              <button
                                type="button"
                                onClick={() => handleLikeReview(rev.reviewId)}
                                style={{
                                  background: rev.isHelpfulByMe ? 'var(--green-100)' : '#ffffff',
                                  border: rev.isHelpfulByMe ? '1px solid var(--green-700)' : '1px solid var(--line)',
                                  borderRadius: '999px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: rev.isHelpfulByMe ? '700' : '500',
                                  color: rev.isHelpfulByMe ? 'var(--green-900)' : 'var(--ink-soft)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>👍</span>
                                <span>{rev.isHelpfulByMe ? `Đã thích (${rev.helpfulCount || 0})` : `Hữu ích (${rev.helpfulCount || 0})`}</span>
                              </button>

                              {/* Nút Trả lời */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser) {
                                    alert('Vui lòng đăng nhập tài khoản để trả lời đánh giá!');
                                    router.push('/login');
                                    return;
                                  }
                                  setReplyingReviewId(replyingReviewId === rev.reviewId ? null : rev.reviewId);
                                  setReplyText('');
                                }}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid var(--line)',
                                  borderRadius: '999px',
                                  padding: '4px 10px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: 'var(--ink-soft)',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>💬</span>
                                <span>Trả lời</span>
                              </button>
                            </div>
                          </div>

                          {/* KHUNG NHẬP TRẢ LỜI (REPLY) */}
                          {replyingReviewId === rev.reviewId && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px 14px',
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              border: '1px solid var(--green-200)'
                            }}>
                              <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--green-900)', marginBottom: '6px' }}>
                                Trả lời nhận xét của {rev.customerName}:
                              </div>
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Nhập câu trả lời của bạn..."
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--line)',
                                  fontSize: '13px',
                                  outline: 'none',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit'
                                }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => setReplyingReviewId(null)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--line)',
                                    background: '#ffffff',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={submittingReply}
                                  onClick={() => handleSendReply(rev.reviewId)}
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--green-700)',
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: submittingReply ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* DANH SÁCH CÁC PHẢN HỒI CON (REPLIES LỒNG NHAU) */}
                          {rev.replies && rev.replies.length > 0 && (
                            <div style={{
                              marginTop: '12px',
                              paddingLeft: '14px',
                              borderLeft: '2.5px solid var(--green-700)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              {rev.replies.map((rep, repIdx) => (
                                <div key={rep.reviewId || (rep as any).id || `rep-${repIdx}`} style={{
                                  backgroundColor: '#ffffff',
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--line)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                                        {rep.customerName}
                                      </strong>
                                      {rep.roleLabel && (
                                        <span style={{
                                          fontSize: '10.5px',
                                          padding: '1px 6px',
                                          borderRadius: '999px',
                                          fontWeight: '600',
                                          backgroundColor: rep.userRole === 'Admin' ? '#FEF3C7' : (rep.userRole === 'Supplier' ? '#E0F2FE' : '#F1F5F9'),
                                          color: rep.userRole === 'Admin' ? '#B45309' : (rep.userRole === 'Supplier' ? '#0369A1' : '#475569')
                                        }}>
                                          {rep.roleLabel}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                                      {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink)', lineHeight: '1.5' }}>
                                    {rep.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── CÁC GÓI COMBO GỢI Ý TỪ CÁC NHÀ CUNG CẤP KHÁC ── */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green-900)', margin: '0 0 4px 0' }}>
                  📦 Gợi ý các gói Combo từ Nhà Cung Cấp &amp; Đối Tác khác
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Khám phá thêm các chương trình và combo định kỳ tươi sạch đa dạng từ các Hợp tác xã uy tín
                </p>
              </div>
              <Link href="/combos" style={{ fontSize: '13px', color: 'var(--green-700)', fontWeight: '700', textDecoration: 'none' }}>
                Xem tất cả gói combo &rarr;
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {[
                { 
                  id: 907, 
                  name: 'Combo Ăn Dặm Hữu Cơ Bé Yêu', 
                  supplier: 'HTX Nông Nghiệp An Phú', 
                  region: 'Đơn Dương - Lâm Đồng', 
                  price: '195.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
                  badge: 'GlobalGAP'
                },
                { 
                  id: 908, 
                  name: 'Combo Trái Cây Miệt Vườn Nam Bộ', 
                  supplier: 'HTX Trái Cây Việt', 
                  region: 'Đồng Nai & Bến Tre', 
                  price: '269.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
                  badge: 'Đặc sản chín cây'
                },
                { 
                  id: 909, 
                  name: 'Combo Rau Đồng Nấu Lẩu Thực Dưỡng', 
                  supplier: 'HTX Rau Sạch Miền Tây', 
                  region: 'Đồng Tháp', 
                  price: '175.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=80',
                  badge: 'Hương vị quê nhà'
                },
                { 
                  id: 910, 
                  name: 'Combo Salad Eat-Clean Năng Lượng', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '215.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=80',
                  badge: 'Eat-Clean Healthy'
                },
                { 
                  id: 901, 
                  name: 'Combo Gia Đình Nhỏ (Tuần)', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '189.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
                  badge: 'Phổ biến nhất'
                },
                { 
                  id: 903, 
                  name: 'Combo Thuần Chay Sạch (Tuần)', 
                  supplier: 'HTX Nông Sản Đà Lạt', 
                  region: 'Lâm Đồng', 
                  price: '249.000₫ / tuần', 
                  img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
                  badge: 'Thuần chay 100%'
                }
              ].filter(c => c.id !== combo.id).slice(0, 4).map(c => (
                <div key={c.id} style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow)',
                  position: 'relative'
                }}>
                  <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                    <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(21, 128, 61, 0.9)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {c.badge}
                    </span>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🏢</span> <strong>{c.supplier}</strong>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', color: 'var(--ink)', fontWeight: '700', lineHeight: '1.4' }}>
                      {c.name}
                    </h4>
                    <div style={{ color: '#e53e3e', fontWeight: '800', fontSize: '15px', marginBottom: '14px', marginTop: 'auto' }}>
                      {c.price}
                    </div>

                    <Link
                      href={`/combos/${c.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--green-700)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '12.5px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Chọn Nông Sản &amp; Đặt Combo &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER 4 CỘT CHUẨN LÀNH FARM ── */}
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
                <li>1900 8899 (7:00–21:00)</li>
                <li>nongsanlanh@lanhfarm.vn</li>
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
                <span>VISA</span><span>MoMo</span><span>VietQR</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX Nông Nghiệp Thông Minh.</span>
            <span>Nông sản tươi ngon, trọn vẹn niềm tin.</span>
          </div>
        </div>
      </footer>

      {/* ── DRAWER GIỎ HÀNG ── */}
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
                  {item.product.selectedSummary && (
                    <div style={{ fontSize: '11px', color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', marginTop: '3px', lineHeight: '1.4' }}>
                      🥗 Đã chọn: {item.product.selectedSummary}
                    </div>
                  )}
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
            onClick={() => {
              if (!currentUser) {
                alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
                router.push('/login');
                return;
              }
              if (cart.length === 0) return;
              setIsDrawerOpen(false);
              router.push('/checkout');
            }}
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>
    </>
  );
}
