# DRMP开发指南 - Claude AI Assistant Context

## 项目概述

分散诉调平台（DRMP）是一个B2B的个贷不良资产处置平台，连接案源机构（银行、消金公司等）与处置机构（律所、调解中心等）。平台的核心价值在于通过智能匹配和流程优化，解决信息不对称问题，提升不良资产处置效率。

### 关键业务概念
- **案源机构**：提供不良资产案件的委托方（银行、消金公司、网贷公司等）
- **处置机构**：承接并处理不良资产案件的服务方（调解中心、律所等）
- **案件包**：案源机构批量发布的一组不良资产案件
- **智能分案**：根据地域、金额、账龄、业绩等因素自动匹配处置机构
- **智调系统（IDS）**：一线作业人员使用的处置工具，通过API与DRMP集成

## 技术架构决策

### 前端架构
```typescript
// 技术栈
- React 18 + TypeScript：提供类型安全和现代化开发体验
- Ant Design：企业级UI，快速构建专业界面
- Zustand：轻量级状态管理，避免Redux的复杂性
- React Router v6：声明式路由
```

### 后端架构
```java
// 技术栈
- Java 11 + Spring Boot 2.7.18：成熟稳定的企业级框架
- Spring Security + JWT：无状态认证方案
- Spring Data JPA + MySQL：关系型数据存储
- Redis：缓存、会话、分布式锁
- RBAC：细粒度权限控制
```

### 微服务划分建议
```yaml
services:
  user-service:        # 用户与机构管理
  case-service:        # 案件管理核心服务
  assignment-service:  # 智能分案引擎
  mediation-service:   # 调解处置服务
  litigation-service:  # 诉讼处置服务
  settlement-service:  # 对账结算服务
  notification-service: # 通知服务
  file-service:        # 文件存储服务
```

## 核心功能实现指南

### 1. 智能分案引擎
```java
// 分案策略接口
public interface AssignmentStrategy {
    List<DisposalOrg> match(CasePackage casePackage, List<DisposalOrg> orgs);
}

// 策略实现示例
@Component
public class RegionBasedStrategy implements AssignmentStrategy {
    // 按地域匹配
}

@Component
public class PerformanceBasedStrategy implements AssignmentStrategy {
    // 按历史业绩匹配
}

// 策略模式 + 责任链模式组合使用
```

### 2. 案件批量导入
```typescript
// 前端处理大文件上传
const handleBatchImport = async (file: File) => {
  // 1. 前端预校验（文件格式、大小）
  // 2. 分片上传（处理超大文件）
  // 3. 后端异步处理
  // 4. WebSocket实时反馈进度
};
```

### 3. 权限控制（RBAC）
```java
// 基于注解的权限控制
@PreAuthorize("hasRole('CASE_MANAGER') and #orgId == authentication.principal.orgId")
public CasePackage publishCasePackage(Long orgId, CasePackageDTO dto) {
    // 业务逻辑
}
```

### 4. 文件存储方案
```yaml
# 考虑到每个案件可能有100MB+的材料，年处理1000万案件
storage:
  type: "object-storage"  # 使用对象存储（OSS/COS）
  structure:
    - /orgs/{orgId}/cases/{caseId}/documents/
    - /orgs/{orgId}/cases/{caseId}/evidence/
  features:
    - 分片上传
    - CDN加速
    - 定期归档
```

## 数据库设计要点

### 核心表结构
```sql
-- 机构表
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY,
    type ENUM('SOURCE', 'DISPOSAL'),
    name VARCHAR(255),
    status ENUM('PENDING', 'ACTIVE', 'SUSPENDED'),
    -- 其他字段...
);

-- 案件表（考虑分表）
CREATE TABLE cases_{partition} (
    id BIGINT PRIMARY KEY,
    case_package_id BIGINT,
    debtor_id_card VARCHAR(18),  -- 加密存储
    loan_amount DECIMAL(15,2),
    remaining_amount DECIMAL(15,2),
    overdue_days INT,
    -- 100+个字段，考虑JSON存储非核心字段
);

-- 分案记录表
CREATE TABLE assignments (
    id BIGINT PRIMARY KEY,
    case_package_id BIGINT,
    source_org_id BIGINT,
    disposal_org_id BIGINT,
    strategy VARCHAR(50),
    assigned_at TIMESTAMP,
    -- 索引优化查询性能
);
```

### 性能优化建议
1. **分库分表**：按机构ID或时间维度分表
2. **读写分离**：主从复制，读多写少场景
3. **缓存策略**：Redis缓存热点数据
4. **索引优化**：针对高频查询建立复合索引

## API设计规范

### RESTful API示例
```typescript
// API路径设计
POST   /api/v1/organizations/register     // 机构注册
POST   /api/v1/case-packages              // 发布案件包
GET    /api/v1/case-packages/{id}         // 获取案件包详情
PUT    /api/v1/cases/{id}/status          // 更新案件状态
POST   /api/v1/assignments/auto           // 触发智能分案

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
```

### 错误处理
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException e) {
        return ApiResponse.error(e.getCode(), e.getMessage());
    }
}
```

## 安全考虑

### 数据安全
1. **敏感数据加密**：身份证、手机号等使用AES加密
2. **传输安全**：HTTPS + 请求签名
3. **SQL注入防护**：参数化查询，避免拼接SQL
4. **XSS防护**：输入验证，输出转义

### 认证授权
```java
// JWT配置
@Configuration
public class JwtConfig {
    // Access Token: 2小时
    // Refresh Token: 7天
    // 支持单点登录和设备管理
}
```

## 监控与日志

### 关键指标监控
```yaml
metrics:
  business:
    - 日活跃机构数
    - 案件处理量
    - 回款率
    - 平均处置周期
  technical:
    - API响应时间
    - 错误率
    - 数据库连接池
    - Redis命中率
```

### 日志规范
```java
// 使用MDC记录请求上下文
MDC.put("traceId", UUID.randomUUID().toString());
MDC.put("userId", SecurityUtils.getCurrentUserId());
log.info("案件包发布成功, packageId: {}, caseCount: {}", packageId, caseCount);
```

## 开发注意事项

### 代码组织
```
- Controller层：仅处理HTTP请求，参数验证
- Service层：业务逻辑，事务控制
- Repository层：数据访问，避免复杂查询
- 使用DTO/VO分离内外部数据模型
```

### 异步处理
```java
// 大批量操作使用异步处理
@Async
@Transactional
public CompletableFuture<BatchImportResult> importCases(MultipartFile file) {
    // 1. 文件解析
    // 2. 数据验证
    // 3. 批量插入
    // 4. 发送通知
}
```

### 测试策略
1. **单元测试**：Service层业务逻辑，覆盖率>80%
2. **集成测试**：API接口测试，MockMvc
3. **性能测试**：JMeter压测关键接口

## 部署架构

### 容器化部署
```yaml
# docker-compose.yml
services:
  nginx:
    # 负载均衡 + 静态资源
  app:
    # Spring Boot应用，多实例
  mysql:
    # 主从配置
  redis:
    # 哨兵模式
```

### 高可用方案
1. **应用层**：多实例 + 负载均衡
2. **数据库**：主从复制 + 读写分离
3. **缓存层**：Redis Sentinel
4. **文件存储**：对象存储 + CDN

## 版本迭代建议

### MVP功能清单
- [x] 机构注册与认证
- [x] 案件批量导入
- [x] 手动分案
- [x] 基础对账功能
- [x] 简单报表

### V1.0目标
- [ ] 智能分案引擎
- [ ] 在线签署协议
- [ ] 完整业绩看板
- [ ] API对接智调系统
- [ ] 法律文书生成

### 未来规划
- [ ] 债务人还款页面
- [ ] 机器人批量立案
- [ ] AI辅助决策
- [ ] 区块链存证

## 常见问题处理

### 性能瓶颈
1. **批量导入慢**：使用批量插入，考虑异步处理
2. **查询超时**：优化索引，考虑分页和缓存
3. **文件上传慢**：分片上传，断点续传

### 业务逻辑
1. **案件状态流转**：使用状态机模式管理
2. **并发分案**：分布式锁避免重复分配
3. **对账差异**：提供异议处理流程

## 与外部系统集成

### 智调系统（IDS）集成
```java
// API接口定义
@FeignClient(name = "ids-client")
public interface IdsClient {
    @PostMapping("/api/cases/sync")
    void syncCaseProgress(CaseProgressDTO progress);
}
```

### 支付系统集成
- 会员费支付
- 债务人还款（未来）

### 法院系统对接
- 批量立案接口
- 诉讼进度查询

## 开发工具推荐

### 后端开发
- IDE: IntelliJ IDEA
- API测试: Postman/Insomnia
- 数据库工具: DataGrip/Navicat

### 前端开发
- IDE: VS Code
- 调试工具: React DevTools
- 网络调试: Chrome DevTools

### 协作工具
- 代码管理: Git
- 项目管理: JIRA/禅道
- 文档: Confluence/语雀

## 联系与支持

开发过程中如有疑问，可以：
1. 查阅本文档和PRD
2. 查看代码中的注释和README
3. 联系项目负责人或架构师
4. 在项目群中讨论

记住：**代码是写给人看的，顺便能被机器执行**。保持代码清晰、文档完善，让项目可持续发展。