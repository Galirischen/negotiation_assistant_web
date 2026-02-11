"""
认证API路由
"""

from fastapi import APIRouter, HTTPException, Depends
from models import LoginRequest, LoginResponse, User
from auth import create_access_token, get_current_user
from database import get_user_by_id


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    用户登录
    Demo版: 只验证工号是否存在,不验证密码
    """
    user = get_user_by_id(request.user_id)

    if not user:
        raise HTTPException(status_code=401, detail="工号不存在")

    # Demo版不验证密码
    # 生产环境需要验证密码哈希

    # 生成JWT token
    token = create_access_token(
        user_id=user.user_id,
        role=user.role.value,
        team_id=user.team_id,
        department_id=user.department_id
    )

    # 返回用户信息和token
    return LoginResponse(
        success=True,
        user=user,
        token=token,
        message="登录成功"
    )


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user
