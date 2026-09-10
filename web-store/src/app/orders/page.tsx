'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  orderItemId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  product?: {
    productName: string;
    unit: string;
    productImages?: Array<{ imageUrl: string; isPrimary: boolean }>;
  };
}

interface Order {
  orderId: number;
  orderCode: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  address?: {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    addressType?: string;
  };
  orderItems: OrderItem[];
}

interface CartItem {
  product: {
    id: number;
    name: string;
    price: string;
    unit: string;
    icon: string;
    imageUrl?: string;
  };
  qty: number;
}

export default function CustomerOrdersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Giỏ hàng đồng bộ
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const router = useRouter();

  const loadOrders = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5023/api/orders/customer/${userId}`);
      if (!res.ok) {
        throw new Error('Không thể tải lịch sử đơn hàng.');
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load tài khoản
    const storedUser = localStorage.getItem('customer_user');
    if (!storedUser) {
      alert("Vui lòng đăng nhập để xem lịch sử mua hàng!");
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    loadOrders(parsedUser.userId);

    // Load giỏ hàng
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [router]);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_user');
    setCurrentUser(null);
    setShowUserDropdown(false);
    router.push('/');
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

  const totalCart = calculateSubtotal();

  const getStatusBadge = (status: string) => {
    let text = status;
    let bgColor = 'var(--green-100)';
    let color = 'var(--green-900)';

    switch (status.toLowerCase()) {
      case 'pending':
        text = 'Chờ xác nhận';
        bgColor = '#FFF3E0';
        color = '#E65100';
        break;
      case 'shipping':
        text = 'Đang giao hàng';
        bgColor = '#E3F2FD';
        color = '#0D47A1';
        break;
      case 'delivered':
        text = 'Đã giao hàng';
        bgColor = 'var(--green-100)';
        color = 'var(--green-700)';
        break;
      case 'cancelled':
        text = 'Đã hủy';
        bgColor = '#FFEBEE';
        color = '#C62828';
        break;
    }

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        backgroundColor: bgColor,
        color: color,
        display: 'inline-block'
      }}>
        {text}
      </span>
    );
  };

  const getProductImage = (item: OrderItem) => {
    if (item.product?.productImages && item.product.productImages.length > 0) {
      const primary = item.product.productImages.find(img => img.isPrimary);
      return primary ? primary.imageUrl : item.product.productImages[0].imageUrl;
    }
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80';
  };

  const toVND = (num: number) => num.toLocaleString('vi-VN') + ' ₫';

  return (
    <>
      {/* ── HEADER GIỐNG TRANG CHỦ (ĐỒNG BỘ MÀU SẮC) ── */}
      <header className="header" style={{ backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--green-100)' }}>
        <div className="header-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--green-900)' }}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none" style={{ marginRight: '8px' }}>
              <circle cx="20" cy="20" r="20" fill="var(--green-700)"/>
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500)"/>
              <path d="M20 30V16" stroke="var(--green-900)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            LÀNH
          </Link>

          <nav className="main-nav" style={{ display: 'flex', gap: '25px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#555', fontSize: '15px', fontWeight: '600' }}>Cửa hàng</Link>
            <Link href="/orders" style={{ textDecoration: 'none', color: 'var(--green-700)', fontSize: '15px', fontWeight: '700' }}>Lịch sử đơn hàng</Link>
          </nav>

          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Giỏ hàng */}
            <button 
              className="icon-btn" 
              onClick={() => setIsDrawerOpen(true)} 
              aria-label="Giỏ hàng"
              style={{ position: 'relative', cursor: 'pointer', border: 'none', background: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.7 12.5a2 2 0 002 1.5h9.4a2 2 0 002-1.5L23 6H6"/>
              </svg>
              {cart.length > 0 && (
                <span className="badge" style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#c62828',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>

            {/* Tài khoản */}
            <div style={{ position: 'relative' }}>
              <button 
                className="icon-btn" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                {currentUser?.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="Avatar" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--green-700)' }} 
                  />
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
                )}
                {currentUser && <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--green-700)' }}>{currentUser.fullName}</span>}
              </button>
              
              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid var(--green-100)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  width: '160px',
                  padding: '5px 0',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666' }}>
                    Vai trò: {currentUser?.roleId === 1 ? 'Admin' : (currentUser?.roleId === 2 ? 'Supplier' : 'Khách hàng')}
                  </div>
                  <Link 
                    href="/profile"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      color: '#333',
                      fontSize: '13px',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    Trang cá nhân
                  </Link>
                  <button 
                    onClick={handleCustomerLogout}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#c62828',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY NỘI DUNG CHÍNH (ĐỒNG BỘ TÔNG XANH LÀNH) ── */}
      <main style={{
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '60px 20px',
        color: '#333'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h2 style={{ color: 'var(--green-900)', fontWeight: '800', fontSize: '32px', margin: 0, letterSpacing: '-0.5px' }}>
                Lịch sử đặt hàng
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>Theo dõi trạng thái giao hàng và thông tin đơn hàng nông sản sạch của bạn.</p>
            </div>
            
            <button 
              onClick={() => currentUser && loadOrders(currentUser.userId)} 
              style={{ 
                backgroundColor: 'transparent', 
                border: '1.5px solid var(--green-700)', 
                color: 'var(--green-700)',
                padding: '8px 20px', 
                borderRadius: '25px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔄 Tải lại dữ liệu
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '14px 20px', borderRadius: '6px', marginBottom: '30px', fontSize: '14px', fontWeight: '500' }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#888', fontSize: '16px' }}>Đang tải lịch sử mua hàng...</div>
          ) : orders.length === 0 ? (
            <div style={{
              padding: '100px 20px',
              textAlign: 'center',
              border: '2px dashed var(--green-100)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '20px' }}>🌱</div>
              <h3 style={{ fontSize: '20px', color: '#333', margin: '0 0 10px 0', fontWeight: 'bold' }}>Bạn chưa có đơn hàng nào</h3>
              <p style={{ color: '#666', fontSize: '15px', margin: '0 0 30px 0' }}>Hãy bắt đầu chọn những sản phẩm tươi xanh từ nông trại sạch Đông Anh ngay nhé.</p>
              <Link href="/" style={{
                backgroundColor: 'var(--green-700)',
                color: 'white',
                padding: '14px 35px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '15px',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(46,125,50,0.15)'
              }}>
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {orders.map(order => (
                <div key={order.orderId} style={{
                  border: '1px solid var(--green-100)',
                  borderRadius: '12px',
                  padding: '30px',
                  transition: 'all 0.2s',
                  backgroundColor: '#ffffff'
                }}>
                  {/* Hàng 1: Thông tin đơn hàng & Trạng thái */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--green-100)',
                    paddingBottom: '20px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã đơn</span>
                      <div style={{ fontSize: '18px', color: 'var(--green-900)', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '3px' }}>{order.orderCode}</div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                        Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {getStatusBadge(order.orderStatus)}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: order.paymentStatus.toLowerCase() === 'paid' ? 'var(--green-700)' : '#E65100',
                        backgroundColor: order.paymentStatus.toLowerCase() === 'paid' ? 'var(--green-100)' : '#FFF3E0',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        letterSpacing: '0.5px'
                      }}>
                        {order.paymentStatus.toLowerCase() === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin địa chỉ nhận hàng */}
                  {order.address && (
                    <div style={{
                      backgroundColor: '#F8FCF8',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', color: '#2E7D32' }}>📍 Giao đến:</span>
                        <span style={{ fontWeight: '600', color: '#1A202C' }}>{order.address.receiverName}</span>
                        <span style={{ color: '#718096' }}>({order.address.phone})</span>
                        <span style={{ color: '#4A5568' }}>• {order.address.addressDetail}, {order.address.ward}, {order.address.district}, {order.address.province}</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: order.address.addressType === 'Công ty' ? '#EBF8FF' : '#F0FFF4',
                        color: order.address.addressType === 'Công ty' ? '#2B6CB0' : '#276749',
                        border: `1px solid ${order.address.addressType === 'Công ty' ? '#BEE3F8' : '#C6F6D5'}`
                      }}>
                        {order.address.addressType === 'Công ty' ? '🏢 Công ty' : '🏠 Nhà ở'}
                      </span>
                    </div>
                  )}

                  {/* Hàng 2: Danh sách chi tiết nông sản */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '25px' }}>
                    {order.orderItems.map(item => (
                      <div key={item.orderItemId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '15px',
                        gap: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={getProductImage(item)} 
                            alt={item.product?.productName} 
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid var(--green-100)'
                            }}
                          />
                          <div>
                            <strong style={{ color: '#333', fontSize: '15px', display: 'block' }}>{item.product?.productName || 'Nông sản sạch'}</strong>
                            <span style={{ color: '#888', fontSize: '13px' }}>Đơn giá: {toVND(item.unitPrice)} / {item.product?.unit || 'kg'} • Số lượng: {item.quantity}</span>
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--green-900)', fontSize: '15px' }}>
                          {toVND(item.totalAmount)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hàng 3: Tổng thanh toán & Phương thức */}
                  <div style={{
                    borderTop: '1px solid var(--green-100)',
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Hình thức: <strong>{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản Ngân hàng'}</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#666', fontSize: '14px' }}>Tổng thanh toán:</span>
                      <strong style={{ color: '#c62828', fontSize: '22px', marginLeft: '8px', fontWeight: 'bold' }}>{toVND(order.totalAmount)}</strong>
                      <span style={{ fontSize: '12px', color: '#999', display: 'block', marginTop: '3px' }}>(Bao gồm 30.000 ₫ phí giao hàng)</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER GIỐNG TRANG CHỦ ── */}
      <footer className="footer" style={{ borderTop: '1px solid var(--green-100)', backgroundColor: '#ffffff' }}>
        <div className="foot-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="foot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            <div>
              <div className="logo" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--green-900)', marginBottom: '15px' }}>LÀNH</div>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Chuỗi thực phẩm sạch từ nông trại đến bàn ăn. Đảm bảo nguồn gốc, kiểm định VietGAP/USDA và minh bạch thông tin.</p>
            </div>
            <div>
              <h5 style={{ color: '#333', fontSize: '15px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Liên hệ</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#666' }}>
                <li>Hợp tác xã Đông Anh, Hà Nội</li>
                <li>Hotline: 1900-8888</li>
                <li>Email: contact@lanhstore.vn</li>
              </ul>
            </div>
            <div>
              <h5 style={{ color: '#333', fontSize: '15px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Chính sách</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#666' }}>
                <li>Vận chuyển &amp; giao nhận</li>
                <li>Đổi trả trong 24h</li>
                <li>Bảo mật thông tin</li>
                <li>Điều khoản dịch vụ</li>
              </ul>
            </div>
            <div>
              <h5 style={{ color: '#333', fontSize: '15px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Thanh toán</h5>
              <div className="pay-icons" style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                <span>VISA</span><span>MoMo</span><span>ZaloPay</span><span>COD</span>
              </div>
            </div>
          </div>
          <div className="foot-bottom" style={{ borderTop: '1px solid var(--green-100)', marginTop: '40px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: '#999' }}>
            <span>© 2026 LÀNH — Đồ án tốt nghiệp UI/UX, Đại học ABC.</span>
            <span>Thiết kế minh họa cho mục đích học thuật.</span>
          </div>
        </div>
      </footer>

      {/* ── OVERLAY VÀ DRAWER GIỎ HÀNG ── */}
      {isDrawerOpen && (
        <>
          <div className="overlay show" onClick={() => setIsDrawerOpen(false)} style={{ zIndex: 999 }}></div>
          <aside className="drawer show" aria-label="Giỏ hàng" style={{ zIndex: 1000 }}>
            <div className="drawer-head" style={{ padding: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Giỏ hàng của bạn</h3>
              <button className="icon-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Đóng giỏ hàng" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="drawer-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {cart.length === 0 ? (
                <div className="drawer-empty" style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>Giỏ hàng đang trống.<br/>Hãy thêm vài món rau sạch nhé 🌱</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} className="drawer-item" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="thumb" style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #edf2f7' }}>
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80'} 
                          alt={item.product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div className="info" style={{ flex: 1 }}>
                        <b style={{ display: 'block', fontSize: '14px', color: '#2d3748' }}>{item.product.name}</b>
                        <span style={{ fontSize: '12px', color: '#718096' }}>{item.product.price} {item.product.unit}</span>
                        <div className="qty-ctrl" style={{ display: 'flex', alignItems: 'center', marginTop: '6px', border: '1px solid #cbd5e0', borderRadius: '4px', width: 'fit-content' }}>
                          <button onClick={() => updateCartQty(item.product.id, -1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '13px', padding: '0 6px', fontWeight: 'bold' }}>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product.id, 1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} aria-label="Xóa" style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#e53e3e' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="drawer-foot" style={{ padding: '20px', borderTop: '1px solid #edf2f7', backgroundColor: '#fcfdfc' }}>
              <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                <span>Tạm tính</span>
                <span>{toVND(totalCart)}</span>
              </div>
              <button 
                className="btn btn-accent" 
                onClick={() => { setIsDrawerOpen(false); router.push('/checkout'); }}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Thanh toán ngay
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
