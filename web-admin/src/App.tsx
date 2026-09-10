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
} from '@ant-design/icons';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Batches } from './pages/Batches';
import { PromotionsReviews } from './pages/PromotionsReviews';
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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Nếu chưa đăng nhập và không ở trang login/register, đá về login
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
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
      key: '/promotions',
      icon: <PercentageOutlined />,
      label: <Link to="/promotions">Khuyến Mãi & Đánh Giá</Link>,
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
              <Route path="/promotions" element={<PromotionsReviews />} />
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
