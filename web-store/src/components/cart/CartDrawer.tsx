'use client';
// ============================================================================
// TỆP MÃ NGUỒN: web-store/src/components/cart/CartDrawer.tsx
// MÔ TẢ: Component giao diện dùng chung (CartDrawer.tsx) thuộc phân hệ Cửa hàng Trực tuyến LÀNH Farm (Web Store).
// ============================================================================
import React from 'react';
import { CartItem } from '@/types/product';
import { ICONS } from '../icons';

type CartDrawerProps = {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (o: boolean) => void;
  cart: CartItem[];
  updateCartQty: (id: number, delta: number) => void;
  setCartItemQty?: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  totalCart: number;
  toVND: (n: number) => string;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  cart,
  updateCartQty,
  setCartItemQty,
  removeFromCart,
  totalCart,
  toVND,
}) => {
  // Hàm xử lý sự kiện tương tác người dùng (handleDirectQtyChange)
  const handleDirectQtyChange = (id: number, newQty: number, maxAvailable: number = 50) => {
    let finalQty = newQty;
    if (finalQty > maxAvailable) {
      alert(`Số lượng yêu cầu vượt quá tồn kho khả dụng hiện có (${maxAvailable}). Đã tự động điều chỉnh về mức tối đa.`);
      finalQty = maxAvailable;
    }
    if (finalQty < 1) finalQty = 1;

    if (setCartItemQty) {
      setCartItemQty(id, finalQty);
    } else {
      const current = cart.find(c => c.product.id === id);
      if (current) {
        updateCartQty(id, finalQty - current.qty);
      }
    }
  };

  const handleStepQty = (id: number, delta: number, currentQty: number, maxAvailable: number = 50) => {
    const target = currentQty + delta;
    if (target > maxAvailable) {
      alert(`Số lượng yêu cầu vượt quá tồn kho khả dụng hiện có (${maxAvailable}).`);
      return;
    }
    if (target < 1) return;
    updateCartQty(id, delta);
  };

  return (
    <>
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
            <div className="drawer-empty">Giỏ hàng đang trống.<br/>Hãy thêm vài món rau sạch nhé 🌱</div>
          ) : (
            cart.map(item => {
              const maxStock = (item.product.availableStock && item.product.availableStock > 0)
                ? item.product.availableStock
                : 50;

              return (
                <div key={item.product.id} className="drawer-item">
                  <div className="thumb">{ICONS[item.product.icon]}</div>
                  <div className="info">
                    <b>{item.product.name}</b>
                    <span>{item.product.price} {item.product.unit}</span>
                    <div className="qty-ctrl" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
                      <button onClick={() => handleStepQty(item.product.id, -1, item.qty, maxStock)} style={{ userSelect: 'none' }} aria-label="Giảm 1">-</button>
                      <input
                        type="number"
                        min={1}
                        max={maxStock}
                        step={1}
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleDirectQtyChange(item.product.id, isNaN(val) ? 1 : val, maxStock);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            handleDirectQtyChange(item.product.id, item.qty + 1, maxStock);
                          } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            handleDirectQtyChange(item.product.id, item.qty - 1, maxStock);
                          }
                        }}
                        onBlur={() => {
                          if (!item.qty || item.qty < 1) handleDirectQtyChange(item.product.id, 1, maxStock);
                        }}
                        style={{
                          width: '36px',
                          height: '24px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: 'var(--ink)',
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          padding: 0,
                          MozAppearance: 'textfield'
                        }}
                        title={`Số lượng tối đa có thể mua: ${maxStock}`}
                        aria-label="Số lượng sản phẩm"
                      />
                      <button onClick={() => handleStepQty(item.product.id, 1, item.qty, maxStock)} style={{ userSelect: 'none' }} aria-label="Tăng 1">+</button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="drawer-foot">
          <div className="row"><span>Tạm tính</span><span>{toVND(totalCart)}</span></div>
          <button 
            className="btn btn-accent" 
            disabled={cart.length === 0}
            onClick={() => {
              // ID 9: Kiểm tra đăng nhập và hiển thị popup trước khi chuyển hướng
              const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
              const user = typeof window !== 'undefined' ? localStorage.getItem('customer_user') : null;
              if (!token || !user) {
                const wantLogin = window.confirm('Bạn cần đăng nhập tài khoản thành viên để đặt hàng và tích lũy điểm thưởng.\n\nNhấn "OK" để chuyển đến màn hình Đăng nhập.');
                if (wantLogin) {
                  setIsDrawerOpen(false);
                  window.location.href = '/login?redirect=/checkout';
                }
                return;
              }

              // ID 1: Kiểm tra nếu là tài khoản Quản trị viên (Admin)
              try {
                const parsedUser = user ? JSON.parse(user) : null;
                if (parsedUser && parsedUser.roleId === 1) {
                  const continueAdmin = window.confirm('⚠️ Chú ý: Tài khoản của bạn đang có vai trò Quản trị viên (Admin).\n\nBạn có muốn tiếp tục đặt hàng với tư cách thành viên không?');
                  if (!continueAdmin) return;
                }
              } catch (_) {}

              setIsDrawerOpen(false);
              window.location.href = '/checkout';
            }}
            style={{ opacity: cart.length === 0 ? 0.6 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            Thanh toán ngay
          </button>
        </div>
      </aside>
    </>
  );
};
