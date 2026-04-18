import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = AntLayout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/booking',
      icon: <FileTextOutlined />,
      label: '预约管理',
    },
    {
      key: '/archive',
      icon: <MedicineBoxOutlined />,
      label: '档案管理',
    },
    {
      key: '/sleep-survey',
      icon: <FileTextOutlined />,
      label: '睡眠问卷',
    },
    {
      key: '/nutrition-survey',
      icon: <MedicineBoxOutlined />,
      label: '营养问卷',
    },

  ];

  // 计算当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/users')) {
      return '/users';
    }
    if (path.startsWith('/booking')) {
      return '/booking';
    }
    if (path.startsWith('/archive')) {
      return '/archive';
    }
    if (path.startsWith('/sleep-survey')) {
      return '/sleep-survey';
    }
    if (path.startsWith('/nutrition-survey')) {
      return '/nutrition-survey';
    }

    return '/';
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>管理后台</Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout style={{ marginLeft: 220 }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          }}
        >
          <span style={{ marginRight: 16 }}>{user?.phone}</span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
