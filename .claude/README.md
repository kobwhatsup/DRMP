# DRMP 自动存档系统

这是为DRMP项目配置的Claude Code自动存档系统，提供智能代码提交和备份功能。

## 功能特性

- 🤖 **自动提交**: 定期检查代码变更并自动提交
- 🧠 **智能提交**: 根据文件类型生成合适的提交信息
- 📦 **自动备份**: 创建项目备份，保留历史版本
- 🔗 **Git Hooks**: 提交前后自动执行检查和操作
- ⏰ **定时任务**: 支持cron定时自动存档

## 快速开始

### 1. 初始化系统
```bash
cd /Users/apple/Desktop/DRMP
bash .claude/scripts/auto-archive.sh setup
```

### 2. 测试自动提交
```bash
bash .claude/scripts/auto-archive.sh auto
```

### 3. 启动定时任务
```bash
bash .claude/scripts/auto-archive.sh schedule
```

## 主要命令

| 命令 | 功能 |
|------|------|
| `auto-archive.sh auto` | 执行自动提交 |
| `auto-archive.sh smart` | 执行智能提交 |
| `auto-archive.sh backup` | 创建项目备份 |
| `auto-archive.sh status` | 显示系统状态 |
| `auto-archive.sh logs` | 查看操作日志 |
| `auto-archive.sh schedule` | 启动定时任务 |

## 配置文件

### settings.json
```json
{
  "auto-save": {
    "enabled": true,
    "interval": 300,
    "use-smart-commit": true
  },
  "backup": {
    "create-daily-backup": true,
    "keep-days": 7
  }
}
```

### hooks.json
```json
{
  "hooks": {
    "file-changed": {
      "command": "bash .claude/scripts/auto-commit.sh",
      "enabled": true
    }
  }
}
```

## 目录结构

```
.claude/
├── scripts/           # 自动化脚本
│   ├── auto-commit.sh       # 自动提交脚本
│   ├── smart-commit.sh      # 智能提交脚本
│   ├── create-backup.sh     # 备份脚本
│   ├── scheduled-commit.sh  # 定时提交脚本
│   └── auto-archive.sh      # 主控制脚本
├── logs/             # 操作日志
├── backups/          # 项目备份
├── tmp/              # 临时文件
├── settings.json     # 系统设置
├── hooks.json        # Hook配置
└── README.md         # 说明文档
```

## Git Hooks

系统自动配置了以下Git Hooks：

- **pre-commit**: 提交前检查代码格式和敏感信息
- **post-commit**: 提交后创建备份和记录日志

## 日志文件

- `auto-commit.log`: 自动提交日志
- `smart-commit.log`: 智能提交日志
- `backup.log`: 备份操作日志
- `git-hooks.log`: Git Hooks执行日志
- `scheduled-commit.log`: 定时任务日志

## 安全特性

- ✅ 敏感信息检测
- ✅ 提交大小限制
- ✅ 备份文件自动清理
- ✅ 锁文件防止并发执行

## 故障排除

### 问题1: 权限不足
```bash
chmod +x .claude/scripts/*.sh
chmod +x .git/hooks/*
```

### 问题2: cron任务未执行
```bash
# 检查cron服务状态
sudo launchctl list | grep cron

# 查看cron日志
tail -f /var/log/cron.log
```

### 问题3: Git hooks不生效
```bash
# 确保hooks文件可执行
ls -la .git/hooks/
```

## 注意事项

1. 定时任务默认每5分钟执行一次
2. 备份文件保留最近7天
3. 单次提交最多包含50个文件
4. 日志文件自动清理（7天以上）

## 联系支持

如有问题，请检查日志文件或联系项目维护者。