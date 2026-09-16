'use client';
import React from 'react';
import { Product } from '@ecc/shared';
import { ICONS } from '../icons';

type ProductCardProps = {
  product: Product;
  addedItem: number | null;
  openQrFor: number | null;
  setOpenQrFor: (id: number | null) => void;
  onAddToCart: (p: Product) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  addedItem,
  openQrFor,
  setOpenQrFor,
  onAddToCart,
}) => {
  return (
    <div className="prod-card">
      <div className="prod-media" style={{ background: 'var(--green-100)' }}>
        {ICONS[product.icon]}
        <div className="tag-row">
          <span className="tag-cert">{product.cert}</span>
          <button className="qr-btn" onClick={() => setOpenQrFor(product.id)} aria-label="Xem truy xuất nguồn gốc">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>
          </button>
        </div>
        <div className={`qr-panel ${openQrFor === product.id ? 'show' : ''}`}>
          <button className="qr-close" onClick={() => setOpenQrFor(null)} aria-label="Đóng">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="1.6"><rect x="2" y="2" width="7" height="7"/><rect x="15" y="2" width="7" height="7"/><rect x="2" y="15" width="7" height="7"/><path d="M15 15h3v3h-3zM21 15v3M15 21h3M21 21v.01M5 5h1M18 5h1M5 18h1"/></svg>
          <span className="lot">{product.lot}</span>
          <p>Thu hoạch tại {product.region} · Kiểm định {product.cert}<br/>Quét mã để xem nhật ký canh tác đầy đủ</p>
        </div>
      </div>
      <div className="prod-body">
        <span className="prod-origin">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
          Xuất xứ: {product.region}
        </span>
        <span className="prod-name">{product.name}</span>
        <div className="stars">
          {product.reviews > 0 ? (
            <>
              <span className="fill">★</span> <strong>{product.rating}</strong> · {product.reviews} đánh giá
            </>
          ) : (
            <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>Chưa có đánh giá</span>
          )}
        </div>
        <div className="price-row">
          <span className="price">{product.price}<span>{product.unit}</span></span>
          <button className={`add-btn ${addedItem === product.id ? 'added' : ''}`} onClick={() => onAddToCart(product)} aria-label="Thêm vào giỏ">
            {addedItem === product.id ? ICONS.check : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
};
