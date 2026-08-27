import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await userService.register({
        username: values.username,
        password: values.password,
        email: values.email,
        role: values.role,
        phone: values.phone,
      });

      message.success('Đăng ký tài khoản thành công!');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error('Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại.');
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
      backgroundColor: '#f0f2f5',
      padding: '20px 0'
    }}>
      <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#1890ff', margin: 0 }}>HỆ THỐNG ECC</h2>
          <p style={{ color: '#8c8c8c', margin: '5px 0 0 0' }}>Đăng ký tài khoản mới</p>
        </div>

        <Form
          name="register_form"
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" size="large" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò tài khoản"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò" size="large">
              <Select.Option value="Admin">Admin (Quản trị viên)</Select.Option>
              <Select.Option value="Supplier">Supplier (Nhà cung cấp / HTX)</Select.Option>
              <Select.Option value="Customer">Customer (Khách hàng)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không trùng khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng Ký Tài Khoản
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};
