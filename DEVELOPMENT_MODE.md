# DRMP 开发模式说明

## 🚀 自动登录功能

为了方便开发调试，DRMP平台在开发模式下已配置自动登录功能，无需手动输入账号密码即可直接进入管理页面。

## 🔧 配置说明

### 当前设置
- **开发模式**: 自动启用 (`NODE_ENV === 'development'`)
- **跳过登录**: 已启用 (`SKIP_LOGIN_IN_DEV = true`)
- **默认用户**: 系统管理员 (admin)

### 模拟用户信息
```javascript
{
  id: 1,
  username: 'admin',
  email: 'admin@drmp.com',
  realName: '系统管理员',
  phone: '13800000000',
  organizationId: 1,
  organizationName: 'DRMP系统管理',
  organizationType: 'SYSTEM',
  roles: ['ADMIN'],
  permissions: [
    // 用户管理权限
    'user:read', 'user:create', 'user:update', 'user:delete',
    // 机构管理权限
    'organization:read', 'organization:create', 'organization:update', 'organization:delete', 'organization:approve',
    // 案件包管理权限
    'case_package:read', 'case_package:create', 'case_package:update', 'case_package:delete', 'case_package:assign',
    // 案件管理权限
    'case:read', 'case:update',
    // 报表权限
    'report:read', 'report:export',
    // 系统管理权限
    'system:config', 'system:log'
  ]
}
```

## 🎯 使用方法

### 1. 自动登录模式 (当前)
- 直接访问: http://localhost:3000
- 系统自动跳转到: http://localhost:3000/dashboard
- 无需输入账号密码，自动以管理员身份登录

### 2. 恢复正常登录
如需测试登录功能，修改 `frontend/src/App.tsx` 中的配置：
```javascript
const SKIP_LOGIN_IN_DEV = false; // 改为 false
```

### 3. 生产模式
生产环境部署时会自动禁用此功能，恢复正常的登录验证流程。

## 📁 可访问的管理页面

以下页面在开发模式下可直接访问：

- **工作台**: http://localhost:3000/dashboard
- **机构管理**: http://localhost:3000/organizations
- **案件包管理**: http://localhost:3000/case-packages
- **案件管理**: http://localhost:3000/cases
- **数据报表**: http://localhost:3000/reports

## 🔍 调试信息

开发模式启用时，浏览器控制台会显示：
```
🚀 开发模式: 已自动登录为系统管理员
```

## ⚠️ 注意事项

1. **仅限开发环境**: 此功能仅在 `NODE_ENV=development` 时生效
2. **生产环境安全**: 生产部署时会自动禁用，确保安全性
3. **权限测试**: 当前用户拥有所有权限，便于功能开发和测试
4. **数据持久化**: 登录状态会保存在浏览器本地存储中

## 🛠️ 相关文件

- `frontend/src/App.tsx` - 主要配置文件
- `frontend/src/store/authStore.ts` - 认证状态管理
- `frontend/src/components/layout/Layout.tsx` - 布局组件

## 📝 开发建议

1. 开发新功能时可直接访问对应页面进行测试
2. 需要测试权限控制时，可临时修改模拟用户的权限列表
3. API接口开发时，后端也建议配置开发模式跳过JWT验证
4. 完成功能开发后，记得测试完整的登录流程