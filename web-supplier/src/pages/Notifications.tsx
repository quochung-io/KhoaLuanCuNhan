import { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const Notifications = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const supplierUser = JSON.parse(localStorage.getItem('supplier_user') || '{}');
      const supplierId = supplierUser.userId; // The supplier's user ID acts as supplierId in this DB schema.

      if (!supplierId) {
        message.error('Không tìm thấy thông tin nhà cung cấp.');
        setLoading(false);
        return;
      }
      
      const payload = {
        title: values.title,
        message: values.message,
        type: values.type,
      };

      const res = await axios.post(`http://localhost:5000/api/Notifications/supplier/${supplierId}/send`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success(res.data.message || 'Gửi thông báo thành công!');
      form.resetFields();
    } catch (error: any) {
      console.error('Lỗi khi gửi thông báo:', error);
      message.error(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi gửi thông báo. (Kiểm tra xem bạn đã có khách hàng nào mua sản phẩm chưa).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={<Title level={3} style={{ margin: 0 }}>Gửi Thông Báo Cho Khách Hàng</Title>} 
      bordered={false} 
      style={{ minHeight: '80vh' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
        <Paragraph type="secondary" style={{ marginBottom: 24, textAlign: 'center' }}>
          Bạn chỉ có thể gửi thông báo tới những khách hàng đã từng mua sản phẩm của bạn.
          Hệ thống sẽ tự động lọc danh sách khách hàng này và gửi đồng loạt.
        </Paragraph>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: 'Supplier' }}
        >
          <Form.Item
            name="type"
            label="Loại thông báo"
            rules={[{ required: true, message: 'Vui lòng chọn loại thông báo!' }]}
          >
            <Select>
              <Option value="Supplier">Tin tức nhà cung cấp</Option>
              <Option value="Update">Cập nhật sản phẩm/lô hàng</Option>
              <Option value="Promotion">Khuyến mãi / Ưu đãi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Ví dụ: Lành Farm vừa có mẻ rau sạch mới" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập nội dung chi tiết..." />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SendOutlined />} 
              loading={loading}
              block
              size="large"
            >
              Gửi Thông Báo Đồng Loạt
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};
