import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  InboxOutlined,
  SolutionOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Batches } from './pages/Batches';
import { PromotionsReviews } from './pages/PromotionsReviews';

const { Header, Content, Footer, Sider } = Layout;

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
        <Header style={{ padding: 0, background: colorBgContainer }} />
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
