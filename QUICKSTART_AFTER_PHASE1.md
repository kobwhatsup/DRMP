# 🚀 Phase 1修复后快速启动指南

> 第一阶段修复已完成，按此指南快速启动项目

---

## ⚡ 5分钟快速启动

### 1️⃣ 配置环境变量 (2分钟)

```bash
# 后端环境变量
cd backend
cp .env.example .env

# 编辑 .env，填入实际配置
vi .env

# 必须修改的配置项:
# - DB_PASSWORD (数据库密码)
# - JWT_SECRET (生成: openssl rand -hex 64)
# - ENCRYPTION_SECRET_KEY (生成: openssl rand -hex 64)
```

```bash
# 前端环境变量(可选，已有默认值)
cd frontend
cp .env.example .env.local

# 如需自定义可修改:
# - REACT_APP_API_URL (默认: http://localhost:8080/api)
# - REACT_APP_DEV_AUTO_LOGIN (默认: true)
```

### 2️⃣ 启动后端 (1分钟)

```bash
cd backend

# 确保MySQL和Redis已启动
mysql.server start  # 或 brew services start mysql
redis-server &      # 或 brew services start redis

# 启动Spring Boot
mvn spring-boot:run

# 看到以下日志表示成功:
# ✅ 环境变量验证通过
# ✅ Flyway migration completed
# ✅ Redis connection successful
# ✅ Started DrmpApplication
```

### 3️⃣ 启动前端 (1分钟)

```bash
cd frontend

# 安装依赖(首次)
npm install

# 启动开发服务器
npm start

# 浏览器自动打开 http://localhost:3000
```

### 4️⃣ 验证 (1分钟)

```bash
# 1. 检查后端健康
curl http://localhost:8080/api/actuator/health

# 2. 检查Swagger文档
open http://localhost:8080/api/swagger-ui.html

# 3. 检查前端
open http://localhost:3000
```

---

## 🔐 首次使用 - 创建管理员账号

### 方式1: 使用SQL脚本

```sql
-- 连接数据库
mysql -u root -p drmp

-- 插入管理员用户
INSERT INTO users (username, password, email, real_name, status, created_at)
VALUES (
  'admin',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH',  -- 密码: admin123
  'admin@drmp.com',
  '系统管理员',
  'ACTIVE',
  NOW()
);

-- 分配管理员角色
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.code = 'ADMIN';
```

### 方式2: 使用开发环境自动登录

前端开发环境已配置自动登录(用户名: admin, 密码: admin123)，前提是后端有对应用户。

---

## 📋 验收检查清单

运行自动化检查脚本:

```bash
# 创建检查脚本
cat > check-phase1.sh << 'EOF'
#!/bin/bash
echo "=== Phase 1 验收检查 ==="

# 1. Git仓库
echo "✅ 检查Git仓库..."
git fsck --full || exit 1

# 2. 敏感信息
echo "✅ 检查敏感信息..."
if grep -r "drmp123456\|drmp2024Secret" backend/src/main/resources/application*.yml; then
    echo "❌ 发现明文密码"
    exit 1
fi

# 3. 环境变量
echo "✅ 检查环境变量..."
[ -f backend/.env ] || { echo "❌ 缺少 backend/.env"; exit 1; }

# 4. Flyway
echo "✅ 检查Flyway..."
grep "enabled: true" backend/src/main/resources/application.yml || exit 1

# 5. Redis
echo "✅ 检查Redis配置..."
grep "lettuce:" backend/src/main/resources/application.yml || exit 1

# 6. 编译测试
echo "✅ 编译检查..."
cd backend && mvn clean compile -DskipTests || exit 1
cd ../frontend && npm run build || exit 1

echo "=== ✅ 所有检查通过 ==="
EOF

chmod +x check-phase1.sh
./check-phase1.sh
```

---

## 🔍 常见问题

### Q1: 启动时报"JWT_SECRET未配置"

**原因**: 环境变量未正确加载

**解决**:
```bash
# 检查 backend/.env 文件是否存在
ls -la backend/.env

# 确认spring-dotenv依赖已添加
grep "spring-dotenv" backend/pom.xml

# 重新编译
cd backend && mvn clean install
```

### Q2: 前端自动登录失败

**原因**: 后端没有对应的admin用户

**解决**:
```bash
# 方式1: 手动创建用户(见上方SQL)

# 方式2: 关闭自动登录
# 编辑 frontend/.env.development
REACT_APP_DEV_AUTO_LOGIN=false
```

### Q3: Flyway迁移失败

**原因**: 数据库已存在表，但没有flyway_schema_history

**解决**:
```sql
-- 设置基线版本
mysql -u root -p drmp

-- Flyway会自动创建基线
-- 或手动设置
INSERT INTO flyway_schema_history (version, description, type, script, checksum, installed_rank, success)
VALUES (0, '<< Flyway Baseline >>', 'BASELINE', '<< Flyway Baseline >>', NULL, 1, 1);
```

### Q4: Redis连接失败

**原因**: Redis服务未启动

**解决**:
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# 或直接启动
redis-server &

# 测试连接
redis-cli ping  # 应返回 PONG
```

---

## 🎯 下一步行动

### 立即执行

1. ✅ 生成强随机密钥
2. ✅ 创建管理员账号
3. ✅ 测试登录功能
4. ✅ 验证Flyway迁移

### 本周内

1. 📝 编写API文档
2. 🧪 添加单元测试
3. 🔍 代码审查
4. 📊 性能基准测试

### 下一阶段

参见: [docs/PHASE2_FEATURES_AND_TESTS.md](./docs/PHASE2_FEATURES_AND_TESTS.md)

---

## 📞 支持

**遇到问题?**

1. 查看详细文档: `docs/PHASE1_SECURITY_FIXES.md`
2. 查看完成报告: `docs/PHASE1_COMPLETION_REPORT.md`
3. 检查环境变量: `backend/.env.example`

**配置参考**:
- 后端环境变量: `backend/.env.example`
- 前端环境变量: `frontend/.env.example`
- 数据库Schema: `backend/src/main/resources/db/migration/V1__Initial_Schema.sql`

---

**祝开发顺利！** 🎉
