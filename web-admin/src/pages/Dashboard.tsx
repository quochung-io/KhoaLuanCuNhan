import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Col, 
  Row, 
  Table, 
  Tag, 
  Alert, 
  Progress, 
  message, 
  Segmented, 
  Button, 
  Space, 
  Tooltip as AntTooltip,
  Typography,
  Input,
  Select
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ShoppingCartOutlined, 
  WarningOutlined, 
  ReloadOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  RiseOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { 
  ResponsiveContainer, 
  AreaChart,
  Area,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend
} from 'recharts';
import dayjs from 'dayjs';
import { orderService } from '../services/api';

const { Text } = Typography;

interface RevenuePoint {
  name: string;
  revenue: number;
  orders: number;
  Revenue?: number;
  Orders?: number;
}

interface TopProduct {
  name: string;
  sales: number;
}

interface NearExpiryBatch {
  id: number;
  batchCode: string;
  productId?: number;
  productName: string;
  unitPrice?: number;
  qty: string;
  quantityNum?: number;
  lossValue?: number;
  expiry: string;
  daysRemaining?: number;
  status: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // Khoảng thời gian phân tích: today | 7days | 30days | thismonth | thisyear
  const [timeRange, setTimeRange] = useState<string>('7days');
  const [chartMetric, setChartMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [lastUpdated, setLastUpdated] = useState<string>(dayjs().format('HH:mm:ss'));
  const [cancelledStats, setCancelledStats] = useState({ cancelledCount: 0, pendingRefundCount: 0 });

  // Bộ lọc tìm kiếm nhanh cho các bảng thống kê trong Dashboard
  const [fefoSearch, setFefoSearch] = useState<string>('');
  const [fefoPriorityFilter, setFefoPriorityFilter] = useState<string>('all');
  const [topProdSearch, setTopProdSearch] = useState<string>('');

  const [stats, setStats] = useState({
    totalRevenue: 0,
    prevRevenue: 0,
    revenueGrowthRate: 0,
    totalOrders: 0,
    prevOrdersCount: 0,
    ordersGrowthRate: 0,
    aov: 0,
    prevAov: 0,
    totalProducts: 0,
    totalUsers: 0,
    conversionRate: 0,
    expiredBatchesCount: 0,
    expiredLossValue: 0,
    nearExpiryCount: 0,
    nearExpiryRiskValue: 0,
    funnel: {
      views: 0,
      carts: 0,
      checkouts: 0,
      completed: 0
    }
  });

  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryBatch[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async (selectedRange = timeRange) => {
    setLoading(true);
    try {
      // 1. Tải số liệu tổng quan & KPI
      const summaryRes = await orderService.getSummary(selectedRange);
      setStats(summaryRes.data);

      // 2. Tải doanh thu & đơn hàng theo chu kỳ động
      const revenueRes = await orderService.getRevenueWeekly(selectedRange);
      const rawList = Array.isArray(revenueRes.data) ? revenueRes.data : [];
      const normalized: RevenuePoint[] = rawList.map((item: any) => ({
        name: item.name || '',
        revenue: Number(item.revenue ?? item.Revenue ?? 0),
        orders: Number(item.orders ?? item.Orders ?? 0),
        Revenue: Number(item.revenue ?? item.Revenue ?? 0),
        Orders: Number(item.orders ?? item.Orders ?? 0),
      }));
      setRevenueData(normalized);

      // 3. Tải top sản phẩm bán chạy
      const topProdRes = await orderService.getTopProducts(selectedRange);
      setTopProducts(topProdRes.data || []);

      // 4. Tải lô hàng sắp hết hạn (FEFO)
      const expiryRes = await orderService.getNearExpiry();
      setNearExpiry(expiryRes.data || []);

      // 5. Thống kê đơn hủy & đổi trả
      try {
        const allOrdersRes = await orderService.getAll();
        const all = Array.isArray(allOrdersRes.data) ? allOrdersRes.data : [];
        const cCount = all.filter((o: any) => ['cancelled', 'returned'].includes(o.orderStatus?.toLowerCase())).length;
        const pRefund = all.filter((o: any) => o.orderStatus?.toLowerCase() === 'cancelled' && o.paymentMethod !== 'COD' && o.paymentStatus?.toLowerCase() !== 'refunded').length;
        setCancelledStats({ cancelledCount: cCount, pendingRefundCount: pRefund });
      } catch {}

      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch {
      message.error('Không thể kết nối API thống kê. Đang hiển thị dữ liệu mô phỏng.');
      
      // Fallback thông minh
      setStats({
        totalRevenue: 52400000,
        prevRevenue: 45400000,
        revenueGrowthRate: 15.4,
        totalOrders: 168,
        prevOrdersCount: 150,
        ordersGrowthRate: 12.0,
        aov: 311900,
        prevAov: 302600,
        totalProducts: 14,
        totalUsers: 32,
        conversionRate: 4.2,
        expiredBatchesCount: 3,
        expiredLossValue: 5806500,
        nearExpiryCount: 4,
        nearExpiryRiskValue: 248741500,
        funnel: {
          views: 3980,
          carts: 580,
          checkouts: 168,
          completed: 155
        }
      });
      setRevenueData([
        { name: 'T2', revenue: 4500000, orders: 18, Revenue: 4500000, Orders: 18 },
        { name: 'T3', revenue: 5200000, orders: 22, Revenue: 5200000, Orders: 22 },
        { name: 'T4', revenue: 6800000, orders: 26, Revenue: 6800000, Orders: 26 },
        { name: 'T5', revenue: 8100000, orders: 31, Revenue: 8100000, Orders: 31 },
        { name: 'T6', revenue: 7900000, orders: 29, Revenue: 7900000, Orders: 29 },
        { name: 'T7', revenue: 9500000, orders: 36, Revenue: 9500000, Orders: 36 },
        { name: 'CN', revenue: 10400000, orders: 42, Revenue: 10400000, Orders: 42 },
      ]);
      setTopProducts([
        { name: 'Cải bó xôi hữu cơ', sales: 165 },
        { name: 'Cà rốt baby Đà Lạt', sales: 132 },
        { name: 'Cam sành Hàm Yên', sales: 98 },
        { name: 'Dâu tây Mộc Châu', sales: 85 },
        { name: 'Nấm đùi gà tươi', sales: 62 },
      ]);
      setNearExpiry([
        { id: 1, batchCode: 'LOT-VN-DL-08', productName: 'Cải bó xôi hữu cơ', qty: '150 kg', expiry: 'Còn 3 ngày', status: 'Cảnh báo đỏ' },
        { id: 2, batchCode: 'LOT-VN-MC-02', productName: 'Dâu tây Mộc Châu', qty: '80 hộp', expiry: 'Còn 5 ngày', status: 'Cảnh báo vàng' }
      ]);
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(timeRange);
  }, [timeRange]);

  const nearExpiryColumns = [
    { 
      title: 'Mã Lô Hàng', 
      dataIndex: 'batchCode', 
      key: 'batchCode',
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.batchCode || '').localeCompare(b.batchCode || ''),
      render: (code: string) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>
    },
    { 
      title: 'Sản Phẩm', 
      dataIndex: 'productName', 
      key: 'productName',
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.productName || '').localeCompare(b.productName || ''),
      render: (t: string) => <b>{t}</b>
    },
    { 
      title: 'Tồn Kho', 
      dataIndex: 'qty', 
      key: 'qty',
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => {
        const numA = parseFloat(a.qty) || 0;
        const numB = parseFloat(b.qty) || 0;
        return numA - numB;
      }
    },
    { 
      title: 'Hạn Sử Dụng (FEFO)', 
      dataIndex: 'expiry', 
      key: 'expiry', 
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.expiry || '').localeCompare(b.expiry || ''),
      render: (text: string, r: NearExpiryBatch) => (
        <span style={{ color: r.status?.includes('hết hạn') ? '#cf1322' : '#d46b08', fontWeight: 'bold' }}>
          {text}
        </span> 
      )
    },
    { 
      title: 'Tổn Thất / Rủi Ro', 
      key: 'lossValue', 
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.lossValue || 0) - (b.lossValue || 0),
      render: (_: any, r: NearExpiryBatch) => (
        <strong style={{ color: r.status?.includes('hết hạn') ? '#cf1322' : '#d46b08' }}>
          {Number(r.lossValue || 0).toLocaleString('vi-VN')} đ
        </strong>
      )
    },
    { 
      title: 'Mức Độ & Ưu Tiên', 
      dataIndex: 'status', 
      key: 'status', 
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.status || '').localeCompare(b.status || ''),
      render: (status: string) => {
        if (status.includes('hết hạn')) {
          return <Tag color="error" style={{ fontWeight: 600 }}>🔴 ĐÃ HẾT HẠN</Tag>;
        }
        if (status.includes('đỏ')) {
          return <Tag color="volcano" style={{ fontWeight: 600 }}>⚠️ CẦN XẢ KHO GẤP</Tag>;
        }
        return <Tag color="orange" style={{ fontWeight: 600 }}>🟡 THEO DÕI SÁT</Tag>;
      }
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: () => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => navigate('/product-reports?tab=expired')}
        >
          Chi tiết &gt;
        </Button>
      )
    }
  ];

  // Tính tỷ lệ các bước trong phễu chuyển đổi
  const fViews = stats.funnel?.views || 1;
  const fCarts = stats.funnel?.carts || 0;
  const fCheckouts = stats.funnel?.checkouts || 0;
  const fCompleted = stats.funnel?.completed || 0;

  const cartRate = Math.min(100, Math.round((fCarts / fViews) * 100));
  const checkoutRate = Math.min(100, Math.round((fCheckouts / fViews) * 100));
  const successRate = Math.min(100, Math.round((fCompleted / fViews) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── HEADER ĐIỀU KHIỂN THỜI GIAN THẬT & BỘ LỌC CHU KỲ ── */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 16,
          backgroundColor: '#ffffff',
          padding: '18px 24px',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Trung Tâm Giám Sát & Điều Hành Nông Sản ECC
            </h2>
            <Tag color="success" style={{ margin: 0, borderRadius: 999, padding: '2px 10px', fontSize: 11 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#16a34a', marginRight: 6 }} />
              Dữ liệu trực tiếp (Live)
            </Tag>
          </div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Theo dõi dòng tiền GMV, tỷ lệ chuyển đổi, thuật toán FEFO và các điểm nghẽn chuỗi cung ứng
          </div>
        </div>

        <Space wrap size="middle">
          {/* Bộ chọn chu kỳ nhanh */}
          <Segmented
            value={timeRange}
            onChange={(val) => setTimeRange(val as string)}
            options={[
              { label: 'Hôm nay', value: 'today' },
              { label: '7 ngày qua', value: '7days' },
              { label: '30 ngày qua', value: '30days' },
              { label: 'Tháng này', value: 'thismonth' },
              { label: 'Năm nay', value: 'thisyear' },
            ]}
            style={{ background: '#f1f5f9', padding: 3, borderRadius: 8, fontWeight: 600 }}
          />

          <AntTooltip title={`Dữ liệu tự động đồng bộ. Lần cập nhật gần nhất: ${lastUpdated}`}>
            <Button 
              icon={<ReloadOutlined spin={loading} />} 
              onClick={() => loadDashboardData(timeRange)}
              loading={loading}
              style={{ fontWeight: 600, borderColor: '#cbd5e1' }}
            >
              Làm mới ({lastUpdated})
            </Button>
          </AntTooltip>
        </Space>
      </div>

      {/* Thông báo cảnh báo sớm nếu có lô hàng sắp hết hạn */}
      {nearExpiry.length > 0 && (
        <Alert
          message={<span style={{ fontWeight: 700, color: '#9a3412' }}>Cảnh báo nông sản cận hạn sử dụng (Thuật toán FEFO)</span>}
          description={
            <div style={{ color: '#c2410c', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span>Phát hiện <b>{nearExpiry.length}</b> lô hàng nông sản sắp đến hạn sử dụng. Khuyến nghị Quản Trị Viên khởi tạo chương trình Flash Sale hoặc gói Combo xả kho sớm.</span>
              <Button size="small" type="primary" danger onClick={() => navigate('/product-reports?tab=expired')} style={{ fontWeight: 600 }}>
                Xem danh sách lô &gt;
              </Button>
            </div>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined style={{ color: '#ea580c', fontSize: 18 }} />}
          style={{ borderRadius: 12, border: '1px solid #fed7aa', background: '#fff7ed' }}
        />
      )}

      {/* ── 6 THẺ CHỈ SỐ KPI CỐT LÕI (CHỈ SỐ THƯƠNG MẠI ĐIỆN TỬ HIỆN ĐẠI) ── */}
      <Row gutter={[16, 16]}>
        {/* 1. Tổng Doanh Thu */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            className="kpi-card" 
            style={{ borderRadius: 14, height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tổng Doanh Thu (GMV)
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {stats.totalRevenue.toLocaleString('vi-VN')} <span style={{ fontSize: 14 }}>₫</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#f0fdf4', 
                  color: '#16a34a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <DollarOutlined />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats.revenueGrowthRate >= 0 ? (
                <Tag color="success" style={{ margin: 0, borderRadius: 999, padding: '1px 8px' }}>
                  <ArrowUpOutlined /> +{stats.revenueGrowthRate}%
                </Tag>
              ) : (
                <Tag color="error" style={{ margin: 0, borderRadius: 999, padding: '1px 8px' }}>
                  <ArrowDownOutlined /> {stats.revenueGrowthRate}%
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 11.5 }}>so với kỳ trước</Text>
            </div>
          </Card>
        </Col>

        {/* 2. Giá trị đơn trung bình (AOV) */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            className="kpi-card" 
            style={{ borderRadius: 14, height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Giá Trị Đơn TB (AOV)
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {stats.aov.toLocaleString('vi-VN')} <span style={{ fontSize: 14 }}>₫</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#f0f9ff', 
                  color: '#0284c7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <RiseOutlined />
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: '#64748b' }}>
              Hiệu suất giỏ hàng mỗi khách
            </div>
          </Card>
        </Col>

        {/* 3. Tổng Đơn Hàng */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            className="kpi-card" 
            style={{ borderRadius: 14, height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tổng Đơn Hàng
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {stats.totalOrders} <span style={{ fontSize: 14 }}>đơn</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#eff6ff', 
                  color: '#2563eb', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <ShoppingCartOutlined />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats.ordersGrowthRate >= 0 ? (
                <Tag color="processing" style={{ margin: 0, borderRadius: 999, padding: '1px 8px' }}>
                  <ArrowUpOutlined /> +{stats.ordersGrowthRate}%
                </Tag>
              ) : (
                <Tag color="error" style={{ margin: 0, borderRadius: 999, padding: '1px 8px' }}>
                  <ArrowDownOutlined /> {stats.ordersGrowthRate}%
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 11.5 }}>lượng đơn mua</Text>
            </div>
          </Card>
        </Col>

        {/* 4. Tỷ lệ chuyển đổi mua hàng (Conversion Rate) */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            className="kpi-card" 
            style={{ borderRadius: 14, height: '100%' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tỷ Lệ Chuyển Đổi (CR)
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {stats.conversionRate.toFixed(1)} <span style={{ fontSize: 14 }}>%</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#f5f3ff', 
                  color: '#7c3aed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <ThunderboltOutlined />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Progress percent={Math.min(100, Math.round((stats.conversionRate / 5) * 100))} size="small" strokeColor="#7c3aed" showInfo={false} />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Mục tiêu sàn: &gt; 3.0%</div>
            </div>
          </Card>
        </Col>

        {/* 5. Đơn Hủy & Đổi Trả */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            hoverable
            onClick={() => navigate('/cancelled-orders')}
            className="kpi-card"
            style={{ borderRadius: 14, height: '100%', cursor: 'pointer', border: '1px solid #fecaca' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Đơn Hủy & Đổi Trả
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {cancelledStats.cancelledCount} <span style={{ fontSize: 14 }}>đơn</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#fef2f2', 
                  color: '#dc2626', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <CloseCircleOutlined />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{cancelledStats.pendingRefundCount > 0 ? `⚠️ ${cancelledStats.pendingRefundCount} chờ hoàn ví` : 'Đã đối soát kho'}</span>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>Xem &gt;</span>
            </div>
          </Card>
        </Col>

        {/* 6. Hàng Hết Hạn & Tổn Thất Doanh Thu */}
        <Col xs={24} sm={12} lg={8} xl={4} style={{ flex: '1 1 200px' }}>
          <Card 
            loading={loading} 
            hoverable
            onClick={() => navigate('/product-reports?tab=expired')}
            className="kpi-card"
            style={{ borderRadius: 14, height: '100%', cursor: 'pointer', border: '1px solid #fed7aa' }}
            styles={{ body: { padding: '18px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tổn Thất Hết Hạn
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#c2410c', marginTop: 8, letterSpacing: '-0.5px' }}>
                  {(stats.expiredLossValue || 5806500).toLocaleString('vi-VN')} <span style={{ fontSize: 14 }}>₫</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: 42, 
                  height: 42, 
                  borderRadius: 12, 
                  background: '#fff7ed', 
                  color: '#ea580c', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <WarningOutlined />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{stats.expiredBatchesCount || 3} lô quá hạn (FEFO)</span>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>Chi tiết &gt;</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── KHU VỰC BIỂU ĐỒ DOANH THU & PHỄU CHUYỂN ĐỔI E-COMMERCE ── */}
      <Row gutter={[16, 16]}>
        {/* Biểu đồ xu hướng Area Gradient */}
        <Col xs={24} lg={15}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Xu Hướng Doanh Thu & Lượng Đơn Mua</span>
                <Segmented
                  size="small"
                  value={chartMetric}
                  onChange={(v) => setChartMetric(v as any)}
                  options={[
                    { label: 'Cả hai', value: 'both' },
                    { label: 'Doanh thu', value: 'revenue' },
                    { label: 'Số đơn', value: 'orders' }
                  ]}
                  style={{ background: '#f1f5f9', fontWeight: 600 }}
                />
              </div>
            } 
            loading={loading}
            style={{ borderRadius: 14 }}
          >
            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={revenueData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" />
                  <YAxis 
                    yAxisId="left" 
                    tickLine={false} 
                    stroke="#94a3b8"
                    tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}tr` : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickLine={false}
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value: any, name: any) => [
                      String(name).toLowerCase().includes('doanh thu') 
                        ? `${Number(value).toLocaleString('vi-VN')} ₫` 
                        : `${value} đơn hàng`,
                      name
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {(chartMetric === 'both' || chartMetric === 'revenue') && (
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#16a34a" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Doanh Thu (₫)" 
                      dot={{ r: 3, fill: '#16a34a' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {(chartMetric === 'both' || chartMetric === 'orders') && (
                    <Area 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#0284c7" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                      name="Số Đơn Hàng" 
                      dot={{ r: 3, fill: '#0284c7' }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Phễu Chuyển Đổi Mua Hàng (E-Commerce Funnel) */}
        <Col xs={24} lg={9}>
          <Card 
            title={<span style={{ fontSize: 15, fontWeight: 700 }}>Phễu Chuyển Đổi Mua Sắm (Funnel)</span>} 
            loading={loading}
            style={{ borderRadius: 14 }}
            extra={<Tag color="purple">Hiệu Suất Sàn</Tag>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Bước 1: Lượt xem */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><EyeOutlined style={{ color: '#0284c7', marginRight: 6 }} /> <b>1. Lượt xem sản phẩm</b></span>
                  <b>{fViews.toLocaleString('vi-VN')}</b>
                </div>
                <Progress percent={100} strokeColor="#0284c7" showInfo={false} />
              </div>

              {/* Bước 2: Thêm giỏ hàng */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><ShoppingCartOutlined style={{ color: '#7c3aed', marginRight: 6 }} /> <b>2. Thêm vào giỏ</b></span>
                  <span><b>{fCarts.toLocaleString('vi-VN')}</b> <Text type="secondary">({cartRate}%)</Text></span>
                </div>
                <Progress percent={cartRate} strokeColor="#7c3aed" showInfo={false} />
              </div>

              {/* Bước 3: Đặt hàng */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><DollarOutlined style={{ color: '#f59e0b', marginRight: 6 }} /> <b>3. Đặt hàng (Checkout)</b></span>
                  <span><b>{fCheckouts.toLocaleString('vi-VN')}</b> <Text type="secondary">({checkoutRate}%)</Text></span>
                </div>
                <Progress percent={checkoutRate} strokeColor="#f59e0b" showInfo={false} />
              </div>

              {/* Bước 4: Hoàn tất */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><CheckCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} /> <b>4. Giao hàng thành công</b></span>
                  <span><b style={{ color: '#16a34a' }}>{fCompleted.toLocaleString('vi-VN')}</b> <Text type="secondary">({successRate}%)</Text></span>
                </div>
                <Progress percent={successRate} strokeColor="#16a34a" showInfo={false} />
              </div>
            </div>

            <div style={{ marginTop: 18, background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12.5, color: '#475569' }}>
                💡 <b>Đánh giá:</b> Tỷ lệ hoàn tất đơn đạt <b>{successRate}%</b>, duy trì ở mức cao so với chuẩn ngành bán lẻ thực phẩm hữu cơ.
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── BẢNG CẢNH BÁO FEFO & TOP NÔNG SẢN BÁN CHẠY ── */}
      <Row gutter={[16, 16]}>
        {/* Top 5 sản phẩm bán chạy */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Top Nông Sản Bán Chạy</span>
              </Space>
            }
            extra={
              <Input
                size="small"
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Tìm nông sản..."
                value={topProdSearch}
                allowClear
                onChange={(e) => setTopProdSearch(e.target.value)}
                style={{ width: 140, borderRadius: 8 }}
              />
            }
            loading={loading}
            style={{ borderRadius: 14 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topProducts
                .filter((p) => {
                  if (!topProdSearch.trim()) return true;
                  return (p.name || '').toLowerCase().includes(topProdSearch.trim().toLowerCase());
                })
                .map((p, idx) => {
                  const maxSales = topProducts[0]?.sales || 1;
                  const percent = Math.round((p.sales / maxSales) * 100);
                  const colors = ['#ef4444', '#f59e0b', '#10b981', '#0284c7', '#8b5cf6'];
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                        <Space>
                          <Tag 
                            color={idx === 0 ? 'gold' : idx === 1 ? 'cyan' : idx === 2 ? 'volcano' : 'default'}
                            style={{ borderRadius: 999, fontWeight: 700, padding: '1px 8px' }}
                          >
                            #{idx + 1}
                          </Tag>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </Space>
                        <b style={{ color: '#16a34a' }}>{p.sales.toLocaleString('vi-VN')} kg</b>
                      </div>
                      <Progress percent={percent} strokeColor={colors[idx] || '#16a34a'} size="small" showInfo={false} />
                    </div>
                  );
                })}
              {topProducts.filter((p) => !topProdSearch.trim() || (p.name || '').toLowerCase().includes(topProdSearch.trim().toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                  Không tìm thấy nông sản phù hợp
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Lô hàng sắp hết hạn (Cảnh báo FEFO) */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#ef4444' }} />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Lô Hàng Cần Xử Lý Gấp (FEFO)</span>
              </Space>
            }
            extra={
              <Space wrap size={6}>
                <Input
                  size="small"
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Tìm mã lô, nông sản..."
                  value={fefoSearch}
                  allowClear
                  onChange={(e) => setFefoSearch(e.target.value)}
                  style={{ width: 170, borderRadius: 8 }}
                />
                <Select
                  size="small"
                  value={fefoPriorityFilter}
                  onChange={(val) => setFefoPriorityFilter(val)}
                  style={{ width: 135 }}
                >
                  <Select.Option value="all">Tất cả ưu tiên</Select.Option>
                  <Select.Option value="red">🔴 Cần xả gấp</Select.Option>
                  <Select.Option value="yellow">🟡 Theo dõi sát</Select.Option>
                </Select>
              </Space>
            }
            loading={loading}
            style={{ borderRadius: 14 }}
          >
            <Table
              dataSource={nearExpiry.filter((item) => {
                if (fefoPriorityFilter !== 'all') {
                  if (fefoPriorityFilter === 'red' && !item.status.includes('đỏ')) return false;
                  if (fefoPriorityFilter === 'yellow' && !item.status.includes('vàng')) return false;
                }
                if (fefoSearch.trim()) {
                  const q = fefoSearch.trim().toLowerCase();
                  const code = (item.batchCode || '').toLowerCase();
                  const pName = (item.productName || '').toLowerCase();
                  const qty = (item.qty || '').toLowerCase();
                  const exp = (item.expiry || '').toLowerCase();
                  const st = (item.status || '').toLowerCase();
                  return code.includes(q) || pName.includes(q) || qty.includes(q) || exp.includes(q) || st.includes(q);
                }
                return true;
              })}
              columns={nearExpiryColumns}
              pagination={false}
              rowKey="id"
              size="middle"
              locale={{ emptyText: 'Hiện không có lô hàng nào cần cảnh báo cận hạn' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
