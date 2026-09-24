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
  ReloadOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
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

interface BackendBatch {
  batchId: number;
  productId: number;
  farmId: number;
  batchCode: string;
  harvestDate: string;
  receivedDate: string;
  expiryDate: string;
  initialQuantity: number;
  unit: string;
  status: string;
  product?: BackendProduct;
}

interface BackendSupplier {
  userId: number;
  supplierId?: number;
  fullName: string;
  supplierName?: string;
  representative?: string;
  farm?: {
    farmId: number;
    farmName: string;
    province: string;
    cropType: string;
    productionStandard: string;
  };
}

const initialOrders = [
  { key: '1', orderId: 'ORD-98421', items: 'Combo Gia Đình Nhỏ [Cải bó xôi, Cà rốt baby, Bơ 034]', customer: 'Bùi Quốc Hưng', date: '25/08/2026', status: 'Pending' },
  { key: '2', orderId: 'ORD-98420', items: 'Cà rốt baby (x2), Bắp cải Mộc Châu (x1)', customer: 'Lê Văn C', date: '24/08/2026', status: 'Completed' },
  { key: '3', orderId: 'ORD-98418', items: 'Combo Thuần Chay Sạch [Nấm đùi gà, Đậu hũ non, Hạt sen, Kale]', customer: 'Nguyễn Thị D', date: '23/08/2026', status: 'ReadyForShipper' },
];

export const Dashboard = () => {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [combos, setCombos] = useState<BackendProduct[]>([]);
  const [batches, setBatches] = useState<BackendBatch[]>([]);
  const [suppliers, setSuppliers] = useState<BackendSupplier[]>([]);
  const [orders, setOrders] = useState(initialOrders);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [traceProduct, setTraceProduct] = useState<BackendProduct | null>(null);
  const [traceBatch, setTraceBatch] = useState<BackendBatch | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);

  const [productForm] = Form.useForm();
  const [comboForm] = Form.useForm();
  const [traceForm] = Form.useForm();

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
  const getActualSupplierId = (user: any, supList?: BackendSupplier[]) => {
    if (user?.supplierId) return user.supplierId;
    const list = supList && supList.length > 0 ? supList : suppliers;
    const found = list.find(s => s.userId === user?.userId);
    if (found?.supplierId) return found.supplierId;
    if (user?.userId === 2) return 1; // HTX Nông Sản Đà Lạt: UserId 2 -> SupplierId 1
    if (user?.userId === 3) return 2; // HTX Rau Sạch Miền Tây: UserId 3 -> SupplierId 2
    if (user?.userId === 4) return 3; // HTX Trái Cây Việt: UserId 4 -> SupplierId 3
    if (user?.userId === 23) return 4; // HTX Nông Nghiệp An Phú: UserId 23 -> SupplierId 4
    if (user?.userId === 29) return 9; // @Password123: UserId 29 -> SupplierId 9
    return user?.userId || 1;
  };

  // Tải dữ liệu thực từ API backend đồng bộ với database
  const loadData = async (userObj?: any) => {
    const user = userObj || currentUser;
    setLoading(true);
    try {
      // 1. Tải danh sách nhà cung cấp để đồng bộ SupplierId & FarmId
      const supRes = await axiosClient.get('/users/suppliers').catch(() => ({ data: [] }));
      const allSups: BackendSupplier[] = supRes.data || [];
      setSuppliers(allSups);

      // Tra cứu SupplierId và FarmId chính xác từ danh sách đối tác
      const matchedSup = allSups.find(s => s.userId === user?.userId);
      const mySupplierId = user?.supplierId || matchedSup?.supplierId || getActualSupplierId(user, allSups);
      const myFarmId = user?.farmId || matchedSup?.farm?.farmId;

      // Cập nhật lại user trong localStorage và state nếu thiếu thông tin
      if (user && mySupplierId && (user.supplierId !== mySupplierId || user.farmId !== myFarmId)) {
        const updatedUser = { ...user, supplierId: mySupplierId, farmId: myFarmId || user.farmId };
        setCurrentUser(updatedUser);
        localStorage.setItem('supplier_user', JSON.stringify(updatedUser));
      }

      const [prodRes, batchRes] = await Promise.all([
        axiosClient.get(`/products?supplierId=${mySupplierId}`),
        axiosClient.get('/productbatches').catch(() => ({ data: [] }))
      ]);
      const allList: BackendProduct[] = prodRes.data || [];
      const allBatches: BackendBatch[] = batchRes.data || [];

      const supplierProductIds = new Set(allList.map(p => p.productId));
      const myBatches = allBatches.filter(b => supplierProductIds.has(b.productId));
      setBatches(myBatches);
      
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

  // Mở Modal Khai báo / Chỉnh sửa Lô hàng & Truy xuất nguồn gốc
  const handleOpenTraceModal = (prod?: BackendProduct, specificBatch?: BackendBatch) => {
    const targetProd = prod || (specificBatch ? products.find(p => p.productId === specificBatch.productId) : products[0]);
    setTraceProduct(targetProd || null);
    
    const existing = specificBatch || (targetProd ? batches.find(b => b.productId === targetProd.productId) : null);
    setTraceBatch(existing || null);

    const mySupplierId = getActualSupplierId(currentUser);
    const currentSup = suppliers.find(s => s.supplierId === mySupplierId || s.userId === currentUser?.userId);
    const defaultFarmId = currentUser?.farmId || currentSup?.farm?.farmId || 1;

    if (existing) {
      traceForm.setFieldsValue({
        productId: existing.productId,
        batchCode: existing.batchCode,
        farmId: existing.farmId || defaultFarmId,
        initialQuantity: existing.initialQuantity,
        unit: existing.unit || targetProd?.unit || 'kg',
        harvestDate: dayjs(existing.harvestDate),
        expiryDate: dayjs(existing.expiryDate),
        status: existing.status || 'Active'
      });
    } else {
      traceForm.setFieldsValue({
        productId: targetProd?.productId,
        batchCode: `LHN-${dayjs().format('YYYYMMDD')}-${Math.floor(1000 + Math.random() * 9000)}`,
        farmId: defaultFarmId,
        initialQuantity: 100,
        unit: targetProd?.unit || 'kg',
        harvestDate: dayjs(),
        expiryDate: dayjs().add(7, 'day'),
        status: 'Active'
      });
    }
    setIsTraceModalOpen(true);
  };

  const handleSaveTrace = async () => {
    try {
      const values = await traceForm.validateFields();
      const pId = traceProduct?.productId || values.productId;
      if (!pId) {
        message.error('Vui lòng chọn nông sản cần khai báo lô!');
        return;
      }

      setTraceLoading(true);
      const payload = {
        productId: pId,
        farmId: values.farmId,
        batchCode: values.batchCode,
        harvestDate: values.harvestDate.toISOString(),
        receivedDate: values.harvestDate.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
        initialQuantity: values.initialQuantity,
        unit: values.unit,
        status: values.status || 'Active'
      };

      if (traceBatch) {
        await axiosClient.put(`/productbatches/${traceBatch.batchId}`, {
          ...payload,
          batchId: traceBatch.batchId
        });
        message.success(`Đã cập nhật thành công hồ sơ lô hàng "${values.batchCode}"!`);
      } else {
        await axiosClient.post('/productbatches', payload);
        message.success(`Khai báo lô hàng "${values.batchCode}" thành công! Đã gửi hồ sơ tới Ban Quản Trị để phân loại danh mục & phê duyệt.`);
      }

      setIsTraceModalOpen(false);
      await loadData();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể lưu hồ sơ lô hàng. Vui lòng kiểm tra lại!');
      }
    } finally {
      setTraceLoading(false);
    }
  };

  // Thêm nông sản lẻ mới (Lưu trực tiếp vào Database với trạng thái Pending & tự động mở Bước 2)
  const handleAddProduct = async (values: any) => {
    const mySupplierId = getActualSupplierId(currentUser);
    try {
      const res = await axiosClient.post('/products', {
        productName: values.name,
        categoryId: 1, // Mặc định tạm thời; Ban Quản Trị (Admin) sẽ phân loại chuẩn hóa khi phê duyệt
        supplierId: mySupplierId,
        price: values.price,
        unit: values.unit || 'kg',
        status: 'Pending',
        description: values.description || ''
      });
      message.success('Đã lưu thông tin nông sản tạm thời! Đang chuyển sang Bước 2: Khai báo Lô hàng & Truy xuất nguồn gốc.');
      setIsProductModalOpen(false);
      productForm.resetFields();
      await loadData();

      const created = res.data;
      handleOpenTraceModal(created);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Đăng ký nông sản thất bại.';
      message.error(errMsg);
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
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Đề xuất gói combo thất bại.';
      message.error(errMsg);
    }
  };

  // Xóa nông sản lẻ hoặc combo do chính nhà cung cấp tạo
  const handleDeleteProduct = (id: number, name: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa nông sản',
      content: `Bạn có chắc chắn muốn xóa nông sản "${name}" (#${id})? Toàn bộ hồ sơ lô hàng liên quan cũng sẽ được xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await axiosClient.delete(`/products/${id}`);
          message.success(res.data?.message || 'Đã xóa nông sản thành công.');
          await loadData();
        } catch (error: any) {
          const errMsg = error?.response?.data?.message || 'Xóa nông sản thất bại.';
          message.error(errMsg);
        }
      }
    });
  };

  // Cột Sản phẩm lẻ (Đồng bộ với Database)
  const productColumns = [
    { title: 'ID', dataIndex: 'productId', key: 'productId', width: 65, render: (id: number) => <Tag>#{id}</Tag> },
    { title: 'Tên nông sản', dataIndex: 'productName', key: 'productName', render: (text: string) => <b>{text}</b> },
    { 
      title: 'Danh mục', 
      dataIndex: ['category', 'categoryName'], 
      key: 'categoryName',
      render: (text: string, r: BackendProduct) => {
        if (r.status === 'Pending') {
          return <Tag color="gold">Chờ Admin phân loại</Tag>;
        }
        return <Tag color="blue">{text || 'Nông sản'}</Tag>;
      }
    },
    { 
      title: 'Hồ sơ Lô hàng & Truy xuất', 
      key: 'batchInfo',
      render: (_: any, r: BackendProduct) => {
        const batch = batches.find(b => b.productId === r.productId);
        if (batch) {
          return (
            <Tag color="cyan" style={{ fontSize: '11.5px', padding: '2px 8px' }}>
              Mã: <b>{batch.batchCode}</b> · Hái: {dayjs(batch.harvestDate).format('DD/MM/YYYY')}
            </Tag>
          );
        }
        return <Tag color="warning">Chưa có Lô hàng</Tag>;
      }
    },
    { 
      title: 'Giá bán sàn', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => <span style={{ color: '#d32f2f', fontWeight: 600 }}>{Number(val).toLocaleString('vi-VN')} đ</span>
    },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70 },
    { 
      title: 'Tồn kho', 
      dataIndex: 'availableStock', 
      key: 'availableStock',
      width: 85,
      render: (stk?: number, r?: BackendProduct) => `${stk || 0} ${r?.unit || 'kg'}`
    },
    { 
      title: 'Trạng thái duyệt', 
      dataIndex: 'status', 
      key: 'status',
      width: 140,
      render: (st: string) => {
        if (st === 'Active' || st === 'Approved') return <Tag color="green">ĐÃ DUYỆT (ĐANG BÁN)</Tag>;
        if (st === 'Pending') return <Tag color="orange">CHỜ DUYỆT (PENDING)</Tag>;
        return <Tag color="default">TẠM DỪNG</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 190,
      render: (_: any, r: BackendProduct) => {
        const batch = batches.find(b => b.productId === r.productId);
        return (
          <Space>
            <Button 
              size="small"
              icon={<SafetyCertificateOutlined />}
              style={{ color: '#2e7d32', borderColor: '#2e7d32' }}
              onClick={() => handleOpenTraceModal(r)}
            >
              {batch ? 'Sửa Lô' : '+ Lô hàng'}
            </Button>
            <Button 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(r.productId, r.productName)}
            >
              Xóa
            </Button>
          </Space>
        );
      }
    }
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
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, r: BackendProduct) => (
        <Button 
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(r.productId, r.productName)}
        >
          Xóa
        </Button>
      )
    }
  ];

  // Cột Lô hàng (Batches / Traceability từ CSDL thật)
  const lotColumns = [
    { 
      title: 'Mã Lô (Traceability)', 
      dataIndex: 'batchCode', 
      key: 'batchCode', 
      render: (t: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{t}</Tag> 
    },
    { 
      title: 'Nông sản', 
      key: 'productName',
      render: (_: any, r: BackendBatch) => <b>{r.product?.productName || `Nông sản #${r.productId}`}</b> 
    },
    { 
      title: 'Ngày thu hoạch', 
      dataIndex: 'harvestDate', 
      key: 'harvestDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY')
    },
    { 
      title: 'Hạn dùng (FEFO)', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY')
    },
    { 
      title: 'Sản lượng', 
      key: 'qty', 
      render: (_: any, r: BackendBatch) => `${r.initialQuantity} ${r.unit || 'kg'}`
    },
    { 
      title: 'Nông trại thu hoạch', 
      key: 'farm',
      render: (_: any, r: BackendBatch) => {
        const sup = suppliers.find(s => s.farm?.farmId === r.farmId);
        return <span>{sup?.farm?.farmName || `Vườn mã #${r.farmId || 1}`}</span>;
      }
    },
    { 
      title: 'Tình trạng', 
      key: 'status',
      render: (_: any, r: BackendBatch) => {
        const isExpired = dayjs().isAfter(dayjs(r.expiryDate), 'day');
        if (isExpired) return <Badge status="error" text="Hết hạn" />;
        const isNearExp = dayjs().add(3, 'day').isAfter(dayjs(r.expiryDate), 'day');
        if (isNearExp) return <Badge status="warning" text="Cận hạn" />;
        return <Badge status="success" text="Tươi mới" />;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, r: BackendBatch) => {
        const prod = products.find(p => p.productId === r.productId) || r.product;
        return (
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              if (prod) {
                handleOpenTraceModal(prod as BackendProduct, r);
              }
            }}
          >
            Chỉnh sửa Lô
          </Button>
        );
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
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>Làm mới</Button>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                    onClick={() => handleOpenTraceModal()}
                  >
                    Khai báo lô thu hoạch mới
                  </Button>
                </Space>
              }
            >
              <Alert 
                type="info" 
                showIcon 
                message="Dữ liệu Lô hàng &amp; Truy xuất Nguồn gốc Đồng bộ" 
                description="Mỗi lô hàng mang một mã truy xuất riêng biệt, được kết nối trực tiếp với trang Khách hàng (Web-Store) và mã QR trên bao bì sản phẩm. Nhà cung cấp có thể chỉnh sửa lại các thông số nếu phát hiện sai sót."
                style={{ marginBottom: 16, borderRadius: '8px' }}
              />
              <Table 
                columns={lotColumns} 
                dataSource={batches} 
                rowKey="batchId" 
                loading={loading}
                pagination={{ pageSize: 8 }} 
              />
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

      {/* MODAL: ĐĂNG KÝ SẢN PHẨM MỚI (BƯỚC 1/2: THÔNG TIN NÔNG SẢN) */}
      <Modal
        title="Đăng ký Nông sản Mới (Bước 1/2: Thông tin cơ bản)"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={580}
      >
        <Alert 
          type="info" 
          showIcon 
          message="Quy trình 2 bước khép kín dành cho Nhà Cung Cấp"
          description="Bước 1: Điền thông tin nông sản. Bước 2: Khai báo Lô hàng &amp; Nhật ký canh tác. Danh mục sản phẩm do Ban Quản Trị (Admin) trực tiếp kiểm định và phân loại chính thức khi phê duyệt lên sàn."
          style={{ marginBottom: 16 }}
        />
        <Form form={productForm} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item name="name" label="Tên nông sản" rules={[{ required: true, message: 'Vui lòng nhập tên nông sản!' }]}>
            <Input placeholder="Ví dụ: Mít Thái siêu sớm, Bông cải xanh Baby hữu cơ, Cà chua cherry..." />
          </Form.Item>
          {/* ĐÃ LOẠI BỎ CHỌN DANH MỤC - ADMIN SẼ PHÂN LOẠI KHI DUYỆT */}
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
            <Input.TextArea rows={3} placeholder="Mô tả giống cây, quy trình canh tác đạt chuẩn VietGAP/GlobalGAP..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsProductModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Tiếp tục: Khai báo Lô hàng &amp; Truy xuất (Bước 2/2) ➔
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: KHAI BÁO / CHỈNH SỬA LÔ THU HOẠCH & TRUY XUẤT NGUỒN GỐC (BƯỚC 2/2) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <span>
              {traceBatch 
                ? `Chỉnh Sửa Hồ Sơ Lô Hàng: ${traceProduct?.productName || ''}` 
                : `Bước 2: Khai Báo Lô Hàng & Truy Xuất Cho "${traceProduct?.productName || 'Nông sản'}"`}
            </span>
          </div>
        }
        open={isTraceModalOpen}
        onCancel={() => setIsTraceModalOpen(false)}
        onOk={handleSaveTrace}
        confirmLoading={traceLoading}
        okText={traceBatch ? "Lưu Cập Nhật Lô Hàng" : "Hoàn Tất Khai Báo & Gửi Phê Duyệt"}
        cancelText="Đóng"
        width={680}
      >
        <Alert 
          type="success"
          showIcon
          message="Hồ sơ truy xuất độc quyền cho từng đợt thu hoạch"
          description="Mỗi đợt thu hoạch mang mã lô và nhật ký canh tác riêng biệt. Dữ liệu này được kết nối trực tiếp đến trang Truy xuất nguồn gốc và mã QR trên bao bì cho khách hàng."
          style={{ marginTop: 12, marginBottom: 16 }}
        />

        <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
          <div>Nông sản: <b style={{ color: '#1b5e20' }}>{traceProduct?.productName || 'Chưa chọn'}</b> {traceProduct?.productId ? `(Mã SP: #${traceProduct.productId})` : ''}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
            Trạng thái hiện tại: <Tag color="gold">Chờ Admin duyệt &amp; phân loại danh mục</Tag>
          </div>
        </div>

        <Form form={traceForm} layout="vertical">
          {!traceProduct && (
            <Form.Item name="productId" label="Chọn Nông sản cần khai báo lô" rules={[{ required: true, message: 'Vui lòng chọn nông sản!' }]}>
              <Select placeholder="Chọn nông sản của bạn">
                {products.map(p => (
                  <Select.Option key={p.productId} value={p.productId}>{p.productName} (#{p.productId})</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="batchCode" label="Mã lô hàng truy xuất (Duy nhất)" rules={[{ required: true, message: 'Nhập mã lô' }]}>
                <Input placeholder="VD: LHN-20260925-001" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="farmId" label="Nông trại / Vườn thu hoạch" rules={[{ required: true, message: 'Chọn nông trại' }]}>
                <Select placeholder="Chọn nông trại">
                  {suppliers
                    .slice()
                    .sort((a, b) => {
                      const mySid = getActualSupplierId(currentUser);
                      const aIsMe = (a.supplierId === mySid) || (a.userId === currentUser?.userId);
                      const bIsMe = (b.supplierId === mySid) || (b.userId === currentUser?.userId);
                      if (aIsMe && !bIsMe) return -1;
                      if (!aIsMe && bIsMe) return 1;
                      return 0;
                    })
                    .map(s => {
                      const sid = s.supplierId || s.userId;
                      const f = s.farm;
                      const farmVal = f?.farmId || sid;
                      const mySid = getActualSupplierId(currentUser);
                      const isMine = (s.supplierId === mySid) || (s.userId === currentUser?.userId);
                      return (
                        <Select.Option key={farmVal} value={farmVal}>
                          {f?.farmName || `${s.fullName} Farm`} ({f?.province || 'Đà Lạt'}) {isMine ? '★ [Trang trại của bạn]' : ''}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="initialQuantity" label="Sản lượng đợt thu hoạch" rules={[{ required: true, message: 'Nhập sản lượng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Nhập đơn vị' }]}>
                <Input placeholder="kg, bắp, nải, hộp..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="harvestDate" label="Ngày thu hoạch thực tế" rules={[{ required: true, message: 'Chọn ngày thu hoạch' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hái" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="expiryDate" 
                label="Hạn sử dụng tốt nhất (FEFO)"
                dependencies={['harvestDate']}
                rules={[
                  { required: true, message: 'Chọn hạn sử dụng' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const harvest = getFieldValue('harvestDate');
                      if (!value || !harvest || value.isAfter(harvest, 'day')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hạn sử dụng phải sau ngày thu hoạch!'));
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn hạn dùng" />
              </Form.Item>
            </Col>
          </Row>

          {/* Live Preview 6 Chặng Canh Tác */}
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#135200', marginBottom: 8 }}>
              🌿 Minh bạch hành trình 6 chặng canh tác &amp; phân phối tự động:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '12px' }}>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>01. Nguồn giống:</b> Chuẩn hữu cơ F1
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>02. Canh tác IoT:</b> Nhật ký vi sinh
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>03. Thu hoạch:</b> Hái sương sớm
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>04. Kiểm định Lab:</b> ISO/IEC 17025
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>05. Vận chuyển:</b> Chuỗi lạnh FreshLock
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>06. Xuất kho:</b> Giao hỏa tốc FEFO
              </div>
            </div>
          </div>
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
