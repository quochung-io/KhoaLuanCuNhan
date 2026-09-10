import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Card, Tabs, InputNumber, Checkbox, Image, Tag, Tooltip, Row, Col, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, StarOutlined, StarFilled, ThunderboltOutlined, SaveOutlined } from '@ant-design/icons';
import { productService, categoryService, productImageService } from '../services/api';

const SAMPLE_SUB_IMAGES: Record<string, string[]> = {
  'Trái cây': [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&auto=format&fit=crop&q=80'
  ],
  'Gạo': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80'
  ],
  'Hạt': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536591375315-1b838421c0f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&auto=format&fit=crop&q=80'
  ],
  'Rau thơm': [
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80'
  ],
  'Rau củ': [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80'
  ]
};

const SUB_IMAGE_LABELS = [
  'Góc 1: Cận cảnh độ tươi ngon',
  'Góc 2: Vườn trồng / Trang trại',
  'Góc 3: Thu hoạch tại vườn',
  'Góc 4: Đóng gói sạch FreshLock',
  'Góc 5: Chế biến món ăn ngon'
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
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);

  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  
  // States cho Quản lý 1 Ảnh chính & 5 Ảnh phụ
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [primaryUrl, setPrimaryUrl] = useState<string>('');
  const [subUrls, setSubUrls] = useState<string[]>(['', '', '', '', '']);
  const [imgLoading, setImgLoading] = useState(false);

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

  // --- Image Management (1 Ảnh chính + 5 Ảnh phụ) ---
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

      const fiveSubs = [...subs];
      while (fiveSubs.length < 5) fiveSubs.push('');
      setSubUrls(fiveSubs.slice(0, 5));
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
    const catName = selectedProduct.category?.categoryName || 'Rau củ';
    const samples = SAMPLE_SUB_IMAGES[catName] || SAMPLE_SUB_IMAGES['Rau củ'];
    setSubUrls([...samples]);
    message.info(`Đã tự động gợi ý 5 ảnh phụ cho danh mục "${catName}". Vui lòng nhấn "Lưu tất cả ảnh" để ghi nhận.`);
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
      message.success(`Đã lưu thành công cấu hình ảnh (1 ảnh chính + ${payload.filter(p => !p.isPrimary).length} ảnh phụ) cho "${selectedProduct.productName}" vào Database!`);
      setIsImgModalOpen(false);
      loadData();
    } catch (error) {
      message.error('Lưu cấu hình ảnh thất bại.');
    } finally {
      setImgLoading(false);
    }
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
        supplierId: values.supplierId || 2
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
          <Button icon={<PictureOutlined />} style={{ color: '#1890ff', borderColor: '#1890ff' }} onClick={() => handleOpenImages(record)}>Ảnh</Button>
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

      {/* Image Gallery Management Modal (1 Ảnh Chính + 5 Ảnh Phụ) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined style={{ color: '#2E7D32', fontSize: '20px' }} />
            <span>Quản Lý Hình Ảnh (1 Ảnh Chính + 5 Ảnh Phụ): <strong>{selectedProduct?.productName}</strong></span>
          </div>
        }
        open={isImgModalOpen}
        width={860}
        onCancel={() => setIsImgModalOpen(false)}
        footer={[
          <Button key="fill" icon={<ThunderboltOutlined />} onClick={handleFillSampleImages} style={{ float: 'left', color: '#FF9800', borderColor: '#FF9800' }}>
            Gợi ý 5 ảnh phụ mẫu
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

          {/* PHẦN 2: 5 ẢNH PHỤ NHỎ */}
          <Card 
            size="small" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#1B5E20', fontWeight: 700 }}>
                  🖼️ 2. Danh Sách 5 Ảnh Phụ Nhỏ Phía Dưới Ảnh Chính (Secondary Thumbnails)
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
