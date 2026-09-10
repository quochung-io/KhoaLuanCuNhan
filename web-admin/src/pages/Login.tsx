import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ color: '#1890ff', margin: 0 }}>HỆ THỐNG ECC</h2>
          <p style={{ color: '#8c8c8c', margin: '5px 0 0 0' }}>Đăng nhập trang quản trị (Admin)</p>
        </div>
        
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Email / Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@gmail.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng Nhập Quản Trị
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </Card>
    </div>
  );
};
