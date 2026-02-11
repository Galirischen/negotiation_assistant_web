import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 导航配置 - 根据角色显示不同菜单
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/intelligence', label: '战前准备', icon: '📊' },
      { path: '/live-copilot', label: '战中辅助', icon: '🎙️' },
      { path: '/workflow', label: '战后复盘', icon: '📋' }
    ];

    // 根据角色添加额外菜单
    if (user?.role === ROLES.TEAM_LEADER || user?.role === ROLES.DIRECTOR) {
      baseItems.push({
        path: '/dashboard/team',
        label: '团队看板',
        icon: '📈'
      });
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  const getRoleName = (role) => {
    const roleNames = {
      [ROLES.EMPLOYEE]: '商务',
      [ROLES.TEAM_LEADER]: '组长',
      [ROLES.DIRECTOR]: '部门负责人'
    };
    return roleNames[role] || role;
  };

  const handleLogout = () => {
    console.log('退出登录被点击');
    setShowUserMenu(false);

    // 清除所有状态
    logout();

    // 强制清除localStorage和sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 延迟一点再跳转，确保状态已清除
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-section">
            <h1 className="logo">NegotiaPro AI</h1>
            <p className="logo-subtitle">智能谈判助手</p>
          </div>

          {/* Navigation */}
          <nav className="nav-tabs">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-text">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="user-section">
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <span className="user-name">{user?.name || '用户'}</span>
                <span className="user-role">{getRoleName(user?.role)}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <div>{user?.name}</div>
                  <div className="user-menu-id">工号: {user?.user_id}</div>
                </div>
                <div className="user-menu-divider" />
                <button
                  className="user-menu-item"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>

      {/* 点击外部关闭用户菜单 */}
      {showUserMenu && (
        <div
          className="overlay"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
