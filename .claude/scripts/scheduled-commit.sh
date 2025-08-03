#!/bin/bash

# 定时自动提交脚本
# 每5分钟检查一次是否有未提交的更改

PROJECT_ROOT="/Users/apple/Desktop/DRMP"
LOCK_FILE="$PROJECT_ROOT/.claude/tmp/commit.lock"
LOG_FILE="$PROJECT_ROOT/.claude/logs/scheduled-commit.log"

# 创建临时目录
mkdir -p "$PROJECT_ROOT/.claude/tmp"

# 检查锁文件，避免并发执行
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE")
    if kill -0 "$LOCK_PID" 2>/dev/null; then
        echo "$(date): 另一个提交进程正在运行 (PID: $LOCK_PID)" >> "$LOG_FILE"
        exit 0
    else
        echo "$(date): 清理过期锁文件" >> "$LOG_FILE"
        rm -f "$LOCK_FILE"
    fi
fi

# 创建锁文件
echo $$ > "$LOCK_FILE"

# 确保退出时清理锁文件
trap 'rm -f "$LOCK_FILE"' EXIT

# 切换到项目目录
cd "$PROJECT_ROOT"

# 检查git状态
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "$(date): 错误 - 不在git仓库中" >> "$LOG_FILE"
    exit 1
fi

# 检查是否有修改
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo "$(date): 检测到未提交的更改，执行自动提交..." >> "$LOG_FILE"
    
    # 调用自动提交脚本
    if bash .claude/scripts/auto-commit.sh >> "$LOG_FILE" 2>&1; then
        echo "$(date): 定时自动提交成功" >> "$LOG_FILE"
    else
        echo "$(date): 定时自动提交失败" >> "$LOG_FILE"
    fi
else
    echo "$(date): 没有未提交的更改" >> "$LOG_FILE"
fi

# 清理旧日志（保留最近7天）
find "$PROJECT_ROOT/.claude/logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true