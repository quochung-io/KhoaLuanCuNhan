import { useState, useEffect } from 'react';
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
  message,
  Alert
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
  LogoutOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../config/axiosClient';

const { Header, Content, Footer, Sider } = Layout;

interface BackendProduct {
  productId: number;
  productName: string;
  categoryId: number;
  supplierId: number;
  price: number;
  unit: string;
  status: string;
  description?: string;
  availableStock?: number;
  category?: { categoryId: number; categoryName: string };
  createdAt?: string;
  comboType?: string;
  startDate?: string;
  endDate?: string;
  originalPrice?: number;
  discountPercent?: number;
  programLimit?: number;
  soldQuantity?: number;
  maxSlots?: number;
}

interface BackendCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// Data mẫu cho Lô hàng & Đơn hàng
const initialLots = [
  { key: '1', lotCode: 'LOT#VN-DL-0842', productName: 'Cải bó xôi hữu cơ', harvestDate: '21/07/2026', expiryDate: '30/08/2026', qty: 250, zone: 'Nhà màng khu A', cert: 'VietGAP', status: 'Cận hạn' },
  { key: '2', lotCode: 'LOT#VN-DL-0917', productName: 'Cà rốt baby Đà Lạt', harvestDate: '20/07/2026', expiryDate: '15/09/2026', qty: 500, zone: 'Cánh đồng khu B', cert: 'GlobalGAP', status: 'An toàn' },
  { key: '3', lotCode: 'LOT#VN-DL-0721', productName: 'Xà lách xoăn thủy canh', harvestDate: '24/07/2026', expiryDate: '01/09/2026', qty: 15, zone: 'Khu giàn đứng C', cert: 'VietGAP', status: 'Sắp hết hạn' },
];

const initialOrders = [
  { key: '1', orderId: 'ORD-98421', items: 'Combo Gia Đình Nhỏ [Cải bó xôi, Cà rốt baby, Bơ 034]', customer: 'Bùi Quốc Hưng', date: '25/08/2026', status: 'Pending' },
  { key: '2', orderId: 'ORD-98420', items: 'Cà rốt baby (x2), Bắp cải Mộc Châu (x1)', customer: 'Lê Văn C', date: '24/08/2026', status: 'Completed' },
  { key: '3', orderId: 'ORD-98418', items: 'Combo Thuần Chay Sạch [Nấm đùi gà, Đậu hũ non, Hạt sen, Kale]', customer: 'Nguyễn Thị D', date: '23/08/2026', status: 'ReadyForShipper' },
];

export const Dashboard = () => {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [combos, setCombos] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [lots, setLots] = useState(initialLots);
  const [orders, setOrders] = useState(initialOrders);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isLotModalOpen, setIsLotModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  const [productForm] = Form.useForm();
  const [lotForm] = Form.useForm();
  const [comboForm] = Form.useForm();

  // Helper trích xuất số slot tự chọn của combo
  const getComboSlots = (prod: BackendProduct) => {
    if (prod.description) {
      const match = prod.description.match(/(\d+)\s*(món|loại)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.unit) {
      const match = prod.unit.match(/(\d+)\s*(món|loại)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.productName?.includes('Lớn')) return 5;
    if (prod.productName?.includes('Thuần Chay')) return 4;
    return 3;
  };

  // Helper ánh xạ UserId sang SupplierId tương ứng trong CSDL
  const getActualSupplierId = (user: any) => {
    if (user?.supplierId) return user.supplierId;
    if (user?.userId === 2) return 1; // HTX Nông Sản Đà Lạt: UserId 2 -> SupplierId 1
    if (user?.userId === 3) return 2; // HTX Rau Sạch Miền Tây: UserId 3 -> SupplierId 2
    if (user?.userId === 4) return 3; // HTX Trái Cây Việt: UserId 4 -> SupplierId 3
    if (user?.userId === 23) return 4; // HTX Nông Nghiệp An Phú: UserId 23 -> SupplierId 4
    return user?.userId || 1;
  };

  // Tải dữ liệu thực từ API backend đồng bộ với database
  const loadData = async (userObj?: any) => {
    const user = userObj || currentUser;
    const mySupplierId = getActualSupplierId(user);
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get(`/products?supplierId=${mySupplierId}`),
        axiosClient.get('/categories').catch(() => ({ data: [] }))
      ]);
      const allList: BackendProduct[] = prodRes.data || [];
      setCategories(catRes.data || []);
      
      // Đồng bộ phân loại sản phẩm lẻ và combo tự chọn từ Database
      setProducts(allList.filter(p => p.categoryId !== 5));
      setCombos(allList.filter(p => p.categoryId === 5));
    } catch (error) {
      message.error('Không thể đồng bộ danh sách sản phẩm / combo từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('supplier_user');
    let parsedUser = null;
    if (userStr) {
      try {
        parsedUser = JSON.parse(userStr);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error(e);
      }
    }
    loadData(parsedUser);
  }, []);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Đăng xuất khỏi Kênh Đối Tác',
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc này?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('supplier_user');
        message.success('Đã đăng xuất thành công!');
        navigate('/login');
      }
    });
  };

  // Thêm nông sản lẻ mới (Lưu trực tiếp vào Database với trạng thái Pending chờ Admin duyệt)
  const handleAddProduct = async (values: any) => {
    const mySupplierId = getActualSupplierId(currentUser);
    try {
      await axiosClient.post('/products', {
        productName: values.name,
        categoryId: values.categoryId,
        supplierId: mySupplierId,
        price: values.price,
        unit: values.unit || 'kg',
        status: 'Pending',
        description: values.description || ''
      });
      message.success('Đã đăng ký nông sản mới! Đang chờ Ban Quản Trị xét duyệt.');
      setIsProductModalOpen(false);
      productForm.resetFields();
      loadData();
    } catch (error) {
      message.error('Đăng ký nông sản thất bại.');
    }
  };

  // Đề xuất Gói Combo Tự Chọn Mới (Lưu trực tiếp vào Database CategoryId = 5, Status = Pending)
  const handleAddCombo = async (values: any) => {
    const mySupplierId = getActualSupplierId(currentUser);
    const slots = values.slots || 3;
    const comboType = values.comboType || 'periodic';
    const unit = comboType === 'program' 
      ? 'Gói Ưu Đãi' 
      : (values.cycle === 'Tháng' ? 'Gói/Tháng' : 'Gói/Tuần');

    let startDate: string | null = null;
    let endDate: string | null = null;
    if (values.dateRange && values.dateRange.length === 2) {
      startDate = values.dateRange[0].toISOString();
      endDate = values.dateRange[1].toISOString();
    }

    try {
      await axiosClient.post('/products', {
        productName: values.name,
        categoryId: 5, // Cố định danh mục 5 = Combo Nông Sản Định Kỳ / Chương trình
        supplierId: mySupplierId,
        price: values.price,
        unit: unit,
        status: 'Pending', // Chờ Admin duyệt
        description: `[Tự chọn ${slots} loại nông sản] ${values.desc || ''}`,
        comboType: comboType,
        maxSlots: slots,
        startDate: startDate,
        endDate: endDate,
        originalPrice: values.originalPrice || values.price,
        discountPercent: values.discountPercent || 0,
        programLimit: values.programLimit || null,
        soldQuantity: 0
      });
      message.success('Đã gửi đề xuất Gói Combo mới! Đang chờ Ban Quản Trị xét duyệt.');
      setIsComboModalOpen(false);
      comboForm.resetFields();
      loadData();
    } catch (error) {
      message.error('Đề xuất gói combo thất bại.');
    }
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
    message.success('Khai báo Lô hàng mới thành công! Mã QR truy xuất nguồn gốc đã sẵn sàng.');
    setIsLotModalOpen(false);
    lotForm.resetFields();
  };

  // Cột Sản phẩm lẻ (Đồng bộ với Database)
  const productColumns = [
    { title: 'ID', dataIndex: 'productId', key: 'productId', width: 70, render: (id: number) => <Tag>#{id}</Tag> },
    { title: 'Tên nông sản', dataIndex: 'productName', key: 'productName', render: (text: string) => <b>{text}</b> },
    { 
      title: 'Danh mục', 
      dataIndex: ['category', 'categoryName'], 
      key: 'categoryName',
      render: (text: string) => <Tag color="blue">{text || 'Nông sản'}</Tag>
    },
    { 
      title: 'Giá bán sàn', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => <span style={{ color: '#d32f2f', fontWeight: 600 }}>{Number(val).toLocaleString('vi-VN')} đ</span>
    },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 80 },
    { 
      title: 'Tồn kho khả dụng', 
      dataIndex: 'availableStock', 
      key: 'availableStock',
      render: (stk?: number, r?: BackendProduct) => `${stk || 0} ${r?.unit || 'kg'}`
    },
    { 
      title: 'Trạng thái duyệt', 
      dataIndex: 'status', 
      key: 'status',
      render: (st: string) => {
        if (st === 'Active' || st === 'Approved') return <Tag color="green">ĐÃ DUYỆT (ĐANG BÁN)</Tag>;
        if (st === 'Pending') return <Tag color="orange">CHỜ DUYỆT (PENDING)</Tag>;
        return <Tag color="default">TẠM DỪNG</Tag>;
      }
    },
  ];

  // Cột Gói Combo tự chọn (Đồng bộ 100% với Admin và Database)
  const comboColumns = [
    { title: 'Mã Gói', dataIndex: 'productId', key: 'productId', width: 85, render: (id: number) => <Tag color="geekblue">#{id}</Tag> },
    { 
      title: 'Phân loại', 
      dataIndex: 'comboType', 
      key: 'comboType', 
      width: 140,
      render: (t?: string) => {
        if (t === 'program') {
          return <Tag color="magenta" style={{ fontWeight: 600 }}>🎁 Theo chương trình</Tag>;
        }
        return <Tag color="blue" style={{ fontWeight: 600 }}>📅 Gói định kỳ</Tag>;
      }
    },
    { 
      title: 'Tên gói Combo Tự Chọn', 
      dataIndex: 'productName', 
      key: 'productName', 
      render: (text: string, r: BackendProduct) => (
        <div>
          <b style={{ color: '#1b5e20', fontSize: '13.5px' }}>{text}</b>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{r.description}</div>
          {r.comboType === 'program' && (
            <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#d46b08', background: '#fff7e6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
              ⏳ {r.startDate && r.endDate ? `${r.startDate.substring(0, 10)} - ${r.endDate.substring(0, 10)}` : 'Không thời hạn'}
              {r.programLimit ? ` • Suất: ${r.soldQuantity || 0}/${r.programLimit}` : ''}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Số món tự chọn', 
      key: 'slots', 
      width: 130,
      render: (_: any, r: BackendProduct) => {
        const slots = getComboSlots(r);
        return <Tag color="cyan" style={{ fontWeight: 700 }}>🥗 {slots} món</Tag>;
      }
    },
    { 
      title: 'Chu kỳ', 
      dataIndex: 'unit', 
      key: 'unit', 
      width: 100,
      render: (c: string, r: BackendProduct) => {
        if (r.comboType === 'program') return <Tag color="volcano">Ưu đãi</Tag>;
        return <Tag color={c?.includes('Tháng') ? 'purple' : 'blue'}>{c || 'Gói/Tuần'}</Tag>;
      }
    },
    { 
      title: 'Giá bán sàn', 
      dataIndex: 'price', 
      key: 'price', 
      width: 130,
      render: (p: number, r: BackendProduct) => (
        <div>
          <b style={{ color: '#d32f2f' }}>{Number(p).toLocaleString('vi-VN')} đ</b>
          {r.comboType === 'program' && r.originalPrice && r.originalPrice > p && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              <span style={{ textDecoration: 'line-through' }}>{r.originalPrice.toLocaleString('vi-VN')} đ</span>
              {r.discountPercent ? <Tag color="volcano" style={{ marginLeft: 4, fontSize: '10px', padding: '0 2px' }}>-{r.discountPercent}%</Tag> : null}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Trạng thái sàn', 
      dataIndex: 'status', 
      key: 'status',
      width: 160,
      render: (st: string) => {
        if (st === 'Active' || st === 'Approved') return <Tag color="green">ĐÃ DUYỆT (ĐANG BÁN)</Tag>;
        if (st === 'Pending') return <Tag color="gold">CHỜ ADMIN DUYỆT (PENDING)</Tag>;
        return <Tag color="default">TẠM DỪNG</Tag>;
      }
    },
  ];

  // Cột Lô hàng (Batches / Traceability)
  const lotColumns = [
    { title: 'Mã Lô (Traceability)', dataIndex: 'lotCode', key: 'lotCode', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Ngày thu hoạch', dataIndex: 'harvestDate', key: 'harvestDate' },
    { title: 'Hạn dùng (FEFO)', dataIndex: 'expiryDate', key: 'expiryDate' },
    { title: 'Sản lượng', dataIndex: 'qty', key: 'qty', render: (q: number) => `${q} kg` },
    { title: 'Khu vực / Nhà kính', dataIndex: 'zone', key: 'zone' },
    { title: 'Chứng nhận', dataIndex: 'cert', key: 'cert', render: (c: string) => <Tag color="green">{c}</Tag> },
    { 
      title: 'Tình trạng', 
      dataIndex: 'status', 
      key: 'status',
      render: (st: string) => {
        if (st === 'An toàn') return <Badge status="success" text="Tươi mới" />;
        if (st === 'Cận hạn') return <Badge status="warning" text="Cận hạn xuất" />;
        return <Badge status="error" text="Hết hạn" />;
      }
    }
  ];

  // Cột Đơn hàng cần đóng gói
  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Sản phẩm đặt', dataIndex: 'items', key: 'items' },
    { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
    { 
      title: 'Tiến độ', 
      dataIndex: 'status', 
      key: 'status',
      render: (st: string) => {
        if (st === 'Pending') return <Tag color="gold">Chờ hái &amp; đóng gói</Tag>;
        if (st === 'ReadyForShipper') return <Tag color="blue">Đã giao Shipper</Tag>;
        return <Tag color="green">Hoàn tất</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        record.status === 'Pending' ? (
          <Button 
            size="small" 
            type="primary" 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => {
              setOrders(orders.map(o => o.key === record.key ? { ...o, status: 'ReadyForShipper' } : o));
              message.success(`Đã chuẩn bị xong hàng cho đơn ${record.orderId}`);
            }}
          >
            Đã đóng gói
          </Button>
        ) : <span style={{ color: '#888' }}>-</span>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#214d23' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold', borderBottom: '1px solid #2e6931', padding: '0 12px', textAlign: 'center' }}>
          🌿 {currentUser?.fullName || 'HỢP TÁC XÃ ĐỐI TÁC'}
        </div>
        <Menu
          theme="dark"
          style={{ background: '#214d23' }}
          mode="inline"
          selectedKeys={[currentMenu]}
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
            } else {
              setCurrentMenu(key);
            }
          }}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan gian hàng' },
            { key: 'products', icon: <ShoppingOutlined />, label: `Nông sản lẻ (${products.length})` },
            { key: 'combos', icon: <AppstoreAddOutlined />, label: `Gói Combo tự chọn (${combos.length})` },
            { key: 'lots', icon: <BarcodeOutlined />, label: 'Lô hàng & Truy xuất' },
            { key: 'orders', icon: <OrderedListOutlined />, label: 'Đơn hàng đóng gói' },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined style={{ color: '#ff7875' }} />, label: <span style={{ color: '#ff7875' }}>Đăng xuất</span> }
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div style={{ fontSize: 16, fontWeight: '600', color: '#214d23' }}>
            🌾 CỔNG THÔNG TIN ĐỐI TÁC CUNG ỨNG NÔNG SẢN
          </div>
          <Space size="middle">
            <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>
              Làm mới dữ liệu
            </Button>
            <Tag color="success" style={{ padding: '4px 10px', fontSize: 13 }}>
              ✓ ĐỐI TÁC CHÍNH THỨC
            </Tag>
            <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
            <span style={{ fontWeight: 500 }}>{currentUser?.fullName || 'Nhà cung cấp'}</span>
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              title="Đăng xuất"
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: '16px 24px' }}>
          <Breadcrumb style={{ margin: '8px 0 16px 0' }} items={[
            { title: <HomeOutlined /> },
            { title: 'Nhà cung cấp' },
            { title: currentMenu.toUpperCase() }
          ]} />

          {/* VIEW: DASHBOARD */}
          {currentMenu === 'dashboard' && (
            <div>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic title="Nông sản lẻ đang bán" value={products.filter(p => p.status === 'Active' || p.status === 'Approved').length} prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Gói Combo tự chọn" value={combos.length} prefix={<AppstoreAddOutlined style={{ color: '#1890ff' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Đơn cần đóng gói ngay" value={orders.filter(o => o.status === 'Pending').length} prefix={<AlertOutlined style={{ color: '#faad14' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Tỷ lệ giao đúng hạn" value={98.5} precision={1} suffix="%" prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={14}>
                  <Card 
                    title="📦 Đơn hàng cần điều phối đóng gói" 
                    extra={<Tag color="gold">{orders.filter(o => o.status === 'Pending').length} đơn đang chờ</Tag>}
                  >
                    <Table 
                      columns={orderColumns} 
                      dataSource={orders} 
                      pagination={false} 
                      size="small" 
                    />
                  </Card>
                </Col>
                <Col span={10}>
                  <Card 
                    title="🥗 Gói Combo Đang Mở Bán Trên Sàn"
                    extra={<Button type="link" onClick={() => setCurrentMenu('combos')}>Xem tất cả</Button>}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {combos.slice(0, 3).map(c => (
                        <div key={c.productId} style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#166534', fontSize: '13px' }}>{c.productName}</div>
                            <div style={{ fontSize: '11.5px', color: '#666', marginTop: '2px' }}>
                              Tự chọn {getComboSlots(c)} món • {c.unit}
                            </div>
                          </div>
                          <Tag color="green">{Number(c.price).toLocaleString('vi-VN')} đ</Tag>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* VIEW: PRODUCTS */}
          {currentMenu === 'products' && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingOutlined style={{ color: '#52c41a' }} />
                  <span>Danh sách Nông sản Lẻ của Hợp tác xã (Đồng bộ Database)</span>
                </div>
              }
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>Làm mới</Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => setIsProductModalOpen(true)}>
                    Đăng ký nông sản mới
                  </Button>
                </Space>
              }
            >
              <Table 
                columns={productColumns} 
                dataSource={products} 
                rowKey="productId"
                loading={loading}
                pagination={{ pageSize: 8 }}
              />
            </Card>
          )}

          {/* VIEW: COMBOS */}
          {currentMenu === 'combos' && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AppstoreAddOutlined style={{ color: '#1890ff' }} />
                  <span>Gói Combo Nông Sản Tự Chọn (Dữ liệu thực đồng bộ với Admin)</span>
                </div>
              }
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>Làm mới</Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} onClick={() => setIsComboModalOpen(true)}>
                    Đề xuất Gói Combo Mới
                  </Button>
                </Space>
              }
            >
              <Alert 
                type="info" 
                showIcon 
                message="Quy định Gói Combo Tự Chọn &amp; Đồng bộ Database" 
                description="Tất cả các món nông sản trong một gói Combo bắt buộc phải do DUY NHẤT một Nhà Cung Cấp / Hợp Tác Xã chuẩn bị để đảm bảo tính đồng bộ khi thu hoạch và vận chuyển xe lạnh. Gói do HTX đề xuất tại đây sẽ được lưu trực tiếp vào hệ thống với trạng thái Chờ duyệt (Pending). Ban Quản Trị xem xét và phê duyệt trên Web-Admin trước khi mở bán chính thức cho người tiêu dùng."
                style={{ marginBottom: 16, borderRadius: '8px' }}
              />
              <Table 
                columns={comboColumns} 
                dataSource={combos} 
                rowKey="productId"
                loading={loading}
                pagination={{ pageSize: 8 }}
              />
            </Card>
          )}

          {/* VIEW: LOTS / TRACEABILITY */}
          {currentMenu === 'lots' && (
            <Card 
              title="Quản lý Lô thu hoạch &amp; Dữ liệu Truy xuất Nguồn gốc" 
              extra={
                <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => setIsLotModalOpen(true)}>
                  Khai báo lô thu hoạch mới
                </Button>
              }
            >
              <Table columns={lotColumns} dataSource={lots} />
            </Card>
          )}

          {/* VIEW: ORDERS */}
          {currentMenu === 'orders' && (
            <Card title="Danh sách Đơn hàng cần đóng gói &amp; Giao Shipper">
              <Table columns={orderColumns} dataSource={orders} />
            </Card>
          )}
        </Content>

        <Footer style={{ textAlign: 'center', color: '#888' }}>
          Hệ Thống Phân Phối Nông Sản Chuỗi Cung Ứng Thông Minh ©2026 LÀNH Farm - Đối tác Hợp tác xã
        </Footer>
      </Layout>

      {/* MODAL: ĐĂNG KÝ SẢN PHẨM MỚI */}
      <Modal
        title="Đăng ký Nông sản mới gửi Ban Quản Trị duyệt"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
      >
        <Form form={productForm} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item name="name" label="Tên nông sản" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Ví dụ: Bông cải xanh Baby hữu cơ" />
          </Form.Item>
          <Form.Item name="categoryId" label="Phân loại danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
            <Select placeholder="Chọn nhóm danh mục">
              {categories.filter(c => c.categoryId !== 5).map(c => (
                <Select.Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="price" label="Đơn giá đề xuất (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                <InputNumber min={1000} step={1000} style={{ width: '100%' }} placeholder="Ví dụ: 35000" addonAfter="đ" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="unit" label="Đơn vị tính" initialValue="kg" rules={[{ required: true }]}>
                <Input placeholder="kg, bó, nải, túi..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả tiêu chuẩn &amp; vùng trồng">
            <Input.TextArea rows={3} placeholder="Mô tả giống cây, quy trình canh tác đạt chuẩn VietGAP..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsProductModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Gửi Admin xét duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: KHAI BÁO LÔ THU HOẠCH MỚI */}
      <Modal
        title="Khai báo Lô thu hoạch mới (Cấp mã QR Truy xuất)"
        open={isLotModalOpen}
        onCancel={() => setIsLotModalOpen(false)}
        footer={null}
      >
        <Form form={lotForm} layout="vertical" onFinish={handleAddLot}>
          <Form.Item name="productName" label="Nông sản thu hoạch" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
            <Select placeholder="Chọn loại nông sản">
              {products.map(p => (
                <Select.Option key={p.productId} value={p.productName}>{p.productName}</Select.Option>
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
              <Select.Option value="Hữu cơ Organic">Hữu cơ Organic</Select.Option>
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
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Xác nhận khai báo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: ĐỀ XUẤT COMBO MỚI */}
      <Modal
        title="Đề xuất Gói Combo Nông Sản Tự Chọn Mới"
        open={isComboModalOpen}
        onCancel={() => setIsComboModalOpen(false)}
        footer={null}
        width={580}
      >
        <Form form={comboForm} layout="vertical" onFinish={handleAddCombo} initialValues={{ comboType: 'periodic', slots: 3, cycle: 'Tuần' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="comboType" label="Phân loại combo" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="periodic">📅 Gói Định Kỳ (Tuần / Tháng)</Select.Option>
                  <Select.Option value="program">🎁 Theo Chương Trình / Ưu Đãi Mùa Vụ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên Gói Combo" rules={[{ required: true, message: 'Vui lòng nhập tên gói!' }]}>
                <Input placeholder="Ví dụ: Combo Tươi Ngon Tuần, Combo Bơ..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle dependencies={['comboType']}>
            {({ getFieldValue }) => {
              const isProg = getFieldValue('comboType') === 'program';
              return (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="slots" label="Số lượng món tự chọn" rules={[{ required: true, message: 'Nhập số món!' }]}>
                        <InputNumber min={1} max={10} style={{ width: '100%' }} addonAfter="món" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      {!isProg ? (
                        <Form.Item name="cycle" label="Chu kỳ gói" rules={[{ required: true }]}>
                          <Select>
                            <Select.Option value="Tuần">Gói theo Tuần (1 lần giao)</Select.Option>
                            <Select.Option value="Tháng">Gói trọn Tháng (4 lần giao)</Select.Option>
                          </Select>
                        </Form.Item>
                      ) : (
                        <Form.Item name="programLimit" label="Giới hạn số suất bán">
                          <InputNumber min={1} max={5000} placeholder="Ví dụ: 50" style={{ width: '100%' }} addonAfter="suất" />
                        </Form.Item>
                      )}
                    </Col>
                  </Row>

                  {isProg && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="dateRange" label="Thời gian diễn ra chương trình" rules={[{ required: true, message: 'Chọn thời gian!' }]}>
                          <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="originalPrice" label="Giá gốc niêm yết">
                          <InputNumber min={0} addonAfter="đ" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="discountPercent" label="Giảm giá (%)">
                          <InputNumber min={0} max={99} addonAfter="%" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Form.Item name="price" label={isProg ? "Đơn giá ưu đãi đề xuất (VNĐ)" : "Đơn giá trọn gói đề xuất (VNĐ)"} rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                    <InputNumber min={10000} step={10000} style={{ width: '100%' }} placeholder="Ví dụ: 199000" addonAfter="đ" />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item name="desc" label="Mô tả khẩu phần &amp; Cam kết">
            <Input.TextArea rows={3} placeholder="Ví dụ: Giỏ 3 món tự chọn từ danh mục nông sản sạch Đà Lạt, tặng kèm rau thơm..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsComboModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
                Gửi Admin xét duyệt
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
