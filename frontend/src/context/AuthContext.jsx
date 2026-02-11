import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * 认证上下文 - 管理用户登录状态和权限
 */

const AuthContext = createContext(null);

// 角色定义
export const ROLES = {
  EMPLOYEE: 'employee',
  TEAM_LEADER: 'team_leader',
  DIRECTOR: 'director'
};

// 角色层级(用于权限比较)
const ROLE_HIERARCHY = {
  'employee': 1,
  'team_leader': 2,
  'director': 3
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初始化:从localStorage恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('恢复登录状态失败:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    setLoading(false);
  }, []);

  /**
   * 登录
   * @param {string} userId - 工号
   * @param {string} password - 密码(可选,Demo版)
   */
  const login = async (userId, password = null) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          password: password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || '登录失败');
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);

        // 持久化到localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * 登出
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.clear(); // 清除所有localStorage
    sessionStorage.clear(); // 清除所有sessionStorage
  };

  /**
   * 检查是否已登录
   */
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  /**
   * 检查是否有指定角色
   * @param {string|string[]} requiredRole - 需要的角色
   */
  const hasRole = (requiredRole) => {
    if (!user) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  };

  /**
   * 检查角色权限是否满足最低要求
   * @param {string} minRole - 最低角色要求
   */
  const hasMinRole = (minRole) => {
    if (!user) return false;

    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    return userLevel >= minLevel;
  };

  /**
   * 获取带认证头的fetch配置
   */
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  /**
   * 带认证的fetch封装
   */
  const authFetch = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    };

    const response = await fetch(url, config);

    // 如果返回401,自动登出
    if (response.status === 401) {
      logout();
      throw new Error('认证已过期,请重新登录');
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasMinRole,
    getAuthHeaders,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export default AuthContext;
