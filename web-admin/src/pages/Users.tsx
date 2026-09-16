import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Card, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
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

  const handleApproveSupplier = (user: User) => {
    Modal.confirm({
      title: 'Phê duyệt Nhà cung cấp / HTX',
      content: `Xác nhận phê duyệt và cấp quyền hoạt động cho nhà cung cấp '${user.fullName}'?`,
      okText: 'Xác nhận duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await userService.approveSupplier(user.userId);
          message.success(res.data?.message || 'Phê duyệt nhà cung cấp thành công!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Phê duyệt thất bại.');
        }
      }
    });
  };

  const handleToggleStatus = (user: User) => {
    const isActive = user.status?.toLowerCase() === 'active' || user.status?.toLowerCase() === 'hoạt động';
    Modal.confirm({
      title: isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      content: `Bạn có chắc chắn muốn ${isActive ? 'KHÓA' : 'KÍCH HOẠT LẠI'} tài khoản '${user.fullName}'?`,
      okText: isActive ? 'Khóa tài khoản' : 'Kích hoạt',
      cancelText: 'Hủy',
      okType: isActive ? 'danger' : 'primary',
      onOk: async () => {
        try {
          const res = await userService.toggleStatus(user.userId);
          message.success(res.data?.message || 'Cập nhật trạng thái thành công!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại.');
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa tài khoản',
      content: 'Lưu ý an toàn: Nếu người dùng này đã có đơn hàng hoặc sản phẩm liên kết trong hệ thống, tài khoản sẽ được chuyển sang trạng thái Khóa (Soft Delete) để bảo vệ toàn vẹn dữ liệu.',
      okText: 'Xác nhận xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await userService.delete(id);
          if (res.data?.softDeleted) {
            message.info(res.data.message);
          } else {
            message.success(res.data?.message || 'Xóa người dùng thành công.');
          }
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Xóa người dùng thất bại.');
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
          password: values.password || '123456',
          email: values.email,
          role: values.role,
          phone: values.phone
        });
        message.success(`Tạo người dùng mới thành công (Mật khẩu: ${values.password || '123456'}).`);
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
    { title: 'ID', dataIndex: 'userId', key: 'userId', width: 70 },
    { title: 'Họ tên / Tài khoản', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleId', 
      key: 'roleId',
      render: (roleId: number) => getRoleTag(roleId)
    },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (text: string) => {
        const active = text?.toLowerCase() === 'active' || text?.toLowerCase() === 'hoạt động';
        return <Tag color={active ? 'green' : 'orange'}>{active ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</Tag>;
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: User) => {
        const isActive = record.status?.toLowerCase() === 'active' || record.status?.toLowerCase() === 'hoạt động';
        return (
          <Space size="small">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Sửa</Button>
            {record.roleId === 2 && !isActive && (
              <Button 
                size="small"
                icon={<CheckCircleOutlined />} 
                type="primary" 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                onClick={() => handleApproveSupplier(record)}
              >
                Duyệt HTX
              </Button>
            )}
            <Tooltip title={isActive ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}>
              <Button 
                size="small"
                icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />} 
                style={{ color: isActive ? '#faad14' : '#52c41a', borderColor: isActive ? '#faad14' : '#52c41a' }}
                onClick={() => handleToggleStatus(record)}
              >
                {isActive ? 'Khóa' : 'Mở'}
              </Button>
            </Tooltip>
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.userId)}>Xóa</Button>
          </Space>
        );
      }
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
            <Form.Item name="password" label="Mật khẩu khởi tạo" initialValue="123456" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
              <Input.Password placeholder="Mặc định: 123456" />
            </Form.Item>
          )}
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select placeholder="Chọn vai trò">
              <Select.Option value="Admin">Admin (Quản trị)</Select.Option>
              <Select.Option value="Supplier">Supplier (Nhà cung cấp/HTX)</Select.Option>
              <Select.Option value="Customer">Customer (Khách hàng)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="phone" 
            label="Số điện thoại"
            rules={[{ pattern: /^0\d{9}$/, message: 'Số điện thoại Việt Nam hợp lệ gồm 10 chữ số bắt đầu bằng số 0!' }]}
          >
            <Input placeholder="09xxxxxxxx" maxLength={10} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Trạng thái tài khoản">
              <Select.Option value="Active">Active (Hoạt động)</Select.Option>
              <Select.Option value="Inactive">Inactive (Khóa)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
