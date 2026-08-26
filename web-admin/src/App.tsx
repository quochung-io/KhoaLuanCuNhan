import React, { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Breadcrumb, 
  Card, 
  Col, 
  Row, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Badge, 
  Avatar,
  Form,
  Input,
  Select,
  message
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  OrderedListOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LogoutOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

// === MOCK DATA FOR ADMIN ===
const mockUsers = [
  { key: '1', name: 'Bùi Quốc Hưng', email: 'quochung.io@gmail.com', role: 'Customer', status: 'Active' },
  { key: '2', name: 'Hợp tác xã Đà Lạt Xanh', email: 'dalatxanh@supplier.com', role: 'Supplier', status: 'Active' },
  { key: '3', name: 'Nông trại Mộc Châu Organic', email: 'mocchau@supplier.com', role: 'Supplier', status: 'Active' },
  { key: '4', name: 'Nguyễn Văn A', email: 'admin@ecc.com', role: 'Admin', status: 'Active' },
  { key: '5', name: 'Trần Thị B', email: 'spammer@gmail.com', role: 'Customer', status: 'Blocked' },
];

const mockProducts = [
  { key: '1', name: 'Cải bó xôi hữu cơ', category: 'Rau xanh', supplier: 'Hợp tác xã Đà Lạt Xanh', price: '28.000₫', status: 'Approved' },
  { key: '2', name: 'Cà rốt baby Đà Lạt', category: 'Củ quả', supplier: 'Hợp tác xã Đà Lạt Xanh', price: '32.000₫', status: 'Approved' },
  { key: '3', name: 'Dâu tây thủy canh', category: 'Trái cây', supplier: 'Nông trại Mộc Châu Organic', price: '68.000₫', status: 'Pending' },
  { key: '4', name: 'Mật ong rừng Mộc Châu', category: 'Chế biến', supplier: 'Nông trại Mộc Châu Organic', price: '135.000₫', status: 'Approved' },
  { key: '5', name: 'Nấm đùi gà hữu cơ', category: 'Rau xanh', supplier: 'Hợp tác xã Đà Lạt Xanh', price: '45.000₫', status: 'Pending' },
];

const mockLots = [
  { key: '1', lotCode: 'LOT#VN-DL-0842', productName: 'Cải bó xôi hữu cơ', supplier: 'Hợp tác xã Đà Lạt Xanh', harvestDate: '21/07/2026', expiryDate: '30/08/2026', qty: 250, status: 'Cận hạn' },
  { key: '2', lotCode: 'LOT#VN-DL-0917', productName: 'Cà rốt baby Đà Lạt', supplier: 'Hợp tác xã Đà Lạt Xanh', harvestDate: '20/07/2026', expiryDate: '15/09/2026', qty: 500, status: 'An toàn' },
  { key: '3', lotCode: 'LOT#VN-MC-0255', productName: 'Mật ong rừng nguyên chất', supplier: 'Nông trại Mộc Châu Organic', harvestDate: '10/05/2026', expiryDate: '10/05/2028', qty: 120, status: 'An toàn' },
  { key: '4', lotCode: 'LOT#VN-DL-0721', productName: 'Xà lách xoăn thủy canh', supplier: 'Hợp tác xã Đà Lạt Xanh', harvestDate: '24/07/2026', expiryDate: '01/09/2026', qty: 15, status: 'Sắp hết hạn' },
];

const mockOrders = [
  { key: '1', orderId: 'ORD-98421', customer: 'Bùi Quốc Hưng', date: '25/08/2026', amount: '189.000₫', status: 'Processing' },
  { key: '2', orderId: 'ORD-98420', customer: 'Lê Văn C', date: '24/08/2026', amount: '80.000₫', status: 'Completed' },
  { key: '3', orderId: 'ORD-98419', customer: 'Nguyễn Thị D', date: '23/08/2026', amount: '350.000₫', status: 'Shipped' },
];

function App() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [users, setUsers] = useState(mockUsers);
  const [products, setProducts] = useState(mockProducts);
  const [orders, setOrders] = useState(mockOrders);
  
  // States for Add Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // User Actions
  const handleToggleUserStatus = (key: string) => {
    setUsers(prev => prev.map(user => {
      if (user.key === key) {
        const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
        message.success(`Đã cập nhật trạng thái của ${user.name} thành ${newStatus}`);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // Product Actions
  const handleApproveProduct = (key: string) => {
    setProducts(prev => prev.map(p => {
      if (p.key === key) {
        message.success(`Đã duyệt nông sản: ${p.name}`);
        return { ...p, status: 'Approved' };
      }
      return p;
    }));
  };

  const handleRejectProduct = (key: string) => {
    setProducts(prev => prev.map(p => {
      if (p.key === key) {
        message.warning(`Đã dừng kinh doanh / từ chối: ${p.name}`);
        return { ...p, status: 'Rejected' };
      }
      return p;
    }));
  };

  // Order Actions
  const handleUpdateOrderStatus = (key: string, newStatus: string) => {
    setOrders(prev => prev.map(o => {
      if (o.key === key) {
        message.success(`Đơn hàng ${o.orderId} chuyển sang: ${newStatus}`);
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  // Add Product Flow
  const handleAddProduct = (values: any) => {
    const newProduct = {
      key: String(products.length + 1),
      name: values.name,
      category: values.category,
      supplier: 'Hệ thống tự thêm',
      price: Number(values.price).toLocaleString('vi-VN') + '₫',
      status: 'Approved'
    };
    setProducts([...products, newProduct]);
    message.success('Đã thêm nông sản mới thành công!');
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Left Navigation */}
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
        <div className="logo-section" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001529', borderBottom: '1px solid #ffffff10' }}>
          <span style={{ color: '#2E7D32', fontSize: 20, fontWeight: 'bold', letterSpacing: 1.2 }}>LÀNH ADMIN</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentMenu]}
          onClick={({ key }) => setCurrentMenu(key)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
            { key: 'products', icon: <ShoppingOutlined />, label: 'Duyệt nông sản' },
            { key: 'lots', icon: <BarcodeOutlined />, label: 'Kiểm soát lô hàng' },
            { key: 'orders', icon: <OrderedListOutlined />, label: 'Quản lý đơn hàng' },
          ]}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
          <Button type="text" danger icon={<LogoutOutlined />} style={{ width: '100%', color: '#ff4d4f' }}>
            Đăng xuất
          </Button>
        </div>
      </Sider>

      {/* Main Layout Area */}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Breadcrumb style={{ margin: 0 }}>
            <Breadcrumb.Item>Hệ thống ECC</Breadcrumb.Item>
            <Breadcrumb.Item>
              {currentMenu === 'dashboard' && 'Dashboard'}
              {currentMenu === 'users' && 'Người dùng'}
              {currentMenu === 'products' && 'Nông sản'}
              {currentMenu === 'lots' && 'Kiểm soát Lô hàng (FEFO)'}
              {currentMenu === 'orders' && 'Đơn hàng'}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge dot status="processing">
              <AlertOutlined style={{ fontSize: 16 }} />
            </Badge>
            <Avatar style={{ backgroundColor: '#2E7D32' }} icon={<UserOutlined />} />
            <span style={{ fontWeight: 'bold' }}>Quản trị viên</span>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360, borderRadius: 12 }}>
            
            {/* 1. VIEW: DASHBOARD */}
            {currentMenu === 'dashboard' && (
              <div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#F4F9F4', borderLeft: '4px solid #2E7D32' }}>
                      <Statistic title="Tổng doanh thu tuần" value={45280000} suffix="₫" valueStyle={{ color: '#2E7D32', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#FFFDF9', borderLeft: '4px solid #FF9800' }}>
                      <Statistic title="Nhà cung cấp hoạt động" value={18} valueStyle={{ color: '#FF9800', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#FFF9F9', borderLeft: '4px solid #FF4D4F' }}>
                      <Statistic title="Cảnh báo lô cận hạn" value={2} prefix={<AlertOutlined />} valueStyle={{ color: '#FF4D4F', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#F5F9FC', borderLeft: '4px solid #1890FF' }}>
                      <Statistic title="Độ chính xác AI gợi ý" value={92.4} suffix="%" valueStyle={{ color: '#1890FF', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                </Row>

                <h3 style={{ margin: '24px 0 16px' }}>Cảnh báo tồn kho cận hạn (Chuẩn FEFO)</h3>
                <Table 
                  dataSource={mockLots.filter(l => l.status !== 'An toàn')} 
                  columns={[
                    { title: 'Mã lô', dataIndex: 'lotCode', key: 'lotCode' },
                    { title: 'Nông sản', dataIndex: 'productName', key: 'productName' },
                    { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier' },
                    { title: 'Hạn dùng', dataIndex: 'expiryDate', key: 'expiryDate' },
                    { title: 'Tồn kho', dataIndex: 'qty', key: 'qty', render: (q) => `${q} kg` },
                    { title: 'Mức độ', dataIndex: 'status', key: 'status', render: (st) => <Tag color={st === 'Sắp hết hạn' ? 'red' : 'orange'}>{st}</Tag> },
                  ]}
                  pagination={false}
                />
              </div>
            )}

            {/* 2. VIEW: USERS MANAGEMENT */}
            {currentMenu === 'users' && (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <h3>Danh sách tài khoản hệ thống</h3>
                </div>
                <Table 
                  dataSource={users} 
                  columns={[
                    { title: 'Họ tên', dataIndex: 'name', key: 'name', render: (t) => <b>{t}</b> },
                    { title: 'Email', dataIndex: 'email', key: 'email' },
                    { title: 'Loại tài khoản', dataIndex: 'role', key: 'role', render: (r) => <Tag color={r === 'Admin' ? 'blue' : (r === 'Supplier' ? 'purple' : 'cyan')}>{r}</Tag> },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (st) => <Tag color={st === 'Active' ? 'green' : 'red'}>{st}</Tag> },
                    { 
                      title: 'Thao tác', 
                      key: 'actions', 
                      render: (_, record) => (
                        record.role !== 'Admin' ? (
                          <Button 
                            danger={record.status === 'Active'} 
                            type="primary" 
                            size="small"
                            onClick={() => handleToggleUserStatus(record.key)}
                          >
                            {record.status === 'Active' ? 'Khóa tài khoản' : 'Kích hoạt'}
                          </Button>
                        ) : <span>Không thể khóa Admin</span>
                      )
                    },
                  ]}
                />
              </div>
            )}

            {/* 3. VIEW: PRODUCT APPROVAL */}
            {currentMenu === 'products' && (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Duyệt nông sản & Danh mục kinh doanh</h3>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#2E7D32' }} onClick={() => setIsModalOpen(true)}>
                    Thêm nông sản hệ thống
                  </Button>
                </div>
                <Table 
                  dataSource={products} 
                  columns={[
                    { title: 'Tên nông sản', dataIndex: 'name', key: 'name', render: (n) => <b>{n}</b> },
                    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
                    { title: 'Đăng tải bởi', dataIndex: 'supplier', key: 'supplier' },
                    { title: 'Đơn giá đề xuất', dataIndex: 'price', key: 'price' },
                    { title: 'Trạng thái duyệt', dataIndex: 'status', key: 'status', render: (st) => (
                      <Tag color={st === 'Approved' ? 'green' : (st === 'Pending' ? 'orange' : 'red')}>{st}</Tag>
                    ) },
                    { 
                      title: 'Hành động', 
                      key: 'actions', 
                      render: (_, record) => (
                        <Space>
                          {record.status === 'Pending' && (
                            <Button type="primary" size="small" style={{ backgroundColor: '#52c41a' }} onClick={() => handleApproveProduct(record.key)}>
                              Duyệt bán
                            </Button>
                          )}
                          {record.status !== 'Rejected' && (
                            <Button danger type="text" size="small" onClick={() => handleRejectProduct(record.key)}>
                              Dừng bán
                            </Button>
                          )}
                        </Space>
                      )
                    },
                  ]}
                />
              </div>
            )}

            {/* 4. VIEW: LOTS INSPECTION */}
            {currentMenu === 'lots' && (
              <div>
                <h3>Kiểm soát Lô hàng & Truy xuất nguồn gốc</h3>
                <p style={{ color: '#8D9E90', marginBottom: 16 }}>Dữ liệu lô hàng phục vụ thuật toán xuất kho FEFO (Ưu tiên bán lô cận hạn trước để giảm lãng phí).</p>
                <Table 
                  dataSource={mockLots} 
                  columns={[
                    { title: 'Mã lô', dataIndex: 'lotCode', key: 'lotCode', render: (code) => <code style={{ color: '#c41d7f', fontWeight: 'bold' }}>{code}</code> },
                    { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
                    { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier' },
                    { title: 'Ngày thu hoạch', dataIndex: 'harvestDate', key: 'harvestDate' },
                    { title: 'Hạn sử dụng (FEFO)', dataIndex: 'expiryDate', key: 'expiryDate' },
                    { title: 'Số lượng tồn', dataIndex: 'qty', key: 'qty', render: (q) => `${q} kg/lít` },
                    { title: 'Đánh giá hạn', dataIndex: 'status', key: 'status', render: (st) => (
                      <Tag color={st === 'An toàn' ? 'green' : (st === 'Cận hạn' ? 'orange' : 'red')}>{st}</Tag>
                    ) },
                  ]}
                />
              </div>
            )}

            {/* 5. VIEW: ORDERS */}
            {currentMenu === 'orders' && (
              <div>
                <h3>Quản lý Đơn hàng chuỗi cung ứng</h3>
                <Table 
                  dataSource={orders} 
                  columns={[
                    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId', render: (id) => <b>{id}</b> },
                    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
                    { title: 'Thành tiền', dataIndex: 'amount', key: 'amount' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (st) => (
                      <Tag color={st === 'Completed' ? 'green' : (st === 'Processing' ? 'orange' : 'blue')}>{st}</Tag>
                    ) },
                    { 
                      title: 'Xử lý', 
                      key: 'actions', 
                      render: (_, record) => (
                        <Space>
                          {record.status === 'Processing' && (
                            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleUpdateOrderStatus(record.key, 'Shipped')}>
                              Giao cho Shipper
                            </Button>
                          )}
                          {record.status === 'Shipped' && (
                            <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} onClick={() => handleUpdateOrderStatus(record.key, 'Completed')}>
                              Hoàn thành
                            </Button>
                          )}
                          {record.status !== 'Completed' && record.status !== 'Cancelled' && (
                            <Button danger type="text" size="small" icon={<CloseCircleOutlined />} onClick={() => handleUpdateOrderStatus(record.key, 'Cancelled')}>
                              Hủy đơn
                            </Button>
                          )}
                        </Space>
                      )
                    },
                  ]}
                />
              </div>
            )}

          </div>
        </Content>

        <Footer style={{ textAlign: 'center', color: '#8D9E90' }}>
          ECC Admin Control Center © 2026 · Khóa luận tốt nghiệp Đại học Công Thương TP.HCM (HUIT)
        </Footer>
      </Layout>

      {/* Add Product Modal */}
      <Modal 
        title="Thêm nông sản mới vào hệ thống" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddProduct} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên nông sản" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Ví dụ: Xoài cát Hòa Lộc" />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
            <Select placeholder="Chọn danh mục">
              <Select.Option value="Rau xanh">Rau xanh</Select.Option>
              <Select.Option value="Củ quả">Củ quả</Select.Option>
              <Select.Option value="Trái cây">Trái cây</Select.Option>
              <Select.Option value="Chế biến">Chế biến</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Đơn giá (₫)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
            <Input type="number" placeholder="Ví dụ: 35000" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#2E7D32' }}>
                Thêm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
