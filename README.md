# 分散诉调平台 (DRMP)

## 项目简介

分散诉调平台（Dispute Resolution & Mediation Platform - DRMP）是一个连接个贷不良资产案源机构和处置机构的智能化平台。平台旨在解决当前个贷不良资产处置领域的信息不对称和匹配效率低下问题，通过提供智能匹配、高效协同和数据赋能的服务，显著提升不良资产处置效率。

### 核心价值
- **高效匹配**：通过智能分案引擎，实现案源机构与处置机构的精准、快速匹配
- **流程优化**：提供案件全生命周期管理，实现线上化、标准化处理
- **数据赋能**：提供多维度数据分析报告和实时看板，辅助业务决策
- **成本节约**：通过提升效率和优化匹配，有效降低不良资产处置的综合成本

### 目标用户
- **案源机构**：银行、消费金融公司、网络贷款公司、助贷公司、小额贷款公司、资产管理公司（AMC）等
- **处置机构**：调解中心、律师事务所及其他专业处置机构

## 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript超集
- **Ant Design** - 企业级UI组件库
- **React Router** - 前端路由管理
- **Zustand** - 轻量级状态管理

### 后端技术
- **Java 11** - 企业级开发语言
- **Spring Boot 2.7.18** - 微服务框架
- **Spring Security** - 安全认证框架
- **Spring Data JPA** - 数据访问层
- **MySQL** - 关系型数据库
- **Redis** - 缓存和会话管理
- **JWT** - 身份认证机制
- **RBAC** - 基于角色的访问控制

### 构建工具
- **Maven** - Java项目管理工具
- **npm/yarn** - 前端包管理工具

## 系统架构

本平台采用"平台+工具"的双核心系统架构：

### 分散诉调平台 (DRMP)
- **定位**：管理与协同中枢
- **用户**：案源机构管理人员、处置机构管理人员、平台运营人员
- **功能**：机构入驻、案件包发布与流转、智能分案匹配、进度监控、对账结算、数据分析

### 智调系统 (IDS)
- **定位**：执行与作业工具
- **用户**：处置机构的调解员、律师、催收员等一线作业人员
- **功能**：具体案件处置工具、电话/短信/函件、法律文书生成、失联修复、机器人立案
- **集成**：通过API与DRMP进行深度数据集成

## 核心功能模块

### 1. 机构管理
- 机构入驻与认证
- 权限管理（RBAC）
- 会员费管理

### 2. 案件中心
- 案件包批量导入（支持Excel/CSV）
- 智能分案引擎
- 案件市场
- 案件流转管理

### 3. 进度与协同
- 案件详情与督办
- 沟通与对账
- 债务人互动接口（远期规划）

### 4. 数据与报表
- 业绩看板（案源方视角）
- 效能看板（处置方视角）
- 平台运营看板

### 5. 增值服务
- 数据分析报告
- 法律工具服务

## 快速开始

### 环境要求
- JDK 11+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 后端启动

1. 克隆项目
```bash
git clone https://github.com/your-org/drmp.git
cd drmp
```

2. 配置数据库
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE drmp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 修改配置文件
```bash
# 编辑 backend/src/main/resources/application.yml
# 配置数据库连接、Redis连接等
```

4. 构建并启动后端服务
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 前端启动

1. 安装依赖
```bash
cd frontend
npm install
# 或
yarn install
```

2. 配置环境变量
```bash
# 创建 .env.local 文件
cp .env.example .env.local
# 编辑 .env.local，配置后端API地址
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 访问应用
```
http://localhost:3000
```

## 项目结构

```
drmp/
├── backend/                # 后端服务
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/drmp/
│   │   │   │       ├── controller/     # REST控制器
│   │   │   │       ├── service/        # 业务逻辑
│   │   │   │       ├── repository/     # 数据访问
│   │   │   │       ├── entity/         # 实体类
│   │   │   │       ├── dto/            # 数据传输对象
│   │   │   │       ├── config/         # 配置类
│   │   │   │       ├── security/       # 安全相关
│   │   │   │       └── utils/          # 工具类
│   │   │   └── resources/
│   │   │       ├── application.yml     # 主配置文件
│   │   │       └── db/migration/       # 数据库迁移脚本
│   │   └── test/
│   └── pom.xml
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── store/          # 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── App.tsx         # 应用入口
│   ├── public/
│   └── package.json
├── docs/                   # 文档
├── scripts/                # 脚本
├── docker-compose.yml      # Docker编排
└── README.md
```

## API文档

后端服务启动后，可以通过以下地址访问API文档：
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Docs: `http://localhost:8080/api-docs`

## 开发指南

### 代码规范
- 后端遵循阿里巴巴Java开发手册
- 前端遵循Airbnb JavaScript Style Guide
- 使用ESLint和Prettier进行代码格式化

### 分支管理
- `main` - 主分支，保持稳定
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

### 提交规范
使用约定式提交（Conventional Commits）：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 部署

### Docker部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 生产环境配置
- 使用环境变量管理敏感配置
- 配置HTTPS
- 设置适当的CORS策略
- 启用生产级别的日志和监控

## 性能要求
- 支持10万+用户同时在线
- 年处理案件量超过1000万件
- 单次批量导入10万案件应在数分钟内完成
- 支持每个案件超过100MB的图文材料存储

## 安全要求
- 所有敏感数据加密传输和存储
- 实施RBAC权限控制
- JWT身份认证
- 防SQL注入、XSS、CSRF等攻击
- 完整的操作日志审计

## 许可证

本项目采用商业许可证，详情请联系项目负责人。

## 联系方式

- 项目负责人：[姓名]
- 邮箱：[email]
- 技术支持：[support email]

## 更新日志

### v1.0.0 (计划中)
- 核心功能实现
- 智能分案引擎
- 在线签署委托协议
- 完善的业绩看板
- 法律文书批量生成工具

### MVP版本 (当前开发中)
- 机构入驻与认证
- 案件包发布与接收
- 基础业绩看板
- 手动分案功能