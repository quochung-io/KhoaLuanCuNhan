import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Space, Tag, Avatar, Button, Tooltip, ConfigProvider, notification } from 'antd';
import signalRService from './services/signalrService';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  InboxOutlined,
  SolutionOutlined,
  PercentageOutlined,
  LogoutOutlined,
  DownOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  CloseCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ExportOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
} from '@ant-design/icons';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { CancelledOrders } from './pages/CancelledOrders';
import { Batches } from './pages/Batches';
import { PromotionsReviews } from './pages/PromotionsReviews';
import { RecommendationAnalytics } from './pages/RecommendationAnalytics';
import { ProductReports } from './pages/ProductReports';
import { Notifications } from './pages/Notifications';
import { Certificates } from './pages/Certificates';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const { Header, Content, Footer, Sider } = Layout;

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Tổng Quan', subtitle: 'Phân tích chỉ số kinh doanh & giám sát vận hành chuỗi nông sản' },
  '/users': { title: 'Quản Lý Thành Viên & Đối Tác', subtitle: 'Quản lý tài khoản khách hàng, phê duyệt HTX / nhà cung cấp' },
  '/products': { title: 'Sản Phẩm & Danh Mục Nông Sản', subtitle: 'Quản lý danh mục, nông sản lẻ và gói combo tự chọn' },
  '/batches': { title: 'Lô Hàng & Nguồn Gốc (FEFO)', subtitle: 'Theo dõi hạn sử dụng, xuất kho theo FEFO và xả hàng cận hạn' },
  '/orders': { title: 'Đơn Hàng & Vận Hành', subtitle: 'Tiếp nhận, xử lý đóng gói và bàn giao giao nhận nông sản tươi' },
  '/cancelled-orders': { title: 'Đơn Hủy & Khiếu Nại Đổi Trả', subtitle: 'Xử lý hoàn tiền, thẩm định khiếu nại tươi sống & chống gian lận' },
  '/product-reports': { title: 'Báo Cáo & Tồn Kho Nông Sản', subtitle: 'Thống kê doanh thu, sản lượng bán và hàng hết hạn FEFO' },
  '/promotions': { title: 'Khuyến Mãi & Đánh Giá', subtitle: 'Quản lý voucher giảm giá và duyệt phản hồi đánh giá khách hàng' },
  '/recommendations': { title: 'Gợi Ý AI & Hành Vi Khách Hàng', subtitle: 'Phân tích thuật toán gợi ý thông minh, CTR và doanh thu phễu' },
  '/certificates': { title: 'Pháp Lý & Giấy Chứng Nhận (VietGAP/GlobalGAP)', subtitle: 'Giám sát tính pháp lý, tiêu chuẩn an toàn nông sản và thẩm định hồ sơ' },
  '/notifications': { title: 'Gửi Thông Báo Hệ Thống', subtitle: 'Phát sóng tin tức, chính sách & cảnh báo tới người dùng' },
};

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  // Check login state
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = (parsed.role || '').toUpperCase();
        const roleId = parsed.roleId;
        // Cho phép cả ADMIN và SUPPLIER truy cập Web Portal
        if (role === 'ADMIN' || role === 'SUPPLIER' || roleId === 1 || roleId === 2) {
          setUser(parsed);
        } else {
          handleLogout();
        }
      } catch {
        handleLogout();
      }
    } else {
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

  // Route Guard: Ngăn chặn Supplier truy cập vào các trang chỉ dành riêng cho Admin
  useEffect(() => {
    if (user) {
      const isSupplier = (user.role || '').toUpperCase() === 'SUPPLIER' || user.roleId === 2;
      const adminOnlyRoutes = ['/users', '/cancelled-orders', '/promotions', '/recommendations'];
      if (isSupplier && adminOnlyRoutes.includes(location.pathname)) {
        navigate('/');
      }
    }
  }, [user, location.pathname, navigate]);

  // Real-time Notification Listener via SignalR
  useEffect(() => {
    if (user) {
      signalRService.start();

      const unsubscribeCreated = signalRService.onOrderCreated((data) => {
        notification.info({
          message: '🔔 Đơn Hàng Mới Phát Sinh!',
          description: data?.message || `Đơn hàng #${data?.orderCode || ''} vừa được đặt thành công.`,
          placement: 'topRight',
          duration: 7,
          btn: (
            <Button type="primary" size="small" onClick={() => navigate('/orders')}>
              Xem Đơn Hàng
            </Button>
          ),
        });
      });

      const unsubscribeStatus = signalRService.onOrderStatusChanged((data) => {
        notification.success({
          message: '📦 Cập Nhật Trạng Thái Đơn Hàng',
          description: data?.message || `Đơn hàng #${data?.orderCode || ''} vừa chuyển sang: ${data?.orderStatus || ''}`,
          placement: 'topRight',
          duration: 6,
        });
      });

      return () => {
        unsubscribeCreated();
        unsubscribeStatus();
      };
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  const isSupplier = (user?.role || '').toUpperCase() === 'SUPPLIER' || user?.roleId === 2;

  const currentMeta = isSupplier
    ? {
        '/': { title: 'Dashboard Đối Tác Nhà Cung Cấp', subtitle: 'Giám sát sản lượng, đơn đặt hàng và hạn dùng nông sản theo FEFO' },
        '/orders': { title: 'Đơn Hàng Thuộc Nhà Cung Cấp', subtitle: 'Tiếp nhận, xác nhận đóng gói và bàn giao giao nhận nông sản tươi' },
        '/products': { title: 'Nông Sản & Combo Của Hợp Tác Xã', subtitle: 'Quản lý danh mục sản phẩm, khai báo xuất xứ và tiêu chuẩn VietGAP' },
        '/batches': { title: 'Lô Thu Hoạch & Hạn Sử Dụng (FEFO)', subtitle: 'Khai báo lô hàng, hạn sử dụng và cảnh báo xả hàng cận date' },
        '/certificates': { title: 'Hồ Sơ Chứng Nhận Nông Sản Của Tôi', subtitle: 'Khai báo và theo dõi hạn sử dụng giấy chứng nhận VietGAP / GlobalGAP' },
        '/product-reports': { title: 'Báo Cáo Xuất Kho & Doanh Thu NCC', subtitle: 'Thống kê sản lượng cung ứng và kiểm soát hao hụt' },
        '/notifications': { title: 'Thông Báo Hệ Thống', subtitle: 'Xem chính sách sàn, đơn hàng mới & cảnh báo hạn dùng' },
      }[location.pathname] || {
        title: 'Cổng Đối Tác Chuỗi Nông Sản',
        subtitle: 'Nền tảng chuỗi cung ứng nông sản thông minh ECC Agri-Chain',
      }
    : ROUTE_TITLES[location.pathname] || {
        title: 'Hệ Thống Quản Trị ECC',
        subtitle: 'Nền tảng chuỗi cung ứng nông sản thông minh',
      };

  const adminMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/">Tổng Quan Dashboard</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/orders">Đơn Hàng & Vận Hành</Link>,
    },
    {
      key: '/cancelled-orders',
      icon: <CloseCircleOutlined style={{ fontSize: 16, color: '#f87171' }} />,
      label: (
        <Link to="/cancelled-orders">
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Đơn Hủy & Đổi Trả</span>
            <span className="admin-menu-badge">
              Zero-Waste
            </span>
          </span>
        </Link>
      ),
    },
    {
      key: '/products',
      icon: <InboxOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/products">Sản Phẩm & Combo</Link>,
    },
    {
      key: '/batches',
      icon: <SolutionOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/batches">Lô Hàng & Hạn Dùng FEFO</Link>,
    },
    {
      key: '/certificates',
      icon: <SafetyCertificateOutlined style={{ fontSize: 16, color: '#10b981' }} />,
      label: <Link to="/certificates">Pháp Lý & Chứng Nhận</Link>,
    },
    {
      key: '/product-reports',
      icon: <BarChartOutlined style={{ fontSize: 16, color: '#38bdf8' }} />,
      label: <Link to="/product-reports">Báo Cáo & Thất Thoát</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/users">Thành Viên & Đối Tác HTX</Link>,
    },
    {
      key: '/promotions',
      icon: <PercentageOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/promotions">Khuyến Mãi & Đánh Giá</Link>,
    },
    {
      key: '/recommendations',
      icon: <ThunderboltOutlined style={{ fontSize: 16, color: '#4ade80' }} />,
      label: <Link to="/recommendations">Gợi Ý AI & Xu Hướng</Link>,
    },
    {
      key: '/notifications',
      icon: <BellOutlined style={{ fontSize: 16, color: '#f472b6' }} />,
      label: <Link to="/notifications">Gửi Thông Báo</Link>,
    },
  ];

  const supplierMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/">Dashboard NCC Của Tôi</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined style={{ fontSize: 16, color: '#38bdf8' }} />,
      label: <Link to="/orders">Đơn Hàng Cần Đóng Gói</Link>,
    },
    {
      key: '/products',
      icon: <InboxOutlined style={{ fontSize: 16 }} />,
      label: <Link to="/products">Nông Sản & Gói Combo</Link>,
    },
    {
      key: '/batches',
      icon: <SolutionOutlined style={{ fontSize: 16, color: '#4ade80' }} />,
      label: <Link to="/batches">Lô Thu Hoạch (FEFO)</Link>,
    },
    {
      key: '/certificates',
      icon: <SafetyCertificateOutlined style={{ fontSize: 16, color: '#10b981' }} />,
      label: <Link to="/certificates">Chứng Nhận Của Tôi</Link>,
    },
    {
      key: '/product-reports',
      icon: <BarChartOutlined style={{ fontSize: 16, color: '#fbbf24' }} />,
      label: <Link to="/product-reports">Báo Cáo Xuất Kho</Link>,
    },
    {
      key: '/notifications',
      icon: <BellOutlined style={{ fontSize: 16, color: '#f472b6' }} />,
      label: <Link to="/notifications">Thông Báo Hệ Thống</Link>,
    },
  ];

  const menuItems = isSupplier ? supplierMenuItems : adminMenuItems;

  const userMenuItems = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'Administrator'}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email || 'admin@ecc.vn'}</div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Đăng xuất khỏi hệ thống',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* SIDER BAR */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        trigger={null}
        width={260}
        collapsedWidth={80}
        className="admin-sider"
        style={{
          background: '#101a29',
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.05)',
          zIndex: 10,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* LOGO & BRAND HEADER */}
        <div className={`admin-sider-brand${collapsed ? ' is-collapsed' : ''}`}>
          <div className="admin-sider-mark"><ShopOutlined /></div>
          {!collapsed && (
            <div className="admin-sider-brand-copy">
              <div className="admin-sider-brand-name">ECC AGRI-CHAIN</div>
              <div className="admin-sider-brand-caption">
                {isSupplier ? 'Cổng Đối Tác HTX' : 'Quản trị nông sản'}
              </div>
            </div>
          )}
        </div>

        {/* MENU ĐIỀU HƯỚNG */}
        <div className={`admin-sider-navigation${collapsed ? ' is-collapsed' : ''}`}>
          <div className={`admin-sider-nav-heading${collapsed ? ' is-collapsed' : ''}`}>
            {!collapsed && <div className="admin-sider-section-label">Điều hướng</div>}
            <Tooltip title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} placement="right">
              <Button
                type="text"
                className="admin-sider-toggle"
                aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </Tooltip>
          </div>
          <Menu
            theme="dark"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
          />
        </div>

        {/* FOOTER CỦA SIDER */}
        {!collapsed && (
          <div className="admin-sider-footnote">
            <div className="admin-sider-footnote-title">
              <SafetyCertificateOutlined />
              <span>Tiêu chuẩn VietGAP</span>
            </div>
            <div className="admin-sider-footnote-copy">
              Bảo chứng chất lượng nông sản & vận hành minh bạch.
            </div>
          </div>
        )}
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout style={{ background: '#f8fafc' }}>
        {/* TOP HEADER */}
        <Header
          className="admin-topbar"
          style={{
            height: 64,
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
            position: 'sticky',
            top: 0,
            zIndex: 9,
          }}
        >
          <div className="admin-topbar-inner">
          {/* Tiêu đề trang động */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {currentMeta.title}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.2 }}>
                {currentMeta.subtitle}
              </div>
            </div>
          </div>

          {/* PHẢI: Trạng thái Server, Nút Xem Web Store Khách, Thông báo, User Menu */}
          <Space size="middle" align="center">
            {/* Live Status Badge */}
            <Tooltip title="Kết nối trực tiếp Backend Web API port 5023">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#15803d',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#16a34a',
                    boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)',
                  }}
                />
                Hệ Thống Trực Tuyến
              </div>
            </Tooltip>

            {/* Shortcut mở Web Store phía Khách Hàng */}
            <Tooltip title="Mở trang Web Mua Hàng Khách Hàng (localhost:3000)">
              <Button
                type="dashed"
                size="middle"
                icon={<ExportOutlined />}
                onClick={() => window.open('http://localhost:3000', '_blank')}
                style={{
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  borderRadius: 8,
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                Cửa Hàng Khách
              </Button>
            </Tooltip>

            {/* Chuông Thông báo */}
            <Tooltip title="Gửi và xem thông báo hệ thống">
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: 17, color: '#475569' }} />}
                onClick={() => navigate('/notifications')}
                style={{ background: '#f1f5f9' }}
              />
            </Tooltip>

            {/* User Profile Dropdown */}
            {user && (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '4px 10px 4px 6px',
                    borderRadius: 30,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Avatar
                    style={{
                      background: isSupplier
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: isSupplier ? '0 2px 6px rgba(2, 132, 199, 0.3)' : '0 2px 6px rgba(22, 163, 74, 0.3)',
                    }}
                  >
                    {(user.fullName || (isSupplier ? 'NCC' : 'Admin')).charAt(0).toUpperCase()}
                  </Avatar>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                      {user.fullName || (isSupplier ? 'Đối tác Nhà cung cấp' : 'Quản trị viên')}
                    </div>
                    <Tag
                      color={isSupplier ? 'blue' : 'green'}
                      style={{
                        margin: 0,
                        fontSize: 10,
                        padding: '0 4px',
                        lineHeight: '14px',
                        height: 16,
                      }}
                    >
                      {isSupplier ? 'ĐỐI TÁC HTX / NCC' : 'QUẢN TRỊ VIÊN'}
                    </Tag>
                  </div>
                  <DownOutlined style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }} />
                </div>
              </Dropdown>
            )}
          </Space>
          </div>
        </Header>

        {/* NỘI DUNG CHÍNH (CONTENT) */}
        <Content
          className="admin-page-content"
          style={{
            padding: '24px',
            minHeight: 'calc(100vh - 64px - 60px)',
            background: '#f8fafc',
          }}
        >
          <div className="admin-content-inner">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/products" element={<Products />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cancelled-orders" element={<CancelledOrders />} />
              <Route path="/product-reports" element={<ProductReports />} />
              <Route path="/promotions" element={<PromotionsReviews />} />
              <Route path="/recommendations" element={<RecommendationAnalytics />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </Content>

        {/* FOOTER */}
        <Footer
          style={{
            textAlign: 'center',
            padding: '16px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: 13,
          }}
        >
          Hệ Thống Quản Lý Chuỗi Cung Ứng Nông Sản Hữu Cơ Thông Minh (ECC Agri-Chain) ©{new Date().getFullYear()} • Tiêu chuẩn VietGAP / GlobalGAP
        </Footer>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#16a34a',
          colorPrimaryHover: '#15803d',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#0284c7',
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: '#f8fafc',
          colorTextBase: '#0f172a',
        },
        components: {
          Card: {
            borderRadiusLG: 14,
            colorBorderSecondary: '#e2e8f0',
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#334155',
            rowHoverBg: '#f1f5f9',
            borderRadius: 12,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Input: {
            controlHeight: 36,
            borderRadius: 8,
          },
          Select: {
            controlHeight: 36,
            borderRadius: 8,
          },
          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
