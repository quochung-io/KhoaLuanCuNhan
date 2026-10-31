'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/components/layout/Footer.tsx
// MÔ TẢ: Component giao diện dùng chung (Footer.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
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
              <li>hello@lanh.vn</li>
              <li>92 Nguyễn Huệ, Q.1, TP.HCM</li>
            </ul>
          </div>
          <div>
            <h5>Chính sách</h5>
            <ul>
              <li>
                <Link href="/shipping-policy" style={{ color: '#D9E6D9', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚚</span> Vận chuyển &amp; giao nhận
                </Link>
              </li>
              <li>
                <Link href="/return-policy" style={{ color: '#D9E6D9', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔄</span> Đổi trả trong 24h
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" style={{ color: '#D9E6D9', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔒</span> Bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: '#D9E6D9', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📜</span> Điều khoản dịch vụ
                </Link>
              </li>
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
          <span>© 2026 LÀNH — Nông sản sạch minh bạch chuẩn VietGAP &amp; Hữu cơ.</span>
          <span>Hệ thống chuỗi cung ứng trực tiếp từ Nông trại đến Bàn ăn.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
