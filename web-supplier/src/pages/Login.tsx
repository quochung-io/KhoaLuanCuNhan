import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, Divider, Space, Tag } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axiosClient from '../config/axiosClient';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusAlert, setStatusAlert] = useState<{ type: 'warning' | 'error' | 'info'; title: string; desc: string } | null>(null);
  const [form] = Form.useForm();

  const handleLogin = async (values: any) => {
    setLoading(true);
    setErrorMessage(null);
    setStatusAlert(null);

    try {
      const res = await axiosClient.post('/auth/login', {
        email: values.username.trim(),
        password: values.password
      });

      const data = res.data;
      const user = data.user;

      // Kiểm tra quyền Supplier
      if (user.roleId !== 2 && user.role?.toUpperCase() !== 'SUPPLIER' && user.roleId !== 1) {
        setErrorMessage('Tài khoản này là Khách hàng, không có quyền truy cập Kênh Đối tác & Nhà Cung Cấp!');
        setLoading(false);
        return;
      }

      // Lưu token và thông tin phiên làm việc
      localStorage.setItem('token', data.token);
      localStorage.setItem('supplier_user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      const resp = err.response?.data;
      if (resp?.status === 'Pending') {
        setStatusAlert({
          type: 'warning',
          title: 'Hồ sơ đang chờ phê duyệt (Pending)',
          desc: resp.message || 'Hồ sơ đối tác của bạn đã được tiếp nhận và đang chờ Admin kiểm duyệt (thường trong vòng 24h). Vui lòng quay lại sau!'
        });
      } else if (resp?.status === 'Rejected') {
        setStatusAlert({
          type: 'error',
          title: 'Hồ sơ đã bị từ chối (Rejected)',
          desc: resp.message || 'Hồ sơ của bạn đã bị từ chối kiểm duyệt. Vui lòng liên hệ Admin hoặc đăng ký lại với hồ sơ đầy đủ.'
        });
      } else {
        setErrorMessage(resp?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    form.setFieldsValue({ username: email, password: pass });
    setErrorMessage(null);
    setStatusAlert(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f9eb 0%, #e6f7ff 100%)',
      padding: 20
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #d9f7be'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#e6f7ff',
            color: '#52c41a',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            marginBottom: 12,
            border: '2px solid #52c41a'
          }}>
            <ShopOutlined />
          </div>
          <Title level={3} style={{ margin: 0, color: '#237804' }}>KÊNH BÁN HÀNG & ĐỐI TÁC</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Hệ thống Nông sản Sạch & Truy xuất nguồn gốc Đà Lạt
          </Text>
        </div>

        {statusAlert && (
          <Alert
            type={statusAlert.type}
            message={<b>{statusAlert.title}</b>}
            description={statusAlert.desc}
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          size="large"
          initialValues={{ username: 'dalat@gmail.com', password: 'password123' }}
        >
          <Form.Item
            name="username"
            label="Email / Tài khoản đối tác"
            rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Tài khoản!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#52c41a' }} />} placeholder="Nhập email hoặc tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#52c41a' }} />} placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                height: 46,
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8
              }}
            >
              Đăng Nhập Kênh Đối Tác
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: 14 }}>Chưa có tài khoản gian hàng? </Text>
          <Link to="/register" style={{ fontWeight: 600, color: '#237804' }}>
            Đăng ký bán hàng ngay
          </Link>
        </div>

        <Divider style={{ margin: '18px 0', fontSize: 12 }}>Tài khoản demo kiểm thử</Divider>

        <Space orientation="vertical" style={{ width: '100%' }} size="small">
          <div 
            onClick={() => handleQuickFill('dalat@gmail.com', 'password123')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12
            }}
          >
            <span>🌿 <b>HTX Nông Sản Đà Lạt</b> (Active)</span>
            <Tag color="success">dalat@gmail.com</Tag>
          </div>

          <div 
            onClick={() => handleQuickFill('anphu.farm@gmail.com', 'password123')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12
            }}
          >
            <span>⏳ <b>HTX An Phú Farm</b> (Đã test duyệt/từ chối)</span>
            <Tag color="warning">anphu.farm@gmail.com</Tag>
          </div>
        </Space>
      </Card>
    </div>
  );
};
