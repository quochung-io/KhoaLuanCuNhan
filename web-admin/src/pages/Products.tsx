import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Card, Tabs, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productService, categoryService } from '../services/api';

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  status?: string;
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
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [prodForm] = Form.useForm();
  const [catForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await categoryService.getAll();
      setCategories(catRes.data);

      const prodRes = await productService.getAll();
      setProducts(prodRes.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu sản phẩm/danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      content: 'Lưu ý: Xóa danh mục có thể ảnh hưởng đến sản phẩm thuộc danh mục này.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await categoryService.delete(id);
          message.success('Xóa danh mục thành công.');
          loadData();
        } catch (error) {
          message.error('Xóa danh mục thất bại.');
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
    } catch (error) {
      message.error('Lưu danh mục thất bại.');
    }
  };

  // --- Product CRUD ---
  const handleOpenAddProd = () => {
    setEditingProd(null);
    prodForm.resetFields();
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

  const handleDeleteProd = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await productService.delete(id);
          message.success('Xóa sản phẩm thành công.');
          loadData();
        } catch (error) {
          message.error('Xóa sản phẩm thất bại.');
        }
      }
    });
  };

  const handleSaveProd = async () => {
    try {
      const values = await prodForm.validateFields();
      const payload = {
        ...values,
        supplierId: values.supplierId || 2 // Mặc định SupplierId = 2 nếu không chọn
      };

      if (editingProd) {
        await productService.update(editingProd.productId, { ...editingProd, ...payload });
        message.success('Cập nhật sản phẩm thành công.');
      } else {
        await productService.create(payload);
        message.success('Tạo sản phẩm mới thành công.');
      }
      setIsProdModalOpen(false);
      loadData();
    } catch (error) {
      message.error('Lưu sản phẩm thất bại.');
    }
  };

  // --- Columns Config ---
  const catColumns = [
    { title: 'ID', dataIndex: 'categoryId', key: 'categoryId', width: 80 },
    { title: 'Tên danh mục', dataIndex: 'categoryName', key: 'categoryName' },
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

  const prodColumns = [
    { title: 'ID', dataIndex: 'productId', key: 'productId', width: 80 },
    { title: 'Tên nông sản', dataIndex: 'productName', key: 'productName' },
    { title: 'Danh mục', dataIndex: ['category', 'categoryName'], key: 'categoryName', render: (text: string) => text || 'Không có danh mục' },
    { title: 'Giá bán', dataIndex: 'price', key: 'price', render: (val: number) => `${val.toLocaleString('vi-VN')} đ` },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenEditProd(record)}>Sửa</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteProd(record.productId)}>Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản Lý Sản Phẩm & Danh Mục Nông Sản">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Sản Phẩm Nông Sản" key="1">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddProd}>
                Thêm Sản Phẩm
              </Button>
            </div>
            <Table 
              columns={prodColumns} 
              dataSource={products} 
              rowKey="productId" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Danh Mục Nông Sản" key="2">
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
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Product Modal */}
      <Modal
        title={editingProd ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        open={isProdModalOpen}
        onOk={handleSaveProd}
        onCancel={() => setIsProdModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={prodForm} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục sản phẩm' }]}>
            <Select placeholder="Chọn danh mục">
              {categories.map(c => (
                <Select.Option key={c.categoryId} value={c.categoryId}>{c.categoryName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="supplierId" label="Mã nhà cung cấp (Supplier ID)" rules={[{ required: true, message: 'Nhập Supplier ID' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 2" />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: 'Nhập giá bán' }]}>
            <InputNumber min={0} addonAfter="đ" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Nhập đơn vị (kg, bó, túi...)' }]}>
            <Input placeholder="kg" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="Active">Active (Bán)</Select.Option>
              <Select.Option value="Inactive">Inactive (Dừng bán)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
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
    </div>
  );
};
