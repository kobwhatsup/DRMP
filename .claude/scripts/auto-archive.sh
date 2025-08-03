#!/bin/bash

# DRMP 自动存档主控制脚本
# 整合所有自动存档功能

PROJECT_ROOT="/Users/apple/Desktop/DRMP"
SCRIPT_DIR="$PROJECT_ROOT/.claude/scripts"

cd "$PROJECT_ROOT"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}🤖 DRMP 自动存档系统${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  auto        执行自动提交"
    echo "  smart       执行智能提交"
    echo "  backup      创建备份"
    echo "  schedule    启动定时任务"
    echo "  status      显示状态"
    echo "  logs        显示日志"
    echo "  setup       初始化设置"
    echo "  help        显示此帮助"
    echo ""
}

# 显示状态
show_status() {
    print_header
    
    echo "📊 项目状态:"
    echo "  - 项目路径: $PROJECT_ROOT"
    echo "  - Git状态: $(git status --porcelain | wc -l) 个未提交的修改"
    echo "  - 分支: $(git branch --show-current)"
    echo "  - 最后提交: $(git log -1 --pretty=format:'%h - %s (%cr)')"
    
    echo ""
    echo "🔧 自动存档配置:"
    if [ -f ".claude/settings.json" ]; then
        AUTO_SAVE=$(cat .claude/settings.json | grep -o '"enabled": *[^,}]*' | head -1 | cut -d':' -f2 | tr -d ' "')
        INTERVAL=$(cat .claude/settings.json | grep -o '"interval": *[^,}]*' | cut -d':' -f2 | tr -d ' "')
        echo "  - 自动保存: $AUTO_SAVE"
        echo "  - 间隔时间: ${INTERVAL}秒"
    else
        print_warning "配置文件不存在"
    fi
    
    echo ""
    echo "📁 备份状态:"
    if [ -d ".claude/backups" ]; then
        BACKUP_COUNT=$(ls .claude/backups/*.tar.gz 2>/dev/null | wc -l)
        echo "  - 备份数量: $BACKUP_COUNT"
        if [ $BACKUP_COUNT -gt 0 ]; then
            LATEST_BACKUP=$(ls -t .claude/backups/*.tar.gz 2>/dev/null | head -1)
            BACKUP_SIZE=$(du -h "$LATEST_BACKUP" 2>/dev/null | cut -f1)
            echo "  - 最新备份: $(basename "$LATEST_BACKUP") ($BACKUP_SIZE)"
        fi
    else
        echo "  - 备份目录不存在"
    fi
}

# 显示日志
show_logs() {
    echo "📝 最近的日志:"
    echo ""
    
    if [ -f ".claude/logs/auto-commit.log" ]; then
        echo "🔄 自动提交日志 (最近5条):"
        tail -5 .claude/logs/auto-commit.log
        echo ""
    fi
    
    if [ -f ".claude/logs/backup.log" ]; then
        echo "📦 备份日志 (最近5条):"
        tail -5 .claude/logs/backup.log
        echo ""
    fi
    
    if [ -f ".claude/logs/git-hooks.log" ]; then
        echo "🔗 Git Hooks日志 (最近5条):"
        tail -5 .claude/logs/git-hooks.log
    fi
}

# 初始化设置
setup_auto_archive() {
    print_header
    print_status "正在初始化自动存档系统..."
    
    # 创建必要的目录
    mkdir -p .claude/{scripts,logs,tmp,backups}
    
    # 设置权限
    chmod +x .claude/scripts/*.sh 2>/dev/null
    chmod +x .git/hooks/* 2>/dev/null
    
    print_status "目录结构创建完成"
    print_status "脚本权限设置完成"
    print_status "Git hooks 配置完成"
    
    echo ""
    print_status "🎉 自动存档系统初始化完成！"
    echo ""
    echo "下一步:"
    echo "1. 运行 '$0 auto' 测试自动提交"
    echo "2. 运行 '$0 schedule' 启动定时任务"
    echo "3. 运行 '$0 status' 查看状态"
}

# 启动定时任务
start_schedule() {
    print_status "启动定时任务..."
    
    # 创建cron任务（每5分钟执行一次）
    CRON_JOB="*/5 * * * * cd $PROJECT_ROOT && bash .claude/scripts/scheduled-commit.sh"
    
    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "scheduled-commit.sh"; then
        print_warning "定时任务已存在"
    else
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        print_status "定时任务已添加 (每5分钟检查一次)"
    fi
    
    # 显示当前cron任务
    echo ""
    echo "当前定时任务:"
    crontab -l 2>/dev/null | grep "scheduled-commit.sh" || echo "无相关定时任务"
}

# 主逻辑
case "${1:-help}" in
    "auto")
        print_header
        bash "$SCRIPT_DIR/auto-commit.sh"
        ;;
    "smart")
        print_header
        bash "$SCRIPT_DIR/smart-commit.sh"
        ;;
    "backup")
        print_header
        bash "$SCRIPT_DIR/create-backup.sh"
        ;;
    "schedule")
        start_schedule
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "setup")
        setup_auto_archive
        ;;
    "help"|*)
        print_header
        show_help
        ;;
esac