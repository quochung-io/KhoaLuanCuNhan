'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

  // Form Thông tin cá nhân
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sổ địa chỉ
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');
  const [addressErrorMsg, setAddressErrorMsg] = useState('');

  // Modal Thêm / Sửa địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formReceiverName, setFormReceiverName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProvince, setFormProvince] = useState('TP.HCM');
  const [formDistrict, setFormDistrict] = useState('');
  const [formWard, setFormWard] = useState('');
  const [formAddressDetail, setFormAddressDetail] = useState('');
  const [formAddressType, setFormAddressType] = useState('Nhà ở');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('customer_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(stored);
    setUser(userData);
    setFullName(userData.fullName || '');
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setAvatarUrl(userData.avatarUrl || '');

    fetchAddresses(userData.userId);
  }, [router]);

  const fetchAddresses = async (userId: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/user/${userId}`);
      if (res.ok) {
        const data: CustomerAddress[] = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách địa chỉ:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setProfileError('Họ tên, Email và Số điện thoại không được để trống.');
      return;
    }

    setProfileLoading(true);
    try {
      const payload: any = {
        userId: user.userId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
        roleId: user.roleId,
        status: user.status || 'Active'
      };

      if (password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        payload.passwordHash = hashHex;
      }

      const res = await fetch(`http://localhost:5023/api/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Cập nhật thông tin thất bại.');
      }

      const updatedUser = { ...user, fullName, email, phone, avatarUrl };
      localStorage.setItem('customer_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setProfileSuccess('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Có lỗi kết nối máy chủ.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Mở modal Thêm mới địa chỉ
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormReceiverName(user?.fullName || '');
    setFormPhone(user?.phone || '');
    setFormProvince('TP.HCM');
    setFormDistrict('');
    setFormWard('');
    setFormAddressDetail('');
    setFormAddressType('Nhà ở');
    setFormIsDefault(addresses.length === 0);
    setModalError('');
    setShowAddressModal(true);
  };

  // Mở modal Chỉnh sửa địa chỉ
  const handleOpenEditModal = (addr: CustomerAddress) => {
    setEditingAddressId(addr.addressId);
    setFormReceiverName(addr.receiverName);
    setFormPhone(addr.phone);
    setFormProvince(addr.province);
    setFormDistrict(addr.district);
    setFormWard(addr.ward);
    setFormAddressDetail(addr.addressDetail);
    setFormAddressType(addr.addressType || 'Nhà ở');
    setFormIsDefault(addr.isDefault);
    setModalError('');
    setShowAddressModal(true);
  };

  // Đặt làm địa chỉ mặc định
  const handleSetDefault = async (addressId: number) => {
    try {
      const res = await fetch(`http://localhost:5023/api/addresses/${addressId}/set-default`, {
        method: 'PUT'
      });
      if (!res.ok) {
        throw new Error('Không thể cập nhật địa chỉ mặc định.');
      }
      setAddressSuccessMsg('Đã chuyển đổi địa chỉ mặc định thành công!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setAddressErrorMsg(err.message || 'Lỗi khi đặt mặc định.');
      setTimeout(() => setAddressErrorMsg(''), 3000);
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này không?')) return;

    try {
      const res = await fetch(`http://localhost:5023/api/addresses/${addressId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Không thể xóa địa chỉ.');
      }
      setAddressSuccessMsg('Đã xóa địa chỉ thành công!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setAddressErrorMsg(err.message || 'Lỗi khi xóa địa chỉ.');
      setTimeout(() => setAddressErrorMsg(''), 3000);
    }
  };

  // Lưu địa chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!formReceiverName.trim() || !formPhone.trim() || !formDistrict.trim() || !formWard.trim() || !formAddressDetail.trim()) {
      setModalError('Vui lòng điền đầy đủ các thông tin địa chỉ.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        userId: user.userId,
        receiverName: formReceiverName.trim(),
        phone: formPhone.trim(),
        province: formProvince.trim(),
        district: formDistrict.trim(),
        ward: formWard.trim(),
        addressDetail: formAddressDetail.trim(),
        addressType: formAddressType,
        isDefault: formIsDefault || addresses.length === 0
      };

      let res;
      if (editingAddressId) {
        res = await fetch(`http://localhost:5023/api/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5023/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Không thể lưu địa chỉ.');
      }

      setShowAddressModal(false);
      setAddressSuccessMsg(editingAddressId ? 'Cập nhật địa chỉ thành công!' : 'Đã thêm địa chỉ nhận hàng mới!');
      setTimeout(() => setAddressSuccessMsg(''), 3000);
      await fetchAddresses(user.userId);
    } catch (err: any) {
      setModalError(err.message || 'Lỗi lưu địa chỉ.');
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải thông tin tài khoản...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f7f4',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px',
      color: '#2d3748'
    }}>
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Header trên cùng */}
        <div style={{ padding: '24px 30px 0 30px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Link href="/" style={{ color: '#2E7D32', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
              ← Quay lại Cửa hàng
            </Link>
          </div>

          <h2 style={{ color: '#1B5E20', margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold' }}>
            Quản Lý Tài Khoản Khách Hàng
          </h2>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #edf2f7' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                fontSize: '15px',
                fontWeight: activeTab === 'profile' ? '700' : '500',
                color: activeTab === 'profile' ? '#2E7D32' : '#718096',
                borderBottom: activeTab === 'profile' ? '3px solid #2E7D32' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👤 Thông tin cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                fontSize: '15px',
                fontWeight: activeTab === 'addresses' ? '700' : '500',
                color: activeTab === 'addresses' ? '#2E7D32' : '#718096',
                borderBottom: activeTab === 'addresses' ? '3px solid #2E7D32' : '3px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📍 Sổ địa chỉ nhận hàng ({addresses.length})
            </button>
          </div>
        </div>

        {/* Nội dung Tab */}
        <div style={{ padding: '30px' }}>
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'profile' && (
            <div>
              {profileError && (
                <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                  ⚠️ {profileError}
                </div>
              )}

              {profileSuccess && (
                <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
                  ✓ {profileSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                  <img 
                    src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                    alt="Avatar" 
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #2E7D32'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>
                      Đường dẫn URL ảnh đại diện
                    </label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Dán URL ảnh đại diện của bạn vào đây"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Họ tên đầy đủ"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại liên lạc"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Đổi mật khẩu mới (Để trống nếu không đổi)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới của bạn"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: profileLoading ? 0.7 : 1,
                    marginTop: '10px'
                  }}
                >
                  {profileLoading ? 'Đang lưu thay đổi...' : 'LƯU THÔNG TIN CÁ NHÂN'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SỔ ĐỊA CHỈ NHẬN HÀNG */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1a202c', fontWeight: '700' }}>
                    Danh Sách Địa Chỉ Giao Hàng
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#718096' }}>
                    Quản lý các địa chỉ nhận hàng của bạn (Nhà ở hoặc Công ty) và chọn 1 địa chỉ làm mặc định.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  style={{
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(46,125,50,0.2)'
                  }}
                >
                  + Thêm địa chỉ mới
                </button>
              </div>

              {addressSuccessMsg && (
                <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
                  ✓ {addressSuccessMsg}
                </div>
              )}

              {addressErrorMsg && (
                <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                  ⚠️ {addressErrorMsg}
                </div>
              )}

              {addressLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096' }}>
                  Đang tải danh sách địa chỉ...
                </div>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📍</div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#374151' }}>Bạn chưa lưu địa chỉ nào</h4>
                  <p style={{ margin: '0 0 20px 0', color: '#6B7280', fontSize: '14px' }}>
                    Hãy thêm địa chỉ nhận hàng để việc đặt hàng nhanh chóng và thuận tiện hơn.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    style={{
                      backgroundColor: '#2E7D32',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    + Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {addresses.map(addr => {
                    const isCompany = addr.addressType === 'Công ty';

                    return (
                      <div
                        key={addr.addressId}
                        style={{
                          border: addr.isDefault ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                          backgroundColor: addr.isDefault ? '#F8FCF8' : '#ffffff',
                          borderRadius: '12px',
                          padding: '20px',
                          position: 'relative',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '700', fontSize: '16px', color: '#1A202C' }}>
                                {addr.receiverName}
                              </span>
                              <span style={{ color: '#A0AEC0' }}>|</span>
                              <span style={{ color: '#4A5568', fontWeight: '500', fontSize: '14px' }}>
                                {addr.phone}
                              </span>

                              {/* Badge loại địa chỉ: Nhà ở hoặc Công ty */}
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: isCompany ? '#EBF8FF' : '#F0FFF4',
                                color: isCompany ? '#2B6CB0' : '#276749',
                                border: `1px solid ${isCompany ? '#BEE3F8' : '#C6F6D5'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {isCompany ? '🏢 Công ty' : '🏠 Nhà ở'}
                              </span>

                              {/* Badge Địa chỉ mặc định */}
                              {addr.isDefault && (
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  backgroundColor: '#FFFBEB',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ★ Địa chỉ mặc định
                                </span>
                              )}
                            </div>

                            <div style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.6' }}>
                              <div>{addr.addressDetail}</div>
                              <div style={{ color: '#718096' }}>{addr.ward}, {addr.district}, {addr.province}</div>
                            </div>
                          </div>

                          {/* Hành động */}
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(addr)}
                              style={{
                                background: 'none',
                                border: '1px solid #CBD5E0',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                color: '#4A5568',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.addressId)}
                              style={{
                                background: 'none',
                                border: '1px solid #FED7D7',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                color: '#E53E3E',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Nút đặt mặc định nếu chưa phải mặc định */}
                        {!addr.isDefault && (
                          <div style={{ marginTop: '14px', borderTop: '1px solid #EDF2F7', paddingTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr.addressId)}
                              style={{
                                background: 'none',
                                border: '1px solid #2E7D32',
                                color: '#2E7D32',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Thiết lập làm địa chỉ mặc định
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm / Chỉnh sửa địa chỉ */}
      {showAddressModal && (
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
                {editingAddressId ? 'Cập Nhật Địa Chỉ Nhận Hàng' : 'Thêm Địa Chỉ Nhận Hàng Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Loại địa chỉ: Nhà ở / Công ty */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                  Loại địa chỉ <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormAddressType('Nhà ở')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formAddressType === 'Nhà ở' ? '2px solid #2E7D32' : '1px solid #cbd5e0',
                      backgroundColor: formAddressType === 'Nhà ở' ? '#F0FFF4' : '#fff',
                      color: formAddressType === 'Nhà ở' ? '#276749' : '#4a5568',
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
                    onClick={() => setFormAddressType('Công ty')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formAddressType === 'Công ty' ? '2px solid #2B6CB0' : '1px solid #cbd5e0',
                      backgroundColor: formAddressType === 'Công ty' ? '#EBF8FF' : '#fff',
                      color: formAddressType === 'Công ty' ? '#2B6CB0' : '#4a5568',
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
                    value={formReceiverName}
                    onChange={(e) => setFormReceiverName(e.target.value)}
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
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
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
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
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
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
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
                  value={formWard}
                  onChange={(e) => setFormWard(e.target.value)}
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
                  value={formAddressDetail}
                  onChange={(e) => setFormAddressDetail(e.target.value)}
                  placeholder="Ví dụ: 123 Lê Lợi, Tầng 5 Toà nhà Bitexco..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#4a5568', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    style={{ accentColor: '#2E7D32', width: '16px', height: '16px' }}
                  />
                  Đặt làm địa chỉ giao hàng mặc định
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
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
                  disabled={modalLoading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '13.5px',
                    cursor: modalLoading ? 'not-allowed' : 'pointer',
                    opacity: modalLoading ? 0.7 : 1
                  }}
                >
                  {modalLoading ? 'Đang lưu...' : (editingAddressId ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
