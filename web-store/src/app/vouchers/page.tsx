'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/components/common/ToastProvider';

interface VoucherItem {
  id?: number;
  promotionId?: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  discountFormatted?: string;
  startDate?: string;
  endDate?: string;
  minOrderAmount?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  status?: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'ship' | 'discount'>('all');
  const { success } = useToast();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Ưu tiên gọi API vouchers/promotions từ backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5023'}/api/vouchers`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.items || []);
        if (list.length > 0) {
          setVouchers(list);
          setLoading(false);
          return;
        }
      }
      // Fallback fallback mẫu nếu DB trống
      fetchFallbackVouchers();
    } catch (err) {
      console.warn('Lỗi kết nối API vouchers, dùng danh sách fallback:', err);
      fetchFallbackVouchers();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackVouchers = () => {
    setVouchers([
      {
        id: 1,
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển nội thành TP.HCM',
        discountType: 'Ship',
        discountValue: 30000,
        discountFormatted: 'Freeship 30k',
        minOrderAmount: 150000,
        endDate: '2026-12-31',
        status: 'active'
      },
      {
        id: 2,
        code: 'LANHNEW',
        name: 'Ưu đãi chào bạn mới mừng nông sản sạch',
        discountType: 'Fixed',
        discountValue: 30000,
        discountFormatted: 'Giảm 30.000₫',
        minOrderAmount: 200000,
        endDate: '2026-12-31',
        status: 'active'
      },
      {
        id: 3,
        code: 'VIETGAP10',
        name: 'Giảm 10% các loại rau ăn lá VietGAP',
        discountType: 'Percent',
        discountValue: 10,
        discountFormatted: 'Giảm 10%',
        minOrderAmount: 100000,
        maxDiscount: 40000,
        endDate: '2026-11-30',
        status: 'active'
      },
      {
        id: 4,
        code: 'COMBOYEU',
        name: 'Giảm thêm khi đặt Combo Dinh Dưỡng Tuần',
        discountType: 'Fixed',
        discountValue: 50000,
        discountFormatted: 'Giảm 50.000₫',
        minOrderAmount: 350000,
        endDate: '2026-12-15',
        status: 'active'
      }
    ]);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Đã sao chép mã ưu đãi "${code}" vào bộ nhớ tạm!`, 'Sao chép thành công');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const filteredVouchers = vouchers.filter(v => {
    if (filterType === 'ship') return (v.discountType || '').toLowerCase() === 'ship';
    if (filterType === 'discount') return (v.discountType || '').toLowerCase() !== 'ship';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Banner giới thiệu */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              <span>🎟️</span> KHO ƯU ĐÃI NÔNG SẢN
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Mã Giảm Giá &amp; Ưu Đãi LÀNH Farm
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Lưu mã và áp dụng tại bước thanh toán để nhận ngay ưu đãi vận chuyển &amp; giảm giá nông sản tươi sạch.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/#products"
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🛒</span> Mua sắm ngay
            </Link>
          </div>
        </div>

        {/* Bộ lọc tab */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: filterType === 'all' ? '#15803D' : '#CBD5E1',
              backgroundColor: filterType === 'all' ? '#15803D' : '#FFFFFF',
              color: filterType === 'all' ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Tất cả mã ({vouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ship')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: filterType === 'ship' ? '#15803D' : '#CBD5E1',
              backgroundColor: filterType === 'ship' ? '#15803D' : '#FFFFFF',
              color: filterType === 'ship' ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            🚚 Miễn phí vận chuyển
          </button>
          <button
            type="button"
            onClick={() => setFilterType('discount')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: filterType === 'discount' ? '#15803D' : '#CBD5E1',
              backgroundColor: filterType === 'discount' ? '#15803D' : '#FFFFFF',
              color: filterType === 'discount' ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            🌾 Giảm giá nông sản
          </button>
        </div>

        {/* Danh sách thẻ Voucher tối giản */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            Đang tải kho mã ưu đãi...
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎟️</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>Chưa có mã ưu đãi trong mục này</div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Vui lòng chọn danh mục khác hoặc quay lại sau!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filteredVouchers.map((v) => {
              const isShip = (v.discountType || '').toLowerCase() === 'ship';
              const minVal = v.minOrderAmount || v.minOrderValue || 0;
              const isCopied = copiedCode === v.code;

              return (
                <div
                  key={v.code}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {/* Viền trang trí bên trái */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '5px',
                    backgroundColor: isShip ? '#0284C7' : '#15803D'
                  }} />

                  <div>
                    {/* Header voucher */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        backgroundColor: isShip ? '#E0F2FE' : '#DCFCE7',
                        color: isShip ? '#0369A1' : '#15803D',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        {isShip ? 'FREESHIP' : 'GIẢM GIÁ'}
                      </span>

                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                        HSD: {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '31/12/2026'}
                      </div>
                    </div>

                    {/* Tên và mức giảm */}
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      {v.name}
                    </h3>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isShip ? '#0284C7' : '#15803D', marginBottom: '8px' }}>
                      {v.discountFormatted || (isShip ? 'Miễn phí vận chuyển' : `Giảm ${v.discountValue.toLocaleString('vi-VN')}₫`)}
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4, marginBottom: '14px' }}>
                      Đơn tối thiểu: <strong>{minVal > 0 ? `${minVal.toLocaleString('vi-VN')}₫` : 'Không giới hạn'}</strong>
                      {v.maxDiscount && v.maxDiscount > 0 ? ` • Giảm tối đa ${v.maxDiscount.toLocaleString('vi-VN')}₫` : ''}
                    </div>
                  </div>

                  {/* Vùng sao chép mã */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8FAFC',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px dashed #CBD5E1'
                  }}>
                    <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '1px' }}>
                      {v.code}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(v.code)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isCopied ? '#15803D' : '#0F172A',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {isCopied ? 'Đã sao chép ✓' : 'Sao chép mã'}
                    </button>

                    <Link
                      href="/checkout"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      Dùng ngay
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
