'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/app/return-policy/page.tsx
// MÔ TẢ: Trang giao diện khách hàng (return-policy/page.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Next.js).
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Thực thi nghiệp vụ hàm ReturnPolicyPage
export default function ReturnPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg, #F8FAF7)' }}>
      <Header />

      <main style={{ flex: 1, padding: '32px 0 60px' }}>
        <div className="wrap">
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Trang chủ</Link>
            <span>/</span>
            <span>Chính sách</span>
            <span>/</span>
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Đổi trả trong 24h</span>
          </nav>

          {/* Card nội dung chính */}
          <div style={{
            backgroundColor: 'var(--surface, #FFFFFF)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid var(--line, #E2E8F0)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
          }}>
            {/* Badge tiêu đề */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '6px 14px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 700, marginBottom: '14px' }}>
              <span>🔄</span> CAM KẾT HÀI LÒNG 100%
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ink, #0F172A)', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              Chính Sách Đổi Trả Nông Sản Trong 24 Giờ
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--ink-soft, #64748B)', margin: '0 0 32px 0', lineHeight: 1.6, maxWidth: '800px' }}>
              LÀNH Farm áp dụng chính sách 1 đổi 1 hoặc hoàn tiền không cần giải thích nếu nông sản không đạt độ tươi ngon chuẩn mực.
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line, #E2E8F0)', margin: '0 0 36px 0' }} />

            {/* Các phần chính sách */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Mục 1 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>1.</span> Điều kiện áp dụng đổi trả trong 24 giờ
                </h2>
                <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                  <li>Nông sản bị dập nát, gãy úa hoặc biến dạng trong quá trình vận chuyển.</li>
                  <li>Rau củ quả không đúng chủng loại, thiếu định lượng so với đơn đặt hàng đã thanh toán.</li>
                  <li>Phát hiện dấu hiệu sâu bệnh, hỏng thối bên trong ruột quả không thể quan sát từ vỏ ngoài.</li>
                  <li>Nông sản có mùi lạ hoặc không giữ được độ tươi mát do lỗi bảo quản lạnh trong chuỗi cung ứng.</li>
                </ul>
              </div>

              {/* Mục 2 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>2.</span> Quy trình đổi trả 3 bước siêu tốc
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px', marginBottom: '6px' }}>📸 Bước 1: Chụp ảnh / Video</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Quý khách chỉ cần chụp ảnh nông sản lỗi kèm phiếu đơn hàng hoặc quét mã tem QR trên túi bảo quản.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>📩 Bước 2: Gửi yêu cầu khiếu nại</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Bấm nút &quot;Yêu cầu hoàn trả&quot; ngay trên chi tiết đơn hàng tại website hoặc gửi tin nhắn qua Zalo CSKH.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>⚡ Bước 3: Hoàn tiền / Đổi mới</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      LÀNH Farm tiến hành hoàn tiền vào ví/tài khoản ngân hàng trong 15 phút hoặc giao bù nông sản mới hỏa tốc miễn phí.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục 3 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>3.</span> Chi phí thu hồi nông sản lỗi (Zero-Waste)
                </h2>
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', lineHeight: 1.7, fontSize: '14px', color: '#334155' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    • <strong>100% chi phí vận chuyển phát sinh</strong> khi đổi trả do lỗi chất lượng nông sản đều do LÀNH Farm chi trả trọn gói.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Theo chính sách bảo vệ môi trường <em>Zero-Waste</em>, nông sản tươi hỏng sẽ <strong>không thu hồi về kho</strong> để tránh lãng phí thời gian của quý khách. Bạn có thể tự xử lý hoặc làm phân bón hữu cơ tại gia.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner kêu gọi hành động */}
            <div style={{
              marginTop: '40px',
              padding: '24px',
              backgroundColor: '#F0FDF4',
              borderRadius: '16px',
              border: '1.5px solid #BBF7D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px' }}>Bạn cần gửi khiếu nại hoặc kiểm tra đơn hàng vừa nhận?</div>
                <div style={{ fontSize: '13px', color: '#4B5D50', marginTop: '4px' }}>Đội ngũ CSKH hỗ trợ xử lý đền bù trong vòng 15 phút. Hotline: 1900 6868</div>
              </div>
              <Link href="/orders" style={{
                padding: '10px 22px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
              }}>
                Kiểm tra đơn hàng ngay →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
