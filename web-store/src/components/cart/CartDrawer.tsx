'use client';
import React from 'react';
import { CartItem } from '@ecc/shared';
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
  const handleDirectQtyChange = (id: number, newQty: number) => {
    if (setCartItemQty) {
      setCartItemQty(id, newQty);
    } else {
      const current = cart.find(c => c.product.id === id);
      if (current) {
        updateCartQty(id, newQty - current.qty);
      }
    }
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
            cart.map(item => (
              <div key={item.product.id} className="drawer-item">
                <div className="thumb">{ICONS[item.product.icon]}</div>
                <div className="info">
                  <b>{item.product.name}</b>
                  <span>{item.product.price} {item.product.unit}</span>
                  <div className="qty-ctrl" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => updateCartQty(item.product.id, -1)} style={{ userSelect: 'none' }} aria-label="Giảm 1">-</button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      step={1}
                      value={item.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handleDirectQtyChange(item.product.id, isNaN(val) ? 1 : Math.max(1, Math.min(999, val)));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          handleDirectQtyChange(item.product.id, Math.min(999, item.qty + 1));
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          handleDirectQtyChange(item.product.id, Math.max(1, item.qty - 1));
                        }
                      }}
                      onBlur={() => {
                        if (!item.qty || item.qty < 1) handleDirectQtyChange(item.product.id, 1);
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
                      title="Nhập số lượng hoặc dùng phím mũi tên Lên/Xuống trên bàn phím"
                      aria-label="Số lượng sản phẩm"
                    />
                    <button onClick={() => updateCartQty(item.product.id, 1)} style={{ userSelect: 'none' }} aria-label="Tăng 1">+</button>
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
          <button className="btn btn-accent">Thanh toán nhanh</button>
        </div>
      </aside>
    </>
  );
};
