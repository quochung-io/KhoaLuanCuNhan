import { useState } from 'react';
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
  DatePicker,
  InputNumber,
  message
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  BarcodeOutlined,
  OrderedListOutlined,
  HomeOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

// === MOCK DATA FOR SUPPLIER ===
const mockMyProducts = [
  { key: '1', name: 'Cải bó xôi hữu cơ', category: 'Rau xanh', price: '28.000₫', stock: '250 kg', status: 'Approved' },
  { key: '2', name: 'Cà rốt baby Đà Lạt', category: 'Củ quả', price: '32.000₫', stock: '500 kg', status: 'Approved' },
  { key: '3', name: 'Xà lách xoăn thủy canh', category: 'Rau xanh', price: '22.000₫', stock: '15 kg', status: 'Approved' },
  { key: '4', name: 'Ớt chuông đỏ Đà Lạt', category: 'Củ quả', price: '45.000₫', stock: '0 kg', status: 'Pending' },
];

const mockMyLots = [
  { key: '1', lotCode: 'LOT#VN-DL-0842', productName: 'Cải bó xôi hữu cơ', harvestDate: '21/07/2026', expiryDate: '30/08/2026', qty: 250, zone: 'Nhà màng khu A', cert: 'VietGAP', status: 'Cận hạn' },
  { key: '2', lotCode: 'LOT#VN-DL-0917', productName: 'Cà rốt baby Đà Lạt', harvestDate: '20/07/2026', expiryDate: '15/09/2026', qty: 500, zone: 'Cánh đồng khu B', cert: 'GlobalGAP', status: 'An toàn' },
  { key: '3', lotCode: 'LOT#VN-DL-0721', productName: 'Xà lách xoăn thủy canh', harvestDate: '24/07/2026', expiryDate: '01/09/2026', qty: 15, zone: 'Khu giàn đứng C', cert: 'VietGAP', status: 'Sắp hết hạn' },
];

const mockMyOrders = [
  { key: '1', orderId: 'ORD-98421', items: 'Cải bó xôi hữu cơ (x2), Cà rốt baby (x1)', customer: 'Bùi Quốc Hưng', date: '25/08/2026', status: 'Pending' },
  { key: '2', orderId: 'ORD-98420', items: 'Cà rốt baby (x2)', customer: 'Lê Văn C', date: '24/08/2026', status: 'Completed' },
  { key: '3', orderId: 'ORD-98418', items: 'Xà lách xoăn (x3)', customer: 'Nguyễn Thị D', date: '23/08/2026', status: 'ReadyForShipper' },
];

function App() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [products, setProducts] = useState(mockMyProducts);
  const [lots, setLots] = useState(mockMyLots);
  const [orders, setOrders] = useState(mockMyOrders);

  // Modals layout state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [productForm] = Form.useForm();
  const [lotForm] = Form.useForm();

  // Add Product (Submit for approval)
  const handleAddProduct = (values: any) => {
    const newProduct = {
      key: String(products.length + 1),
      name: values.name,
      category: values.category,
      price: Number(values.price).toLocaleString('vi-VN') + '₫',
      stock: '0 kg',
      status: 'Pending'
    };
    setProducts([...products, newProduct]);
    message.success('Đã đăng ký nông sản mới! Đang chờ Admin xét duyệt.');
    setIsProductModalOpen(false);
    productForm.resetFields();
  };

  // Add Lot (Khai báo lô hàng thu hoạch mới)
  const handleAddLot = (values: any) => {
    const newLot = {
      key: String(lots.length + 1),
      lotCode: `LOT#VN-DL-0${Math.floor(100 + Math.random() * 900)}`,
      productName: values.productName,
      harvestDate: values.harvestDate.format('DD/MM/YYYY'),
      expiryDate: values.expiryDate.format('DD/MM/YYYY'),
      qty: values.qty,
      zone: values.zone,
      cert: values.cert,
      status: 'An toàn'
    };
    setLots([...lots, newLot]);
    
    // Cập nhật tồn kho sản phẩm tương ứng
    setProducts(prev => prev.map(p => {
      if (p.name === values.productName) {
        const currentQty = parseInt(p.stock.replace(/[^\d]/g, ''), 10) || 0;
        return { ...p, stock: `${currentQty + values.qty} kg` };
      }
      return p;
    }));

    message.success(`Khai báo thành công lô hàng ${newLot.lotCode}!`);
    setIsLotModalOpen(false);
    lotForm.resetFields();
  };

  // Order state update
  const handleProcessOrder = (key: string) => {
    setOrders(prev => prev.map(o => {
      if (o.key === key) {
        message.success(`Đã chuẩn bị hàng xong cho đơn ${o.orderId}. Sẵn sàng bàn giao!`);
        return { ...o, status: 'ReadyForShipper' };
      }
      return o;
    }));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Left Navigation */}
      <Sider breakpoint="lg" collapsedWidth="0" theme="dark" style={{ background: '#00251a' }}>
        <div className="logo-section" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001a12', borderBottom: '1px solid #ffffff10' }}>
          <span style={{ color: '#FF9800', fontSize: 18, fontWeight: 'bold', letterSpacing: 1.2 }}>ĐÀ LẠT XANH</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ background: '#00251a' }}
          selectedKeys={[currentMenu]}
          onClick={({ key }) => setCurrentMenu(key)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
            { key: 'products', icon: <ShoppingOutlined />, label: 'Sản phẩm của tôi' },
            { key: 'lots', icon: <BarcodeOutlined />, label: 'Khai báo Lô hàng' },
            { key: 'orders', icon: <OrderedListOutlined />, label: 'Chuẩn bị đơn hàng' },
            { key: 'profile', icon: <HomeOutlined />, label: 'Hồ sơ nhà vườn' },
          ]}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
          <Button type="text" danger icon={<LogoutOutlined />} style={{ width: '100%', color: '#ff4d4f' }}>
            Thoát cổng HTX
          </Button>
        </div>
      </Sider>

      {/* Main Layout Area */}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Breadcrumb style={{ margin: 0 }}>
            <Breadcrumb.Item>Cổng Nhà cung cấp</Breadcrumb.Item>
            <Breadcrumb.Item>
              {currentMenu === 'dashboard' && 'Dashboard'}
              {currentMenu === 'products' && 'Nông sản của tôi'}
              {currentMenu === 'lots' && 'Nhật ký Lô hàng (FEFO)'}
              {currentMenu === 'orders' && 'Chuẩn bị đơn hàng'}
              {currentMenu === 'profile' && 'Thông tin Hợp tác xã'}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge dot status="warning">
              <AlertOutlined style={{ fontSize: 16 }} />
            </Badge>
            <Avatar style={{ backgroundColor: '#FF9800' }} icon={<HomeOutlined />} />
            <span style={{ fontWeight: 'bold' }}>Hợp tác xã Đà Lạt Xanh</span>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360, borderRadius: 12 }}>
            
            {/* 1. VIEW: DASHBOARD */}
            {currentMenu === 'dashboard' && (
              <div>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#FFFDF9', borderLeft: '4px solid #FF9800' }}>
                      <Statistic title="Doanh thu tạm tính" value={18240000} suffix="₫" valueStyle={{ color: '#FF9800', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#F4F9F4', borderLeft: '4px solid #2E7D32' }}>
                      <Statistic title="Sản phẩm đang bán" value={3} valueStyle={{ color: '#2E7D32', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#FFF9F9', borderLeft: '4px solid #FF4D4F' }}>
                      <Statistic title="Lô hàng sắp hết hạn" value={2} prefix={<AlertOutlined />} valueStyle={{ color: '#FF4D4F', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#F5F9FC', borderLeft: '4px solid #1890FF' }}>
                      <Statistic title="Đơn hàng chờ chuẩn bị" value={1} valueStyle={{ color: '#1890FF', fontWeight: 'bold' }} />
                    </Card>
                  </Col>
                </Row>

                <h3 style={{ margin: '24px 0 16px' }}>Lô hàng cận hạn của bạn (Cần chủ động giảm giá đẩy kho)</h3>
                <Table 
                  dataSource={lots.filter(l => l.status !== 'An toàn')} 
                  columns={[
                    { title: 'Mã lô', dataIndex: 'lotCode', key: 'lotCode' },
                    { title: 'Nông sản', dataIndex: 'productName', key: 'productName' },
                    { title: 'Vùng trồng', dataIndex: 'zone', key: 'zone' },
                    { title: 'Hạn dùng', dataIndex: 'expiryDate', key: 'expiryDate' },
                    { title: 'Tồn thực tế', dataIndex: 'qty', key: 'qty', render: (q) => `${q} kg` },
                    { title: 'Độ khẩn cấp', dataIndex: 'status', key: 'status', render: (st) => <Tag color={st === 'Sắp hết hạn' ? 'red' : 'orange'}>{st}</Tag> },
                  ]}
                  pagination={false}
                />
              </div>
            )}

            {/* 2. VIEW: MY PRODUCTS */}
            {currentMenu === 'products' && (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Danh mục nông sản đã đăng ký</h3>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#2E7D32' }} onClick={() => setIsProductModalOpen(true)}>
                    Đăng ký sản phẩm mới
                  </Button>
                </div>
                <Table 
                  dataSource={products} 
                  columns={[
                    { title: 'Tên nông sản', dataIndex: 'name', key: 'name', render: (t) => <b>{t}</b> },
                    { title: 'Danh mục', dataIndex: 'category', key: 'category' },
                    { title: 'Giá niêm yết', dataIndex: 'price', key: 'price' },
                    { title: 'Tổng tồn (kho)', dataIndex: 'stock', key: 'stock' },
                    { title: 'Trạng thái duyệt', dataIndex: 'status', key: 'status', render: (st) => (
                      <Tag color={st === 'Approved' ? 'green' : 'orange'}>{st === 'Approved' ? 'Đang bán' : 'Chờ duyệt'}</Tag>
                    ) },
                  ]}
                />
              </div>
            )}

            {/* 3. VIEW: MY LOTS */}
            {currentMenu === 'lots' && (
              <div>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Nhật ký Lô hàng thu hoạch & Chứng nhận nguồn gốc</h3>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#FF9800' }} onClick={() => setIsLotModalOpen(true)}>
                    Khai báo lô hàng thu hoạch mới
                  </Button>
                </div>
                <Table 
                  dataSource={lots} 
                  columns={[
                    { title: 'Mã lô', dataIndex: 'lotCode', key: 'lotCode', render: (code) => <code style={{ color: '#d48806', fontWeight: 'bold' }}>{code}</code> },
                    { title: 'Tên nông sản', dataIndex: 'productName', key: 'productName' },
                    { title: 'Khu vực trồng', dataIndex: 'zone', key: 'zone' },
                    { title: 'Chứng nhận', dataIndex: 'cert', key: 'cert', render: (c) => <Tag color="green">{c}</Tag> },
                    { title: 'Ngày thu hoạch', dataIndex: 'harvestDate', key: 'harvestDate' },
                    { title: 'Hạn dùng (FEFO)', dataIndex: 'expiryDate', key: 'expiryDate' },
                    { title: 'Số lượng', dataIndex: 'qty', key: 'qty', render: (q) => `${q} kg` },
                  ]}
                />
              </div>
            )}

            {/* 4. VIEW: PREPARE ORDERS */}
            {currentMenu === 'orders' && (
              <div>
                <h3>Đơn hàng chờ chuẩn bị nông sản</h3>
                <Table 
                  dataSource={orders} 
                  columns={[
                    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId', render: (id) => <b>{id}</b> },
                    { title: 'Chi tiết nông sản đặt', dataIndex: 'items', key: 'items', render: (items) => <b style={{ color: '#2E7D32' }}>{items}</b> },
                    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
                    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (st) => (
                      <Tag color={st === 'Completed' ? 'green' : (st === 'Pending' ? 'orange' : 'blue')}>{st === 'Pending' ? 'Chờ chuẩn bị' : 'Đã sẵn sàng'}</Tag>
                    ) },
                    { 
                      title: 'Xử lý đóng gói', 
                      key: 'actions', 
                      render: (_, record) => (
                        record.status === 'Pending' ? (
                          <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#2E7D32' }} onClick={() => handleProcessOrder(record.key)}>
                            Đã chuẩn bị xong hàng
                          </Button>
                        ) : <span>Chờ đơn vị vận chuyển lấy hàng</span>
                      )
                    },
                  ]}
                />
              </div>
            )}

            {/* 5. VIEW: PROFILE */}
            {currentMenu === 'profile' && (
              <div style={{ maxWidth: 600 }}>
                <h3>Thông tin Hợp tác xã nông sản</h3>
                <Card bordered={false} style={{ background: '#f9f9f9', marginTop: 16 }}>
                  <Form layout="vertical">
                    <Form.Item label="Tên Hợp tác xã/Nhà vườn">
                      <Input defaultValue="Hợp tác xã Đà Lạt Xanh" disabled />
                    </Form.Item>
                    <Form.Item label="Đại diện pháp luật">
                      <Input defaultValue="Nguyễn Văn Green" disabled />
                    </Form.Item>
                    <Form.Item label="Vùng trồng sở hữu">
                      <Input defaultValue="12 Hecta chuyên canh cải bó xôi và củ quả - Phường 7, TP. Đà Lạt, Lâm Đồng" disabled />
                    </Form.Item>
                    <Form.Item label="Chứng nhận chất lượng sở hữu">
                      <Space>
                        <Tag color="green">VietGAP #2026-VG-081</Tag>
                        <Tag color="green">GlobalGAP #2026-GG-110</Tag>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </div>
            )}

          </div>
        </Content>

        <Footer style={{ textAlign: 'center', color: '#8D9E90' }}>
          ECC Supplier Portal © 2026 · Khóa luận tốt nghiệp Đại học Công Thương TP.HCM (HUIT)
        </Footer>
      </Layout>

      {/* Modal Đăng ký sản phẩm mới */}
      <Modal 
        title="Đăng ký nông sản kinh doanh mới" 
        open={isProductModalOpen} 
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
      >
        <Form form={productForm} layout="vertical" onFinish={handleAddProduct} style={{ marginTop: 16 }}>
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
          <Form.Item name="price" label="Đơn giá đề xuất (₫)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
            <Input type="number" placeholder="Ví dụ: 35000" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsProductModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#2E7D32' }}>
                Đăng ký duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Khai báo lô hàng mới */}
      <Modal 
        title="Khai báo lô hàng thu hoạch mới" 
        open={isLotModalOpen} 
        onCancel={() => setIsLotModalOpen(false)}
        footer={null}
      >
        <Form form={lotForm} layout="vertical" onFinish={handleAddLot} style={{ marginTop: 16 }}>
          <Form.Item name="productName" label="Nông sản thu hoạch" rules={[{ required: true, message: 'Vui lòng chọn nông sản!' }]}>
            <Select placeholder="Chọn sản phẩm nông sản">
              {products.filter(p => p.status === 'Approved').map(p => (
                <Select.Option key={p.key} value={p.name}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="zone" label="Khu vực trồng thu hoạch" rules={[{ required: true, message: 'Vui lòng nhập khu vực!' }]}>
            <Input placeholder="Ví dụ: Cánh đồng khu B" />
          </Form.Item>
          <Form.Item name="cert" label="Chứng nhận chất lượng của lô" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
            <Select placeholder="Chọn chứng nhận">
              <Select.Option value="VietGAP">VietGAP</Select.Option>
              <Select.Option value="GlobalGAP">GlobalGAP</Select.Option>
              <Select.Option value="USDA Organic">USDA Organic</Select.Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="harvestDate" label="Ngày thu hoạch" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label="Hạn sử dụng (FEFO)" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="qty" label="Số lượng thu hoạch (kg)" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 300" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsLotModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FF9800', color: '#3A2200' }}>
                Xác nhận khai báo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
