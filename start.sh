#!/bin/bash

# NegotiaPro AI Web版 - 一键启动脚本
# 用法: chmod +x start.sh && ./start.sh

echo "=========================================="
echo "  NegotiaPro AI Web版 - 启动脚本"
echo "=========================================="
echo ""

# 检查是否在项目根目录
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ 错误: 请在项目根目录 (negotiation_assistant_web/) 运行此脚本"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js，请先安装 https://nodejs.org/"
    exit 1
fi

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未安装Python3，请先安装 https://www.python.org/"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 安装依赖
echo "📦 检查依赖..."

# 检查后端依赖
if [ ! -d "backend/venv" ]; then
    echo "正在创建Python虚拟环境..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "正在安装前端依赖 (这可能需要几分钟)..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ 依赖检查完成"
echo ""

# 启动后端
echo "🚀 正在启动后端服务..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等���后端启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ 后端启动成功: http://localhost:8000"
else
    echo "⚠️  后端可能启动失败，请检查 http://localhost:8000/docs"
fi

echo ""

# 启动前端
echo "🚀 正在启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端启动
echo "⏳ 等待前端启动..."
sleep 5

echo ""
echo "=========================================="
echo "✅ 启动完成!"
echo "=========================================="
echo ""
echo "📱 前端地址: http://localhost:5173"
echo "🔌 后端地址: http://localhost:8000"
echo "📖 API文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
wait $BACKEND_PID $FRONTEND_PID
