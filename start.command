#!/bin/bash

################################################################################
# 自然拼读小课堂 - 一键启动脚本
# Phonics Classroom - Quick Start Launcher
#
# 功能：
# - 自动检测并安装依赖
# - 启动开发服务器
# - 自动打开浏览器
# - 优雅的错误处理
#
# 使用方式：
# 1. 双击此文件（macOS Finder）
# 2. 或在终端运行: ./start.command
################################################################################

# 终端颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# 获取脚本所在目录（支持双击和终端运行）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

################################################################################
# 工具函数
################################################################################

# 打印带样式的消息
print_header() {
    echo -e "\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║                                                                  ║${RESET}"
    echo -e "${BOLD}${CYAN}║              🎓 自然拼读小课堂 - 快速启动 🚀                      ║${RESET}"
    echo -e "${BOLD}${CYAN}║                                                                  ║${RESET}"
    echo -e "${BOLD}${CYAN}║                Phonics Classroom - Quick Start                   ║${RESET}"
    echo -e "${BOLD}${CYAN}║                                                                  ║${RESET}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════════╝${RESET}\n"
}

print_step() {
    echo -e "${BLUE}▶${RESET} ${BOLD}$1${RESET}"
}

print_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

print_error() {
    echo -e "${RED}✗${RESET} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${RESET} $1"
}

################################################################################
# 环境检查
################################################################################

check_node() {
    print_step "检查 Node.js 环境..."
    
    if ! command -v node &> /dev/null; then
        print_error "未检测到 Node.js，请先安装 Node.js"
        print_info "访问 https://nodejs.org/ 下载安装"
        print_info "或使用 Homebrew: brew install node"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js 版本: $NODE_VERSION"
}

check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "未检测到 npm"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm 版本: v$NPM_VERSION"
}

################################################################################
# 依赖检查与安装
################################################################################

check_dependencies() {
    print_step "检查项目依赖..."
    
    if [ ! -d "node_modules" ]; then
        print_warning "未检测到 node_modules 目录，需要安装依赖"
        install_dependencies
    else
        # 检查 package.json 是否有更新
        if [ "package.json" -nt "node_modules" ]; then
            print_warning "package.json 已更新，需要重新安装依赖"
            install_dependencies
        else
            print_success "依赖已安装"
        fi
    fi
}

install_dependencies() {
    print_step "正在安装依赖..."
    print_info "这可能需要几分钟时间，请耐心等待..."
    
    if npm install; then
        print_success "依赖安装完成"
    else
        print_error "依赖安装失败"
        print_info "请检查网络连接或手动运行: npm install"
        exit 1
    fi
}

################################################################################
# 端口检查
################################################################################

check_port() {
    local PORT=1420
    print_step "检查端口 $PORT..."
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 $PORT 已被占用"
        print_info "正在尝试释放端口..."
        
        # 获取占用端口的进程
        PID=$(lsof -ti :$PORT)
        if [ -n "$PID" ]; then
            print_info "发现进程 PID: $PID"
            read -p "是否终止该进程？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $PID
                sleep 1
                print_success "进程已终止"
            else
                print_error "无法启动：端口被占用"
                exit 1
            fi
        fi
    else
        print_success "端口 $PORT 可用"
    fi
}

################################################################################
# 启动服务器
################################################################################

start_server() {
    print_step "启动开发服务器..."
    print_info "服务器将在 http://localhost:1420 运行"
    print_info "按 Ctrl+C 可以停止服务器"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
    
    # 等待一下再打开浏览器
    (sleep 3 && open_browser) &
    
    # 启动开发服务器
    npm run dev
}

open_browser() {
    local URL="http://localhost:1420"
    
    # 检查服务器是否已启动
    local MAX_ATTEMPTS=10
    local ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s "$URL" > /dev/null 2>&1; then
            print_success "正在打开浏览器..."
            open "$URL"
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        sleep 1
    done
    
    print_warning "无法自动打开浏览器，请手动访问: $URL"
}

################################################################################
# 清理函数
################################################################################

cleanup() {
    echo -e "\n${YELLOW}正在停止服务器...${RESET}"
    # npm dev 会自己处理清理
    exit 0
}

# 捕获 Ctrl+C 信号
trap cleanup INT TERM

################################################################################
# 主流程
################################################################################

main() {
    # 清屏（可选）
    clear
    
    # 显示欢迎信息
    print_header
    
    # 显示项目信息
    print_info "项目目录: $SCRIPT_DIR"
    print_info "启动时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    
    # 环境检查
    check_node
    check_npm
    echo
    
    # 依赖检查
    check_dependencies
    echo
    
    # 端口检查
    check_port
    echo
    
    # 启动服务器
    start_server
}

# 执行主流程
main