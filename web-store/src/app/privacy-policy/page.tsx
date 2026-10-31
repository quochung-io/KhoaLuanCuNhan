'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/app/privacy-policy/page.tsx
// MÔ TẢ: Trang giao diện khách hàng (privacy-policy/page.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Next.js).
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Thực thi nghiệp vụ hàm PrivacyPolicyPage
export default function PrivacyPolicyPage() {
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
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Bảo mật thông tin</span>
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
              <span>🔒</span> BẢO MẬT DỮ LIỆU KHÁCH HÀNG
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ink, #0F172A)', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              Chính Sách Bảo Mật Thông Tin Khách Hàng
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--ink-soft, #64748B)', margin: '0 0 32px 0', lineHeight: 1.6, maxWidth: '800px' }}>
              LÀNH Farm tôn trọng và cam kết bảo vệ dữ liệu cá nhân, quyền riêng tư của mọi khách hàng và đối tác nông nghiệp tham gia chuỗi cung ứng.
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line, #E2E8F0)', margin: '0 0 36px 0' }} />

            {/* Các phần chính sách */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Mục 1 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>1.</span> Mục đích thu thập dữ liệu cá nhân
                </h2>
                <p style={{ color: '#334155', fontSize: '14px', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                  LÀNH Farm chỉ thu thập thông tin người dùng cho các mục đích hợp pháp phục vụ đơn hàng và trải nghiệm mua sắm:
                </p>
                <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                  <li>Xử lý và hoàn tất đơn đặt hàng nông sản, xuất hóa đơn điện tử theo quy định.</li>
                  <li>Xác thực phiên đăng nhập an toàn, cấp phát mã xác nhận OTP và quản lý hồ sơ thành viên.</li>
                  <li>Giao nhận nông sản tận nơi theo số điện thoại và địa chỉ nhận hàng được khách hàng chỉ định.</li>
                  <li>Gợi ý các giỏ combo nông sản theo mùa phù hợp với khẩu vị và nhu cầu gia đình bạn.</li>
                </ul>
              </div>

              {/* Mục 2 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>2.</span> Cam kết an toàn và Mã hóa dữ liệu
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px', marginBottom: '6px' }}>🔑 Mã hóa Mật khẩu 1 Chiều</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Mật khẩu được băm bảo mật bằng thuật toán <strong>BCrypt</strong> thế hệ mới. Ngay cả quản trị viên hệ thống cũng không thể đọc mật khẩu gốc của bạn.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>🛡️ Không Chia Sẻ Dữ Liệu</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      LÀNH Farm tuyệt đối không bán hoặc trao đổi thông tin khách hàng cho bất kỳ bên thứ ba quảng cáo tiếp thị nào.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>💳 Thanh Toán An Toàn</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Hệ thống tích hợp cổng thanh toán VietQR / Ngân hàng qua kết nối SSL/TLS mã hóa 256-bit chuẩn ngân hàng quốc tế.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục 3 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>3.</span> Quyền lợi kiểm soát dữ liệu của người dùng
                </h2>
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', lineHeight: 1.7, fontSize: '14px', color: '#334155' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    • Bạn có toàn quyền truy cập mục <strong>Hồ sơ cá nhân</strong> để chỉnh sửa tên, số điện thoại, sổ địa chỉ nhận hàng bất kỳ lúc nào.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Để yêu cầu xóa toàn bộ lịch sử dữ liệu tài khoản khỏi máy chủ, bạn chỉ cần liên hệ bộ phận hỗ trợ quyền riêng tư: <strong style={{ color: '#15803D' }}>privacy@lanh.vn</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner liên hệ */}
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
                <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px' }}>Quản lý thông tin tài khoản của bạn</div>
                <div style={{ fontSize: '13px', color: '#4B5D50', marginTop: '4px' }}>Cập nhật mật khẩu, số điện thoại và sổ địa chỉ an toàn tại Trang cá nhân.</div>
              </div>
              <Link href="/profile" style={{
                padding: '10px 22px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
              }}>
                Vào trang cá nhân →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
