#!/bin/bash

# 设置 crontab 定时任务脚本
# 自动配置定时提交任务

echo "设置 DRMP 项目自动提交定时任务..."

# 定义 crontab 任务
CRON_JOBS="
# DRMP 项目自动提交任务
# 每30分钟自动提交一次
*/30 * * * * /Users/apple/Desktop/DRMP/.claude/scripts/auto-commit.sh >> /Users/apple/Desktop/DRMP/.claude/logs/cron.log 2>&1

# 每天凌晨2点完整备份
0 2 * * * /Users/apple/Desktop/DRMP/.claude/scripts/create-backup.sh >> /Users/apple/Desktop/DRMP/.claude/logs/cron.log 2>&1

# 每小时执行智能提交（工作时间：9-18点）
0 9-18 * * 1-5 /Users/apple/Desktop/DRMP/.claude/scripts/smart-commit.sh >> /Users/apple/Desktop/DRMP/.claude/logs/cron.log 2>&1
"

# 备份现有的 crontab
echo "备份现有 crontab..."
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# 检查是否已经存在相关任务
if crontab -l 2>/dev/null | grep -q "DRMP.*auto-commit"; then
    echo "⚠️  检测到已存在的 DRMP 自动提交任务"
    echo "是否要替换现有任务？(y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "保留现有任务，退出设置"
        exit 0
    fi
    # 移除现有的 DRMP 相关任务
    crontab -l 2>/dev/null | grep -v "DRMP" | crontab -
fi

# 添加新的定时任务
echo "添加定时任务..."
(crontab -l 2>/dev/null || true; echo "$CRON_JOBS") | crontab -

# 验证任务是否添加成功
if crontab -l | grep -q "DRMP.*auto-commit"; then
    echo "✅ 定时任务设置成功！"
    echo ""
    echo "当前的定时任务："
    crontab -l | grep "DRMP" -A 1
    echo ""
    echo "任务说明："
    echo "  • 每30分钟自动提交一次"
    echo "  • 每天凌晨2点完整备份"
    echo "  • 工作日9-18点每小时智能提交"
    echo ""
    echo "日志文件位置："
    echo "  /Users/apple/Desktop/DRMP/.claude/logs/cron.log"
else
    echo "❌ 定时任务设置失败"
    exit 1
fi

# 创建日志目录
mkdir -p /Users/apple/Desktop/DRMP/.claude/logs

echo ""
echo "提示："
echo "  • 使用 'crontab -l' 查看所有定时任务"
echo "  • 使用 'crontab -e' 编辑定时任务"
echo "  • 使用 'crontab -r' 删除所有定时任务"
echo "  • 查看日志: tail -f /Users/apple/Desktop/DRMP/.claude/logs/cron.log"