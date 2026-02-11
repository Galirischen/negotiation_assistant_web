"""
记录管理API路由
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from models import (
    User, NegotiationRecord, CreateRecordRequest, UpdateRecordRequest,
    TodoItem, TodoStatus
)
from auth import get_current_user, check_resource_access, build_query_filter
from database import get_records, get_record_by_id, create_record, update_record


router = APIRouter(prefix="/api/records", tags=["records"])


@router.get("/", response_model=List[NegotiationRecord])
async def list_records(
    current_user: User = Depends(get_current_user),
    user_id: str = None,
    team_id: str = None,
    funder_name: str = None
):
    """
    获取谈判记录列表
    根据用户权限自动过滤数据
    """
    # 构建基础查询过滤器
    filter_dict = build_query_filter(current_user)

    # 添加额外过滤条件
    if user_id:
        filter_dict["user_id"] = user_id
    if team_id:
        filter_dict["team_id"] = team_id
    if funder_name:
        filter_dict["funder_name"] = funder_name

    records = get_records(filter_dict)

    # 按创建时间倒序排序
    records.sort(key=lambda x: x.created_at, reverse=True)

    return records


@router.get("/{record_id}", response_model=NegotiationRecord)
async def get_record_detail(
    record_id: str,
    current_user: User = Depends(get_current_user)
):
    """获取单条记录详情"""
    record = get_record_by_id(record_id)

    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 权限检查
    if not check_resource_access(
        current_user,
        resource_user_id=record.user_id,
        resource_team_id=record.team_id
    ):
        raise HTTPException(status_code=403, detail="无权访问此记录")

    return record


@router.post("/", response_model=NegotiationRecord)
async def create_new_record(
    request: CreateRecordRequest,
    current_user: User = Depends(get_current_user)
):
    """创建新的谈判记录"""

    # 创建记录
    new_record = NegotiationRecord(
        record_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        user_name=current_user.name,
        team_id=current_user.team_id,
        department_id=current_user.department_id,
        funder_name=request.funder_name,
        visit_type=request.visit_type,
        visit_date=request.visit_date,
        scene=request.scene,
        objective=request.objective,
        key_points=request.key_points,
        our_position=request.our_position,
        their_position=request.their_position,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

    created = create_record(new_record)
    return created


@router.put("/{record_id}", response_model=NegotiationRecord)
async def update_existing_record(
    record_id: str,
    request: UpdateRecordRequest,
    current_user: User = Depends(get_current_user)
):
    """更新谈判记录"""

    record = get_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 权限检查 - 只有创建人可以编辑
    if record.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="只能编辑自己创建的记录")

    # 构建更新字典
    updates = {}
    if request.result is not None:
        updates["result"] = request.result
    if request.outcome is not None:
        updates["outcome"] = request.outcome
    if request.score is not None:
        updates["score"] = request.score
    if request.minutes is not None:
        updates["minutes"] = request.minutes
    if request.metrics is not None:
        updates["metrics"] = request.metrics

    updated = update_record(record_id, updates)
    return updated


@router.post("/{record_id}/todos", response_model=NegotiationRecord)
async def add_todo_to_record(
    record_id: str,
    todo_content: str,
    deadline: datetime = None,
    current_user: User = Depends(get_current_user)
):
    """为记录添加待办事项"""

    record = get_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 权限检查
    if record.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="只能为自己的记录添加待办")

    # 创建新待办
    new_todo = TodoItem(
        content=todo_content,
        status=TodoStatus.PENDING,
        deadline=deadline,
        created_at=datetime.now()
    )

    record.todos.append(new_todo)
    record.updated_at = datetime.now()

    return record


@router.put("/{record_id}/todos/{todo_index}/complete")
async def complete_todo(
    record_id: str,
    todo_index: int,
    current_user: User = Depends(get_current_user)
):
    """完成待办事项"""

    record = get_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")

    # 权限检查
    if record.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="只能完成自己的待办")

    if todo_index < 0 or todo_index >= len(record.todos):
        raise HTTPException(status_code=400, detail="待办索引无效")

    record.todos[todo_index].status = TodoStatus.COMPLETED
    record.todos[todo_index].completed_at = datetime.now()
    record.updated_at = datetime.now()

    return {"success": True, "message": "待办已完成"}
