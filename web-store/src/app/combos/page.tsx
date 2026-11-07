'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/app/combos/page.tsx
// MÔ TẢ: Trang giao diện khách hàng (combos/page.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Next.js).
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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

export interface ComboPlan {
  id: number;
  name: string;
  desc: string;
  price: string;
  rawPrice: number;
  originalPrice?: string;
  savingText?: string;
  badge?: string;
  supplierId: number;
  supplierName: string;
  healthBenefits?: string;
  features: string[];
  sampleItems: string[];
  imageUrl: string;
  rating?: number;
  reviewsCount?: number;
  cert?: string;
  region?: string;
  lotCode?: string;
  category?: string;
}

const emptyPlans: Record<string, ComboPlan[]> = {
  combotuan: [],
  combothang: [],
  combokhac: []
};

// Hàm gán emoji sinh động cho từng loại nông sản
function getProduceEmoji(item: string): string {
  const lower = item.toLowerCase();
  if (lower.includes('cải') || lower.includes('tần ô') || lower.includes('rau')) return '🥬';
  if (lower.includes('cà rốt')) return '🥕';
  if (lower.includes('cà chua')) return '🍅';
  if (lower.includes('xà lách') || lower.includes('salad')) return '🥗';
  if (lower.includes('cam')) return '🍊';
  if (lower.includes('bơ')) return '🥑';
  if (lower.includes('nấm')) return '🍄';
  if (lower.includes('bắp') || lower.includes('ngô')) return '🌽';
  if (lower.includes('bông cải') || lower.includes('súp lơ')) return '🥦';
  if (lower.includes('nước cốt') || lower.includes('lẩu')) return '🍲';
  if (lower.includes('trái cây') || lower.includes('quả')) return '🍎';
  return '🌱';
}

// Thực thi nghiệp vụ hàm CombosPage
export default function CombosPage() {
  const router = useRouter();
  const [subFreq, setSubFreq] = useState<'combotuan' | 'combothang' | 'combokhac'>('combotuan');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dynamicSuppliers, setDynamicSuppliers] = useState<Array<{ key: string; label: string }>>([
    { key: 'all', label: 'Tất Cả Đối Tác HTX' }
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  // Dynamic Combos từ Database
  const [dynamicPlans, setDynamicPlans] = useState<Record<string, ComboPlan[]>>(emptyPlans);

  useEffect(() => {
    // 1. Tải danh sách tất cả các đối tác HTX từ Database
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/users/suppliers`)
      .then(res => res.ok ? res.json() : [])
      .then((sups: any[]) => {
        if (Array.isArray(sups) && sups.length > 0) {
          setDynamicSuppliers([
            { key: 'all', label: 'Tất Cả Đối Tác HTX' },
            ...sups.map((s: any) => ({
              key: String(s.supplierId),
              label: s.fullName || s.storeName || `HTX #${s.supplierId}`
            }))
          ]);
        }
      })
      .catch(() => {});

    // 2. Tải danh sách Gói Combo từ Database
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/products?categoryId=5`)
      .then(res => res.json())
      .then((products: any[]) => {
        if (!Array.isArray(products)) return;
        
        const validProducts = products.filter(p => p.status !== 'Pending');

        // Bổ sung các HTX từ sản phẩm nếu chưa có trong danh sách
        setDynamicSuppliers(prev => {
          const existingKeys = new Set(prev.map(item => item.key));
          const additions: Array<{ key: string; label: string }> = [];
          validProducts.forEach(p => {
            if (p.supplierId) {
              const key = String(p.supplierId);
              if (!existingKeys.has(key)) {
                existingKeys.add(key);
                additions.push({
                  key,
                  label: p.supplier?.supplierName || p.farmName || `HTX #${key}`
                });
              }
            }
          });
          return additions.length > 0 ? [...prev, ...additions] : prev;
        });

        const mapToPlan = (p: any): ComboPlan => {
          const isMonth = (p.productName && p.productName.includes('Gói Tháng')) || p.comboType === 'month';
          const saving = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0;
          const savingPercent = p.originalPrice && p.originalPrice > p.price 
            ? Math.round((saving / p.originalPrice) * 100) 
            : (p.discountPercent || 0);
          const savingText = saving > 0 
            ? `Tiết kiệm ${saving.toLocaleString('vi-VN')}₫ (${savingPercent}%)` 
            : (savingPercent > 0 ? `Tiết kiệm ${savingPercent}%` : '');

          let sampleItems: string[] = [];
          if (p.description) {
            const cleaned = p.description.replace(/\[Tự chọn \d+ loại nông sản\]\s*/, '');
            const parts = cleaned.split(/[.,;\n]/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 3 && !s.includes('Phù hợp') && !s.includes('Đáp ứng') && !s.includes('Dinh dưỡng') && !s.includes('Gói trọn') && !s.includes('Tự động'));
            if (parts.length >= 2) {
              sampleItems = parts;
            }
          }

          const supName = p.supplier?.supplierName || p.farmName || (p.supplierId ? `HTX #${p.supplierId}` : '');
          const cert = p.cert || p.status || '';
          const region = p.region || p.origin || p.farmName || p.supplier?.province || supName || '';
          const lotCode = p.lotCode || p.productBatches?.[0]?.batchCode || '';
          const rating = typeof p.averageRating === 'number' ? p.averageRating : 0;
          const reviewsCount = typeof p.reviewsCount === 'number' ? p.reviewsCount : 0;
          const category = p.categoryName || 'Combo';

          // Trích xuất tính năng từ mô tả nếu có gạch đầu dòng
          let extractedFeatures: string[] = [];
          if (p.description) {
            const lines = p.description.split('\n')
              .map((l: string) => l.trim())
              .filter((l: string) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•'))
              .map((l: string) => l.replace(/^[-*•]\s*/, ''));
            if (lines.length > 0) {
              extractedFeatures = lines;
            }
          }

          return {
            id: p.productId,
            name: p.productName,
            desc: p.description?.replace(/\[Tự chọn \d+ loại nông sản\]\s*/, '') || '',
            price: p.price.toLocaleString('vi-VN') + '₫',
            rawPrice: p.price,
            originalPrice: p.originalPrice ? (p.originalPrice.toLocaleString('vi-VN') + '₫') : undefined,
            savingText: savingText || undefined,
            badge: p.badge || (p.discountPercent ? `Ưu đãi -${p.discountPercent}%` : (isMonth ? 'Gói tháng định kỳ' : undefined)),
            supplierId: p.supplierId || 0,
            supplierName: supName,
            imageUrl: p.productImages?.[0]?.imageUrl || '',
            healthBenefits: p.healthBenefits || undefined,
            features: extractedFeatures,
            sampleItems: sampleItems,
            rating,
            reviewsCount,
            cert,
            region,
            lotCode,
            category
          };
        };

        const combotuanList = validProducts
          .filter(p => p.comboType !== 'program' && !p.productName.includes('Gói Tháng') && p.comboType !== 'month')
          .map(mapToPlan);

        const combothangList = validProducts
          .filter(p => p.comboType === 'month' || p.productName.includes('Gói Tháng'))
          .map(mapToPlan);

        const combokhacList = validProducts
          .filter(p => p.comboType === 'program')
          .map(mapToPlan);

        setDynamicPlans({
          combotuan: combotuanList,
          combothang: combothangList,
          combokhac: combokhacList
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Hàm xử lý sự kiện tương tác người dùng (handleAddComboToCart)
  const handleAddComboToCart = (plan: ComboPlan) => {
    const comboProduct = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      unit: subFreq === 'combotuan' ? '/ Tuần' : (subFreq === 'combothang' ? '/ Tháng' : '/ Gói'),
      category: plan.category || 'Combo',
      cert: plan.cert || '',
      region: plan.region || plan.supplierName || '',
      rating: plan.rating || 0,
      reviews: plan.reviewsCount || 0,
      icon: 'box',
      lot: plan.lotCode || '',
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

  // Hàm xử lý sự kiện tương tác người dùng (handleGoToCheckout)
  const handleGoToCheckout = () => {
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg, #F8FAF7)' }}>
      {/* Header đồng bộ chuẩn toàn hệ thống */}
      <Header
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        setIsDrawerOpen={setIsDrawerOpen}
        cartBounce={cartBounce}
      />

      <main style={{ flex: 1, paddingBottom: '70px' }}>
        {/* ── HERO BANNER HIỆN ĐẠI & SANG TRỌNG ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0A2412 0%, #164024 50%, #1B4D2E 100%)',
          color: '#FFFFFF',
          padding: '52px 0 44px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(10, 36, 18, 0.2)'
        }}>
          {/* Họa tiết trang trí organic ngầm */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div className="wrap" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              padding: '6px 18px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#FDE047',
              marginBottom: '16px',
              backdropFilter: 'blur(8px)'
            }}>
              <span>🌱</span> GIẢI PHÁP ĐI CHỢ THÔNG MINH &amp; TIẾT KIỆM
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: '38px',
              fontWeight: 900,
              margin: '0 0 14px',
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              Combo Nông Sản Hữu Cơ Định Kỳ
            </h1>

            <p style={{
              margin: '0 auto 28px',
              fontSize: '15.5px',
              color: '#D1E7D4',
              maxWidth: '680px',
              lineHeight: 1.6
            }}>
              Không còn lo lắng &ldquo;Hôm nay ăn gì?&rdquo;, LÀNH tự tay chọn lọc những loại rau củ quả tươi sạch nhất từ vườn Đà Lạt &amp; Tây Nguyên mỗi sáng, đóng gói chuẩn FreshLock và giao xe lạnh tận bàn ăn gia đình bạn.
            </p>

            {/* TAB CHUYỂN ĐỔI GÓI ĐỊNH KỲ (TUẦN / THÁNG / KHÁC) */}
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              padding: '5px',
              borderRadius: '999px',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <button
                type="button"
                onClick={() => setSubFreq('combotuan')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  backgroundColor: subFreq === 'combotuan' ? '#FFFFFF' : 'transparent',
                  color: subFreq === 'combotuan' ? '#14532D' : '#FFFFFF',
                  boxShadow: subFreq === 'combotuan' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                🥗 Combo Tuần
              </button>

              <button
                type="button"
                onClick={() => setSubFreq('combothang')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  backgroundColor: subFreq === 'combothang' ? '#FFFFFF' : 'transparent',
                  color: subFreq === 'combothang' ? '#14532D' : '#FFFFFF',
                  boxShadow: subFreq === 'combothang' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                📅 Combo Tháng <span style={{ color: subFreq === 'combothang' ? '#B45309' : '#FDE047', fontSize: '12px', marginLeft: '4px' }}>(Tiết kiệm 23%)</span>
              </button>

              <button
                type="button"
                onClick={() => setSubFreq('combokhac')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  backgroundColor: subFreq === 'combokhac' ? '#FFFFFF' : 'transparent',
                  color: subFreq === 'combokhac' ? '#14532D' : '#FFFFFF',
                  boxShadow: subFreq === 'combokhac' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                ✨ Combo Ưu Đãi Khác
              </button>
            </div>
          </div>
        </section>

        <div className="wrap" style={{ marginTop: '36px' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Combo Nông Sản Định Kỳ</span>
          </nav>

          {/* ── BỘ LỌC THEO NHÀ CUNG CẤP / ĐỐI TÁC HTX ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '36px',
            padding: '16px 24px',
            backgroundColor: 'var(--surface, #FFFFFF)',
            borderRadius: '16px',
            border: '1px solid var(--line, #E2E8F0)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink, #1E293B)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏢</span> Đối tác HTX Phụ Trách:
            </span>
            {dynamicSuppliers.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSupplierFilter(s.key)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: supplierFilter === s.key ? '1.5px solid #16A34A' : '1px solid #E2E8F0',
                  backgroundColor: supplierFilter === s.key ? '#DCFCE7' : '#FFFFFF',
                  color: supplierFilter === s.key ? '#15803D' : '#64748B',
                  fontSize: '13px',
                  fontWeight: supplierFilter === s.key ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: supplierFilter === s.key ? '0 2px 6px rgba(22, 163, 74, 0.2)' : 'none'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ── LƯỚI THẺ COMBO ĐỒNG BỘ FORM (ĐỨNG 1 MÌNH HAY ĐỨNG NHIỀU ĐỀU TƯƠNG ĐỒNG) ── */}
          {(() => {
            // Lọc bỏ triệt để các combo không có hình ảnh hoặc hình ảnh rỗng
            const currentList = (dynamicPlans[subFreq] || [])
              .filter(plan => plan.imageUrl && plan.imageUrl.trim() !== '')
              .filter(plan => {
                if (supplierFilter === 'all') return true;
                return String(plan.supplierId) === supplierFilter;
              });

            if (currentList.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '72px 20px',
                  backgroundColor: 'var(--surface, #FFFFFF)',
                  borderRadius: '24px',
                  border: '1.5px dashed var(--line, #E2E8F0)',
                  marginBottom: '56px'
                }}>
                  <div style={{ fontSize: '52px', marginBottom: '14px' }}>🌱</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink, #1E293B)', margin: '0 0 8px' }}>
                    Hiện chưa có gói combo nào trong danh mục này
                  </h3>
                  <p style={{ fontSize: '14.5px', color: 'var(--ink-soft, #64748B)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
                    Các gói combo ưu đãi mới đang được đối tác hợp tác xã chuẩn bị thu hoạch. Quý khách vui lòng chọn các gói Combo Tuần hoặc Combo Tháng đang sẵn sàng phục vụ!
                  </p>
                </div>
              );
            }

            return (
              <div style={{
                display: 'grid',
                // Khi đứng 1 mình: Khóa kích thước chuẩn 360px-420px và căn giữa, không bị dãn bẹt
                // Khi đứng nhiều combo: Tự động chia đều các cột
                gridTemplateColumns: currentList.length === 1 
                  ? 'minmax(340px, 420px)' 
                  : 'repeat(auto-fill, minmax(350px, 1fr))',
                justifyContent: currentList.length === 1 ? 'center' : 'start',
                gap: '32px',
                marginBottom: '56px'
              }}>
                {currentList.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      backgroundColor: 'var(--surface, #FFFFFF)',
                      borderRadius: '24px',
                      border: plan.badge ? '2px solid #86EFAC' : '1.5px solid #E2E8F0',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      height: '100%',
                      width: '100%',
                      maxWidth: currentList.length === 1 ? '420px' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Badge nổi góc trên */}
                    {plan.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: '#F59E0B',
                        color: '#FFFFFF',
                        padding: '5px 14px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        zIndex: 3,
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        letterSpacing: '0.3px'
                      }}>
                        <span>⭐</span> {plan.badge}
                      </div>
                    )}

                    {/* 1. KHU VỰC ẢNH & THƯƠNG HIỆU */}
                    <Link href={`/combos/${plan.id}`} style={{ height: '220px', overflow: 'hidden', position: 'relative', display: 'block', textDecoration: 'none' }}>
                      <img
                        src={plan.imageUrl}
                        alt={plan.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />

                      {/* Gradient phủ dưới đáy ảnh */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '80px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                        pointerEvents: 'none'
                      }} />

                      {/* Pill Nhà Cung Cấp nổi trên ảnh */}
                      {plan.supplierName && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.94)',
                          backdropFilter: 'blur(8px)',
                          color: '#166534',
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          maxWidth: '85%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <span>🏢</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{plan.supplierName}</span>
                        </div>
                      )}
                    </Link>

                    {/* 2. KHU VỰC NỘI DUNG CHI TIẾT ĐỒNG BỘ */}
                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Tên Gói Combo (Đồng bộ chiều cao tiêu đề) */}
                      <Link href={`/combos/${plan.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{
                          margin: '0 0 10px',
                          fontSize: '19px',
                          fontWeight: 900,
                          color: 'var(--ink, #0F172A)',
                          lineHeight: 1.35,
                          minHeight: '52px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {plan.name}
                        </h3>
                      </Link>

                      {/* Mô tả ngắn (Đồng bộ chiều cao mô tả) */}
                      <p style={{
                        fontSize: '13.5px',
                        color: 'var(--ink-soft, #64748B)',
                        margin: '0 0 16px',
                        lineHeight: 1.5,
                        minHeight: '42px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {plan.desc || 'Gói combo nông sản sạch tuyển chọn đạt chuẩn chất lượng an toàn.'}
                      </p>

                      {/* KHỐI GIÁ & TIẾT KIỆM */}
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        marginBottom: '18px',
                        border: '1px solid #E2E8F0',
                        minHeight: '74px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '28px', fontWeight: 900, color: '#15803D', letterSpacing: '-0.5px' }}>
                            {plan.price}
                          </span>
                          {plan.originalPrice && (
                            <span style={{ fontSize: '14.5px', color: '#94A3B8', textDecoration: 'line-through' }}>
                              {plan.originalPrice}
                            </span>
                          )}
                          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                            {subFreq === 'combotuan' ? '/ tuần' : (subFreq === 'combothang' ? '/ tháng' : '/ gói')}
                          </span>
                        </div>

                        {plan.savingText && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            marginTop: '6px',
                            alignSelf: 'flex-start'
                          }}>
                            <span>💰</span> {plan.savingText}
                          </div>
                        )}
                      </div>

                      {/* 3. THÀNH PHẦN NÔNG SẢN TIÊU BIỂU */}
                      {plan.sampleItems && plan.sampleItems.length > 0 && (
                        <div style={{ marginBottom: '18px' }}>
                          <div style={{
                            fontSize: '11.5px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            color: '#166534',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>🥗</span> Thành phần nông sản tiêu biểu:
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {plan.sampleItems.slice(0, 4).map((item, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: '#F0FDF4',
                                  border: '1px solid #DCFCE7',
                                  color: '#15803D',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  padding: '4px 9px',
                                  borderRadius: '6px'
                                }}
                              >
                                <span>{getProduceEmoji(item)}</span>
                                <span>{item}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. KHỐI TRUNG GIAN TỰ GIÃN (FLEX 1) */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Lợi ích sức khỏe nếu có */}
                        {plan.healthBenefits && (
                          <div style={{
                            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                            border: '1px solid #BBF7D0',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            marginBottom: '16px',
                            fontSize: '12px',
                            color: '#166534',
                            lineHeight: 1.45
                          }}>
                            <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>🩺</span> Lợi ích dinh dưỡng:
                            </div>
                            <div>{plan.healthBenefits}</div>
                          </div>
                        )}

                        {/* Quyền lợi dịch vụ nếu có */}
                        {plan.features && plan.features.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginBottom: '8px' }}>
                              Quyền lợi dịch vụ:
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {plan.features.slice(0, 3).map((feat, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                                  <span style={{ color: '#16A34A', fontWeight: 'bold' }}>✓</span>
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 5. CÁC NÚT TÁC VỤ (GHIM ĐÁY CHÂN THẺ TƯƠNG ĐỒNG) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '16px' }}>
                        <Link
                          href={`/combos/${plan.id}`}
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 18px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '13.5px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          <span>Xem Chi Tiết &amp; Chọn Nông Sản &rarr;</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAddComboToCart(plan)}
                          style={{
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: '1.5px solid #BBF7D0',
                            backgroundColor: '#F0FDF4',
                            color: '#15803D',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>🛒 Đặt nhanh vào giỏ hàng</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── PHẦN CAM KẾT & CÂU HỎI THƯỜNG GẶP ── */}
          <div style={{
            backgroundColor: 'var(--surface, #FFFFFF)',
            borderRadius: '24px',
            border: '1px solid var(--line, #E2E8F0)',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                TRẢI NGHIỆM ĐI CHỢ TIỆN LỢI
              </span>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '28px', fontWeight: 900, color: 'var(--green-900, #1B3A20)', margin: '8px 0 0' }}>
                Vì Sao Bạn Nên Chọn Combo Định Kỳ Tại LÀNH Farm?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', padding: '16px', backgroundColor: '#F8FAF7', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px' }}>🚚</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: 'var(--ink, #1E293B)' }}>Giao Đúng Lịch Hẹn</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft, #64748B)', lineHeight: 1.5 }}>
                    Chọn ngày giao thuận tiện (Thứ 2 hoặc Thứ 5), shipper xe lạnh giao đến tận bếp trước giờ cơm.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', padding: '16px', backgroundColor: '#F8FAF7', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px' }}>🔄</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: 'var(--ink, #1E293B)' }}>Đổi Món Linh Hoạt</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft, #64748B)', lineHeight: 1.5 }}>
                    Nếu có món thành viên gia đình không thích, bạn có thể báo trước 24 giờ để đổi sang loại rau quả khác tương đương.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', padding: '16px', backgroundColor: '#F8FAF7', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px' }}>⏸️</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: 'var(--ink, #1E293B)' }}>Tạm Dừng Khi Đi Vắng</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft, #64748B)', lineHeight: 1.5 }}>
                    Đi công tác hay về quê? Bạn có thể tạm dừng gói trong 1–2 tuần mà không bị mất quyền lợi hay phát sinh phụ phí.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', padding: '16px', backgroundColor: '#F8FAF7', borderRadius: '16px' }}>
                <div style={{ fontSize: '32px' }}>🏷️</div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 800, color: 'var(--ink, #1E293B)' }}>100% Truy Xuất Nguồn Gốc</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-soft, #64748B)', lineHeight: 1.5 }}>
                    Mỗi combo đều có mã Lot QR riêng gắn liền với nhật ký thu hoạch của từng đối tác hợp tác xã thành viên.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ĐỒNG BỘ CHUẨN */}
      <Footer />

      {/* Cart Drawer */}
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
    </div>
  );
}
