import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await userService.login({
        username: values.username,
        password: values.password,
      });
      
      message.success('Đăng nhập thành công!');
      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Chuyển hướng về trang chủ Admin
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Tài khoản hoặc mật khẩu không chính xác.');
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
          <p style={{ color: '#8c8c8c', margin: '5px 0 0 0' }}>Đăng nhập trang quản trị</p>
        </div>
        
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập / Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
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
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
};
