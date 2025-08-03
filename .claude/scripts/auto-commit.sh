#!/bin/bash

# Claude Code Auto-Commit Script
# 自动提交修改的文件，避免代码丢失

set -e

# 配置
MAX_FILES_PER_COMMIT=50
MESSAGE_PREFIX="Auto-save"
PROJECT_ROOT="/Users/apple/Desktop/DRMP"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "错误: 不在git仓库中，跳过自动提交"
    exit 0
fi

# 检查是否有未提交的修改
if git diff --quiet && git diff --staged --quiet; then
    echo "没有未提交的修改，跳过自动提交"
    exit 0
fi

# 获取修改的文件数量
MODIFIED_FILES=$(git status --porcelain | wc -l)
echo "检测到 $MODIFIED_FILES 个修改的文件"

# 如果修改文件太多，只提交部分文件
if [ "$MODIFIED_FILES" -gt "$MAX_FILES_PER_COMMIT" ]; then
    echo "修改文件过多，只提交前 $MAX_FILES_PER_COMMIT 个文件"
    git status --porcelain | head -n "$MAX_FILES_PER_COMMIT" | cut -c4- | xargs git add
else
    # 添加所有修改的文件
    git add .
fi

# 生成提交信息
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
BRANCH_NAME=$(git branch --show-current)
COMMIT_MESSAGE="$MESSAGE_PREFIX 代码自动存档 [$TIMESTAMP] 分支: $BRANCH_NAME

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 执行提交
if git commit -m "$COMMIT_MESSAGE"; then
    echo "✅ 自动提交成功: $TIMESTAMP"
    
    # 记录提交日志
    echo "[$TIMESTAMP] Auto-commit successful on branch $BRANCH_NAME" >> .claude/logs/auto-commit.log
    
    # 可选：推送到远程仓库（取消注释以启用）
    # git push origin "$BRANCH_NAME" 2>/dev/null || echo "⚠️ 推送到远程仓库失败，但本地提交成功"
    
else
    echo "❌ 自动提交失败"
    exit 1
fi

# 清理：如果提交历史过多，可以考虑压缩提交
COMMIT_COUNT=$(git rev-list --count HEAD)
if [ "$COMMIT_COUNT" -gt 100 ]; then
    echo "💡 提示: 提交历史较长 ($COMMIT_COUNT 个提交)，建议定期整理"
fi

echo "📝 自动存档完成"