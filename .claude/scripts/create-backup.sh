#!/bin/bash

# 创建项目备份脚本

PROJECT_ROOT="/Users/apple/Desktop/DRMP"
BACKUP_DIR="$PROJECT_ROOT/.claude/backups"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
BACKUP_NAME="drmp_backup_$TIMESTAMP"

cd "$PROJECT_ROOT"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "🗂️ 开始创建项目备份..."

# 创建备份压缩包，排除不必要的文件
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='.claude/backups' \
    --exclude='build' \
    --exclude='dist' \
    .

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
    echo "✅ 备份创建成功: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)"
    
    # 记录备份日志
    echo "[$TIMESTAMP] Backup created: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)" >> .claude/logs/backup.log
    
    # 清理旧备份（保留最近7个）
    cd "$BACKUP_DIR"
    ls -t *.tar.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null
    
    REMAINING_BACKUPS=$(ls *.tar.gz 2>/dev/null | wc -l)
    echo "📁 保留 $REMAINING_BACKUPS 个备份文件"
    
else
    echo "❌ 备份创建失败"
    exit 1
fi