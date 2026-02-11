"""
模拟数据库 - 用于Demo演示
生产环境需要替换为真实数据库(MongoDB/PostgreSQL等)
"""

from models import User, Team, NegotiationRecord, Role, VisitType, NegotiationScene, NegotiationOutcome, TodoItem, TodoStatus, NegotiationMetrics, Participant
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import uuid


# ===========================
# 内存数据存储
# ===========================

# 用户数据
USERS_DB: Dict[str, User] = {}

# 团队数据
TEAMS_DB: Dict[str, Team] = {}

# 谈判记录
RECORDS_DB: Dict[str, NegotiationRecord] = {}


# ===========================
# 初始化Demo数据
# ===========================

def init_demo_data():
    """初始化Demo数据"""

    # 1. 创建团队
    team1 = Team(
        team_id="team_001",
        team_name="资金商务一组",
        leader_id="U003",
        department_id="dept_001",
        members=["U003", "U004", "U005"]
    )

    team2 = Team(
        team_id="team_002",
        team_name="资金商务二组",
        leader_id="U006",
        department_id="dept_001",
        members=["U006", "U007", "U008"]
    )

    TEAMS_DB["team_001"] = team1
    TEAMS_DB["team_002"] = team2

    # 2. 创建用户
    users = [
        User(
            user_id="U001",
            name="刘总",
            role=Role.DIRECTOR,
            team_id="dept_001",
            department_id="dept_001",
            manager_id=None
        ),
        User(
            user_id="U002",
            name="王部长",
            role=Role.DIRECTOR,
            team_id="dept_001",
            department_id="dept_001",
            manager_id="U001"
        ),
        User(
            user_id="U003",
            name="张组长",
            role=Role.TEAM_LEADER,
            team_id="team_001",
            department_id="dept_001",
            manager_id="U002"
        ),
        User(
            user_id="U004",
            name="李商务",
            role=Role.EMPLOYEE,
            team_id="team_001",
            department_id="dept_001",
            manager_id="U003"
        ),
        User(
            user_id="U005",
            name="赵商务",
            role=Role.EMPLOYEE,
            team_id="team_001",
            department_id="dept_001",
            manager_id="U003"
        ),
        User(
            user_id="U006",
            name="陈组长",
            role=Role.TEAM_LEADER,
            team_id="team_002",
            department_id="dept_001",
            manager_id="U002"
        ),
        User(
            user_id="U007",
            name="孙商务",
            role=Role.EMPLOYEE,
            team_id="team_002",
            department_id="dept_001",
            manager_id="U006"
        ),
        User(
            user_id="U008",
            name="周商务",
            role=Role.EMPLOYEE,
            team_id="team_002",
            department_id="dept_001",
            manager_id="U006"
        )
    ]

    for user in users:
        USERS_DB[user.user_id] = user

    # 3. 创建谈判记录
    base_date = datetime.now()

    records = [
        # 李商务的记录(资金商务一组)
        NegotiationRecord(
            record_id=str(uuid.uuid4()),
            user_id="U004",
            user_name="李商务",
            team_id="team_001",
            department_id="dept_001",
            funder_name="中关村银行",
            visit_type=VisitType.NEGOTIATION,
            visit_date=base_date - timedelta(days=2),
            scene=NegotiationScene.DEPOSIT,
            objective="争取降低保证金比例从10%降至6%",
            key_points=["保证金比例过高", "资金使用效率", "历史表现良好"],
            our_position="保证金6%,阶梯式方案",
            their_position="坚持10%,风险评审委员会要求",
            result="初步同意7%作为起点,3个月后根据表现调整",
            metrics=NegotiationMetrics(
                cost_before=7.2,
                cost_after=7.2,
                deposit_before=10.0,
                deposit_after=7.0,
                volume_commitment=5000.0
            ),
            outcome=NegotiationOutcome.SUCCESS,
            score=4,
            todos=[
                TodoItem(content="准备3个月资产表现报告", status=TodoStatus.PENDING),
                TodoItem(content="发送合作协议修订版", status=TodoStatus.COMPLETED, completed_at=datetime.now())
            ],
            minutes="会议达成初步共识,同意从7%保证金开始...",
            scripts_used=["script_001", "script_002"],
            scripts_effective=["script_001"],
            participants=[
                Participant(name="李商务", role="商务", company="我方", is_our_side=True),
                Participant(name="张组长", role="组长", company="我方", is_our_side=True),
                Participant(name="王行长", role="分管副行长", company="中关村银行", is_our_side=False),
                Participant(name="刘经理", role="风控部经理", company="中关村银行", is_our_side=False)
            ],
            created_at=base_date - timedelta(days=2)
        ),
        # 李商务第二条记录
        NegotiationRecord(
            record_id=str(uuid.uuid4()),
            user_id="U004",
            user_name="李商务",
            team_id="team_001",
            department_id="dept_001",
            funder_name="浦发银行",
            visit_type=VisitType.VISIT,
            visit_date=base_date - timedelta(days=7),
            scene=NegotiationScene.COST,
            objective="了解资金成本调整空间",
            key_points=["当前成本7.5%偏高", "同业对标", "长期合作"],
            our_position="希望降至7.0%",
            their_position="需要看业务量和资产质量",
            result="对方表示需要评估,一周内回复",
            outcome=NegotiationOutcome.IN_PROGRESS,
            score=3,
            todos=[
                TodoItem(content="整理近6个月资产质量数据", status=TodoStatus.PENDING)
            ],
            created_at=base_date - timedelta(days=7)
        ),

        # 赵商务的记录(资金商务一组)
        NegotiationRecord(
            record_id=str(uuid.uuid4()),
            user_id="U005",
            user_name="赵商务",
            team_id="team_001",
            department_id="dept_001",
            funder_name="招商银行",
            visit_type=VisitType.PHONE,
            visit_date=base_date - timedelta(days=1),
            scene=NegotiationScene.RISK,
            objective="回应对方关于M3+逾期率的质疑",
            key_points=["M3+数据4.8%", "拆解历史遗留", "改善措施"],
            our_position="近6个月新增资产M3+已降至3.9%",
            their_position="担心整体风险水平",
            result="提供详细数据拆解报告后,对方表示理解",
            outcome=NegotiationOutcome.SUCCESS,
            score=5,
            todos=[
                TodoItem(content="发送风险数据分析报告", status=TodoStatus.COMPLETED, completed_at=datetime.now())
            ],
            created_at=base_date - timedelta(days=1)
        ),

        # 孙商务的记录(资金商务二组)
        NegotiationRecord(
            record_id=str(uuid.uuid4()),
            user_id="U007",
            user_name="孙商务",
            team_id="team_002",
            department_id="dept_001",
            funder_name="XX信托",
            visit_type=VisitType.NEGOTIATION,
            visit_date=base_date - timedelta(days=3),
            scene=NegotiationScene.ICEBREAKING,
            objective="建立合作关系,介绍平台优势",
            key_points=["平台背景", "业务模式", "风控体系"],
            our_position="寻求长期稳定合作",
            their_position="初步了解,需要进一步尽调",
            result="对方同意下周安排尽调",
            outcome=NegotiationOutcome.IN_PROGRESS,
            score=4,
            todos=[
                TodoItem(content="准备尽调材料", status=TodoStatus.PENDING),
                TodoItem(content="安排技术对接会议", status=TodoStatus.PENDING)
            ],
            created_at=base_date - timedelta(days=3)
        )
    ]

    for record in records:
        RECORDS_DB[record.record_id] = record


# ===========================
# 数据库操作函数
# ===========================

def get_user_by_id(user_id: str) -> Optional[User]:
    """根据工号获取用户"""
    return USERS_DB.get(user_id)


def get_team_by_id(team_id: str) -> Optional[Team]:
    """根据团队ID获取团队"""
    return TEAMS_DB.get(team_id)


def get_records(filter_dict: dict = None) -> List[NegotiationRecord]:
    """
    获取谈判记录列表

    Args:
        filter_dict: 过滤条件,如 {"user_id": "U003"}

    Returns:
        符合条件的记录列表
    """
    if filter_dict is None:
        return list(RECORDS_DB.values())

    results = []
    for record in RECORDS_DB.values():
        match = True
        for key, value in filter_dict.items():
            if not hasattr(record, key) or getattr(record, key) != value:
                match = False
                break
        if match:
            results.append(record)

    return results


def get_record_by_id(record_id: str) -> Optional[NegotiationRecord]:
    """根据记录ID获取记录"""
    return RECORDS_DB.get(record_id)


def create_record(record: NegotiationRecord) -> NegotiationRecord:
    """创建新记录"""
    RECORDS_DB[record.record_id] = record
    return record


def update_record(record_id: str, updates: dict) -> Optional[NegotiationRecord]:
    """更新记录"""
    record = RECORDS_DB.get(record_id)
    if not record:
        return None

    for key, value in updates.items():
        if hasattr(record, key) and value is not None:
            setattr(record, key, value)

    record.updated_at = datetime.now()
    return record


def get_users_by_team(team_id: str) -> List[User]:
    """获取团队成员列表"""
    return [user for user in USERS_DB.values() if user.team_id == team_id]


def get_teams_by_department(department_id: str) -> List[Team]:
    """获取部门下的所有团队"""
    return [team for team in TEAMS_DB.values() if team.department_id == department_id]


# 初始化Demo数据
init_demo_data()
