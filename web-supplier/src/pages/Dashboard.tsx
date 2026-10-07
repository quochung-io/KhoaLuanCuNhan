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
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../config/axiosClient';
import { Notifications as NotificationsComponent } from './Notifications';

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
  { key: '1', orderId: 'ORD-98421', items: 'Combo Gia ÄÃ¬nh Nhá» [Cáº£i bÃ³ xÃ´i, CÃ  rá»‘t baby, BÆ¡ 034]', customer: 'BÃ¹i Quá»‘c HÆ°ng', date: '25/08/2026', status: 'Pending' },
  { key: '2', orderId: 'ORD-98420', items: 'CÃ  rá»‘t baby (x2), Báº¯p cáº£i Má»™c ChÃ¢u (x1)', customer: 'LÃª VÄƒn C', date: '24/08/2026', status: 'Completed' },
  { key: '3', orderId: 'ORD-98418', items: 'Combo Thuáº§n Chay Sáº¡ch [Náº¥m Ä‘Ã¹i gÃ , Äáº­u hÅ© non, Háº¡t sen, Kale]', customer: 'Nguyá»…n Thá»‹ D', date: '23/08/2026', status: 'ReadyForShipper' },
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

  // States tÃ¬m kiáº¿m & bá»™ lá»c NÃ´ng sáº£n cá»§a NhÃ  cung cáº¥p
  const [supplierProdIdFilter, setSupplierProdIdFilter] = useState('');
  const [supplierProdNameFilter, setSupplierProdNameFilter] = useState('');
  const [supplierProdStatusFilter, setSupplierProdStatusFilter] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    if (supplierProdIdFilter.trim()) {
      if (!p.productId.toString().includes(supplierProdIdFilter.trim())) return false;
    }
    if (supplierProdNameFilter.trim()) {
      const q = supplierProdNameFilter.trim().toLowerCase();
      if (!p.productName.toLowerCase().includes(q)) return false;
    }
    if (supplierProdStatusFilter !== 'all') {
      if (p.status !== supplierProdStatusFilter) return false;
    }
    return true;
  });

  // States tÃ¬m kiáº¿m & bá»™ lá»c LÃ´ thu hoáº¡ch cá»§a NhÃ  cung cáº¥p
  const [supplierLotCodeFilter, setSupplierLotCodeFilter] = useState('');
  const [supplierLotProdFilter, setSupplierLotProdFilter] = useState('');
  const [supplierLotFefoFilter, setSupplierLotFefoFilter] = useState('all');

  const filteredBatches = batches.filter(b => {
    if (supplierLotCodeFilter.trim()) {
      const q = supplierLotCodeFilter.trim().toLowerCase();
      const matchId = b.batchId.toString().includes(q);
      const matchCode = (b.batchCode || '').toLowerCase().includes(q);
      if (!matchId && !matchCode) return false;
    }
    if (supplierLotProdFilter.trim()) {
      const q = supplierLotProdFilter.trim().toLowerCase();
      const pName = (b.product?.productName || '').toLowerCase();
      if (!pName.includes(q)) return false;
    }
    if (supplierLotFefoFilter !== 'all') {
      const isExpired = dayjs().isAfter(dayjs(b.expiryDate), 'day');
      const isNearExp = dayjs().add(3, 'day').isAfter(dayjs(b.expiryDate), 'day');
      if (supplierLotFefoFilter === 'expired' && !isExpired) return false;
      if (supplierLotFefoFilter === 'warning' && (isExpired || !isNearExp)) return false;
      if (supplierLotFefoFilter === 'valid' && isNearExp) return false;
    }
    return true;
  });

  // States tÃ¬m kiáº¿m & bá»™ lá»c ÄÆ¡n hÃ ng cá»§a NhÃ  cung cáº¥p
  const [supplierOrderIdFilter, setSupplierOrderIdFilter] = useState('');
  const [supplierOrderCustomerFilter, setSupplierOrderCustomerFilter] = useState('');
  const [supplierOrderStatusFilter, setSupplierOrderStatusFilter] = useState('all');

  const filteredSupplierOrders = orders.filter(o => {
    if (supplierOrderIdFilter.trim()) {
      if (!o.orderId.toLowerCase().includes(supplierOrderIdFilter.trim().toLowerCase())) return false;
    }
    if (supplierOrderCustomerFilter.trim()) {
      if (!o.customer.toLowerCase().includes(supplierOrderCustomerFilter.trim().toLowerCase())) return false;
    }
    if (supplierOrderStatusFilter !== 'all') {
      if (o.status !== supplierOrderStatusFilter) return false;
    }
    return true;
  });

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

  // Helper trÃ­ch xuáº¥t sá»‘ slot tá»± chá»n cá»§a combo
  const getComboSlots = (prod: BackendProduct) => {
    if (prod.description) {
      const match = prod.description.match(/(\d+)\s*(mÃ³n|loáº¡i)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.unit) {
      const match = prod.unit.match(/(\d+)\s*(mÃ³n|loáº¡i)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.productName?.includes('Lá»›n')) return 5;
    if (prod.productName?.includes('Thuáº§n Chay')) return 4;
    return 3;
  };

  // Helper Ã¡nh xáº¡ UserId sang SupplierId tÆ°Æ¡ng á»©ng trong CSDL
  const getActualSupplierId = (user: any, supList?: BackendSupplier[]) => {
    if (user?.supplierId) return user.supplierId;
    const list = supList && supList.length > 0 ? supList : suppliers;
    const found = list.find(s => s.userId === user?.userId);
    if (found?.supplierId) return found.supplierId;
    if (user?.userId === 2) return 1; // HTX NÃ´ng Sáº£n ÄÃ  Láº¡t: UserId 2 -> SupplierId 1
    if (user?.userId === 3) return 2; // HTX Rau Sáº¡ch Miá»n TÃ¢y: UserId 3 -> SupplierId 2
    if (user?.userId === 4) return 3; // HTX TrÃ¡i CÃ¢y Viá»‡t: UserId 4 -> SupplierId 3
    if (user?.userId === 23) return 4; // HTX NÃ´ng Nghiá»‡p An PhÃº: UserId 23 -> SupplierId 4
    if (user?.userId === 29) return 9; // @Password123: UserId 29 -> SupplierId 9
    return user?.userId || 1;
  };

  // Táº£i dá»¯ liá»‡u thá»±c tá»« API backend Ä‘á»“ng bá»™ vá»›i database
  const loadData = async (userObj?: any) => {
    const user = userObj || currentUser;
    setLoading(true);
    try {
      // 1. Táº£i danh sÃ¡ch nhÃ  cung cáº¥p Ä‘á»ƒ Ä‘á»“ng bá»™ SupplierId & FarmId
      const supRes = await axiosClient.get('/users/suppliers').catch(() => ({ data: [] }));
      const allSups: BackendSupplier[] = supRes.data || [];
      setSuppliers(allSups);

      // Tra cá»©u SupplierId vÃ  FarmId chÃ­nh xÃ¡c tá»« danh sÃ¡ch Ä‘á»‘i tÃ¡c
      const matchedSup = allSups.find(s => s.userId === user?.userId);
      const mySupplierId = user?.supplierId || matchedSup?.supplierId || getActualSupplierId(user, allSups);
      const myFarmId = user?.farmId || matchedSup?.farm?.farmId;

      // Cáº­p nháº­t láº¡i user trong localStorage vÃ  state náº¿u thiáº¿u thÃ´ng tin
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
      
      // Äá»“ng bá»™ phÃ¢n loáº¡i sáº£n pháº©m láº» vÃ  combo tá»± chá»n tá»« Database
      setProducts(allList.filter(p => p.categoryId !== 5));
      setCombos(allList.filter(p => p.categoryId === 5));
    } catch (error) {
      message.error('KhÃ´ng thá»ƒ Ä‘á»“ng bá»™ danh sÃ¡ch sáº£n pháº©m / combo tá»« mÃ¡y chá»§.');
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
      title: 'ÄÄƒng xuáº¥t khá»i KÃªnh Äá»‘i TÃ¡c',
      content: 'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n Ä‘Äƒng xuáº¥t khá»i phiÃªn lÃ m viá»‡c nÃ y?',
      okText: 'ÄÄƒng xuáº¥t',
      cancelText: 'Há»§y',
      okType: 'danger',
      onOk: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('supplier_user');
        message.success('ÄÃ£ Ä‘Äƒng xuáº¥t thÃ nh cÃ´ng!');
        navigate('/login');
      }
    });
  };

  // Má»Ÿ Modal Khai bÃ¡o / Chá»‰nh sá»­a LÃ´ hÃ ng & Truy xuáº¥t nguá»“n gá»‘c
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
        message.error('Vui lÃ²ng chá»n nÃ´ng sáº£n cáº§n khai bÃ¡o lÃ´!');
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
        message.success(`ÄÃ£ cáº­p nháº­t thÃ nh cÃ´ng há»“ sÆ¡ lÃ´ hÃ ng "${values.batchCode}"!`);
      } else {
        await axiosClient.post('/productbatches', payload);
        message.success(`Khai bÃ¡o lÃ´ hÃ ng "${values.batchCode}" thÃ nh cÃ´ng! ÄÃ£ gá»­i há»“ sÆ¡ tá»›i Ban Quáº£n Trá»‹ Ä‘á»ƒ phÃ¢n loáº¡i danh má»¥c & phÃª duyá»‡t.`);
      }

      setIsTraceModalOpen(false);
      await loadData();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('KhÃ´ng thá»ƒ lÆ°u há»“ sÆ¡ lÃ´ hÃ ng. Vui lÃ²ng kiá»ƒm tra láº¡i!');
      }
    } finally {
      setTraceLoading(false);
    }
  };

  // ThÃªm nÃ´ng sáº£n láº» má»›i (LÆ°u trá»±c tiáº¿p vÃ o Database vá»›i tráº¡ng thÃ¡i Pending & tá»± Ä‘á»™ng má»Ÿ BÆ°á»›c 2)
  const handleAddProduct = async (values: any) => {
    const mySupplierId = getActualSupplierId(currentUser);
    try {
      const res = await axiosClient.post('/products', {
        productName: values.name,
        categoryId: 1, // Máº·c Ä‘á»‹nh táº¡m thá»i; Ban Quáº£n Trá»‹ (Admin) sáº½ phÃ¢n loáº¡i chuáº©n hÃ³a khi phÃª duyá»‡t
        supplierId: mySupplierId,
        price: values.price,
        unit: values.unit || 'kg',
        status: 'Pending',
        description: values.description || ''
      });
      message.success('ÄÃ£ lÆ°u thÃ´ng tin nÃ´ng sáº£n táº¡m thá»i! Äang chuyá»ƒn sang BÆ°á»›c 2: Khai bÃ¡o LÃ´ hÃ ng & Truy xuáº¥t nguá»“n gá»‘c.');
      setIsProductModalOpen(false);
      productForm.resetFields();
      await loadData();

      const created = res.data;
      handleOpenTraceModal(created);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'ÄÄƒng kÃ½ nÃ´ng sáº£n tháº¥t báº¡i.';
      message.error(errMsg);
    }
  };

  // Äá» xuáº¥t GÃ³i Combo Tá»± Chá»n Má»›i (LÆ°u trá»±c tiáº¿p vÃ o Database CategoryId = 5, Status = Pending)
  const handleAddCombo = async (values: any) => {
    const mySupplierId = getActualSupplierId(currentUser);
    const slots = values.slots || 3;
    const comboType = values.comboType || 'periodic';
    const unit = comboType === 'program' 
      ? 'GÃ³i Æ¯u ÄÃ£i' 
      : (values.cycle === 'ThÃ¡ng' ? 'GÃ³i/ThÃ¡ng' : 'GÃ³i/Tuáº§n');

    let startDate: string | null = null;
    let endDate: string | null = null;
    if (values.dateRange && values.dateRange.length === 2) {
      startDate = values.dateRange[0].toISOString();
      endDate = values.dateRange[1].toISOString();
    }

    try {
      await axiosClient.post('/products', {
        productName: values.name,
        categoryId: 5, // Cá»‘ Ä‘á»‹nh danh má»¥c 5 = Combo NÃ´ng Sáº£n Äá»‹nh Ká»³ / ChÆ°Æ¡ng trÃ¬nh
        supplierId: mySupplierId,
        price: values.price,
        unit: unit,
        status: 'Pending', // Chá» Admin duyá»‡t
        description: `[Tá»± chá»n ${slots} loáº¡i nÃ´ng sáº£n] ${values.desc || ''}`,
        comboType: comboType,
        maxSlots: slots,
        startDate: startDate,
        endDate: endDate,
        originalPrice: values.originalPrice || values.price,
        discountPercent: values.discountPercent || 0,
        programLimit: values.programLimit || null,
        soldQuantity: 0
      });
      message.success('ÄÃ£ gá»­i Ä‘á» xuáº¥t GÃ³i Combo má»›i! Äang chá» Ban Quáº£n Trá»‹ xÃ©t duyá»‡t.');
      setIsComboModalOpen(false);
      comboForm.resetFields();
      loadData();
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Äá» xuáº¥t gÃ³i combo tháº¥t báº¡i.';
      message.error(errMsg);
    }
  };

  // XÃ³a nÃ´ng sáº£n láº» hoáº·c combo do chÃ­nh nhÃ  cung cáº¥p táº¡o
  const handleDeleteProduct = (id: number, name: string) => {
    Modal.confirm({
      title: 'XÃ¡c nháº­n xÃ³a nÃ´ng sáº£n',
      content: `Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a nÃ´ng sáº£n "${name}" (#${id})? ToÃ n bá»™ há»“ sÆ¡ lÃ´ hÃ ng liÃªn quan cÅ©ng sáº½ Ä‘Æ°á»£c xÃ³a khá»i há»‡ thá»‘ng.`,
      okText: 'XÃ³a',
      cancelText: 'Há»§y',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await axiosClient.delete(`/products/${id}`);
          message.success(res.data?.message || 'ÄÃ£ xÃ³a nÃ´ng sáº£n thÃ nh cÃ´ng.');
          await loadData();
        } catch (error: any) {
          const errMsg = error?.response?.data?.message || 'XÃ³a nÃ´ng sáº£n tháº¥t báº¡i.';
          message.error(errMsg);
        }
      }
    });
  };

  // Cá»™t Sáº£n pháº©m láº» (Äá»“ng bá»™ vá»›i Database)
  const productColumns = [
    { 
      title: 'ID', 
      dataIndex: 'productId', 
      key: 'productId', 
      width: 75, 
      sorter: (a: BackendProduct, b: BackendProduct) => a.productId - b.productId,
      defaultSortOrder: 'descend' as const,
      render: (id: number) => <Tag color="blue">#{id}</Tag> 
    },
    { 
      title: 'TÃªn nÃ´ng sáº£n', 
      dataIndex: 'productName', 
      key: 'productName', 
      sorter: (a: BackendProduct, b: BackendProduct) => a.productName.localeCompare(b.productName),
      render: (text: string) => <b>{text}</b> 
    },
    { 
      title: 'Danh má»¥c', 
      dataIndex: ['category', 'categoryName'], 
      key: 'categoryName',
      render: (text: string, r: BackendProduct) => {
        if (r.status === 'Pending') {
          return <Tag color="gold">Chá» Admin phÃ¢n loáº¡i</Tag>;
        }
        return <Tag color="blue">{text || 'NÃ´ng sáº£n'}</Tag>;
      }
    },
    { 
      title: 'Há»“ sÆ¡ LÃ´ hÃ ng & Truy xuáº¥t', 
      key: 'batchInfo',
      render: (_: any, r: BackendProduct) => {
        const batch = batches.find(b => b.productId === r.productId);
        if (batch) {
          return (
            <Tag color="cyan" style={{ fontSize: '11.5px', padding: '2px 8px' }}>
              MÃ£: <b>{batch.batchCode}</b> Â· HÃ¡i: {dayjs(batch.harvestDate).format('DD/MM/YYYY')}
            </Tag>
          );
        }
        return <Tag color="warning">ChÆ°a cÃ³ LÃ´ hÃ ng</Tag>;
      }
    },
    { 
      title: 'GiÃ¡ bÃ¡n sÃ n', 
      dataIndex: 'price', 
      key: 'price',
      sorter: (a: BackendProduct, b: BackendProduct) => a.price - b.price,
      render: (val: number) => <span style={{ color: '#d32f2f', fontWeight: 600 }}>{Number(val).toLocaleString('vi-VN')} Ä‘</span>
    },
    { title: 'ÄVT', dataIndex: 'unit', key: 'unit', width: 70 },
    { 
      title: 'Tá»“n kho', 
      dataIndex: 'availableStock', 
      key: 'availableStock',
      width: 85,
      render: (stk?: number, r?: BackendProduct) => `${stk || 0} ${r?.unit || 'kg'}`
    },
    { 
      title: 'Tráº¡ng thÃ¡i duyá»‡t', 
      dataIndex: 'status', 
      key: 'status',
      width: 140,
      render: (st: string) => {
        if (st === 'Active' || st === 'Approved') return <Tag color="green">ÄÃƒ DUYá»†T (ÄANG BÃN)</Tag>;
        if (st === 'Pending') return <Tag color="orange">CHá»œ DUYá»†T (PENDING)</Tag>;
        return <Tag color="default">Táº M Dá»ªNG</Tag>;
      }
    },
    {
      title: 'Thao tÃ¡c',
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
              {batch ? 'Sá»­a LÃ´' : '+ LÃ´ hÃ ng'}
            </Button>
            <Button 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(r.productId, r.productName)}
            >
              XÃ³a
            </Button>
          </Space>
        );
      }
    }
  ];

  // Cá»™t GÃ³i Combo tá»± chá»n (Äá»“ng bá»™ 100% vá»›i Admin vÃ  Database)
  const comboColumns = [
    { title: 'MÃ£ GÃ³i', dataIndex: 'productId', key: 'productId', width: 85, render: (id: number) => <Tag color="geekblue">#{id}</Tag> },
    { 
      title: 'PhÃ¢n loáº¡i', 
      dataIndex: 'comboType', 
      key: 'comboType', 
      width: 140,
      render: (t?: string) => {
        if (t === 'program') {
          return <Tag color="magenta" style={{ fontWeight: 600 }}>ðŸŽ Theo chÆ°Æ¡ng trÃ¬nh</Tag>;
        }
        return <Tag color="blue" style={{ fontWeight: 600 }}>ðŸ“… GÃ³i Ä‘á»‹nh ká»³</Tag>;
      }
    },
    { 
      title: 'TÃªn gÃ³i Combo Tá»± Chá»n', 
      dataIndex: 'productName', 
      key: 'productName', 
      render: (text: string, r: BackendProduct) => (
        <div>
          <b style={{ color: '#1b5e20', fontSize: '13.5px' }}>{text}</b>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{r.description}</div>
          {r.comboType === 'program' && (
            <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#d46b08', background: '#fff7e6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
              â³ {r.startDate && r.endDate ? `${r.startDate.substring(0, 10)} - ${r.endDate.substring(0, 10)}` : 'KhÃ´ng thá»i háº¡n'}
              {r.programLimit ? ` â€¢ Suáº¥t: ${r.soldQuantity || 0}/${r.programLimit}` : ''}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Sá»‘ mÃ³n tá»± chá»n', 
      key: 'slots', 
      width: 130,
      render: (_: any, r: BackendProduct) => {
        const slots = getComboSlots(r);
        return <Tag color="cyan" style={{ fontWeight: 700 }}>ðŸ¥— {slots} mÃ³n</Tag>;
      }
    },
    { 
      title: 'Chu ká»³', 
      dataIndex: 'unit', 
      key: 'unit', 
      width: 100,
      render: (c: string, r: BackendProduct) => {
        if (r.comboType === 'program') return <Tag color="volcano">Æ¯u Ä‘Ã£i</Tag>;
        return <Tag color={c?.includes('ThÃ¡ng') ? 'purple' : 'blue'}>{c || 'GÃ³i/Tuáº§n'}</Tag>;
      }
    },
    { 
      title: 'GiÃ¡ bÃ¡n sÃ n', 
      dataIndex: 'price', 
      key: 'price', 
      width: 130,
      render: (p: number, r: BackendProduct) => (
        <div>
          <b style={{ color: '#d32f2f' }}>{Number(p).toLocaleString('vi-VN')} Ä‘</b>
          {r.comboType === 'program' && r.originalPrice && r.originalPrice > p && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              <span style={{ textDecoration: 'line-through' }}>{r.originalPrice.toLocaleString('vi-VN')} Ä‘</span>
              {r.discountPercent ? <Tag color="volcano" style={{ marginLeft: 4, fontSize: '10px', padding: '0 2px' }}>-{r.discountPercent}%</Tag> : null}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Tráº¡ng thÃ¡i sÃ n', 
      dataIndex: 'status', 
      key: 'status',
      width: 160,
      render: (st: string) => {
        if (st === 'Active' || st === 'Approved') return <Tag color="green">ÄÃƒ DUYá»†T (ÄANG BÃN)</Tag>;
        if (st === 'Pending') return <Tag color="gold">CHá»œ ADMIN DUYá»†T (PENDING)</Tag>;
        return <Tag color="default">Táº M Dá»ªNG</Tag>;
      }
    },
    {
      title: 'Thao tÃ¡c',
      key: 'actions',
      width: 100,
      render: (_: any, r: BackendProduct) => (
        <Button 
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(r.productId, r.productName)}
        >
          XÃ³a
        </Button>
      )
    }
  ];

  // Cá»™t LÃ´ hÃ ng (Batches / Traceability tá»« CSDL tháº­t)
  const lotColumns = [
    { 
      title: 'MÃ£ LÃ´ (Traceability)', 
      dataIndex: 'batchCode', 
      key: 'batchCode', 
      render: (t: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{t}</Tag> 
    },
    { 
      title: 'NÃ´ng sáº£n', 
      key: 'productName',
      render: (_: any, r: BackendBatch) => <b>{r.product?.productName || `NÃ´ng sáº£n #${r.productId}`}</b> 
    },
    { 
      title: 'NgÃ y thu hoáº¡ch', 
      dataIndex: 'harvestDate', 
      key: 'harvestDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY')
    },
    { 
      title: 'Háº¡n dÃ¹ng (FEFO)', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      render: (d: string) => dayjs(d).format('DD/MM/YYYY')
    },
    { 
      title: 'Sáº£n lÆ°á»£ng', 
      key: 'qty', 
      render: (_: any, r: BackendBatch) => `${r.initialQuantity} ${r.unit || 'kg'}`
    },
    { 
      title: 'NÃ´ng tráº¡i thu hoáº¡ch', 
      key: 'farm',
      render: (_: any, r: BackendBatch) => {
        const sup = suppliers.find(s => s.farm?.farmId === r.farmId);
        return <span>{sup?.farm?.farmName || `VÆ°á»n mÃ£ #${r.farmId || 1}`}</span>;
      }
    },
    { 
      title: 'TÃ¬nh tráº¡ng', 
      key: 'status',
      render: (_: any, r: BackendBatch) => {
        const isExpired = dayjs().isAfter(dayjs(r.expiryDate), 'day');
        if (isExpired) return <Badge status="error" text="Háº¿t háº¡n" />;
        const isNearExp = dayjs().add(3, 'day').isAfter(dayjs(r.expiryDate), 'day');
        if (isNearExp) return <Badge status="warning" text="Cáº­n háº¡n" />;
        return <Badge status="success" text="TÆ°Æ¡i má»›i" />;
      }
    },
    {
      title: 'Thao tÃ¡c',
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
            Chá»‰nh sá»­a LÃ´
          </Button>
        );
      }
    }
  ];

  // Cá»™t ÄÆ¡n hÃ ng cáº§n Ä‘Ã³ng gÃ³i
  const orderColumns = [
    { 
      title: 'MÃ£ Ä‘Æ¡n', 
      dataIndex: 'orderId', 
      key: 'orderId',
      sorter: (a: any, b: any) => a.orderId.localeCompare(b.orderId),
      render: (id: string) => <Tag color="geekblue" style={{ fontWeight: 600 }}>{id}</Tag>
    },
    { 
      title: 'KhÃ¡ch hÃ ng', 
      dataIndex: 'customer', 
      key: 'customer',
      sorter: (a: any, b: any) => a.customer.localeCompare(b.customer),
      render: (t: string) => <b>{t}</b>
    },
    { title: 'Sáº£n pháº©m Ä‘áº·t', dataIndex: 'items', key: 'items' },
    { 
      title: 'NgÃ y Ä‘áº·t', 
      dataIndex: 'date', 
      key: 'date',
      sorter: (a: any, b: any) => a.date.localeCompare(b.date)
    },
    { 
      title: 'Tiáº¿n Ä‘á»™', 
      dataIndex: 'status', 
      key: 'status',
      render: (st: string) => {
        if (st === 'Pending') return <Tag color="gold">Chá» hÃ¡i &amp; Ä‘Ã³ng gÃ³i</Tag>;
        if (st === 'ReadyForShipper') return <Tag color="blue">ÄÃ£ giao Shipper</Tag>;
        return <Tag color="green">HoÃ n táº¥t</Tag>;
      }
    },
    {
      title: 'Thao tÃ¡c',
      key: 'action',
      render: (_: any, record: any) => (
        record.status === 'Pending' ? (
          <Button 
            size="small" 
            type="primary" 
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => {
              setOrders(orders.map(o => o.key === record.key ? { ...o, status: 'ReadyForShipper' } : o));
              message.success(`ÄÃ£ chuáº©n bá»‹ xong hÃ ng cho Ä‘Æ¡n ${record.orderId}`);
            }}
          >
            ÄÃ£ Ä‘Ã³ng gÃ³i
          </Button>
        ) : <span style={{ color: '#888' }}>-</span>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} style={{ background: '#214d23' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold', borderBottom: '1px solid #2e6931', padding: '0 12px', textAlign: 'center' }}>
          ðŸŒ¿ {currentUser?.fullName || 'Há»¢P TÃC XÃƒ Äá»I TÃC'}
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
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tá»•ng quan gian hÃ ng' },
            { key: 'products', icon: <ShoppingOutlined />, label: `NÃ´ng sáº£n láº» (${products.length})` },
            { key: 'combos', icon: <AppstoreAddOutlined />, label: `GÃ³i Combo tá»± chá»n (${combos.length})` },
            { key: 'lots', icon: <BarcodeOutlined />, label: 'LÃ´ hÃ ng & Truy xuáº¥t' },
            { key: 'orders', icon: <OrderedListOutlined />, label: 'ÄÆ¡n hÃ ng Ä‘Ã³ng gÃ³i' },
            { key: 'notifications', icon: <AlertOutlined />, label: 'Gửi Thông Báo CSKH' },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined style={{ color: '#ff7875' }} />, label: <span style={{ color: '#ff7875' }}>ÄÄƒng xuáº¥t</span> }
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div style={{ fontSize: 16, fontWeight: '600', color: '#214d23' }}>
            ðŸŒ¾ Cá»”NG THÃ”NG TIN Äá»I TÃC CUNG á»¨NG NÃ”NG Sáº¢N
          </div>
          <Space size="middle">
            <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>
              LÃ m má»›i dá»¯ liá»‡u
            </Button>
            <Tag color="success" style={{ padding: '4px 10px', fontSize: 13 }}>
              âœ“ Äá»I TÃC CHÃNH THá»¨C
            </Tag>
            <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
            <span style={{ fontWeight: 500 }}>{currentUser?.fullName || 'NhÃ  cung cáº¥p'}</span>
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              title="ÄÄƒng xuáº¥t"
            >
              ÄÄƒng xuáº¥t
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: '16px 24px' }}>
          <Breadcrumb style={{ margin: '8px 0 16px 0' }} items={[
            { title: <HomeOutlined /> },
            { title: 'NhÃ  cung cáº¥p' },
            { title: currentMenu.toUpperCase() }
          ]} />

          {/* VIEW: DASHBOARD */}
          {currentMenu === 'dashboard' && (
            <div>
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic title="NÃ´ng sáº£n láº» Ä‘ang bÃ¡n" value={products.filter(p => p.status === 'Active' || p.status === 'Approved').length} prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="GÃ³i Combo tá»± chá»n" value={combos.length} prefix={<AppstoreAddOutlined style={{ color: '#1890ff' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="ÄÆ¡n cáº§n Ä‘Ã³ng gÃ³i ngay" value={orders.filter(o => o.status === 'Pending').length} prefix={<AlertOutlined style={{ color: '#faad14' }} />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Tá»· lá»‡ giao Ä‘Ãºng háº¡n" value={98.5} precision={1} suffix="%" prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={14}>
                  <Card 
                    title="ðŸ“¦ ÄÆ¡n hÃ ng cáº§n Ä‘iá»u phá»‘i Ä‘Ã³ng gÃ³i" 
                    extra={<Tag color="gold">{orders.filter(o => o.status === 'Pending').length} Ä‘Æ¡n Ä‘ang chá»</Tag>}
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
                    title="ðŸ¥— GÃ³i Combo Äang Má»Ÿ BÃ¡n TrÃªn SÃ n"
                    extra={<Button type="link" onClick={() => setCurrentMenu('combos')}>Xem táº¥t cáº£</Button>}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {combos.slice(0, 3).map(c => (
                        <div key={c.productId} style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#166534', fontSize: '13px' }}>{c.productName}</div>
                            <div style={{ fontSize: '11.5px', color: '#666', marginTop: '2px' }}>
                              Tá»± chá»n {getComboSlots(c)} mÃ³n â€¢ {c.unit}
                            </div>
                          </div>
                          <Tag color="green">{Number(c.price).toLocaleString('vi-VN')} Ä‘</Tag>
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
                  <span>Danh sÃ¡ch NÃ´ng sáº£n Láº» cá»§a Há»£p tÃ¡c xÃ£ (Äá»“ng bá»™ Database)</span>
                </div>
              }
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>LÃ m má»›i</Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => setIsProductModalOpen(true)}>
                    ÄÄƒng kÃ½ nÃ´ng sáº£n má»›i
                  </Button>
                </Space>
              }
            >
              {/* KHUNG TÃŒM KIáº¾M NÃ”NG Sáº¢N */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={12} md={5}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>MÃ£ ID:</div>
                    <Input 
                      placeholder="Nháº­p ID (VD: 922)..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierProdIdFilter} 
                      onChange={e => setSupplierProdIdFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={9}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>TÃªn nÃ´ng sáº£n:</div>
                    <Input 
                      placeholder="TÃ¬m theo tÃªn nÃ´ng sáº£n..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierProdNameFilter} 
                      onChange={e => setSupplierProdNameFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Tráº¡ng thÃ¡i duyá»‡t:</div>
                    <Select 
                      style={{ width: '100%' }} 
                      value={supplierProdStatusFilter} 
                      onChange={val => setSupplierProdStatusFilter(val)}
                    >
                      <Select.Option value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</Select.Option>
                      <Select.Option value="Active">ÄÃ£ duyá»‡t (Active)</Select.Option>
                      <Select.Option value="Pending">Chá» duyá»‡t (Pending)</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => { setSupplierProdIdFilter(''); setSupplierProdNameFilter(''); setSupplierProdStatusFilter('all'); }}
                      style={{ width: '100%' }}
                    >
                      Äáº·t láº¡i
                    </Button>
                  </Col>
                </Row>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  TÃ¬m tháº¥y: <b style={{ color: '#16a34a' }}>{filteredProducts.length}</b> / {products.length} nÃ´ng sáº£n
                  {(supplierProdIdFilter.trim() || supplierProdNameFilter.trim() || supplierProdStatusFilter !== 'all') && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>Äang Ã¡p dá»¥ng bá»™ lá»c</Tag>
                  )}
                </div>
              </div>

              <Table 
                columns={productColumns} 
                dataSource={filteredProducts} 
                rowKey="productId"
                loading={loading}
                pagination={{ pageSize: 8, showTotal: total => `Tá»•ng ${total} nÃ´ng sáº£n` }}
              />
            </Card>
          )}

          {/* VIEW: COMBOS */}
          {currentMenu === 'combos' && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AppstoreAddOutlined style={{ color: '#1890ff' }} />
                  <span>GÃ³i Combo NÃ´ng Sáº£n Tá»± Chá»n (Dá»¯ liá»‡u thá»±c Ä‘á»“ng bá»™ vá»›i Admin)</span>
                </div>
              }
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>LÃ m má»›i</Button>
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} onClick={() => setIsComboModalOpen(true)}>
                    Äá» xuáº¥t GÃ³i Combo Má»›i
                  </Button>
                </Space>
              }
            >
              <Alert 
                type="info" 
                showIcon 
                message="Quy Ä‘á»‹nh GÃ³i Combo Tá»± Chá»n &amp; Äá»“ng bá»™ Database" 
                description="Táº¥t cáº£ cÃ¡c mÃ³n nÃ´ng sáº£n trong má»™t gÃ³i Combo báº¯t buá»™c pháº£i do DUY NHáº¤T má»™t NhÃ  Cung Cáº¥p / Há»£p TÃ¡c XÃ£ chuáº©n bá»‹ Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh Ä‘á»“ng bá»™ khi thu hoáº¡ch vÃ  váº­n chuyá»ƒn xe láº¡nh. GÃ³i do HTX Ä‘á» xuáº¥t táº¡i Ä‘Ã¢y sáº½ Ä‘Æ°á»£c lÆ°u trá»±c tiáº¿p vÃ o há»‡ thá»‘ng vá»›i tráº¡ng thÃ¡i Chá» duyá»‡t (Pending). Ban Quáº£n Trá»‹ xem xÃ©t vÃ  phÃª duyá»‡t trÃªn Web-Admin trÆ°á»›c khi má»Ÿ bÃ¡n chÃ­nh thá»©c cho ngÆ°á»i tiÃªu dÃ¹ng."
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
              title="Quáº£n lÃ½ LÃ´ thu hoáº¡ch &amp; Dá»¯ liá»‡u Truy xuáº¥t Nguá»“n gá»‘c" 
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => loadData()} loading={loading}>LÃ m má»›i</Button>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                    onClick={() => handleOpenTraceModal()}
                  >
                    Khai bÃ¡o lÃ´ thu hoáº¡ch má»›i
                  </Button>
                </Space>
              }
            >
              <Alert 
                type="info" 
                showIcon 
                message="Dá»¯ liá»‡u LÃ´ hÃ ng &amp; Truy xuáº¥t Nguá»“n gá»‘c Äá»“ng bá»™" 
                description="Má»—i lÃ´ hÃ ng mang má»™t mÃ£ truy xuáº¥t riÃªng biá»‡t, Ä‘Æ°á»£c káº¿t ná»‘i trá»±c tiáº¿p vá»›i trang KhÃ¡ch hÃ ng (Web-Store) vÃ  mÃ£ QR trÃªn bao bÃ¬ sáº£n pháº©m. NhÃ  cung cáº¥p cÃ³ thá»ƒ chá»‰nh sá»­a láº¡i cÃ¡c thÃ´ng sá»‘ náº¿u phÃ¡t hiá»‡n sai sÃ³t."
                style={{ marginBottom: 16, borderRadius: '8px' }}
              />
              {/* KHUNG TÃŒM KIáº¾M LÃ” THU HOáº CH */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={12} md={5}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>MÃ£ LÃ´ / ID LÃ´:</div>
                    <Input 
                      placeholder="Nháº­p mÃ£ lÃ´ hoáº·c ID..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierLotCodeFilter} 
                      onChange={e => setSupplierLotCodeFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={9}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>TÃªn nÃ´ng sáº£n:</div>
                    <Input 
                      placeholder="TÃ¬m theo tÃªn nÃ´ng sáº£n..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierLotProdFilter} 
                      onChange={e => setSupplierLotProdFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>TÃ¬nh tráº¡ng háº¡n dÃ¹ng (FEFO):</div>
                    <Select 
                      style={{ width: '100%' }} 
                      value={supplierLotFefoFilter} 
                      onChange={val => setSupplierLotFefoFilter(val)}
                    >
                      <Select.Option value="all">Táº¥t cáº£ háº¡n dÃ¹ng</Select.Option>
                      <Select.Option value="valid">ðŸŸ¢ CÃ²n háº¡n an toÃ n</Select.Option>
                      <Select.Option value="warning">ðŸŸ  Cáº­n háº¡n (â‰¤ 3 ngÃ y)</Select.Option>
                      <Select.Option value="expired">ðŸ”´ ÄÃ£ háº¿t háº¡n</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => { setSupplierLotCodeFilter(''); setSupplierLotProdFilter(''); setSupplierLotFefoFilter('all'); }}
                      style={{ width: '100%' }}
                    >
                      Äáº·t láº¡i
                    </Button>
                  </Col>
                </Row>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  TÃ¬m tháº¥y: <b style={{ color: '#16a34a' }}>{filteredBatches.length}</b> / {batches.length} lÃ´ thu hoáº¡ch
                  {(supplierLotCodeFilter.trim() || supplierLotProdFilter.trim() || supplierLotFefoFilter !== 'all') && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>Äang Ã¡p dá»¥ng bá»™ lá»c</Tag>
                  )}
                </div>
              </div>

              <Table 
                columns={lotColumns} 
                dataSource={filteredBatches} 
                rowKey="batchId" 
                loading={loading}
                pagination={{ pageSize: 8, showTotal: total => `Tá»•ng ${total} lÃ´ thu hoáº¡ch` }} 
              />
            </Card>
          )}

          {/* VIEW: ORDERS */}
          {currentMenu === 'orders' && (
            <Card title="Danh sÃ¡ch ÄÆ¡n hÃ ng cáº§n Ä‘Ã³ng gÃ³i & Giao Shipper">
              {/* KHUNG TÃŒM KIáº¾M ÄÆ N HÃ€NG */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>MÃ£ Ä‘Æ¡n hÃ ng:</div>
                    <Input 
                      placeholder="TÃ¬m theo mÃ£ Ä‘Æ¡n..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierOrderIdFilter} 
                      onChange={e => setSupplierOrderIdFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>KhÃ¡ch hÃ ng:</div>
                    <Input 
                      placeholder="TÃ¬m theo tÃªn khÃ¡ch..." 
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} 
                      allowClear 
                      value={supplierOrderCustomerFilter} 
                      onChange={e => setSupplierOrderCustomerFilter(e.target.value)} 
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Tiáº¿n Ä‘á»™:</div>
                    <Select 
                      style={{ width: '100%' }} 
                      value={supplierOrderStatusFilter} 
                      onChange={val => setSupplierOrderStatusFilter(val)}
                    >
                      <Select.Option value="all">Táº¥t cáº£ tiáº¿n Ä‘á»™</Select.Option>
                      <Select.Option value="Pending">Chá» hÃ¡i & Ä‘Ã³ng gÃ³i</Select.Option>
                      <Select.Option value="ReadyForShipper">ÄÃ£ giao Shipper</Select.Option>
                      <Select.Option value="Completed">HoÃ n táº¥t</Select.Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={() => { setSupplierOrderIdFilter(''); setSupplierOrderCustomerFilter(''); setSupplierOrderStatusFilter('all'); }}
                      style={{ width: '100%' }}
                    >
                      Äáº·t láº¡i
                    </Button>
                  </Col>
                </Row>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                  TÃ¬m tháº¥y: <b style={{ color: '#16a34a' }}>{filteredSupplierOrders.length}</b> / {orders.length} Ä‘Æ¡n hÃ ng
                  {(supplierOrderIdFilter.trim() || supplierOrderCustomerFilter.trim() || supplierOrderStatusFilter !== 'all') && (
                    <Tag color="processing" style={{ marginLeft: 8 }}>Äang Ã¡p dá»¥ng bá»™ lá»c</Tag>
                  )}
                </div>
              </div>

              <Table columns={orderColumns} dataSource={filteredSupplierOrders} />
            </Card>
          )}

          {currentMenu === 'notifications' && (
            <NotificationsComponent />
          )}
        </Content>

        <Footer style={{ textAlign: 'center', color: '#888' }}>
          Há»‡ Thá»‘ng PhÃ¢n Phá»‘i NÃ´ng Sáº£n Chuá»—i Cung á»¨ng ThÃ´ng Minh Â©2026 LÃ€NH Farm - Äá»‘i tÃ¡c Há»£p tÃ¡c xÃ£
        </Footer>
      </Layout>

      {/* MODAL: ÄÄ‚NG KÃ Sáº¢N PHáº¨M Má»šI (BÆ¯á»šC 1/2: THÃ”NG TIN NÃ”NG Sáº¢N) */}
      <Modal
        title="ÄÄƒng kÃ½ NÃ´ng sáº£n Má»›i (BÆ°á»›c 1/2: ThÃ´ng tin cÆ¡ báº£n)"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        footer={null}
        width={580}
      >
        <Alert 
          type="info" 
          showIcon 
          message="Quy trÃ¬nh 2 bÆ°á»›c khÃ©p kÃ­n dÃ nh cho NhÃ  Cung Cáº¥p"
          description="BÆ°á»›c 1: Äiá»n thÃ´ng tin nÃ´ng sáº£n. BÆ°á»›c 2: Khai bÃ¡o LÃ´ hÃ ng &amp; Nháº­t kÃ½ canh tÃ¡c. Danh má»¥c sáº£n pháº©m do Ban Quáº£n Trá»‹ (Admin) trá»±c tiáº¿p kiá»ƒm Ä‘á»‹nh vÃ  phÃ¢n loáº¡i chÃ­nh thá»©c khi phÃª duyá»‡t lÃªn sÃ n."
          style={{ marginBottom: 16 }}
        />
        <Form form={productForm} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item name="name" label="TÃªn nÃ´ng sáº£n" rules={[{ required: true, message: 'Vui lÃ²ng nháº­p tÃªn nÃ´ng sáº£n!' }]}>
            <Input placeholder="VÃ­ dá»¥: MÃ­t ThÃ¡i siÃªu sá»›m, BÃ´ng cáº£i xanh Baby há»¯u cÆ¡, CÃ  chua cherry..." />
          </Form.Item>
          {/* ÄÃƒ LOáº I Bá»Ž CHá»ŒN DANH Má»¤C - ADMIN Sáº¼ PHÃ‚N LOáº I KHI DUYá»†T */}
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="price" label="ÄÆ¡n giÃ¡ Ä‘á» xuáº¥t (VNÄ)" rules={[{ required: true, message: 'Vui lÃ²ng nháº­p giÃ¡!' }]}>
                <InputNumber min={1000} step={1000} style={{ width: '100%' }} placeholder="VÃ­ dá»¥: 35000" addonAfter="Ä‘" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="unit" label="ÄÆ¡n vá»‹ tÃ­nh" initialValue="kg" rules={[{ required: true }]}>
                <Input placeholder="kg, bÃ³, náº£i, tÃºi..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="MÃ´ táº£ tiÃªu chuáº©n &amp; vÃ¹ng trá»“ng">
            <Input.TextArea rows={3} placeholder="MÃ´ táº£ giá»‘ng cÃ¢y, quy trÃ¬nh canh tÃ¡c Ä‘áº¡t chuáº©n VietGAP/GlobalGAP..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsProductModalOpen(false)}>Há»§y</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Tiáº¿p tá»¥c: Khai bÃ¡o LÃ´ hÃ ng &amp; Truy xuáº¥t (BÆ°á»›c 2/2) âž”
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: KHAI BÃO / CHá»ˆNH Sá»¬A LÃ” THU HOáº CH & TRUY XUáº¤T NGUá»’N Gá»C (BÆ¯á»šC 2/2) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <span>
              {traceBatch 
                ? `Chá»‰nh Sá»­a Há»“ SÆ¡ LÃ´ HÃ ng: ${traceProduct?.productName || ''}` 
                : `BÆ°á»›c 2: Khai BÃ¡o LÃ´ HÃ ng & Truy Xuáº¥t Cho "${traceProduct?.productName || 'NÃ´ng sáº£n'}"`}
            </span>
          </div>
        }
        open={isTraceModalOpen}
        onCancel={() => setIsTraceModalOpen(false)}
        onOk={handleSaveTrace}
        confirmLoading={traceLoading}
        okText={traceBatch ? "LÆ°u Cáº­p Nháº­t LÃ´ HÃ ng" : "HoÃ n Táº¥t Khai BÃ¡o & Gá»­i PhÃª Duyá»‡t"}
        cancelText="ÄÃ³ng"
        width={680}
      >
        <Alert 
          type="success"
          showIcon
          message="Há»“ sÆ¡ truy xuáº¥t Ä‘á»™c quyá»n cho tá»«ng Ä‘á»£t thu hoáº¡ch"
          description="Má»—i Ä‘á»£t thu hoáº¡ch mang mÃ£ lÃ´ vÃ  nháº­t kÃ½ canh tÃ¡c riÃªng biá»‡t. Dá»¯ liá»‡u nÃ y Ä‘Æ°á»£c káº¿t ná»‘i trá»±c tiáº¿p Ä‘áº¿n trang Truy xuáº¥t nguá»“n gá»‘c vÃ  mÃ£ QR trÃªn bao bÃ¬ cho khÃ¡ch hÃ ng."
          style={{ marginTop: 12, marginBottom: 16 }}
        />

        <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
          <div>NÃ´ng sáº£n: <b style={{ color: '#1b5e20' }}>{traceProduct?.productName || 'ChÆ°a chá»n'}</b> {traceProduct?.productId ? `(MÃ£ SP: #${traceProduct.productId})` : ''}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
            Tráº¡ng thÃ¡i hiá»‡n táº¡i: <Tag color="gold">Chá» Admin duyá»‡t &amp; phÃ¢n loáº¡i danh má»¥c</Tag>
          </div>
        </div>

        <Form form={traceForm} layout="vertical">
          {!traceProduct && (
            <Form.Item name="productId" label="Chá»n NÃ´ng sáº£n cáº§n khai bÃ¡o lÃ´" rules={[{ required: true, message: 'Vui lÃ²ng chá»n nÃ´ng sáº£n!' }]}>
              <Select placeholder="Chá»n nÃ´ng sáº£n cá»§a báº¡n">
                {products.map(p => (
                  <Select.Option key={p.productId} value={p.productId}>{p.productName} (#{p.productId})</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="batchCode" label="MÃ£ lÃ´ hÃ ng truy xuáº¥t (Duy nháº¥t)" rules={[{ required: true, message: 'Nháº­p mÃ£ lÃ´' }]}>
                <Input placeholder="VD: LHN-20260925-001" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="farmId" label="NÃ´ng tráº¡i / VÆ°á»n thu hoáº¡ch" rules={[{ required: true, message: 'Chá»n nÃ´ng tráº¡i' }]}>
                <Select placeholder="Chá»n nÃ´ng tráº¡i">
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
                          {f?.farmName || `${s.fullName} Farm`} ({f?.province || 'ÄÃ  Láº¡t'}) {isMine ? 'â˜… [Trang tráº¡i cá»§a báº¡n]' : ''}
                        </Select.Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="initialQuantity" label="Sáº£n lÆ°á»£ng Ä‘á»£t thu hoáº¡ch" rules={[{ required: true, message: 'Nháº­p sáº£n lÆ°á»£ng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="ÄÆ¡n vá»‹ tÃ­nh" rules={[{ required: true, message: 'Nháº­p Ä‘Æ¡n vá»‹' }]}>
                <Input placeholder="kg, báº¯p, náº£i, há»™p..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="harvestDate" label="NgÃ y thu hoáº¡ch thá»±c táº¿" rules={[{ required: true, message: 'Chá»n ngÃ y thu hoáº¡ch' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chá»n ngÃ y hÃ¡i" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="expiryDate" 
                label="Háº¡n sá»­ dá»¥ng tá»‘t nháº¥t (FEFO)"
                dependencies={['harvestDate']}
                rules={[
                  { required: true, message: 'Chá»n háº¡n sá»­ dá»¥ng' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const harvest = getFieldValue('harvestDate');
                      if (!value || !harvest || value.isAfter(harvest, 'day')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Háº¡n sá»­ dá»¥ng pháº£i sau ngÃ y thu hoáº¡ch!'));
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chá»n háº¡n dÃ¹ng" />
              </Form.Item>
            </Col>
          </Row>

          {/* Live Preview 6 Cháº·ng Canh TÃ¡c */}
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: '8px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#135200', marginBottom: 8 }}>
              ðŸŒ¿ Minh báº¡ch hÃ nh trÃ¬nh 6 cháº·ng canh tÃ¡c &amp; phÃ¢n phá»‘i tá»± Ä‘á»™ng:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '12px' }}>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>01. Nguá»“n giá»‘ng:</b> Chuáº©n há»¯u cÆ¡ F1
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>02. Canh tÃ¡c IoT:</b> Nháº­t kÃ½ vi sinh
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>03. Thu hoáº¡ch:</b> HÃ¡i sÆ°Æ¡ng sá»›m
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>04. Kiá»ƒm Ä‘á»‹nh Lab:</b> ISO/IEC 17025
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>05. Váº­n chuyá»ƒn:</b> Chuá»—i láº¡nh FreshLock
              </div>
              <div style={{ background: '#fff', padding: '6px 8px', borderRadius: 4, border: '1px solid #eee' }}>
                <b>06. Xuáº¥t kho:</b> Giao há»a tá»‘c FEFO
              </div>
            </div>
          </div>
        </Form>
      </Modal>

      {/* MODAL: Äá»€ XUáº¤T COMBO Má»šI */}
      <Modal
        title="Äá» xuáº¥t GÃ³i Combo NÃ´ng Sáº£n Tá»± Chá»n Má»›i"
        open={isComboModalOpen}
        onCancel={() => setIsComboModalOpen(false)}
        footer={null}
        width={580}
      >
        <Form form={comboForm} layout="vertical" onFinish={handleAddCombo} initialValues={{ comboType: 'periodic', slots: 3, cycle: 'Tuáº§n' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="comboType" label="PhÃ¢n loáº¡i combo" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="periodic">ðŸ“… GÃ³i Äá»‹nh Ká»³ (Tuáº§n / ThÃ¡ng)</Select.Option>
                  <Select.Option value="program">ðŸŽ Theo ChÆ°Æ¡ng TrÃ¬nh / Æ¯u ÄÃ£i MÃ¹a Vá»¥</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="TÃªn GÃ³i Combo" rules={[{ required: true, message: 'Vui lÃ²ng nháº­p tÃªn gÃ³i!' }]}>
                <Input placeholder="VÃ­ dá»¥: Combo TÆ°Æ¡i Ngon Tuáº§n, Combo BÆ¡..." />
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
                      <Form.Item name="slots" label="Sá»‘ lÆ°á»£ng mÃ³n tá»± chá»n" rules={[{ required: true, message: 'Nháº­p sá»‘ mÃ³n!' }]}>
                        <InputNumber min={1} max={10} style={{ width: '100%' }} addonAfter="mÃ³n" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      {!isProg ? (
                        <Form.Item name="cycle" label="Chu ká»³ gÃ³i" rules={[{ required: true }]}>
                          <Select>
                            <Select.Option value="Tuáº§n">GÃ³i theo Tuáº§n (1 láº§n giao)</Select.Option>
                            <Select.Option value="ThÃ¡ng">GÃ³i trá»n ThÃ¡ng (4 láº§n giao)</Select.Option>
                          </Select>
                        </Form.Item>
                      ) : (
                        <Form.Item name="programLimit" label="Giá»›i háº¡n sá»‘ suáº¥t bÃ¡n">
                          <InputNumber min={1} max={5000} placeholder="VÃ­ dá»¥: 50" style={{ width: '100%' }} addonAfter="suáº¥t" />
                        </Form.Item>
                      )}
                    </Col>
                  </Row>

                  {isProg && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="dateRange" label="Thá»i gian diá»…n ra chÆ°Æ¡ng trÃ¬nh" rules={[{ required: true, message: 'Chá»n thá»i gian!' }]}>
                          <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="originalPrice" label="GiÃ¡ gá»‘c niÃªm yáº¿t">
                          <InputNumber min={0} addonAfter="Ä‘" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item name="discountPercent" label="Giáº£m giÃ¡ (%)">
                          <InputNumber min={0} max={99} addonAfter="%" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Form.Item name="price" label={isProg ? "ÄÆ¡n giÃ¡ Æ°u Ä‘Ã£i Ä‘á» xuáº¥t (VNÄ)" : "ÄÆ¡n giÃ¡ trá»n gÃ³i Ä‘á» xuáº¥t (VNÄ)"} rules={[{ required: true, message: 'Vui lÃ²ng nháº­p giÃ¡!' }]}>
                    <InputNumber min={10000} step={10000} style={{ width: '100%' }} placeholder="VÃ­ dá»¥: 199000" addonAfter="Ä‘" />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item name="desc" label="MÃ´ táº£ kháº©u pháº§n &amp; Cam káº¿t">
            <Input.TextArea rows={3} placeholder="VÃ­ dá»¥: Giá» 3 mÃ³n tá»± chá»n tá»« danh má»¥c nÃ´ng sáº£n sáº¡ch ÄÃ  Láº¡t, táº·ng kÃ¨m rau thÆ¡m..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsComboModalOpen(false)}>Há»§y</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
                Gá»­i Admin xÃ©t duyá»‡t
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
