import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { userService } from '../services/api';

interface User {
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
  phone?: string;
  status?: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (error) {
      message.error('Không thể tải danh sách người dùng.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.fullName,
      email: user.email,
      role: user.roleId === 1 ? 'Admin' : (user.roleId === 2 ? 'Supplier' : 'Customer'),
      phone: user.phone,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await userService.delete(id);
          message.success('Xóa người dùng thành công.');
          fetchUsers();
        } catch (error) {
          message.error('Xóa người dùng thất bại.');
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        fullName: values.username,
        email: values.email,
        roleId: values.role === 'Admin' ? 1 : (values.role === 'Supplier' ? 2 : 3),
        phone: values.phone,
        status: values.status || 'Active'
      };

      if (editingUser) {
        await userService.update(editingUser.userId, { ...editingUser, ...payload });
        message.success('Cập nhật người dùng thành công.');
      } else {
        await userService.register({ 
          username: values.username, 
          password: '123456',
          email: values.email,
          role: values.role,
          phone: values.phone
        });
        message.success('Tạo người dùng mới thành công (Mật khẩu mặc định: 123456).');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error('Lưu người dùng thất bại.');
      }
    }
  };

  const getRoleTag = (roleId: number) => {
    switch (roleId) {
      case 1: return <Tag color="red">ADMIN</Tag>;
      case 2: return <Tag color="green">SUPPLIER</Tag>;
      case 3: return <Tag color="blue">CUSTOMER</Tag>;
      default: return <Tag>UNKNOWN</Tag>;
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: 'Họ tên / Tài khoản', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleId', 
      key: 'roleId',
      render: (roleId: number) => getRoleTag(roleId)
    },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color={text?.toLowerCase() === 'active' ? 'blue' : 'gray'}>{text || 'Active'}</Tag> },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.userId)}>Xóa</Button>
          {record.roleId === 2 && (
            <Button icon={<CheckCircleOutlined />} type="dashed" style={{ color: 'green', borderColor: 'green' }} onClick={() => message.success('Duyệt nhà cung cấp thành công')}>Duyệt</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title="Quản Lý Thành Viên & Nhà Cung Cấp" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            Thêm Người Dùng
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="userId" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Cập Nhật Người Dùng' : 'Thêm Người Dùng Mới'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="username" label="Họ tên / Tài khoản" rules={[{ required: true, message: 'Nhập tên tài khoản' }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <div style={{ color: 'gray', marginBottom: 15 }}>
              * Mật khẩu mặc định sẽ là <strong>123456</strong>
            </div>
          )}
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value="Admin">Admin (Quản trị)</Select.Option>
              <Select.Option value="Supplier">Supplier (Nhà cung cấp/HTX)</Select.Option>
              <Select.Option value="Customer">Customer (Khách hàng)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Trạng thái tài khoản">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
