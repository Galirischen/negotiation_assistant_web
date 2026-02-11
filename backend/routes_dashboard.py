"""
Dashboard API路由 - 团队和部门看板
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

from models import (
    User, Role, TeamDashboardData, DepartmentDashboardData,
    MemberPerformance, FunderCoverage, TeamComparisonItem, FunderHealthItem
)
from auth import get_current_user, check_resource_access
from database import (
    get_records, get_users_by_team, get_teams_by_department,
    get_team_by_id, get_user_by_id
)


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# ===========================
# 团队看板
# ===========================

@router.get("/team/{team_id}", response_model=TeamDashboardData)
async def get_team_dashboard(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    获取团队看板数据
    权限: team_leader(本组), director(本部门所有组)
    """
    # 权限检查
    if current_user.role == Role.EMPLOYEE:
        raise HTTPException(status_code=403, detail="普通员工无权查看团队看板")

    # 获取团队信息
    team = get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="团队不存在")

    # 组长只能查看自己的团队
    if current_user.role == Role.TEAM_LEADER and current_user.team_id != team_id:
        raise HTTPException(status_code=403, detail="只能查看自己的团队")

    # 部门负责人只能查看本部门的团队
    if current_user.role == Role.DIRECTOR and current_user.department_id != team.department_id:
        raise HTTPException(status_code=403, detail="只能查看本部门的团队")

    # 获取团队所有记录
    records = get_records({"team_id": team_id})

    # 计算日期范围(最近30天)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    recent_records = [r for r in records if r.created_at >= start_date]

    # 1. 顶部概览
    total_visits = len(recent_records)
    total_negotiations = len([r for r in recent_records if r.visit_type.value == "negotiation"])
    success_count = len([r for r in recent_records if r.outcome.value == "success"])
    success_rate = (success_count / len(recent_records) * 100) if recent_records else 0

    # 计算平均成本降低幅度
    cost_reductions = []
    for r in recent_records:
        if r.metrics and r.metrics.cost_before and r.metrics.cost_after:
            reduction = r.metrics.cost_before - r.metrics.cost_after
            if reduction > 0:
                cost_reductions.append(reduction)
    avg_cost_reduction = sum(cost_reductions) / len(cost_reductions) if cost_reductions else 0

    # 计算待办事项统计
    total_todos = sum(len(r.todos) for r in records)  # 使用全部记录
    completed_todos = sum(len([t for t in r.todos if t.status.value == "completed"]) for r in records)
    pending_todos = sum(len([t for t in r.todos if t.status.value == "pending"]) for r in records)

    overview = {
        "totalVisits": total_visits,
        "totalNegotiations": total_negotiations,
        "successRate": round(success_rate, 1),
        "avgCostReduction": round(avg_cost_reduction, 2),
        "totalRecords": len(records),  # 总谈判记录数
        "totalTodos": total_todos,  # 总待办事项数
        "completedTodos": completed_todos,  # 已完成待办
        "pendingTodos": pending_todos  # 待完成待办
    }

    # 2. 成员业绩分析
    member_stats = defaultdict(lambda: {
        "visit_count": 0,
        "negotiation_count": 0,
        "success_count": 0,
        "total_score": 0,
        "score_count": 0,
        "cost_optimization": 0.0,
        "pending_todos": 0
    })

    for record in recent_records:
        user_id = record.user_id
        stats = member_stats[user_id]

        stats["visit_count"] += 1
        if record.visit_type.value == "negotiation":
            stats["negotiation_count"] += 1
        if record.outcome.value == "success":
            stats["success_count"] += 1
        if record.score:
            stats["total_score"] += record.score
            stats["score_count"] += 1

        # 成本优化
        if record.metrics and record.metrics.cost_before and record.metrics.cost_after:
            reduction = record.metrics.cost_before - record.metrics.cost_after
            if reduction > 0:
                stats["cost_optimization"] += reduction

        # 待办事项
        stats["pending_todos"] += len([t for t in record.todos if t.status.value == "pending"])

    member_performance = []
    team_members = get_users_by_team(team_id)
    for member in team_members:
        stats = member_stats.get(member.user_id, {})
        visit_count = stats.get("visit_count", 0)
        success_count = stats.get("success_count", 0)
        score_count = stats.get("score_count", 0)

        member_performance.append(MemberPerformance(
            user_id=member.user_id,
            user_name=member.name,
            visit_count=visit_count,
            negotiation_count=stats.get("negotiation_count", 0),
            success_rate=round(success_count / visit_count * 100, 1) if visit_count > 0 else 0,
            avg_score=round(stats.get("total_score", 0) / score_count, 1) if score_count > 0 else 0,
            cost_optimization=round(stats.get("cost_optimization", 0), 2),
            pending_todos=stats.get("pending_todos", 0)
        ))

    # 3. 资方覆盖情况
    funder_stats = defaultdict(lambda: {
        "last_visit": None,
        "visit_count": 0,
        "key_owner": ""
    })

    for record in records:  # 使用全部记录
        funder = record.funder_name
        funder_stats[funder]["visit_count"] += 1
        if not funder_stats[funder]["last_visit"] or record.visit_date > funder_stats[funder]["last_visit"]:
            funder_stats[funder]["last_visit"] = record.visit_date
            funder_stats[funder]["key_owner"] = record.user_name

    funder_coverage = []
    for funder_name, stats in funder_stats.items():
        last_visit = stats["last_visit"]
        days_since_visit = (datetime.now() - last_visit).days if last_visit else 999

        # 判断关系状态
        if days_since_visit <= 14:
            relationship = "活跃"
        elif days_since_visit <= 60:
            relationship = "稳定"
        else:
            relationship = "冷淡"

        # 月均拜访次数(按全部记录计算)
        total_days = (datetime.now() - min([r.created_at for r in records])).days
        months = max(total_days / 30, 1)
        visit_frequency = round(stats["visit_count"] / months, 1)

        funder_coverage.append(FunderCoverage(
            funder_name=funder_name,
            last_visit_date=last_visit,
            visit_frequency=visit_frequency,
            relationship_status=relationship,
            key_owner=stats["key_owner"]
        ))

    # 4. 场景分布
    scene_distribution = defaultdict(int)
    for record in recent_records:
        scene_name = {
            "cost": "资金成本谈判",
            "deposit": "保证金条款谈判",
            "risk": "风险质疑",
            "compliance": "合规施压",
            "volume": "业务量承诺",
            "icebreaking": "新机构破冰"
        }.get(record.scene.value, "其他")
        scene_distribution[scene_name] += 1

    # 5. 月度趋势(最近6个月)
    monthly_trend = []
    for i in range(5, -1, -1):
        month_start = end_date - timedelta(days=30 * (i + 1))
        month_end = end_date - timedelta(days=30 * i)
        month_records = [r for r in records if month_start <= r.created_at < month_end]

        month_success = len([r for r in month_records if r.outcome.value == "success"])
        month_success_rate = (month_success / len(month_records) * 100) if month_records else 0

        month_cost_reductions = []
        for r in month_records:
            if r.metrics and r.metrics.cost_before and r.metrics.cost_after:
                reduction = r.metrics.cost_before - r.metrics.cost_after
                if reduction > 0:
                    month_cost_reductions.append(reduction)
        month_avg_reduction = sum(month_cost_reductions) / len(month_cost_reductions) if month_cost_reductions else 0

        monthly_trend.append({
            "month": month_start.strftime("%Y-%m"),
            "visitCount": len(month_records),
            "successRate": round(month_success_rate, 1),
            "avgCostReduction": round(month_avg_reduction, 2)
        })

    return TeamDashboardData(
        overview=overview,
        member_performance=member_performance,
        funder_coverage=funder_coverage,
        scene_distribution=dict(scene_distribution),
        monthly_trend=monthly_trend
    )


# ===========================
# 部门看板
# ===========================

@router.get("/department/{department_id}", response_model=DepartmentDashboardData)
async def get_department_dashboard(
    department_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    获取部门看板数据
    权限: 仅director
    """
    # 权限检查
    if current_user.role != Role.DIRECTOR:
        raise HTTPException(status_code=403, detail="需要部门负责人权限")

    if current_user.department_id != department_id:
        raise HTTPException(status_code=403, detail="只能查看自己的部门")

    # 获取部门所有记录
    records = get_records({"department_id": department_id})

    # 最近30天记录
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    recent_records = [r for r in records if r.created_at >= start_date]

    # 1. 部门整体概览
    success_count = len([r for r in recent_records if r.outcome.value == "success"])
    total_cost_saved = 0
    for r in records:
        if r.metrics and r.metrics.cost_before and r.metrics.cost_after:
            reduction = r.metrics.cost_before - r.metrics.cost_after
            if reduction > 0 and r.metrics.volume_commitment:
                # 简化计算: 成本降低 * 业务量
                total_cost_saved += reduction * r.metrics.volume_commitment / 100

    # 找出top performer
    user_success_count = defaultdict(int)
    for r in recent_records:
        if r.outcome.value == "success":
            user_success_count[r.user_name] += 1
    top_performer = max(user_success_count.items(), key=lambda x: x[1])[0] if user_success_count else "N/A"

    # 活跃资方数
    active_funders = set([r.funder_name for r in recent_records])

    department_overview = {
        "totalVisits": len(recent_records),
        "totalMembers": len([u for u in database.USERS_DB.values() if u.department_id == department_id]),
        "topPerformer": top_performer,
        "totalCostSaved": round(total_cost_saved, 2),
        "activeFunders": len(active_funders)
    }

    # 2. 团队对比分析
    teams = get_teams_by_department(department_id)
    team_comparison = []

    for team in teams:
        team_records = [r for r in recent_records if r.team_id == team.team_id]
        team_members = get_users_by_team(team.team_id)
        member_count = len(team_members)

        success_count = len([r for r in team_records if r.outcome.value == "success"])
        success_rate = (success_count / len(team_records) * 100) if team_records else 0

        # 人均拜访次数
        efficiency = len(team_records) / member_count if member_count > 0 else 0

        # 成本优化
        team_cost_opt = 0
        for r in team_records:
            if r.metrics and r.metrics.cost_before and r.metrics.cost_after:
                reduction = r.metrics.cost_before - r.metrics.cost_after
                if reduction > 0:
                    team_cost_opt += reduction

        # 获取组长名字
        leader = get_user_by_id(team.leader_id)
        leader_name = leader.name if leader else "N/A"

        team_comparison.append(TeamComparisonItem(
            team_id=team.team_id,
            team_name=team.team_name,
            leader_name=leader_name,
            member_count=member_count,
            visit_count=len(team_records),
            success_rate=round(success_rate, 1),
            efficiency=round(efficiency, 1),
            cost_optimization=round(team_cost_opt, 2)
        ))

    # 3. 资方健康度评估
    funder_stats = defaultdict(lambda: {
        "last_visit": None,
        "visit_count": 0,
        "total_volume": 0
    })

    for record in records:
        funder = record.funder_name
        funder_stats[funder]["visit_count"] += 1
        if not funder_stats[funder]["last_visit"] or record.visit_date > funder_stats[funder]["last_visit"]:
            funder_stats[funder]["last_visit"] = record.visit_date

        if record.metrics and record.metrics.volume_commitment:
            funder_stats[funder]["total_volume"] += record.metrics.volume_commitment

    funder_health = []
    for funder_name, stats in list(funder_stats.items())[:10]:  # Top 10
        last_visit = stats["last_visit"]
        days_since = (datetime.now() - last_visit).days if last_visit else 999

        # 拜访频率
        total_days = (datetime.now() - min([r.created_at for r in records])).days
        months = max(total_days / 30, 1)
        visit_freq = round(stats["visit_count"] / months, 1)

        # 风险等级(简化判断)
        if days_since > 90:
            risk_level = "高"
        elif days_since > 30:
            risk_level = "中"
        else:
            risk_level = "低"

        # 战略优先级(基于业务量)
        if stats["total_volume"] > 10000:
            priority = "核心"
        elif stats["total_volume"] > 5000:
            priority = "重要"
        else:
            priority = "普通"

        funder_health.append(FunderHealthItem(
            funder_name=funder_name,
            business_volume=stats["total_volume"],
            last_visit_date=last_visit,
            visit_frequency=visit_freq,
            cost_trend="稳定",  # 简化处理
            risk_level=risk_level,
            strategic_priority=priority
        ))

    # 4. 能力诊断
    scene_success = defaultdict(lambda: {"total": 0, "success": 0})
    for record in recent_records:
        scene_name = {
            "cost": "资金成本谈判",
            "deposit": "保证金条款谈判",
            "risk": "风险质疑",
            "compliance": "合规施压",
            "volume": "业务量承诺",
            "icebreaking": "新机构破冰"
        }.get(record.scene.value, "其他")

        scene_success[scene_name]["total"] += 1
        if record.outcome.value == "success":
            scene_success[scene_name]["success"] += 1

    # 计算成功率
    scene_rates = {
        scene: stats["success"] / stats["total"] * 100 if stats["total"] > 0 else 0
        for scene, stats in scene_success.items()
    }

    top_scenes = sorted(scene_rates.items(), key=lambda x: x[1], reverse=True)[:3]
    weak_scenes = sorted(scene_rates.items(), key=lambda x: x[1])[:3]

    skill_analysis = {
        "topScenes": [s[0] for s in top_scenes],
        "weakScenes": [s[0] for s in weak_scenes],
        "trainingNeeds": [f"{s[0]}场景加强" for s in weak_scenes if s[1] < 50],
        "bestPractices": []
    }

    # 5. ROI分析
    total_time = len(records) * 2  # 假设每次拜访2小时

    roi_analysis = {
        "totalTimeInvested": total_time,
        "totalCostSaved": round(total_cost_saved, 2),
        "avgROI": round(total_cost_saved / total_time, 2) if total_time > 0 else 0,
        "highValueDeals": []
    }

    return DepartmentDashboardData(
        department_overview=department_overview,
        team_comparison=team_comparison,
        funder_health=funder_health,
        skill_analysis=skill_analysis,
        roi_analysis=roi_analysis
    )


# 导入database模块用于访问USERS_DB
import database
