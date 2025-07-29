# DRMP平台快速开始指南

## 项目概述

DRMP（分散诉调平台）是一个连接个贷不良资产案源机构和处置机构的智能化平台。本指南将帮助您快速启动和运行平台。

## 系统要求

### 开发环境
- **Java**: JDK 11+
- **Node.js**: 16+
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **Maven**: 3.6+

### 生产环境（Docker）
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

## 快速启动（Docker方式）

### 1. 克隆项目
```bash
git clone <repository-url>
cd DRMP
```

### 2. 构建项目
```bash
# 运行构建脚本
./scripts/build.sh
```

### 3. 启动服务
```bash
# 运行启动脚本
./scripts/start.sh
```

### 4. 访问应用
- **前端**: http://localhost:3000
- **后端API**: http://localhost:8080/api
- **API文档**: http://localhost:8080/api/swagger-ui.html

### 5. 默认账号
- **用户名**: admin
- **密码**: Admin@123456

## 本地开发环境

### 后端开发

1. **配置数据库**
```sql
CREATE DATABASE drmp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **修改配置**
编辑 `backend/src/main/resources/application.yml`，配置数据库连接信息。

3. **启动后端**
```bash
cd backend
./mvnw spring-boot:run
```

### 前端开发

1. **安装依赖**
```bash
cd frontend
npm install
```

2. **配置环境变量**
```bash
# 创建 .env.local 文件
echo "REACT_APP_API_BASE_URL=http://localhost:8080/api" > .env.local
```

3. **启动前端**
```bash
npm start
```

## 项目结构

```
DRMP/
├── backend/                    # Spring Boot后端
│   ├── src/main/java/com/drmp/
│   │   ├── config/            # 配置类
│   │   ├── controller/        # REST控制器
│   │   ├── entity/            # JPA实体
│   │   ├── repository/        # 数据访问层
│   │   ├── service/           # 业务逻辑层
│   │   ├── security/          # 安全相关
│   │   └── dto/               # 数据传输对象
│   ├── src/main/resources/
│   │   ├── application.yml    # 主配置文件
│   │   └── db/migration/      # 数据库迁移脚本
│   └── pom.xml                # Maven配置
├── frontend/                   # React前端
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── store/             # 状态管理
│   │   └── utils/             # 工具函数
│   ├── public/                # 静态资源
│   └── package.json           # npm配置
├── docker-compose.yml          # Docker编排文件
├── scripts/                    # 构建脚本
└── docs/                       # 文档
```

## 核心功能

### 1. 机构管理
- 案源机构注册与认证
- 处置机构入驻与审核
- 机构信息管理

### 2. 案件管理
- 案件包批量导入
- 智能分案引擎
- 案件流转管理

### 3. 权限管理
- 基于角色的访问控制（RBAC）
- 多层级权限体系
- 细粒度功能权限

### 4. 数据分析
- 实时业绩看板
- 多维度数据分析
- 自定义报表

## 开发指南

### 后端开发规范

1. **代码规范**
   - 遵循阿里巴巴Java开发手册
   - 使用Lombok减少样板代码
   - 统一异常处理

2. **API设计**
   - RESTful API设计
   - 统一响应格式
   - OpenAPI文档

3. **数据库设计**
   - 分库分表策略
   - 索引优化
   - 敏感数据加密

### 前端开发规范

1. **技术栈**
   - React 18 + TypeScript
   - Ant Design UI库
   - Zustand状态管理

2. **代码规范**
   - ESLint + Prettier
   - 组件化开发
   - 类型安全

## 常用命令

### Docker操作
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止所有服务
docker-compose stop

# 删除所有容器和数据
docker-compose down -v
```

### 开发操作
```bash
# 后端
cd backend
./mvnw clean compile      # 编译
./mvnw test               # 运行测试
./mvnw spring-boot:run    # 启动应用

# 前端
cd frontend
npm start                 # 开发模式
npm run build            # 构建生产版本
npm test                 # 运行测试
npm run lint             # 代码检查
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 验证连接配置是否正确
   - 确认数据库是否已创建

2. **前端无法访问后端API**
   - 检查后端服务是否启动
   - 验证CORS配置
   - 查看网络代理设置

3. **Docker容器启动失败**
   - 检查端口是否被占用
   - 查看容器日志获取详细错误信息
   - 确认Docker资源是否充足

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看数据库日志
docker-compose logs -f mysql

# 查看Redis日志
docker-compose logs -f redis
```

## 性能优化

### 后端优化
- 数据库连接池调优
- JVM参数调优
- 缓存策略优化

### 前端优化
- 代码分割
- 懒加载
- 资源压缩

## 安全考虑

- JWT令牌安全
- SQL注入防护
- XSS攻击防护
- 敏感数据加密
- HTTPS配置

## 部署指南

### 生产环境部署
1. 配置环境变量
2. 设置数据库连接
3. 配置HTTPS
4. 启用监控
5. 备份策略

### 监控和维护
- 日志监控
- 性能监控
- 健康检查
- 自动备份

## 联系支持

如有问题，请联系开发团队：
- 邮箱: dev@drmp.com
- 技术支持: support@drmp.com

## 许可证

本项目采用商业许可证，详情请联系项目负责人。