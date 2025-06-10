import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Modal } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate('/login');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/tasks',
      icon: <PlayCircleOutlined />,
      label: <Link to="/tasks">Task Executor</Link>,
    },
    {
      key: '/datasets',
      icon: <DatabaseOutlined />,
      label: <Link to="/datasets">Datasets</Link>,
    },
    {
      key: '/models',
      icon: <ExperimentOutlined />,
      label: <Link to="/models">Models</Link>,
    },
  ];

  return (
    <>
      <Sider width={250} className="sidebar-container">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Avatar 
              size={48}
              className="user-avatar"
              icon={<UserOutlined />}
            />
            <h2 className="sidebar-title">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </h2>
          </div>
          <div className="user-info">
            <span className="user-email">{user?.email || 'user@example.com'}</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              size="small"
              className="signout-button"
              title="Sign Out"
              onClick={handleLogoutClick}
            />
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[
            location.pathname.startsWith('/tasks') ? '/tasks' :
            location.pathname.startsWith('/datasets') ? '/datasets' :
            location.pathname.startsWith('/models') ? '/models' :
            location.pathname
          ]}
          items={menuItems}
          className="sidebar-menu"
        />
      </Sider>

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Confirm Logout
          </div>
        }
        open={showLogoutModal}
        onOk={confirmLogout}
        onCancel={cancelLogout}
        okText="Sign Out"
        cancelText="Cancel"
        okButtonProps={{
          danger: true
        }}
      >
        <p>Are you sure you want to sign out?</p>
      </Modal>
    </>
  );
};

export default Sidebar; 