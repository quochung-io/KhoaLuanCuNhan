import React, { useState } from 'react';
import { Form, Input, Button, Card, Modal, Radio, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // State modal OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [formValues, setFormValues] = useState<any>(null);

  const navigate = useNavigate();

  const onOpenOtpModal = async (values: any) => {
    setLoading(true);
    try {
      await authService.checkUnique({
        fullName: values.username,
        email: values.email,
        phone: values.phone,
      });
      setFormValues(values);
      setShowOtpModal(true);
      setOtpCode('');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Thông tin đã tồn tại trên hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!formValues) return;
    setIsSendingOtp(true);
    try {
      const recipient = otpMethod === 'EMAIL' ? formValues.email : formValues.phone;
      await authService.sendRegisterOtp({ recipient, type: otpMethod });
      message.success(`Đã gửi mã OTP tới ${recipient} qua ${otpMethod}. Vui lòng kiểm tra hộp thư/tin nhắn!`);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi mã OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmRegister = async () => {
    if (otpCode.trim().length !== 6) {
      message.error('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        fullName: formValues.username,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        otp: otpCode.trim(),
        verifyMethod: otpMethod,
      });

      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      setShowOtpModal(false);
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại.');
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
          <p style={{ color: '#8c8c8c', margin: '5px 0 0 0' }}>Đăng ký tài khoản quản trị</p>
        </div>

        <Form
          form={form}
          name="register_form"
          onFinish={onOpenOtpModal}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Họ và tên (chỉ nhập chữ)"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ và tên không được chứa số hoặc ký tự đặc biệt!' },
              { min: 2, message: 'Họ tên quá ngắn!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại VN phải đủ 10 số (đầu 03, 05, 07, 08, 09)!' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" size="large" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
              { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/, message: 'Mật khẩu phải chứa cả chữ cái và chữ số!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự gồm chữ và số" size="large" />
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
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block size="large">
              Tiếp Tục Xác Thực OTP
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>

      {/* Modal xác thực OTP */}
      <Modal
        title={<span><SafetyCertificateOutlined style={{ color: '#1890ff', marginRight: 8 }} />Xác thực mã OTP</span>}
        open={showOtpModal}
        onCancel={() => setShowOtpModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowOtpModal(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleConfirmRegister}>
            Xác nhận & Hoàn tất
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666' }}>Chọn phương thức nhận mã xác thực:</p>
          <Radio.Group value={otpMethod} onChange={(e) => setOtpMethod(e.target.value)} buttonStyle="solid">
            <Radio.Button value="EMAIL">✉️ Gmail</Radio.Button>
            <Radio.Button value="SMS">📱 Tin nhắn SMS</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <div>Mã xác thực sẽ được gửi tới: <strong>{otpMethod === 'EMAIL' ? formValues?.email : formValues?.phone}</strong></div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>
            Mã OTP có hiệu lực trong 5 phút. Vui lòng kiểm tra hộp thư hoặc tin nhắn điện thoại.
          </div>
        </div>

        <Button
          onClick={handleRequestOtp}
          loading={isSendingOtp}
          disabled={countdown > 0}
          style={{ width: '100%', marginBottom: 16 }}
        >
          {countdown > 0 ? `Gửi lại mã sau (${countdown}s)` : 'Bấm để Gửi mã OTP'}
        </Button>

        <Form.Item label="Nhập mã OTP (6 chữ số)">
          <Input
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            placeholder="000000"
            style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: 'bold' }}
          />
        </Form.Item>
      </Modal>
    </div>
  );
};
