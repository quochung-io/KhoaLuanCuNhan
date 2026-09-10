import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Select, Tag, message, Card } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
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

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      orderStatus: order.orderStatus,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      const updatedOrder = { ...selectedOrder, orderStatus: values.orderStatus };
      await orderService.update(selectedOrder.orderId, updatedOrder);
      message.success('Cập nhật trạng thái đơn hàng thành công.');
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại.');
    }
  };

  const getStatusTagColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'gold';
      case 'confirmed': return 'blue';
      case 'shipping': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    { title: 'Mã Đơn', dataIndex: 'orderId', key: 'orderId', width: 90 },
    { 
      title: 'Khách hàng', 
      dataIndex: ['customer', 'fullName'], 
      key: 'customerName', 
      render: (text: string, record: Order) => text || `User ID: ${record.customerId}` 
    },
    { 
      title: 'Giao đến', 
      key: 'shippingAddress',
      render: (_: any, record: Order) => (
        record.address ? (
          <div>
            <Tag color={record.address.addressType === 'Công ty' ? 'blue' : 'green'} style={{ marginBottom: 2, fontSize: 11 }}>
              {record.address.addressType === 'Công ty' ? '🏢 Công ty' : '🏠 Nhà ở'}
            </Tag>
            <div style={{ fontSize: '12px', color: '#555' }}>
              {record.address.receiverName} - {record.address.district}
            </div>
          </div>
        ) : <span style={{ color: '#999' }}>-</span>
      )
    },
    { 
      title: 'Ngày đặt', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A'
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      render: (val: number) => <strong>{val.toLocaleString('vi-VN')} VNĐ</strong>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'orderStatus', 
      key: 'orderStatus',
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>{(status || 'PENDING').toUpperCase()}</Tag>
      )
    },
    { 
      title: 'Thanh toán', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus',
      render: (text: string) => <Tag color={text?.toLowerCase() === 'paid' ? 'green' : 'orange'}>{text || 'UNPAID'}</Tag>
    },
    { 
      title: 'Tác vụ', 
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleOpenView(record)}>Chi tiết</Button>
          <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>Cập nhật</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản Lý Đơn Hàng & Vận Hành">
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="orderId" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Edit Status Modal */}
      <Modal
        title="Cập Nhật Trạng Thái Đơn Hàng"
        open={isEditModalOpen}
        onOk={handleSaveStatus}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="orderStatus" label="Trạng thái đơn hàng" rules={[{ required: true }]}>
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="pending">Pending (Chờ xử lý)</Select.Option>
              <Select.Option value="confirmed">Confirmed (Đã xác nhận)</Select.Option>
              <Select.Option value="shipping">Shipping (Đang giao hàng)</Select.Option>
              <Select.Option value="completed">Completed (Đã hoàn thành)</Select.Option>
              <Select.Option value="cancelled">Cancelled (Đã hủy)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
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
            <p><strong>Khách hàng:</strong> {selectedOrder.customer?.fullName || `ID: ${selectedOrder.customerId}`}</p>
            <p><strong>Email:</strong> {selectedOrder.customer?.email || 'N/A'}</p>
            <p><strong>Ngày đặt hàng:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
            <p><strong>Trạng thái đơn:</strong> <Tag color={getStatusTagColor(selectedOrder.orderStatus)}>{(selectedOrder.orderStatus || 'PENDING').toUpperCase()}</Tag></p>

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
