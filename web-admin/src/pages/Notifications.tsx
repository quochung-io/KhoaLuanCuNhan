import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Row, Col, Tag, Space, Divider } from 'antd';
import { SendOutlined, BellOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../config/axiosClient';
import { userService } from '../services/api';

const { Option } = Select;

export const Notifications: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // States xem trước thời gian thực (Live Preview)
  const [previewTitle, setPreviewTitle] = useState('Thông báo quan trọng từ Ban Quản Trị');
  const [previewMessage, setPreviewMessage] = useState('Nội dung chi tiết thông báo sẽ hiển thị tại đây khi quản trị viên soạn thảo...');
  const [previewType, setPreviewType] = useState('System');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await userService.getAll();
      const rawData = response.data;
      if (Array.isArray(rawData)) {
        setUsers(rawData);
      } else if (rawData && Array.isArray(rawData.data)) {
        setUsers(rawData.data);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách user:', error);
      message.error('Không thể lấy danh sách người dùng để gửi thông báo.');
    } finally {
      setFetchingUsers(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        userId: values.userId === 'ALL' ? null : values.userId,
        title: values.title,
        message: values.message,
        type: values.type,
        referenceId: 'ADMIN'
      };

      await axiosClient.post('/Notifications/admin/send', payload);
      
      message.success('Gửi thông báo thành công tới người dùng!');
      form.resetFields();
      setPreviewTitle('Thông báo quan trọng từ Ban Quản Trị');
      setPreviewMessage('Nội dung chi tiết thông báo sẽ hiển thị tại đây khi quản trị viên soạn thảo...');
      setPreviewType('System');
    } catch (error: any) {
      console.error('Lỗi khi gửi thông báo:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card 
        style={{ borderRadius: 14 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <BellOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Trung Tâm Phát Sóng Thông Báo Hệ Thống</span>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Gửi thông báo đẩy (Push Notifications) thời gian thực tới App & Web khách hàng / HTX</div>
            </div>
          </div>
        }
      >
        <Row gutter={[24, 24]}>
          {/* CỘT TRÁI: FORM SOẠN THẢO THÔNG BÁO */}
          <Col xs={24} lg={14}>
            <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SendOutlined style={{ color: '#16a34a' }} />
                <span>Soạn Thảo Thông Điệp Phát Sóng</span>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ type: 'System', userId: 'ALL' }}
                onValuesChange={(_, all) => {
                  if (all.title) setPreviewTitle(all.title);
                  if (all.message) setPreviewMessage(all.message);
                  if (all.type) setPreviewType(all.type);
                }}
              >
                <Form.Item
                  name="userId"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Đối Tượng Nhận Tin</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận tin!' }]}
                >
                  <Select 
                    placeholder="Chọn đối tượng nhận tin" 
                    loading={fetchingUsers}
                    showSearch
                    optionFilterProp="children"
                    style={{ borderRadius: 8 }}
                  >
                    <Option value="ALL" style={{ fontWeight: 'bold', color: '#16a34a' }}>
                      📢 -- Gửi Toàn Hệ Thống (Tất cả Khách Hàng & Đối Tác HTX) --
                    </Option>
                    {users.map(u => (
                      <Option key={u.userId} value={u.userId}>
                        {u.fullName || 'Khách hàng'} - {u.email || u.phone} ({u.roleId === 1 ? 'ADMIN' : (u.roleId === 2 ? 'SUPPLIER HTX' : 'CUSTOMER')})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="type"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Chủ Đề Thông Báo</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
                >
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="System">⚙️ Hệ Thống & Bảo Trì</Option>
                    <Option value="Promotion">🎁 Khuyến Mãi / Voucher Nông Sản</Option>
                    <Option value="Order">📦 Cập Nhật Vận Hành Đơn Hàng</Option>
                    <Option value="Event">🌱 Sự Kiện & Hội Chợ Nông Sản</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="title"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Tiêu Đề Thông Báo</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề thông báo!' }]}
                >
                  <Input placeholder="Ví dụ: Ưu đãi giải cứu nông sản Mộc Châu cuối tuần..." style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item
                  name="message"
                  label={<span style={{ fontWeight: 600, color: '#334155' }}>Nội Dung Chi Tiết</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo!' }]}
                >
                  <Input.TextArea rows={5} placeholder="Nhập nội dung đầy đủ gửi đến hộp thư người dùng..." style={{ borderRadius: 8 }} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SendOutlined />} 
                    loading={loading}
                    block
                    size="large"
                    style={{ fontWeight: 700, borderRadius: 8, height: 44 }}
                  >
                    Phát Sóng Thông Báo Ngay
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>

          {/* CỘT PHẢI: MÔ PHỎNG XEM TRƯỚC (LIVE PREVIEW) */}
          <Col xs={24} lg={10}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <EyeOutlined style={{ color: '#0284c7' }} />
                <span>Mô Phỏng Hiển Thị Trên Điện Thoại Khách (Preview)</span>
              </div>

              {/* KHUNG THÔNG BÁO MOCKUP */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: 14, 
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space size="small">
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: '#16a34a', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🌱
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>ECC Eco-Farm</span>
                  </Space>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Vừa xong</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
                  {previewTitle}
                </div>

                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {previewMessage}
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={previewType === 'Promotion' ? 'gold' : previewType === 'Event' ? 'green' : 'blue'} style={{ borderRadius: 999 }}>
                    {previewType === 'Promotion' ? '🎁 Khuyến Mãi' : previewType === 'Event' ? '🌱 Sự Kiện' : '⚙️ Hệ Thống'}
                  </Tag>
                  <span style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 600 }}>Xem chi tiết &gt;</span>
                </div>
              </div>

              <Divider style={{ margin: '20px 0' }} />

              {/* HƯỚNG DẪN QUẢN TRỊ */}
              <div style={{ background: '#f0fdf4', padding: '14px 16px', borderRadius: 10, border: '1px solid #bbf7d0', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  <CheckCircleOutlined />
                  <span>Quy Chuẩn Truyền Thông Ban Quản Trị:</span>
                </div>
                <div style={{ fontSize: 12, color: '#15803d', lineHeight: 1.6 }}>
                  • Thông báo toàn sàn sẽ xuất hiện tức thì trên chuông thông báo của ứng dụng di động & website.<br />
                  • Đối với tin xả hàng cận date, khuyến nghị chọn chủ đề Khuyến mãi để tăng tỷ lệ mở hộp thư.
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
