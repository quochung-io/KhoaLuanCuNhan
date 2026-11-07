// ============================================================================
// TỆP MÃ NGUỒN: web-portal/src/pages/Register.tsx
// MÔ TẢ: Trang Đăng ký Hồ sơ Đối tác Hợp tác xã / Nhà cung cấp nông sản (Web Portal).
// ============================================================================
import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, InputNumber, Alert, Modal, message } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';

const { Option } = Select;

export const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        fullName: values.fullName?.trim(),
        storeName: values.storeName?.trim(),
        farmName: values.storeName?.trim(),
        email: values.email?.trim().toLowerCase(),
        phone: values.phone?.trim(),
        password: values.password,
        businessLicense: values.businessLicense?.trim() || 'Đang cập nhật',
        province: values.province || 'Tỉnh Lâm Đồng',
        district: values.district?.trim() || 'Thành phố Đà Lạt',
        address: values.address?.trim() || '',
        area: values.area || 1.0,
        cropType: values.cropType || 'Rau củ quả sạch',
        productionStandard: values.productionStandard || 'VietGAP',
        certNumber: values.certNumber?.trim() || 'VG-VN-DL-2026'
      };

      const res = await userService.supplierRegister(payload);
      setRegisteredName(payload.storeName);
      setSuccessModalVisible(true);
      message.success(res.data?.message || 'Nộp hồ sơ đối tác thành công!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi nộp hồ sơ đăng ký Hợp tác xã. Vui lòng thử lại!';
      message.error(errMsg);
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
      background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
      padding: '40px 20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 760,
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#ffffff'
        }}
        styles={{ body: { padding: '36px 36px' } }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 18px rgba(22, 163, 74, 0.35)',
            }}
          >
            🌾
          </div>
          <h2 style={{ color: '#0f172a', margin: 0, fontSize: 24, fontWeight: 800 }}>ECC AGRI-CHAIN</h2>
          <p style={{ color: '#16a34a', margin: '4px 0 0 0', fontSize: 15, fontWeight: 700 }}>
            Cổng Đăng Ký Đối Tác Hợp Tác Xã & Nhà Cung Cấp
          </p>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: 13 }}>
            Tham gia mạng lưới cung ứng nông sản minh bạch nguồn gốc và chứng nhận VietGAP
          </p>
        </div>

        {/* Thông báo cơ chế liên kết tài khoản */}
        <Alert
          message="Chính sách tài khoản dùng chung"
          description={
            <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              Nếu quý đối tác đã có tài khoản <strong>Khách hàng</strong> bằng Email này, vui lòng nhập <strong>chính xác mật khẩu</strong> của tài khoản đó để hệ thống nâng cấp thêm vai trò <strong>Hợp tác xã</strong> (dùng chung 1 Email & Mật khẩu trên toàn hệ thống).
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: 10 }}
        />

        <Form
          form={form}
          name="supplier_register_form"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            province: 'Tỉnh Lâm Đồng',
            district: 'Thành phố Đà Lạt',
            productionStandard: 'VietGAP',
            area: 3.5,
            cropType: 'Rau ăn lá & củ quả ôn đới'
          }}
        >
          {/* PHẦN 1: THÔNG TIN HỢP TÁC XÃ */}
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#15803d',
            borderBottom: '1.5px solid #e2e8f0',
            paddingBottom: 6,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <ShopOutlined /> 1. THÔNG TIN HỢP TÁC XÃ / CƠ SỞ SẢN XUẤT
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="storeName"
                label="Tên Hợp tác xã / Cơ sở sản xuất *"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên Hợp tác xã!' },
                  { min: 4, message: 'Tên HTX tối thiểu 4 ký tự!' }
                ]}
              >
                <Input prefix={<ShopOutlined />} placeholder="Ví dụ: HTX Nông Sản Sạch Đà Lạt" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item
                name="businessLicense"
                label="Mã số thuế / GPĐKKD *"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã số thuế hoặc GPĐKKD!' }
                ]}
              >
                <Input prefix={<FileProtectOutlined />} placeholder="Ví dụ: 5801234567" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="productionStandard"
                label="Tiêu chuẩn canh tác *"
                rules={[{ required: true, message: 'Vui lòng chọn tiêu chuẩn!' }]}
              >
                <Select size="large">
                  <Option value="VietGAP">Chuẩn VietGAP Nông nghiệp</Option>
                  <Option value="GlobalGAP">Chuẩn GlobalGAP Xuất khẩu</Option>
                  <Option value="Hữu cơ (Organic)">Canh tác Hữu cơ Organic</Option>
                  <Option value="OCOP 4 Sao">Chứng nhận OCOP Quốc gia</Option>
                  <Option value="Chuẩn xuất khẩu">Nông sản Chuẩn Xuất Khẩu</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="certNumber"
                label="Số hiệu chứng chỉ (VietGAP/GlobalGAP) *"
                rules={[{ required: true, message: 'Vui lòng nhập mã chứng chỉ!' }]}
              >
                <Input prefix={<SafetyCertificateOutlined />} placeholder="Ví dụ: VG-2026-DL-889" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cropType"
                label="Nhóm nông sản chủ lực *"
                rules={[{ required: true, message: 'Vui lòng nhập nhóm nông sản!' }]}
              >
                <Input placeholder="Ví dụ: Rau ăn lá, củ quả ôn đới, cà chua, dâu tây..." size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="area"
                label="Quy mô diện tích vùng canh tác (Hecta) *"
                rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
              >
                <InputNumber min={0.1} step={0.5} style={{ width: '100%' }} size="large" placeholder="Ví dụ: 5.0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="province"
                label="Tỉnh / Thành phố *"
                rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố!' }]}
              >
                <Select size="large" showSearch>
                  <Option value="Tỉnh Lâm Đồng">Tỉnh Lâm Đồng</Option>
                  <Option value="Tỉnh Đắk Lắk">Tỉnh Đắk Lắk</Option>
                  <Option value="Tỉnh Gia Lai">Tỉnh Gia Lai</Option>
                  <Option value="Tỉnh Đồng Tháp">Tỉnh Đồng Tháp</Option>
                  <Option value="Tỉnh Vĩnh Long">Tỉnh Vĩnh Long</Option>
                  <Option value="Tỉnh Tiền Giang">Tỉnh Tiền Giang</Option>
                  <Option value="Tỉnh Bến Tre">Tỉnh Bến Tre</Option>
                  <Option value="Tỉnh Sơn La">Tỉnh Sơn La</Option>
                  <Option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</Option>
                  <Option value="Thành phố Hà Nội">Thành phố Hà Nội</Option>
                  <Option value="Thành phố Cần Thơ">Thành phố Cần Thơ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="district"
                label="Quận / Huyện *"
                rules={[{ required: true, message: 'Vui lòng nhập Quận/Huyện!' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="Ví dụ: Thành phố Đà Lạt" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ chi tiết cơ sở / vùng trồng *"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ vùng canh tác!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Ví dụ: Thôn 2, Xã Xuân Thọ, TP. Đà Lạt" size="large" />
          </Form.Item>

          {/* PHẦN 2: THÔNG TIN NGƯỜI ĐẠI DIỆN & TÀI KHOẢN QUẢN TRỊ */}
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#15803d',
            borderBottom: '1.5px solid #e2e8f0',
            paddingBottom: 6,
            marginTop: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <UserOutlined /> 2. ĐẠI DIỆN PHÁP LÝ & TÀI KHOẢN QUẢN TRỊ
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên người đại diện pháp lý *"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên người đại diện!' },
                  { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ tên không được chứa số hoặc ký tự đặc biệt!' },
                  { min: 2, message: 'Họ tên quá ngắn!' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn Quản" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại liên hệ *"
                normalize={(value) => value ? value.trim().replace(/\s+/g, '') : ''}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^0\d{9}$/, message: 'Số điện thoại gồm đúng 10 chữ số bắt đầu bằng số 0!' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" size="large" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email đăng nhập & nhận thông báo *"
            normalize={(value) => value ? value.trim().toLowerCase() : ''}
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Email không đúng định dạng (ví dụ: contact@dalatgap.com)!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="contact@dalatgap.com" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Mật khẩu quản trị *"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.reject(new Error('Vui lòng nhập mật khẩu!'));
                      if (value.length < 8) return Promise.reject(new Error('Mật khẩu tối thiểu 8 ký tự!'));
                      if (!/[A-Z]/.test(value)) return Promise.reject(new Error('Cần ít nhất 1 chữ in hoa (A-Z)!'));
                      if (!/[a-z]/.test(value)) return Promise.reject(new Error('Cần ít nhất 1 chữ thường (a-z)!'));
                      if (!/[0-9]/.test(value)) return Promise.reject(new Error('Cần ít nhất 1 chữ số (0-9)!'));
                      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) {
                        return Promise.reject(new Error('Cần ít nhất 1 ký tự đặc biệt (!@#$%...)!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự an toàn" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="confirm"
                label="Xác nhận mật khẩu *"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
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
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                height: 48,
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 14px rgba(22, 101, 52, 0.3)'
              }}
            >
              🌾 Nộp Hồ Sơ Đăng Ký Hợp Tác Xã
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: '#64748b' }}>
          Đã có tài khoản Đối tác?{' '}
          <Link to="/login" style={{ color: '#16a34a', fontWeight: 700 }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>

      {/* Modal Thông báo Nộp hồ sơ thành công */}
      <Modal
        open={successModalVisible}
        onOk={() => {
          setSuccessModalVisible(false);
          navigate('/login');
        }}
        onCancel={() => {
          setSuccessModalVisible(false);
          navigate('/login');
        }}
        okText="Về Trang Đăng Nhập"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a', marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            Hồ Sơ Đã Được Tiếp Nhận!
          </h3>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
            Hồ sơ đăng ký đối tác Hợp tác xã <strong>"{registeredName}"</strong> đã được chuyển đến <strong>Ban Quản Trị ECC AGRI-CHAIN</strong>.
          </p>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
            textAlign: 'left',
            fontSize: 13,
            color: '#64748b'
          }}>
            <div>⏱️ <strong>Thời gian thẩm định:</strong> Thông thường trong vòng 24 giờ làm việc.</div>
            <div style={{ marginTop: 4 }}>📧 <strong>Thông báo:</strong> Kết quả phê duyệt sẽ được gửi qua Email đăng ký. Sau khi được duyệt, quý đối tác có thể đăng nhập để bắt đầu khai báo nông sản và lô thu hoạch.</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
