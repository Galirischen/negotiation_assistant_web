import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // 组件加载时强制清除所有登录信息
  React.useEffect(() => {
    // 如果有登录状态，先登出
    if (isAuthenticated()) {
      logout();
    }
    // 清除所有localStorage
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // Demo用户列表
  const demoUsers = [
    { id: 'U001', name: '刘总', role: '分管负责人', roleType: ROLES.DIRECTOR },
    { id: 'U002', name: '王部长', role: '部门负责人', roleType: ROLES.DIRECTOR },
    { id: 'U003', name: '张组长', role: '组长(资金商务一组)', roleType: ROLES.TEAM_LEADER },
    { id: 'U004', name: '李商务', role: '商务(资金商务一组)', roleType: ROLES.EMPLOYEE },
    { id: 'U005', name: '赵商务', role: '商务(资金商务一组)', roleType: ROLES.EMPLOYEE },
    { id: 'U006', name: '陈组长', role: '组长(资金商务二组)', roleType: ROLES.TEAM_LEADER },
    { id: 'U007', name: '孙商务', role: '商务(资金商务二组)', roleType: ROLES.EMPLOYEE },
    { id: 'U008', name: '周商务', role: '商务(资金商务二组)', roleType: ROLES.EMPLOYEE }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('请输入工号');
      return;
    }

    setLoading(true);

    try {
      const result = await login(userId);

      if (result.success) {
        // 登录成功,跳转到首页
        navigate('/intelligence');
      } else {
        setError(result.error || '登录失败');
      }
    } catch (err) {
      setError('登录失败,请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUserId) => {
    setUserId(demoUserId);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 左侧 - 产品介绍 */}
        <div className="login-intro">
          <div className="logo-section">
            <h1 className="product-logo">NegotiaPro AI</h1>
            <p className="product-tagline">资金商务谈判助手</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎙️</span>
              <div className="feature-content">
                <h3>战中辅助</h3>
                <p>实时话术推荐和数据支持</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div className="feature-content">
                <h3>战前准备</h3>
                <p>资方内参和场景话术库</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <div className="feature-content">
                <h3>战后复盘</h3>
                <p>记录沉淀和团队分析</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <div className="feature-content">
                <h3>管理看板</h3>
                <p>团队效能和数据分析</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 登录表单 */}
        <div className="login-form-section">
          <div className="login-form-card">
            <h2 className="login-title">登录</h2>
            <p className="login-subtitle">Demo版 - 输入工号即可登录</p>

            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="userId">工号</label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="请输入工号 (如: U001)"
                  className="form-input"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            {/* Demo用户快速登录 */}
            <div className="demo-users-section">
              <div className="divider">
                <span>或选择Demo账号</span>
              </div>

              <div className="demo-users-grid">
                {demoUsers.map((user) => (
                  <button
                    key={user.id}
                    className="demo-user-button"
                    onClick={() => handleQuickLogin(user.id)}
                    disabled={loading}
                  >
                    <div className="demo-user-name">{user.name}</div>
                    <div className="demo-user-role">{user.role}</div>
                    <div className="demo-user-id">{user.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="login-footer">
            <p>生产环境将启用密码验证和SSO登录</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
