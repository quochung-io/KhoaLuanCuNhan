import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card, 
  Tabs, 
  InputNumber, 
  Image, 
  Tag, 
  Tooltip, 
  Row, 
  Col, 
  Alert,
  Badge,
  DatePicker,
  Radio
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PictureOutlined, 
  StarOutlined, 
  ThunderboltOutlined, 
  SaveOutlined,
  ShopOutlined,
  AppstoreAddOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { productService, categoryService, productImageService, userService, productBatchService } from '../services/api';

const SAMPLE_SUB_IMAGES: Record<string, string[]> = {
  'Trái cây': [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80'
  ],
  'Hạt': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536591375315-1b838421c0f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
  ],
  'Rau thơm': [
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80'
  ],
  'Rau củ': [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80'
  ],
  'Combo': [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80'
  ]
};

const SUB_IMAGE_LABELS = [
  'Góc 1: Cận cảnh độ tươi ngon',
  'Góc 2: Vườn trồng / Trang trại',
  'Góc 3: Thu hoạch tại vườn'
];

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  status?: string;
}

interface ProductImage {
  productImageId: number;
  productId: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface Product {
  productId: number;
  supplierId: number;
  categoryId: number;
  productName: string;
  description?: string;
  price: number;
  unit: string;
  status?: string;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
  // Các trường chương trình
  comboType?: string; // 'periodic' | 'program'
  startDate?: string;
  endDate?: string;
  originalPrice?: number;
  discountPercent?: number;
  programLimit?: number;
  soldQuantity?: number;
  maxSlots?: number;
  productBatches?: any[];
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [comboTypeFilter, setComboTypeFilter] = useState<'all' | 'periodic' | 'program'>('all');
  
  // Modals
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);

  // States cho Khai báo & Chỉnh sửa Lô hàng / Truy xuất nguồn gốc
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [traceProduct, setTraceProduct] = useState<Product | null>(null);
  const [traceBatch, setTraceBatch] = useState<any | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceForm] = Form.useForm();

  // States cho Phê duyệt sản phẩm & Phân loại danh mục (Admin)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingProd, setApprovingProd] = useState<Product | null>(null);
  const [approveBatch, setApproveBatch] = useState<any | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveForm] = Form.useForm();

  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editingCombo, setEditingCombo] = useState<Product | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  // States cho Quản lý 1 Ảnh chính & 3 Ảnh phụ
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [primaryUrl, setPrimaryUrl] = useState<string>('');
  const [subUrls, setSubUrls] = useState<string[]>(['', '', '']);
  const [imgLoading, setImgLoading] = useState(false);

  const [prodForm] = Form.useForm();
  const [comboForm] = Form.useForm();
  const [catForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, supRes, batchRes] = await Promise.all([
        categoryService.getAll(),
        productService.getAll(),
        userService.getSuppliers().catch(() => ({ data: [] })),
        productBatchService.getAll().catch(() => ({ data: [] }))
      ]);
      setCategories(catRes.data || []);
      
      const allBatches = batchRes.data || [];
      const prodsWithBatches = (prodRes.data || []).map((p: any) => ({
        ...p,
        productBatches: allBatches.filter((b: any) => b.productId === p.productId)
      }));
      setProducts(prodsWithBatches);
      
      const supList = supRes.data || [];
      setSuppliers(supList.length > 0 ? supList : [
        { supplierId: 1, userId: 2, fullName: 'Hợp tác xã Nông Sản Đà Lạt' },
        { supplierId: 2, userId: 3, fullName: 'Hợp tác xã Rau Sạch Miền Tây' },
        { supplierId: 3, userId: 4, fullName: 'Hợp tác xã Trái Cây Việt' }
      ]);
    } catch (error) {
      message.error('Không thể tải dữ liệu sản phẩm/danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tách biệt Sản phẩm lẻ và Gói Combo (hỗ trợ lọc Định kỳ vs Theo chương trình)
  const singleProducts = products.filter(p => p.categoryId !== 5);
  const comboProducts = products.filter(p => {
    if (p.categoryId !== 5) return false;
    if (comboTypeFilter === 'periodic') return !p.comboType || p.comboType === 'periodic';
    if (comboTypeFilter === 'program') return p.comboType === 'program';
    return true;
  });

  // Helper tìm tên nhà cung cấp
  const getSupplierName = (supplierId: number) => {
    const s = suppliers.find(x => x.supplierId === supplierId || x.userId === supplierId);
    return s?.fullName || s?.supplierName || `Nhà cung cấp #${supplierId}`;
  };

  // Helper trích xuất số món tự chọn của combo
  const getComboSlots = (prod: Product) => {
    if (prod.maxSlots && prod.maxSlots > 0) return prod.maxSlots;
    if (prod.description) {
      const match = prod.description.match(/(\d+)\s*(món|loại)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.unit) {
      const match = prod.unit.match(/(\d+)\s*(món|loại)/i);
      if (match) return parseInt(match[1], 10);
    }
    if (prod.productName.includes('Lớn')) return 5;
    if (prod.productName.includes('Thuần Chay')) return 4;
    return 3;
  };

  // --- Image Management (1 Ảnh chính + 3 Ảnh phụ) ---
  const handleOpenImages = async (prod: Product) => {
    setSelectedProduct(prod);
    setIsImgModalOpen(true);
    setImgLoading(true);
    try {
      const res = await productImageService.getByProduct(prod.productId);
      const list: ProductImage[] = res.data || [];
      
      const primary = list.find(img => img.isPrimary) || list[0];
      setPrimaryUrl(primary ? primary.imageUrl : '');

      const subs = list
        .filter(img => !primary || img.productImageId !== primary.productImageId)
        .map(img => img.imageUrl);

      const threeSubs = [...subs];
      while (threeSubs.length < 3) threeSubs.push('');
      setSubUrls(threeSubs.slice(0, 3));
    } catch (error) {
      message.error('Không thể tải danh sách hình ảnh.');
    } finally {
      setImgLoading(false);
    }
  };

  const handleSetSubAsPrimary = (index: number) => {
    const selectedSub = subUrls[index];
    if (!selectedSub || !selectedSub.trim()) {
      message.warning('Ảnh phụ này đang để trống, không thể chuyển thành ảnh chính.');
      return;
    }
    const oldPrimary = primaryUrl;
    setPrimaryUrl(selectedSub);
    const newSubs = [...subUrls];
    newSubs[index] = oldPrimary;
    setSubUrls(newSubs);
    message.success(`Đã đổi ảnh phụ #${index + 1} thành ảnh chính!`);
  };

  const handleSubUrlChange = (index: number, val: string) => {
    const newSubs = [...subUrls];
    newSubs[index] = val;
    setSubUrls(newSubs);
  };

  const handleFillSampleImages = () => {
    if (!selectedProduct) return;
    const catName = selectedProduct.categoryId === 5 ? 'Combo' : (selectedProduct.category?.categoryName || 'Rau củ');
    const samples = SAMPLE_SUB_IMAGES[catName] || SAMPLE_SUB_IMAGES['Rau củ'];
    setSubUrls([...samples.slice(0, 3)]);
    message.info(`Đã tự động gợi ý 3 ảnh phụ mẫu cho "${selectedProduct.productName}".`);
  };

  const handleSaveAllImages = async () => {
    if (!selectedProduct) return;
    try {
      setImgLoading(true);
      const payload: { imageUrl: string; isPrimary: boolean; sortOrder: number }[] = [];

      if (primaryUrl.trim()) {
        payload.push({
          imageUrl: primaryUrl.trim(),
          isPrimary: true,
          sortOrder: 1
        });
      }

      subUrls.forEach((url, idx) => {
        if (url.trim()) {
          payload.push({
            imageUrl: url.trim(),
            isPrimary: false,
            sortOrder: idx + 2
          });
        }
      });

      await productImageService.syncProductImages(selectedProduct.productId, payload);
      message.success(`Đã lưu cấu hình ảnh cho "${selectedProduct.productName}" thành công!`);
      setIsImgModalOpen(false);
      loadData();
    } catch (error) {
      message.error('Lưu cấu hình ảnh thất bại.');
    } finally {
      setImgLoading(false);
    }
  };

  // --- Single Product CRUD (Dành riêng cho Admin) ---
  const handleOpenAddProd = () => {
    setEditingProd(null);
    prodForm.resetFields();
    prodForm.setFieldsValue({ 
      categoryId: categories.find(c => c.categoryId !== 5)?.categoryId || 1,
      supplierId: suppliers[0]?.supplierId || suppliers[0]?.userId || 1,
      price: 35000,
      unit: 'kg',
      status: 'Active'
    });
    setIsProdModalOpen(true);
  };

  const handleOpenEditProd = (prod: Product) => {
    setEditingProd(prod);
    prodForm.setFieldsValue({
      productName: prod.productName,
      categoryId: prod.categoryId,
      supplierId: prod.supplierId,
      description: prod.description,
      price: prod.price,
      unit: prod.unit,
      status: prod.status || 'Active'
    });
    setIsProdModalOpen(true);
  };

  const handleSaveProd = async () => {
    try {
      const values = await prodForm.validateFields();
      
      if (editingProd) {
        const payload = {
          ...editingProd,
          productName: values.productName,
          supplierId: values.supplierId || editingProd.supplierId,
          price: values.price,
          unit: values.unit,
          description: values.description,
          status: values.status || editingProd.status || 'Active',
          categoryId: values.categoryId || editingProd.categoryId || 1
        };
        await productService.update(editingProd.productId, payload);
        message.success('Cập nhật thông tin nông sản thành công.');
        setIsProdModalOpen(false);
        loadData();
      } else {
        // Admin tạo nông sản kèm quy trình 2 bước:
        const payload = {
          productName: values.productName,
          supplierId: values.supplierId || 1,
          categoryId: values.categoryId || 1,
          price: values.price,
          unit: values.unit,
          description: values.description,
          status: values.status || 'Active'
        };
        const res = await productService.create(payload);
        const created = res.data;
        message.success(`Đã lưu thông tin nông sản "${values.productName}"! Tiếp tục Bước 2: Khai báo Lô hàng & Truy xuất nguồn gốc.`);
        setIsProdModalOpen(false);
        await loadData();

        // Tự động chuyển sang Bước 2: Khai báo Lô hàng & Truy xuất nguồn gốc
        handleOpenTraceModal(created);
      }
    } catch (error) {
      message.error('Lưu thông tin sản phẩm thất bại.');
    }
  };

  // --- Khai báo & Chỉnh sửa Lô hàng / Truy xuất nguồn gốc ---
  const handleOpenTraceModal = (prod: Product, batchToEdit?: any) => {
    setTraceProduct(prod);
    const existing = batchToEdit || (prod.productBatches && prod.productBatches[0]) || null;
    setTraceBatch(existing);

    // Tìm thông tin trang trại trực thuộc của nhà cung cấp này
    const sup = suppliers.find(s => s.supplierId === prod.supplierId || s.userId === prod.supplierId);
    const defaultFarmId = sup?.farm?.farmId || 1;

    if (existing) {
      traceForm.setFieldsValue({
        batchCode: existing.batchCode,
        farmId: existing.farmId || defaultFarmId,
        initialQuantity: existing.initialQuantity || 100,
        unit: existing.unit || prod.unit || 'kg',
        harvestDate: dayjs(existing.harvestDate),
        expiryDate: dayjs(existing.expiryDate),
        status: existing.status || 'Active'
      });
    } else {
      traceForm.resetFields();
      traceForm.setFieldsValue({
        batchCode: 'LHN-' + dayjs().format('YYYYMMDD') + '-' + Math.floor(1000 + Math.random() * 9000),
        farmId: defaultFarmId,
        initialQuantity: 150,
        unit: prod.unit || 'kg',
        harvestDate: dayjs(),
        expiryDate: dayjs().add(10, 'day'),
        status: 'Active'
      });
    }
    setIsTraceModalOpen(true);
  };

  const handleSaveTrace = async () => {
    if (!traceProduct) return;
    try {
      const values = await traceForm.validateFields();
      if (values.expiryDate.isBefore(values.harvestDate) || values.expiryDate.isSame(values.harvestDate, 'day')) {
        message.error('Hạn sử dụng phải sau ngày thu hoạch ít nhất 1 ngày!');
        return;
      }

      setTraceLoading(true);
      const payload = {
        productId: traceProduct.productId,
        farmId: values.farmId || 1,
        batchCode: values.batchCode,
        initialQuantity: values.initialQuantity,
        unit: values.unit,
        harvestDate: values.harvestDate.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
        status: values.status || 'Active'
      };

      if (traceBatch && traceBatch.batchId) {
        await productBatchService.update(traceBatch.batchId, { ...traceBatch, ...payload });
        message.success(`Đã cập nhật hồ sơ truy xuất Lô hàng "${values.batchCode}" thành công!`);
      } else {
        await productBatchService.create(payload);
        message.success(`Khai báo Lô hàng & Truy xuất nguồn gốc thành công! Hồ sơ đã được chuyển tới Admin để phê duyệt.`);
      }

      setIsTraceModalOpen(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || 'Lưu thông tin truy xuất thất bại.');
    } finally {
      setTraceLoading(false);
    }
  };

  // --- Admin Phê Duyệt Sản Phẩm & Phân Loại Danh Mục ---
  const suggestCategory = (prodName: string): number => {
    const n = (prodName || '').toLowerCase();
    if (n.includes('mít') || n.includes('bưởi') || n.includes('cam') || n.includes('xoài') || n.includes('mận') || n.includes('sầu riêng') || n.includes('chuối') || n.includes('ổi') || n.includes('táo') || n.includes('chôm chôm') || n.includes('nhãn') || n.includes('dâu') || n.includes('quýt') || n.includes('thanh long') || n.includes('chanh')) {
      const fruitCat = categories.find(c => c.categoryName.toLowerCase().includes('trái cây') || c.categoryName.toLowerCase().includes('hoa quả'));
      if (fruitCat) return fruitCat.categoryId;
    }
    if (n.includes('nấm')) {
      const mushroomCat = categories.find(c => c.categoryName.toLowerCase().includes('nấm'));
      if (mushroomCat) return mushroomCat.categoryId;
    }
    if (n.includes('ngò') || n.includes('hành') || n.includes('thì là') || n.includes('húng') || n.includes('quế') || n.includes('răm') || n.includes('ớt')) {
      const herbCat = categories.find(c => c.categoryName.toLowerCase().includes('thơm') || c.categoryName.toLowerCase().includes('gia vị'));
      if (herbCat) return herbCat.categoryId;
    }
    const vegCat = categories.find(c => c.categoryName.toLowerCase().includes('rau'));
    return vegCat ? vegCat.categoryId : (categories[0]?.categoryId || 1);
  };

  const handleOpenApproveModal = (prod: Product) => {
    setApprovingProd(prod);
    const batch = prod.productBatches?.[0] || null;
    setApproveBatch(batch);

    const suggested = suggestCategory(prod.productName);
    approveForm.setFieldsValue({
      categoryId: (prod.categoryId && prod.categoryId !== 1) ? prod.categoryId : suggested
    });
    setIsApproveModalOpen(true);
  };

  const handleSaveApprove = async () => {
    if (!approvingProd) return;
    try {
      const values = await approveForm.validateFields();
      setApproveLoading(true);

      const targetCat = categories.find(c => c.categoryId === values.categoryId);
      const catName = targetCat ? targetCat.categoryName : 'Danh mục đã chọn';

      await productService.update(approvingProd.productId, {
        ...approvingProd,
        categoryId: values.categoryId,
        status: 'Active',
        approvedAt: new Date().toISOString()
      });

      message.success(`🎉 Đã phân loại vào danh mục "${catName}" và phê duyệt nông sản "${approvingProd.productName}" lên sàn mua sắm!`);
      setIsApproveModalOpen(false);
      loadData();
    } catch (error) {
      message.error('Phê duyệt sản phẩm thất bại.');
    } finally {
      setApproveLoading(false);
    }
  };

  // --- Combo CRUD ---
  const handleOpenAddCombo = () => {
    setEditingCombo(null);
    comboForm.resetFields();
    comboForm.setFieldsValue({
      supplierId: suppliers[0]?.userId || 2,
      comboType: 'periodic',
      slots: 3,
      cycle: 'Tuần',
      status: 'Active',
      price: 199000,
      originalPrice: 220000,
      discountPercent: 10,
      programLimit: 50,
      description: 'Gói combo nông sản sạch tự chọn theo nhu cầu gia đình, thu hoạch sương sớm giao tận bếp.'
    });
    setIsComboModalOpen(true);
  };

  const handleOpenEditCombo = (combo: Product) => {
    setEditingCombo(combo);
    const slots = getComboSlots(combo);
    const cycle = combo.unit?.includes('Tháng') ? 'Tháng' : 'Tuần';
    const dateRange = (combo.startDate && combo.endDate) 
      ? [dayjs(combo.startDate), dayjs(combo.endDate)] 
      : null;

    comboForm.setFieldsValue({
      productName: combo.productName,
      supplierId: combo.supplierId,
      comboType: combo.comboType || 'periodic',
      slots: slots,
      price: combo.price,
      cycle: cycle,
      status: combo.status || 'Active',
      originalPrice: combo.originalPrice || combo.price,
      discountPercent: combo.discountPercent || 0,
      programLimit: combo.programLimit,
      dateRange: dateRange,
      description: combo.description?.replace(/\[Tự chọn \d+ loại nông sản\]\s*/, '') || combo.description
    });
    setIsComboModalOpen(true);
  };

  const handleSaveCombo = async () => {
    try {
      const values = await comboForm.validateFields();
      const slots = values.slots || 3;
      const comboType = values.comboType || 'periodic';
      const unit = comboType === 'program' 
        ? 'Gói Ưu Đãi' 
        : (values.cycle === 'Tháng' ? 'Gói/Tháng' : 'Gói/Tuần');
      const cleanDesc = values.description || '';

      let startDate: string | null = null;
      let endDate: string | null = null;
      if (values.dateRange && values.dateRange.length === 2) {
        startDate = values.dateRange[0].toISOString();
        endDate = values.dateRange[1].toISOString();
      }

      const payload = {
        productName: values.productName,
        categoryId: 5, // Cố định 5 = Combo Nông Sản Định Kỳ / Chương trình
        supplierId: values.supplierId,
        price: values.price,
        unit: unit,
        status: values.status || 'Active',
        description: `[Tự chọn ${slots} loại nông sản] ${cleanDesc}`,
        comboType: comboType,
        maxSlots: slots,
        startDate: startDate,
        endDate: endDate,
        originalPrice: values.originalPrice || values.price,
        discountPercent: values.discountPercent || 0,
        programLimit: values.programLimit || null,
        soldQuantity: editingCombo?.soldQuantity || 0
      };

      if (editingCombo) {
        await productService.update(editingCombo.productId, { ...editingCombo, ...payload });
        message.success('Cập nhật gói combo thành công.');
      } else {
        await productService.create(payload);
        message.success('Tạo gói combo mới thành công.');
      }
      setIsComboModalOpen(false);
      loadData();
    } catch (error) {
      message.error('Lưu gói combo thất bại.');
    }
  };

  // Duyệt gói combo do nhà cung cấp đề xuất (Pending -> Active)
  const handleApproveCombo = async (combo: Product) => {
    try {
      await productService.update(combo.productId, {
        ...combo,
        status: 'Active'
      });
      message.success(`Đã phê duyệt gói combo "${combo.productName}" lên sàn mua sắm!`);
      loadData();
    } catch (error) {
      message.error('Phê duyệt gói combo thất bại.');
    }
  };

  const handleDeleteProductOrCombo = async (id: number, isCombo: boolean = false) => {
    Modal.confirm({
      title: isCombo ? 'Xác nhận xóa gói combo' : 'Xác nhận xóa nông sản',
      content: isCombo 
        ? 'Bạn có chắc chắn muốn xóa gói combo này khỏi hệ thống?' 
        : 'Bạn có chắc chắn muốn xóa nông sản này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await productService.delete(id);
          message.success('Xóa thành công.');
          loadData();
        } catch (error) {
          message.error('Xóa thất bại.');
        }
      }
    });
  };

  // --- Category CRUD ---
  const handleOpenAddCat = () => {
    setEditingCat(null);
    catForm.resetFields();
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    catForm.setFieldsValue({
      categoryName: cat.categoryName,
      description: cat.description,
      status: cat.status || 'Active'
    });
    setIsCatModalOpen(true);
  };

  const handleDeleteCat = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: 'Lưu ý: Xóa danh mục có thể ảnh hưởng đến các sản phẩm trực thuộc.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await categoryService.delete(id);
          message.success(res.data?.message || 'Xóa danh mục thành công.');
          loadData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Xóa danh mục thất bại do có sản phẩm trực thuộc.');
        }
      }
    });
  };

  const handleSaveCat = async () => {
    try {
      const values = await catForm.validateFields();
      const payload = {
        categoryName: values.categoryName,
        description: values.description,
        status: values.status || 'Active'
      };

      if (editingCat) {
        await categoryService.update(editingCat.categoryId, { ...editingCat, ...payload });
        message.success('Cập nhật danh mục thành công.');
      } else {
        await categoryService.create(payload);
        message.success('Tạo danh mục mới thành công.');
      }
      setIsCatModalOpen(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lưu danh mục thất bại.'); 
    }
  };

  // --- Columns Config: Sản Phẩm Lẻ ---
  const singleProdColumns = [
    { title: 'ID', dataIndex: 'productId', key: 'productId', width: 65 },
    { 
      title: 'Tên nông sản', 
      dataIndex: 'productName', 
      key: 'productName',
      render: (t: string) => <b>{t}</b>
    },
    { 
      title: 'Danh mục', 
      dataIndex: ['category', 'categoryName'], 
      key: 'categoryName', 
      render: (text: string, r: Product) => {
        if (r.status === 'Pending') {
          return <Tag color="gold" icon={<InfoCircleOutlined />}>Chờ Admin phân loại</Tag>;
        }
        return <Tag color="blue">{text || 'Nông sản lẻ'}</Tag>;
      }
    },
    {
      title: 'Hồ sơ Lô hàng & Truy xuất',
      key: 'traceBatch',
      width: 190,
      render: (_: any, r: Product) => {
        const batch = r.productBatches && r.productBatches.length > 0 ? r.productBatches[0] : null;
        if (!batch) {
          return (
            <Tooltip title="Nhà cung cấp chưa khai báo Lô hàng. Bấm nút 'Truy xuất' để khai báo.">
              <Tag color="volcano" icon={<InfoCircleOutlined />}>Chưa có Lô hàng</Tag>
            </Tooltip>
          );
        }
        return (
          <div>
            <Tag color="cyan" icon={<SafetyCertificateOutlined />} style={{ fontWeight: 600 }}>
              {batch.batchCode}
            </Tag>
            <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
              Hái: <b>{dayjs(batch.harvestDate).format('DD/MM/YYYY')}</b>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Nhà cung cấp / HTX',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supId: number) => (
        <span style={{ color: '#2e7d32', fontWeight: 600 }}>
          {getSupplierName(supId)}
        </span>
      )
    },
    { 
      title: 'Giá bán', 
      dataIndex: 'price', 
      key: 'price', 
      render: (val: number) => <span style={{ color: '#d32f2f', fontWeight: 700 }}>{val.toLocaleString('vi-VN')} đ</span> 
    },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70 },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 110, 
      render: (st: string) => {
        if (st === 'Pending') return <Tag color="gold" icon={<InfoCircleOutlined />}>Chờ duyệt</Tag>;
        if (st === 'Active') return <Tag color="green" icon={<CheckOutlined />}>Đang bán</Tag>;
        return <Tag color="default">{st || 'Active'}</Tag>;
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: Product) => {
        const isPending = record.status === 'Pending';
        const hasBatch = record.productBatches && record.productBatches.length > 0;
        return (
          <Space size="small" wrap>
            {isPending && (
              <Tooltip title={!hasBatch ? 'Cần khai báo Lô hàng trước khi phê duyệt' : 'Phân loại danh mục & Phê duyệt sản phẩm lên sàn'}>
                <Button 
                  size="small" 
                  type="primary" 
                  style={{ backgroundColor: hasBatch ? '#52c41a' : '#d9d9d9', borderColor: hasBatch ? '#52c41a' : '#d9d9d9' }}
                  icon={<CheckCircleOutlined />} 
                  disabled={!hasBatch}
                  onClick={() => handleOpenApproveModal(record)}
                >
                  Duyệt & Phân loại
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Khai báo hoặc chỉnh sửa Lô hàng & Nhật ký canh tác">
              <Button 
                size="small" 
                icon={<SafetyCertificateOutlined />} 
                style={{ color: '#2e7d32', borderColor: '#2e7d32' }} 
                onClick={() => handleOpenTraceModal(record)}
              >
                Truy xuất
              </Button>
            </Tooltip>
            <Button size="small" icon={<PictureOutlined />} style={{ color: '#1890ff', borderColor: '#1890ff' }} onClick={() => handleOpenImages(record)}>Ảnh</Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditProd(record)}>Sửa</Button>
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDeleteProductOrCombo(record.productId, false)}>Xóa</Button>
          </Space>
        );
      }
    }
  ];

  // --- Columns Config: Combo Tự Chọn ---
  const comboColumns = [
    { title: 'Mã Gói', dataIndex: 'productId', key: 'productId', width: 80, render: (id: number) => <Tag color="geekblue">#{id}</Tag> },
    { 
      title: 'Phân loại', 
      dataIndex: 'comboType', 
      key: 'comboType', 
      width: 140,
      render: (t?: string) => {
        if (t === 'program') {
          return <Tag color="magenta" style={{ fontWeight: 600 }}>🎁 Theo chương trình</Tag>;
        }
        return <Tag color="blue" style={{ fontWeight: 600 }}>📅 Combo định kỳ</Tag>;
      }
    },
    { 
      title: 'Tên Gói Combo Tự Chọn', 
      dataIndex: 'productName', 
      key: 'productName',
      render: (t: string, r: Product) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1b5e20' }}>{t}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px', maxWidth: '280px' }} className="truncate">
            {r.description || 'Gói combo dinh dưỡng'}
          </div>
          {r.comboType === 'program' && (
            <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#d46b08', background: '#fff7e6', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
              ⏳ {r.startDate && r.endDate ? `${dayjs(r.startDate).format('DD/MM')} - ${dayjs(r.endDate).format('DD/MM/YYYY')}` : 'Không thời hạn'}
              {r.programLimit ? ` • Giới hạn: ${r.soldQuantity || 0}/${r.programLimit} suất` : ''}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Nhà cung cấp phụ trách (Duy nhất 1 NCC)',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (supId: number) => (
        <div>
          <Tag color="green" icon={<ShopOutlined />}>
            {getSupplierName(supId)}
          </Tag>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
            Đóng gói khép kín tại farm
          </div>
        </div>
      )
    },
    {
      title: 'Số món tự chọn',
      key: 'slots',
      width: 130,
      render: (_: any, r: Product) => {
        const slots = getComboSlots(r);
        return (
          <Tag color="cyan" style={{ fontWeight: 700, fontSize: '12.5px', padding: '3px 8px' }}>
            🥗 {slots} món
          </Tag>
        );
      }
    },
    { 
      title: 'Giá gói', 
      dataIndex: 'price', 
      key: 'price', 
      width: 140,
      render: (val: number, r: Product) => (
        <div>
          <b style={{ color: '#d32f2f', fontSize: '14px' }}>{val.toLocaleString('vi-VN')} đ</b>
          {r.comboType === 'program' && r.originalPrice && r.originalPrice > val && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              <span style={{ textDecoration: 'line-through' }}>{r.originalPrice.toLocaleString('vi-VN')} đ</span>
              {r.discountPercent ? <Tag color="volcano" style={{ marginLeft: 4, fontSize: '10px', padding: '0 3px' }}>-{r.discountPercent}%</Tag> : null}
            </div>
          )}
        </div>
      )
    },
    { 
      title: 'Chu kỳ', 
      dataIndex: 'unit', 
      key: 'unit', 
      width: 110,
      render: (unit: string, r: Product) => {
        if (r.comboType === 'program') {
          return <Tag color="volcano">Ưu đãi</Tag>;
        }
        const isMonth = unit?.includes('Tháng');
        return <Tag color={isMonth ? 'purple' : 'blue'}>{unit || 'Gói/Tuần'}</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120, 
      render: (st: string) => {
        if (st === 'Pending') {
          return <Tag color="gold" icon={<InfoCircleOutlined />}>Chờ duyệt</Tag>;
        }
        return <Tag color={st === 'Active' ? 'green' : 'default'}>{st || 'Active'}</Tag>;
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: Product) => {
        const isPending = record.status === 'Pending';
        return (
          <Space size="small">
            {isPending && (
              <Button 
                size="small" 
                type="primary" 
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                icon={<CheckCircleOutlined />} 
                onClick={() => handleApproveCombo(record)}
              >
                Duyệt
              </Button>
            )}
            <Button size="small" icon={<PictureOutlined />} style={{ color: '#1890ff', borderColor: '#1890ff' }} onClick={() => handleOpenImages(record)}>Ảnh</Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEditCombo(record)}>Sửa</Button>
            <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDeleteProductOrCombo(record.productId, true)}>Xóa</Button>
          </Space>
        );
      }
    }
  ];

  // --- Columns Config: Danh Mục ---
  const catColumns = [
    { title: 'ID', dataIndex: 'categoryId', key: 'categoryId', width: 80 },
    { title: 'Tên danh mục', dataIndex: 'categoryName', key: 'categoryName', render: (t: string) => <b>{t}</b> },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenEditCat(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteCat(record.categoryId)}>Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShopOutlined style={{ fontSize: '20px', color: '#2e7d32' }} />
          <span>Quản Lý Sản Phẩm Nông Sản & Gói Combo (Định Kỳ & Theo Chương Trình)</span>
        </div>
      }>
        <Tabs 
          defaultActiveKey="single"
          items={[
            {
              key: 'single',
              label: (
                <Space>
                  <ShopOutlined />
                  <span>Sản Phẩm Nông Sản Lẻ</span>
                  <Badge count={singleProducts.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#666', fontSize: '13px' }}>
                      Quản lý từng mặt hàng rau củ quả lẻ theo đơn vị tính (kg, bó, nải, hộp...)
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddProd} style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
                      Thêm Nông Sản Lẻ
                    </Button>
                  </div>
                  <Table 
                    columns={singleProdColumns} 
                    dataSource={singleProducts} 
                    rowKey="productId" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            },
            {
              key: 'combo',
              label: (
                <Space>
                  <AppstoreAddOutlined />
                  <span>Gói Combo Tự Chọn</span>
                  <Badge count={comboProducts.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              ),
              children: (
                <div>
                  <Alert 
                    type="info" 
                    showIcon 
                    message="Quy định Gói Combo Tự Chọn Nông Sản" 
                    description="Mỗi gói Combo (Định kỳ hoặc Theo chương trình ưu đãi) bắt buộc phải do DUY NHẤT một Nhà Cung Cấp / Hợp Tác Xã phụ trách. Toàn bộ các món khách hàng lựa chọn trong gói sẽ được sơ chế và đóng gói khép kín tại nông trại của NCC đó trước khi giao xe lạnh đến bàn ăn."
                    style={{ marginBottom: 16, borderRadius: '8px' }}
                  />
                  
                  {/* Phân loại Combo */}
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <Radio.Group 
                      value={comboTypeFilter} 
                      onChange={e => setComboTypeFilter(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="all">
                        Tất cả ({products.filter(p => p.categoryId === 5).length})
                      </Radio.Button>
                      <Radio.Button value="periodic">
                        📅 Combo Định Kỳ ({products.filter(p => p.categoryId === 5 && (!p.comboType || p.comboType === 'periodic')).length})
                      </Radio.Button>
                      <Radio.Button value="program">
                        🎁 Combo Theo Chương Trình ({products.filter(p => p.categoryId === 5 && p.comboType === 'program').length})
                      </Radio.Button>
                    </Radio.Group>

                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddCombo} style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
                      Tạo Gói Combo Mới
                    </Button>
                  </div>

                  <Table 
                    columns={comboColumns} 
                    dataSource={comboProducts} 
                    rowKey="productId" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            },
            {
              key: 'category',
              label: (
                <Space>
                  <FolderOutlined />
                  <span>Danh Mục Nông Sản</span>
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddCat}>
                      Thêm Danh Mục
                    </Button>
                  </div>
                  <Table 
                    columns={catColumns} 
                    dataSource={categories} 
                    rowKey="categoryId" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Single Product Modal (Dành cho Admin) */}
      <Modal
        title={editingProd ? 'Cập Nhật Nông Sản Lẻ' : 'Thêm Nông Sản Mới (Bước 1/2: Thông tin cơ bản)'}
        open={isProdModalOpen}
        onOk={handleSaveProd}
        onCancel={() => setIsProdModalOpen(false)}
        okText={editingProd ? "Lưu Cập Nhật" : "Tiếp tục: Khai Báo Lô Hàng & Truy Xuất (Bước 2/2) ➔"}
        cancelText="Hủy"
        width={580}
      >
        <Form form={prodForm} layout="vertical" style={{ marginTop: 15 }}>
          {!editingProd && (
            <Alert 
              type="info" 
              showIcon 
              message="Quy trình 2 bước tạo nông sản kèm hồ sơ Lô hàng & Truy xuất" 
              description="Bước 1: Chọn Danh mục, Nhà cung cấp sở hữu và thông tin giá bán. Bước 2: Khai báo Lô hàng thu hoạch & Nhật ký canh tác để đảm bảo sản phẩm luôn có đầy đủ dữ liệu truy xuất minh bạch." 
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item name="categoryId" label="Danh mục nông sản (Admin chọn trực tiếp)" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
            <Select placeholder="Chọn danh mục">
              {categories.filter(c => c.categoryId !== 5).map(c => (
                <Select.Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="productName" label="Tên nông sản" rules={[{ required: true, message: 'Nhập tên nông sản' }]}>
            <Input placeholder="Ví dụ: Mít Thái siêu sớm, Cà chua bi Đà Lạt, Nấm đùi gà..." />
          </Form.Item>

          <Form.Item name="supplierId" label="Nhà cung cấp / Hợp tác xã sở hữu" rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp / HTX sở hữu' }]}>
            <Select placeholder="Chọn Nhà cung cấp / HTX">
              {suppliers.map(s => {
                const sid = s.supplierId || s.userId;
                return (
                  <Select.Option key={sid} value={sid}>
                    {s.fullName || s.supplierName} ({s.representative ? `Đại diện: ${s.representative}` : `ID: ${sid}`})
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="price" label="Giá bán sàn" rules={[{ required: true, message: 'Nhập giá bán' }]}>
                <InputNumber min={0} addonAfter="đ" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Nhập đơn vị' }]}>
                <Input placeholder="kg, bó, nải, túi..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="Trạng thái" initialValue="Active">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">Active (Đang bán trên sàn)</Select.Option>
              <Select.Option value="Pending">Pending (Chờ duyệt)</Select.Option>
              <Select.Option value="Inactive">Inactive (Tạm ngừng bán)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả nông sản">
            <Input.TextArea rows={3} placeholder="Mô tả tiêu chuẩn VietGAP, độ tươi ngon, vùng trồng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Khai Báo / Chỉnh Sửa Lô Hàng & Truy Xuất Nguồn Gốc */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#2e7d32', fontSize: '20px' }} />
            <span>
              {traceBatch 
                ? `Chỉnh Sửa Hồ Sơ Lô Hàng: ${traceProduct?.productName}` 
                : `Bước 2: Khai Báo Lô Hàng & Truy Xuất Cho "${traceProduct?.productName}"`}
            </span>
          </div>
        }
        open={isTraceModalOpen}
        onOk={handleSaveTrace}
        confirmLoading={traceLoading}
        onCancel={() => setIsTraceModalOpen(false)}
        okText={traceBatch ? "Lưu Cập Nhật Lô Hàng" : "Lưu Hồ Sơ Lô Hàng & Đưa Lên Sàn"}
        cancelText="Đóng"
        width={680}
      >
        <Alert 
          type="success"
          showIcon
          message="Hồ sơ truy xuất độc quyền cho từng đợt thu hoạch"
          description="Mỗi đợt thu hoạch mang một mã lô và nhật ký canh tác riêng biệt. Dữ liệu này sẽ được dùng để tạo mã QR truy xuất nguồn gốc cho người tiêu dùng tra cứu."
          style={{ marginTop: 12, marginBottom: 16 }}
        />

        <Form form={traceForm} layout="vertical">
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="batchCode" label="Mã lô hàng truy xuất (Duy nhất)" rules={[{ required: true, message: 'Nhập mã lô' }]}>
                <Input placeholder="VD: LHN-20260925-001" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="farmId" label="Nông trại / Vườn thu hoạch" rules={[{ required: true, message: 'Chọn nông trại' }]}>
                <Select placeholder="Chọn nông trại">
                  {suppliers.map(s => {
                    const sid = s.supplierId || s.userId;
                    const f = s.farm;
                    return (
                      <Select.Option key={f?.farmId || sid} value={f?.farmId || sid}>
                        {f?.farmName || `${s.fullName} Farm`} ({f?.province || 'Đà Lạt'})
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
                label="Hạn sử dụng tốt nhất"
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

          <Form.Item name="status" label="Trạng thái lô hàng">
            <Select>
              <Select.Option value="Active">Active (Lưu hành bình thường)</Select.Option>
              <Select.Option value="Inactive">Inactive (Tạm khóa lô)</Select.Option>
            </Select>
          </Form.Item>

          {/* Khối Preview 6 Mốc Tự Động */}
          <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '8px', padding: '12px 16px', marginTop: 10 }}>
            <div style={{ fontWeight: 700, color: '#2e7d32', marginBottom: '6px', fontSize: '13px' }}>
              🌿 Bản xem trước nhật ký canh tác (Hệ thống tự động đồng bộ theo loại cây):
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#389e0d', lineHeight: 1.6 }}>
              <li><b>Mốc 1 (Chọn giống & Thổ nhưỡng):</b> Giống thuần chủng F1, giá thể đất hữu cơ đã khử trùng nhiệt.</li>
              <li><b>Mốc 2 (Chăm sóc sinh học & IoT):</b> Quản lý tưới theo biểu đồ sinh trưởng, bẫy dính sinh học chống côn trùng.</li>
              <li><b>Mốc 3 (Thu hái sương sớm):</b> Thu hoạch khung giờ 5:00 - 6:30 sáng, phân loại tiêu chuẩn loại 1.</li>
              <li><b>Mốc 4 (Kiểm nghiệm an toàn VietGAP):</b> Xét nghiệm 24 hoạt chất bảo vệ thực vật, nitrat & kim loại nặng đạt chuẩn.</li>
              <li><b>Mốc 5 (Vận chuyển lạnh FreshLock 4°C - 8°C):</b> Xe lạnh chuyên dụng kiểm soát GPS liên tục.</li>
              <li><b>Mốc 6 (Nhập tổng kho & Giao bếp):</b> Bảo quản tiêu chuẩn FEFO, sẵn sàng giao 2 giờ.</li>
            </ul>
          </div>
        </Form>
      </Modal>

      {/* Modal Phê Duyệt & Phân Loại Danh Mục (Dành riêng cho Admin) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <span>Phê Duyệt & Phân Loại Danh Mục Sản Phẩm</span>
          </div>
        }
        open={isApproveModalOpen}
        onOk={handleSaveApprove}
        confirmLoading={approveLoading}
        onCancel={() => setIsApproveModalOpen(false)}
        okText="Phê Duyệt & Đưa Lên Sàn"
        cancelText="Hủy"
        width={580}
      >
        <div style={{ padding: '8px 0' }}>
          <Alert 
            type="info" 
            showIcon 
            message="Nhiệm vụ Quản trị viên (Admin)" 
            description="Kiểm tra thông tin nông sản và hồ sơ truy xuất do Nhà cung cấp gửi lên. Sau đó phân loại sản phẩm vào đúng Danh mục chuẩn trước khi duyệt lên sàn mua sắm." 
            style={{ marginBottom: 16 }}
          />

          <div style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '14px 16px', marginBottom: 16, fontSize: '13px' }}>
            <div style={{ marginBottom: 6 }}>Tên nông sản: <b style={{ color: '#2e7d32', fontSize: '15px' }}>{approvingProd?.productName}</b></div>
            <div style={{ marginBottom: 6 }}>Giá bán đề xuất: <b style={{ color: '#d32f2f' }}>{approvingProd?.price.toLocaleString('vi-VN')} đ / {approvingProd?.unit}</b></div>
            <div style={{ marginBottom: 6 }}>Nhà cung cấp: <b>{getSupplierName(approvingProd?.supplierId || 0)}</b></div>
            <div>
              Hồ sơ Lô hàng: {approveBatch ? (
                <Tag color="cyan">Mã lô: {approveBatch.batchCode} · Hái ngày: {dayjs(approveBatch.harvestDate).format('DD/MM/YYYY')}</Tag>
              ) : (
                <Tag color="error">Chưa có Lô hàng</Tag>
              )}
            </div>
          </div>

          <Form form={approveForm} layout="vertical">
            <Form.Item 
              name="categoryId" 
              label="Phân loại Danh mục cho sản phẩm này (Bắt buộc)" 
              rules={[{ required: true, message: 'Vui lòng chọn danh mục cho sản phẩm' }]}
              extra="Hệ thống đã tự động phân tích tên nông sản và gợi ý danh mục phù hợp nhất."
            >
              <Select placeholder="Chọn danh mục phân loại">
                {categories.filter(c => c.categoryId !== 5).map(c => (
                  <Select.Option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName} {c.description ? `(${c.description})` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Combo Modal */}
      <Modal
        title={editingCombo ? 'Cập Nhật Gói Combo Tự Chọn' : 'Tạo Gói Combo Tự Chọn Mới'}
        open={isComboModalOpen}
        onOk={handleSaveCombo}
        onCancel={() => setIsComboModalOpen(false)}
        okText="Lưu Gói Combo"
        cancelText="Hủy"
        width={620}
      >
        <Form form={comboForm} layout="vertical" style={{ marginTop: 15 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="comboType" label="Phân Loại Gói Combo" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="periodic">📅 Combo Định Kỳ (Theo Tuần / Tháng)</Select.Option>
                  <Select.Option value="program">🎁 Combo Theo Chương Trình (Ưu Đãi / Mùa Vụ)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="productName" label="Tên Gói Combo" rules={[{ required: true, message: 'Nhập tên gói combo' }]}>
                <Input placeholder="Ví dụ: Combo Gia Đình Nhỏ, Combo Mùa Bơ..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="supplierId" 
            label="Nhà cung cấp / Hợp tác xã phụ trách (Duy nhất 1 NCC)" 
            rules={[{ required: true, message: 'Bắt buộc chọn 1 nhà cung cấp phụ trách gói combo' }]}
            extra="Tất cả nông sản tự chọn trong combo này sẽ được lấy từ danh mục của Nhà cung cấp này để đồng bộ đóng gói."
          >
            <Select placeholder="Chọn Nhà cung cấp duy nhất phụ trách">
              {suppliers.map(s => {
                const sid = s.supplierId || s.userId;
                return (
                  <Select.Option key={sid} value={sid}>
                    🏢 {s.fullName || s.supplierName} ({s.representative || `ID: ${sid}`})
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item noStyle dependencies={['comboType']}>
            {({ getFieldValue }) => {
              const isProg = getFieldValue('comboType') === 'program';
              return (
                <>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item 
                        name="slots" 
                        label="Số lượng món nông sản tự chọn" 
                        rules={[{ required: true, message: 'Nhập số món tự chọn' }]}
                        extra="Khách hàng sẽ chọn đúng N món này"
                      >
                        <InputNumber min={1} max={15} style={{ width: '100%' }} addonAfter="món" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      {!isProg ? (
                        <Form.Item name="cycle" label="Chu kỳ giao hàng" rules={[{ required: true }]}>
                          <Select>
                            <Select.Option value="Tuần">Tuần (Gói/Tuần - 1 lần giao)</Select.Option>
                            <Select.Option value="Tháng">Tháng (Gói/Tháng - 4 lần giao)</Select.Option>
                          </Select>
                        </Form.Item>
                      ) : (
                        <Form.Item name="programLimit" label="Giới hạn số suất bán">
                          <InputNumber min={1} max={10000} placeholder="Ví dụ: 100" style={{ width: '100%' }} addonAfter="suất" />
                        </Form.Item>
                      )}
                    </Col>
                  </Row>

                  {isProg && (
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="dateRange" label="Thời gian áp dụng chương trình" rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu & kết thúc' }]}>
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

                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item name="price" label={isProg ? "Giá bán ưu đãi" : "Đơn giá trọn gói"} rules={[{ required: true, message: 'Nhập giá bán gói' }]}>
                        <InputNumber min={0} addonAfter="đ" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="status" label="Trạng thái hiển thị">
                        <Select>
                          <Select.Option value="Active">Active (Công khai cho khách đặt)</Select.Option>
                          <Select.Option value="Pending">Pending (Chờ duyệt)</Select.Option>
                          <Select.Option value="Inactive">Inactive (Tạm ngừng gói)</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              );
            }}
          </Form.Item>

          <Form.Item name="description" label="Mô tả khẩu phần / Nội dung chương trình">
            <Input.TextArea rows={3} placeholder="Ví dụ: Ưu đãi mùa hè nông sản tươi sạch, hoặc phù hợp gia đình 2-3 người..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={editingCat ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}
        open={isCatModalOpen}
        onOk={handleSaveCat}
        onCancel={() => setIsCatModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={catForm} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Gallery Management Modal (1 Ảnh Chính + 3 Ảnh Phụ) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined style={{ color: '#2E7D32', fontSize: '20px' }} />
            <span>Quản Lý Hình Ảnh (1 Ảnh Chính + 3 Ảnh Phụ): <strong>{selectedProduct?.productName}</strong></span>
          </div>
        }
        open={isImgModalOpen}
        width={860}
        onCancel={() => setIsImgModalOpen(false)}
        footer={[
          <Button key="fill" icon={<ThunderboltOutlined />} onClick={handleFillSampleImages} style={{ float: 'left', color: '#FF9800', borderColor: '#FF9800' }}>
            Gợi ý 3 ảnh phụ mẫu
          </Button>,
          <Button key="close" onClick={() => setIsImgModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} loading={imgLoading} onClick={handleSaveAllImages} style={{ background: '#2E7D32', borderColor: '#2E7D32' }}>
            Lưu Tất Cả Hình Ảnh Vào Database
          </Button>
        ]}
      >
        <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
          {/* PHẦN 1: 1 ẢNH CHÍNH LỚN */}
          <Card 
            size="small" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#2E7D32', fontWeight: 700 }}>
                  🌟 1. Ảnh Chính Đại Diện (Primary Image)
                </span>
                <Tag color="green">Hiển thị lớn ở trang chi tiết &amp; Trang chủ</Tag>
              </div>
            }
            style={{ marginBottom: 18, border: '1.5px solid #A5D6A7', background: '#F1F8E9' }}
          >
            <Row gutter={16} align="middle">
              <Col span={6} style={{ textAlign: 'center' }}>
                <Image
                  src={primaryUrl || 'https://via.placeholder.com/140?text=Chua+co+anh'}
                  alt="Ảnh chính"
                  width={140}
                  height={110}
                  style={{ objectFit: 'cover', borderRadius: 8, border: '2px solid #2E7D32' }}
                  fallback="https://via.placeholder.com/140?text=Loi+Anh"
                />
              </Col>
              <Col span={18}>
                <div style={{ marginBottom: 6, fontSize: '13px', fontWeight: 600, color: '#333' }}>
                  Đường dẫn URL ảnh chính:
                </div>
                <Input 
                  placeholder="Nhập hoặc dán URL ảnh chính (ví dụ: https://images.unsplash.com/...)" 
                  value={primaryUrl}
                  onChange={(e) => setPrimaryUrl(e.target.value)}
                  allowClear
                  style={{ marginBottom: 8 }}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  💡 Khách hàng khi lướt xem sản phẩm hoặc vào trang chi tiết sẽ thấy ảnh này đầu tiên.
                </div>
              </Col>
            </Row>
          </Card>

          {/* PHẦN 2: 3 ẢNH PHỤ NHỎ */}
          <Card 
            size="small" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#1B5E20', fontWeight: 700 }}>
                  🖼️ 2. Danh Sách 3 Ảnh Phụ Nhỏ Phía Dưới Ảnh Chính (Secondary Thumbnails)
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Có thể bấm ⭐ để đưa ảnh phụ lên làm ảnh chính
                </span>
              </div>
            }
            style={{ border: '1px solid #C8E6C9' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subUrls.map((url, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '8px 12px', 
                    background: '#FAFAFA', 
                    borderRadius: 8, 
                    border: '1px solid #E0E0E0' 
                  }}
                >
                  {/* Thumbnail xem trước */}
                  <Image
                    src={url || 'https://via.placeholder.com/64?text=Anh+' + (idx + 1)}
                    alt={`Ảnh phụ ${idx + 1}`}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #ccc' }}
                    fallback="https://via.placeholder.com/64?text=Loi+Anh"
                  />

                  {/* Input URL */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#2E7D32', marginBottom: 4 }}>
                      Ảnh phụ #{idx + 1}: <span style={{ color: '#555', fontWeight: 'normal' }}>{SUB_IMAGE_LABELS[idx]}</span>
                    </div>
                    <Input
                      placeholder={`Nhập URL cho ảnh phụ #${idx + 1}`}
                      value={url}
                      onChange={(e) => handleSubUrlChange(idx, e.target.value)}
                      allowClear
                      size="middle"
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Tooltip title="Chuyển ảnh phụ này thành ảnh chính đại diện">
                      <Button 
                        size="small" 
                        icon={<StarOutlined />} 
                        onClick={() => handleSetSubAsPrimary(idx)}
                        disabled={!url.trim()}
                        style={{ color: '#FF9800', borderColor: '#FF9800' }}
                      >
                        Làm ảnh chính
                      </Button>
                    </Tooltip>
                    <Button 
                      size="small" 
                      danger 
                      onClick={() => handleSubUrlChange(idx, '')}
                      disabled={!url.trim()}
                    >
                      Xóa URL
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
};
