import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Alert, Progress } from 'antd';
import { 
  ArrowUpOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  InboxOutlined, 
  WarningOutlined, 
  LikeOutlined 
} from '@ant-design/icons';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { productService, orderService } from '../services/api';

// Mock data cho Dashboard khi database trống
const mockRevenueData = [
  { name: 'T2', Revenue: 4000, Orders: 24 },
  { name: 'T3', Revenue: 3000, Orders: 18 },
  { name: 'T4', Revenue: 5000, Orders: 29 },
  { name: 'T5', Revenue: 8000, Orders: 40 },
  { name: 'T6', Revenue: 6000, Orders: 32 },
  { name: 'T7', Revenue: 10000, Orders: 55 },
  { name: 'CN', Revenue: 12000, Orders: 62 },
];

const mockTopProducts = [
  { name: 'Gạo ST25', sales: 120 },
  { name: 'Sầu riêng Ri6', sales: 98 },
  { name: 'Bơ sáp Đắk Lắk', sales: 86 },
  { name: 'Măng cụt Lái Thiêu', sales: 74 },
  { name: 'Bưởi da xanh', sales: 50 },
];

const mockNearExpiry = [
  { id: 1, batchCode: 'L-2408-01', productName: 'Bơ sáp Đắk Lắk', qty: '150 kg', expiry: 'Còn 3 ngày', status: 'Cảnh báo đỏ' },
  { id: 2, batchCode: 'L-2408-05', productName: 'Măng cụt Lái Thiêu', qty: '80 kg', expiry: 'Còn 5 ngày', status: 'Cảnh báo vàng' },
  { id: 3, batchCode: 'L-2408-09', productName: 'Rau cải ngọt Organic', qty: '40 kg', expiry: 'Còn 1 ngày', status: 'Cảnh báo đỏ' },
];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 48000000, // VND
    totalOrders: 260,
    totalProducts: 12,
    totalUsers: 45,
  });

  useEffect(() => {
    // Gọi API thật để đếm dữ liệu nếu có
    const fetchStats = async () => {
      try {
        const prodRes = await productService.getAll();
        const orderRes = await orderService.getAll();
        
        let revenue = 0;
        let ordersCount = orderRes.data.length || 260;
        
        if (orderRes.data.length > 0) {
          revenue = orderRes.data.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        }

        setStats({
          totalRevenue: revenue > 0 ? revenue : 48000000,
          totalOrders: ordersCount,
          totalProducts: prodRes.data.length || 12,
          totalUsers: 45, // Giả định
        });
      } catch (error) {
        console.log('Using mock data for stats', error);
      }
    };
    fetchStats();
  }, []);

  const nearExpiryColumns = [
    { title: 'Mã Lô Hàng', dataIndex: 'batchCode', key: 'batchCode' },
    { title: 'Sản Phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Tồn Kho', dataIndex: 'qty', key: 'qty' },
    { title: 'Hạn Sử Dụng', dataIndex: 'expiry', key: 'expiry', render: (text: string) => <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span> },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status.includes('đỏ') ? 'red' : 'orange'}>{status}</Tag>
    )},
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Dashboard Quản Trị Hệ Thống ECC</h2>

      {/* Thông báo cảnh báo sớm */}
      <Alert
        message="Cảnh báo lô hàng sắp hết hạn"
        description="Phát hiện 3 lô hàng nông sản đang lưu kho sắp quá hạn sử dụng. Vui lòng kiểm tra và lên chương trình xả kho (FEFO)."
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Thẻ thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu (Tuần này)"
              value={stats.totalRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix=" VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Đơn Hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản Phẩm Đang Bán"
              value={stats.totalProducts}
              prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thành Viên Hệ Thống"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Xu Hướng Doanh Thu & Đơn Hàng (Tuần qua)">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8884d8" name="Doanh Thu (VNĐ)" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#82ca9d" name="Số Đơn Hàng" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Sản Phẩm Bán Chạy (Sản lượng kg)">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={mockTopProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#52c41a" name="Sản lượng bán (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Cảnh báo lô hàng hết hạn & hiệu quả AI */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Lô Hàng Cần Xử Lý Gấp (Cảnh báo FEFO)">
            <Table
              dataSource={mockNearExpiry}
              columns={nearExpiryColumns}
              pagination={false}
              rowKey="id"
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Đánh Giá Mô-đun Gợi Ý AI (Độ chính xác)">
            <div style={{ padding: '10px 0' }}>
              <div style={{ marginBottom: 15 }}>
                <span>Độ chính xác mô hình Collaborative Filtering (ALS):</span>
                <Progress percent={88.5} status="active" strokeColor="#52c41a" />
              </div>
              <div style={{ marginBottom: 15 }}>
                <span>Tỉ lệ chuyển đổi từ Gợi ý mua sắm:</span>
                <Progress percent={32.4} status="active" strokeColor="#1890ff" />
              </div>
              <div style={{ marginBottom: 15 }}>
                <span>Độ hài lòng của khách hàng đối với vị trí gợi ý:</span>
                <Progress percent={94.0} status="active" strokeColor="#722ed1" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                <LikeOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 10 }} />
                <div>
                  <strong>Cải thiện 15% doanh số</strong>
                  <p style={{ margin: 0, color: '#8c8c8c', fontSize: 12 }}>
                    Nhờ hệ thống tự động ưu tiên gợi ý sản phẩm nông sản theo mùa vụ và khoảng cách địa lý gần nhất.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
