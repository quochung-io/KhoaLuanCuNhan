'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  price: string;
  unit: string;
  icon: string;
  imageUrl?: string;
};

type CartItem = {
  product: Product;
  qty: number;
};

export default function CheckoutPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Form địa chỉ nhận hàng
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
      alert("Vui lòng đăng nhập trước khi thanh toán!");
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    setReceiverName(parsedUser.fullName || '');
    setPhone(parsedUser.phone || '');

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [router]);

  const updateCartQty = (id: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeFromCart = (id: number) => {
    const updated = cart.filter(item => item.product.id !== id);
    setCart(updated);
    if (updated.length > 0) {
      localStorage.setItem('cart', JSON.stringify(updated));
    } else {
      localStorage.removeItem('cart');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const rawPrice = item.product.price.replace(/[^\d]/g, '');
      const unitPrice = parseInt(rawPrice, 10) || 0;
      return total + (unitPrice * item.qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 30000;
  const totalAmount = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!receiverName.trim() || !phone.trim() || !district.trim() || !ward.trim() || !addressDetail.trim()) {
      setError('Vui lòng điền đầy đủ thông tin người nhận và địa chỉ giao hàng.');
      return;
    }

    if (cart.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => {
        const rawPrice = item.product.price.replace(/[^\d]/g, '');
        const unitPrice = parseInt(rawPrice, 10) || 0;
        return {
          productId: item.product.id,
          quantity: item.qty,
          unitPrice: unitPrice,
          discountAmount: 0
        };
      });

      const payload = {
        customerId: currentUser.userId,
        subtotal: subtotal,
        discountAmount: 0,
        shippingFee: shippingFee,
        paymentMethod: paymentMethod,
        receiverName: receiverName.trim(),
        phone: phone.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        addressDetail: addressDetail.trim(),
        orderItems: orderItems
      };

      const res = await fetch('http://localhost:5023/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Có lỗi xảy ra khi tạo đơn hàng.');
      }

      alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng sạch tại LÀNH.");
      localStorage.removeItem('cart');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Lỗi đặt hàng. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const toVND = (num: number) => num.toLocaleString('vi-VN') + ' ₫';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8faf8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px',
      color: '#2d3748'
    }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ color: '#2E7D32', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            ← Quay lại Cửa hàng
          </Link>
        </div>

        <h2 style={{ color: '#1B5E20', fontWeight: 'bold', fontSize: '26px', margin: '0 0 30px 0', borderBottom: '2px solid #E8F5E9', paddingBottom: '12px' }}>
          Thanh Toán Đơn Hàng
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Cột trái: Form thông tin người nhận */}
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              Thông tin giao nhận
            </h3>
            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Họ và tên người nhận</label>
                <input 
                  type="text" 
                  value={receiverName} 
                  onChange={(e) => setReceiverName(e.target.value)} 
                  placeholder="Ví dụ: Nguyễn Văn A"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Số điện thoại người nhận</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Ví dụ: 0987654321"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Tỉnh / Thành phố</label>
                  <input 
                    type="text" 
                    value={province} 
                    onChange={(e) => setProvince(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', backgroundColor: '#f7fafc', boxSizing: 'border-box', color: '#718096' }}
                    readOnly
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Quận / Huyện</label>
                  <input 
                    type="text" 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)} 
                    placeholder="Ví dụ: Đông Anh"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Phường / Xã</label>
                <input 
                  type="text" 
                  value={ward} 
                  onChange={(e) => setWard(e.target.value)} 
                  placeholder="Ví dụ: Cổ Loa"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Số nhà, ngõ, tên đường</label>
                <input 
                  type="text" 
                  value={addressDetail} 
                  onChange={(e) => setAddressDetail(e.target.value)} 
                  placeholder="Ví dụ: Số 20, ngõ 10 đường Cao Lỗ"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Hình thức thanh toán</label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'} 
                      onChange={() => setPaymentMethod('COD')} 
                      style={{ accentColor: '#2E7D32' }}
                    />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="BANK" 
                      checked={paymentMethod === 'BANK'} 
                      onChange={() => setPaymentMethod('BANK')} 
                      style={{ accentColor: '#2E7D32' }}
                    />
                    Chuyển khoản Ngân hàng
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                style={{
                  marginTop: '15px',
                  backgroundColor: '#2E7D32',
                  color: '#fff',
                  border: 'none',
                  padding: '15px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(46,125,50,0.15)',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? 'Đang xử lý đặt hàng...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </form>
          </div>

          {/* Cột phải: Danh sách sản phẩm tóm tắt */}
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              Đơn hàng của bạn ({cart.reduce((s, i) => s + i.qty, 0)} sản phẩm)
            </h3>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096', fontSize: '14px' }}>
                Giỏ hàng trống. Quay lại mua sắm nhé!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '340px', overflowY: 'auto', marginBottom: '24px', paddingRight: '5px' }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f7fafc', paddingBottom: '12px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      backgroundColor: '#f7fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #edf2f7',
                      flexShrink: 0
                    }}>
                      <img 
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80'} 
                        alt={item.product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>{item.product.name}</div>
                      <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{item.product.price} {item.product.unit}</div>
                    </div>
                    {/* Chỉnh sửa số lượng */}
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                      <button 
                        type="button"
                        onClick={() => updateCartQty(item.product.id, -1)}
                        style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#4a5568' }}
                      >-</button>
                      <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                      <button 
                        type="button"
                        onClick={() => updateCartQty(item.product.id, 1)}
                        style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', color: '#4a5568' }}
                      >+</button>
                    </div>
                    {/* Nút xóa */}
                    <button 
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '15px', marginLeft: '5px', padding: '4px' }}
                      title="Xóa sản phẩm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#718096', fontWeight: '500' }}>
                <span>Tạm tính tiền hàng</span>
                <span>{toVND(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#718096', fontWeight: '500' }}>
                <span>Phí giao hàng toàn quốc</span>
                <span>{toVND(shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '18px', color: '#1B5E20', borderTop: '1px solid #edf2f7', paddingTop: '15px' }}>
                <span>TỔNG CỘNG</span>
                <span>{toVND(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
