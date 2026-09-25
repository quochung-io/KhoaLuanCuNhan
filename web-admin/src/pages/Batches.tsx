import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, message, Card, Row, Col } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  SafetyCertificateOutlined
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

export const Batches: React.FC = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [form] = Form.useForm();

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
      const now = dayjs();
      const exp = dayjs(b.expiryDate);
      const diffDays = exp.diff(now, 'day');
      if (filterFefo === 'expired' && diffDays >= 0) return false;
      if (filterFefo === 'warning' && (diffDays < 0 || diffDays > 3)) return false;
      if (filterFefo === 'valid' && diffDays <= 3) return false;
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
      title: 'Sản lượng ban đầu', 
      key: 'initialQuantity', 
      sorter: (a: ProductBatch, b: ProductBatch) => a.initialQuantity - b.initialQuantity,
      render: (_: any, r: ProductBatch) => (
        <span style={{ fontWeight: 600 }}>{r.initialQuantity} {r.unit}</span>
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
      title: 'Hạn sử dụng (FEFO)', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      sorter: (a: ProductBatch, b: ProductBatch) => dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix(),
      render: (date: string) => {
        const now = dayjs();
        const exp = dayjs(date);
        const diffDays = exp.diff(now, 'day');
        const isExpired = diffDays < 0;
        const isExpiringSoon = diffDays >= 0 && diffDays <= 3;
        return (
          <div>
            <div style={{ color: isExpired ? '#cf1322' : (isExpiringSoon ? '#d46b08' : '#389e0d'), fontWeight: 600 }}>
              {exp.format('DD/MM/YYYY')}
            </div>
            {isExpired ? (
              <Tag color="error" style={{ fontSize: '10.5px', padding: '0 4px' }}>Đã hết hạn</Tag>
            ) : isExpiringSoon ? (
              <Tag color="warning" style={{ fontSize: '10.5px', padding: '0 4px' }}>Cận hạn ({diffDays} ngày)</Tag>
            ) : (
              <Tag color="success" style={{ fontSize: '10.5px', padding: '0 4px' }}>Còn {diffDays} ngày</Tag>
            )}
          </div>
        );
      }
    },
    { 
      title: 'Tiêu chuẩn', 
      key: 'cert', 
      width: 100,
      render: () => <Tag color="green">VietGAP</Tag> 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 95,
      sorter: (a: ProductBatch, b: ProductBatch) => (a.status || 'Active').localeCompare(b.status || 'Active'),
      render: (st?: string) => {
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

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafetyCertificateOutlined style={{ color: '#2e7d32', fontSize: '20px' }} />
            <span>Quản Lý Lô Hàng Nông Sản & Kiểm Soát Nguồn Gốc (Traceability)</span>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
            Thêm Lô Hàng
          </Button>
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
                Hạn sử dụng (FEFO):
              </div>
              <Select
                style={{ width: '100%' }}
                value={filterFefo}
                onChange={val => setFilterFefo(val)}
              >
                <Select.Option value="all">Tất cả hạn dùng</Select.Option>
                <Select.Option value="valid">🟢 Còn hạn an toàn (&gt; 3 ngày)</Select.Option>
                <Select.Option value="warning">🟠 Cận hạn (≤ 3 ngày)</Select.Option>
                <Select.Option value="expired">🔴 Đã hết hạn</Select.Option>
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
                style={{ width: 140 }} 
                value={filterStatus} 
                onChange={val => setFilterStatus(val)}
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="Active">Active (Hoạt động)</Select.Option>
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
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
