'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export type QuickViewProductData = {
  productId: number;
  productName: string;
  price?: number;
  unit?: string;
  imageUrl?: string;
  categoryName?: string;
  description?: string;
  lotCode?: string;
  rating?: number;
  reviewsCount?: number;
};

type ProductQuickViewModalProps = {
  isOpen: boolean;
  productId: number | null;
  initialData?: QuickViewProductData | null;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
  toVND?: (n: number) => string;
};

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  isOpen,
  productId,
  initialData,
  onClose,
  onAddToCart,
  toVND = (n: number) => n.toLocaleString('vi-VN') + '₫'
}) => {
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');

  // Nạp dữ liệu sản phẩm từ API
  useEffect(() => {
    if (!isOpen || !productId) {
      setProductDetails(null);
      setBatches([]);
      setActiveImage('');
      return;
    }

    if (initialData?.imageUrl) {
      setActiveImage(initialData.imageUrl);
    }

    setLoading(true);
    // 1. Fetch chi tiết sản phẩm
    fetch(`http://localhost:5023/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm');
        return res.json();
      })
      .then(data => {
        setProductDetails(data);
        if (data.productImages && data.productImages.length > 0) {
          const primary = data.productImages.find((img: any) => img.isPrimary) || data.productImages[0];
          setActiveImage(primary.imageUrl);
        } else if (initialData?.imageUrl) {
          setActiveImage(initialData.imageUrl);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch lô hàng
    fetch(`http://localhost:5023/api/productbatches?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBatches(data);
        }
      })
      .catch(() => {});
  }, [isOpen, productId, initialData]);

  if (!isOpen) return null;

  const currentName = productDetails?.productName || initialData?.productName || 'Nông sản LÀNH';
  const currentPrice = productDetails?.price ?? initialData?.price ?? 0;
  const currentUnit = productDetails?.unit || initialData?.unit || 'kg';
  const currentCategory = productDetails?.category?.categoryName || initialData?.categoryName || 'Nông sản sạch';
  const currentDescription = productDetails?.description || initialData?.description || 'Nông sản được canh tác an toàn theo quy trình sinh học khép kín, giữ trọn độ tươi giòn và dinh dưỡng tự nhiên.';
  const currentRating = productDetails?.averageRating || initialData?.rating || 5;
  const currentReviews = productDetails?.reviewsCount ?? initialData?.reviewsCount ?? 12;

  // Lô hàng mới nhất
  const latestBatch = batches.length > 0 ? batches[0] : null;
  const displayLot = initialData?.lotCode || latestBatch?.batchCode || `LOT#VN-REC-${productId}`;

  // Danh sách hình ảnh
  const images: string[] = [];
  if (productDetails?.productImages && productDetails.productImages.length > 0) {
    productDetails.productImages.forEach((img: any) => {
      if (img.imageUrl && !images.includes(img.imageUrl)) images.push(img.imageUrl);
    });
  }
  if (images.length === 0 && (activeImage || initialData?.imageUrl)) {
    images.push(activeImage || initialData?.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600');
  }

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: productId,
        productId: productId,
        name: currentName,
        productName: currentName,
        price: toVND(currentPrice),
        rawPrice: currentPrice,
        unit: ' / ' + currentUnit,
        category: currentCategory,
        imageUrl: activeImage || images[0],
        cert: 'VietGAP',
        region: 'Đà Lạt',
        rating: currentRating,
        reviews: currentReviews,
        lot: displayLot
      });
    }
  };

  return (
    <div 
      className="overlay show" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 22px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#16a34a'
            }} />
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '700', color: '#1e293b' }}>
              Thông tin chi tiết nông sản
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              border: 'none',
              background: '#f1f5f9',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '16px',
              transition: 'all 0.15s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Nội dung Modal (2 cột: Ảnh & Thông tin) */}
        <div style={{
          padding: '22px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Cột trái: Ảnh sản phẩm lớn + Thumbnail */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={activeImage || images[0]}
                alt={currentName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <span style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(22, 101, 52, 0.9)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.5px'
              }}>
                VIETGAP CHUẨN
              </span>
            </div>

            {/* Danh sách ảnh nhỏ nếu có nhiều hơn 1 ảnh */}
            {images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '10px',
                overflowX: 'auto',
                paddingBottom: '4px'
              }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    style={{
                      border: activeImage === img ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: 0,
                      overflow: 'hidden',
                      width: '52px',
                      height: '52px',
                      flexShrink: 0,
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông số chi tiết */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{
                display: 'inline-block',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                {currentCategory}
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: 1.3
              }}>
                {currentName}
              </h2>

              {/* Đánh giá sao */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <div style={{ color: '#eab308', fontSize: '14px', letterSpacing: '1px' }}>
                  {'★'.repeat(Math.round(currentRating))}
                  <span style={{ color: '#cbd5e1' }}>{'★'.repeat(5 - Math.round(currentRating))}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  {currentRating.toFixed(1)}
                </span>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  ({currentReviews} đánh giá từ khách hàng)
                </span>
              </div>
            </div>

            {/* Đơn giá */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px'
            }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>
                {toVND(currentPrice)}
              </span>
              <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
                / {currentUnit}
              </span>
            </div>

            {/* Thông tin canh tác & Lô hàng */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12.5px'
            }}>
              <div style={{
                padding: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
              }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Xuất xứ:</span>
                <strong style={{ color: '#1e293b' }}>Đà Lạt (Lâm Đồng)</strong>
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #f1f5f9'
              }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Mã lô thu hoạch:</span>
                <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>{displayLot}</strong>
              </div>
              {latestBatch?.harvestDate && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9'
                }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Ngày thu hoạch:</span>
                  <strong style={{ color: '#1e293b' }}>{new Date(latestBatch.harvestDate).toLocaleDateString('vi-VN')}</strong>
                </div>
              )}
              {latestBatch?.expiryDate && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9'
                }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11.5px' }}>Hạn sử dụng:</span>
                  <strong style={{ color: '#e11d48' }}>{new Date(latestBatch.expiryDate).toLocaleDateString('vi-VN')}</strong>
                </div>
              )}
            </div>

            {/* Mô tả sản phẩm */}
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Mô tả đặc tính nông sản:
              </span>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#475569',
                lineHeight: 1.55,
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                {currentDescription}
              </p>
            </div>

            {/* Hướng dẫn bảo quản nhanh */}
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              fontSize: '12px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>❄️</span>
              <span>Bảo quản tối ưu trong ngăn mát tủ lạnh (4°C - 8°C) để giữ nguyên độ giòn ngọt.</span>
            </div>
          </div>
        </div>

        {/* Footer Modal: Các nút tác vụ */}
        <div style={{
          padding: '16px 22px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          backgroundColor: '#fafafa',
          borderBottomLeftRadius: '18px',
          borderBottomRightRadius: '18px'
        }}>
          <Link
            href={`/products/${productId}`}
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Xem trang chi tiết đầy đủ
          </Link>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onAddToCart && (
              <button
                type="button"
                onClick={handleAdd}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Thêm vào giỏ hàng
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#e2e8f0',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
