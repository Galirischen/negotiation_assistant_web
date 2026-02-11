"""
认证和权限管理模块
"""

from fastapi import HTTPException, Depends, Header
from typing import Optional, List
from models import User, Role
import jwt
from datetime import datetime, timedelta


# JWT配置
SECRET_KEY = "your-secret-key-here-change-in-production"  # 生产环境需要更换
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8小时


# ===========================
# 权限矩阵
# ===========================

PERMISSIONS = {
    Role.EMPLOYEE: {
        "view_own_records": True,
        "create_record": True,
        "edit_own_record": True,
        "view_team_stats": False,
        "view_all_records": False
    },
    Role.TEAM_LEADER: {
        "view_own_records": True,
        "create_record": True,
        "edit_own_record": True,
        "view_team_records": True,
        "view_team_stats": True,
        "export_team_report": True,
        "view_other_teams": False
    },
    Role.DIRECTOR: {
        "view_own_records": True,
        "create_record": True,
        "edit_own_record": True,
        "view_all_records": True,
        "view_department_stats": True,
        "export_all_reports": True,
        "manage_users": True,
        "view_cross_analysis": True
    }
}


# ===========================
# JWT Token相关
# ===========================

def create_access_token(user_id: str, role: str, team_id: str, department_id: str) -> str:
    """创建访问令牌"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "user_id": user_id,
        "role": role,
        "team_id": team_id,
        "department_id": department_id,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """解码访问令牌"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token已过期")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="无效的Token")


# ===========================
# 依赖注入函数
# ===========================

async def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """
    获取当前登录用户
    从请求头中提取Token并验证
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证信息")

    try:
        # 提取Bearer token
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="无效的认证方案")

        # 解码token
        payload = decode_access_token(token)

        # 构建用户对象
        user = User(
            user_id=payload["user_id"],
            name=payload.get("name", ""),  # 从数据库获取完整信息
            role=Role(payload["role"]),
            team_id=payload["team_id"],
            department_id=payload["department_id"],
            manager_id=payload.get("manager_id")
        )

        return user

    except ValueError:
        raise HTTPException(status_code=401, detail="无效的Token格式")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"认证失败: {str(e)}")


# ===========================
# 权限检查函数
# ===========================

def check_permission(user: User, required_permissions: List[str]) -> bool:
    """
    检查用户是否具有所需权限

    Args:
        user: 用户对象
        required_permissions: 需要的权限列表

    Returns:
        bool: 是否具有权限
    """
    user_permissions = PERMISSIONS.get(user.role, {})

    for perm in required_permissions:
        if not user_permissions.get(perm, False):
            return False

    return True


def require_role(allowed_roles: List[Role]):
    """
    装饰器: 要求特定角色才能访问

    Usage:
        @app.get("/api/dashboard/team")
        @require_role([Role.TEAM_LEADER, Role.DIRECTOR])
        async def get_team_dashboard(current_user: User = Depends(get_current_user)):
            ...
    """
    def decorator(func):
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=403,
                    detail=f"需要以下角色之一: {[r.value for r in allowed_roles]}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


def check_resource_access(user: User, resource_user_id: str = None,
                         resource_team_id: str = None) -> bool:
    """
    检查用户是否可以访问指定资源

    Args:
        user: 当前用户
        resource_user_id: 资源所属用户ID
        resource_team_id: 资源所属团队ID

    Returns:
        bool: 是否有权限访问
    """
    # 部门负责人可以访问所有资源
    if user.role == Role.DIRECTOR:
        return True

    # 组长可以访问本组资源
    if user.role == Role.TEAM_LEADER:
        if resource_team_id and resource_team_id == user.team_id:
            return True
        return False

    # 普通员工只能访问自己的资源
    if user.role == Role.EMPLOYEE:
        if resource_user_id and resource_user_id == user.user_id:
            return True
        return False

    return False


# ===========================
# 数据过滤函数
# ===========================

def build_query_filter(user: User, **kwargs) -> dict:
    """
    根据用户权限构建数据查询过滤条件

    Args:
        user: 当前用户
        **kwargs: 额外的过滤条件

    Returns:
        dict: MongoDB查询过滤条件
    """
    filter_dict = {}

    # 根据角色添加过滤条件
    if user.role == Role.EMPLOYEE:
        # 普通员工只能看自己的数据
        filter_dict["user_id"] = user.user_id
    elif user.role == Role.TEAM_LEADER:
        # 组长可以看本组数据
        filter_dict["team_id"] = user.team_id
    elif user.role == Role.DIRECTOR:
        # 负责人可以看全部门数据
        filter_dict["department_id"] = user.department_id

    # 合并额外的过滤条件
    filter_dict.update(kwargs)

    return filter_dict
