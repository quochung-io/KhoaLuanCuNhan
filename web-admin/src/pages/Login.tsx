import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tag } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await authService.login({
        email: values.username,
        password: values.password,
      });

      const user = res.data.user;
      const role = (user.role || '').toUpperCase();

      // Kiểm tra chỉ cho phép ADMIN vào trang quản trị web-admin
      if (role !== 'ADMIN') {
        message.warning(`Tài khoản (${role}) không có quyền truy cập trang Quản trị viên.`);
        return;
      }

      message.success(`Chào mừng Quản trị viên ${user.fullName || user.email}!`);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('token', res.data.token);

      navigate('/');
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối API.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* NỀN TRANG TRÍ MỜ */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, rgba(0,0,0,0) 70%)',
          top: -100,
          right: -100,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)',
          bottom: -100,
          left: -100,
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: 440,
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#ffffff',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '36px 32px' } }}
      >
        {/* LOGO & TIÊU ĐỀ */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 14px auto',
              boxShadow: '0 8px 16px rgba(22, 163, 74, 0.3)',
            }}
          >
            🌱
          </div>
          <h2 style={{ color: '#0f172a', margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
            ECC AGRI-CHAIN
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 12px 0', fontSize: 13, fontWeight: 500 }}>
            Cổng Đăng Nhập Quản Trị Hệ Thống (Admin Portal)
          </p>
          <Tag color="success" style={{ borderRadius: 999, padding: '2px 10px', fontSize: 11.5 }}>
            <SafetyCertificateOutlined /> Tiêu Chuẩn Nông Sản VietGAP
          </Tag>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600, color: '#334155' }}>Email / Tên Đăng Nhập</span>}
            rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Tên đăng nhập!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="admin@ecc.vn hoặc admin@gmail.com" 
              size="large" 
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600, color: '#334155' }}>Mật Khẩu Quản Trị</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="••••••••" 
              size="large" 
              style={{ borderRadius: 10, height: 44 }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 28, marginBottom: 12 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              style={{ 
                height: 46, 
                borderRadius: 10, 
                fontWeight: 700, 
                fontSize: 15,
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
              }}
            >
              Đăng Nhập Quản Trị <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
          Tài khoản đối tác HTX mới?{' '}
          <Link to="/register" style={{ color: '#16a34a', fontWeight: 600 }}>
            Đăng ký hợp tác
          </Link>
        </div>
      </Card>
    </div>
  );
};
