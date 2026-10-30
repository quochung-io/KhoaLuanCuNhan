import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Card, 
  Tabs, 
  Rate, 
  Input, 
  Select, 
  Modal, 
  Form, 
  DatePicker, 
  InputNumber, 
  Popconfirm, 
  Tooltip, 
  Row, 
  Col, 
  Statistic, 
  Image,
  Badge
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  PlusOutlined, 
  PercentageOutlined, 
  StarOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PoweroffOutlined,
  GiftOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { promotionService, reviewAdminService } from '../services/api';

const { Option } = Select;

interface PromotionItem {
  id: number;
  promotionId?: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  discountFormatted?: string;
  startDate: string;
  endDate: string;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  status: string;
}

interface ReviewItem {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail?: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  isPurchased?: boolean;
  helpfulCount?: number;
  reportCount?: number;
  status: string;
  createdAt: string;
  images?: string[];
}

export const PromotionsReviews: React.FC = () => {
  // ── Tab 1: Khuyến mãi (Promotions) ──────────────────────
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoSearch, setPromoSearch] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState('all');

  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);
  const [promoForm] = Form.useForm();
  const [submittingPromo, setSubmittingPromo] = useState(false);

  // ── Tab 2: Đánh giá (Reviews) ────────────────────────────
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | undefined>(undefined);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize, setReviewPageSize] = useState(10);
  const [reviewTotal, setReviewTotal] = useState(0);

  const [reviewStats, setReviewStats] = useState({
    total: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  });

  // Tải danh sách Khuyến mãi từ API
  const fetchPromotions = async () => {
    setLoadingPromos(true);
    try {
      const res = await promotionService.getAll({
        search: promoSearch || undefined,
        status: promoStatusFilter !== 'all' ? promoStatusFilter : undefined
      });
      setPromotions(res.data || []);
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách khuyến mãi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingPromos(false);
    }
  };

  // Tải danh sách Đánh giá từ API
  const fetchReviews = async (page = reviewPage, pageSize = reviewPageSize) => {
    setLoadingReviews(true);
    try {
      const res = await reviewAdminService.getAll({
        status: reviewStatusFilter !== 'all' ? reviewStatusFilter : undefined,
        search: reviewSearch || undefined,
        star: reviewStarFilter,
        page,
        pageSize
      });
      if (res.data) {
        setReviews(res.data.reviews || []);
        setReviewTotal(res.data.filteredCount || res.data.total || 0);
        setReviewStats({
          total: res.data.total || 0,
          pendingCount: res.data.pendingCount || 0,
          approvedCount: res.data.approvedCount || 0,
          rejectedCount: res.data.rejectedCount || 0
        });
      }
    } catch (err: any) {
      message.error('Lỗi khi tải danh sách đánh giá: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [promoStatusFilter]);

  useEffect(() => {
    fetchReviews(1, reviewPageSize);
  }, [reviewStatusFilter, reviewStarFilter]);

  // ── Xử lý Khuyến mãi ────────────────────────────────────
  const handleOpenPromoModal = (promo?: PromotionItem) => {
    promoForm.resetFields();
    if (promo) {
      setEditingPromo(promo);
      promoForm.setFieldsValue({
        code: promo.code,
        name: promo.name,
        discountType: promo.discountType || 'Percent',
        discountValue: promo.discountValue,
        minOrderAmount: promo.minOrderAmount || 0,
        maxDiscount: promo.maxDiscount,
        dateRange: [
          promo.startDate ? dayjs(promo.startDate) : null,
          promo.endDate ? dayjs(promo.endDate) : null
        ],
        usageLimit: promo.usageLimit,
        status: promo.status === 'expired' ? 'Inactive' : (promo.status === 'active' ? 'Active' : 'Inactive')
      });
    } else {
      setEditingPromo(null);
      promoForm.setFieldsValue({
        discountType: 'Percent',
        discountValue: 10,
        minOrderAmount: 100000,
        dateRange: [dayjs(), dayjs().add(1, 'month')],
        status: 'Active'
      });
    }
    setPromoModalVisible(true);
  };

  const handleSavePromo = async () => {
    try {
      const values = await promoForm.validateFields();
      setSubmittingPromo(true);

      const payload = {
        code: values.code?.trim().toUpperCase(),
        name: values.name?.trim(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderAmount: values.minOrderAmount || 0,
        maxDiscount: values.maxDiscount || null,
        startDate: values.dateRange?.[0] ? values.dateRange[0].format('YYYY-MM-DD') : null,
        endDate: values.dateRange?.[1] ? values.dateRange[1].format('YYYY-MM-DD') : null,
        usageLimit: values.usageLimit || null,
        status: values.status || 'Active'
      };

      if (editingPromo) {
        await promotionService.update(editingPromo.id, payload);
        message.success(`Đã cập nhật mã khuyến mãi [${payload.code}]!`);
      } else {
        await promotionService.create(payload);
        message.success(`Đã tạo mới mã khuyến mãi [${payload.code}] thành công!`);
      }

      setPromoModalVisible(false);
      fetchPromotions();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Lỗi khi lưu mã khuyến mãi.');
    } finally {
      setSubmittingPromo(false);
    }
  };

  const handleTogglePromoStatus = async (id: number) => {
    try {
      const res = await promotionService.toggleStatus(id);
      message.success(res.data?.message || 'Đã đổi trạng thái mã khuyến mãi.');
      fetchPromotions();
    } catch (err: any) {
      message.error('Lỗi khi đổi trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePromo = async (id: number) => {
    try {
      await promotionService.delete(id);
      message.success('Đã xóa mã khuyến mãi thành công.');
      fetchPromotions();
    } catch (err: any) {
      message.error('Lỗi khi xóa mã khuyến mãi: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Xử lý Đánh giá ──────────────────────────────────────
  const handleUpdateReviewStatus = async (id: number, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    try {
      await reviewAdminService.updateStatus(id, newStatus);
      const actionText = newStatus === 'Approved' ? 'Duyệt hiển thị' : (newStatus === 'Rejected' ? 'Ẩn' : 'Chuyển chờ duyệt');
      message.success(`Đã ${actionText} đánh giá #${id}!`);
      fetchReviews();
    } catch (err: any) {
      message.error('Lỗi cập nhật đánh giá: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      await reviewAdminService.delete(id);
      message.success(`Đã xóa đánh giá #${id} khỏi hệ thống.`);
      fetchReviews();
    } catch (err: any) {
      message.error('Lỗi khi xóa đánh giá: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── Bảng Khuyến mãi ─────────────────────────────────────
  const promoColumns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 70, 
      render: (id: number) => <Tag color="default">#{id}</Tag> 
    },
    { 
      title: 'Mã Voucher', 
      dataIndex: 'code', 
      key: 'code', 
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 700, fontSize: 13, padding: '3px 10px', letterSpacing: '0.5px' }}>
          {text}
        </Tag>
      ) 
    },
    { 
      title: 'Tên Chương Trình', 
      dataIndex: 'name', 
      key: 'name', 
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span> 
    },
    { 
      title: 'Mức Giảm', 
      key: 'discount', 
      render: (_: any, r: PromotionItem) => {
        let display = r.discountFormatted;
        if (!display) {
          const type = (r.discountType || '').toLowerCase();
          display = type === 'percent' ? `${r.discountValue}%` : (type === 'ship' ? 'Freeship' : `${Number(r.discountValue).toLocaleString('vi-VN')} đ`);
        }
        return <span style={{ color: '#16a34a', fontWeight: 700 }}>{display}</span>;
      }
    },
    { 
      title: 'Đơn Tối Thiểu', 
      dataIndex: 'minOrderAmount', 
      key: 'minOrderAmount',
      render: (val: number) => (
        <span style={{ color: '#64748b' }}>
          {val > 0 ? `${Number(val).toLocaleString('vi-VN')} đ` : 'Không giới hạn'}
        </span>
      )
    },
    { 
      title: 'Thời Gian Áp Dụng', 
      key: 'time', 
      render: (_: any, r: PromotionItem) => (
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <div>Từ: {r.startDate || 'Ngay'}</div>
          <div>Đến: <b>{r.endDate || 'Vô thời hạn'}</b></div>
        </div>
      )
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => {
        const s = (status || '').toLowerCase();
        let color = 'default';
        let label = 'TẠM TẮT';
        if (s === 'active') {
          color = 'success';
          label = 'ĐANG ÁP DỤNG';
        } else if (s === 'expired') {
          color = 'error';
          label = 'HẾT HIỆU LỰC';
        }
        return <Tag color={color} style={{ borderRadius: 999, fontWeight: 600 }}>{label}</Tag>;
      } 
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: any, r: PromotionItem) => (
        <Space size="small">
          <Tooltip title={r.status === 'active' ? 'Tạm ngưng mã này' : 'Kích hoạt lại'}>
            <Button 
              size="small" 
              icon={<PoweroffOutlined />} 
              onClick={() => handleTogglePromoStatus(r.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa thông tin">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenPromoModal(r)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa mã khuyến mãi này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeletePromo(r.id)}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ── Bảng Đánh giá ───────────────────────────────────────
  const reviewColumns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 70, 
      render: (id: number) => <Tag color="default">#{id}</Tag> 
    },
    { 
      title: 'Khách Hàng', 
      key: 'customer', 
      width: 170,
      render: (_: any, r: ReviewItem) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.customerName}</div>
          {r.customerEmail && <div style={{ fontSize: 11, color: '#888' }}>{r.customerEmail}</div>}
          {r.isPurchased && (
            <Tag color="cyan" style={{ fontSize: 10, marginTop: 3 }}>Đã mua hàng</Tag>
          )}
        </div>
      ) 
    },
    { 
      title: 'Sản Phẩm', 
      dataIndex: 'productName', 
      key: 'productName', 
      width: 170,
      render: (p: string) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{p}</span> 
    },
    { 
      title: 'Đánh Giá', 
      dataIndex: 'rating', 
      key: 'rating', 
      width: 130,
      render: (val: number) => (
        <div>
          <Rate disabled defaultValue={val} value={val} style={{ fontSize: 12 }} />
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{val} / 5 sao</div>
        </div>
      ) 
    },
    { 
      title: 'Nội Dung Nhận Xét & Hình Ảnh', 
      key: 'commentContent', 
      render: (_: any, r: ReviewItem) => (
        <div>
          <div style={{ color: '#1e293b', fontSize: 13, lineHeight: '1.5' }}>{r.comment || '—'}</div>
          {r.images && r.images.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {r.images.map((img, idx) => (
                <Image 
                  key={idx} 
                  src={img} 
                  width={42} 
                  height={42} 
                  style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0' }} 
                />
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            🕒 {r.createdAt}
          </div>
        </div>
      ) 
    },
    { 
      title: 'Trạng Thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 130,
      render: (status: string) => {
        const s = (status || 'Approved').toLowerCase();
        let color = 'green';
        let label = 'ĐÃ DUYỆT';
        let icon = <CheckCircleOutlined />;
        if (s === 'pending') {
          color = 'gold';
          label = 'CHỜ DUYỆT';
          icon = <ClockCircleOutlined />;
        } else if (s === 'rejected') {
          color = 'red';
          label = 'ĐÃ ẨN';
          icon = <StopOutlined />;
        }
        return (
          <Tag color={color} icon={icon} style={{ borderRadius: 999, fontWeight: 600 }}>
            {label}
          </Tag>
        );
      }
    },
    { 
      title: 'Kiểm Duyệt', 
      key: 'actions', 
      width: 150,
      render: (_: any, record: ReviewItem) => {
        const s = (record.status || 'Approved').toLowerCase();
        return (
          <Space size="small">
            {s !== 'approved' && (
              <Tooltip title="Duyệt đánh giá này hiển thị công khai trên App & Website">
                <Button 
                  size="small" 
                  icon={<CheckOutlined />} 
                  type="primary" 
                  onClick={() => handleUpdateReviewStatus(record.id, 'Approved')}
                >
                  Duyệt
                </Button>
              </Tooltip>
            )}
            {s !== 'rejected' && (
              <Tooltip title="Ẩn đánh giá vi phạm hoặc nội dung không phù hợp">
                <Button 
                  size="small" 
                  icon={<CloseOutlined />} 
                  danger 
                  onClick={() => handleUpdateReviewStatus(record.id, 'Rejected')}
                >
                  Ẩn
                </Button>
              </Tooltip>
            )}
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?"
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteReview(record.id)}
            >
              <Button size="small" icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Card */}
      <Card 
        style={{ borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <PercentageOutlined />
              </div>
              <div>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  Quản Lý Khuyến Mãi & Duyệt Đánh Giá Khách Hàng
                </span>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>
                  Dữ liệu trực tiếp từ Database hệ thống • Tự động kích hoạt voucher và kiểm duyệt đánh giá thời gian thực
                </div>
              </div>
            </div>
          </div>
        }
      >
        <Tabs 
          defaultActiveKey="1"
          items={[
            // ────────────────────────────────────────────────────────
            // TAB 1: KHUYẾN MÃI / VOUCHER
            // ────────────────────────────────────────────────────────
            {
              key: '1',
              label: (
                <Space>
                  <GiftOutlined />
                  <span>Chương Trình Khuyến Mãi ({promotions.length})</span>
                </Space>
              ),
              children: (
                <div>
                  {/* Toolbar Khuyến mãi */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <Space wrap>
                      <Input
                        placeholder="Tìm theo mã hoặc tên voucher..."
                        prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                        value={promoSearch}
                        onChange={(e) => setPromoSearch(e.target.value)}
                        onPressEnter={fetchPromotions}
                        style={{ width: 280 }}
                        allowClear
                      />
                      <Select 
                        value={promoStatusFilter} 
                        onChange={setPromoStatusFilter} 
                        style={{ width: 170 }}
                      >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="active">Đang áp dụng</Option>
                        <Option value="expired">Hết hiệu lực</Option>
                        <Option value="inactive">Tạm ngưng</Option>
                      </Select>
                      <Button icon={<SearchOutlined />} onClick={fetchPromotions}>
                        Tìm kiếm
                      </Button>
                      <Button icon={<ReloadOutlined />} onClick={fetchPromotions} loading={loadingPromos}>
                        Làm mới
                      </Button>
                    </Space>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => handleOpenPromoModal()}
                      style={{ fontWeight: 600 }}
                    >
                      Tạo Mã Khuyến Mãi Mới
                    </Button>
                  </div>

                  <Table 
                    columns={promoColumns} 
                    dataSource={promotions} 
                    rowKey="id"
                    loading={loadingPromos}
                    pagination={{ pageSize: 8, showSizeChanger: true }}
                    bordered
                  />
                </div>
              )
            },

            // ────────────────────────────────────────────────────────
            // TAB 2: ĐÁNH GIÁ SẢN PHẨM
            // ────────────────────────────────────────────────────────
            {
              key: '2',
              label: (
                <Space>
                  <StarOutlined />
                  <span>
                    Duyệt Đánh Giá Khách Hàng ({reviewStats.total})
                    {reviewStats.pendingCount > 0 && (
                      <Badge count={reviewStats.pendingCount} style={{ marginLeft: 6, backgroundColor: '#faad14' }} />
                    )}
                  </span>
                </Space>
              ),
              children: (
                <div>
                  {/* Thống kê nhanh đánh giá */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={12} sm={6}>
                      <Card size="small" style={{ borderRadius: 8, background: '#f8fafc' }}>
                        <Statistic 
                          title="Tổng Đánh Giá" 
                          value={reviewStats.total} 
                          prefix={<MessageOutlined style={{ color: '#1677ff' }} />}
                          valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" style={{ borderRadius: 8, background: '#fffbe6' }}>
                        <Statistic 
                          title="Chờ Kiểm Duyệt" 
                          value={reviewStats.pendingCount} 
                          prefix={<ClockCircleOutlined style={{ color: '#d48806' }} />}
                          valueStyle={{ color: '#d48806', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" style={{ borderRadius: 8, background: '#f6ffed' }}>
                        <Statistic 
                          title="Đã Phê Duyệt" 
                          value={reviewStats.approvedCount} 
                          prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                          valueStyle={{ color: '#52c41a', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small" style={{ borderRadius: 8, background: '#fff1f0' }}>
                        <Statistic 
                          title="Đã Ẩn / Vi Phạm" 
                          value={reviewStats.rejectedCount} 
                          prefix={<StopOutlined style={{ color: '#cf1322' }} />}
                          valueStyle={{ color: '#cf1322', fontWeight: 700 }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Toolbar Đánh giá */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <Space wrap>
                      <Input
                        placeholder="Tìm theo khách hàng, sản phẩm hoặc nhận xét..."
                        prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        onPressEnter={() => fetchReviews(1, reviewPageSize)}
                        style={{ width: 300 }}
                        allowClear
                      />
                      <Select 
                        value={reviewStatusFilter} 
                        onChange={setReviewStatusFilter} 
                        style={{ width: 160 }}
                      >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="pending">⏳ Chờ duyệt</Option>
                        <Option value="approved"> Đã duyệt</Option>
                        <Option value="rejected">🚫 Đã ẩn</Option>
                      </Select>
                      <Select 
                        placeholder="Lọc số sao" 
                        value={reviewStarFilter} 
                        onChange={setReviewStarFilter} 
                        style={{ width: 140 }}
                        allowClear
                      >
                        <Option value={5}>⭐⭐⭐⭐⭐ (5 sao)</Option>
                        <Option value={4}>⭐⭐⭐⭐ (4 sao)</Option>
                        <Option value={3}>⭐⭐⭐ (3 sao)</Option>
                        <Option value={2}>⭐⭐ (2 sao)</Option>
                        <Option value={1}>⭐ (1 sao)</Option>
                      </Select>
                      <Button icon={<SearchOutlined />} onClick={() => fetchReviews(1, reviewPageSize)}>
                        Lọc
                      </Button>
                      <Button icon={<ReloadOutlined />} onClick={() => fetchReviews(reviewPage, reviewPageSize)} loading={loadingReviews}>
                        Làm mới
                      </Button>
                    </Space>
                  </div>

                  <Table 
                    columns={reviewColumns} 
                    dataSource={reviews} 
                    rowKey="id"
                    loading={loadingReviews}
                    pagination={{
                      current: reviewPage,
                      pageSize: reviewPageSize,
                      total: reviewTotal,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} trên tổng số ${total} đánh giá`,
                      onChange: (page, pageSize) => {
                        setReviewPage(page);
                        setReviewPageSize(pageSize);
                        fetchReviews(page, pageSize);
                      }
                    }}
                    bordered
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* ── MODAL TẠO / SỬA KHUYẾN MÃI ─────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700 }}>
            <GiftOutlined style={{ color: '#16a34a' }} />
            {editingPromo ? `Chỉnh Sửa Mã Khuyến Mãi [${editingPromo.code}]` : 'Tạo Mới Mã Khuyến Mãi / Voucher'}
          </div>
        }
        open={promoModalVisible}
        onCancel={() => setPromoModalVisible(false)}
        onOk={handleSavePromo}
        confirmLoading={submittingPromo}
        okText={editingPromo ? 'Cập Nhật' : 'Tạo Mã'}
        cancelText="Đóng"
        width={600}
        destroyOnClose
      >
        <Form form={promoForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="code" 
                label="Mã Voucher" 
                rules={[
                  { required: true, message: 'Vui lòng nhập mã voucher' },
                  { pattern: /^[A-Z0-9_-]+$/, message: 'Chỉ gồm chữ hoa không dấu và số' }
                ]}
              >
                <Input placeholder="VD: TET2026, FREESHIP" style={{ textTransform: 'uppercase', fontWeight: 700 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="discountType" 
                label="Loại Giảm Giá" 
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Percent">Phần trăm (%)</Option>
                  <Option value="Fixed">Trừ tiền cố định (₫)</Option>
                  <Option value="Ship">Miễn phí vận chuyển (Freeship)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="name" 
            label="Tên Chương Trình Khuyến Mãi" 
            rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
          >
            <Input placeholder="VD: Giảm 15% Nông Sản Mùa Vụ Tết" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="discountValue" 
                label="Giá Trị Giảm" 
                rules={[{ required: true, message: 'Vui lòng nhập mức giảm' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={1} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="VD: 15 (%) hoặc 30000 (₫)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrderAmount" label="Giá Trị Đơn Tối Thiểu (₫)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0 (Không áp dụng)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxDiscount" label="Giảm Tối Đa (₫) (Nếu theo %)">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Để trống nếu không giới hạn"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Số Lượng Lượt Dùng Tối Đa">
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={1} 
                  placeholder="Để trống nếu không giới hạn"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item 
                name="dateRange" 
                label="Thời Gian Hiệu Lực (Bắt Đầu - Kết Thúc)" 
                rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
              >
                <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng Thái">
                <Select>
                  <Option value="Active">Đang Áp Dụng</Option>
                  <Option value="Inactive">Tạm Ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
