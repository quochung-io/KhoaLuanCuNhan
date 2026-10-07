import React, { useEffect, useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Tag, 
  message, 
  Card, 
  Row, 
  Col, 
  Alert, 
  Statistic, 
  Popconfirm 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ClearOutlined,
  PercentageOutlined,
  UndoOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { productBatchService, productService, userService } from '../services/api';

interface Product {
  productId: number;
  productName: string;
}

interface ProductBatch {
  batchId: number;
  productId: number;
  product?: Product;
  farmId: number;
  batchCode: string;
  initialQuantity: number;
  unit: string;
  harvestDate: string;
  receivedDate?: string;
  expiryDate: string;
  status?: string;
  createdAt?: string;
}

interface ClearanceCandidate {
  productId: number;
  productName: string;
  unit: string;
  categoryName: string;
  currentPrice: number;
  originalPrice: number;
  currentDiscountPercent: number;
  batchId: number;
  batchCode: string;
  batchQuantity: number;
  expiryDate: string;
  daysRemaining: number;
  recommendedDiscountPercent: number;
  recommendedSalePrice: number;
  urgencyLevel: string;
  suggestionNote: string;
  isDiscountActive: boolean;
}

export const Batches: React.FC = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isWritingOff, setIsWritingOff] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [form] = Form.useForm();

  // States cho Quản Lý Giảm Giá Cận Hạn (Dynamic Markdown / Clearance Modal)
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<ClearanceCandidate[]>([]);
  const [candidateDiscounts, setCandidateDiscounts] = useState<Record<number, number>>({});
  const [loadingClearance, setLoadingClearance] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // States Tìm Kiếm & Bộ Lọc Lô Hàng & Nguồn Gốc (Tất cả thành phần trong bảng)
  const [searchCodeOrId, setSearchCodeOrId] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [filterFarmId, setFilterFarmId] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFefo, setFilterFefo] = useState<string>('all');
  const [harvestDateRange, setHarvestDateRange] = useState<any>(null);

  // Helper lấy tên sản phẩm
  const getProductName = (r: ProductBatch) => {
    return r.product?.productName || products.find(p => p.productId === r.productId)?.productName || `Nông sản #${r.productId}`;
  };

  // Helper lấy thông tin nông trại
  const getFarmInfo = (farmId: number) => {
    const sup = suppliers.find(s => s.farm?.farmId === farmId || s.supplierId === farmId || s.userId === farmId);
    if (sup?.farm?.farmName) {
      return { name: sup.farm.farmName, province: sup.farm.province || 'Lâm Đồng' };
    }
    if (sup?.fullName) {
      return { name: sup.fullName, province: 'Đà Lạt' };
    }
    return { name: `Nông trại #${farmId}`, province: 'Đà Lạt' };
  };

  // Tính ma trận thống kê hạn dùng FEFO theo thời gian thực (Traffic Light System)
  const fefoStats = useMemo(() => {
    const today = dayjs().startOf('day');
    return batches.reduce(
      (acc, b) => {
        acc.total++;
        const exp = dayjs(b.expiryDate).startOf('day');
        const diff = exp.diff(today, 'day');
        if (diff < 0 || b.status === 'Expired') {
          acc.expired++;
        } else if (diff <= 3) {
          acc.urgent++;
        } else if (diff <= 5) {
          acc.warning++;
        } else {
          acc.safe++;
        }
        return acc;
      },
      { total: 0, safe: 0, warning: 0, urgent: 0, expired: 0 }
    );
  }, [batches]);

  const isFiltering = Boolean(
    searchCodeOrId.trim() ||
    searchProductName.trim() ||
    filterFarmId !== 'all' ||
    filterStatus !== 'all' ||
    filterFefo !== 'all' ||
    (harvestDateRange && harvestDateRange.length === 2 && harvestDateRange[0] && harvestDateRange[1])
  );

  const handleResetFilters = () => {
    setSearchCodeOrId('');
    setSearchProductName('');
    setFilterFarmId('all');
    setFilterStatus('all');
    setFilterFefo('all');
    setHarvestDateRange(null);
  };

  const filteredBatches = batches.filter(b => {
    // 1. Mã Lô hoặc ID (Hỗ trợ #1, ID: 1, 1...)
    if (searchCodeOrId.trim()) {
      const q = searchCodeOrId.trim().toLowerCase();
      const cleanQ = q.replace(/^(#|id\s*:?\s*|lô\s*:?\s*|mã\s*:?\s*)/i, '').trim();
      const bIdStr = b.batchId.toString();
      const pIdStr = b.productId ? b.productId.toString() : '';
      const matchId = bIdStr === cleanQ || bIdStr.includes(cleanQ) || (`#${bIdStr}`).includes(q) || pIdStr === cleanQ || (`#${pIdStr}`).includes(q);
      const matchCode = (b.batchCode || '').toLowerCase().includes(q) || (cleanQ ? (b.batchCode || '').toLowerCase().includes(cleanQ) : false);
      if (!matchId && !matchCode) return false;
    }

    // 2. Tên sản phẩm (Không phân biệt HOA/thường, hỗ trợ cả tiếng Việt có/không dấu)
    if (searchProductName.trim()) {
      const q = searchProductName.trim().toLowerCase();
      const qNorm = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      const pName = getProductName(b).toLowerCase();
      const pNameNorm = pName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      if (!pName.includes(q) && !pNameNorm.includes(qNorm)) return false;
    }

    // 3. Nông trại / Vườn
    if (filterFarmId !== 'all') {
      if (b.farmId !== filterFarmId) return false;
    }

    // 4. Trạng thái
    if (filterStatus !== 'all') {
      if ((b.status || 'Active') !== filterStatus) return false;
    }

    // 5. Tình trạng Hạn sử dụng (FEFO)
    if (filterFefo !== 'all') {
      const now = dayjs().startOf('day');
      const exp = dayjs(b.expiryDate).startOf('day');
      const diffDays = exp.diff(now, 'day');
      const isExpired = diffDays < 0 || b.status === 'Expired';
      if (filterFefo === 'expired' && !isExpired) return false;
      if (filterFefo === 'urgent' && (isExpired || diffDays > 3)) return false;
      if (filterFefo === 'warning' && (isExpired || diffDays <= 3 || diffDays > 5)) return false;
      if (filterFefo === 'safe' && (isExpired || diffDays <= 5)) return false;
    }

    // 6. Khoảng ngày thu hoạch
    if (harvestDateRange && harvestDateRange.length === 2 && harvestDateRange[0] && harvestDateRange[1]) {
      const hDate = dayjs(b.harvestDate);
      const start = harvestDateRange[0].startOf('day');
      const end = harvestDateRange[1].endOf('day');
      if (hDate.isBefore(start) || hDate.isAfter(end)) return false;
    }

    return true;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, batchRes, supRes] = await Promise.all([
        productService.getAll(),
        productBatchService.getAll(),
        userService.getSuppliers().catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data || []);
      setBatches(batchRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách lô hàng nông sản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tự động quét và khóa toàn bộ lô quá hạn
  const handleAutoScanExpired = async () => {
    setIsScanning(true);
    try {
      const res = await productBatchService.autoScanExpired();
      message.success(res.data?.message || 'Đã quét và khóa các lô hàng hết hạn!');
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi quét tự động lô hết hạn.');
    } finally {
      setIsScanning(false);
    }
  };

  // Tự động quét và áp dụng Auto Markdown FEFO cho toàn bộ nông sản cận hạn
  const handleAutoSyncClearance = async () => {
    setIsScanning(true);
    try {
      const res = await productBatchService.autoSyncClearance();
      message.success(res.data?.message || 'Đã tự động đồng bộ khuyến mãi xả hàng cận hạn!');
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi đồng bộ tự động.');
    } finally {
      setIsScanning(false);
    }
  };

  // Xuất hủy (Write-off) lô quá hạn hoặc cận hạn hỏng
  const handleWriteOff = async (batchId: number, batchCode: string) => {
    setIsWritingOff(true);
    try {
      const res = await productBatchService.writeOff(batchId, 'Xuất tiêu hủy do quá hạn sử dụng theo chuẩn FEFO');
      message.success(res.data?.message || `Đã xuất hủy thành công lô hàng ${batchCode}.`);
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Xuất hủy lô hàng thất bại.');
    } finally {
      setIsWritingOff(false);
    }
  };

  // ── Mở Modal Quản Lý Xả Hàng Cận Hạn (Dynamic Markdown) ──
  const handleOpenClearanceModal = async () => {
    setIsClearanceModalOpen(true);
    setLoadingClearance(true);
    try {
      const res = await productBatchService.getClearanceCandidates();
      const data: ClearanceCandidate[] = res.data || [];
      setCandidates(data);
      const initDiscounts: Record<number, number> = {};
      data.forEach(c => {
        initDiscounts[c.productId] = c.currentDiscountPercent > 0 ? c.currentDiscountPercent : c.recommendedDiscountPercent;
      });
      setCandidateDiscounts(initDiscounts);
    } catch (error) {
      message.error('Không thể tải danh sách nông sản cận hạn.');
    } finally {
      setLoadingClearance(false);
    }
  };

  // Áp dụng mức giảm giá cho 1 sản phẩm
  const handleApplySingleProduct = async (productId: number) => {
    const discount = candidateDiscounts[productId] || 30;
    try {
      await productBatchService.applyClearanceDiscount([{ productId, discountPercent: discount }]);
      message.success(`Đã áp dụng giảm giá -${discount}% cho sản phẩm thành công!`);
      await handleOpenClearanceModal();
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi áp dụng giảm giá.');
    }
  };

  // Áp dụng hàng loạt cho tất cả các sản phẩm cận hạn theo đề xuất FEFO
  const handleApplyAllRecommended = async () => {
    if (candidates.length === 0) {
      message.info('Không có sản phẩm nào cận hạn cần áp dụng giảm giá.');
      return;
    }
    setApplyingDiscount(true);
    try {
      const items = candidates.map(c => ({
        productId: c.productId,
        discountPercent: candidateDiscounts[c.productId] || c.recommendedDiscountPercent
      }));
      const res = await productBatchService.applyClearanceDiscount(items);
      message.success(res.data?.message || 'Đã áp dụng khuyến mãi xả hàng cận hạn thành công cho tất cả sản phẩm!');
      await handleOpenClearanceModal();
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi áp dụng giảm giá.');
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Khôi phục giá gốc cho 1 sản phẩm
  const handleRevertSingleProduct = async (productId: number) => {
    try {
      await productBatchService.revertClearanceDiscount([productId]);
      message.success('Đã khôi phục giá gốc thành công!');
      await handleOpenClearanceModal();
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi khôi phục giá gốc.');
    }
  };

  // Khôi phục tất cả về giá gốc
  const handleRevertAll = async () => {
    if (candidates.length === 0) return;
    try {
      const pids = candidates.map(c => c.productId);
      await productBatchService.revertClearanceDiscount(pids);
      message.success('Đã khôi phục giá gốc cho tất cả sản phẩm cận hạn!');
      await handleOpenClearanceModal();
      await loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi khôi phục giá gốc.');
    }
  };

  const handleOpenAdd = () => {
    setEditingBatch(null);
    form.resetFields();
    const defaultFarmId = suppliers[0]?.farm?.farmId || suppliers[0]?.supplierId || 1;
    form.setFieldsValue({
      batchCode: 'LHN-' + Math.floor(100000 + Math.random() * 900000),
      farmId: defaultFarmId,
      unit: 'kg',
      initialQuantity: 100,
      harvestDate: dayjs(),
      expiryDate: dayjs().add(12, 'day'),
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch: ProductBatch) => {
    setEditingBatch(batch);
    form.setFieldsValue({
      productId: batch.productId,
      farmId: batch.farmId,
      batchCode: batch.batchCode,
      initialQuantity: batch.initialQuantity,
      unit: batch.unit,
      harvestDate: dayjs(batch.harvestDate),
      expiryDate: dayjs(batch.expiryDate),
      status: batch.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa lô hàng',
      content: 'Bạn có chắc chắn muốn xóa lô hàng này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await productBatchService.delete(id);
          message.success('Xóa lô hàng thành công.');
          loadData();
        } catch (error) {
          message.error('Xóa lô hàng thất bại.');
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (values.expiryDate.isBefore(values.harvestDate) || values.expiryDate.isSame(values.harvestDate, 'day')) {
        message.error('Hạn sử dụng phải sau ngày thu hoạch ít nhất 1 ngày!');
        return;
      }

      const payload = {
        ...values,
        harvestDate: values.harvestDate.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
      };

      if (editingBatch) {
        await productBatchService.update(editingBatch.batchId, { ...editingBatch, ...payload });
        message.success('Cập nhật lô hàng thành công.');
      } else {
        await productBatchService.create(payload);
        message.success('Thêm lô hàng nông sản mới thành công.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || 'Lưu lô hàng thất bại.');
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'batchId', 
      key: 'batchId', 
      width: 75,
      sorter: (a: ProductBatch, b: ProductBatch) => a.batchId - b.batchId,
      defaultSortOrder: 'descend' as const,
      render: (id: number) => <Tag color="blue">#{id}</Tag>
    },
    { 
      title: 'Mã Lô (QR Code)', 
      dataIndex: 'batchCode', 
      key: 'batchCode',
      sorter: (a: ProductBatch, b: ProductBatch) => a.batchCode.localeCompare(b.batchCode),
      render: (code: string) => (
        <Tag color="cyan" icon={<SafetyCertificateOutlined />} style={{ fontWeight: 600, fontSize: '12px' }}>
          {code}
        </Tag>
      )
    },
    { 
      title: 'Sản phẩm nông sản', 
      key: 'productName',
      sorter: (a: ProductBatch, b: ProductBatch) => getProductName(a).localeCompare(getProductName(b)),
      render: (_: any, record: ProductBatch) => (
        <div>
          <b style={{ color: '#1b5e20', fontSize: '13.5px' }}>{getProductName(record)}</b>
          <div style={{ fontSize: '11px', color: '#888' }}>Mã SP: #{record.productId}</div>
        </div>
      )
    },
    {
      title: 'Nông trại / Xuất xứ',
      key: 'farm',
      sorter: (a: ProductBatch, b: ProductBatch) => getFarmInfo(a.farmId).name.localeCompare(getFarmInfo(b.farmId).name),
      render: (_: any, r: ProductBatch) => {
        const f = getFarmInfo(r.farmId);
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#2e7d32' }}>🏡 {f.name}</div>
            <div style={{ fontSize: '11.5px', color: '#666' }}>📍 {f.province}</div>
          </div>
        );
      }
    },
    { 
      title: 'Tồn kho khả dụng', 
      key: 'initialQuantity', 
      sorter: (a: ProductBatch, b: ProductBatch) => a.initialQuantity - b.initialQuantity,
      render: (_: any, r: ProductBatch) => (
        <div>
          <span style={{ 
            fontWeight: 700, 
            fontSize: '13.5px',
            color: r.initialQuantity <= 0 ? '#8c8c8c' : '#1b5e20' 
          }}>
            {r.initialQuantity} {r.unit}
          </span>
          {r.initialQuantity <= 0 && (
            <div style={{ fontSize: '10.5px', color: '#ff4d4f' }}>Hết hàng</div>
          )}
        </div>
      )
    },
    { 
      title: 'Ngày thu hoạch', 
      dataIndex: 'harvestDate', 
      key: 'harvestDate',
      sorter: (a: ProductBatch, b: ProductBatch) => dayjs(a.harvestDate).unix() - dayjs(b.harvestDate).unix(),
      render: (date: string) => (
        <span style={{ color: '#15803d', fontWeight: 500 }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      )
    },
    { 
      title: 'Hạn sử dụng (HSD)', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      sorter: (a: ProductBatch, b: ProductBatch) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
      render: (date: string, r: ProductBatch) => {
        const now = dayjs().startOf('day');
        const exp = dayjs(date).startOf('day');
        const diffDays = exp.diff(now, 'day');
        const isExpired = diffDays < 0 || r.status === 'Expired';
        const isUrgent = !isExpired && diffDays <= 3;
        const isWarning = !isExpired && diffDays > 3 && diffDays <= 5;

        return (
          <div>
            <div style={{ 
              color: isExpired ? '#cf1322' : isUrgent ? '#d4380d' : isWarning ? '#d46b08' : '#389e0d', 
              fontWeight: 700,
              fontSize: '13px'
            }}>
              {exp.format('DD/MM/YYYY')}
            </div>
            {isExpired ? (
              <Tag color="error" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>Đã hết hạn</Tag>
            ) : isUrgent ? (
              <Tag color="volcano" style={{ fontSize: '11px', margin: '2px 0 0 0', fontWeight: 600 }}>Cận hạn ({diffDays} ngày)</Tag>
            ) : isWarning ? (
              <Tag color="warning" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>Còn {diffDays} ngày</Tag>
            ) : (
              <Tag color="success" style={{ fontSize: '11px', margin: '2px 0 0 0' }}>An toàn ({diffDays} ngày)</Tag>
            )}
          </div>
        );
      }
    },
    { 
      title: 'Chiến lược FEFO & Khuyến nghị', 
      key: 'fefoAction',
      width: 220,
      render: (_: any, r: ProductBatch) => {
        const now = dayjs().startOf('day');
        const exp = dayjs(r.expiryDate).startOf('day');
        const diffDays = exp.diff(now, 'day');
        const isExpired = diffDays < 0 || r.status === 'Expired';

        if (isExpired) {
          return (
            <Space direction="vertical" size={2}>
              <Tag color="#434343" icon={<CloseCircleOutlined />} style={{ fontWeight: 600 }}>
                HẾT HẠN - KHÓA BÁN
              </Tag>
              {r.initialQuantity > 0 ? (
                <Popconfirm
                  title="Xác nhận xuất hủy lô hàng?"
                  description="Thao tác này sẽ đưa tồn kho về 0 và chuyển trạng thái Expired."
                  okText="Xuất tiêu hủy"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: isWritingOff }}
                  onConfirm={() => handleWriteOff(r.batchId, r.batchCode)}
                >
                  <Button 
                    size="small" 
                    danger 
                    type="primary" 
                    icon={<ClearOutlined />} 
                    style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}
                  >
                    Xuất hủy (Write-off)
                  </Button>
                </Popconfirm>
              ) : (
                <span style={{ fontSize: '11px', color: '#8c8c8c' }}>Đã thanh lý / Tồn 0</span>
              )}
            </Space>
          );
        }

        if (diffDays <= 3) {
          return (
            <div>
              <Tag color="error" icon={<FireOutlined />} style={{ fontWeight: 700, margin: 0 }}>
                ⚡ ƯU TIÊN XUẤT KHO (FEFO)
              </Tag>
              <div style={{ fontSize: '11px', color: '#cf1322', marginTop: 2, fontWeight: 500 }}>
                Khuyến nghị: Giảm 30% - 50%
              </div>
              <Button 
                size="small" 
                icon={<PercentageOutlined />} 
                onClick={handleOpenClearanceModal}
                style={{ fontSize: '11px', height: '22px', marginTop: 4, color: '#d4380d', borderColor: '#ffbb96' }}
              >
                Cấu hình xả hàng
              </Button>
            </div>
          );
        }

        if (diffDays <= 5) {
          return (
            <div>
              <Tag color="warning" icon={<ClockCircleOutlined />} style={{ fontWeight: 600, margin: 0 }}>
                CẦN CHÚ Ý THEO DÕI
              </Tag>
              <div style={{ fontSize: '11px', color: '#d46b08', marginTop: 2 }}>
                Khuyến nghị: Giảm 20% xả sớm
              </div>
            </div>
          );
        }

        return (
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
            Tồn kho an toàn
          </Tag>
        );
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 95,
      sorter: (a: ProductBatch, b: ProductBatch) => (a.status || 'Active').localeCompare(b.status || 'Active'),
      render: (st?: string) => {
        if (st === 'Expired') return <Tag color="error">Expired</Tag>;
        if (st === 'Active' || !st) return <Tag color="green">Active</Tag>;
        return <Tag color="default">{st}</Tag>;
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      width: 140,
      render: (_: any, record: ProductBatch) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Sửa</Button>
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.batchId)}>Xóa</Button>
        </Space>
      )
    }
  ];

  // Bảng hiển thị danh sách nông sản cận hạn trong Modal Clearance
  const clearanceColumns = [
    {
      title: 'Sản phẩm & Danh mục',
      key: 'product',
      render: (_: any, c: ClearanceCandidate) => (
        <div>
          <b style={{ color: '#1b5e20', fontSize: '13.5px' }}>{c.productName}</b>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {c.categoryName} · Mã SP: #{c.productId}
          </div>
        </div>
      )
    },
    {
      title: 'Lô cận hạn nhất',
      key: 'batch',
      render: (_: any, c: ClearanceCandidate) => (
        <div>
          <Tag color="cyan">{c.batchCode}</Tag>
          <div style={{ fontSize: '11.5px', marginTop: 2 }}>
            Tồn khả dụng: <b>{c.batchQuantity} {c.unit}</b>
          </div>
          <div style={{ fontSize: '11px', color: c.daysRemaining <= 1 ? '#cf1322' : c.daysRemaining <= 3 ? '#d4380d' : '#d46b08', fontWeight: 600 }}>
            HSD: {dayjs(c.expiryDate).format('DD/MM/YYYY')} (Còn {c.daysRemaining} ngày)
          </div>
        </div>
      )
    },
    {
      title: 'Giá gốc',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render: (p: number, c: ClearanceCandidate) => (
        <span style={{ fontWeight: 600 }}>{p.toLocaleString('vi-VN')} đ / {c.unit}</span>
      )
    },
    {
      title: '% Khuyến mãi xả hàng',
      key: 'discountInput',
      width: 150,
      render: (_: any, c: ClearanceCandidate) => {
        const val = candidateDiscounts[c.productId] ?? c.recommendedDiscountPercent;
        return (
          <Space direction="vertical" size={2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <InputNumber
                min={5}
                max={90}
                value={val}
                formatter={v => `${v}%`}
                parser={v => (v ? parseInt(v.replace('%', '')) : 0)}
                onChange={v => {
                  if (v !== null) {
                    setCandidateDiscounts(prev => ({ ...prev, [c.productId]: v }));
                  }
                }}
                style={{ width: 85 }}
              />
              <Tag color={c.daysRemaining <= 1 ? 'red' : c.daysRemaining <= 3 ? 'volcano' : 'gold'}>
                Gợi ý {c.recommendedDiscountPercent}%
              </Tag>
            </div>
            <span style={{ fontSize: '10.5px', color: '#8c8c8c' }}>
              {c.daysRemaining <= 1 ? 'Xả gấp 50%' : c.daysRemaining <= 3 ? 'Flash sale 30-40%' : 'Giảm nhẹ 20%'}
            </span>
          </Space>
        );
      }
    },
    {
      title: 'Giá bán sau giảm',
      key: 'salePrice',
      render: (_: any, c: ClearanceCandidate) => {
        const discount = candidateDiscounts[c.productId] ?? c.recommendedDiscountPercent;
        const finalPrice = Math.round(c.originalPrice * (100 - discount) / 100);
        return (
          <div>
            <div style={{ color: '#cf1322', fontWeight: 700, fontSize: '13.5px' }}>
              {finalPrice.toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: '11px', color: '#8c8c8c', textDecoration: 'line-through' }}>
              {c.originalPrice.toLocaleString('vi-VN')} đ
            </div>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, c: ClearanceCandidate) => {
        if (c.isDiscountActive) {
          return (
            <Tag color="success" icon={<FireOutlined />}>
              Đang giảm -{c.currentDiscountPercent}%
            </Tag>
          );
        }
        return <Tag color="default">Chưa áp dụng</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, c: ClearanceCandidate) => (
        <Space size="small">
          <Button 
            size="small" 
            type="primary" 
            style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
            onClick={() => handleApplySingleProduct(c.productId)}
          >
            Áp dụng
          </Button>
          {c.isDiscountActive && (
            <Button 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRevertSingleProduct(c.productId)}
            >
              Hủy giảm
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── THỐNG KÊ MA TRẬN FEFO TRAFFIC LIGHT (ĐÈN GIAO THÔNG) ── */}
      <Row gutter={[16, 16]}>
        {/* Thẻ 1: Lô An Toàn */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setFilterFefo(filterFefo === 'safe' ? 'all' : 'safe')}
            style={{ 
              borderRadius: 12, 
              borderColor: filterFefo === 'safe' ? '#52c41a' : '#d9f7be',
              background: filterFefo === 'safe' ? '#f6ffed' : '#ffffff',
              boxShadow: filterFefo === 'safe' ? '0 0 0 2px #52c41a' : undefined,
              cursor: 'pointer'
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#389e0d' }}>🟢 An Toàn (&gt; 5 Ngày)</span>}
              value={fefoStats.safe}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>/ {fefoStats.total} lô</span>}
              valueStyle={{ color: '#389e0d', fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ fontSize: '11.5px', color: '#73d13d', marginTop: 6 }}>
              Hàng bảo quản tốt, phân phối bình thường
            </div>
          </Card>
        </Col>

        {/* Thẻ 2: Cần Chú Ý */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setFilterFefo(filterFefo === 'warning' ? 'all' : 'warning')}
            style={{ 
              borderRadius: 12, 
              borderColor: filterFefo === 'warning' ? '#faad14' : '#ffe58f',
              background: filterFefo === 'warning' ? '#fffbe6' : '#ffffff',
              boxShadow: filterFefo === 'warning' ? '0 0 0 2px #faad14' : undefined,
              cursor: 'pointer'
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#d46b08' }}>🟡 Cần Chú Ý (3 - 5 Ngày)</span>}
              value={fefoStats.warning}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>lô</span>}
              valueStyle={{ color: '#d46b08', fontWeight: 700 }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ fontSize: '11.5px', color: '#faad14', marginTop: 6 }}>
              Lên kế hoạch điều phối, khuyến nghị giảm 20%
            </div>
          </Card>
        </Col>

        {/* Thẻ 3: Khẩn Cấp Cận Hạn */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setFilterFefo(filterFefo === 'urgent' ? 'all' : 'urgent')}
            style={{ 
              borderRadius: 12, 
              borderColor: filterFefo === 'urgent' ? '#ff4d4f' : '#ffa39e',
              background: filterFefo === 'urgent' ? '#fff1f0' : '#ffffff',
              boxShadow: filterFefo === 'urgent' ? '0 0 0 2px #ff4d4f' : undefined,
              cursor: 'pointer'
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 700, color: '#cf1322' }}>🔴 Cận Hạn Khẩn Cấp (1 - 3 Ngày)</span>}
              value={fefoStats.urgent}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>lô</span>}
              valueStyle={{ color: '#cf1322', fontWeight: 800 }}
              prefix={<FireOutlined />}
            />
            <div style={{ fontSize: '11.5px', color: '#cf1322', marginTop: 6, fontWeight: 500 }}>
              ⚡ Ưu tiên xuất kho (FEFO) · Giảm 30% - 50%
            </div>
          </Card>
        </Col>

        {/* Thẻ 4: Đã Quá Hạn */}
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setFilterFefo(filterFefo === 'expired' ? 'all' : 'expired')}
            style={{ 
              borderRadius: 12, 
              borderColor: filterFefo === 'expired' ? '#595959' : '#d9d9d9',
              background: filterFefo === 'expired' ? '#f5f5f5' : '#ffffff',
              boxShadow: filterFefo === 'expired' ? '0 0 0 2px #595959' : undefined,
              cursor: 'pointer'
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#434343' }}>⚫ Đã Quá Hạn Sử Dụng</span>}
              value={fefoStats.expired}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>lô</span>}
              valueStyle={{ color: '#434343', fontWeight: 700 }}
              prefix={<CloseCircleOutlined />}
            />
            <div style={{ fontSize: '11.5px', color: '#8c8c8c', marginTop: 6 }}>
              Khóa xuất kho, thủ tục xuất tiêu hủy
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── BANNER CẢNH BÁO QUẢN TRỊ VÒNG ĐỜI NÔNG SẢN FEFO ── */}
      {(fefoStats.urgent > 0 || fefoStats.warning > 0 || fefoStats.expired > 0) && (
        <Alert
          type={fefoStats.expired > 0 ? "error" : "warning"}
          showIcon
          style={{ marginBottom: 16, borderRadius: 10, border: '1px solid' }}
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <b style={{ fontSize: '14px' }}>Cảnh Báo Vòng Đời Nông Sản (FEFO):</b>
                {fefoStats.urgent > 0 && (
                  <span style={{ marginLeft: 8, color: '#cf1322' }}>
                    Có <b>{fefoStats.urgent}</b> lô hàng cận hạn (1-3 ngày) cần đẩy bán ưu tiên!
                  </span>
                )}
                {fefoStats.expired > 0 && (
                  <span style={{ marginLeft: 8, color: '#434343' }}>
                    Phát hiện <b>{fefoStats.expired}</b> lô hàng đã hết hạn cần xuất tiêu hủy / cách ly kho.
                  </span>
                )}
              </div>
              <Space wrap>
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<PercentageOutlined />}
                  style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                  onClick={handleOpenClearanceModal}
                >
                  Xả Hàng Cận Hạn (-20% đến -50%)
                </Button>
                <Button 
                  size="small" 
                  icon={<ThunderboltOutlined />} 
                  loading={isScanning} 
                  onClick={handleAutoSyncClearance}
                  style={{ backgroundColor: '#fff7e6', color: '#d46b08', borderColor: '#ffd591', fontWeight: 600 }}
                  title="Tự động quét và áp dụng mức giảm 20% - 50% cho tất cả sản phẩm cận hạn"
                >
                  ⚡ Tự Động Áp Khuyến Mãi Cận Date
                </Button>
                {fefoStats.urgent > 0 && (
                  <Button 
                    size="small" 
                    type="primary" 
                    danger 
                    icon={<FireOutlined />}
                    onClick={() => setFilterFefo('urgent')}
                  >
                    Lọc Lô Cần Xả Gấp
                  </Button>
                )}
                <Button 
                  size="small" 
                  icon={<CloseCircleOutlined />}
                  loading={isScanning}
                  onClick={handleAutoScanExpired}
                >
                  Quét & Khóa Lô Hết Hạn
                </Button>
              </Space>
            </div>
          }
        />
      )}

      {/* ── CARD BẢNG DỮ LIỆU & TÌM KIẾM ── */}
      <Card 
        style={{ borderRadius: 14 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <SafetyCertificateOutlined />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Quản Lý Lô Hàng Nông Sản & Kiểm Soát Hạn Dùng FEFO</span>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Thuật toán First-Expired, First-Out đảm bảo nông sản luôn tươi mới</div>
            </div>
          </div>
        }
        extra={
          <Space>
            <Button 
              icon={<PercentageOutlined />} 
              type="primary"
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              onClick={handleOpenClearanceModal}
            >
              Chiến Lược Khuyến Mãi Cận Hạn
            </Button>
            <Button 
              icon={<ThunderboltOutlined />} 
              loading={isScanning}
              onClick={handleAutoScanExpired}
              title="Quét toàn bộ lô trong hệ thống và tự động chuyển trạng thái Expired cho các lô quá hạn"
            >
              Quét Hạn Dùng
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
              Thêm Lô Hàng Mới
            </Button>
          </Space>
        }
      >
        {/* KHUNG TÌM KIẾM & BỘ LỌC TẤT CẢ THÀNH PHẦN TRONG BẢNG LÔ HÀNG */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '16px', 
          marginBottom: '16px' 
        }}>
          <Row gutter={[12, 12]} align="middle">
            {/* 1. Mã Lô hoặc ID Lô */}
            <Col xs={24} sm={12} md={4}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Mã Lô / ID Lô:
              </div>
              <Input
                placeholder="Nhập ID hoặc mã (VD: LHN-)..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                allowClear
                value={searchCodeOrId}
                onChange={e => setSearchCodeOrId(e.target.value)}
              />
            </Col>

            {/* 2. Tên Nông Sản */}
            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Tên nông sản:
              </div>
              <Input
                placeholder="Tìm theo tên nông sản..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                allowClear
                value={searchProductName}
                onChange={e => setSearchProductName(e.target.value)}
              />
            </Col>

            {/* 3. Nông trại / Xuất xứ */}
            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Nông trại / Xuất xứ:
              </div>
              <Select
                style={{ width: '100%' }}
                placeholder="Tất cả nông trại"
                value={filterFarmId}
                onChange={val => setFilterFarmId(val)}
                showSearch
                filterOption={(input, option) =>
                  ((option?.children as any) || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Select.Option value="all">Tất cả nông trại ({suppliers.length})</Select.Option>
                {suppliers.map(s => {
                  const fid = s.farm?.farmId || s.supplierId || s.userId;
                  const fName = s.farm?.farmName || `${s.fullName} Farm`;
                  return (
                    <Select.Option key={fid} value={fid}>
                      🏡 {fName}
                    </Select.Option>
                  );
                })}
              </Select>
            </Col>

            {/* 4. Tình trạng hạn dùng (FEFO) */}
            <Col xs={24} sm={12} md={4}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Phân loại hạn dùng (FEFO):
              </div>
              <Select
                style={{ width: '100%' }}
                value={filterFefo}
                onChange={val => setFilterFefo(val)}
              >
                <Select.Option value="all">Tất cả hạn dùng ({batches.length})</Select.Option>
                <Select.Option value="safe">🟢 An toàn (&gt; 5 ngày)</Select.Option>
                <Select.Option value="warning">🟡 Cần chú ý (3 - 5 ngày)</Select.Option>
                <Select.Option value="urgent">🔴 Cận hạn khẩn cấp (≤ 3 ngày)</Select.Option>
                <Select.Option value="expired">⚫ Đã quá hạn sử dụng</Select.Option>
              </Select>
            </Col>

            {/* 5. Khoảng ngày thu hoạch */}
            <Col xs={24} sm={12} md={4}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Ngày thu hoạch:
              </div>
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                value={harvestDateRange}
                onChange={val => setHarvestDateRange(val)}
              />
            </Col>

            {/* 6. Nút Đặt lại */}
            <Col xs={24} sm={12} md={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleResetFilters}
                style={{ width: '100%' }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>

          {/* Dòng tóm tắt & lọc trạng thái */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: '12.5px', color: '#64748b' }}>
            <div>
              Tìm thấy: <b style={{ color: '#16a34a', fontSize: '13.5px' }}>{filteredBatches.length}</b> / {batches.length} lô hàng
              {isFiltering && (
                <Tag color="processing" style={{ marginLeft: 8 }}>
                  Đang áp dụng bộ lọc
                </Tag>
              )}
            </div>
            <Space size="small">
              <span style={{ fontSize: '12px', color: '#64748b' }}>Trạng thái:</span>
              <Select 
                size="small"
                style={{ width: 150 }} 
                value={filterStatus} 
                onChange={val => setFilterStatus(val)}
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="Active">Active (Hoạt động)</Select.Option>
                <Select.Option value="Expired">Expired (Hết hạn)</Select.Option>
                <Select.Option value="Inactive">Inactive (Tạm khóa)</Select.Option>
              </Select>
            </Space>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredBatches} 
          rowKey="batchId" 
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} lô hàng` }}
        />
      </Card>

      {/* ── MODAL CHIẾN LƯỢC KHUYẾN MÃI XẢ HÀNG CẬN HẠN (DYNAMIC MARKDOWN) ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PercentageOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
            <span style={{ fontSize: '16px', fontWeight: 700 }}>
              Chiến Lược Khuyến Mãi & Xả Hàng Nông Sản Cận Hạn (Dynamic Markdown)
            </span>
          </div>
        }
        open={isClearanceModalOpen}
        onCancel={() => setIsClearanceModalOpen(false)}
        width={1000}
        footer={[
          <Button key="revert" icon={<UndoOutlined />} onClick={handleRevertAll}>
            Khôi Phục Tất Cả Về Giá Gốc
          </Button>,
          <Button key="close" onClick={() => setIsClearanceModalOpen(false)}>
            Đóng
          </Button>,
          <Button 
            key="applyAll" 
            type="primary" 
            icon={<FireOutlined />}
            loading={applyingDiscount}
            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
            onClick={handleApplyAllRecommended}
          >
            🚀 Áp Dụng Giảm Giá Hàng Loạt Theo Đề Xuất
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert 
            type="info" 
            showIcon 
            message={
              <div>
                <b>Quy tắc định mức khuyến mãi tự động theo hạn dùng (DTE):</b>
                <div style={{ fontSize: '12px', marginTop: 4 }}>
                  • <b>Còn 1 ngày:</b> Giảm <b>50%</b> (Xả gấp thu hồi chi phí trước khi phải xuất hủy)<br />
                  • <b>Còn 2 ngày:</b> Giảm <b>40%</b> (Kích thích người tiêu dùng mua nấu ăn ngay trong ngày)<br />
                  • <b>Còn 3 ngày:</b> Giảm <b>30%</b> (Đẩy nhanh tốc độ quay vòng kho)<br />
                  • <b>Còn 4 - 5 ngày:</b> Giảm <b>20%</b> (Giữ chân biên lợi nhuận mỏng, hạn chế hàng đọng)
                </div>
              </div>
            }
          />
        </div>

        <Table
          columns={clearanceColumns}
          dataSource={candidates}
          rowKey="productId"
          loading={loadingClearance}
          pagination={false}
          locale={{ emptyText: 'Hiện không có sản phẩm nào cận hạn (≤ 5 ngày). Toàn bộ kho đang ở mức an toàn!' }}
        />
      </Modal>

      {/* ── MODAL THÊM / SỬA LÔ HÀNG ── */}
      <Modal
        title={editingBatch ? 'Cập Nhật Lô Hàng' : 'Khai Báo Lô Hàng Nông Sản Mới'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="batchCode" label="Mã lô hàng" rules={[{ required: true, message: 'Nhập mã lô hàng' }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="productId" label="Sản phẩm nông sản" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
            <Select placeholder="Chọn sản phẩm">
              {products.map(p => (
                <Select.Option key={p.productId} value={p.productId}>{p.productName}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="farmId" label="Nông trại / Vùng canh tác" rules={[{ required: true, message: 'Chọn nông trại' }]}>
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

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name="initialQuantity" label="Số lượng ban đầu" rules={[{ required: true, message: 'Nhập số lượng' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Đơn vị tính' }]}>
                <Input placeholder="kg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name="harvestDate" label="Ngày thu hoạch" rules={[{ required: true, message: 'Chọn ngày thu hoạch' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="expiryDate" 
                label="Hạn sử dụng" 
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
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                  placeholder="Chọn hạn dùng"
                  disabledDate={(current) => {
                    const harvest = form.getFieldValue('harvestDate');
                    return harvest ? current && current <= harvest.startOf('day') : false;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Expired">Expired</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
