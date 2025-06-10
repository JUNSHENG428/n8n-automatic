# n8n工作流生成器优化指南

## 概述

本系统已经过深度优化，整合了n8n的最佳实践、高级特性和完整的用户准备指南功能。

## 核心优化内容

### 1. Prompt模板优化

#### 系统Prompt优化
- **完整的n8n规范**：包含所有节点命名规范、JSON结构要求
- **高级特性支持**：表达式语法、错误处理、认证凭据
- **最佳实践指导**：性能优化、安全性、可维护性建议
- **调试技巧**：包含常见问题的解决方案

#### 用户Prompt优化
- **智能需求分析**：自动识别触发方式、操作类型、服务集成
- **结构化生成**：将用户需求转换为结构化的工作流要求
- **上下文增强**：添加必要的技术细节和实现建议

### 2. 用户准备指南

系统会根据用户需求自动生成详细的准备指南，包括：

#### 凭据准备
- **服务类型**：OAuth2、API Key、数据库连接等
- **获取步骤**：详细的步骤说明
- **必需字段**：列出所有必需的配置项

#### 参数准备
- **参数名称**：需要准备的参数
- **描述说明**：参数用途和格式要求
- **示例值**：提供参考示例

#### 数据源要求
- **数据类型**：文件、数据库、API等
- **格式要求**：CSV、JSON、XML等
- **准备建议**：数据清洗、格式化建议

#### 通用准备事项
- API启用状态检查
- 测试数据准备
- 速率限制了解
- 错误通知渠道设置

## 支持的高级特性

### 1. 表达式系统
```javascript
// 基础语法
{{ $json.fieldName }}

// 访问前置节点
{{ $node["NodeName"].json.data }}

// 条件表达式
{{ $json.status === 'active' ? '激活' : '未激活' }}

// 日期处理
{{ DateTime.now().toFormat('yyyy-MM-dd') }}

// JMESPath查询
{{ $jmespath($json, "items[?price > 100].name") }}
```

### 2. 错误处理
- **错误工作流**：自动创建错误处理分支
- **节点级配置**：
  - `continueOnFail: true` - 失败继续执行
  - `retryOnFail: true` - 自动重试
  - `maxTries: 3` - 最大重试次数
  - `waitBetweenTries: 1000` - 重试间隔

### 3. 认证类型
- Header Auth (API密钥在请求头)
- Query Auth (API密钥在查询参数)
- Basic Auth (用户名密码)
- Bearer Token
- OAuth2 (多种流程支持)
- Custom Auth (自定义JSON)

## 支持的节点类型

### 触发器节点 (Triggers)
- `n8n-nodes-base.manualTrigger` - 手动触发
- `n8n-nodes-base.scheduleTrigger` - 定时触发
- `n8n-nodes-base.webhook` - Webhook触发
- `n8n-nodes-base.emailReadImap` - 邮件触发
- `n8n-nodes-base.errorTrigger` - 错误触发

### 操作节点 (Actions)
- `n8n-nodes-base.httpRequest` - HTTP请求 (v4.2)
- `n8n-nodes-base.postgres` - PostgreSQL (v2.4)
- `n8n-nodes-base.mysql` - MySQL (v2)
- `n8n-nodes-base.emailSend` - 发送邮件 (v2.1)
- `n8n-nodes-base.slack` - Slack (v2.2)

### 数据处理节点
- `n8n-nodes-base.set` - 设置数据 (v3.4)
- `n8n-nodes-base.code` - 代码节点 (v2)
- `n8n-nodes-base.if` - 条件判断 (v2.1)
- `n8n-nodes-base.merge` - 合并数据 (v3)
- `n8n-nodes-base.filter` - 过滤数据 (v2)

## 使用示例

### 1. 基础数据同步
```
需求：每天早上9点从MySQL数据库读取订单数据，同步到PostgreSQL
```

系统将生成：
- Schedule Trigger节点（Cron: 0 9 * * *）
- MySQL节点（查询订单数据）
- Set节点（数据转换）
- PostgreSQL节点（插入数据）
- Error Trigger工作流（错误通知）

### 2. API数据处理
```
需求：接收Webhook数据，调用外部API验证，将结果存储到数据库
```

系统将生成：
- Webhook节点（接收POST请求）
- HTTP Request节点（API验证）
- If节点（条件判断）
- PostgreSQL节点（存储结果）
- Respond to Webhook节点（返回响应）

## 最佳实践建议

### 1. 性能优化
- 使用批处理减少API调用次数
- 并行执行独立的任务
- 缓存频繁使用的数据
- 限制循环迭代次数

### 2. 安全性
- 不在工作流中硬编码密钥
- 使用n8n凭据管理系统
- 验证所有外部输入
- 限制执行权限

### 3. 可维护性
- 使用清晰的节点命名
- 添加Sticky Note说明
- 模块化复杂逻辑
- 使用子工作流

## 常见问题解决

### 1. 表达式错误
- **问题**：`Can't get data for expression`
- **解决**：确保前置节点已执行，使用`$("<node-name>").isExecuted`检查

### 2. JSON格式错误
- **问题**：`The 'JSON Output' contains invalid JSON`
- **解决**：验证JSON格式，检查未定义的字段引用

### 3. 认证失败
- **问题**：API调用返回401/403
- **解决**：检查凭据配置，确认权限范围

## 总结

通过深度优化，本系统能够：
1. 生成100%符合n8n规范的工作流
2. 自动识别用户需求并优化实现方案
3. 提供完整的用户准备指南
4. 包含错误处理和性能优化
5. 支持所有n8n高级特性

用户只需描述需求，系统将自动处理所有技术细节，生成可直接使用的专业工作流。 