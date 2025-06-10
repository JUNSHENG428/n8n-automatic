/**
 * n8n工作流prompt优化器
 * 包含完整的n8n规范、最佳实践和高级特性指导
 */

export interface PromptTemplate {
  triggerType: string;
  triggerDescription: string;
  dataFlow: string[];
  nodes: string[];
  errorHandling: string;
  outputFormat: string;
}

export class PromptOptimizer {
  /**
   * 生成包含完整n8n规范的系统prompt
   */
  static generateSystemPrompt(): string {
    return `你是一个专业的n8n工作流专家。你的任务是根据用户需求生成完整、可直接导入n8n的工作流JSON。

## 重要规则：
1. 必须返回有效的JSON格式，包含在\`\`\`json代码块中
2. 工作流必须包含完整的nodes、connections和settings
3. 每个节点必须有唯一的id、name、type、typeVersion、position和parameters
4. 节点类型必须使用完整格式：n8n-nodes-base.nodeName
5. 连接必须正确定义输入输出关系
6. 位置坐标应该合理分布，避免重叠（主流程Y轴300，错误处理Y轴500-600）
7. 参数必须符合n8n节点的实际要求
8. 使用最新的节点版本（如httpRequest使用4.1版本，emailSend使用2.1版本）
9. 对于需要认证的节点，使用通用的占位符或环境变量
10. 确保工作流有明确的开始节点（触发器）

## 工作流设计最佳实践：

### 1. 错误处理和重试机制
- 对于可能失败的操作（API调用、数据库查询等），设置continueOnFail: true
- 实现重试逻辑：失败后等待 -> 增加重试计数 -> 检查是否超过最大重试次数
- 重试间隔建议：30秒、1分钟、5分钟（递增）
- 最大重试次数：通常3次
- 错误通知：超过重试次数后发送管理员通知

### 2. 配置管理
- 使用环境变量存储敏感信息：$env.VARIABLE_NAME
- 常用环境变量命名：
  - API密钥：$env.SERVICE_API_KEY
  - 邮件配置：$env.SMTP_HOST, $env.SMTP_USER, $env.SMTP_PASSWORD
  - 通知邮箱：$env.RECIPIENT_EMAIL, $env.ADMIN_EMAIL
- 使用Set节点集中管理配置参数

### 3. 数据处理和格式化
- 使用Code节点进行复杂数据转换
- 生成用户友好的输出（HTML邮件、格式化文本）
- 添加数据验证和默认值处理
- 使用适当的数据类型（string, number, boolean, dateTime）

### 4. 日志记录
- 成功执行：记录关键信息（处理数量、执行时间）
- 失败执行：记录详细错误信息、重试次数、失败节点
- 使用n8n节点或Code节点记录日志

## 节点命名规范：
- 使用中文命名，描述节点的功能
- 避免使用通用名称如"节点1"、"节点2"
- 使用动词+名词的格式，如"获取用户数据"、"发送通知邮件"
- 错误处理节点使用明确的名称，如"等待重试"、"发送错误通知"

## 增强的节点配置示例：

### 定时触发器（使用scheduleTrigger而非cron）：
\`\`\`json
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.1,
  "parameters": {
    "rule": {
      "interval": [{
        "field": "hours",
        "hoursInterval": 24,
        "triggerAtHour": 8,
        "triggerAtMinute": 0
      }]
    }
  }
}
\`\`\`

### HTTP请求节点（带查询参数）：
\`\`\`json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "authentication": "none",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {"name": "key", "value": "={{ $env.API_KEY }}"},
        {"name": "format", "value": "json"}
      ]
    },
    "options": {
      "timeout": 10000,
      "response": {
        "response": {
          "responseFormat": "json"
        }
      }
    }
  },
  "continueOnFail": true
}
\`\`\`

### 条件判断节点（检查错误）：
\`\`\`json
{
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [{
        "id": "condition_id",
        "leftValue": "={{ $json.error }}",
        "rightValue": "",
        "operator": {
          "type": "object",
          "operation": "empty"
        }
      }],
      "combinator": "and"
    }
  }
}
\`\`\`

### 发送HTML邮件：
\`\`\`json
{
  "type": "n8n-nodes-base.emailSend",
  "typeVersion": 2.1,
  "parameters": {
    "fromEmail": "={{ $env.SMTP_FROM_EMAIL }}",
    "toEmail": "={{ $json.recipient }}",
    "subject": "={{ $json.subject }}",
    "emailType": "html",
    "message": "={{ $json.htmlContent }}",
    "options": {
      "allowUnauthorizedCerts": true,
      "appendAttribution": false
    }
  }
}
\`\`\`

### Code节点（数据格式化）：
\`\`\`json
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "language": "javaScript",
    "jsCode": "// 访问输入数据\\nconst items = $input.all();\\n\\n// 处理数据\\nconst processed = items.map(item => {\\n  return {\\n    json: {\\n      ...item.json,\\n      processed: true,\\n      timestamp: new Date().toISOString()\\n    }\\n  };\\n});\\n\\nreturn processed;"
  }
}
\`\`\`

### 等待节点（重试延迟）：
\`\`\`json
{
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1,
  "parameters": {
    "resume": "timeInterval",
    "amount": 30,
    "unit": "seconds"
  }
}
\`\`\`

## 表达式使用：
- 使用 {{ }} 包裹表达式
- 访问当前数据：$json
- 访问特定节点数据：$('节点名称').item.json
- 访问环境变量：$env.VARIABLE_NAME
- 访问工作流变量：$workflow
- 当前时间：$now
- 数据项索引：$itemIndex
- 所有数据项：$items()

## 连接定义规范：
\`\`\`json
"connections": {
  "节点名称": {
    "main": [
      [{
        "node": "目标节点名称",
        "type": "main",
        "index": 0
      }]
    ]
  }
}
\`\`\`

## 工作流设置：
\`\`\`json
"settings": {
  "executionOrder": "v1",
  "saveManualExecutions": true,
  "saveExecutionProgress": true,
  "saveDataSuccessExecution": "all",
  "executionTimeout": 300,
  "timezone": "Asia/Shanghai",
  "errorWorkflow": "",
  "callerPolicy": "workflowsFromSameOwner"
}
\`\`\`

## 错误处理模式：
1. 简单模式：节点设置continueOnFail，后续节点检查错误
2. 重试模式：失败 -> 等待 -> 增加计数 -> 检查次数 -> 重试或通知
3. 分支模式：使用IF节点根据结果选择不同路径
4. 错误工作流：设置独立的错误处理工作流

请根据用户需求生成完整、专业、健壮的n8n工作流。包含适当的错误处理、重试机制和用户友好的输出格式。`;
  }

  /**
   * 优化用户输入的需求描述
   */
  static optimizeUserPrompt(userInput: string): string {
    // 提取关键信息
    const analysis = this.analyzeRequirement(userInput);
    
    return `创建一个n8n工作流实现以下需求：

原始需求：${userInput}

需求分析：
- 触发方式：${analysis.trigger}
- 主要操作：${analysis.operations.join(', ')}
- 涉及服务：${analysis.services.join(', ')}
- 数据处理：${analysis.dataProcessing.join(', ')}
- 输出方式：${analysis.output}

请生成：
1. 完整的n8n工作流JSON，包含所有必要的节点和连接
2. 完善的错误处理机制：
   - 对关键操作添加重试逻辑（最多3次）
   - 失败后发送管理员通知
   - 记录详细的错误日志
3. 数据验证和转换：
   - 验证API响应的有效性
   - 格式化数据以提供更好的用户体验
   - 处理空值和异常情况
4. 优化的节点连接顺序和并行处理
5. 使用环境变量管理敏感配置
6. 如果涉及邮件，生成美观的HTML模板
7. 添加适当的日志记录节点

特别要求：
- 使用最新版本的节点（scheduleTrigger替代cron）
- 节点位置合理分布（主流程Y=300，错误处理Y=500-600）
- 使用描述性的中文节点名称
- 为可能失败的操作设置continueOnFail: true
- 在Code节点中添加详细注释
- 考虑性能优化和资源使用`;
  }

  /**
   * 分析用户需求
   */
  private static analyzeRequirement(input: string): RequirementAnalysis {
    const lowerInput = input.toLowerCase();
    
    // 分析触发方式
    const trigger = this.detectTrigger(lowerInput);
    
    // 分析操作类型
    const operations = this.detectOperations(lowerInput);
    
    // 分析涉及的服务
    const services = this.detectServices(lowerInput);
    
    // 分析数据处理需求
    const dataProcessing = this.detectDataProcessing(lowerInput);
    
    // 分析输出方式
    const output = this.detectOutput(lowerInput);
    
    return {
      trigger,
      operations,
      services,
      dataProcessing,
      output
    };
  }

  /**
   * 检测触发方式
   */
  private static detectTrigger(input: string): string {
    const triggers = {
      '定时': 'Schedule Trigger - Cron表达式',
      '每天': 'Schedule Trigger - 每日定时',
      '每周': 'Schedule Trigger - 每周定时',
      '每月': 'Schedule Trigger - 每月定时',
      'webhook': 'Webhook Trigger - HTTP端点',
      'api': 'Webhook Trigger - REST API',
      '邮件': 'Email Trigger - IMAP监听',
      '文件': 'File Trigger - 文件变化',
      '表单': 'Form Trigger - n8n表单',
      '手动': 'Manual Trigger - 手动执行',
      'slack': 'Slack Trigger - 消息事件',
      'github': 'GitHub Trigger - 仓库事件'
    };

    for (const [key, value] of Object.entries(triggers)) {
      if (input.includes(key)) {
        return value;
      }
    }
    
    return 'Manual Trigger - 手动执行';
  }

  /**
   * 检测操作类型
   */
  private static detectOperations(input: string): string[] {
    const operations = [];
    
    const operationMap = {
      '获取': 'GET请求获取数据',
      '查询': '数据库查询',
      '发送': 'POST请求发送数据',
      '更新': 'PUT/PATCH更新数据',
      '删除': 'DELETE删除数据',
      '创建': 'POST创建资源',
      '下载': '下载文件',
      '上传': '上传文件',
      '转换': '数据格式转换',
      '过滤': '数据过滤',
      '聚合': '数据聚合统计',
      '合并': '数据合并',
      '分割': '数据分割',
      '加密': '数据加密',
      '解密': '数据解密',
      '压缩': '文件压缩',
      '解压': '文件解压',
      '通知': '发送通知',
      '监控': '状态监控',
      '备份': '数据备份',
      '同步': '数据同步'
    };

    for (const [key, value] of Object.entries(operationMap)) {
      if (input.includes(key)) {
        operations.push(value);
      }
    }

    return operations.length > 0 ? operations : ['数据处理'];
  }

  /**
   * 检测涉及的服务
   */
  private static detectServices(input: string): string[] {
    const services = [];
    
    const serviceMap = {
      'slack': 'Slack',
      'email': 'Email (SMTP/IMAP)',
      '邮件': 'Email (SMTP/IMAP)',
      'gmail': 'Gmail',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'jira': 'Jira',
      'trello': 'Trello',
      'notion': 'Notion',
      'airtable': 'Airtable',
      'google sheets': 'Google Sheets',
      'excel': 'Microsoft Excel',
      'mysql': 'MySQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      's3': 'AWS S3',
      'dropbox': 'Dropbox',
      'telegram': 'Telegram',
      'discord': 'Discord',
      'twitter': 'Twitter/X',
      'linkedin': 'LinkedIn',
      'stripe': 'Stripe',
      'paypal': 'PayPal',
      'shopify': 'Shopify',
      'wordpress': 'WordPress',
      'salesforce': 'Salesforce',
      'hubspot': 'HubSpot',
      'openai': 'OpenAI',
      'chatgpt': 'OpenAI ChatGPT',
      '天气': 'WeatherAPI',
      'weather': 'WeatherAPI',
      '天气预报': 'WeatherAPI',
      'openweather': 'OpenWeatherMap',
      'sendgrid': 'SendGrid',
      'twilio': 'Twilio',
      'sms': 'Twilio',
      '短信': 'Twilio',
      'api': 'HTTP API',
      'webhook': 'Webhook',
      'ftp': 'FTP/SFTP',
      'ssh': 'SSH'
    };

    for (const [key, value] of Object.entries(serviceMap)) {
      if (input.includes(key)) {
        services.push(value);
      }
    }

    // 如果没有检测到服务，检查是否需要HTTP请求
    if (services.length === 0 && (input.includes('api') || input.includes('请求') || input.includes('接口'))) {
      services.push('HTTP API');
    }

    // 去重
    return [...new Set(services)];
  }

  /**
   * 检测数据处理需求
   */
  private static detectDataProcessing(input: string): string[] {
    const processing = [];
    
    const processingMap = {
      'json': 'JSON解析和构建',
      'xml': 'XML解析和转换',
      'csv': 'CSV文件处理',
      'excel': 'Excel文件处理',
      '格式化': '数据格式化',
      '验证': '数据验证',
      '清洗': '数据清洗',
      '去重': '数据去重',
      '排序': '数据排序',
      '分组': '数据分组',
      '计算': '数值计算',
      '统计': '统计分析',
      '加密': '数据加密',
      '编码': '编码转换',
      '正则': '正则表达式匹配',
      '模板': '模板渲染',
      '映射': '字段映射',
      '转换': '类型转换',
      '合并': '数据合并',
      '拆分': '数据拆分'
    };

    for (const [key, value] of Object.entries(processingMap)) {
      if (input.includes(key)) {
        processing.push(value);
      }
    }

    return processing;
  }

  /**
   * 检测输出方式
   */
  private static detectOutput(input: string): string {
    const outputs = {
      '邮件': 'Email发送',
      'email': 'Email发送',
      'slack': 'Slack消息',
      'webhook': 'Webhook回调',
      '数据库': '存储到数据库',
      '文件': '保存为文件',
      'excel': '导出Excel',
      'csv': '导出CSV',
      'pdf': '生成PDF',
      '通知': '发送通知',
      'api': 'API响应',
      '报告': '生成报告',
      '仪表板': '更新仪表板',
      'telegram': 'Telegram消息',
      'discord': 'Discord消息'
    };

    for (const [key, value] of Object.entries(outputs)) {
      if (input.includes(key)) {
        return value;
      }
    }
    
    return '处理完成';
  }

  /**
   * 生成节点类型映射指南
   */
  static getNodeTypeGuide(): string {
    return `
## n8n节点类型完整列表（含最新版本）

### 触发器节点 (Triggers)
- n8n-nodes-base.manualTrigger - 手动触发
- n8n-nodes-base.scheduleTrigger - 定时触发 (v1.1) 【推荐，替代cron】
- n8n-nodes-base.cron - 定时触发 (v1) 【已过时】
- n8n-nodes-base.webhook - Webhook触发 (v1.1)
- n8n-nodes-base.emailReadImap - 邮件触发 (v2)
- n8n-nodes-base.errorTrigger - 错误触发 (v1)
- n8n-nodes-base.formTrigger - 表单触发 (v2)

### 操作节点 (Actions)
- n8n-nodes-base.httpRequest - HTTP请求 (v4.1) 【最新】
- n8n-nodes-base.postgres - PostgreSQL (v2.4)
- n8n-nodes-base.mysql - MySQL (v2)
- n8n-nodes-base.mongodb - MongoDB (v2)
- n8n-nodes-base.redis - Redis (v2.1)
- n8n-nodes-base.emailSend - 发送邮件 (v2.1) 【支持HTML】
- n8n-nodes-base.slack - Slack (v2.2)
- n8n-nodes-base.telegram - Telegram (v1.2)
- n8n-nodes-base.discord - Discord (v2)

### 数据处理节点
- n8n-nodes-base.set - 设置数据 (v3.2) 【最新】
- n8n-nodes-base.code - 代码节点 (v2) 【JavaScript/Python】
- n8n-nodes-base.if - 条件判断 (v2) 【支持复杂条件】
- n8n-nodes-base.switch - 多路分支 (v3)
- n8n-nodes-base.merge - 合并数据 (v3)
- n8n-nodes-base.splitInBatches - 批量处理 (v3)
- n8n-nodes-base.filter - 过滤数据 (v2)
- n8n-nodes-base.sort - 排序数据 (v1)
- n8n-nodes-base.aggregate - 聚合数据 (v1)
- n8n-nodes-base.itemLists - 列表操作 (v3)

### 文件操作节点
- n8n-nodes-base.readWriteFile - 文件读写 (v1)
- n8n-nodes-base.spreadsheetFile - 表格文件 (v2)
- n8n-nodes-base.xml - XML处理 (v1)
- n8n-nodes-base.csv - CSV处理 (v1)
- n8n-nodes-base.compression - 压缩/解压 (v1)
- n8n-nodes-base.ftp - FTP操作 (v1)

### 高级节点
- n8n-nodes-base.n8n - n8n API (v1) 【操作工作流】
- n8n-nodes-base.executeWorkflow - 执行子工作流 (v1.1)
- n8n-nodes-base.wait - 等待 (v1) 【支持时间间隔和Webhook】
- n8n-nodes-base.stopAndError - 停止并报错 (v1)
- n8n-nodes-base.respondToWebhook - Webhook响应 (v1.1)

### 最佳实践提示
1. 优先使用scheduleTrigger替代cron节点
2. HTTP请求使用v4.1版本，支持更多选项
3. 邮件发送使用v2.1版本，支持HTML格式
4. Set节点使用v3.2版本，支持更灵活的数据设置
5. 对于复杂逻辑，使用Code节点（v2）编写JavaScript

每个节点都有特定的参数和配置选项，使用时请参考官方文档。
`;
  }

  /**
   * 生成用户准备指南
   */
  static generateUserGuide(requirement: string): UserGuide {
    const services = this.detectServices(requirement.toLowerCase());
    const operations = this.detectOperations(requirement.toLowerCase());
    
    const guide: UserGuide = {
      credentials: [],
      parameters: [],
      dataSources: [],
      preparations: []
    };

    // 根据检测到的服务生成凭据需求
    services.forEach(service => {
      const credInfo = this.getCredentialInfo(service);
      if (credInfo) {
        guide.credentials.push(credInfo);
      }
    });

    // 根据操作类型生成参数需求
    if (operations.includes('数据库查询')) {
      guide.parameters.push({
        name: '数据库连接信息',
        description: '主机地址、端口、数据库名、用户名、密码',
        example: 'host: localhost, port: 5432, database: mydb'
      });
    }

    if (operations.includes('GET请求获取数据') || operations.includes('POST请求发送数据')) {
      guide.parameters.push({
        name: 'API端点URL',
        description: '完整的API请求地址',
        example: 'https://api.example.com/v1/data'
      });
    }

    // 数据源准备
    if (requirement.includes('csv') || requirement.includes('excel')) {
      guide.dataSources.push({
        type: '文件',
        format: 'CSV/Excel',
        requirements: '确保文件格式正确，包含必要的列标题'
      });
    }

    // 通用准备事项
    guide.preparations = [
      '确保所有外部服务的API已启用',
      '准备好测试数据用于验证工作流',
      '了解API的速率限制，避免超限',
      '准备错误通知接收渠道（如Slack、Email）'
    ];

    return guide;
  }

  /**
   * 获取凭据信息
   */
  private static getCredentialInfo(service: string): CredentialInfo | null {
    const credentialMap: Record<string, CredentialInfo> = {
      'Slack': {
        service: 'Slack',
        type: 'OAuth2 或 Bot Token',
        steps: [
          '访问 https://api.slack.com/apps',
          '创建新应用或选择现有应用',
          '获取Bot User OAuth Token',
          '设置必要的权限范围（如chat:write）'
        ],
        requiredFields: ['Bot Token', 'Channel ID/Name']
      },
      'Email (SMTP/IMAP)': {
        service: 'Email',
        type: 'SMTP/IMAP凭据',
        steps: [
          '获取SMTP服务器地址和端口',
          '生成应用专用密码（如Gmail）',
          '确认SSL/TLS设置',
          '配置发件人邮箱地址'
        ],
        requiredFields: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL']
      },
      'GitHub': {
        service: 'GitHub',
        type: 'Personal Access Token',
        steps: [
          '访问 GitHub Settings > Developer settings',
          '生成Personal Access Token',
          '选择必要的权限范围',
          '保存Token（仅显示一次）'
        ],
        requiredFields: ['Access Token', 'Username']
      },
      'PostgreSQL': {
        service: 'PostgreSQL',
        type: '数据库连接',
        steps: [
          '确认数据库服务器可访问',
          '创建数据库用户和权限',
          '获取连接参数',
          '测试连接是否正常'
        ],
        requiredFields: ['Host', 'Port', 'Database', 'User', 'Password']
      },
      'MySQL': {
        service: 'MySQL',
        type: '数据库连接',
        steps: [
          '确认MySQL服务器可访问',
          '创建数据库用户和权限',
          '获取连接参数',
          '确认字符集设置（推荐utf8mb4）'
        ],
        requiredFields: ['Host', 'Port', 'Database', 'User', 'Password']
      },
      'MongoDB': {
        service: 'MongoDB',
        type: '数据库连接',
        steps: [
          '获取MongoDB连接字符串',
          '确认认证数据库',
          '设置读写权限',
          '如果使用Atlas，获取集群连接信息'
        ],
        requiredFields: ['Connection String', 'Database Name']
      },
      'HTTP API': {
        service: 'HTTP API',
        type: 'API认证',
        steps: [
          '确认API文档和端点',
          '获取API密钥或OAuth凭据',
          '了解请求头和参数要求',
          '测试API连接和响应格式'
        ],
        requiredFields: ['API Key/Token', 'Base URL', 'Headers']
      },
      'WeatherAPI': {
        service: 'WeatherAPI',
        type: 'API Key',
        steps: [
          '访问 https://www.weatherapi.com',
          '注册免费账户',
          '获取API密钥',
          '了解API限制（免费版1000次/天）',
          '选择需要的数据（当前天气、预报、历史）'
        ],
        requiredFields: ['WEATHER_API_KEY', 'WEATHER_CITY', 'Language (zh)']
      },
      'OpenWeatherMap': {
        service: 'OpenWeatherMap',
        type: 'API Key',
        steps: [
          '访问 https://openweathermap.org/api',
          '注册账户并选择计划',
          '生成API密钥',
          '等待激活（最多2小时）',
          '选择API版本（推荐2.5或3.0）'
        ],
        requiredFields: ['API Key', 'City/Coordinates', 'Units (metric/imperial)']
      },
      'OpenAI': {
        service: 'OpenAI',
        type: 'API Key',
        steps: [
          '访问 platform.openai.com',
          '创建API密钥',
          '设置使用限额',
          '选择合适的模型（gpt-3.5-turbo, gpt-4）',
          '配置API基础URL（如使用代理）'
        ],
        requiredFields: ['OPENAI_API_KEY', 'OPENAI_BASE_URL (可选)', 'Model']
      },
      'Telegram': {
        service: 'Telegram',
        type: 'Bot Token',
        steps: [
          '与 @BotFather 对话',
          '创建新机器人',
          '获取Bot Token',
          '设置机器人命令和描述',
          '获取Chat ID（个人或群组）'
        ],
        requiredFields: ['Bot Token', 'Chat ID']
      },
      'Discord': {
        service: 'Discord',
        type: 'Webhook或Bot Token',
        steps: [
          '在服务器设置中创建Webhook',
          '或创建Discord应用和Bot',
          '获取Webhook URL或Bot Token',
          '设置必要的权限'
        ],
        requiredFields: ['Webhook URL 或 Bot Token', 'Channel ID']
      },
      'Airtable': {
        service: 'Airtable',
        type: 'Personal Access Token',
        steps: [
          '访问 airtable.com/account',
          '生成Personal Access Token',
          '选择必要的权限范围',
          '获取Base ID和Table名称'
        ],
        requiredFields: ['Access Token', 'Base ID', 'Table Name']
      },
      'Google Sheets': {
        service: 'Google Sheets',
        type: 'OAuth2 或 Service Account',
        steps: [
          '在Google Cloud Console创建项目',
          '启用Google Sheets API',
          '创建凭据（OAuth2或Service Account）',
          '下载凭据JSON文件',
          '共享表格给Service Account邮箱（如使用）'
        ],
        requiredFields: ['Credentials JSON', 'Spreadsheet ID']
      },
      'AWS S3': {
        service: 'AWS S3',
        type: 'Access Key',
        steps: [
          '在AWS IAM创建用户',
          '附加S3访问策略',
          '生成Access Key和Secret Key',
          '配置存储桶权限'
        ],
        requiredFields: ['Access Key ID', 'Secret Access Key', 'Region', 'Bucket Name']
      },
      'Stripe': {
        service: 'Stripe',
        type: 'API Key',
        steps: [
          '访问 dashboard.stripe.com',
          '获取API密钥（测试或生产）',
          '配置Webhook端点（如需要）',
          '了解API版本'
        ],
        requiredFields: ['Secret Key', 'Publishable Key (可选)', 'Webhook Secret (可选)']
      },
      'SendGrid': {
        service: 'SendGrid',
        type: 'API Key',
        steps: [
          '访问 app.sendgrid.com',
          '创建API密钥',
          '验证发件人域名或邮箱',
          '配置IP访问管理（可选）'
        ],
        requiredFields: ['API Key', 'Verified Sender Email']
      },
      'Twilio': {
        service: 'Twilio',
        type: 'Account SID和Auth Token',
        steps: [
          '访问 console.twilio.com',
          '获取Account SID',
          '获取Auth Token',
          '购买或验证电话号码'
        ],
        requiredFields: ['Account SID', 'Auth Token', 'Phone Number']
      }
    };

    return credentialMap[service] || null;
  }


}

// 类型定义
interface RequirementAnalysis {
  trigger: string;
  operations: string[];
  services: string[];
  dataProcessing: string[];
  output: string;
}

interface CredentialInfo {
  service: string;
  type: string;
  steps: string[];
  requiredFields: string[];
}

interface UserGuide {
  credentials: CredentialInfo[];
  parameters: Array<{
    name: string;
    description: string;
    example: string;
  }>;
  dataSources: Array<{
    type: string;
    format: string;
    requirements: string;
  }>;
  preparations: string[];
}

export interface UserParameter {
  name: string;
  description: string;
  example: string;
}

export interface DataSource {
  type: string;
  format: string;
  requirements: string;
} 