"""
数据模型定义
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ===========================
# 枚举类型
# ===========================

class Role(str, Enum):
    """用户角色"""
    EMPLOYEE = "employee"           # 普通商务
    TEAM_LEADER = "team_leader"     # 组长
    DIRECTOR = "director"           # 部门负责人


class VisitType(str, Enum):
    """拜访类型"""
    VISIT = "visit"                 # 现场拜访
    PHONE = "phone"                 # 电话沟通
    NEGOTIATION = "negotiation"     # 正式谈判


class NegotiationScene(str, Enum):
    """谈判场景"""
    COST = "cost"                           # 资金成本谈判
    DEPOSIT = "deposit"                     # 保证金条款谈判
    RISK = "risk"                           # 风险质疑
    COMPLIANCE = "compliance"               # 合规施压
    VOLUME = "volume"                       # 业务量承诺
    ICEBREAKING = "icebreaking"             # 新机构破冰


class NegotiationOutcome(str, Enum):
    """谈判结果"""
    SUCCESS = "success"             # 成功
    IN_PROGRESS = "in_progress"     # 进行中
    FAILED = "failed"               # 失败


class TodoStatus(str, Enum):
    """待办状态"""
    PENDING = "pending"
    COMPLETED = "completed"


# ===========================
# 用户相关模型
# ===========================

class User(BaseModel):
    """用户模型"""
    user_id: str = Field(..., description="工号")
    name: str = Field(..., description="姓名")
    role: Role = Field(..., description="角色")
    team_id: str = Field(..., description="所属团队ID")
    department_id: str = Field(..., description="所属部门ID")
    manager_id: Optional[str] = Field(None, description="直属上级ID")
    created_at: datetime = Field(default_factory=datetime.now)


class Team(BaseModel):
    """团队模型"""
    team_id: str = Field(..., description="团队ID")
    team_name: str = Field(..., description="团队名称")
    leader_id: str = Field(..., description="组长ID")
    department_id: str = Field(..., description="所属部门ID")
    members: List[str] = Field(default_factory=list, description="成员ID列表")


# ===========================
# 谈判记录相关模型
# ===========================

class TodoItem(BaseModel):
    """待办事项"""
    content: str = Field(..., description="待办内容")
    status: TodoStatus = Field(default=TodoStatus.PENDING)
    deadline: Optional[datetime] = Field(None, description="截止日期")
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(None, description="完成时间")


class NegotiationMetrics(BaseModel):
    """谈判商务指标"""
    cost_before: Optional[float] = Field(None, description="谈判前成本(%)")
    cost_after: Optional[float] = Field(None, description="谈判后成本(%)")
    deposit_before: Optional[float] = Field(None, description="谈判前保证金比例(%)")
    deposit_after: Optional[float] = Field(None, description="谈判后保证金比例(%)")
    volume_commitment: Optional[float] = Field(None, description="业务量承诺(万元)")


class Participant(BaseModel):
    """参会人员"""
    name: str = Field(..., description="姓名")
    role: str = Field(..., description="角色/职位")
    company: str = Field(..., description="所属公司(资方/我方)")
    is_our_side: bool = Field(..., description="是否是我方人员")


class NegotiationRecord(BaseModel):
    """谈判记录模型"""
    record_id: str = Field(..., description="记录ID")
    user_id: str = Field(..., description="创建人工号")
    user_name: str = Field(..., description="创建人姓名")
    team_id: str = Field(..., description="所属团队ID")
    department_id: str = Field(..., description="所属部门ID")

    # 基本信息
    funder_name: str = Field(..., description="资方名称")
    visit_type: VisitType = Field(..., description="拜访类型")
    visit_date: datetime = Field(..., description="拜访日期")
    scene: NegotiationScene = Field(..., description="谈判场景")

    # 谈判内容
    objective: str = Field(..., description="此次目标")
    key_points: List[str] = Field(default_factory=list, description="关键讨论点")
    our_position: str = Field(default="", description="我方立场")
    their_position: str = Field(default="", description="对方立场")
    result: str = Field(default="", description="谈判结果")

    # 商务指标
    metrics: Optional[NegotiationMetrics] = Field(None, description="商务指标")

    # 结果评估
    outcome: NegotiationOutcome = Field(default=NegotiationOutcome.IN_PROGRESS)
    score: Optional[int] = Field(None, ge=1, le=5, description="自评分(1-5)")

    # 待办事项
    todos: List[TodoItem] = Field(default_factory=list)

    # 会议纪要
    minutes: str = Field(default="", description="会议纪要")

    # 话术沉淀
    scripts_used: List[str] = Field(default_factory=list, description="使用的话术ID")
    scripts_effective: List[str] = Field(default_factory=list, description="有效的话术ID")

    # 参会人员
    participants: List[Participant] = Field(default_factory=list, description="参会人员列表")

    # 时间戳
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ===========================
# API请求/响应模型
# ===========================

class LoginRequest(BaseModel):
    """登录请求"""
    user_id: str = Field(..., description="工号")
    password: Optional[str] = Field(None, description="密码(Demo版可选)")


class LoginResponse(BaseModel):
    """登录响应"""
    success: bool
    user: Optional[User] = None
    token: Optional[str] = None
    message: Optional[str] = None


class CreateRecordRequest(BaseModel):
    """创建谈判记录请求"""
    funder_name: str
    visit_type: VisitType
    visit_date: datetime
    scene: NegotiationScene
    objective: str
    key_points: List[str] = []
    our_position: str = ""
    their_position: str = ""


class UpdateRecordRequest(BaseModel):
    """更新谈判记录请求"""
    result: Optional[str] = None
    outcome: Optional[NegotiationOutcome] = None
    score: Optional[int] = None
    minutes: Optional[str] = None
    metrics: Optional[NegotiationMetrics] = None


# ===========================
# 看板数据模型
# ===========================

class MemberPerformance(BaseModel):
    """成员业绩"""
    user_id: str
    user_name: str
    visit_count: int = 0
    negotiation_count: int = 0
    success_rate: float = 0.0
    avg_score: float = 0.0
    cost_optimization: float = 0.0
    pending_todos: int = 0


class FunderCoverage(BaseModel):
    """资方覆盖情况"""
    funder_name: str
    last_visit_date: Optional[datetime]
    visit_frequency: float = 0.0
    relationship_status: str = "稳定"
    key_owner: str = ""


class TeamDashboardData(BaseModel):
    """团队看板数据"""
    overview: Dict[str, Any]
    member_performance: List[MemberPerformance]
    funder_coverage: List[FunderCoverage]
    scene_distribution: Dict[str, int]
    monthly_trend: List[Dict[str, Any]]


class TeamComparisonItem(BaseModel):
    """团队对比项"""
    team_id: str
    team_name: str
    leader_name: str
    member_count: int
    visit_count: int
    success_rate: float
    efficiency: float
    cost_optimization: float


class FunderHealthItem(BaseModel):
    """资方健康度"""
    funder_name: str
    business_volume: float
    last_visit_date: Optional[datetime]
    visit_frequency: float
    cost_trend: str
    risk_level: str
    strategic_priority: str


class DepartmentDashboardData(BaseModel):
    """部门看板数据"""
    department_overview: Dict[str, Any]
    team_comparison: List[TeamComparisonItem]
    funder_health: List[FunderHealthItem]
    skill_analysis: Dict[str, Any]
    roi_analysis: Dict[str, Any]
