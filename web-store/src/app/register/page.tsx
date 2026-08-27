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
  const router = useRouter();

  // Biểu thức chính quy kiểm tra định dạng
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- CÁC RÀNG BUỘC KIỂM TRA DỮ LIỆU (VALIDATION CONSTRAINTS) ---
    
    // 1. Kiểm tra trống
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ tất cả các trường thông tin.');
      return;
    }

    // 2. Ràng buộc Họ và tên
    if (fullName.trim().length < 2) {
      setError('Họ và tên phải có độ dài từ 2 ký tự trở lên.');
      return;
    }

    // 3. Ràng buộc định dạng Email
    if (!emailRegex.test(email)) {
      setError('Định dạng Email không hợp lệ (Ví dụ đúng: ten@domain.com).');
      return;
    }

    // 4. Ràng buộc định dạng Số điện thoại Việt Nam
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ. Phải gồm 10 chữ số và bắt đầu bằng đầu số di động (03, 05, 07, 08, 09).');
      return;
    }

    // 5. Ràng buộc độ dài Mật khẩu
    if (password.length < 6) {
      setError('Mật khẩu bảo mật phải có độ dài tối thiểu là 6 ký tự.');
      return;
    }

    // 6. Ràng buộc xác nhận Mật khẩu trùng khớp
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp với mật khẩu ban đầu.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5023/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fullName,
          password,
          email,
          role: 'customer',
          phone
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Đăng ký thất bại. Email hoặc Số điện thoại có thể đã tồn tại.');
      }

      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi kết nối hệ thống.');
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

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Họ và tên</label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Địa chỉ Email</label>
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Số điện thoại di động</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#333' }}>Xác nhận mật khẩu</label>
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
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2E7D32',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ NGAY'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#2E7D32', fontWeight: 'bold', textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
