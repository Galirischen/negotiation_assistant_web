import React, { useState } from 'react';
import './Intelligence.css';

/**
 * 话术知识库数据
 */

/**
 * 话术知识库数据
 */
const playbookScenes = [
  {
    id: 'cost',
    name: '资金成本谈判',
    icon: '💰',
    scripts: [
      {
        name: '市场行情对标',
        tag: '价格谈判',
        content: '理解贵行成本压力。但市场行情方面，同类银行资金成本在7.0-7.5%区间（某某银行7.2%，某某银行7.3%）。我们合作2年，资产质量稳定（M3+ 3.8%），希望维持7.2%，这样双方都有合理利润空间。',
        tips: '用市场数据说话，强调长期合作价值和资产质量。不要一味压价，保持双赢思维。',
        data: '准备：同业资金成本对标数据、历史合作表现数据、资产质量数据',
        warning: '避免过度强调"别家更便宜"，容易引起反感。重点是合理性和双赢'
      },
      {
        name: '阶梯定价方案',
        tag: '价格谈判',
        content: '能否考虑阶梯定价？前3个月7.5%试跑，如果M3+控制在3.5%以内，后续降到7.2%；如果M3+低于3%，可以降到7.0%。这样既给贵行信心，也给我们动力优化资产。',
        tips: '将价格与表现挂钩，给对方安全感。强调激励机制和改进空间。',
        data: '准备：历史M3+趋势数据、资产优化计划',
        warning: '确保承诺的M3+目标可达成，否则会失信'
      }
    ]
  },
  {
    id: 'deposit',
    name: '保证金条款谈判',
    icon: '🏦',
    scripts: [
      {
        name: '阶梯式保证金方案',
        tag: '安全垫谈判',
        content: '理解评审委员会立场。10%确实超出我们承受能力。我想探讨阶梯方案：前3月7%，M3+控制在4%以内则恢复6%；超过4.5%接受8%。既满足风险管理要求，也给我们证明资产质量的机会。',
        tips: '不直接拒绝，先提阶梯方案测试底线。强调"双赢"和"给机会证明"。',
        data: '参考数据：行业平均保证金5-7%，我司历史M3+在3.5-4.8%波动',
        warning: '避免一次性承诺固定比例，保留调整空间'
      },
      {
        name: '替代方案+测算',
        tag: '安全垫谈判',
        content: '我们测算了，10%保证金锁定2000万，IRR从18%降到15%，接近盈亏平衡线。能否提替代方案：保证金6% + 500万风险准备金 + 第三方担保？实际缓冲达9%，浦发那边跑通了。',
        tips: '用数据说话，展示测算过程。提出组合方案，给对方选择权。',
        data: 'IRR测算：保证金每提升1%，IRR下降约1.5个百分点',
        warning: '不要虚报IRR数据，容易被财务部门验证'
      }
    ]
  },
  {
    id: 'risk',
    name: '风险质疑',
    icon: '⚠️',
    scripts: [
      {
        name: '主动坦诚+转危为机',
        tag: '股东变更应对',
        content: '感谢关注。这次股东调整是集团战略优化的一部分，新股东背景更强（某某集团，资产规模XX亿），管理团队稳定，业务未受影响。Q4放款环比增长12%，M3+从4.8%降到4.5%。我���愿意增加透明度，每周报送经营数据。',
        tips: '不回避问题，主动披露正面信息。用数据证明"业务未受影响"。',
        data: '准备：新股东背景资料、近3月业务数据、管理层稳定性证明',
        warning: '不要过度承诺"绝对不会有问题"，保持客观'
      },
      {
        name: '数据拆解+横向对比',
        tag: '资产质量讨论',
        content: 'M3+ 4.8%确实高于行业3.2%，我们也在改进。但需要拆解看：(1)历史遗留资产占1.2%，新资产M3+仅3.6%；(2)我们客群偏次优，对标同类机构（某某公司4.5%）处于合理区间；(3)近3月新增资产M3+降至3.2%，改善明显。',
        tips: '承认问题，但要拆解数据说明改善趋势。横向对比同类机构。',
        data: '准备：历史vs新增资产M3+对比、同业对标数据、改善趋势图',
        warning: '不要美化数据，容易被质疑。实事求是更有说服力'
      }
    ]
  },
  {
    id: 'compliance',
    name: '合规施压',
    icon: '📋',
    scripts: [
      {
        name: '合规底线+替代方案',
        tag: '兜底承诺',
        content: '理解合规压力。但兜底承诺触碰监管红线（《商业银行法》第XX条），我们无法承诺。能否考虑替代方案：(1)增加风险准备金；(2)引入第三方担保；(3)优先匹配优质客户？这些方案既满足风控要求，也符合监管规定。',
        tips: '明确拒绝违规要求，但提供合规替代方案。引用具体法规增强说服力。',
        data: '准备：相关监管文件、合规部门意见、替代方案测算',
        warning: '绝不接受违规要求，即使损失合作机会'
      },
      {
        name: '信息披露边界',
        tag: '数据要求',
        content: '理解贵行需要详细了解客户情况。但完整客户信息涉及个人隐私保护（《个人信息保护法》），我们只能提供脱敏后的统计数据：客群画像、风险分层、历史表现。如需个案审查，可以抽样方式进行。',
        tips: '在合规范围内最大化信息透明度。提供统计数���+抽样审查的折中方案。',
        data: '准备：脱敏统计数据、客群画像报告、抽样审查流程',
        warning: '不要为了合作泄露客户隐私，法律风险巨大'
      }
    ]
  },
  {
    id: 'volume',
    name: '业务量承诺',
    icon: '📈',
    scripts: [
      {
        name: '区间承诺+弹性机制',
        tag: '放款量谈判',
        content: '基于历史数据，我们预计月均放款800-1200万，Q1保守目标2500万。但需要弹性机制：如果审批通过率低于55%或审批时长超过3天，我们保留调整权。这样既有目标，也考虑实际操作中的不确定性。',
        tips: '给区间而非固定数字，预留调整空间。设置前提条件保护自己。',
        data: '准备：历史放款数据、审批通过率、审批时长统计',
        warning: '不要过度承诺，完不成会影响信誉'
      },
      {
        name: '阶段性目标',
        tag: '放款量谈判',
        content: '建议分阶段设定目标：Q1试跑期500���，验证流程和风控标准；Q2-Q4根据Q1表现调整，目标2000-3000万。这样双方都有观察期，降低风险。',
        tips: '先小后大，逐步建立信任。强调"试跑期"和"观察期"。',
        data: '准备：试跑期的流程设计、风控标准文档',
        warning: '试跑期表现很重要，务必全力以赴'
      }
    ]
  },
  {
    id: 'new',
    name: '新机构破冰',
    icon: '🤝',
    scripts: [
      {
        name: '成功案例背书',
        tag: '初次接触',
        content: '我们已与12家银行/资金方合作，包括某某银行、某某信托等。以某某银行为例，合作2年，累计放款1.5亿，M3+ 3.2%，零逾期超90天案件。可以提供推荐函和业务数据供贵行参考。',
        tips: '用成功案例建立信任。提供可验证的数据和推荐函。',
        data: '准备：合作机构列表、业务数据报告、推荐函（如有）',
        warning: '只提供真实案例，夸大容易被查证'
      },
      {
        name: '试点合作方案',
        tag: '初次接触',
        content: '理解贵行对新合作伙伴的谨慎。建议先做小额试点：单月200万，观察1-2个月。我们提供：(1)每周数据报送；(2)现场尽调配合；(3)风控流程透明化。用实际表现赢得信任。',
        tips: '降低对方决策门槛。强调透明度和可监控性。',
        data: '准备：试点方案详细设计、风控流程文档、数据报送模板',
        warning: '试点期间务必做到最好，这是建立长期合作的基础'
      }
    ]
  }
];

/**
 * Intelligence Gathering - 战前准备/对手画像
 * 对应CLI版本的"资方内参报告"功能
 */
function Intelligence() {
  const [activeTab, setActiveTab] = useState('funder'); // 'funder' 或 'playbook'
  const [funderName, setFunderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);

  // 生成内参报告
  const handleGenerateReport = async () => {
    if (!funderName.trim()) {
      alert('请输入资方名称');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/intelligence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funder_name: funderName })
      });

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('生成报告失败:', error);
      alert('生成报告失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="intelligence-page">
      {/* 页面标题 */}
      <div className="page-header">
        <h1 className="page-title">战前准备</h1>
        <p className="page-subtitle">资方基本信息、相关测算、谈判策略</p>
      </div>

      {/* Tab切换 */}
      <div className="intel-tabs">
        <button
          className={`intel-tab ${activeTab === 'funder' ? 'active' : ''}`}
          onClick={() => setActiveTab('funder')}
        >
          📊 资方内参
        </button>
        <button
          className={`intel-tab ${activeTab === 'playbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('playbook')}
        >
          💬 话术知识库
        </button>
      </div>

      {/* 资方内参Tab */}
      {activeTab === 'funder' && (
        <>
      {/* 搜索区域 */}
      <div className="search-section">
        <div className="search-label">
          🔍 对手画像分析 (Competitor Profiling)
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="输入银行/资金方名称 (如: 中关村银行)"
            value={funderName}
            onChange={(e) => setFunderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
          />
          <button
            className="generate-button"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? '生成中...' : '生成内参'}
          </button>
        </div>
      </div>

      {/* 报告展示区域 */}
      {report && (
        <div className="report-container">
          {/* 基本信息卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>📋 基本信息</h3>
              <span className="status-badge status-active">
                {report.cooperation_status || '正常合作'}
              </span>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="label">资方名称:</span>
                <span className="value">{report.fund_name}</span>
              </div>
              <div className="info-row">
                <span className="label">资方类型:</span>
                <span className="value">{report.fund_type}</span>
              </div>
              <div className="info-row">
                <span className="label">合作时长:</span>
                <span className="value">{report.cooperation_duration || '24个月'}</span>
              </div>
            </div>
          </div>

          {/* 业务数据卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>📈 业务数据</h3>
              <span className="data-source">数据源: Dataphin实时</span>
            </div>
            <div className="card-body">
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">在贷余额</div>
                  <div className="metric-value">
                    {report.outstanding_balance?.toLocaleString()} 万元
                  </div>
                  <div className="metric-trend trend-neutral">
                    占比 {report.balance_ratio || '15.2'}%
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">上月放款</div>
                  <div className="metric-value">
                    {report.last_month_loan?.toLocaleString()} 万元
                  </div>
                  <div className="metric-trend trend-up">
                    环比 +12%
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">本月排期</div>
                  <div className="metric-value">
                    {report.current_month_plan?.toLocaleString()} 万元
                  </div>
                  <div className="metric-trend trend-neutral">
                    完成 60%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 运营数据卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>📊 运营数据</h3>
            </div>
            <div className="card-body">
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">审批通过率</div>
                  <div className="metric-value">{report.approval_rate}%</div>
                  <div className="metric-trend trend-neutral">
                    行业均值 68%
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">M3+逾期率</div>
                  <div className="metric-value warning">
                    {report.m3_overdue_rate}%
                  </div>
                  <div className="metric-trend trend-down">
                    ⚠️ 高于行业 3.2%
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">平均审批时长</div>
                  <div className="metric-value">
                    {report.avg_approval_days} 天
                  </div>
                  <div className="metric-trend trend-neutral">
                    行业均值 2.5天
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 商务条件卡片 */}
          <div className="card">
            <div className="card-header">
              <h3>💰 商务条件</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="label">资金成本:</span>
                <span className="value">{report.funding_cost}%</span>
              </div>
              <div className="info-row">
                <span className="label">保证金比例:</span>
                <span className="value warning">
                  {report.deposit_rate}% → 要求提至 10% ⚠️
                </span>
              </div>
              <div className="info-row">
                <span className="label">合作模式:</span>
                <span className="value">{report.cooperation_mode}</span>
              </div>
            </div>
          </div>

          {/* 谈判建议卡片 */}
          <div className="card highlight">
            <div className="card-header">
              <h3>🎯 谈判建议</h3>
            </div>
            <div className="card-body">
              <div className="suggestion-item">
                <div className="suggestion-header">
                  <span className="badge badge-recommended">推荐</span>
                  <span className="suggestion-title">方案A: 阶梯式保证金</span>
                </div>
                <div className="suggestion-content">
                  前3月保证金提至7%，如M3+控制在4%以内则恢复6%；
                  超过4.5%接受提至8%。既满足风险管理，也给我们证明资产质量的机会。
                </div>
                <button className="button-outline">查看详情</button>
              </div>

              <div className="suggestion-item">
                <div className="suggestion-header">
                  <span className="suggestion-title">方案B: 替代方案</span>
                </div>
                <div className="suggestion-content">
                  保证金维持6% + 增设500万风险准备金 + 引入第三方担保(覆盖率20%)。
                  实际风险缓冲达9%，但资金压力较小。
                </div>
                <button className="button-outline">查看详情</button>
              </div>

              <div className="suggestion-item">
                <div className="suggestion-header">
                  <span className="suggestion-title">方案C: 折中方案</span>
                </div>
                <div className="suggestion-content">
                  保证金提至8% + 优先匹配优质客户 + 增加数据透明度(每周报送)。
                  可接受上限，配合资产质量改善。
                </div>
                <button className="button-outline">查看详情</button>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="action-buttons">
            <button className="button-primary">💾 导出报告</button>
            <button className="button-secondary">🔄 刷新数据</button>
            <button className="button-secondary">📤 分享给团队</button>
          </div>
        </div>
      )}

      {/* 空状态提示 */}
      {!report && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">输入资方名称开始分析</div>
          <div className="empty-description">
            系统将自动从Dataphin获取业务数据、运营数据和商务条件，
            并生成谈判建议和风险提示
          </div>
        </div>
      )}
        </>
      )}

      {/* 话术知识库Tab */}
      {activeTab === 'playbook' && (
        <div className="playbook-section">
          <div className="playbook-header">
            <h2 className="section-title">💬 话术知识库</h2>
            <p className="section-subtitle">按场景分类的标准话术与使用技巧</p>
          </div>

          {/* 场景分类 */}
          <div className="scene-categories">
            {playbookScenes.map((scene) => (
              <button
                key={scene.id}
                className={`scene-card ${selectedScene === scene.id ? 'active' : ''}`}
                onClick={() => setSelectedScene(scene.id)}
              >
                <div className="scene-icon">{scene.icon}</div>
                <div className="scene-name">{scene.name}</div>
                <div className="scene-count">{scene.scripts.length}条话术</div>
              </button>
            ))}
          </div>

          {/* 话术列表 */}
          {selectedScene && (
            <div className="scripts-list">
              {playbookScenes
                .find(s => s.id === selectedScene)
                ?.scripts.map((script, index) => (
                  <div key={index} className="script-card">
                    <div className="script-header">
                      <h3 className="script-title">{script.name}</h3>
                      <span className="script-tag">{script.tag}</span>
                    </div>

                    <div className="script-content">
                      <div className="content-label">💬 标准话术</div>
                      <p className="content-text">{script.content}</p>
                    </div>

                    <div className="script-tips">
                      <div className="content-label">💡 使用技巧</div>
                      <p className="content-text">{script.tips}</p>
                    </div>

                    {script.data && (
                      <div className="script-data">
                        <div className="content-label">📊 数据支撑</div>
                        <p className="content-text">{script.data}</p>
                      </div>
                    )}

                    {script.warning && (
                      <div className="script-warning">
                        <div className="content-label">⚠️ 风险提示</div>
                        <p className="content-text">{script.warning}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {!selectedScene && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">选择场景查看话术</div>
              <div className="empty-description">
                点击上方场景卡片，查看该场景下的标准话术和使用技巧
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Intelligence;
