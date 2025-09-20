#!/bin/bash

# DRMP 自动提交定时任务设置脚本

echo "=== 设置DRMP自动提交定时任务 ==="

# 定时任务配置
SCHEDULE="0 */2 * * *"  # 每2小时执行一次
SCRIPT_PATH="/Users/apple/Desktop/DRMP/.claude/scripts/auto-commit.sh"

# 检查脚本是否存在
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ 错误: 找不到auto-commit.sh脚本"
    echo "   路径: $SCRIPT_PATH"
    exit 1
fi

# 检查脚本是否可执行
if [ ! -x "$SCRIPT_PATH" ]; then
    echo "⚠️  添加执行权限..."
    chmod +x "$SCRIPT_PATH"
fi

# 创建crontab任务
echo "📝 添加定时任务到crontab..."

# 先备份现有的crontab
crontab -l > /tmp/current_crontab 2>/dev/null || true

# 检查是否已存在相同的任务
if grep -q "$SCRIPT_PATH" /tmp/current_crontab 2>/dev/null; then
    echo "⚠️  定时任务已存在，更新中..."
    # 删除旧任务
    grep -v "$SCRIPT_PATH" /tmp/current_crontab > /tmp/new_crontab || true
else
    cp /tmp/current_crontab /tmp/new_crontab 2>/dev/null || touch /tmp/new_crontab
fi

# 添加新任务
echo "$SCHEDULE cd /Users/apple/Desktop/DRMP && $SCRIPT_PATH >> /Users/apple/Desktop/DRMP/.claude/logs/auto-commit.log 2>&1" >> /tmp/new_crontab

# 安装新的crontab
crontab /tmp/new_crontab

echo "✅ 定时任务设置成功！"
echo ""
echo "📋 任务详情:"
echo "   - 执行频率: 每2小时"
echo "   - 脚本路径: $SCRIPT_PATH"
echo "   - 日志文件: /Users/apple/Desktop/DRMP/.claude/logs/auto-commit.log"
echo ""
echo "🔧 管理命令:"
echo "   查看任务: crontab -l"
echo "   编辑任务: crontab -e"
echo "   删除任务: crontab -r"
echo ""
echo "💡 提示: 你可以编辑此脚本中的SCHEDULE变量来修改执行频率"
echo "   示例:"
echo "   - */30 * * * * (每30分钟)"
echo "   - 0 */4 * * * (每4小时)"
echo "   - 0 9,15,21 * * * (每天9点、15点、21点)"

# 清理临时文件
rm -f /tmp/current_crontab /tmp/new_crontab

echo ""
echo "🚀 自动提交任务将在下一个整点开始运行"