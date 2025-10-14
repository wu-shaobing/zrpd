#!/bin/bash

# 自然拼读小游戏 - 一键启动脚本
# 使用方式：./start.sh 或 bash start.sh

set -e

echo "🎮 自然拼读小课堂 - 启动中..."
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

# 检查端口是否被占用
if lsof -Pi :1420 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 1420 已被占用"
    echo "正在尝试终止占用进程..."
    lsof -ti:1420 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "✅ 准备就绪！"
echo ""
echo "🌐 开发服务器将在以下地址启动："
echo "   → http://localhost:1420"
echo ""
echo "📝 按 Ctrl+C 停止服务器"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动开发服务器
npm run dev
