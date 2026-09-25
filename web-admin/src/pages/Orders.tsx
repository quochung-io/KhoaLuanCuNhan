import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Select, Tag, message, Card, Tooltip, Steps, Input, DatePicker, Row, Col } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderService } from '../services/api';

interface OrderItem {
  orderItemId: number;
  productId: number;
  product?: {
    productName: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface Order {
  orderId: number;
  customerId: number;
  customer?: {
    fullName: string;
    email: string;
  };
  address?: {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    addressType?: string;
  };
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  orderItems: OrderItem[];
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();

  // States Tìm Kiếm & Bộ Lọc Đơn Hàng & Vận Hành (Tất cả thành phần trong bảng)
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [orderDateRange, setOrderDateRange] = useState<any>(null);

  const isFiltering = Boolean(
    searchOrderId.trim() ||
    searchCustomer.trim() ||
    searchAddress.trim() ||
    filterOrderStatus !== 'all' ||
    filterPaymentStatus !== 'all' ||
    (orderDateRange && orderDateRange.length === 2 && orderDateRange[0] && orderDateRange[1])
  );

  const handleResetFilters = () => {
    setSearchOrderId('');
    setSearchCustomer('');
    setSearchAddress('');
    setFilterOrderStatus('all');
    setFilterPaymentStatus('all');
    setOrderDateRange(null);
  };

  const filteredOrders = orders.filter(o => {
    // 1. Mã đơn hàng (ID)
    if (searchOrderId.trim()) {
      const q = searchOrderId.trim().toLowerCase().replace('#', '').replace('ord-', '');
      const matchId = o.orderId.toString().includes(q);
      if (!matchId) return false;
    }

    // 2. Khách hàng (Tên, SĐT, Email, Tên người nhận)
    if (searchCustomer.trim()) {
      const q = searchCustomer.trim().toLowerCase();
      const matchCustomer = (o.customer?.fullName || '').toLowerCase().includes(q);
      const matchEmail = (o.customer?.email || '').toLowerCase().includes(q);
      const matchReceiver = (o.address?.receiverName || '').toLowerCase().includes(q);
      const matchPhone = (o.address?.phone || '').includes(q);
      if (!matchCustomer && !matchEmail && !matchReceiver && !matchPhone) return false;
    }

    // 3. Địa chỉ giao đến (Quận, Huyện, Tỉnh, Địa chỉ chi tiết)
    if (searchAddress.trim()) {
      const q = searchAddress.trim().toLowerCase();
      const addr = [
        o.address?.addressDetail,
        o.address?.ward,
        o.address?.district,
        o.address?.province,
        o.address?.addressType
      ].filter(Boolean).join(' ').toLowerCase();
      if (!addr.includes(q)) return false;
    }

    // 4. Trạng thái đơn hàng (Vận hành)
    if (filterOrderStatus !== 'all') {
      if ((o.orderStatus || '').toLowerCase() !== filterOrderStatus.toLowerCase()) return false;
    }

    // 5. Trạng thái thanh toán
    if (filterPaymentStatus !== 'all') {
      const p = (o.paymentStatus || '').toLowerCase();
      if (filterPaymentStatus === 'Paid' && p !== 'paid') return false;
      if (filterPaymentStatus === 'Refunded' && p !== 'refunded') return false;
      if (filterPaymentStatus === 'Pending' && (p === 'paid' || p === 'refunded')) return false;
    }

    // 6. Khoảng ngày đặt hàng
    if (orderDateRange && orderDateRange.length === 2 && orderDateRange[0] && orderDateRange[1]) {
      const orderDate = dayjs(o.createdAt);
      const start = orderDateRange[0].startOf('day');
      const end = orderDateRange[1].endOf('day');
      if (orderDate.isBefore(start) || orderDate.isAfter(end)) return false;
    }

    return true;
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getNextAllowedStatuses = (current?: string) => {
    switch (current?.toLowerCase()) {
      case 'pending':
        return [
          { value: 'Confirmed', label: 'Confirmed (Xác nhận đơn)' },
          { value: 'Cancelled', label: 'Cancelled (Hủy đơn hàng - Tự động hoàn kho)' },
        ];
      case 'confirmed':
        return [
          { value: 'Shipping', label: 'Shipping (Đang giao hàng)' },
          { value: 'Cancelled', label: 'Cancelled (Hủy đơn hàng - Tự động hoàn kho)' },
        ];
      case 'shipping':
        return [
          { value: 'Completed', label: 'Completed (Giao hàng thành công)' },
          { value: 'Cancelled', label: 'Cancelled (Giao thất bại / Hủy đơn - Tự động hoàn kho)' },
          { value: 'Returned', label: 'Returned (Khách trả hàng - Tự động hoàn kho)' },
        ];
      case 'completed':
        return [
          { value: 'Returned', label: 'Returned (Trả hàng / Hoàn tiền - Tự động hoàn kho)' },
        ];
      default:
        return [];
    }
  };

  const handleOpenEdit = (order: Order) => {
    const isTerminal = ['cancelled', 'returned'].includes(order.orderStatus?.toLowerCase());
    if (isTerminal) {
      message.warning(`Đơn hàng #${order.orderId} đã ở trạng thái kết thúc (${order.orderStatus}), không thể đổi trạng thái.`);
      return;
    }
    setSelectedOrder(order);
    form.resetFields();
    setIsEditModalOpen(true);
  };

  const handleOpenView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const executeUpdateStatus = async (orderId: number, status: string) => {
    try {
      const res = await orderService.updateStatus(orderId, { orderStatus: status });
      message.success(res.data?.message || 'Cập nhật trạng thái đơn hàng thành công.');
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      const newStatus = values.orderStatus;

      // Xác nhận an toàn cho các trạng thái kết thúc (Terminal states)
      if (newStatus === 'Cancelled') {
        Modal.confirm({
          title: 'Xác nhận hủy đơn hàng & Hoàn kho',
          content: `Bạn có chắc chắn muốn HỦY đơn hàng #${selectedOrder.orderId}? Hệ thống sẽ tự động hoàn trả số lượng các sản phẩm trong đơn về kho theo chuẩn ACID!`,
          okText: 'Xác nhận hủy & Hoàn kho',
          cancelText: 'Quay lại',
          okType: 'danger',
          onOk: async () => {
            await executeUpdateStatus(selectedOrder.orderId, newStatus);
          }
        });
        return;
      }

      if (newStatus === 'Returned') {
        Modal.confirm({
          title: 'Xác nhận trả hàng & Hoàn tiền (Rollback)',
          content: `Xác nhận khách hàng TRẢ HÀNG đơn #${selectedOrder.orderId}? Hệ thống sẽ tự động hoàn trả toàn bộ số lượng sản phẩm về kho tương ứng và cập nhật trạng thái thanh toán là Đã hoàn tiền (Refunded)!`,
          okText: 'Xác nhận Trả hàng & Hoàn kho',
          cancelText: 'Quay lại',
          okType: 'danger',
          onOk: async () => {
            await executeUpdateStatus(selectedOrder.orderId, newStatus);
          }
        });
        return;
      }

      if (newStatus === 'Completed') {
        Modal.confirm({
          title: 'Xác nhận hoàn tất đơn hàng',
          content: `Xác nhận khách hàng đã nhận hàng và hoàn tất đơn hàng #${selectedOrder.orderId}? Trạng thái thanh toán sẽ tự động chuyển sang Đã thanh toán (Paid).`,
          okText: 'Xác nhận hoàn tất',
          cancelText: 'Quay lại',
          onOk: async () => {
            await executeUpdateStatus(selectedOrder.orderId, newStatus);
          }
        });
        return;
      }

      await executeUpdateStatus(selectedOrder.orderId, newStatus);
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    }
  };

  const getStatusTagColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'gold';
      case 'confirmed': return 'blue';
      case 'shipping': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'returned': return 'volcano';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Giao thành công';
      case 'cancelled': return 'Đã hủy';
      case 'returned': return 'Trả hàng / Hoàn tiền';
      default: return status || 'Chờ xử lý';
    }
  };

  const columns = [
    { 
      title: 'Mã Đơn', 
      dataIndex: 'orderId', 
      key: 'orderId', 
      width: 95,
      sorter: (a: Order, b: Order) => a.orderId - b.orderId,
      defaultSortOrder: 'descend' as const,
      render: (id: number) => <Tag color="geekblue" style={{ fontWeight: 600 }}>#{id}</Tag>
    },
    { 
      title: 'Khách hàng & Liên hệ', 
      key: 'customerName',
      sorter: (a: Order, b: Order) => (a.customer?.fullName || '').localeCompare(b.customer?.fullName || ''),
      render: (_: any, record: Order) => (
        <div>
          <b style={{ color: '#1b5e20' }}>{record.customer?.fullName || record.address?.receiverName || `Khách hàng #${record.customerId}`}</b>
          {record.address?.phone && (
            <div style={{ fontSize: '11.5px', color: '#1677ff' }}>📞 {record.address.phone}</div>
          )}
          {record.customer?.email && (
            <div style={{ fontSize: '11px', color: '#888' }}>{record.customer.email}</div>
          )}
        </div>
      )
    },
    { 
      title: 'Giao đến (Địa chỉ)', 
      key: 'shippingAddress',
      render: (_: any, record: Order) => (
        record.address ? (
          <div>
            <Tag color={record.address.addressType === 'Công ty' ? 'blue' : 'green'} style={{ marginBottom: 2, fontSize: 11 }}>
              {record.address.addressType === 'Công ty' ? '🏢 Công ty' : '🏠 Nhà ở'}
            </Tag>
            <div style={{ fontSize: '12px', color: '#444', maxWidth: 220 }} className="truncate">
              {record.address.addressDetail ? `${record.address.addressDetail}, ` : ''}{record.address.district}, {record.address.province}
            </div>
          </div>
        ) : <span style={{ color: '#999' }}>-</span>
      )
    },
    { 
      title: 'Ngày đặt', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      width: 140,
      sorter: (a: Order, b: Order) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => (
        <span style={{ fontSize: '12px', color: '#555' }}>
          {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'}
        </span>
      )
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      width: 130,
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      render: (val: number) => <strong style={{ color: '#d32f2f' }}>{val.toLocaleString('vi-VN')} đ</strong>
    },
    { 
      title: 'Trạng thái vận hành', 
      dataIndex: 'orderStatus', 
      key: 'orderStatus',
      width: 170,
      sorter: (a: Order, b: Order) => (a.orderStatus || '').localeCompare(b.orderStatus || ''),
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)} style={{ fontWeight: 600 }}>
          {getStatusLabel(status)} ({status?.toUpperCase() || 'PENDING'})
        </Tag>
      )
    },
    { 
      title: 'Thanh toán', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus',
      width: 150,
      sorter: (a: Order, b: Order) => (a.paymentStatus || '').localeCompare(b.paymentStatus || ''),
      render: (text: string) => {
        const isPaid = text?.toLowerCase() === 'paid';
        const isRefunded = text?.toLowerCase() === 'refunded';
        return (
          <Tag color={isPaid ? 'green' : isRefunded ? 'purple' : 'orange'} style={{ fontWeight: 600 }}>
            {isPaid ? 'ĐÃ THANH TOÁN' : isRefunded ? 'ĐÃ HOÀN TIỀN' : 'CHƯA THANH TOÁN'}
          </Tag>
        );
      }
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      width: 160,
      render: (_: any, record: Order) => {
        const isTerminal = ['cancelled', 'returned'].includes(record.orderStatus?.toLowerCase());
        return (
          <Space size="small">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>Chi tiết</Button>
            <Tooltip title={isTerminal ? 'Đơn hàng đã kết thúc (Terminal), không thể đổi trạng thái' : 'Cập nhật trạng thái kế tiếp'}>
              <Button 
                size="small"
                icon={<EditOutlined />} 
                disabled={isTerminal}
                onClick={() => handleOpenEdit(record)}
              >
                Cập nhật
              </Button>
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingOutlined style={{ color: '#2e7d32', fontSize: '20px' }} />
            <span>Quản Lý Đơn Hàng & Vận Hành Chuỗi Cung Ứng</span>
          </div>
        }
      >
        {/* KHUNG TÌM KIẾM & BỘ LỌC ĐƠN HÀNG VẬN HÀNH */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '16px', 
          marginBottom: '16px' 
        }}>
          <Row gutter={[12, 12]} align="middle">
            {/* 1. Mã đơn */}
            <Col xs={24} sm={12} md={4}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Mã đơn hàng:
              </div>
              <Input
                placeholder="Nhập mã đơn (VD: 1, 2)..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                allowClear
                value={searchOrderId}
                onChange={e => setSearchOrderId(e.target.value)}
              />
            </Col>

            {/* 2. Khách hàng / Liên hệ */}
            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Khách hàng / SĐT:
              </div>
              <Input
                placeholder="Tên khách, SĐT, Email..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                allowClear
                value={searchCustomer}
                onChange={e => setSearchCustomer(e.target.value)}
              />
            </Col>

            {/* 3. Địa chỉ giao hàng */}
            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Địa chỉ / Khu vực giao:
              </div>
              <Input
                placeholder="Quận, huyện, tỉnh thành..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                allowClear
                value={searchAddress}
                onChange={e => setSearchAddress(e.target.value)}
              />
            </Col>

            {/* 4. Trạng thái vận hành */}
            <Col xs={24} sm={12} md={4}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Trạng thái vận hành:
              </div>
              <Select
                style={{ width: '100%' }}
                value={filterOrderStatus}
                onChange={val => setFilterOrderStatus(val)}
              >
                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                <Select.Option value="Pending">Chờ xác nhận (Pending)</Select.Option>
                <Select.Option value="Confirmed">Đã xác nhận (Confirmed)</Select.Option>
                <Select.Option value="Shipping">Đang giao hàng (Shipping)</Select.Option>
                <Select.Option value="Completed">Giao thành công (Completed)</Select.Option>
                <Select.Option value="Cancelled">Đã hủy (Cancelled)</Select.Option>
                <Select.Option value="Returned">Trả hàng / Hoàn tiền (Returned)</Select.Option>
              </Select>
            </Col>

            {/* 5. Trạng thái thanh toán */}
            <Col xs={24} sm={12} md={3}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Thanh toán:
              </div>
              <Select
                style={{ width: '100%' }}
                value={filterPaymentStatus}
                onChange={val => setFilterPaymentStatus(val)}
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="Paid">Đã thanh toán</Select.Option>
                <Select.Option value="Pending">Chưa thanh toán</Select.Option>
                <Select.Option value="Refunded">Đã hoàn tiền</Select.Option>
              </Select>
            </Col>

            {/* 6. Nút Đặt lại */}
            <Col xs={24} sm={12} md={3} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleResetFilters}
                style={{ width: '100%' }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>

          {/* Dòng 2: Khoảng ngày đặt hàng & Thống kê kết quả */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '12.5px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Ngày đặt hàng:</span>
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                style={{ width: 240 }}
                value={orderDateRange}
                onChange={val => setOrderDateRange(val)}
              />
            </div>

            <div>
              Tìm thấy: <b style={{ color: '#16a34a', fontSize: '13.5px' }}>{filteredOrders.length}</b> / {orders.length} đơn hàng
              {isFiltering && (
                <Tag color="processing" style={{ marginLeft: 8 }}>
                  Đang áp dụng bộ lọc
                </Tag>
              )}
            </div>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="orderId" 
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} đơn hàng` }}
        />
      </Card>

      {/* Edit Status Modal */}
      <Modal
        title={`Cập Nhật Trạng Thái Đơn Hàng #${selectedOrder?.orderId}`}
        open={isEditModalOpen}
        onOk={handleSaveStatus}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Xác nhận lưu"
        cancelText="Hủy"
      >
        {selectedOrder && (
          <div style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 15, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <div style={{ marginBottom: 4 }}>
                <strong>Trạng thái hiện tại: </strong>
                <Tag color={getStatusTagColor(selectedOrder.orderStatus)}>
                  {(selectedOrder.orderStatus || 'PENDING').toUpperCase()}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                * Hệ thống áp dụng quy chuẩn State Machine: Chỉ cho phép chuyển tiếp sang các trạng thái nghiệp vụ hợp lệ.
              </div>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item 
                name="orderStatus" 
                label="Trạng thái tiếp theo" 
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái tiếp theo!' }]}
              >
                <Select placeholder="Chọn trạng thái hợp lệ tiếp theo">
                  {getNextAllowedStatuses(selectedOrder.orderStatus).map((st) => (
                    <Select.Option key={st.value} value={st.value}>
                      {st.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        title={`Chi Tiết Đơn Hàng #${selectedOrder?.orderId}`}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>Đóng</Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <div style={{ marginTop: 15 }}>
            {/* Tiến trình đơn hàng đồng bộ */}
            <div style={{ margin: '10px 0 18px 0', padding: '12px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
                Tiến trình đơn hàng đồng bộ
              </div>
              <Steps
                size="small"
                current={
                  selectedOrder.orderStatus?.toLowerCase() === 'confirmed' ? 1 :
                  selectedOrder.orderStatus?.toLowerCase() === 'shipping' ? 2 :
                  (selectedOrder.orderStatus?.toLowerCase() === 'completed' || selectedOrder.orderStatus?.toLowerCase() === 'delivered') ? 3 : 0
                }
                status={
                  selectedOrder.orderStatus?.toLowerCase() === 'cancelled' ? 'error' :
                  selectedOrder.orderStatus?.toLowerCase() === 'returned' ? 'error' : 'process'
                }
                items={[
                  { title: 'Đặt hàng' },
                  { title: 'Đã xác nhận' },
                  { title: 'Đang giao' },
                  { title: selectedOrder.orderStatus?.toLowerCase() === 'cancelled' ? 'Đã hủy' : selectedOrder.orderStatus?.toLowerCase() === 'returned' ? 'Trả hàng' : 'Hoàn tất' }
                ]}
              />
            </div>

            <p><strong>Khách hàng:</strong> {selectedOrder.customer?.fullName || `ID: ${selectedOrder.customerId}`}</p>
            <p><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
            <p><strong>Ngày đặt hàng:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
            <p>
              <strong>Trạng thái đơn:</strong>{' '}
              <Tag color={getStatusTagColor(selectedOrder.orderStatus)} style={{ fontWeight: 600 }}>
                {getStatusLabel(selectedOrder.orderStatus)} ({selectedOrder.orderStatus?.toUpperCase() || 'PENDING'})
              </Tag>
            </p>

            {/* Thông tin địa chỉ nhận hàng */}
            {selectedOrder.address && (
              <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', margin: '15px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong>📍 Địa chỉ nhận hàng:</strong>
                  <Tag color={selectedOrder.address.addressType === 'Công ty' ? 'blue' : 'green'}>
                    {selectedOrder.address.addressType === 'Công ty' ? '🏢 Công ty' : '🏠 Nhà ở'}
                  </Tag>
                </div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                  <div><strong>Người nhận:</strong> {selectedOrder.address.receiverName} - <strong>SĐT:</strong> {selectedOrder.address.phone}</div>
                  <div><strong>Địa chỉ:</strong> {selectedOrder.address.addressDetail}, {selectedOrder.address.ward}, {selectedOrder.address.district}, {selectedOrder.address.province}</div>
                </div>
              </div>
            )}
            
            <h4 style={{ marginTop: 20, marginBottom: 10 }}>Danh sách sản phẩm mua</h4>
            <Table
              dataSource={selectedOrder.orderItems}
              columns={[
                { title: 'Sản phẩm', dataIndex: ['product', 'productName'], key: 'productName', render: (text: string, item: OrderItem) => text || `Product ID: ${item.productId}` },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (val: number) => `${val.toLocaleString('vi-VN')} VNĐ` },
                { title: 'Thành tiền', key: 'total', render: (_: any, item: OrderItem) => `${item.totalAmount.toLocaleString('vi-VN')} VNĐ` },
              ]}
              pagination={false}
              rowKey="orderItemId"
              size="small"
            />
            <div style={{ marginTop: 15, textAlign: 'right', fontSize: 16 }}>
              <strong>Tổng cộng đơn hàng: </strong>
              <span style={{ color: 'red', fontSize: 18 }}>{selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
