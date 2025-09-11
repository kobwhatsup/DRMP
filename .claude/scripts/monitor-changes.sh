#!/bin/bash

# 文件变化监控脚本
# 实时监控项目文件变化并自动提交

PROJECT_ROOT="/Users/apple/Desktop/DRMP"
LOG_FILE="$PROJECT_ROOT/.claude/logs/monitor.log"
LAST_COMMIT_FILE="/tmp/drmp_last_commit_time"
COMMIT_INTERVAL=1800  # 30分钟（秒）

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

log_info() {
    echo -e "${BLUE}[MONITOR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MONITOR] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[MONITOR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[MONITOR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" >> "$LOG_FILE"
}

# 检查是否需要提交
should_commit() {
    if [ ! -f "$LAST_COMMIT_FILE" ]; then
        return 0
    fi
    
    LAST_COMMIT=$(cat "$LAST_COMMIT_FILE")
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_COMMIT))
    
    if [ "$TIME_DIFF" -ge "$COMMIT_INTERVAL" ]; then
        return 0
    else
        return 1
    fi
}

# 执行自动提交
do_commit() {
    cd "$PROJECT_ROOT"
    
    # 检查是否有修改
    if git diff --quiet && git diff --staged --quiet; then
        return 1
    fi
    
    log_info "检测到文件变化，准备提交..."
    
    # 执行智能提交脚本
    if bash "$PROJECT_ROOT/.claude/scripts/smart-commit.sh" > /dev/null 2>&1; then
        log_success "自动提交成功"
        date +%s > "$LAST_COMMIT_FILE"
        
        # 尝试推送
        if git push origin $(git branch --show-current) > /dev/null 2>&1; then
            log_success "推送到远程仓库成功"
        else
            log_warning "推送失败，稍后重试"
        fi
        return 0
    else
        log_warning "自动提交失败"
        return 1
    fi
}

# 主监控循环
monitor_loop() {
    log_info "开始监控文件变化..."
    log_info "监控目录: $PROJECT_ROOT"
    log_info "提交间隔: ${COMMIT_INTERVAL}秒"
    
    # 检查 fswatch 是否安装
    if ! command -v fswatch &> /dev/null; then
        log_warning "fswatch 未安装，使用简单轮询模式"
        
        # 简单轮询模式
        while true; do
            if should_commit; then
                do_commit
            fi
            sleep 60  # 每分钟检查一次
        done
    else
        # 使用 fswatch 监控
        fswatch -r -e "\.git" -e "node_modules" -e "target" -e "build" -e "dist" \
                -e "\.log$" -e "\.tmp$" -e "\.swp$" \
                "$PROJECT_ROOT" | while read -r event; do
            
            log_info "检测到文件变化: $(basename "$event")"
            
            if should_commit; then
                do_commit
            fi
        done
    fi
}

# 信号处理
trap 'log_info "监控停止"; exit 0' SIGINT SIGTERM

# 显示启动信息
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    DRMP 文件变化监控脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "配置信息："
echo "  • 项目目录: $PROJECT_ROOT"
echo "  • 提交间隔: $((COMMIT_INTERVAL / 60)) 分钟"
echo "  • 日志文件: $LOG_FILE"
echo ""
echo "提示："
echo "  • 按 Ctrl+C 停止监控"
echo "  • 安装 fswatch 以获得更好的性能："
echo "    brew install fswatch"
echo ""

# 启动监控
monitor_loop