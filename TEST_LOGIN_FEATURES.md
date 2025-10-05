# 登录功能完整测试清单

## 测试环境准备

### 前置条件
- ✅ 后端服务已启动 (http://localhost:8080)
- ✅ 前端服务已启动 (http://localhost:3000)
- ✅ Redis已启动并可连接
- ✅ PostgreSQL数据库已初始化

### 测试账号
- 管理员账号: `admin` / `Admin@123456`
- 测试账号1: 需自行创建
- 测试账号2: 需自行创建

---

## 第一部分：基础登录功能测试

### 1.1 正常登录流程 ✅

**测试步骤：**
1. 打开登录页面 http://localhost:3000/login
2. 输入用户名 `admin`
3. 输入密码 `Admin@123456`
4. 不勾选"记住我"
5. 点击"登录"按钮

**预期结果：**
- ✅ 登录成功，跳转到Dashboard
- ✅ 控制台显示JWT Token
- ✅ LocalStorage中存储了accessToken和refreshToken
- ✅ RefreshToken有效期为7天

**验证命令：**
```javascript
// 在浏览器控制台执行
console.log('Access Token:', localStorage.getItem('drmp-auth-storage'));
```

---

### 1.2 记住我功能测试 ✅

**测试步骤：**
1. 登出当前账号
2. 重新打开登录页面
3. 输入用户名和密码
4. **勾选"记住我（保持登录30天）"**
5. 点击登录

**预期结果：**
- ✅ 登录成功
- ✅ RefreshToken有效期为30天（可通过JWT解码验证）

**验证JWT Token过期时间：**
```javascript
// 解析JWT Token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

// 获取并解析refresh token
const authStore = JSON.parse(localStorage.getItem('drmp-auth-storage'));
const payload = parseJwt(authStore.state.refreshToken);
const expiresAt = new Date(payload.exp * 1000);
console.log('Refresh Token expires at:', expiresAt);
console.log('Days until expiration:', (expiresAt - new Date()) / (1000 * 60 * 60 * 24));
```

---

### 1.3 登录失败处理测试 ✅

**测试步骤：**
1. 输入正确用户名，错误密码
2. 连续尝试5次

**预期结果：**
- ✅ 前4次显示"用户名或密码错误"
- ✅ 第5次后账户被锁定30分钟
- ✅ 显示"账户已被锁定，请稍后再试"

---

## 第二部分：Token自动刷新测试

### 2.1 Token主动刷新机制测试 ⏰

**测试步骤：**
1. 登录系统
2. 打开浏览器控制台
3. 等待1-2分钟观察控制台输出

**预期结果：**
- ✅ 每60秒检查一次Token过期时间
- ✅ 如果Token即将在5分钟内过期，自动刷新
- ✅ 控制台显示："🔄 Token即将过期，主动刷新..."
- ✅ 刷新成功后显示："✅ Token刷新成功"

**模拟测试（可选）：**
修改`api.ts`中的检查时间间隔为10秒，观察效果：
```typescript
// 临时修改用于测试
setInterval(() => {
  // ...检查逻辑
}, 10 * 1000); // 10秒检查一次
```

---

### 2.2 401错误被动刷新测试 ✅

**测试步骤：**
1. 登录系统
2. 手动修改LocalStorage中的accessToken为无效值
3. 刷新页面或执行任意API请求

**预期结果：**
- ✅ 系统检测到401错误
- ✅ 自动使用refreshToken刷新accessToken
- ✅ 刷新成功后重试原始请求
- ✅ 用户无感知，操作继续

**模拟操作：**
```javascript
// 在控制台执行
const authStore = JSON.parse(localStorage.getItem('drmp-auth-storage'));
authStore.state.accessToken = 'invalid_token';
localStorage.setItem('drmp-auth-storage', JSON.stringify(authStore));
// 然后刷新页面
```

---

### 2.3 刷新失败防死循环测试 ✅

**测试步骤：**
1. 登录系统
2. 同时修改accessToken和refreshToken为无效值
3. 刷新页面

**预期结果：**
- ✅ 尝试刷新Token失败
- ✅ 最多重试1次
- ✅ 控制台显示："❌ Token刷新失败次数过多，强制登出"
- ✅ 自动跳转到登录页
- ✅ 显示提示："登录已过期，请重新登录"

---

## 第三部分：会话管理测试

### 3.1 会话持久化测试（Redis） 🔄

**测试步骤：**
1. 确保Redis正在运行
2. 登录系统，记录当前会话
3. 重启后端应用
4. 刷新前端页面

**预期结果：**
- ✅ 应用重启后会话仍然有效
- ✅ 不需要重新登录
- ✅ 可以正常访问受保护的API

**Redis验证命令：**
```bash
# 连接Redis
redis-cli

# 查看所有会话
KEYS session:*

# 查看用户会话列表
KEYS user:sessions:*

# 查看Token黑名单
KEYS blacklist:*

# 查看某个会话详情
GET session:{sessionId}
```

---

### 3.2 多设备会话管理测试 📱

**测试步骤：**
1. 在Chrome浏览器登录
2. 在Firefox浏览器（或隐私模式）登录同一账号
3. 访问会话管理页面

**预期结果：**
- ✅ 显示2个活跃会话
- ✅ 每个会话显示：浏览器类型、操作系统、IP地址、登录时间、最后活跃时间
- ✅ 当前会话标记为"当前会话"
- ✅ 其他会话可以远程登出

**会话管理页面访问：**
- 路径需要根据实际路由配置添加到菜单中

---

### 3.3 远程登出功能测试 🚪

**测试步骤：**
1. 在浏览器A登录
2. 在浏览器B登录同一账号
3. 在浏览器A的会话管理页面，登出浏览器B的会话

**预期结果：**
- ✅ 浏览器A显示"会话已登出"
- ✅ 浏览器B的下一次API请求返回401
- ✅ 浏览器B自动跳转到登录页

---

### 3.4 登出所有会话测试 🔒

**测试步骤：**
1. 在3个不同浏览器/设备登录
2. 在其中一个浏览器点击"登出所有其他会话"

**预期结果：**
- ✅ 其他2个浏览器被强制登出
- ✅ 当前浏览器会话保持有效
- ✅ 会话列表只显示当前会话

---

## 第四部分：安全性测试

### 4.1 并发会话限制测试 🔢

**测试步骤：**
1. 在4个不同浏览器依次登录同一账号
2. 检查会话管理页面

**预期结果：**
- ✅ 最多只有3个活跃会话
- ✅ 第4次登录时，最老的会话被自动登出
- ✅ 控制台显示："Removed oldest session for user X due to session limit"

---

### 4.2 Token黑名单测试 🚫

**测试步骤：**
1. 登录系统，复制当前的accessToken
2. 登出
3. 尝试使用复制的Token访问API

**预期结果：**
- ✅ API返回401 Unauthorized
- ✅ Token已加入黑名单，无法使用

**验证命令：**
```bash
# Redis中验证
redis-cli
KEYS blacklist:*
```

---

### 4.3 登录活动日志测试 📝

**测试步骤：**
1. 执行多次登录、登出操作
2. 查看数据库`login_activity_logs`表

**预期结果：**
- ✅ 记录所有LOGIN_SUCCESS事件
- ✅ 记录所有LOGIN_FAILED事件
- ✅ 记录所有LOGOUT事件
- ✅ 包含IP地址、User Agent、时间戳等信息

**SQL查询：**
```sql
-- 查看最近的登录活动
SELECT * FROM login_activity_logs
ORDER BY created_at DESC
LIMIT 20;

-- 查看失败登录记录
SELECT * FROM login_activity_logs
WHERE activity_type = 'LOGIN_FAILED'
ORDER BY created_at DESC;

-- 统计某用户的登录次数
SELECT activity_type, COUNT(*)
FROM login_activity_logs
WHERE user_id = 1
GROUP BY activity_type;
```

---

## 第五部分：定时任务测试

### 5.1 过期会话清理测试 🧹

**测试步骤：**
1. 登录系统
2. 等待30分钟无活动
3. 查看后端日志

**预期结果：**
- ✅ 定时任务每30分钟执行一次
- ✅ 清理超过30分钟无活动的会话
- ✅ 日志显示："Expired sessions cleanup completed"

**日志验证：**
```bash
# 查看后端日志
tail -f logs/drmp.log | grep "cleanup"
```

---

### 5.2 登录日志清理测试 📅

**测试步骤：**
1. 修改系统时间为未来（或等待实际时间）
2. 观察日志清理任务执行

**预期结果：**
- ✅ 每天凌晨2点执行清理
- ✅ 删除90天前的登录日志
- ✅ 日志显示："Old login activity logs cleanup completed"

---

## 第六部分：用户体验测试

### 6.1 页面刷新测试 🔄

**测试步骤：**
1. 登录系统
2. 在任意页面按F5刷新
3. 多次刷新

**预期结果：**
- ✅ 页面刷新后仍保持登录状态
- ✅ 不需要重新登录
- ✅ 数据正常加载

---

### 6.2 长时间在线测试 ⏰

**测试步骤：**
1. 勾选"记住我"登录
2. 保持浏览器打开2小时以上
3. 定期操作系统

**预期结果：**
- ✅ Token自动刷新，无需重新登录
- ✅ 控制台定期显示刷新提示
- ✅ 用户体验流畅，无中断

---

### 6.3 跨标签页测试 🪟

**测试步骤：**
1. 在标签页A登录
2. 在标签页B打开同一应用
3. 在标签页A登出

**预期结果：**
- ✅ 标签页B检测到登出状态
- ✅ 标签页B自动跳转到登录页
- ✅ LocalStorage同步

---

## 第七部分：性能测试

### 7.1 并发登录测试 🚀

**测试工具：** JMeter 或 Apache Bench

**测试步骤：**
1. 使用JMeter配置100个并发用户登录
2. 观察系统响应时间和错误率

**预期结果：**
- ✅ 平均响应时间 < 500ms
- ✅ 错误率 < 1%
- ✅ Redis连接稳定

**JMeter配置示例：**
```
Thread Group:
- Number of Threads: 100
- Ramp-up Period: 10
- Loop Count: 10

HTTP Request:
- Method: POST
- Path: /api/v1/auth/login
- Body: {"username":"admin","password":"Admin@123456"}
```

---

## 测试报告模板

### 测试执行情况

| 测试类别 | 通过 | 失败 | 跳过 | 备注 |
|---------|------|------|------|------|
| 基础登录功能 | _ / 3 | _ | _ | |
| Token自动刷新 | _ / 3 | _ | _ | |
| 会话管理 | _ / 4 | _ | _ | |
| 安全性测试 | _ / 3 | _ | _ | |
| 定时任务 | _ / 2 | _ | _ | |
| 用户体验 | _ / 3 | _ | _ | |
| 性能测试 | _ / 1 | _ | _ | |
| **总计** | **_ / 19** | **_** | **_** | |

### 问题记录

| 序号 | 问题描述 | 严重程度 | 状态 | 备注 |
|-----|---------|---------|------|------|
| 1 | | | | |
| 2 | | | | |

### 测试结论

- [ ] ✅ 所有核心功能正常
- [ ] ⚠️ 部分功能需要优化
- [ ] ❌ 存在严重问题，需要修复

---

## 快速验证脚本

### 后端健康检查
```bash
# 检查后端服务
curl http://localhost:8080/api/actuator/health

# 检查Redis连接
redis-cli ping

# 查看活跃会话数
redis-cli KEYS "session:*" | wc -l
```

### 前端健康检查
```javascript
// 在浏览器控制台执行

// 1. 检查认证状态
const authStore = JSON.parse(localStorage.getItem('drmp-auth-storage'));
console.log('已登录:', authStore?.state?.isAuthenticated);
console.log('用户:', authStore?.state?.user);

// 2. 检查Token
console.log('Access Token存在:', !!authStore?.state?.accessToken);
console.log('Refresh Token存在:', !!authStore?.state?.refreshToken);

// 3. 测试API调用
fetch('/api/v1/auth/current-user', {
  headers: {
    'Authorization': `Bearer ${authStore?.state?.accessToken}`
  }
})
.then(r => r.json())
.then(console.log);
```

---

## 常见问题排查

### 问题1: Token刷新失败
**排查步骤：**
1. 检查Redis是否运行: `redis-cli ping`
2. 查看后端日志: `tail -f logs/drmp.log`
3. 验证RefreshToken是否过期
4. 检查`jwt.refresh-expiration`配置

### 问题2: 会话丢失
**排查步骤：**
1. 检查Redis持久化配置
2. 验证`sessionTimeout`配置
3. 查看定时任务日志
4. 检查Redis内存是否充足

### 问题3: 多设备登录失败
**排查步骤：**
1. 检查`maxConcurrentSessions`配置
2. 查看Redis中的会话数量
3. 验证会话限制逻辑
4. 检查Token黑名单

---

## 附录：环境变量配置

### 后端环境变量
```bash
# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7200000          # 2小时
JWT_REFRESH_EXPIRATION=604800000 # 7天
JWT_REMEMBER_ME_EXPIRATION=2592000000 # 30天

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
```

### 前端环境变量
```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

---

**测试负责人：** _____________
**测试日期：** _____________
**版本号：** v1.0.0
