'use client';

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
}

const subPlans: Record<string, ComboPlan[]> = {
  combotuan: [
    {
      id: 901,
      name: 'Gói Dinh Dưỡng Tuần Xanh',
      desc: 'Gói dinh dưỡng rau củ quả hữu cơ trọn vẹn 7 ngày cho gia đình 2–3 người. Đáp ứng hoàn hảo nhu cầu vitamin và khoáng chất tự nhiên.',
      price: '189.000₫',
      rawPrice: 189000,
      originalPrice: '234.000₫',
      savingText: 'Tiết kiệm 45.000₫ (19%)',
      badge: 'Bán chạy nhất tuần',
      supplierId: 1,
      supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      healthBenefits: 'Cung cấp 100% nhu cầu Vitamin A, C, E và chất xơ hòa tan tự nhiên; hỗ trợ tăng cường hệ miễn dịch, kích thích tiêu hóa và thanh lọc cơ thể suốt 7 ngày.',
      features: [
        '4 loại rau ăn lá & củ quả VietGAP tươi hái sớm trong ngày',
        '2 loại trái cây chín cây giàu chất chống oxy hóa tự nhiên',
        'Tiết kiệm 45.000₫ so với mua lẻ từng món tại chợ / siêu thị',
        'Miễn phí đóng gói bảo quản lạnh FreshLock giữ tươi 100%'
      ],
      sampleItems: [
        'Cải bó xôi VietGAP (500g)',
        'Cà rốt baby hữu cơ Đà Lạt (500g)',
        'Xà lách mỡ giòn ngọt (300g)',
        'Cà chua bi Cherry mọng nước (350g)',
        'Cam Cao Phong chín cây (1kg)',
        'Bơ sáp 034 Tây Nguyên dẻo béo (1kg)'
      ]
    },
    {
      id: 902,
      name: 'Combo Lẩu Nông Sản Đà Lạt',
      desc: 'Bữa tiệc lẩu rau củ nấm thanh mát trọn vị cao nguyên cho gia đình 4–5 người. Tươi giòn, thanh ngọt tự nhiên, không mì chính hay chất phụ gia.',
      price: '249.000₫',
      rawPrice: 249000,
      originalPrice: '314.000₫',
      savingText: 'Tiết kiệm 65.000₫ (21%)',
      badge: 'Đặc sản tiệc gia đình',
      supplierId: 1,
      supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
      healthBenefits: 'Nguồn đạm thực vật thực dưỡng cao cấp từ các loại nấm sạch quý, ít calo, giàu Beta-Glucan bồi bổ sức khỏe và tăng cường sức đề kháng cho cả gia đình.',
      features: [
        'Nấm sạch thực dưỡng: Nấm đùi gà baby & Nấm hoàng kim hữu cơ',
        'Rau nhúng lẩu giòn ngọt: Cải thảo non, bắp ngọt Mỹ, tần ô, bông cải',
        'Tặng kèm 1 gói nước cốt lẩu hầm rau củ quả tự nhiên 1L độc quyền',
        'Tiết kiệm 65.000₫ so với mua nguyên liệu rời ngoài thị trường'
      ],
      sampleItems: [
        'Nấm đùi gà baby tươi (250g)',
        'Nấm hoàng kim hữu cơ (200g)',
        'Cải thảo Đà Lạt giòn ngọt (800g)',
        'Bắp ngọt giống Mỹ (2 trái)',
        'Tần ô non nhúng lẩu (300g)',
        'Bông cải xanh Đà Lạt (400g)',
        'Nước cốt hầm rau củ quả 1L (1 gói)'
      ]
    }
  ],
  combothang: [
    {
      id: 904,
      name: 'Gói Dinh Dưỡng Tuần Xanh (Định Kỳ Tháng)',
      desc: 'Giao đều đặn 4 đợt vào mỗi sáng Thứ 2 hàng tuần (mỗi tuần 1 giỏ tươi mới). Tiết kiệm tối đa thời gian đi chợ cho gia đình bận rộn.',
      price: '720.000₫',
      rawPrice: 720000,
      originalPrice: '936.000₫',
      savingText: 'Tiết kiệm 216.000₫ (23%)',
      badge: 'Gói tháng ưu đãi',
      supplierId: 1,
      supplierName: 'Hợp tác xã Nông Sản Đà Lạt',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80',
      healthBenefits: 'Duy trì chế độ dinh dưỡng Eat-Clean bền vững suốt 30 ngày, cải thiện hệ vi sinh đường ruột và làn da.',
      features: [
        '4 lần giao tận nhà trong tháng (mỗi tuần 1 giỏ đầy đặn 5-6kg)',
        'Linh hoạt tùy chọn đổi món theo sở thích từng tuần',
        'Tặng thêm 1 voucher Freeship 30k mỗi đợt giao',
        'Tiết kiệm hơn 200.000₫ so với mua lẻ từng tuần'
      ],
      sampleItems: [
        'Đợt 1: Giỏ rau củ quả thanh nhiệt (4.5kg)',
        'Đợt 2: Giỏ rau gia vị & nấm hữu cơ (4kg)',
        'Đợt 3: Giỏ rau củ xào luộc ngọt lành (4.8kg)',
        'Đợt 4: Giỏ trái cây & rau salad cao cấp (4.5kg)'
      ]
    }
  ],
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

export default function CombosPage() {
  const router = useRouter();
  const [subFreq, setSubFreq] = useState<'combotuan' | 'combothang' | 'combokhac'>('combotuan');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  // Dynamic Combos từ Database
  const [dynamicPlans, setDynamicPlans] = useState<Record<string, ComboPlan[]>>(subPlans);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/products?categoryId=5`)
      .then(res => res.json())
      .then((products: any[]) => {
        if (!Array.isArray(products)) return;
        
        const programCombos = products.filter(p => p.comboType === 'program' && (p.status === 'Active' || p.status === 'Approved'));
        const mappedProgramPlans = programCombos.map(p => ({
          id: p.productId,
          name: p.productName,
          desc: p.description?.replace(/\[Tự chọn \d+ loại nông sản\]\s*/, '') || 'Gói combo nông sản ưu đãi chất lượng cao.',
          price: p.price.toLocaleString('vi-VN') + '₫',
          rawPrice: p.price,
          badge: p.discountPercent ? `Ưu đãi -${p.discountPercent}%` : 'Đặc biệt',
          supplierId: p.supplierId || 1,
          supplierName: p.supplierId === 2 ? 'Hợp tác xã Rau Sạch Miền Tây' : (p.supplierId === 3 ? 'Hợp tác xã Trái Cây Việt' : (p.supplierId === 4 ? 'HTX Nông Nghiệp An Phú' : 'Hợp tác xã Nông Sản Đà Lạt')),
          imageUrl: p.productImages?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
          features: [
            'Nông sản đạt chuẩn VietGAP & Hữu cơ',
            'Tự chọn các món tươi ngon cùng nhà cung cấp',
            'Sơ chế và đóng gói khép kín tại trang trại',
            'Giao xe lạnh tận bàn ăn theo khung giờ hẹn'
          ],
          sampleItems: ['Nông sản sạch theo chương trình ưu đãi']
        }));

        setDynamicPlans(prev => ({
          ...prev,
          combokhac: mappedProgramPlans
        }));
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

  const handleAddComboToCart = (plan: ComboPlan) => {
    const comboProduct = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      unit: subFreq === 'combotuan' ? '/ Tuần' : (subFreq === 'combothang' ? '/ Tháng' : '/ Gói'),
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
            {[
              { key: 'all', label: 'Tất Cả Đối Tác HTX' },
              { key: '1', label: 'HTX Nông Sản Đà Lạt' },
              { key: '2', label: 'HTX Rau Sạch Miền Tây' },
              { key: '3', label: 'HTX Trái Cây Việt' },
              { key: '4', label: 'HTX Nông Nghiệp An Phú' }
            ].map(s => (
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

          {/* ── LƯỚI THẺ COMBO ĐƯỢC THIẾT KẾ LẠI CAO CẤP ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '32px',
            marginBottom: '56px'
          }}>
            {(() => {
              const currentList = (dynamicPlans[subFreq] || []).filter(plan => {
                if (supplierFilter === 'all') return true;
                return String(plan.supplierId) === supplierFilter;
              });

              if (currentList.length === 0) {
                return (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '72px 20px',
                    backgroundColor: 'var(--surface, #FFFFFF)',
                    borderRadius: '24px',
                    border: '1.5px dashed var(--line, #E2E8F0)'
                  }}>
                    <div style={{ fontSize: '52px', marginBottom: '14px' }}>🌱</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ink, #1E293B)', margin: '0 0 8px' }}>
                      Hiện chưa có gói combo nào trong danh mục này
                    </h3>
                    <p style={{ fontSize: '14.5px', color: 'var(--ink-soft, #64748B)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
                      Các gói combo ưu đãi mới đang được hợp tác xã chuẩn bị thu hoạch. Quý khách vui lòng chọn các gói Combo Tuần hoặc Combo Tháng đang sẵn sàng phục vụ!
                    </p>
                  </div>
                );
              }

              return currentList.map((plan) => (
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
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(8px)',
                      color: '#166534',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      <span>🏢</span>
                      <span>{plan.supplierName}</span>
                    </div>
                  </Link>

                  {/* 2. KHU VỰC NỘI DUNG CHI TIẾT */}
                  <div style={{ padding: '26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Tên Gói Combo */}
                    <Link href={`/combos/${plan.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{
                        margin: '0 0 8px',
                        fontSize: '21px',
                        fontWeight: 900,
                        color: 'var(--ink, #0F172A)',
                        lineHeight: 1.3
                      }}>
                        {plan.name}
                      </h3>
                    </Link>

                    {/* Mô tả ngắn */}
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--ink-soft, #64748B)',
                      margin: '0 0 18px',
                      lineHeight: 1.55,
                      minHeight: '44px'
                    }}>
                      {plan.desc}
                    </p>

                    {/* KHỐI GIÁ & TIẾT KIỆM */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      marginBottom: '20px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '30px', fontWeight: 900, color: '#15803D', letterSpacing: '-0.5px' }}>
                          {plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span style={{ fontSize: '15px', color: '#94A3B8', textDecoration: 'line-through' }}>
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
                          padding: '3px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          marginTop: '6px'
                        }}>
                          <span>💰</span> {plan.savingText}
                        </div>
                      )}
                    </div>

                    {/* 3. THÀNH PHẦN NÔNG SẢN TIÊU BIỂU (DẠNG CHIP/PILL SINH ĐỘNG) */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: '#166534',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🥗</span> Thành phần nông sản tiêu biểu:
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {plan.sampleItems.map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#F0FDF4',
                              border: '1px solid #DCFCE7',
                              color: '#15803D',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '5px 11px',
                              borderRadius: '8px'
                            }}
                          >
                            <span>{getProduceEmoji(item)}</span>
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 4. KHỐI LỢI ÍCH SỨC KHỎE */}
                    {plan.healthBenefits && (
                      <div style={{
                        background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
                        border: '1px solid #BBF7D0',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        marginBottom: '20px',
                        fontSize: '12.5px',
                        color: '#166534',
                        lineHeight: 1.5
                      }}>
                        <div style={{ fontWeight: 800, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>🩺</span> Lợi ích dinh dưỡng:
                        </div>
                        <div>{plan.healthBenefits}</div>
                      </div>
                    )}

                    {/* 5. QUYỀN LỢI ĐI KÈM */}
                    <div style={{ marginBottom: '24px', flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B', marginBottom: '8px' }}>
                        Quyền lợi dịch vụ:
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                        {plan.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}>
                            <span style={{ color: '#16A34A', fontWeight: 'bold' }}>✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 6. CÁC NÚT TÁC VỤ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <Link
                        href={`/combos/${plan.id}`}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '13px 20px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '14px',
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
                          padding: '11px 18px',
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
              ));
            })()}
          </div>

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
