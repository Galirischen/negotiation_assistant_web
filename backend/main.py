"""
NegotiaPro AI - Backend API
FastAPI后端服务
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
import os

# 添加CLI版本路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..', 'negotiation_assistant'))

# 导入路由
from routes_auth import router as auth_router
from routes_records import router as records_router
from routes_dashboard import router as dashboard_router

app = FastAPI(title="NegotiaPro AI API", version="1.0.0")

# 注册路由
app.include_router(auth_router)
app.include_router(records_router)
app.include_router(dashboard_router)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# 数据模型
# ===========================

class IntelligenceRequest(BaseModel):
    """对手画像请求"""
    funder_name: str

class PlaybookRequest(BaseModel):
    """话术查询请求"""
    user_input: str
    scene: Optional[str] = None

# ===========================
# 路由 - Intelligence (对手画像)
# ===========================

@app.post("/api/intelligence/generate")
async def generate_intelligence(request: IntelligenceRequest):
    """
    生成资方内参报告
    对应CLI版本的 funder_intel_v2_integrated.py
    """
    try:
        # 这里可以接入真实的Dataphin查询
        # 现在返回模拟数据作为Demo

        funder_name = request.funder_name

        # 模拟数据（可以根据资方名称返回不同数据）
        report = {
            "fund_name": funder_name,
            "fund_type": "银行" if "银行" in funder_name else "资金方",
            "cooperation_status": "正常合作",
            "cooperation_duration": "24个月",

            # 业务数据
            "outstanding_balance": 8750,   # 在贷余额(万元)
            "last_month_loan": 1200,       # 上月放款
            "current_month_plan": 800,     # 本月排期
            "balance_ratio": 15.2,         # 占比

            # 运营数据
            "approval_rate": 62.3,         # 审批通过率
            "m3_overdue_rate": 4.8,        # M3+逾期率
            "avg_approval_days": 2.1,      # 平均审批时长

            # 商务条件
            "funding_cost": 7.2,           # 资金成本
            "deposit_rate": 5.0,           # 保证金比例
            "cooperation_mode": "风险共担",

            # 关键联系人
            "contacts": [
                {
                    "name": "张总",
                    "role": "分管副行长",
                    "phone": "138****1234"
                },
                {
                    "name": "李经理",
                    "role": "风控部负责人",
                    "phone": "139****5678"
                }
            ],

            # 谈判建议
            "suggestions": [
                {
                    "title": "方案A: 阶梯式保证金",
                    "recommended": True,
                    "content": "前3月保证金提至7%，如M3+控制在4%以内则恢复6%；超过4.5%接受提至8%。"
                },
                {
                    "title": "方案B: 替代方案",
                    "recommended": False,
                    "content": "保证金维持6% + 增设500万风险准备金 + 引入第三方担保。"
                },
                {
                    "title": "方案C: 折中方案",
                    "recommended": False,
                    "content": "保证金提至8% + 优先匹配优质客户 + 增加数据透明度。"
                }
            ]
        }

        return {"success": True, "data": report}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===========================
# 路由 - Playbook (话术推荐)
# ===========================

@app.post("/api/playbook/match")
async def match_playbook(request: PlaybookRequest):
    """
    话术匹配推荐
    对应CLI版本的 playbook_matcher.py
    """
    try:
        # 这里可以接入真实的话术匹配引擎
        # 现在返回模拟数据

        user_input = request.user_input

        # 模拟话术推荐
        scripts = [
            {
                "id": "script_001",
                "name": "阶梯式保证金方案",
                "scene": "价格/条件谈判",
                "content": "理解评审委员会的立场。10%确实超出了我们的承受能力，这会直接影响我们的资金使用效率。我想跟您探讨一个阶梯方案：前3个月保证金提至7%，如果这期间我们的资产M3+控制在4%以内，3个月后恢复到6%；如果超过4.5%，我们接受提至8%。",
                "tips": "不直接拒绝，提出阶梯方案，与资产表现挂钩，给双方回旋余地",
                "usage_count": 45,
                "success_rate": 0.78
            },
            {
                "id": "script_002",
                "name": "数据拆解+改善计划",
                "scene": "风险数据质疑",
                "content": "您的数据我们也在密切关注。需要说明的是，4.8%包含了去年Q2的历史遗留资产（那批资产M3+达6.2%），如果只看近6个月新增资产，M3+已经降到3.9%，接近行业水平。",
                "tips": "拆解数据，区分历史问题和当前表现，展示改善措施和承诺",
                "usage_count": 32,
                "success_rate": 0.82
            }
        ]

        return {"success": True, "data": scripts}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===========================
# 路由 - Realtime (实时谈判)
# ===========================

@app.post("/api/realtime/recommend")
async def realtime_recommend(request: PlaybookRequest):
    """
    实时话术推荐
    对应CLI版本的 realtime_voice.py
    """
    try:
        # 实时推荐逻辑
        recommendations = [
            {
                "type": "script",
                "priority": "high",
                "content": "阶梯式保证金方案...",
                "reason": "对方提出具体数字(10%)，这是关键决策点"
            },
            {
                "type": "data",
                "priority": "medium",
                "content": "M3+数据对比: 4.8% vs 行业3.2%",
                "reason": "需要数据支撑"
            },
            {
                "type": "alert",
                "priority": "high",
                "content": "⚠️ 不要立即拒绝，先测试对方底线",
                "reason": "谈判关键转折点"
            }
        ]

        return {"success": True, "data": recommendations}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===========================
# 健康检查
# ===========================

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "message": "NegotiaPro AI API is running"}


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "NegotiaPro AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
