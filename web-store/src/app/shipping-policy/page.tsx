'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ShippingPolicyPage() {
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
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Vận chuyển &amp; Giao nhận</span>
          </nav>

          {/* Card nội dung chính */}
          <div style={{
            backgroundColor: 'var(--surface, #FFFFFF)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid var(--line, #E2E8F0)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
          }}>
            {/* Header Chính Sách */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '6px 14px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 700, marginBottom: '14px' }}>
              <span>🚚</span> FRESHLOCK COLD CHAIN
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ink, #0F172A)', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              Chính Sách Vận Chuyển &amp; Giao Nhận Nông Sản
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--ink-soft, #64748B)', margin: '0 0 32px 0', lineHeight: 1.6, maxWidth: '800px' }}>
              LÀNH Farm áp dụng quy trình chuỗi lạnh khép kín (Cold Chain) từ nông trại Đà Lạt và Tây Nguyên đến tận gian bếp người dùng, đảm bảo nông sản luôn giữ trọn vị giòn ngọt và dinh dưỡng tự nhiên.
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line, #E2E8F0)', margin: '0 0 36px 0' }} />

            {/* Các phần chính sách */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Mục 1 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>1.</span> Các hình thức giao hàng linh hoạt
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px', marginBottom: '6px' }}>⚡ Giao Hỏa Tốc 2 Giờ</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Áp dụng toàn bộ khu vực nội thành TP.HCM (Quận 1, 3, 4, 5, 10, Bình Thạnh, Phú Nhuận, Tân Bình, Gò Vấp). Đóng gói thùng giữ nhiệt đá khô chuyên dụng giao ngay.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>🌅 Giao Sáng Sớm (Trước 11:30)</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Đặt hàng trước 22:00 hôm trước. Nông sản được thu hái lúc 04:30 sáng tại Đà Lạt, vận chuyển xe lạnh về tổng kho và giao đến tận cửa nhà bạn trước giờ nấu cơm trưa.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>📦 Giao Combo Tuần / Tháng Định Kỳ</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Giao cố định vào Thứ 2 hoặc Thứ 5 hàng tuần theo khung giờ bạn chọn. Shipper xe lạnh trao tận tay giỏ nông sản tươi nguyên sương sớm.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục 2 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>2.</span> Biểu phí vận chuyển minh bạch
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', color: '#1E293B' }}>
                        <th style={{ padding: '12px 16px', borderRadius: '10px 0 0 10px' }}>Giá trị đơn hàng</th>
                        <th style={{ padding: '12px 16px' }}>Phí giao nội thành TP.HCM</th>
                        <th style={{ padding: '12px 16px', borderRadius: '0 10px 10px 0' }}>Phí giao ngoại thành TP.HCM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>Dưới 200.000₫</td>
                        <td style={{ padding: '14px 16px', color: '#C53030', fontWeight: 700 }}>25.000₫</td>
                        <td style={{ padding: '14px 16px', color: '#C53030', fontWeight: 700 }}>35.000₫</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>Từ 200.000₫ đến 399.000₫</td>
                        <td style={{ padding: '14px 16px', color: '#15803D', fontWeight: 700 }}>15.000₫ (Giảm 40%)</td>
                        <td style={{ padding: '14px 16px', color: '#15803D', fontWeight: 700 }}>20.000₫</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#15803D' }}>Từ 400.000₫ trở lên</td>
                        <td style={{ padding: '14px 16px', color: '#15803D', fontWeight: 800 }}>MIỄN PHÍ (Freeship 100%)</td>
                        <td style={{ padding: '14px 16px', color: '#15803D', fontWeight: 800 }}>MIỄN PHÍ (Freeship 100%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mục 3 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>3.</span> Quy trình kiểm tra hàng khi nhận (Đồng kiểm)
                </h2>
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', lineHeight: 1.7, fontSize: '14px', color: '#334155' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    • Quý khách có quyền mở thùng hàng kiểm tra độ tươi giòn, chủng loại và số lượng nông sản trước khi thanh toán hoặc ký nhận.
                  </p>
                  <p style={{ margin: '0 0 10px 0' }}>
                    • Nếu phát hiện bất kỳ sản phẩm nào bị dập úa, sai phân loại hoặc không đạt chuẩn VietGAP, quý khách có thể từ chối nhận món đó ngay tại chỗ.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Hotline hỗ trợ điều phối vận chuyển hỏa tốc: <strong style={{ color: '#15803D' }}>1900 6868</strong> (Phục vụ 7:00 – 21:00 hàng ngày).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
