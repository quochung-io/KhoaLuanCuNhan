import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, Tag, message, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
    { title: 'ID', dataIndex: 'batchId', key: 'batchId', width: 60 },
    { title: 'Mã Lô', dataIndex: 'batchCode', key: 'batchCode' },
    { title: 'Sản phẩm', dataIndex: ['product', 'productName'], key: 'productName', render: (text: string, record: ProductBatch) => text || `ID: ${record.productId}` },
    { title: 'Số lượng ban đầu', key: 'initialQuantity', render: (_: any, r: ProductBatch) => `${r.initialQuantity} ${r.unit}` },
    { 
      title: 'Ngày thu hoạch', 
      dataIndex: 'harvestDate', 
      key: 'harvestDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    { 
      title: 'Hạn sử dụng', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      render: (date: string) => {
        const isExpired = dayjs().isAfter(dayjs(date));
        return (
          <span style={{ color: isExpired ? 'red' : 'inherit', fontWeight: isExpired ? 'bold' : 'normal' }}>
            {dayjs(date).format('DD/MM/YYYY')} {isExpired && '(Hết hạn)'}
          </span>
        );
      }
    },
    { 
      title: 'Chứng nhận', 
      key: 'cert', 
      render: () => <Tag color="green">VietGAP</Tag> 
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: ProductBatch) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.batchId)}>Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title="Quản Lý Lô Hàng Nông Sản & Kiểm Soát Nguồn Gốc (Traceability)" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            Thêm Lô Hàng
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={batches} 
          rowKey="batchId" 
          loading={loading}
          pagination={{ pageSize: 10 }}
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
