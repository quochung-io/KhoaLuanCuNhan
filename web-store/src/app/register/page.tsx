'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Trạng thái OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  
  const router = useRouter();

  // Biểu thức chính quy kiểm tra định dạng
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;

  const handleOpenOtpModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- VALIDATION CONSTRAINTS (ĐỒNG BỘ 100% VỚI MOBILE) ---
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (!nameRegex.test(fullName.trim()) || fullName.trim().length < 2) {
      setError('Họ và tên chỉ được chứa chữ cái (không chứa số) và dài từ 2 ký tự.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError('Định dạng Email không hợp lệ (Ví dụ đúng: example@gmail.com).');
      return;
    }

    if (!phoneRegex.test(phone.trim())) {
      setError('Số điện thoại không hợp lệ. Phải đủ 10 chữ số và bắt đầu bằng (03, 05, 07, 08, 09).');
      return;
    }

    if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Mật khẩu phải tối thiểu 6 ký tự, gồm cả chữ cái và chữ số để an toàn.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp với mật khẩu ban đầu.');
      return;
    }

    setShowOtpModal(true);
    setOtpCode('');
    setServerOtp(null);
  };

  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    setError('');
    try {
      const recipient = otpMethod === 'EMAIL' ? email.trim() : phone.trim();
      const res = await fetch('http://localhost:5023/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, type: otpMethod })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể gửi mã OTP.');
      }

      setServerOtp(data.otp);
      alert(`Đã gửi mã OTP thành công tới ${recipient} qua ${otpMethod}!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi mã OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmRegister = async () => {
    if (otpCode.trim().length !== 6) {
      alert('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          otp: otpCode.trim(),
          verifyMethod: otpMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      setShowOtpModal(false);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi xác thực đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f6f4',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px 0'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '35px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '430px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#2E7D32', fontSize: '28px', margin: '0 0 10px 0', fontWeight: 'bold' }}>TẠO TÀI KHOẢN</h2>
          <p style={{ color: '#666', margin: 0 }}>Đăng ký thành viên mua sắm nông sản sạch</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleOpenOtpModal}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Họ và tên (chỉ nhập chữ)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vana@gmail.com"
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Số điện thoại (10 chữ số VN)
            </label>
            <input
              type="text"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="09xxxxxxxx"
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

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Mật khẩu (tối thiểu 6 ký tự, gồm chữ và số)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
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

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
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

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#2E7D32',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            TIẾP TỤC XÁC THỰC OTP & ĐĂNG KÝ
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#2E7D32', fontWeight: 'bold', textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </div>

      {/* POPUP MODAL OTP XÁC THỰC GMAIL / SMS ĐỒNG BỘ MOBILE APP */}
      {showOtpModal && (
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
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1B3A20', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛡️ Xác thực mã OTP Đăng ký
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>
              Chọn kênh nhận mã xác thực để bảo vệ tài khoản:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setOtpMethod('EMAIL')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: otpMethod === 'EMAIL' ? '2px solid #2E7D32' : '1px solid #ddd',
                  backgroundColor: otpMethod === 'EMAIL' ? '#E3F1E3' : '#fff',
                  color: otpMethod === 'EMAIL' ? '#2E7D32' : '#444',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✉️ Gmail
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('SMS')}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: otpMethod === 'SMS' ? '2px solid #2E7D32' : '1px solid #ddd',
                  backgroundColor: otpMethod === 'SMS' ? '#E3F1E3' : '#fff',
                  color: otpMethod === 'SMS' ? '#2E7D32' : '#444',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                📱 Tin nhắn SMS
              </button>
            </div>

            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '14px',
              fontSize: '12.5px',
              color: '#333'
            }}>
              <div>Mã sẽ được gửi tới: <strong>{otpMethod === 'EMAIL' ? email : phone}</strong></div>
              {serverOtp && (
                <div style={{ marginTop: '4px', color: '#2E7D32', fontWeight: 'bold' }}>
                  Mã OTP từ hệ thống: {serverOtp}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isSendingOtp}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #2E7D32',
                backgroundColor: '#fff',
                color: '#2E7D32',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                marginBottom: '18px'
              }}
            >
              {isSendingOtp ? 'Đang gửi mã...' : (serverOtp ? 'Gửi lại mã OTP mới' : 'Bấm để Gửi mã OTP')}
            </button>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                Nhập mã OTP (6 chữ số):
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  width: '100%',
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '20px',
                  letterSpacing: '8px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: '1px solid #2E7D32',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#666',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRegister}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2E7D32',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận & Hoàn tất'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
