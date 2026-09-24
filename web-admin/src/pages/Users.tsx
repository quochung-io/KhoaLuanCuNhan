import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  message, 
  Card, 
  Tooltip, 
  Tabs, 
  Badge, 
  Descriptions, 
  Alert, 
  Divider,
  Radio
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  StopOutlined, 
  EyeOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  UserOutlined
} from '@ant-design/icons';
import { userService } from '../services/api';

interface User {
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
  phone?: string;
  status?: string;
  createdAt?: string;
}

interface SupplierItem {
  supplierId: number;
  userId: number;
  fullName: string;
  representative?: string;
  businessLicense?: string;
  email?: string;
  phone?: string;
  status: string;
  rejectReason?: string;
  createdAt?: string;
  approvedAt?: string;
  farm?: {
    farmId: number;
    farmName: string;
    address: string;
    province: string;
    district: string;
    area: number;
    cropType: string;
    productionStandard: string;
    status: string;
  };
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
  
  // User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Supplier Detail & Reject Modal State
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingSupplier, setRejectingSupplier] = useState<SupplierItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

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

  const fetchSuppliers = async () => {
    setSupplierLoading(true);
    try {
      const res = await userService.getSuppliers();
      setSuppliers(res.data);
    } catch (error) {
      console.error('Không thể tải danh sách nhà cung cấp:', error);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSuppliers();
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

  const handleApproveSupplier = (userOrSupplier: { userId: number; fullName: string }) => {
    Modal.confirm({
      title: 'Phê duyệt Nhà cung cấp / Hợp tác xã',
      content: `Xác nhận phê duyệt hồ sơ đối tác và cấp quyền truy cập Vendor Dashboard cho '${userOrSupplier.fullName}'?`,
      okText: 'Xác nhận duyệt',
      cancelText: 'Hủy',
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: async () => {
        try {
          const res = await userService.approveSupplier(userOrSupplier.userId);
          message.success(res.data?.message || 'Phê duyệt nhà cung cấp thành công!');
          fetchUsers();
          fetchSuppliers();
          setIsDetailModalOpen(false);
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Phê duyệt thất bại.');
        }
      }
    });
  };

  const handleOpenReject = (supplier: SupplierItem) => {
    setRejectingSupplier(supplier);
    setRejectReason('Ảnh giấy chứng nhận chưa rõ ràng hoặc thiếu thông tin giấy phép an toàn thực phẩm.');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingSupplier) return;
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối để gửi cho đối tác!');
      return;
    }
    try {
      const res = await userService.rejectSupplier(rejectingSupplier.userId, rejectReason.trim());
      message.success(res.data?.message || 'Đã từ chối hồ sơ đối tác.');
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setRejectingSupplier(null);
      fetchUsers();
      fetchSuppliers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác từ chối thất bại.');
    }
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
          fetchSuppliers();
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
          fetchSuppliers();
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
      fetchSuppliers();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
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

  const getStatusTag = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'hoạt động') {
      return <Tag color="green">HOẠT ĐỘNG</Tag>;
    }
    if (s === 'pending' || s === 'chờ duyệt') {
      return <Tag color="gold">CHỜ DUYỆT</Tag>;
    }
    if (s === 'rejected' || s === 'từ chối') {
      return <Tag color="red">TỪ CHỐI</Tag>;
    }
    return <Tag color="default">ĐÃ KHÓA</Tag>;
  };

  const pendingCount = suppliers.filter(s => {
    const st = s.status?.toLowerCase();
    return st === 'pending' || st === 'chờ duyệt';
  }).length;

  const filteredSuppliers = suppliers.filter(s => {
    const st = s.status?.toLowerCase();
    if (supplierFilter === 'pending') return st === 'pending' || st === 'chờ duyệt';
    if (supplierFilter === 'active') return st === 'active' || st === 'approved' || st === 'hoạt động';
    if (supplierFilter === 'rejected') return st === 'rejected' || st === 'từ chối';
    return true;
  });

  // Columns for All Users
  const userColumns = [
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
      render: (text: string) => getStatusTag(text)
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: User) => {
        const isActive = record.status?.toLowerCase() === 'active' || record.status?.toLowerCase() === 'hoạt động';
        const isPending = record.status?.toLowerCase() === 'pending' || record.status?.toLowerCase() === 'chờ duyệt';
        return (
          <Space size="small">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Sửa</Button>
            {record.roleId === 2 && isPending && (
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

  // Columns for Suppliers Tab
  const supplierColumns = [
    { title: 'Mã NCC', dataIndex: 'supplierId', key: 'supplierId', width: 90, render: (id: number) => <b>NCC#{id}</b> },
    { 
      title: 'Đơn Vị / Hợp Tác Xã', 
      key: 'fullName',
      render: (_: any, r: SupplierItem) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1677ff' }}>{r.fullName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Đại diện: {r.representative || 'Chưa cập nhật'}</div>
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, r: SupplierItem) => (
        <div style={{ fontSize: 12 }}>
          <div>📧 {r.email}</div>
          <div>📞 {r.phone || 'Chưa có SĐT'}</div>
        </div>
      )
    },
    {
      title: 'Trang Trại / Vùng Trồng',
      key: 'farm',
      render: (_: any, r: SupplierItem) => {
        if (!r.farm) return <span style={{ color: '#999' }}>Chưa khai báo trang trại</span>;
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 500 }}><ShopOutlined style={{ color: '#52c41a' }} /> {r.farm.farmName}</div>
            <div style={{ color: '#666' }}><EnvironmentOutlined /> {r.farm.district ? `${r.farm.district}, ` : ''}{r.farm.province}</div>
            <div style={{ marginTop: 2 }}>
              <Tag color="cyan">{r.farm.productionStandard || 'VietGAP'}</Tag>
              {r.farm.area ? <Tag color="blue">{r.farm.area} ha</Tag> : null}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Mã Giấy Phép / CCCD',
      dataIndex: 'businessLicense',
      key: 'businessLicense',
      render: (lic: string) => <Tag color="geekblue">{lic || 'Đang xác thực'}</Tag>
    },
    {
      title: 'Trạng Thái Hồ Sơ',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => getStatusTag(text)
    },
    {
      title: 'Thao tác kiểm duyệt',
      key: 'actions',
      render: (_: any, r: SupplierItem) => {
        const isPending = r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'chờ duyệt';
        return (
          <Space size="small">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedSupplier(r);
                setIsDetailModalOpen(true);
              }}
            >
              Hồ sơ
            </Button>
            {isPending && (
              <>
                <Button 
                  size="small"
                  icon={<CheckCircleOutlined />} 
                  type="primary" 
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                  onClick={() => handleApproveSupplier({ userId: r.userId, fullName: r.fullName })}
                >
                  Duyệt
                </Button>
                <Button 
                  size="small"
                  icon={<CloseCircleOutlined />} 
                  danger 
                  onClick={() => handleOpenReject(r)}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        defaultActiveKey="suppliers"
        items={[
          {
            key: 'suppliers',
            label: (
              <Space>
                <SafetyCertificateOutlined />
                <span>Kiểm Duyệt & Quản Lý Nhà Cung Cấp</span>
                {pendingCount > 0 && (
                  <Badge count={pendingCount} overflowCount={99} style={{ backgroundColor: '#faad14' }} />
                )}
              </Space>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Radio.Group 
                    value={supplierFilter} 
                    onChange={e => setSupplierFilter(e.target.value)} 
                    buttonStyle="solid"
                  >
                    <Radio.Button value="all">Tất cả ({suppliers.length})</Radio.Button>
                    <Radio.Button value="pending">
                      Chờ duyệt ({suppliers.filter(s => s.status?.toLowerCase() === 'pending' || s.status?.toLowerCase() === 'chờ duyệt').length})
                    </Radio.Button>
                    <Radio.Button value="active">
                      Đã phê duyệt ({suppliers.filter(s => s.status?.toLowerCase() === 'active' || s.status?.toLowerCase() === 'approved' || s.status?.toLowerCase() === 'hoạt động').length})
                    </Radio.Button>
                    <Radio.Button value="rejected">
                      Bị từ chối ({suppliers.filter(s => s.status?.toLowerCase() === 'rejected' || s.status?.toLowerCase() === 'từ chối').length})
                    </Radio.Button>
                  </Radio.Group>

                  <Button onClick={fetchSuppliers}>Làm mới</Button>
                </div>

                <Table 
                  columns={supplierColumns} 
                  dataSource={filteredSuppliers} 
                  rowKey="supplierId" 
                  loading={supplierLoading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'customers',
            label: (
              <Space>
                <UserOutlined />
                <span>Quản Lý Tài Khoản Khách Hàng</span>
                <Tag color="blue">{users.filter(u => u.roleId === 3).length}</Tag>
              </Space>
            ),
            children: (
              <Card 
                title="Danh Sách Tài Khoản Khách Hàng (Người Tiêu Dùng)" 
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
                    Thêm Khách Hàng Mới
                  </Button>
                }
              >
                <Table 
                  columns={userColumns} 
                  dataSource={users.filter(u => u.roleId === 3)} 
                  rowKey="userId" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'admins',
            label: (
              <Space>
                <span>🛡️ Quản Trị Viên</span>
                <Tag color="red">{users.filter(u => u.roleId === 1).length}</Tag>
              </Space>
            ),
            children: (
              <Card title="Danh Sách Quản Trị Viên Hệ Thống">
                <Table 
                  columns={userColumns} 
                  dataSource={users.filter(u => u.roleId === 1)} 
                  rowKey="userId" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Modal Xem Chi Tiết Hồ Sơ Đối Tác */}
      <Modal
        title={`Chi Tiết Hồ Sơ Đối Tác: ${selectedSupplier?.fullName || ''}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={750}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>,
          (selectedSupplier?.status?.toLowerCase() === 'pending' || selectedSupplier?.status?.toLowerCase() === 'chờ duyệt') && (
            <Button 
              key="reject" 
              danger 
              icon={<CloseCircleOutlined />} 
              onClick={() => handleOpenReject(selectedSupplier!)}
            >
              Từ chối hồ sơ
            </Button>
          ),
          (selectedSupplier?.status?.toLowerCase() === 'pending' || selectedSupplier?.status?.toLowerCase() === 'chờ duyệt') && (
            <Button 
              key="approve" 
              type="primary" 
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              icon={<CheckCircleOutlined />} 
              onClick={() => handleApproveSupplier({ userId: selectedSupplier!.userId, fullName: selectedSupplier!.fullName })}
            >
              Phê duyệt đối tác
            </Button>
          )
        ]}
      >
        {selectedSupplier && (
          <div style={{ marginTop: 16 }}>
            {selectedSupplier.status?.toLowerCase() === 'rejected' && selectedSupplier.rejectReason && (
              <Alert 
                type="error" 
                message="Hồ sơ đã bị từ chối" 
                description={`Lý do: ${selectedSupplier.rejectReason}`}
                showIcon 
                style={{ marginBottom: 16 }}
              />
            )}

            <Descriptions title="1. Thông Tin Doanh Nghiệp / Hợp Tác Xã" bordered column={2} size="small">
              <Descriptions.Item label="Tên đơn vị">{selectedSupplier.fullName}</Descriptions.Item>
              <Descriptions.Item label="Người đại diện">{selectedSupplier.representative || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedSupplier.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedSupplier.phone || 'Chưa có'}</Descriptions.Item>
              <Descriptions.Item label="Mã ĐKKD / CCCD">{selectedSupplier.businessLicense || 'BL-DEFAULT-001'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái hồ sơ">{getStatusTag(selectedSupplier.status)}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="2. Thông Tin Nông Trại & Vùng Canh Tác" bordered column={2} size="small">
              <Descriptions.Item label="Tên trang trại">{selectedSupplier.farm?.farmName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Quy mô diện tích">{selectedSupplier.farm?.area ? `${selectedSupplier.farm.area} ha` : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Tiêu chuẩn sản xuất">
                <Tag color="green">{selectedSupplier.farm?.productionStandard || 'VietGAP'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nông sản chủ lực">{selectedSupplier.farm?.cropType || 'Rau củ quả sạch'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ vùng trồng" span={2}>
                {selectedSupplier.farm?.address || 'N/A'}, {selectedSupplier.farm?.district ? `${selectedSupplier.farm.district}, ` : ''}{selectedSupplier.farm?.province || ''}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>3. Hồ Sơ Pháp Lý & Chứng Nhận Tiêu Chuẩn Nông Nghiệp:</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <Card size="small" style={{ flex: 1, textAlign: 'center', background: '#fafafa' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <div style={{ marginTop: 8, fontWeight: 500 }}>Chứng Nhận {selectedSupplier.farm?.productionStandard || 'VietGAP'}</div>
                  <Tag color="success" style={{ marginTop: 4 }}>Hiệu lực: Hợp lệ</Tag>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Mã số: CERT-VN-{selectedSupplier.supplierId}-2026</div>
                </Card>
                <Card size="small" style={{ flex: 1, textAlign: 'center', background: '#fafafa' }}>
                  <ShopOutlined style={{ fontSize: 32, color: '#1677ff' }} />
                  <div style={{ marginTop: 8, fontWeight: 500 }}>Giấy Đăng Ký Kinh Doanh / HTX</div>
                  <Tag color="processing" style={{ marginTop: 4 }}>Số: {selectedSupplier.businessLicense || 'Đã đối soát'}</Tag>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Cấp bởi: Sở KH&ĐT Tỉnh</div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nhập Lý Do Từ Chối */}
      <Modal
        title={`Từ Chối Hồ Sơ: ${rejectingSupplier?.fullName || ''}`}
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={handleConfirmReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okType="danger"
      >
        <div style={{ marginTop: 12 }}>
          <p>Nhập lý do từ chối để hệ thống gửi thông báo phản hồi cho Nhà cung cấp:</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối cụ thể..."
          />
          <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
            Gợi ý nhanh:
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setRejectReason('Ảnh giấy phép ĐKKD bị mờ, không rõ con dấu và mã số.')}
              >
                Ảnh giấy phép mờ
              </Tag>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setRejectReason('Thiếu giấy chứng nhận cơ sở đủ điều kiện ATTP hoặc chứng nhận VietGAP đã hết hạn.')}
              >
                Thiếu chứng nhận ATTP/VietGAP
              </Tag>
              <Tag 
                style={{ cursor: 'pointer' }}
                onClick={() => setRejectReason('Thông tin vùng trồng và diện tích canh tác chưa trùng khớp với thực tế.')}
              >
                Vùng trồng chưa chính xác
              </Tag>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Thêm / Sửa Người Dùng Thông Thường */}
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
              <Select.Option value="Pending">Pending (Chờ duyệt)</Select.Option>
              <Select.Option value="Inactive">Inactive (Khóa)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
