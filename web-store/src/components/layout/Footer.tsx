import React from 'react';

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
              <li>1900 6868 (7:00–21:00)</li>
              <li>hello@lanh.vn</li>
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
              <span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>COD</span>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX, Đại học ABC.</span>
          <span>Thiết kế minh họa cho mục đích học thuật.</span>
        </div>
      </div>
    </footer>
  );
};
