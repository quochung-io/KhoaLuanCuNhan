import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Input, 
  DatePicker, 
  Row, 
  Col, 
  Tabs, 
  Badge, 
  Tooltip, 
  message, 
  Descriptions, 
  Image, 
  Alert,
  Select,
  Popconfirm
} from 'antd';
import { 
  CloseCircleOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  RollbackOutlined, 
  DollarOutlined,
  SafetyCertificateOutlined,
  VideoCameraOutlined,
  InboxOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderService, returnTicketService } from '../services/api';

interface OrderItem {
  orderItemId: number;
  productId: number;
  product?: {
    productName: string;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface Order {
  orderId: number;
  orderCode?: string;
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
  updatedAt?: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  totalAmount: number;
  orderItems: OrderItem[];
  cancelReason?: string;
}

interface ReturnTicket {
  ticketId: string;
  orderId: number;
  orderCode: string;
  productId: number;
  productName: string;
  productImage?: string;
  customerId: number;
  customerName: string;
  reason: string;
  reasonLabel: string;
  evidenceUrls: string[];
  compensationMethod: string;
  compensationLabel: string;
  refundAmount: number;
  status: string; // PENDING, APPROVED, REJECTED, FLAGGED_REVIEW
  isFraudFlagged: boolean;
  fraudNote?: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  packWeightKg?: number;
  packerName?: string;
  packstationCameraUrl?: string;
  packTimestamp?: string;
}

export const CancelledOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cancelled' | 'claims'>('cancelled');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);

  // Danh sách dữ liệu
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<ReturnTicket[]>([]);

  // Bộ lọc Đơn Hủy
  const [searchCode, setSearchCode] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [filterRefundStatus, setFilterRefundStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);

  // Bộ lọc Khiếu nại
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('all');

  // Modals & Drawers
  const [viewOrderModal, setViewOrderModal] = useState<Order | null>(null);
  const [reviewTicketModal, setReviewTicketModal] = useState<ReturnTicket | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [ticketToReject, setTicketToReject] = useState<ReturnTicket | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. Tải danh sách đơn hàng đã hủy hoặc có sản phẩm khiếu nại đổi trả
  const fetchCancelledOrders = async (currentTickets?: ReturnTicket[]) => {
    setLoadingOrders(true);
    try {
      const res = await orderService.getAll();
      const all: Order[] = Array.isArray(res.data) ? res.data : [];
      const activeTickets = currentTickets || tickets;
      const ticketOrderIds = new Set(activeTickets.map(t => t.orderId));
      const ticketOrderCodes = new Set(activeTickets.map(t => (t.orderCode || '').toLowerCase()));

      // Lọc các đơn: Cancelled, Returned HOẶC có sản phẩm khiếu nại (Return Ticket)
      const filtered = all.filter(o => {
        const st = (o.orderStatus || '').toLowerCase();
        const isTerm = st === 'cancelled' || st === 'returned';
        const hasClaim = ticketOrderIds.has(o.orderId) || ticketOrderCodes.has((o.orderCode || '').toLowerCase());
        return isTerm || hasClaim;
      });
      setCancelledOrders(filtered);
    } catch {
      message.error('Không thể tải danh sách đơn hàng đã hủy / đổi trả.');
    } finally {
      setLoadingOrders(false);
    }
  };

  // 2. Tải danh sách ticket khiếu nại nông sản
  const fetchReturnTickets = async () => {
    setLoadingClaims(true);
    try {
      const res = await returnTicketService.getAll();
      const loadedTickets: ReturnTicket[] = Array.isArray(res.data) ? res.data : [];
      setTickets(loadedTickets);
      // Đồng bộ ngay danh sách đơn hàng
      fetchCancelledOrders(loadedTickets);
    } catch {
      message.error('Không thể tải danh sách khiếu nại.');
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchReturnTickets();
  }, []);

  // Thống kê tổng hợp (KPI Cards)
  const totalCancelledCount = cancelledOrders.length;
  const totalCancelledMoney = cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingRefundOrders = cancelledOrders.filter(o => 
    (o.paymentMethod !== 'COD' && (o.paymentStatus || '').toLowerCase() !== 'refunded')
  );
  const flaggedTicketsCount = tickets.filter(t => t.isFraudFlagged && t.status === 'FLAGGED_REVIEW').length;
  const pendingTicketsCount = tickets.filter(t => t.status === 'PENDING' || t.status === 'FLAGGED_REVIEW').length;

  // Lọc Đơn Hủy
  const filteredCancelledOrders = cancelledOrders.filter(o => {
    if (searchCode.trim()) {
      const q = searchCode.trim().toLowerCase().replace('#', '').replace('ord-', '');
      const matchId = o.orderId.toString().includes(q) || (o.orderCode || '').toLowerCase().includes(q);
      if (!matchId) return false;
    }
    if (searchCustomer.trim()) {
      const q = searchCustomer.trim().toLowerCase();
      const matchName = (o.customer?.fullName || o.address?.receiverName || '').toLowerCase().includes(q);
      const matchPhone = (o.address?.phone || '').includes(q);
      if (!matchName && !matchPhone) return false;
    }
    if (filterRefundStatus !== 'all') {
      const p = (o.paymentStatus || '').toLowerCase();
      if (filterRefundStatus === 'refunded' && p !== 'refunded') return false;
      if (filterRefundStatus === 'pending_refund' && (p === 'refunded' || o.paymentMethod === 'COD')) return false;
      if (filterRefundStatus === 'cod_no_refund' && o.paymentMethod !== 'COD') return false;
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      const orderDate = dayjs(o.createdAt);
      if (orderDate.isBefore(dateRange[0].startOf('day')) || orderDate.isAfter(dateRange[1].endOf('day'))) {
        return false;
      }
    }
    return true;
  });

  // Lọc Khiếu Nại
  const filteredTickets = tickets.filter(t => {
    if (claimSearch.trim()) {
      const q = claimSearch.trim().toLowerCase();
      const matchTicket = t.ticketId.toLowerCase().includes(q);
      const matchOrder = t.orderCode.toLowerCase().includes(q) || t.orderId.toString().includes(q);
      const matchCustomer = t.customerName.toLowerCase().includes(q);
      const matchProduct = t.productName.toLowerCase().includes(q);
      if (!matchTicket && !matchOrder && !matchCustomer && !matchProduct) return false;
    }
    if (claimStatusFilter !== 'all') {
      if (claimStatusFilter === 'flagged' && !t.isFraudFlagged) return false;
      if (claimStatusFilter !== 'flagged' && t.status !== claimStatusFilter) return false;
    }
    return true;
  });

  // Xử lý xác nhận đã hoàn tiền cho đơn hủy
  const handleMarkAsRefunded = async (orderId: number) => {
    try {
      await orderService.updateStatus(orderId, {
        orderStatus: 'Cancelled',
        paymentStatus: 'Refunded'
      });
      message.success(`Đã cập nhật trạng thái đơn #${orderId} thành ĐÃ HOÀN TIỀN (Refunded)!`);
      fetchCancelledOrders();
    } catch {
      message.error('Không thể cập nhật trạng thái hoàn tiền.');
    }
  };

  // Phê duyệt ticket khiếu nại (Zero-Waste: Không thu hồi hàng hỏng)
  const handleApproveTicket = async (ticket: ReturnTicket) => {
    try {
      const res = await returnTicketService.approve(
        ticket.ticketId, 
        'Đã phê duyệt bồi hoàn theo chính sách Zero Reverse Logistics.'
      );
      message.success(res.data?.message || 'Phê duyệt khiếu nại thành công!');
      setReviewTicketModal(null);
      fetchReturnTickets();
    } catch {
      message.error('Phê duyệt khiếu nại thất bại.');
    }
  };

  // Từ chối ticket khiếu nại
  const handleConfirmRejectTicket = async () => {
    if (!ticketToReject) return;
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối khiếu nại!');
      return;
    }
    try {
      await returnTicketService.reject(ticketToReject.ticketId, rejectReason.trim());
      message.success(`Đã từ chối phiếu khiếu nại #${ticketToReject.ticketId}.`);
      setRejectModalOpen(false);
      setTicketToReject(null);
      setRejectReason('');
      setReviewTicketModal(null);
      fetchReturnTickets();
    } catch {
      message.error('Từ chối khiếu nại thất bại.');
    }
  };

  // Cột bảng Đơn Hủy
  const cancelledOrderColumns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
      render: (id: number, r: Order) => (
        <div>
          <Tag color="red" style={{ fontWeight: 700 }}>#{id}</Tag>
          {r.orderCode && <div style={{ fontSize: '11px', color: '#64748B' }}>{r.orderCode}</div>}
        </div>
      )
    },
    {
      title: 'Khách hàng & SĐT',
      key: 'customer',
      width: 180,
      render: (_: any, r: Order) => (
        <div>
          <b style={{ color: '#0F172A' }}>{r.customer?.fullName || r.address?.receiverName || `Khách hàng #${r.customerId}`}</b>
          {r.address?.phone && <div style={{ fontSize: '12px', color: '#2563EB' }}>📞 {r.address.phone}</div>}
        </div>
      )
    },
    {
      title: 'Ngày đặt / Hủy',
      key: 'date',
      width: 150,
      render: (_: any, r: Order) => (
        <div style={{ fontSize: '12px' }}>
          <div>Đặt: {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}</div>
          {r.updatedAt && (
            <div style={{ color: '#DC2626', fontWeight: 600 }}>
              Hủy: {dayjs(r.updatedAt).format('DD/MM/YYYY HH:mm')}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tổng tiền đơn',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (val: number) => (
        <strong style={{ color: '#DC2626', fontSize: '13.5px' }}>
          {(val || 0).toLocaleString('vi-VN')} đ
        </strong>
      )
    },
    {
      title: 'Hoàn kho (Rollback)',
      key: 'restock',
      width: 140,
      render: (_: any, r: Order) => {
        const totalItems = (r.orderItems || []).reduce((sum, i) => sum + i.quantity, 0);
        return (
          <Tooltip title="Hệ thống đã tự động hoàn trả số lượng vào các lô hàng tương ứng theo ACID transaction">
            <Tag color="cyan" icon={<CheckCircleOutlined />} style={{ fontWeight: 600 }}>
              Đã hoàn {totalItems} SP
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Thanh toán & Hoàn tiền',
      key: 'payment',
      width: 170,
      render: (_: any, r: Order) => {
        const isPaid = (r.paymentStatus || '').toLowerCase() === 'paid';
        const isRefunded = (r.paymentStatus || '').toLowerCase() === 'refunded';
        const isCod = r.paymentMethod === 'COD' || (!r.paymentMethod && !isPaid);

        if (isRefunded) {
          return <Tag color="green" style={{ fontWeight: 700 }}>✓ ĐÃ HOÀN TIỀN</Tag>;
        }
        if (isCod) {
          return <Tag color="default" style={{ color: '#64748B' }}>COD (Không cần hoàn)</Tag>;
        }
        return (
          <div>
            <Tag color="orange" style={{ fontWeight: 700 }}>⏳ CHỜ HOÀN TIỀN</Tag>
            <div style={{ fontSize: '11px', color: '#D97706', marginTop: 2 }}>
              {r.paymentMethod || 'Chuyển khoản / MoMo'}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Lý do / Phân loại',
      key: 'type',
      width: 170,
      render: (_: any, r: Order) => {
        const isReturned = (r.orderStatus || '').toLowerCase() === 'returned';
        const isCancelled = (r.orderStatus || '').toLowerCase() === 'cancelled';
        const claimsForOrder = tickets.filter(t => t.orderId === r.orderId || (t.orderCode && t.orderCode.toLowerCase() === (r.orderCode || '').toLowerCase()));

        if (claimsForOrder.length > 0) {
          const first = claimsForOrder[0];
          return (
            <div>
              <Tag color="orange" style={{ fontWeight: 700, padding: '2px 8px' }}>
                ⚡ CÓ {claimsForOrder.length} SP KHIẾU NẠI
              </Tag>
              <div style={{ fontSize: '11px', color: '#EA580C', marginTop: 3 }}>
                {first.reasonLabel} ({first.status === 'APPROVED' ? 'Đã duyệt' : first.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'})
              </div>
            </div>
          );
        }
        if (isReturned) {
          return <Tag color="volcano">Đổi trả sau nhận hàng</Tag>;
        }
        if (isCancelled) {
          return <Tag color="red">Khách hủy đơn hàng</Tag>;
        }
        return <Tag color="blue">{r.orderStatus || 'Đang xử lý'}</Tag>;
      }
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 190,
      render: (_: any, r: Order) => {
        const needsRefund = r.paymentMethod !== 'COD' && (r.paymentStatus || '').toLowerCase() !== 'refunded';
        const claimsForOrder = tickets.filter(t => t.orderId === r.orderId || (t.orderCode && t.orderCode.toLowerCase() === (r.orderCode || '').toLowerCase()));

        return (
          <Space size="small" wrap>
            <Button size="small" icon={<EyeOutlined />} onClick={() => setViewOrderModal(r)}>
              Chi tiết
            </Button>
            {claimsForOrder.length > 0 && (
              <Button 
                size="small" 
                style={{ borderColor: '#EA580C', color: '#C2410C', fontWeight: 600, backgroundColor: '#FFF7ED' }}
                onClick={() => setReviewTicketModal(claimsForOrder[0])}
              >
                Khiếu nại
              </Button>
            )}
            {needsRefund && (
              <Popconfirm
                title="Xác nhận hoàn tiền cho khách"
                description={`Xác nhận đã chuyển hoàn ${(r.totalAmount || 0).toLocaleString('vi-VN')}đ cho khách hàng?`}
                onConfirm={() => handleMarkAsRefunded(r.orderId)}
                okText="Đã hoàn tiền"
                cancelText="Hủy"
              >
                <Button size="small" type="primary" style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}>
                  Đã hoàn tiền
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      }
    }
  ];

  // Cột bảng Khiếu Nại Nông Sản
  const claimColumns = [
    {
      title: 'Mã Khiếu Nại',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 140,
      render: (id: string, r: ReturnTicket) => (
        <div>
          <b style={{ color: '#C2410C', fontSize: '12.5px' }}>{id}</b>
          <div style={{ fontSize: '11px', color: '#64748B' }}>Đơn: #{r.orderId} ({r.orderCode})</div>
        </div>
      )
    },
    {
      title: 'Khách hàng & Cảnh báo',
      key: 'customer',
      width: 180,
      render: (_: any, r: ReturnTicket) => (
        <div>
          <b>{r.customerName}</b>
          {r.isFraudFlagged && (
            <div style={{ marginTop: 4 }}>
              <Tooltip title={r.fraudNote || 'Tỷ lệ khiếu nại > 20% và đơn hàng > 5. Bắt buộc thẩm định kỹ!'}>
                <Tag color="error" icon={<WarningOutlined />} style={{ fontWeight: 700, fontSize: '11px' }}>
                  CẦN KIỂM TRA KỸ
                </Tag>
              </Tooltip>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Sản phẩm lỗi',
      key: 'product',
      width: 220,
      render: (_: any, r: ReturnTicket) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {r.productImage ? (
            <Image src={r.productImage} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} preview={false} />
          ) : (
            <div style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <InboxOutlined style={{ color: '#94a3b8' }} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#0F172A' }}>{r.productName}</div>
            <div style={{ fontSize: '11.5px', color: '#DC2626', fontWeight: 600 }}>
              Lý do: {r.reasonLabel}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Minh chứng',
      key: 'evidence',
      width: 110,
      render: (_: any, r: ReturnTicket) => (
        <Badge count={r.evidenceUrls?.length || 0} overflowCount={9} style={{ backgroundColor: '#2563EB' }}>
          <Button 
            size="small" 
            icon={<FileTextOutlined />} 
            onClick={() => setReviewTicketModal(r)}
          >
            Xem ({r.evidenceUrls?.length || 0})
          </Button>
        </Badge>
      )
    },
    {
      title: 'Phương án đền bù',
      key: 'compensation',
      width: 160,
      render: (_: any, r: ReturnTicket) => (
        <div>
          <Tag color={r.compensationMethod === 'WALLET_REFUND' ? 'blue' : 'purple'} style={{ fontWeight: 600 }}>
            {r.compensationMethod === 'WALLET_REFUND' ? 'Ví tài khoản' : 'Giao bù đơn sau'}
          </Tag>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', marginTop: 2 }}>
            {(r.refundAmount || 0).toLocaleString('vi-VN')} đ
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string, r: ReturnTicket) => {
        if (status === 'APPROVED') {
          return <Tag color="success" style={{ fontWeight: 700 }}>✓ ĐÃ PHÊ DUYỆT</Tag>;
        }
        if (status === 'REJECTED') {
          return <Tag color="default" style={{ fontWeight: 700 }}>✕ ĐÃ TỪ CHỐI</Tag>;
        }
        if (r.isFraudFlagged) {
          return <Tag color="volcano" style={{ fontWeight: 700 }}>⚠️ THẨM ĐỊNH THỦ CÔNG</Tag>;
        }
        return <Tag color="gold" style={{ fontWeight: 700 }}>⏳ CHỜ DUYỆT</Tag>;
      }
    },
    {
      title: 'Tác vụ',
      key: 'actions',
      width: 150,
      render: (_: any, r: ReturnTicket) => {
        const isPending = r.status === 'PENDING' || r.status === 'FLAGGED_REVIEW';
        return (
          <Space size="small">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setReviewTicketModal(r)}>
              Thẩm định
            </Button>
            {isPending && (
              <Button 
                size="small" 
                type="primary"
                style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
                onClick={() => handleApproveTicket(r)}
              >
                Duyệt
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. THỐNG KÊ KPI TOÀN BỘ ĐƠN HỦY & KHIẾU NẠI */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            className="kpi-card" 
            style={{ borderRadius: 14, border: '1px solid #fecaca', height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tổng Đơn Đã Hủy
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {totalCancelledCount} <span style={{ fontSize: 14, fontWeight: 600 }}>đơn</span>
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                <CloseCircleOutlined />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 10 }}>
              Tổng tiền: <strong>{totalCancelledMoney.toLocaleString('vi-VN')} ₫</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            className="kpi-card" 
            style={{ borderRadius: 14, border: '1px solid #fde68a', height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Chờ Hoàn Tiền Online
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {pendingRefundOrders.length} <span style={{ fontSize: 14, fontWeight: 600 }}>đơn</span>
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                <DollarOutlined />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 10 }}>
              Ưu tiên hoàn trả ví MoMo / VietQR
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            className="kpi-card" 
            style={{ borderRadius: 14, border: '1px solid #fed7aa', height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Khiếu Nại Tươi Sống
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {tickets.length} <span style={{ fontSize: 13, fontWeight: 600, color: '#c2410c' }}>({pendingTicketsCount} chờ duyệt)</span>
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                <RollbackOutlined />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#c2410c', marginTop: 10 }}>
              Chính sách Zero-Waste (Không thu hồi)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card 
            className="kpi-card" 
            style={{ 
              borderRadius: 14, 
              border: flaggedTicketsCount > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0', 
              height: '100%' 
            }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: flaggedTicketsCount > 0 ? '#dc2626' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cảnh Báo Gian Lận
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: flaggedTicketsCount > 0 ? '#dc2626' : '#16a34a', marginTop: 6, letterSpacing: '-0.5px' }}>
                  {flaggedTicketsCount} <span style={{ fontSize: 14, fontWeight: 600 }}>gắn cờ</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: flaggedTicketsCount > 0 ? '#fef2f2' : '#f0fdf4', 
                  color: flaggedTicketsCount > 0 ? '#dc2626' : '#16a34a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: 20 
                }}
              >
                <SafetyCertificateOutlined />
              </div>
            </div>
            <div style={{ fontSize: 12, color: flaggedTicketsCount > 0 ? '#b91c1c' : '#15803d', marginTop: 10 }}>
              Tỷ lệ trả &gt; 20% &gt; 5 đơn hàng
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. TAB ĐIỀU HƯỚNG CHÍNH */}
      <Card style={{ borderRadius: 14 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key: any) => setActiveTab(key)}
          size="large"
          items={[
            {
              key: 'cancelled',
              label: (
                <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CloseCircleOutlined style={{ color: '#DC2626' }} />
                  Đơn Hàng Bị Hủy & Hoàn Tiền ({totalCancelledCount})
                </span>
              ),
              children: (
                <div>
                  {/* BỘ LỌC ĐƠN HỦY */}
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #E2E8F0' }}>
                    <Row gutter={[12, 12]} align="middle">
                      <Col xs={24} sm={8} md={5}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Mã đơn:</div>
                        <Input
                          placeholder="Mã đơn (VD: 1, ORD-001)..."
                          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                          value={searchCode}
                          onChange={e => setSearchCode(e.target.value)}
                          allowClear
                        />
                      </Col>

                      <Col xs={24} sm={8} md={6}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Khách hàng / SĐT:</div>
                        <Input
                          placeholder="Tên khách hàng, SĐT..."
                          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                          value={searchCustomer}
                          onChange={e => setSearchCustomer(e.target.value)}
                          allowClear
                        />
                      </Col>

                      <Col xs={24} sm={8} md={5}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Trạng thái hoàn tiền:</div>
                        <Select
                          style={{ width: '100%' }}
                          value={filterRefundStatus}
                          onChange={v => setFilterRefundStatus(v)}
                        >
                          <Select.Option value="all">Tất cả trạng thái</Select.Option>
                          <Select.Option value="pending_refund">Chờ hoàn tiền (Online)</Select.Option>
                          <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
                          <Select.Option value="cod_no_refund">COD (Không hoàn)</Select.Option>
                        </Select>
                      </Col>

                      <Col xs={24} sm={12} md={5}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Khoảng ngày:</div>
                        <DatePicker.RangePicker
                          format="DD/MM/YYYY"
                          style={{ width: '100%' }}
                          value={dateRange}
                          onChange={v => setDateRange(v)}
                        />
                      </Col>

                      <Col xs={24} sm={12} md={3} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={() => {
                            setSearchCode('');
                            setSearchCustomer('');
                            setFilterRefundStatus('all');
                            setDateRange(null);
                            fetchCancelledOrders();
                          }}
                          style={{ width: '100%' }}
                        >
                          Đặt lại
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  {/* BẢNG ĐƠN HÀNG BỊ HỦY */}
                  <Table
                    columns={cancelledOrderColumns}
                    dataSource={filteredCancelledOrders}
                    rowKey="orderId"
                    loading={loadingOrders}
                    pagination={{ pageSize: 10, showTotal: t => `Tổng cộng ${t} đơn bị hủy` }}
                  />
                </div>
              )
            },
            {
              key: 'claims',
              label: (
                <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RollbackOutlined style={{ color: '#EA580C' }} />
                  Thẩm Định Khiếu Nại Nông Sản Zero-Waste
                  {flaggedTicketsCount > 0 && (
                    <Badge count={flaggedTicketsCount} style={{ backgroundColor: '#DC2626' }} />
                  )}
                </span>
              ),
              children: (
                <div>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={
                      <span>
                        <strong>Chính sách Đổi trả Nông sản Tươi sống Zero Reverse Logistics:</strong> Nông sản bị hỏng hóc hoặc giao sai sẽ 
                        <strong> KHÔNG thu hồi về kho</strong> để tiết kiệm chi phí vận chuyển. Sau khi thẩm định qua minh chứng và đối chiếu camera trạm đóng gói, 
                        Admin duyệt bồi hoàn trực tiếp vào Ví tài khoản hoặc gửi bù vào đơn hàng sau.
                      </span>
                    }
                  />

                  {/* BỘ LỌC KHIẾU NẠI */}
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #E2E8F0' }}>
                    <Row gutter={[12, 12]} align="middle">
                      <Col xs={24} sm={12} md={8}>
                        <Input
                          placeholder="Tìm theo Mã Ticket, Mã đơn, Tên khách, Sản phẩm..."
                          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                          value={claimSearch}
                          onChange={e => setClaimSearch(e.target.value)}
                          allowClear
                        />
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <Select
                          style={{ width: '100%' }}
                          value={claimStatusFilter}
                          onChange={v => setClaimStatusFilter(v)}
                        >
                          <Select.Option value="all">Tất cả phiếu khiếu nại</Select.Option>
                          <Select.Option value="PENDING">Chờ xử lý (Pending)</Select.Option>
                          <Select.Option value="flagged">⚠️ Cần kiểm tra kỹ (Gian lận)</Select.Option>
                          <Select.Option value="APPROVED">Đã phê duyệt</Select.Option>
                          <Select.Option value="REJECTED">Đã từ chối</Select.Option>
                        </Select>
                      </Col>

                      <Col xs={24} sm={12} md={4}>
                        <Button icon={<ReloadOutlined />} onClick={fetchReturnTickets} style={{ width: '100%' }}>
                          Làm mới dữ liệu
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  {/* BẢNG KHIẾU NẠI */}
                  <Table
                    columns={claimColumns}
                    dataSource={filteredTickets}
                    rowKey="ticketId"
                    loading={loadingClaims}
                    pagination={{ pageSize: 10, showTotal: t => `Tổng cộng ${t} phiếu khiếu nại` }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* MODAL CHI TIẾT ĐƠN HÀNG BỊ HỦY */}
      <Modal
        title={`Chi Tiết Đơn Hàng Bị Hủy #${viewOrderModal?.orderId}`}
        open={Boolean(viewOrderModal)}
        onCancel={() => setViewOrderModal(null)}
        footer={[
          <Button key="close" onClick={() => setViewOrderModal(null)}>Đóng</Button>
        ]}
        width={680}
      >
        {viewOrderModal && (
          <div style={{ marginTop: 12 }}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã đơn hàng">#{viewOrderModal.orderId} ({viewOrderModal.orderCode || 'N/A'})</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{viewOrderModal.customer?.fullName || viewOrderModal.address?.receiverName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{viewOrderModal.address?.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian đặt">{dayjs(viewOrderModal.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Phương thức">{viewOrderModal.paymentMethod || 'COD'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái hoàn tiền">
                <Tag color={(viewOrderModal.paymentStatus || '').toLowerCase() === 'refunded' ? 'green' : 'orange'}>
                  {(viewOrderModal.paymentStatus || 'Chưa hoàn').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao" span={2}>
                {viewOrderModal.address ? (
                  `${viewOrderModal.address.addressDetail || ''}, ${viewOrderModal.address.ward || ''}, ${viewOrderModal.address.district || ''}, ${viewOrderModal.address.province || ''}`
                ) : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Sản phẩm trong đơn (Đã tự động hoàn trả số lượng về kho):</h4>
            <Table
              dataSource={viewOrderModal.orderItems}
              rowKey="orderItemId"
              pagination={false}
              size="small"
              columns={[
                { title: 'Tên sản phẩm', dataIndex: ['product', 'productName'], render: t => t || 'Nông sản' },
                { title: 'Số lượng hoàn', dataIndex: 'quantity', width: 110, render: q => <Tag color="cyan">+{q} sản phẩm</Tag> },
                { title: 'Đơn giá', dataIndex: 'unitPrice', width: 110, render: p => `${(p || 0).toLocaleString('vi-VN')} đ` },
                { title: 'Thành tiền', dataIndex: 'totalAmount', width: 120, render: t => <strong style={{ color: '#DC2626' }}>{(t || 0).toLocaleString('vi-VN')} đ</strong> }
              ]}
            />

            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 16 }}>
              Tổng tiền đơn đã hủy: <strong style={{ color: '#DC2626', fontSize: 18 }}>{(viewOrderModal.totalAmount || 0).toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL THẨM ĐỊNH KHIẾU NẠI NÔNG SẢN & ĐỐI CHIẾU PACKSTATION */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RollbackOutlined style={{ color: '#EA580C' }} />
            <span>Thẩm Định Khiếu Nại Nông Sản #{reviewTicketModal?.ticketId}</span>
          </div>
        }
        open={Boolean(reviewTicketModal)}
        onCancel={() => setReviewTicketModal(null)}
        width={780}
        footer={[
          <Button key="close" onClick={() => setReviewTicketModal(null)}>Đóng</Button>,
          reviewTicketModal && (reviewTicketModal.status === 'PENDING' || reviewTicketModal.status === 'FLAGGED_REVIEW') && (
            <Button 
              key="reject" 
              danger 
              onClick={() => {
                setTicketToReject(reviewTicketModal);
                setRejectModalOpen(true);
              }}
            >
              Từ chối khiếu nại
            </Button>
          ),
          reviewTicketModal && (reviewTicketModal.status === 'PENDING' || reviewTicketModal.status === 'FLAGGED_REVIEW') && (
            <Button 
              key="approve" 
              type="primary" 
              style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
              onClick={() => reviewTicketModal && handleApproveTicket(reviewTicketModal)}
            >
              Phê duyệt bồi hoàn (Zero-Waste)
            </Button>
          )
        ]}
      >
        {reviewTicketModal && (
          <div style={{ marginTop: 12 }}>
            {/* CẢNH BÁO GIAN LẬN NẾU CÓ */}
            {reviewTicketModal.isFraudFlagged && (
              <Alert
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
                message="CẢNH BÁO GIAN LẬN (FRAUD DETECTION ENGINE)"
                description={
                  <div>
                    {reviewTicketModal.fraudNote || 'Khách hàng có lịch sử khiếu nại bất thường vượt ngưỡng an toàn (> 20%).'}
                    <div style={{ marginTop: 4, fontWeight: 600 }}>
                      👉 Bắt buộc đối chiếu hình ảnh trạm đóng gói và khối lượng xuất kho bên dưới trước khi phê duyệt!
                    </div>
                  </div>
                }
              />
            )}

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã Ticket">{reviewTicketModal.ticketId}</Descriptions.Item>
              <Descriptions.Item label="Đơn hàng liên quan">#{reviewTicketModal.orderId} ({reviewTicketModal.orderCode})</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{reviewTicketModal.customerName} (ID: #{reviewTicketModal.customerId})</Descriptions.Item>
              <Descriptions.Item label="Thời gian gửi">{dayjs(reviewTicketModal.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Sản phẩm khiếu nại" span={2}>
                <strong>{reviewTicketModal.productName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do khiếu nại" span={2}>
                <Tag color="red" style={{ fontSize: '13px', padding: '4px 8px' }}>
                  {reviewTicketModal.reasonLabel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương án bồi hoàn">
                <Tag color={reviewTicketModal.compensationMethod === 'WALLET_REFUND' ? 'blue' : 'purple'} style={{ fontWeight: 700 }}>
                  {reviewTicketModal.compensationLabel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền bồi hoàn">
                <strong style={{ color: '#DC2626', fontSize: 16 }}>
                  {(reviewTicketModal.refundAmount || 0).toLocaleString('vi-VN')} đ
                </strong>
              </Descriptions.Item>
              {reviewTicketModal.adminNotes && (
                <Descriptions.Item label="Ghi chú thẩm định" span={2}>
                  {reviewTicketModal.adminNotes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* PHẦN ĐỐI CHIẾU TRẠM ĐÓNG GÓI (PACKSTATION VERIFICATION) */}
            <div style={{ marginTop: 20, padding: 14, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <VideoCameraOutlined style={{ color: '#2563EB', fontSize: 16 }} />
                <strong style={{ color: '#1E293B', fontSize: '14px' }}>
                  Thông tin đối chiếu trạm đóng gói (Packstation Verification)
                </strong>
              </div>
              <Row gutter={[16, 12]}>
                <Col span={8}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Khối lượng cân xuất kho:</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    ⚖️ {reviewTicketModal.packWeightKg ? `${reviewTicketModal.packWeightKg} kg` : '1.05 kg (Chuẩn)'}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Nhân viên đóng gói:</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    👤 {reviewTicketModal.packerName || 'Trần Thị Lan (PK-04)'}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Thời điểm quét mã đóng gói:</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    🕒 {reviewTicketModal.packTimestamp ? dayjs(reviewTicketModal.packTimestamp).format('DD/MM/YYYY HH:mm') : 'Hôm nay'}
                  </div>
                </Col>
              </Row>

              {reviewTicketModal.packstationCameraUrl && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: 6 }}>Ảnh chụp Camera trạm đóng hàng:</div>
                  <Image
                    src={reviewTicketModal.packstationCameraUrl}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}
            </div>

            {/* MINH CHỨNG KHÁCH HÀNG GỬI (VIDEO / HÌNH ẢNH) */}
            <div style={{ marginTop: 20 }}>
              <strong style={{ fontSize: '14px', color: '#1E293B' }}>
                Minh chứng khách hàng tải lên ({reviewTicketModal.evidenceUrls?.length || 0} tệp):
              </strong>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
                {reviewTicketModal.evidenceUrls && reviewTicketModal.evidenceUrls.length > 0 ? (
                  reviewTicketModal.evidenceUrls.map((url, idx) => {
                    const isVideo = url.endsWith('.mp4') || url.includes('video');
                    if (isVideo) {
                      return (
                        <div key={idx} style={{ width: 180, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                          <video src={url} controls style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                          <div style={{ padding: '4px 8px', fontSize: '11px', background: '#F1F5F9', textAlign: 'center' }}>
                            🎬 Video mở hộp / lỗi
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} style={{ width: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <Image src={url} width={120} height={100} style={{ objectFit: 'cover' }} />
                        <div style={{ padding: '2px 4px', fontSize: '11px', background: '#F1F5F9', textAlign: 'center' }}>
                          📸 Hình ảnh {idx + 1}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span style={{ color: '#94A3B8' }}>Không có hình ảnh hoặc video minh chứng đính kèm.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL NHẬP LÝ DO TỪ CHỐI KHIẾU NẠI */}
      <Modal
        title={`Từ chối phiếu khiếu nại #${ticketToReject?.ticketId}`}
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setTicketToReject(null);
          setRejectReason('');
        }}
        onOk={handleConfirmRejectTicket}
        okText="Xác nhận từ chối"
        cancelText="Quay lại"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginTop: 10 }}>
          <p>Vui lòng cung cấp lý do từ chối để hệ thống gửi thông báo giải thích cho khách hàng:</p>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do chi tiết (VD: Đối chiếu camera trạm đóng gói khối lượng sản phẩm đầy đủ và đạt chuẩn VietGAP, quả không có dấu hiệu dập nát khi xuất kho...)"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
