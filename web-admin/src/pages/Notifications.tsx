import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

export const Notifications = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/Users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Giả sử API trả về mảng user
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      
      const payload = {
        userId: values.userId === 'ALL' ? null : values.userId,
        title: values.title,
        message: values.message,
        type: values.type,
        referenceId: 'ADMIN'
      };

      await axios.post('http://localhost:5000/api/Notifications/admin/send', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Gửi thông báo thành công!');
      form.resetFields();
    } catch (error: any) {
      console.error('Lỗi khi gửi thông báo:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={<Title level={3} style={{ margin: 0 }}>Gửi Thông Báo Hệ Thống</Title>} 
      bordered={false} 
      style={{ minHeight: '80vh' }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: 'System', userId: 'ALL' }}
        >
          <Form.Item
            name="userId"
            label="Người nhận"
            rules={[{ required: true, message: 'Vui lòng chọn người nhận!' }]}
          >
            <Select 
              placeholder="Chọn người nhận" 
              loading={fetchingUsers}
              showSearch
              optionFilterProp="children"
            >
              <Option value="ALL" style={{ fontWeight: 'bold', color: '#1890ff' }}>
                -- Gửi cho tất cả mọi người (Toàn hệ thống) --
              </Option>
              {users.map(u => (
                <Option key={u.userId} value={u.userId}>
                  {u.fullName} - {u.email} ({u.roleId === 1 ? 'ADMIN' : (u.roleId === 2 ? 'SUPPLIER' : 'CUSTOMER')})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại thông báo"
            rules={[{ required: true, message: 'Vui lòng chọn loại thông báo!' }]}
          >
            <Select>
              <Option value="System">Hệ thống</Option>
              <Option value="Promotion">Khuyến mãi / Ưu đãi</Option>
              <Option value="Event">Sự kiện</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề thông báo"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Ví dụ: Cập nhật hệ thống ngày 10/10" />
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
              Gửi Thông Báo
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};
