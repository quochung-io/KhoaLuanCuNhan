import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Col, 
  Row, 
  Statistic, 
  Table, 
  Tag, 
  Alert, 
  Progress, 
  message, 
  Segmented, 
  Button, 
  Space, 
  Badge, 
  Tooltip as AntTooltip,
  Typography,
  Input,
  Select
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ShoppingCartOutlined, 
  InboxOutlined, 
  WarningOutlined, 
  ReloadOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  RiseOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  SearchOutlined
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

const { Text, Title } = Typography;

interface RevenuePoint {
  name: string;
  Revenue: number;
  Orders: number;
}

interface TopProduct {
  name: string;
  sales: number;
}

interface NearExpiryBatch {
  id: number;
  batchCode: string;
  productName: string;
  qty: string;
  expiry: string;
  status: string;
}

export const Dashboard: React.FC = () => {
  // Khoảng thời gian phân tích: today | 7days | 30days | thismonth | thisyear
  const [timeRange, setTimeRange] = useState<string>('7days');
  const [chartMetric, setChartMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [lastUpdated, setLastUpdated] = useState<string>(dayjs().format('HH:mm:ss'));

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
      setRevenueData(revenueRes.data || []);

      // 3. Tải top sản phẩm bán chạy
      const topProdRes = await orderService.getTopProducts(selectedRange);
      setTopProducts(topProdRes.data || []);

      // 4. Tải lô hàng sắp hết hạn (FEFO)
      const expiryRes = await orderService.getNearExpiry();
      setNearExpiry(expiryRes.data || []);

      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (error) {
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
        funnel: {
          views: 3980,
          carts: 580,
          checkouts: 168,
          completed: 155
        }
      });
      setRevenueData([
        { name: 'T2', Revenue: 4500000, Orders: 18 },
        { name: 'T3', Revenue: 5200000, Orders: 22 },
        { name: 'T4', Revenue: 6800000, Orders: 26 },
        { name: 'T5', Revenue: 8100000, Orders: 31 },
        { name: 'T6', Revenue: 7900000, Orders: 29 },
        { name: 'T7', Revenue: 9500000, Orders: 36 },
        { name: 'CN', Revenue: 10400000, Orders: 42 },
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
      render: (text: string) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{text}</span> 
    },
    { 
      title: 'Mức Độ Ưu Tiên', 
      dataIndex: 'status', 
      key: 'status', 
      sorter: (a: NearExpiryBatch, b: NearExpiryBatch) => (a.status || '').localeCompare(b.status || ''),
      render: (status: string) => (
        <Tag color={status.includes('đỏ') ? 'red' : 'orange'}>
          {status.includes('đỏ') ? '🔴 CẦN XẢ KHO GẤP' : '🟡 THEO DÕI SÁT'}
        </Tag>
      )
    },
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
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* ── HEADER ĐIỀU KHIỂN THỜI GIAN THẬT & BỘ LỌC CHU KỲ ── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>
              Dashboard Tổng Quan Điều Hành Hệ Thống ECC
            </Title>
            <Badge status="processing" text={<span style={{ color: '#52c41a', fontWeight: 600 }}>Thời gian thực (Live)</span>} />
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Phân tích số liệu kinh doanh chuỗi cung ứng nông sản sạch & hiệu quả vận hành
          </Text>
        </div>

        <Space wrap>
          {/* Bộ chọn chu kỳ nhanh: Ngày / 7 ngày / 30 ngày / Tháng / Năm */}
          <Segmented
            value={timeRange}
            onChange={(val) => setTimeRange(val as string)}
            options={[
              { label: 'Hôm nay (24h)', value: 'today' },
              { label: '7 ngày qua', value: '7days' },
              { label: '30 ngày qua', value: '30days' },
              { label: 'Tháng này', value: 'thismonth' },
              { label: 'Năm nay', value: 'thisyear' },
            ]}
          />

          <AntTooltip title={`Dữ liệu tự động đồng bộ. Lần cập nhật gần nhất: ${lastUpdated}`}>
            <Button 
              icon={<ReloadOutlined spin={loading} />} 
              onClick={() => loadDashboardData(timeRange)}
              loading={loading}
            >
              Làm mới ({lastUpdated})
            </Button>
          </AntTooltip>
        </Space>
      </div>

      {/* Thông báo cảnh báo sớm nếu có lô hàng sắp hết hạn */}
      {nearExpiry.length > 0 && (
        <Alert
          message={<b>Cảnh báo nông sản cận hạn sử dụng (Thuật toán FEFO)</b>}
          description={`Phát hiện ${nearExpiry.length} lô hàng nông sản sắp đến hạn sử dụng trong thời gian tới. Khuyến nghị Ban Quản Trị lên chương trình Flash Sale hoặc combo giải cứu xả kho ngay.`}
          type="warning"
          showIcon
          icon={<WarningOutlined style={{ color: '#fa8c16' }} />}
          style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #ffe58f' }}
        />
      )}

      {/* ── 5 THẺ CHỈ SỐ KPI CỐT LÕI (CHỈ SỐ THƯƠNG MẠI ĐIỆN TỬ HIỆN ĐẠI) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* 1. Tổng Doanh Thu */}
        <Col xs={24} sm={12} lg={6} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={loading} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>TỔNG DOANH THU (GMV)</span>}
              value={stats.totalRevenue}
              precision={0}
              valueStyle={{ color: '#2e7d32', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix=" đ"
            />
            <div style={{ marginTop: 8, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats.revenueGrowthRate >= 0 ? (
                <Tag color="success" style={{ margin: 0, borderRadius: 999 }}>
                  <ArrowUpOutlined /> +{stats.revenueGrowthRate}%
                </Tag>
              ) : (
                <Tag color="error" style={{ margin: 0, borderRadius: 999 }}>
                  <ArrowDownOutlined /> {stats.revenueGrowthRate}%
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 11.5 }}>so với kỳ trước</Text>
            </div>
          </Card>
        </Col>

        {/* 2. Giá trị đơn trung bình (AOV) */}
        <Col xs={24} sm={12} lg={6} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={loading} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>GIÁ TRỊ ĐƠN TB (AOV)</span>}
              value={stats.aov}
              precision={0}
              valueStyle={{ color: '#0958d9', fontWeight: 700 }}
              prefix={<RiseOutlined />}
              suffix=" đ"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Hiệu quả giỏ hàng mỗi khách
            </div>
          </Card>
        </Col>

        {/* 3. Tổng Đơn Hàng */}
        <Col xs={24} sm={12} lg={6} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={loading} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>TỔNG ĐƠN HÀNG</span>}
              value={stats.totalOrders}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
              prefix={<ShoppingCartOutlined />}
              suffix=" đơn"
            />
            <div style={{ marginTop: 8, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats.ordersGrowthRate >= 0 ? (
                <Tag color="cyan" style={{ margin: 0, borderRadius: 999 }}>
                  <ArrowUpOutlined /> +{stats.ordersGrowthRate}%
                </Tag>
              ) : (
                <Tag color="error" style={{ margin: 0, borderRadius: 999 }}>
                  <ArrowDownOutlined /> {stats.ordersGrowthRate}%
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 11.5 }}>lượng đơn mua</Text>
            </div>
          </Card>
        </Col>

        {/* 4. Tỷ lệ chuyển đổi mua hàng (Conversion Rate) */}
        <Col xs={24} sm={12} lg={6} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={loading} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>TỶ LỆ CHUYỂN ĐỔI (CR)</span>}
              value={stats.conversionRate}
              precision={1}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<ThunderboltOutlined />}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Progress percent={Math.min(100, Math.round((stats.conversionRate / 5) * 100))} size="small" strokeColor="#722ed1" showInfo={false} />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 3 }}>Mục tiêu ngành: &gt; 3.0%</div>
            </div>
          </Card>
        </Col>

        {/* 5. Nông Sản & Thành Viên */}
        <Col xs={24} sm={12} lg={6} xl={4} style={{ flex: '1 1 200px' }}>
          <Card loading={loading} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#595959' }}>QUY MÔ SẢN PHẨM / USER</span>}
              value={stats.totalProducts}
              valueStyle={{ color: '#d46b08', fontWeight: 700 }}
              prefix={<InboxOutlined />}
              suffix={` / ${stats.totalUsers} TV`}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
              <CheckCircleOutlined /> Đang vận hành ổn định
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── KHU VỰC BIỂU ĐỒ DOANH THU & PHỄU CHUYỂN ĐỔI E-COMMERCE ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Biểu đồ xu hướng Area Gradient */}
        <Col xs={24} lg={15}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span>Xu Hướng Doanh Thu &amp; Lượng Đơn Hàng</span>
                <Segmented
                  size="small"
                  value={chartMetric}
                  onChange={(v) => setChartMetric(v as any)}
                  options={[
                    { label: 'Cả hai', value: 'both' },
                    { label: 'Doanh thu', value: 'revenue' },
                    { label: 'Số đơn', value: 'orders' }
                  ]}
                />
              </div>
            } 
            loading={loading}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis yAxisId="left" tickLine={false} tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name.includes('Doanh Thu') ? `${Number(value).toLocaleString('vi-VN')} đ` : `${value} đơn`,
                      name
                    ]}
                  />
                  <Legend />
                  {(chartMetric === 'both' || chartMetric === 'revenue') && (
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="Revenue" 
                      stroke="#2e7d32" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Doanh Thu (đ)" 
                    />
                  )}
                  {(chartMetric === 'both' || chartMetric === 'orders') && (
                    <Area 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="Orders" 
                      stroke="#1677ff" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorOrders)" 
                      name="Số Đơn Hàng" 
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
            title="Phễu Chuyển Đổi Mua Sắm (Funnel)" 
            loading={loading}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            extra={<Tag color="purple">Hiệu Suất Sàn</Tag>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Bước 1: Lượt xem */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><EyeOutlined style={{ color: '#1677ff', marginRight: 6 }} /> <b>1. Lượt xem sản phẩm</b></span>
                  <b>{fViews.toLocaleString('vi-VN')}</b>
                </div>
                <Progress percent={100} strokeColor="#1677ff" showInfo={false} />
              </div>

              {/* Bước 2: Thêm giỏ hàng */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><ShoppingCartOutlined style={{ color: '#722ed1', marginRight: 6 }} /> <b>2. Thêm vào giỏ</b></span>
                  <span><b>{fCarts.toLocaleString('vi-VN')}</b> <Text type="secondary">({cartRate}%)</Text></span>
                </div>
                <Progress percent={cartRate} strokeColor="#722ed1" showInfo={false} />
              </div>

              {/* Bước 3: Đặt hàng */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><DollarOutlined style={{ color: '#fa8c16', marginRight: 6 }} /> <b>3. Đặt hàng (Checkout)</b></span>
                  <span><b>{fCheckouts.toLocaleString('vi-VN')}</b> <Text type="secondary">({checkoutRate}%)</Text></span>
                </div>
                <Progress percent={checkoutRate} strokeColor="#fa8c16" showInfo={false} />
              </div>

              {/* Bước 4: Hoàn tất */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} /> <b>4. Giao &amp; Thanh toán thành công</b></span>
                  <span><b style={{ color: '#52c41a' }}>{fCompleted.toLocaleString('vi-VN')}</b> <Text type="secondary">({successRate}%)</Text></span>
                </div>
                <Progress percent={successRate} strokeColor="#52c41a" showInfo={false} />
              </div>
            </div>

            <div style={{ marginTop: 18, background: '#fafafa', padding: '10px 12px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 12, color: '#595959' }}>
                💡 <b>Nhận xét:</b> Tỷ lệ chốt đơn thành công đạt <b>{successRate}%</b>, cao hơn mức trung bình 2.5% của thị trường nông sản tươi sống.
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
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>Top Nông Sản Bán Chạy</span>
              </Space>
            }
            extra={
              <Input
                size="small"
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                placeholder="Tìm nông sản..."
                value={topProdSearch}
                allowClear
                onChange={(e) => setTopProdSearch(e.target.value)}
                style={{ width: 140 }}
              />
            }
            loading={loading}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
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
                  const colors = ['#f5222d', '#fa8c16', '#faad14', '#1890ff', '#52c41a'];
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                        <Space>
                          <Tag 
                            color={idx === 0 ? 'gold' : idx === 1 ? 'cyan' : idx === 2 ? 'volcano' : 'default'}
                            style={{ borderRadius: 999, fontWeight: 700 }}
                          >
                            #{idx + 1}
                          </Tag>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </Space>
                        <b style={{ color: '#2e7d32' }}>{p.sales.toLocaleString('vi-VN')} kg</b>
                      </div>
                      <Progress percent={percent} strokeColor={colors[idx] || '#52c41a'} size="small" showInfo={false} />
                    </div>
                  );
                })}
              {topProducts.filter((p) => !topProdSearch.trim() || (p.name || '').toLowerCase().includes(topProdSearch.trim().toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
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
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Lô Hàng Cần Xử Lý Gấp (FEFO)</span>
              </Space>
            }
            extra={
              <Space wrap size={6}>
                <Input
                  size="small"
                  prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                  placeholder="Tìm mã lô, nông sản, hạn..."
                  value={fefoSearch}
                  allowClear
                  onChange={(e) => setFefoSearch(e.target.value)}
                  style={{ width: 170 }}
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
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
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
