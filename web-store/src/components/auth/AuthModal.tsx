'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
  onLoginSuccess?: (user: any) => void;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onLoginSuccess,
}) => {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtpMethod, setRegOtpMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regServerOtp, setRegServerOtp] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setError('');
    setSuccess('');
  }, [initialTab, isOpen]);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  // ── Xử lý Đăng nhập ──────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginEmail.trim() || !loginPassword) {
      setError('Vui lòng điền đầy đủ Email/Tên đăng nhập và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }

      // Lưu localStorage
      localStorage.setItem('customer_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);

      setSuccess(`Đăng nhập thành công! Xin chào ${data.user.fullName || 'bạn'}`);
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      setTimeout(() => {
        onClose();
        const role = (data.user.role || '').toUpperCase();
        if (role === 'ADMIN') {
          window.location.href = 'http://localhost:5173/dashboard';
        } else if (role === 'SUPPLIER') {
          window.location.href = 'http://localhost:5174/dashboard';
        }
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // ── Xử lý Gửi mã OTP đăng ký ────────────────────────────────
  const handleSendRegisterOtp = async () => {
    setError('');
    setSuccess('');

    const recipient = regOtpMethod === 'EMAIL' ? regEmail.trim() : regPhone.trim();
    if (!recipient) {
      setError(regOtpMethod === 'EMAIL' ? 'Vui lòng nhập Email để nhận mã OTP!' : 'Vui lòng nhập Số điện thoại để nhận mã OTP!');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, type: regOtpMethod })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Không thể gửi mã OTP.');
      }

      setRegServerOtp(data.otp);
      setOtpCountdown(60);
      setSuccess(`Đã gửi mã OTP thành công tới ${recipient}!`);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi mã xác thực OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Xử lý Xác nhận Đăng ký ──────────────────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setError('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!regOtpCode || regOtpCode.trim().length !== 6) {
      setError('Vui lòng bấm Gửi OTP và nhập đủ 6 chữ số mã xác thực!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          otp: regOtpCode.trim(),
          verifyMethod: regOtpMethod
        })
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký tài khoản thất bại.');
      }

      setSuccess('Đăng ký thành công! Đang tự động đăng nhập...');
      
      // Auto login
      setTimeout(async () => {
        try {
          const loginRes = await fetch('http://localhost:5023/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: regEmail.trim(), password: regPassword })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
            localStorage.setItem('customer_user', JSON.stringify(loginData.user));
            localStorage.setItem('auth_token', loginData.token);
            if (onLoginSuccess) onLoginSuccess(loginData.user);
          }
        } catch {
          // ignore auto login error
        }
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Lỗi trong quá trình đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  // ── Xử lý Quên mật khẩu ──────────────────────────────────────
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail.trim()) {
      setError('Vui lòng nhập email tài khoản của bạn!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể gửi mã xác nhận.');

      setSuccess(`Đã gửi mã OTP khôi phục tới ${forgotEmail}!`);
      setForgotStep(2);
    } catch (err: any) {
      setError(err.message || 'Lỗi yêu cầu đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotOtp.trim() || !forgotNewPassword) {
      setError('Vui lòng nhập mã OTP và mật khẩu mới!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');

      setSuccess('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      setTimeout(() => {
        setTab('login');
        setLoginEmail(forgotEmail);
        setForgotStep(1);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Lỗi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 28, 20, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: tab === 'register' ? '520px' : '440px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--line, #E1EAE0)',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--green-100, #E3F1E3)',
            color: 'var(--green-900, #1B3A20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10,
            transition: 'transform 0.15s ease'
          }}
          aria-label="Đóng cửa sổ"
        >
          ✕
        </button>

        {/* Header Logo & Tabs */}
        <div style={{ padding: '28px 28px 16px 28px', textAlign: 'center', backgroundColor: 'var(--green-100, #F4F8F4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <svg style={{ width: '32px', height: '32px' }} viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="var(--green-700, #2E7D32)"/>
              <path d="M20 30C20 30 12 26 12 18C12 13 16 10 20 10C24 10 28 13 28 18C28 26 20 30 20 30Z" fill="var(--green-500, #4CAF50)"/>
              <path d="M20 30V16" stroke="var(--green-900, #1B3A20)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-display, serif)', color: 'var(--green-900, #1B3A20)', letterSpacing: '0.05em' }}>
              LÀNH STORE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft, #4B5D50)', margin: 0 }}>
            Nông sản hữu cơ & thực phẩm sạch từ nông trại đến bàn ăn
          </p>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '999px',
            padding: '4px',
            marginTop: '20px',
            border: '1px solid var(--line, #E1EAE0)'
          }}>
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === 'login' ? 'var(--green-700, #2E7D32)' : 'transparent',
                color: tab === 'login' ? '#ffffff' : 'var(--ink-soft, #4B5D50)',
                transition: 'all 0.2s ease',
                boxShadow: tab === 'login' ? '0 2px 8px rgba(46, 125, 50, 0.3)' : 'none'
              }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === 'register' ? 'var(--green-700, #2E7D32)' : 'transparent',
                color: tab === 'register' ? '#ffffff' : 'var(--ink-soft, #4B5D50)',
                transition: 'all 0.2s ease',
                boxShadow: tab === 'register' ? '0 2px 8px rgba(46, 125, 50, 0.3)' : 'none'
              }}
            >
              Đăng ký mới
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px 28px 28px 28px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Thông báo lỗi & thành công */}
          {error && (
            <div style={{
              backgroundColor: '#FDE8E8',
              color: '#9B1C1C',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #F8B4B4'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#DEF7EC',
              color: '#03543F',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #BCF0DA'
            }}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* ────────────────── TAB ĐĂNG NHẬP ────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '6px' }}>
                  Email hoặc Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="minhanh@gmail.com hoặc admin@gmail.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--line, #E1EAE0)',
                    fontSize: '14.5px',
                    outline: 'none',
                    backgroundColor: 'var(--bg, #F9FBF8)',
                    color: 'var(--ink, #16241A)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink, #16241A)' }}>
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    style={{ fontSize: '12px', color: 'var(--green-700, #2E7D32)', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (ví dụ: 123456)"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '14.5px',
                      outline: 'none',
                      backgroundColor: 'var(--bg, #F9FBF8)',
                      color: 'var(--ink, #16241A)',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '16px',
                      color: 'var(--ink-soft, #666)'
                    }}
                  >
                    {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Tài khoản mẫu gợi ý */}
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--green-100, #F0F7F0)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--green-900, #1B3A20)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Tài khoản mẫu: <strong>minhanh@gmail.com</strong></span>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('minhanh@gmail.com'); setLoginPassword('123456'); }}
                  style={{
                    backgroundColor: 'var(--green-700, #2E7D32)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  Điền nhanh
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--green-700, #2E7D32)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.35)',
                  marginTop: '4px',
                  transition: 'transform 0.15s ease'
                }}
              >
                {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink-soft, #666)', marginTop: '8px' }}>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  style={{ color: 'var(--green-700, #2E7D32)', fontWeight: '700', textDecoration: 'underline' }}
                >
                  Đăng ký tài khoản mới
                </button>
              </div>
            </form>
          )}

          {/* ────────────────── TAB ĐĂNG KÝ ────────────────── */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '4px' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line, #E1EAE0)',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'var(--bg, #F9FBF8)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '4px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@domain.com"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'var(--bg, #F9FBF8)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '4px' }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0912345678"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'var(--bg, #F9FBF8)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '4px' }}>
                    Mật khẩu *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'var(--bg, #F9FBF8)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '4px' }}>
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'var(--bg, #F9FBF8)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Phần nhận mã xác thực OTP */}
              <div style={{
                padding: '14px',
                backgroundColor: 'var(--green-100, #F4F8F4)',
                borderRadius: '14px',
                border: '1px solid var(--line, #E1EAE0)',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--green-900, #1B3A20)' }}>
                    Xác thực OTP qua:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="otpMethod" 
                        checked={regOtpMethod === 'EMAIL'} 
                        onChange={() => setRegOtpMethod('EMAIL')} 
                      />
                      Email
                    </label>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="otpMethod" 
                        checked={regOtpMethod === 'SMS'} 
                        onChange={() => setRegOtpMethod('SMS')} 
                      />
                      SMS
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value)}
                    placeholder="Nhập 6 số OTP"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line, #E1EAE0)',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendRegisterOtp}
                    disabled={isSendingOtp || otpCountdown > 0}
                    style={{
                      padding: '0 16px',
                      borderRadius: '8px',
                      backgroundColor: otpCountdown > 0 ? 'var(--line, #ccc)' : 'var(--accent, #FF9800)',
                      color: '#3A2200',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: (isSendingOtp || otpCountdown > 0) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isSendingOtp ? 'Đang gửi...' : otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : 'Gửi mã OTP'}
                  </button>
                </div>

                {regServerOtp && (
                  <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--green-700, #2E7D32)', fontWeight: '600' }}>
                    💡 Mã OTP mô phỏng: <span style={{ fontSize: '14px', textDecoration: 'underline' }}>{regServerOtp}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--green-700, #2E7D32)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.35)',
                  marginTop: '6px'
                }}
              >
                {loading ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ'}
              </button>
            </form>
          )}

          {/* ────────────────── TAB QUÊN MẬT KHẨU ────────────────── */}
          {tab === 'forgot' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
                  style={{ fontSize: '13px', color: 'var(--green-700, #2E7D32)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  ← Quay lại Đăng nhập
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink, #16241A)', marginBottom: '6px' }}>
                      Nhập Email tài khoản cần đặt lại mật khẩu:
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--line, #E1EAE0)',
                        fontSize: '14.5px',
                        backgroundColor: 'var(--bg, #F9FBF8)'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--green-700, #2E7D32)',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Đang gửi...' : 'GỬI MÃ XÁC THỰC OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Nhập mã OTP đã gửi về Email:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="6 chữ số OTP"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--line, #E1EAE0)',
                        fontSize: '16px',
                        letterSpacing: '2px',
                        textAlign: 'center'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Mật khẩu mới:
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid var(--line, #E1EAE0)',
                        fontSize: '14.5px'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--green-700, #2E7D32)',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {loading ? 'Đang cập nhật...' : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
