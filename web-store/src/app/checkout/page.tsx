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

type CustomerAddress = {
  addressId: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  addressType?: string; // "Nhà ở" | "Công ty"
  isDefault: boolean;
};

export default function CheckoutPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Danh sách địa chỉ từ server
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Trạng thái modal / form thêm địa chỉ mới
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProvince, setNewProvince] = useState('TP.HCM');
  const [newDistrict, setNewDistrict] = useState('');
  const [newWard, setNewWard] = useState('');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [newAddressType, setNewAddressType] = useState('Nhà ở');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Load user & cart
  useEffect(() => {
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
      alert("Vui lòng đăng nhập trước khi thanh toán!");
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    // Tải danh sách địa chỉ của khách hàng
    fetchAddresses(parsedUser.userId);
  }, [router]);

  const fetchAddresses = async (userId: number) => {
    setIsLoadingAddresses(true);
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/user/${userId}`);
      if (res.ok) {
        const data: CustomerAddress[] = await res.json();
        setAddresses(data);
        if (data.length > 0) {
          // Ưu tiên chọn địa chỉ mặc định, hoặc địa chỉ đầu tiên
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr.addressId);
        } else {
          setSelectedAddressId('new');
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải địa chỉ:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

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

  // Xử lý mở form tạo địa chỉ mới
  const handleOpenAddModal = () => {
    setNewReceiverName(currentUser?.fullName || '');
    setNewPhone(currentUser?.phone || '');
    setNewProvince('TP.HCM');
    setNewDistrict('');
    setNewWard('');
    setNewAddressDetail('');
    setNewAddressType('Nhà ở');
    setNewIsDefault(addresses.length === 0);
    setAddressModalError('');
    setShowAddAddressModal(true);
  };

  // Lưu địa chỉ mới qua API
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressModalError('');

    if (!newReceiverName.trim() || !newPhone.trim() || !newDistrict.trim() || !newWard.trim() || !newAddressDetail.trim()) {
      setAddressModalError('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }

    setIsSavingNewAddress(true);
    try {
      const payload = {
        userId: currentUser.userId,
        receiverName: newReceiverName.trim(),
        phone: newPhone.trim(),
        province: newProvince.trim(),
        district: newDistrict.trim(),
        ward: newWard.trim(),
        addressDetail: newAddressDetail.trim(),
        addressType: newAddressType,
        isDefault: newIsDefault || addresses.length === 0
      };

      const res = await fetch('http://localhost:5023/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Không thể lưu địa chỉ mới.');
      }

      const created: CustomerAddress = await res.json();
      
      // Cập nhật lại danh sách địa chỉ
      await fetchAddresses(currentUser.userId);
      setSelectedAddressId(created.addressId);
      setShowAddAddressModal(false);
    } catch (err: any) {
      setAddressModalError(err.message || 'Lỗi lưu địa chỉ.');
    } finally {
      setIsSavingNewAddress(false);
    }
  };

  // Đặt hàng
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    // Nếu chọn địa chỉ đã lưu
    if (selectedAddressId === 'new') {
      setError('Vui lòng chọn hoặc thêm địa chỉ nhận hàng hợp lệ.');
      return;
    }

    const currentSelected = addresses.find(a => a.addressId === selectedAddressId);
    if (!currentSelected) {
      setError('Vui lòng chọn địa chỉ giao hàng hợp lệ.');
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
        addressId: currentSelected.addressId, // Sử dụng ID địa chỉ đã chọn
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

      alert("Đặt hàng thành công! Đơn hàng của bạn đang được nông sản LÀNH chuẩn bị giao.");
      localStorage.removeItem('cart');
      router.push('/orders');
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
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ color: '#2E7D32', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
            ← Tiếp tục mua sắm
          </Link>
        </div>

        <h2 style={{ color: '#1B5E20', fontWeight: 'bold', fontSize: '26px', margin: '0 0 25px 0', borderBottom: '2px solid #E8F5E9', paddingBottom: '12px' }}>
          Xác Nhận & Thanh Toán Đơn Hàng
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            border: '1px solid #FFCDD2'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '30px', alignItems: 'start' }}>
          {/* Cột trái: Quản lý & chọn địa chỉ giao hàng */}
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                📍 Địa chỉ nhận hàng
              </h3>
              <button
                type="button"
                onClick={handleOpenAddModal}
                style={{
                  background: 'none',
                  border: '1px dashed #2E7D32',
                  color: '#2E7D32',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#F1F8F1'
                }}
              >
                + Thêm địa chỉ mới
              </button>
            </div>

            {isLoadingAddresses ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#718096', fontSize: '14px' }}>
                Đang tải danh sách địa chỉ nhận hàng...
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '35px 20px', backgroundColor: '#fcfdfc', borderRadius: '12px', border: '1px dashed #cbd5e0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏡</div>
                <div style={{ fontWeight: '600', color: '#4a5568', marginBottom: '6px' }}>Bạn chưa lưu địa chỉ nhận hàng nào</div>
                <p style={{ color: '#718096', fontSize: '13px', margin: '0 0 16px 0' }}>Vui lòng thêm địa chỉ (Nhà ở hoặc Công ty) để chúng tôi giao tận tay bạn.</p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  style={{
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Thêm địa chỉ ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '25px' }}>
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.addressId;
                  const isCompany = addr.addressType === 'Công ty';

                  return (
                    <div
                      key={addr.addressId}
                      onClick={() => setSelectedAddressId(addr.addressId)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #2E7D32' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f7fbf7' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 3px 12px rgba(46,125,50,0.08)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.addressId)}
                          style={{ accentColor: '#2E7D32', marginTop: '3px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#1a202c' }}>
                              {addr.receiverName}
                            </span>
                            <span style={{ color: '#a0aec0', fontSize: '13px' }}>|</span>
                            <span style={{ color: '#4a5568', fontSize: '14px', fontWeight: '500' }}>
                              {addr.phone}
                            </span>

                            {/* Badge Loại địa chỉ: Nhà ở / Công ty */}
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: isCompany ? '#EBF8FF' : '#F0FFF4',
                              color: isCompany ? '#2B6CB0' : '#276749',
                              border: `1px solid ${isCompany ? '#BEE3F8' : '#C6F6D5'}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              {isCompany ? '🏢 Công ty' : '🏠 Nhà ở'}
                            </span>

                            {/* Badge Mặc định */}
                            {addr.isDefault && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: '#FFFBEB',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                ★ Mặc định
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '13.5px', color: '#4a5568', lineHeight: '1.5' }}>
                            {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hình thức thanh toán */}
            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '20px', marginTop: '10px' }}>
              <h3 style={{ color: '#2d3748', fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
                💳 Phương thức thanh toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: paymentMethod === 'COD' ? '1.5px solid #2E7D32' : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'COD' ? '#F7FBF7' : '#fff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ accentColor: '#2E7D32' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>💵 Thanh toán khi nhận hàng (COD)</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Kiểm tra nông sản tươi sạch trước khi thanh toán tiền mặt</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: paymentMethod === 'BANK' ? '1.5px solid #2E7D32' : '1px solid #e2e8f0',
                  backgroundColor: paymentMethod === 'BANK' ? '#F7FBF7' : '#fff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK"
                    checked={paymentMethod === 'BANK'}
                    onChange={() => setPaymentMethod('BANK')}
                    style={{ accentColor: '#2E7D32' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d3748' }}>🏦 Chuyển khoản Ngân hàng (QR Code)</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Quét mã VietQR chuyển khoản nhanh 24/7</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Nút gửi đơn hàng */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0 || addresses.length === 0}
              style={{
                marginTop: '25px',
                width: '100%',
                backgroundColor: (loading || cart.length === 0 || addresses.length === 0) ? '#a0aec0' : '#2E7D32',
                color: '#fff',
                border: 'none',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (loading || cart.length === 0 || addresses.length === 0) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(46,125,50,0.2)',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Đang xử lý đặt hàng...' : 'XÁC NHẬN ĐẶT HÀNG'}
            </button>
          </div>

          {/* Cột phải: Danh sách sản phẩm tóm tắt */}
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              Đơn hàng của bạn ({cart.reduce((s, i) => s + i.qty, 0)} sản phẩm)
            </h3>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096', fontSize: '14px' }}>
                Giỏ hàng trống. Hãy chọn vài món tươi ngon nhé!
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
                <span>Phí vận chuyển sạch tiêu chuẩn</span>
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

      {/* Modal Thêm địa chỉ mới */}
      {showAddAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1a202c', fontWeight: '700' }}>
                Thêm Địa Chỉ Nhận Hàng Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}
              >
                ✕
              </button>
            </div>

            {addressModalError && (
              <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {addressModalError}
              </div>
            )}

            <form onSubmit={handleSaveNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Loại địa chỉ: Nhà ở / Công ty */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                  Loại địa chỉ <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setNewAddressType('Nhà ở')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: newAddressType === 'Nhà ở' ? '2px solid #2E7D32' : '1px solid #cbd5e0',
                      backgroundColor: newAddressType === 'Nhà ở' ? '#F0FFF4' : '#fff',
                      color: newAddressType === 'Nhà ở' ? '#276749' : '#4a5568',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    🏠 Nhà ở (Gia đình)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAddressType('Công ty')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: newAddressType === 'Công ty' ? '2px solid #2B6CB0' : '1px solid #cbd5e0',
                      backgroundColor: newAddressType === 'Công ty' ? '#EBF8FF' : '#fff',
                      color: newAddressType === 'Công ty' ? '#2B6CB0' : '#4a5568',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    🏢 Công ty (Cơ quan)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Họ tên người nhận <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Số điện thoại <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0912345678"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Tỉnh / Thành phố <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    placeholder="TP.HCM hoặc Hà Nội"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                    Quận / Huyện <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="Ví dụ: Quận 1, Cầu Giấy..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                  Phường / Xã <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newWard}
                  onChange={(e) => setNewWard(e.target.value)}
                  placeholder="Ví dụ: Phường Bến Nghé, Xã An Khánh..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                  Số nhà, tên đường, toà nhà <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  value={newAddressDetail}
                  onChange={(e) => setNewAddressDetail(e.target.value)}
                  placeholder="Ví dụ: 123 Lê Lợi, Tầng 5 Toà nhà Bitexco..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#4a5568', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    style={{ accentColor: '#2E7D32', width: '16px', height: '16px' }}
                  />
                  Đặt làm địa chỉ giao hàng mặc định
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e0',
                    backgroundColor: '#fff',
                    color: '#4a5568',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewAddress}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: isSavingNewAddress ? 'not-allowed' : 'pointer',
                    opacity: isSavingNewAddress ? 0.7 : 1
                  }}
                >
                  {isSavingNewAddress ? 'Đang lưu...' : 'Lưu và Sử dụng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
