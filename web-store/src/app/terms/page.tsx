'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
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
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>Điều khoản dịch vụ</span>
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
              <span>📜</span> QUY ĐỊNH DỊCH VỤ NÔNG SẢN
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ink, #0F172A)', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              Điều Khoản &amp; Điều Kiện Dịch Vụ Mua Sắm LÀNH Farm
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--ink-soft, #64748B)', margin: '0 0 32px 0', lineHeight: 1.6, maxWidth: '800px' }}>
              Chào mừng bạn đến với LÀNH Farm. Bằng việc đăng ký tài khoản hoặc đặt mua nông sản trên nền tảng, bạn đồng ý tuân thủ các quy định và điều khoản dưới đây.
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line, #E2E8F0)', margin: '0 0 36px 0' }} />

            {/* Các phần chính sách */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Mục 1 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>1.</span> Tài khoản người dùng và Trách nhiệm
                </h2>
                <ul style={{ paddingLeft: '20px', color: '#334155', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
                  <li>Mỗi khách hàng chịu trách nhiệm bảo mật thông tin đăng nhập và mật khẩu cá nhân của mình.</li>
                  <li>Không sử dụng tài khoản để đặt đơn ảo, phá hoại chuỗi cung ứng hoặc gian lận voucher khuyến mãi.</li>
                  <li>Đối với đối tác Hợp tác xã (HTX), các thông tin mã số thuế, diện tích canh tác và giấy chứng nhận VietGAP/GlobalGAP phải trung thực và chịu trách nhiệm pháp lý.</li>
                  <li>Hệ thống hỗ trợ 1 tài khoản Email có thể đăng ký đồng thời cả 2 vai trò (Khách hàng mua sắm và Hợp tác xã bán hàng) khi xác thực đúng thông tin.</li>
                </ul>
              </div>

              {/* Mục 2 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>2.</span> Giá cả và Quy định thanh toán thời gian thực
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px', marginBottom: '6px' }}>🏷️ Giá Niêm Yết Minh Bạch</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Giá hiển thị trên website đã bao gồm thuế GTGT và được niêm yết rõ ràng theo định lượng (kg, bó, trái, giỏ combo).
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>⏱️ Giới Hạn Thanh Toán 15 Phút</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Đơn hàng chuyển khoản qua VietQR có thời hạn thanh toán 15 phút để bảo đảm giữ nông sản tươi sạch và tồn kho công bằng.
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', marginBottom: '6px' }}>📦 Đảm Bảo Tồn Kho Tươi Mới</div>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      Nếu quá 15 phút chưa nhận được thanh toán, hệ thống tự động hoàn kho nông sản về vườn để phục vụ các khách hàng khác.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mục 3 */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>3.</span> Tiêu chuẩn chất lượng và Minh bạch nguồn gốc
                </h2>
                <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', lineHeight: 1.7, fontSize: '14px', color: '#334155' }}>
                  <p style={{ margin: '0 0 10px 0' }}>
                    • Toàn bộ nông sản phân phối trên nền tảng đều có mã truy xuất nguồn gốc lô hàng (<strong>Lot Code</strong>), thể hiện rõ ràng nhật ký gieo trồng, địa chỉ hợp tác xã và thời điểm thu hoạch sáng sớm.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Quý khách có thể quét mã QR trên bao bì hoặc nhập mã lô hàng tại trang <Link href="/traceability" style={{ color: '#15803D', fontWeight: 700 }}>Truy xuất nguồn gốc</Link> để tra cứu công khai.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner kêu gọi */}
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
                <div style={{ fontWeight: 800, color: '#15803D', fontSize: '15px' }}>Xem thêm chính sách đổi trả và bảo hành nông sản</div>
                <div style={{ fontSize: '13px', color: '#4B5D50', marginTop: '4px' }}>Cam kết 1 đổi 1 hoặc hoàn tiền trong 24 giờ nếu rau củ quả không đạt chuẩn tươi ngon.</div>
              </div>
              <Link href="/return-policy" style={{
                padding: '10px 22px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
              }}>
                Chính sách đổi trả 24h →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
