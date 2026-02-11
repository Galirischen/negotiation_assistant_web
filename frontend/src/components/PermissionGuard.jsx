import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import './PermissionGuard.css';

/**
 * 权限守卫组件
 * 根据用户角色控制内容显示
 */

const PermissionGuard = ({
  requiredRole,
  minRole,
  fallback = null,
  showMessage = true,
  children
}) => {
  const { user, isAuthenticated, hasRole, hasMinRole } = useAuth();

  // 未登录
  if (!isAuthenticated()) {
    if (showMessage) {
      return (
        <div className="permission-guard-message">
          <div className="guard-icon">🔒</div>
          <p>请先登录</p>
        </div>
      );
    }
    return fallback;
  }

  // 检查角色权限
  let hasPermission = false;

  if (requiredRole) {
    // 精确角色匹配
    hasPermission = hasRole(requiredRole);
  } else if (minRole) {
    // 最低角色要求
    hasPermission = hasMinRole(minRole);
  } else {
    // 未指定权限要求,默认允许
    hasPermission = true;
  }

  if (!hasPermission) {
    if (showMessage) {
      return (
        <div className="permission-guard-message">
          <div className="guard-icon">⛔</div>
          <p>您没有权限访问此内容</p>
          <span className="guard-hint">
            当前角色: {getRoleName(user.role)}
          </span>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * 角色名称映射
 */
const getRoleName = (role) => {
  const roleNames = {
    [ROLES.EMPLOYEE]: '商务',
    [ROLES.TEAM_LEADER]: '组长',
    [ROLES.DIRECTOR]: '部门负责人'
  };
  return roleNames[role] || role;
};

export default PermissionGuard;
