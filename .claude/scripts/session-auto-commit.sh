#!/bin/bash

# Claude Code Session Auto-Commit Script
# 会话结束时自动提交并推送到 GitHub
# 作者: Claude Assistant
# 版本: 1.0.0

set -e

# ========== 配置部分 ==========
PROJECT_ROOT="/Users/apple/Desktop/DRMP"
MAX_FILES_PER_COMMIT=100
REMOTE_NAME="origin"
BRANCH_NAME="master"
LOG_DIR="$PROJECT_ROOT/.claude/logs"
LOG_FILE="$LOG_DIR/session-auto-commit.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== 函数定义 ==========

# 输出带颜色的日志
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

# 检查网络连接
check_network() {
    if ping -c 1 github.com &> /dev/null; then
        return 0
    else
        log_warning "无法连接到 GitHub，将只进行本地提交"
        return 1
    fi
}

# 生成智能提交信息
generate_commit_message() {
    local frontend_files=$(git status --porcelain | grep -E '\.(tsx?|jsx?|css|scss)$' | wc -l | tr -d ' ')
    local backend_files=$(git status --porcelain | grep -E '\.(java|xml|properties)$' | wc -l | tr -d ' ')
    local config_files=$(git status --porcelain | grep -E '\.(json|env|sh|yml)$' | wc -l | tr -d ' ')
    local new_files=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')
    local modified_files=$(git status --porcelain | grep "^ M" | wc -l | tr -d ' ')
    local deleted_files=$(git status --porcelain | grep "^ D" | wc -l | tr -d ' ')
    
    local category=""
    local description=""
    
    # 判断主要修改类型
    if [ "$frontend_files" -gt 0 ] && [ "$backend_files" -gt 0 ]; then
        category="feat"
        description="更新前后端功能"
    elif [ "$frontend_files" -gt 0 ]; then
        category="frontend"
        description="更新前端界面与交互"
    elif [ "$backend_files" -gt 0 ]; then
        category="backend"
        description="更新后端服务逻辑"
    elif [ "$config_files" -gt 0 ]; then
        category="config"
        description="更新配置文件"
    else
        category="update"
        description="更新项目文件"
    fi
    
    # 构建详细信息
    local details=""
    [ "$new_files" -gt 0 ] && details="${details}新增${new_files}个文件 "
    [ "$modified_files" -gt 0 ] && details="${details}修改${modified_files}个文件 "
    [ "$deleted_files" -gt 0 ] && details="${details}删除${deleted_files}个文件"
    
    # 获取最近修改的文件列表（最多3个）
    local recent_files=$(git status --porcelain | head -3 | cut -c4- | tr '\n' ', ' | sed 's/,$//')
    
    echo "${category}: ${description}

详细修改: ${details}
主要文件: ${recent_files}
时间: $(date '+%Y-%m-%d %H:%M:%S')

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
}

# ========== 主程序 ==========

# 创建日志目录
mkdir -p "$LOG_DIR"

log_info "========== 开始会话自动提交 =========="

# 切换到项目目录
cd "$PROJECT_ROOT"

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "当前目录不是 git 仓库"
    exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    log_warning "无法获取当前分支，使用默认分支 $BRANCH_NAME"
    CURRENT_BRANCH="$BRANCH_NAME"
fi

log_info "当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的修改
if git diff --quiet && git diff --staged --quiet; then
    log_info "没有未提交的修改"
else
    # 统计修改文件
    MODIFIED_COUNT=$(git status --porcelain | wc -l | tr -d ' ')
    log_info "发现 $MODIFIED_COUNT 个文件有修改"
    
    # 添加所有修改（包括新文件）
    git add -A
    
    # 生成提交信息
    COMMIT_MSG=$(generate_commit_message)
    
    # 执行提交
    if git commit -m "$COMMIT_MSG"; then
        log_success "本地提交成功"
        
        # 获取提交哈希
        COMMIT_HASH=$(git rev-parse HEAD)
        log_info "提交哈希: $COMMIT_HASH"
    else
        log_error "本地提交失败"
        exit 1
    fi
fi

# 检查网络并推送到远程
if check_network; then
    log_info "正在同步远程仓库..."
    
    # 先拉取最新代码
    if git fetch "$REMOTE_NAME" "$CURRENT_BRANCH" &> /dev/null; then
        log_info "获取远程更新成功"
        
        # 检查是否需要合并
        LOCAL=$(git rev-parse HEAD)
        REMOTE=$(git rev-parse "$REMOTE_NAME/$CURRENT_BRANCH" 2>/dev/null || echo "")
        
        if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
            log_info "检测到远程更新，尝试自动合并..."
            
            # 尝试 rebase
            if git rebase "$REMOTE_NAME/$CURRENT_BRANCH" &> /dev/null; then
                log_success "自动合并成功"
            else
                log_warning "自动合并失败，尝试中止 rebase"
                git rebase --abort &> /dev/null
                
                # 尝试普通合并
                if git merge "$REMOTE_NAME/$CURRENT_BRANCH" -m "自动合并远程更新" &> /dev/null; then
                    log_success "使用 merge 合并成功"
                else
                    log_error "合并失败，需要手动解决冲突"
                    exit 1
                fi
            fi
        fi
    fi
    
    # 推送到远程
    log_info "正在推送到 GitHub..."
    if git push "$REMOTE_NAME" "$CURRENT_BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "推送到 GitHub 成功"
        
        # 显示远程仓库 URL
        REMOTE_URL=$(git remote get-url "$REMOTE_NAME")
        log_info "远程仓库: $REMOTE_URL"
    else
        log_error "推送失败，代码已保存在本地"
        log_info "稍后可以手动执行: git push $REMOTE_NAME $CURRENT_BRANCH"
    fi
else
    log_warning "网络连接失败，仅完成本地提交"
fi

# 显示仓库状态
log_info "当前仓库状态:"
git log --oneline -5 | while read line; do
    echo "  $line"
done

# 统计信息
TOTAL_COMMITS=$(git rev-list --count HEAD)
TODAY_COMMITS=$(git log --since="00:00:00" --oneline | wc -l | tr -d ' ')

log_info "========== 会话自动提交完成 =========="
log_info "📊 统计信息:"
log_info "  - 总提交数: $TOTAL_COMMITS"
log_info "  - 今日提交: $TODAY_COMMITS"
log_info "  - 当前分支: $CURRENT_BRANCH"

# 成功退出
exit 0