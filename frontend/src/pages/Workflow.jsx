import React, { useState, useEffect } from 'react';
import './Workflow.css';

function Workflow() {
  const [negotiations, setNegotiations] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟加载谈判记录
  useEffect(() => {
    loadNegotiations();

    // 检查是否有从Live Copilot传来的复盘数据
    const currentReview = localStorage.getItem('currentReview');
    if (currentReview) {
      const reviewData = JSON.parse(currentReview);
      // 添加到记录列表
      const newNegotiation = {
        id: Date.now(),
        funder: '待填写资方名称',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        duration: reviewData.duration || '未记录',
        messageCount: reviewData.conversation?.length || 0,
        keyDecisions: extractKeyDecisions(reviewData.conversation || []),
        conversation: reviewData.conversation || [],
        summary: '本次谈判涉及多个关键议题，详见对话记录'
      };

      setNegotiations(prev => [newNegotiation, ...prev]);
      localStorage.removeItem('currentReview');
    }
  }, []);

  // 加载历史谈判记录（Demo版使用模拟数据）
  const loadNegotiations = () => {
    const mockNegotiations = [
      {
        id: 1,
        funder: '中关村银行',
        date: '2026-02-08',
        status: 'completed',
        duration: '45分钟',
        messageCount: 12,
        keyDecisions: ['阶梯式保证金方案获得初步认可', '同意提供额外风险准备金', '后续需评审委员会审批'],
        conversation: [
          { type: 'opponent', content: '你们最近发生了股东变更，是不是公司经营出了问题？', timestamp: '09:15' },
          { type: 'self', content: '感谢关注。这次股东调整是集团战略优化的一部分，新股东背景更强...', timestamp: '09:16' },
        ],
        summary: '针对中关村银行要求提升保证金比例的诉求，我方提出阶梯式方案获得初步认可。对方关注股东变更和资产质量，我方通过数据支撑和替代方案有效应对。',
        meetingNotes: {
          attendees: '我方：商务总监张三、风控经理李四；对方：风险评审委员会主任王五、业务部负责人赵六',
          topics: '1. 股东变更对业务稳定性的影响；2. 资产质量改善措施；3. 保证金比例调整方案',
          agreements: '1. 阶梯式保证金方案可行性较高；2. 我方每周报送风险数据；3. 3个工作日内给出评审委员会最终意见',
          disagreements: '1. 对方坚持10%保证金，我方认为过高；2. 对M3+改善速度的预期存在差异'
        },
        todos: [
          {
            title: '准备评审委员会汇报材料',
            owner: '张三',
            deadline: '2026-02-10',
            priority: 'high',
            status: 'completed'
          },
          {
            title: '整理近3月资产质量改善数据',
            owner: '李四',
            deadline: '2026-02-09',
            priority: 'high',
            status: 'completed'
          },
          {
            title: '跟进评审委员会审批进度',
            owner: '张三',
            deadline: '2026-02-11',
            priority: 'medium',
            status: 'pending'
          }
        ],
        scriptLearnings: [
          {
            type: 'success',
            scene: '股东变更应对',
            situation: '对方质疑股东变更是否影响经营稳定性',
            script: '主动坦诚+转危为机：感谢关注。这次股东调整是集团战略优化的一部分，新股东背景更强，管理团队稳定，业务未受影响。Q4放款环比增长12%...',
            effect: '对方接受了我们的解释，未再深入追问。主动披露数据增强了可信度。',
            suggestion: '可以提前准备新股东的详细背景资料，增强说服力'
          },
          {
            type: 'success',
            scene: '安全垫谈判',
            situation: '对方要求保证金从5%提升到10%',
            script: '阶梯式保证金方案：前3月7%，M3+控制在4%以内则恢复6%；超过4.5%接受8%',
            effect: '对方认为阶梯方案合理，愿意提交评审委员会讨论。避免了直接拒绝导致的僵局。',
            suggestion: null
          },
          {
            type: 'improvement',
            scene: '资产质量讨论',
            situation: '对方指出M3+ 4.8%高于行业3.2%',
            script: '我们承认数据偏高，但强调近期改善趋势',
            effect: '对方仍有疑虑，认为改善速度不够快',
            suggestion: '应该更详细地拆解数据：历史遗留vs新增资产，并提供同类机构对标数据，增强说服力'
          }
        ]
      },
      {
        id: 2,
        funder: '浦发银行',
        date: '2026-02-05',
        status: 'completed',
        duration: '30分钟',
        messageCount: 8,
        keyDecisions: ['维持现有商务条件', '增加月度数据报送频率', '下月排期确认为800万'],
        conversation: [],
        summary: '常规业务沟通，确认下月放款排期和数据报送要求。合作稳定，无重大议题。'
      },
      {
        id: 3,
        funder: '华夏银行',
        date: '2026-02-01',
        status: 'pending',
        duration: '待完成',
        messageCount: 0,
        keyDecisions: [],
        conversation: [],
        summary: '计划讨论新产品合作可能性'
      }
    ];

    setNegotiations(mockNegotiations);
  };

  // 提取关键决策点
  const extractKeyDecisions = (conversation) => {
    // 简单逻辑：提取包含关键词的对话
    const keywords = ['同意', '接受', '方案', '决定', '批准', '确认'];
    return conversation
      .filter(msg => keywords.some(kw => msg.content.includes(kw)))
      .map(msg => msg.content.substring(0, 30) + '...')
      .slice(0, 3);
  };

  // 筛选谈判记录
  const filteredNegotiations = negotiations.filter(neg => {
    const matchStatus = filterStatus === 'all' || neg.status === filterStatus;
    const matchSearch = neg.funder.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       neg.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // 查看详情
  const viewDetail = (negotiation) => {
    setSelectedReview(negotiation);
  };

  // 关闭详情
  const closeDetail = () => {
    setSelectedReview(null);
  };

  // 导出报告
  const exportReport = (negotiation) => {
    const report = `
谈判复盘报告
=============

资方名称: ${negotiation.funder}
谈判日期: ${negotiation.date}
谈判时长: ${negotiation.duration}
对��轮次: ${negotiation.messageCount}

关键决策:
${negotiation.keyDecisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

谈判总结:
${negotiation.summary}

对话记录:
${negotiation.conversation.map((msg, i) => `[${msg.timestamp}] ${msg.type === 'opponent' ? '对方' : '我方'}: ${msg.content}`).join('\n\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `谈判复盘_${negotiation.funder}_${negotiation.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 删除记录
  const deleteNegotiation = (id) => {
    if (window.confirm('确定要删除这条谈判记录吗？')) {
      setNegotiations(negotiations.filter(n => n.id !== id));
      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
    }
  };

  // 统计数据
  const stats = {
    total: negotiations.length,
    completed: negotiations.filter(n => n.status === 'completed').length,
    pending: negotiations.filter(n => n.status === 'pending').length,
    totalMessages: negotiations.reduce((sum, n) => sum + n.messageCount, 0),
    totalTodos: negotiations.reduce((sum, n) => sum + (n.todos?.length || 0), 0),
    completedTodos: negotiations.reduce((sum, n) =>
      sum + (n.todos?.filter(t => t.status === 'completed').length || 0), 0),
    pendingTodos: negotiations.reduce((sum, n) =>
      sum + (n.todos?.filter(t => t.status === 'pending').length || 0), 0)
  };

  return (
    <div className="workflow-page">
      {/* Header */}
      <div className="workflow-header">
        <div>
          <h1 className="page-title">📋 战后复盘</h1>
          <p className="page-subtitle">Workflow - 谈判记录与分析</p>
        </div>

        {/* Statistics */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">谈判记录数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalTodos}</div>
            <div className="stat-label">待办事项总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedTodos}</div>
            <div className="stat-label">已完成待办</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingTodos}</div>
            <div className="stat-label">待完成待办</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="workflow-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            已完成
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            待完成
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="搜索资方名称或关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Negotiations List */}
      <div className="negotiations-list">
        {filteredNegotiations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>暂无谈判记录</p>
            <p className="empty-hint">完成实时谈判后，复盘报告将自动生成在此</p>
          </div>
        ) : (
          filteredNegotiations.map((negotiation) => (
            <div key={negotiation.id} className="negotiation-card">
              <div className="negotiation-header">
                <div className="negotiation-info">
                  <h3 className="negotiation-funder">{negotiation.funder}</h3>
                  <div className="negotiation-meta">
                    <span className="meta-item">📅 {negotiation.date}</span>
                    <span className="meta-item">⏱️ {negotiation.duration}</span>
                    <span className="meta-item">💬 {negotiation.messageCount}条对话</span>
                  </div>
                </div>

                <div className="negotiation-status">
                  <span className={`status-badge ${negotiation.status}`}>
                    {negotiation.status === 'completed' ? '✅ 已完成' : '⏳ 待完成'}
                  </span>
                </div>
              </div>

              <div className="negotiation-summary">
                <p>{negotiation.summary}</p>
              </div>

              {negotiation.keyDecisions.length > 0 && (
                <div className="key-decisions">
                  <div className="decisions-label">🎯 关键决策:</div>
                  <ul>
                    {negotiation.keyDecisions.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="negotiation-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => viewDetail(negotiation)}
                >
                  👁️ 查看详情
                </button>
                <button
                  className="action-btn export-btn"
                  onClick={() => exportReport(negotiation)}
                >
                  📥 导出报告
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => deleteNegotiation(negotiation.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="detail-modal-overlay" onClick={closeDetail}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 谈判详情 - {selectedReview.funder}</h2>
              <button className="close-btn" onClick={closeDetail}>✕</button>
            </div>

            <div className="modal-content">
              {/* Basic Info */}
              <div className="detail-section">
                <h3>基本信息</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">资方名称:</span>
                    <span className="info-value">{selectedReview.funder}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">谈判日期:</span>
                    <span className="info-value">{selectedReview.date}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">谈判时长:</span>
                    <span className="info-value">{selectedReview.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">对话轮次:</span>
                    <span className="info-value">{selectedReview.messageCount}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="detail-section">
                <h3>谈判总结</h3>
                <p className="summary-text">{selectedReview.summary}</p>
              </div>

              {/* Key Decisions */}
              {selectedReview.keyDecisions.length > 0 && (
                <div className="detail-section">
                  <h3>关键决策</h3>
                  <ul className="decisions-list">
                    {selectedReview.keyDecisions.map((decision, index) => (
                      <li key={index}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conversation */}
              {selectedReview.conversation.length > 0 && (
                <div className="detail-section">
                  <h3>对话记录</h3>
                  <div className="conversation-replay">
                    {selectedReview.conversation.map((msg, index) => (
                      <div
                        key={index}
                        className={`replay-message ${msg.type}`}
                      >
                        <div className="replay-time">{msg.timestamp}</div>
                        <div className="replay-label">
                          {msg.type === 'opponent' ? '🔴 对方' : '✅我方'}
                        </div>
                        <div className="replay-content">{msg.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 会议纪要 */}
              {selectedReview.meetingNotes && (
                <div className="detail-section">
                  <h3>📝 会议纪要</h3>
                  <div className="meeting-notes">
                    <div className="notes-item">
                      <div className="notes-label">参会人员:</div>
                      <div className="notes-content">{selectedReview.meetingNotes.attendees}</div>
                    </div>
                    <div className="notes-item">
                      <div className="notes-label">核心议题:</div>
                      <div className="notes-content">{selectedReview.meetingNotes.topics}</div>
                    </div>
                    <div className="notes-item">
                      <div className="notes-label">达成共识:</div>
                      <div className="notes-content">{selectedReview.meetingNotes.agreements}</div>
                    </div>
                    <div className="notes-item">
                      <div className="notes-label">分歧点:</div>
                      <div className="notes-content">{selectedReview.meetingNotes.disagreements}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 待办事项 */}
              {selectedReview.todos && selectedReview.todos.length > 0 && (
                <div className="detail-section">
                  <h3>✅ 待办事项</h3>
                  <div className="todos-list">
                    {selectedReview.todos.map((todo, index) => (
                      <div key={index} className={`todo-item ${todo.status}`}>
                        <div className="todo-header">
                          <span className="todo-icon">
                            {todo.status === 'completed' ? '✅' : '⏳'}
                          </span>
                          <span className="todo-title">{todo.title}</span>
                          <span className={`todo-priority ${todo.priority}`}>
                            {todo.priority === 'high' ? '高优先级' :
                             todo.priority === 'medium' ? '中优先级' : '低优先级'}
                          </span>
                        </div>
                        <div className="todo-details">
                          <span className="todo-owner">负责人: {todo.owner}</span>
                          <span className="todo-deadline">截止: {todo.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 话术经验沉淀 */}
              {selectedReview.scriptLearnings && selectedReview.scriptLearnings.length > 0 && (
                <div className="detail-section">
                  <h3>💡 话术经验沉淀</h3>
                  <div className="learnings-list">
                    {selectedReview.scriptLearnings.map((learning, index) => (
                      <div key={index} className="learning-card">
                        <div className="learning-header">
                          <span className={`learning-type ${learning.type}`}>
                            {learning.type === 'success' ? '✅ 有效话术' : '⚠️ 改进建议'}
                          </span>
                          <span className="learning-scene">{learning.scene}</span>
                        </div>
                        <div className="learning-content">
                          <div className="learning-label">场景:</div>
                          <p>{learning.situation}</p>
                        </div>
                        <div className="learning-content">
                          <div className="learning-label">使用话术:</div>
                          <p>{learning.script}</p>
                        </div>
                        <div className="learning-content">
                          <div className="learning-label">效果评价:</div>
                          <p>{learning.effect}</p>
                        </div>
                        {learning.suggestion && (
                          <div className="learning-suggestion">
                            <div className="learning-label">优化建议:</div>
                            <p>{learning.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-action-btn export"
                onClick={() => exportReport(selectedReview)}
              >
                📥 导出报告
              </button>
              <button className="modal-action-btn close" onClick={closeDetail}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workflow;
