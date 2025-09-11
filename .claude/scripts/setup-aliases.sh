#!/bin/bash

# 设置 DRMP 项目便捷命令别名
# 自动添加到 shell 配置文件

echo "设置 DRMP 项目便捷命令别名..."

# 定义别名内容
ALIASES='
# ========== DRMP 项目便捷命令 ==========
# 快速保存并推送
alias drmp-save="cd /Users/apple/Desktop/DRMP && bash .claude/scripts/smart-commit.sh && git push"

# 同步远程仓库
alias drmp-sync="cd /Users/apple/Desktop/DRMP && git pull --rebase && git push"

# 会话自动提交
alias drmp-session="cd /Users/apple/Desktop/DRMP && bash .claude/scripts/session-auto-commit.sh"

# 自动存档
alias drmp-auto="cd /Users/apple/Desktop/DRMP && bash .claude/scripts/auto-commit.sh"

# 查看项目状态
alias drmp-status="cd /Users/apple/Desktop/DRMP && git status"

# 查看最近提交
alias drmp-log="cd /Users/apple/Desktop/DRMP && git log --oneline -10"

# 查看自动提交日志
alias drmp-logs="tail -f /Users/apple/Desktop/DRMP/.claude/logs/session-auto-commit.log"

# 快速进入项目目录
alias drmp="cd /Users/apple/Desktop/DRMP"

# 启动前端
alias drmp-frontend="cd /Users/apple/Desktop/DRMP/frontend && npm start"

# 启动后端
alias drmp-backend="cd /Users/apple/Desktop/DRMP/backend && mvn spring-boot:run"
# ========== DRMP 项目便捷命令结束 ==========
'

# 检测 shell 类型
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_TYPE="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
    if [ ! -f "$SHELL_CONFIG" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    fi
    SHELL_TYPE="bash"
else
    echo "⚠️  未能检测到 shell 类型，请手动添加别名"
    echo "$ALIASES"
    exit 1
fi

echo "检测到 Shell 类型: $SHELL_TYPE"
echo "配置文件: $SHELL_CONFIG"

# 备份配置文件
cp "$SHELL_CONFIG" "$SHELL_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "已备份配置文件"

# 检查是否已存在 DRMP 别名
if grep -q "DRMP 项目便捷命令" "$SHELL_CONFIG"; then
    echo "⚠️  检测到已存在的 DRMP 别名配置"
    echo "是否要更新现有配置？(y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        # 删除旧的配置
        sed -i.tmp '/# ========== DRMP 项目便捷命令 ==========/,/# ========== DRMP 项目便捷命令结束 ==========/d' "$SHELL_CONFIG"
        rm -f "$SHELL_CONFIG.tmp"
    else
        echo "保留现有配置，退出设置"
        exit 0
    fi
fi

# 添加别名到配置文件
echo "$ALIASES" >> "$SHELL_CONFIG"

echo "✅ 别名设置成功！"
echo ""
echo "可用的命令："
echo "  drmp-save     - 智能提交并推送到 GitHub"
echo "  drmp-sync     - 同步远程仓库"
echo "  drmp-session  - 会话结束时的完整提交"
echo "  drmp-auto     - 自动存档提交"
echo "  drmp-status   - 查看项目状态"
echo "  drmp-log      - 查看最近提交记录"
echo "  drmp-logs     - 查看自动提交日志"
echo "  drmp          - 快速进入项目目录"
echo "  drmp-frontend - 启动前端服务"
echo "  drmp-backend  - 启动后端服务"
echo ""
echo "⚠️  请执行以下命令使别名生效："
echo "  source $SHELL_CONFIG"
echo ""
echo "或者重新打开终端窗口"