import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Space, Tag } from 'antd';
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
} from '@ant-design/icons';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Batches } from './pages/Batches';
import { PromotionsReviews } from './pages/PromotionsReviews';
import { RecommendationAnalytics } from './pages/RecommendationAnalytics';
import { ProductReports } from './pages/ProductReports';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const { Header, Content, Footer, Sider } = Layout;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [user, setUser] = useState<any>(null);

  // Check login state
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = (parsed.role || '').toUpperCase();
        if (role === 'ADMIN' || parsed.roleId === 1) {
          setUser(parsed);
        } else {
          // Tài khoản không phải ADMIN thì đăng xuất
          handleLogout();
        }
      } catch {
        handleLogout();
      }
    } else {
      // Nếu chưa đăng nhập và không ở trang login/register, đá về login
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
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

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Quản lý Thành Viên</Link>,
    },
    {
      key: '/products',
      icon: <InboxOutlined />,
      label: <Link to="/products">Sản Phẩm & Danh Mục</Link>,
    },
    {
      key: '/batches',
      icon: <SolutionOutlined />,
      label: <Link to="/batches">Lô Hàng & Nguồn Gốc</Link>,
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/orders">Đơn Hàng & Vận Hành</Link>,
    },
    {
      key: '/product-reports',
      icon: <BarChartOutlined style={{ color: '#1890ff' }} />,
      label: <Link to="/product-reports">Báo Cáo & Tồn Kho</Link>,
    },
    {
      key: '/promotions',
      icon: <PercentageOutlined />,
      label: <Link to="/promotions">Khuyến Mãi & Đánh Giá</Link>,
    },
    {
      key: '/recommendations',
      icon: <ThunderboltOutlined style={{ color: '#52c41a' }} />,
      label: <Link to="/recommendations">Gợi Ý AI & Hành Vi</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)', 
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? '12px' : '16px',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'ECC' : 'ECC ADMIN'}
        </div>
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['/']} 
          selectedKeys={[location.pathname]} 
          mode="inline" 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()} style={{ cursor: 'pointer', color: 'inherit' }}>
                <Space>
                  <strong>{user.fullName || 'Admin'}</strong>
                  <Tag color="blue">{user.roleId === 1 ? 'ADMIN' : (user.roleId === 2 ? 'SUPPLIER' : 'CUSTOMER')}</Tag>
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          )}
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/products" element={<Products />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/product-reports" element={<ProductReports />} />
              <Route path="/promotions" element={<PromotionsReviews />} />
              <Route path="/recommendations" element={<RecommendationAnalytics />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Hệ Thống Quản Lý Chuỗi Cung Ứng Nông Sản Thông Minh (ECC) ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
