import { Router } from 'express';
import { N8nWorkflowGenerator } from '../services/n8nGenerator';
import { PromptOptimizer } from '../services/promptOptimizer';

export const generateWorkflowRoute = Router();

// 生成工作流端点
generateWorkflowRoute.post('/generate', async (req, res) => {
  try {
    const { requirement, apiKey } = req.body;
    
    if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({ 
        error: '请提供有效的需求描述',
        details: 'requirement字段不能为空'
      });
    }
    
    // 从请求体或环境变量获取API密钥
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(400).json({ 
        error: '缺少OpenAI API密钥',
        details: '请在请求中提供apiKey或在服务器设置OPENAI_API_KEY环境变量'
      });
    }
    
    const generator = new N8nWorkflowGenerator(openaiApiKey);
    const result = await generator.generateWorkflow(requirement);
    
    res.json({ 
      success: true,
      workflow: result.workflow,
      userGuide: result.userGuide,
      description: result.description,
      usage: result.usage
    });
    
  } catch (error: any) {
    console.error('Workflow generation error:', error);
    res.status(500).json({ 
      error: '生成工作流时出错',
      details: error.message,
      suggestion: '请尝试更详细地描述您的需求'
    });
  }
});

// 分析需求端点
generateWorkflowRoute.post('/analyze', async (req, res) => {
  try {
    const { requirement } = req.body;

    if (!requirement) {
      return res.status(400).json({ 
        error: '缺少必要参数',
        message: '请提供需求描述' 
      });
    }

    // 直接调用静态方法
    const optimizedPrompt = PromptOptimizer.optimizeUserPrompt(requirement);
    const userGuide = PromptOptimizer.generateUserGuide(requirement);

    res.json({
      success: true,
      optimizedPrompt: optimizedPrompt.substring(0, 500) + '...', // 返回部分预览
      userGuide,
      message: '需求分析成功'
    });
  } catch (error: any) {
    console.error('分析需求时出错:', error);
    res.status(500).json({
      success: false,
      error: '需求分析失败',
      message: error.message
    });
  }
});

// 获取示例工作流
generateWorkflowRoute.get('/examples', (req, res) => {
  const examples = [
    {
      name: '定时数据同步工作流',
      description: '每天定时从API获取数据并存储到数据库',
      requirement: '创建一个工作流，每天早上 9 点从REST API获取用户数据，筛选出活跃用户后存储到PostgreSQL数据库，并发送邮件通知'
    },
    {
      name: '数据ETL处理工作流',
      description: '从多个数据源提取、转换并加载数据',
      requirement: '创建一个工作流，从MySQL数据库读取订单数据，从API获取产品信息，合并数据后进行清洗和转换，最后导出为CSV文件并上传到云存储'
    },
    {
      name: '监控告警工作流',
      description: '监控系统状态并发送告警',
      requirement: '创建一个工作流，每5分钟检查服务器状态API，如果CPU使用率超过80%或内存使用率超过90%，立即发送Slack消息和邮件告警'
    },
    {
      name: 'Webhook数据处理',
      description: '接收Webhook数据并进行处理',
      requirement: '创建一个工作流，接收Webhook POST请求，验证请求签名，解析JSON数据，根据事件类型执行不同的处理逻辑，并返回处理结果'
    },
    {
      name: '批量数据处理工作流',
      description: '批量处理大量数据记录',
      requirement: '创建一个工作流，从数据库读取待处理的记录，每次处理100条，对每条记录调用外部API进行验证，将结果更新回数据库，处理完成后生成报告'
    }
  ];

  res.json({ examples });
});

// 获取支持的节点类型
generateWorkflowRoute.get('/node-types', (req, res) => {
  const nodeTypes = {
    triggers: [
      {
        type: 'n8n-nodes-base.manualTrigger',
        name: '手动触发器',
        description: '手动执行工作流',
        icon: '▶️'
      },
      {
        type: 'n8n-nodes-base.cron',
        name: '定时触发器',
        description: '按计划定时执行工作流',
        icon: '⏰'
      },
      {
        type: 'n8n-nodes-base.webhook',
        name: 'Webhook触发器',
        description: '接收HTTP请求触发工作流',
        icon: '🔗'
      },
      {
        type: 'n8n-nodes-base.emailImap',
        name: '邮件触发器',
        description: '监控邮箱接收邮件触发',
        icon: '📧'
      },
      {
        type: 'n8n-nodes-base.errorTrigger',
        name: '错误触发器',
        description: '捕获工作流错误',
        icon: '❌'
      }
    ],
    actions: [
      {
        type: 'n8n-nodes-base.httpRequest',
        name: 'HTTP请求',
        description: '发送HTTP请求到API',
        icon: '🌐'
      },
      {
        type: 'n8n-nodes-base.postgres',
        name: 'PostgreSQL',
        description: '连接PostgreSQL数据库',
        icon: '🐘'
      },
      {
        type: 'n8n-nodes-base.mysql',
        name: 'MySQL',
        description: '连接MySQL数据库',
        icon: '🐬'
      },
      {
        type: 'n8n-nodes-base.emailSend',
        name: '发送邮件',
        description: '发送电子邮件',
        icon: '📤'
      },
      {
        type: 'n8n-nodes-base.slack',
        name: 'Slack',
        description: '发送Slack消息',
        icon: '💬'
      }
    ],
    dataProcessing: [
      {
        type: 'n8n-nodes-base.set',
        name: '设置字段',
        description: '设置或修改数据字段',
        icon: '✏️'
      },
      {
        type: 'n8n-nodes-base.code',
        name: '代码节点',
        description: '执行自定义JavaScript代码',
        icon: '💻'
      },
      {
        type: 'n8n-nodes-base.if',
        name: '条件判断',
        description: '基于条件分支执行',
        icon: '❓'
      },
      {
        type: 'n8n-nodes-base.switch',
        name: '多路分支',
        description: '基于值的多路分支',
        icon: '🔀'
      },
      {
        type: 'n8n-nodes-base.merge',
        name: '合并数据',
        description: '合并多个数据流',
        icon: '🔗'
      },
      {
        type: 'n8n-nodes-base.splitInBatches',
        name: '批量处理',
        description: '将数据分批处理',
        icon: '📦'
      },
      {
        type: 'n8n-nodes-base.filter',
        name: '过滤数据',
        description: '根据条件过滤数据',
        icon: '🔍'
      },
      {
        type: 'n8n-nodes-base.sort',
        name: '排序',
        description: '对数据进行排序',
        icon: '↕️'
      },
      {
        type: 'n8n-nodes-base.aggregate',
        name: '聚合',
        description: '聚合和汇总数据',
        icon: '📊'
      }
    ],
    fileOperations: [
      {
        type: 'n8n-nodes-base.readWriteFile',
        name: '文件读写',
        description: '读取或写入文件',
        icon: '📁'
      },
      {
        type: 'n8n-nodes-base.csv',
        name: 'CSV处理',
        description: '读取和写入CSV文件',
        icon: '📋'
      },
      {
        type: 'n8n-nodes-base.xml',
        name: 'XML处理',
        description: '解析和生成XML',
        icon: '📄'
      }
    ]
  };

  res.json({
    success: true,
    nodeTypes,
    totalTypes: Object.values(nodeTypes).flat().length,
    categories: Object.keys(nodeTypes)
  });
});

// 验证工作流结构
generateWorkflowRoute.post('/validate', (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({
        success: false,
        error: '缺少工作流数据'
      });
    }

    // 使用空的API密钥，因为验证不需要调用OpenAI
    const generator = new N8nWorkflowGenerator('dummy-key-for-validation');
    const isValid = generator.validateWorkflow(workflow);
    
    const issues = [];
    
    // 检查必要字段
    if (!workflow.name) issues.push('缺少工作流名称');
    if (!workflow.nodes || workflow.nodes.length === 0) issues.push('工作流没有节点');
    if (!workflow.connections) issues.push('缺少节点连接信息');
    
    // 检查节点结构
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach((node: any, index: number) => {
        if (!node.id) issues.push(`节点 ${index + 1} 缺少ID`);
        if (!node.name) issues.push(`节点 ${index + 1} 缺少名称`);
        if (!node.type) issues.push(`节点 ${index + 1} 缺少类型`);
        if (!node.position) issues.push(`节点 ${index + 1} 缺少位置信息`);
      });
    }

    res.json({
      success: true,
      isValid: isValid && issues.length === 0,
      issues,
      summary: {
        nodeCount: workflow.nodes?.length || 0,
        connectionCount: Object.keys(workflow.connections || {}).length,
        hasTrigger: workflow.nodes?.some((n: any) => 
          n.type?.includes('Trigger') || 
          n.type?.includes('cron') || 
          n.type?.includes('webhook')
        )
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: '验证失败',
      message: error.message
    });
  }
}); 