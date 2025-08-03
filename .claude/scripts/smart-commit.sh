#!/bin/bash

# 智能提交脚本
# 根据修改的文件类型和内容生成合适的提交信息

PROJECT_ROOT="/Users/apple/Desktop/DRMP"
cd "$PROJECT_ROOT"

# 检查git状态
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "错误: 不在git仓库中"
    exit 1
fi

# 检查是否有修改
if git diff --quiet && git diff --staged --quiet; then
    echo "没有未提交的修改"
    exit 0
fi

# 分析修改的文件类型
FRONTEND_FILES=$(git status --porcelain | grep -E '\.(tsx?|jsx?|css|scss|less)$' | wc -l)
BACKEND_FILES=$(git status --porcelain | grep -E '\.(java|properties|xml|yml|yaml)$' | wc -l)
CONFIG_FILES=$(git status --porcelain | grep -E '\.(json|env|md|sh|gitignore)$' | wc -l)
DOC_FILES=$(git status --porcelain | grep -E '\.(md|txt|doc|docx)$' | wc -l)

# 生成智能提交信息
generate_commit_message() {
    local category=""
    local description=""
    
    if [ "$FRONTEND_FILES" -gt 0 ] && [ "$BACKEND_FILES" -gt 0 ]; then
        category="feat"
        description="更新前后端代码"
    elif [ "$FRONTEND_FILES" -gt 0 ]; then
        category="feat"
        description="更新前端代码"
    elif [ "$BACKEND_FILES" -gt 0 ]; then
        category="feat"
        description="更新后端代码"
    elif [ "$CONFIG_FILES" -gt 0 ]; then
        category="config"
        description="更新配置文件"
    elif [ "$DOC_FILES" -gt 0 ]; then
        category="docs"
        description="更新文档"
    else
        category="update"
        description="更新项目文件"
    fi
    
    # 检查是否有新文件
    NEW_FILES=$(git status --porcelain | grep "^A" | wc -l)
    DELETED_FILES=$(git status --porcelain | grep "^D" | wc -l)
    MODIFIED_FILES=$(git status --porcelain | grep "^M" | wc -l)
    
    local details=""
    if [ "$NEW_FILES" -gt 0 ]; then
        details="$details, 新增${NEW_FILES}个文件"
    fi
    if [ "$DELETED_FILES" -gt 0 ]; then
        details="$details, 删除${DELETED_FILES}个文件"
    fi
    if [ "$MODIFIED_FILES" -gt 0 ]; then
        details="$details, 修改${MODIFIED_FILES}个文件"
    fi
    
    # 移除开头的逗号和空格
    details=$(echo "$details" | sed 's/^, //')
    
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    BRANCH_NAME=$(git branch --show-current)
    
    echo "${category}: ${description}

详细信息: $details
时间: $TIMESTAMP
分支: $BRANCH_NAME

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
}

# 添加所有修改的文件
git add .

# 生成并执行提交
COMMIT_MESSAGE=$(generate_commit_message)

if git commit -m "$COMMIT_MESSAGE"; then
    echo "✅ 智能提交成功"
    
    # 记录到日志
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$TIMESTAMP] Smart commit successful - Frontend: $FRONTEND_FILES, Backend: $BACKEND_FILES, Config: $CONFIG_FILES, Docs: $DOC_FILES" >> .claude/logs/smart-commit.log
    
    # 显示提交统计
    echo ""
    echo "📊 提交统计:"
    echo "  - 前端文件: $FRONTEND_FILES"
    echo "  - 后端文件: $BACKEND_FILES" 
    echo "  - 配置文件: $CONFIG_FILES"
    echo "  - 文档文件: $DOC_FILES"
    
else
    echo "❌ 智能提交失败"
    exit 1
fi