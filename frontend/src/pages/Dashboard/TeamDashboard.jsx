import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PermissionGuard from '../../components/PermissionGuard';
import { ROLES } from '../../context/AuthContext';
import './TeamDashboard.css';

const TeamDashboard = () => {
  const { user, authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  useEffect(() => {
    if (user) {
      initializeTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeamId) {
      loadDashboardData(selectedTeamId);
    }
  }, [selectedTeamId]);

  const initializeTeams = async () => {
    // 如果是组长，直接使用自己的 team_id
    if (user.role === ROLES.TEAM_LEADER) {
      setAvailableTeams([{ id: user.team_id, name: '我的团队' }]);
      setSelectedTeamId(user.team_id);
    }
    // 如果是部门负责人或分管负责人，获取部门下所有团队
    else if (user.role === ROLES.DIRECTOR) {
      try {
        // 暂时硬编码两个团队，后续可以从API获取
        const teams = [
          { id: 'team_001', name: '资金商务一组' },
          { id: 'team_002', name: '资金商务二组' }
        ];
        setAvailableTeams(teams);
        // 默认选择第一个团队
        setSelectedTeamId(teams[0].id);
      } catch (err) {
        console.error('获取团队列表失败:', err);
        setError('获取团队列表失败');
      }
    }
  };

  const loadDashboardData = async (teamId) => {
    if (!user || !teamId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await authFetch(
        `http://localhost:8000/api/dashboard/team/${teamId}`
      );

      if (!response.ok) {
        throw new Error('加载失败');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('加载团队看板失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>加载团队数据中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span className="error-icon">⚠️</span>
        <p>加载失败: {error}</p>
        <button onClick={loadDashboardData} className="retry-button">重试</button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { overview, member_performance, funder_coverage, scene_distribution, monthly_trend } = dashboardData;

  return (
    <PermissionGuard minRole={ROLES.TEAM_LEADER}>
      <div className="team-dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="page-title">团队看板</h1>
            <p className="page-subtitle">团队效能分析与成员业绩追踪</p>
          </div>

          {/* 团队选择器 - 仅部门负责人显示 */}
          {availableTeams.length > 1 && (
            <div className="team-selector">
              <label>选择团队：</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="team-select"
              >
                {availableTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 概览卡片 */}
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <div className="card-label">谈判记录数</div>
              <div className="card-value">{overview.totalRecords || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <div className="card-label">待办事项总数</div>
              <div className="card-value">{overview.totalTodos || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <div className="card-label">已完成待办</div>
              <div className="card-value">{overview.completedTodos || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <div className="card-label">待完成待办</div>
              <div className="card-value">{overview.pendingTodos || 0}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-label">本月拜访</div>
              <div className="card-value">{overview.totalVisits}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">🤝</div>
            <div className="card-content">
              <div className="card-label">正式谈判</div>
              <div className="card-value">{overview.totalNegotiations}</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <div className="card-label">成功率</div>
              <div className="card-value">{overview.successRate}%</div>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-label">平均成本优化</div>
              <div className="card-value">{overview.avgCostReduction}%</div>
            </div>
          </div>
        </div>

        {/* 成员业绩表 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>成员业绩</h2>
          </div>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>拜访次数</th>
                  <th>谈判次数</th>
                  <th>成功率</th>
                  <th>平均评分</th>
                  <th>成本优化</th>
                  <th>待办事项</th>
                </tr>
              </thead>
              <tbody>
                {member_performance.map((member) => (
                  <tr key={member.user_id}>
                    <td className="member-name">{member.user_name}</td>
                    <td>{member.visit_count}</td>
                    <td>{member.negotiation_count}</td>
                    <td>
                      <span className={`success-rate ${member.success_rate >= 70 ? 'high' : member.success_rate >= 50 ? 'medium' : 'low'}`}>
                        {member.success_rate}%
                      </span>
                    </td>
                    <td>{member.avg_score > 0 ? member.avg_score.toFixed(1) : '-'}</td>
                    <td>{member.cost_optimization > 0 ? `${member.cost_optimization}%` : '-'}</td>
                    <td>
                      <span className="todo-badge">{member.pending_todos}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 资方覆盖 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>资方覆盖</h2>
          </div>
          <div className="funder-grid">
            {funder_coverage.map((funder, index) => (
              <div key={index} className="funder-card">
                <div className="funder-name">{funder.funder_name}</div>
                <div className="funder-stats">
                  <div className="stat-item">
                    <span className="stat-label">最后拜访</span>
                    <span className="stat-value">
                      {funder.last_visit_date ?
                        new Date(funder.last_visit_date).toLocaleDateString('zh-CN') :
                        'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">月均拜访</span>
                    <span className="stat-value">{funder.visit_frequency}次</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">关系状态</span>
                    <span className={`status-badge ${funder.relationship_status}`}>
                      {funder.relationship_status}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">主要对接</span>
                    <span className="stat-value">{funder.key_owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 场景分布 */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>场景分布</h2>
          </div>
          <div className="scene-bars">
            {Object.entries(scene_distribution).map(([scene, count]) => {
              const maxCount = Math.max(...Object.values(scene_distribution));
              const percentage = (count / maxCount) * 100;

              return (
                <div key={scene} className="scene-bar-item">
                  <div className="scene-label">{scene}</div>
                  <div className="scene-bar-container">
                    <div
                      className="scene-bar-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="scene-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default TeamDashboard;
