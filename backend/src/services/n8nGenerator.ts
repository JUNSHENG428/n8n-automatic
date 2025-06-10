import { OpenAI } from 'openai';
import { N8nWorkflow, N8nNode } from '../types/n8n';
import { PromptOptimizer } from './promptOptimizer';
import { createOpenAIClient } from '../config/openai';

export class N8nWorkflowGenerator {
  private openai: OpenAI;
  private promptOptimizer: PromptOptimizer;
  private nodeIdCounter: number = 0;

  constructor(apiKey?: string) {
    // 使用配置创建 OpenAI 客户端
    this.openai = createOpenAIClient(apiKey);
    this.promptOptimizer = new PromptOptimizer();
  }

  // 生成唯一的节点ID
  private generateNodeId(): string {
    return `node_${++this.nodeIdCounter}_${Date.now()}`;
  }

  async generateWorkflow(requirement: string): Promise<GeneratedWorkflow> {
    try {
      console.log('Generating workflow for requirement:', requirement);
      
      // 生成优化后的prompt
      const systemPrompt = PromptOptimizer.generateSystemPrompt();
      const userPrompt = PromptOptimizer.optimizeUserPrompt(requirement);
      
      // 生成用户准备指南
      const userGuide = PromptOptimizer.generateUserGuide(requirement);
      
      // 调用OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const response = completion.choices[0].message.content || '';
      console.log('OpenAI response received, length:', response.length);
      
      // 提取JSON工作流
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        throw new Error('无法从响应中提取JSON工作流');
      }

      let workflow = JSON.parse(jsonMatch[1]);
      console.log('Workflow parsed successfully');
      
      // 验证和修复工作流
      workflow = this.validateAndFixWorkflow(workflow);
      
      // 添加用户准备指南到返回结果
      const result: GeneratedWorkflow = {
        workflow,
        userGuide,
        description: this.extractDescription(response),
        usage: completion.usage
      };
      
      console.log('Workflow generation completed');
      return result;
      
    } catch (error: any) {
      console.error('Error generating workflow:', error);
      
      // 如果是连接错误
      if (error.message && error.message.includes('Connection error')) {
        console.log('Connection error detected, using fallback workflow');
        
        // 生成备用工作流
        const fallbackWorkflow = this.generateEnhancedFallbackWorkflow(requirement);
        const userGuide = PromptOptimizer.generateUserGuide(requirement);
        
        return {
          workflow: fallbackWorkflow,
          userGuide,
          description: '由于连接问题，已生成基于模板的工作流。请检查您的API密钥是否有效，或网络连接是否正常。',
          usage: undefined
        };
      }
      
      // 如果是API密钥错误
      if (error.status === 401 || (error.message && error.message.includes('401'))) {
        throw new Error('API密钥无效。请检查您的OpenAI API密钥是否正确。');
      }
      
      // 如果是地区限制错误
      if (error.status === 403 || (error.message && (error.message.includes('403') || error.message.includes('not supported')))) {
        throw new Error('您所在的地区暂不支持 OpenAI API。建议：1) 使用代理服务器 2) 使用 VPN 3) 使用第三方 API 代理服务（如 Azure OpenAI）');
      }
      
      // 如果是配额错误
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        throw new Error('API请求超过限制。请稍后再试或检查您的OpenAI账户配额。');
      }
      
      // 如果是解析错误，尝试修复
      if (error instanceof SyntaxError) {
        console.log('Attempting to fix JSON syntax error');
        throw new Error('生成的工作流格式有误，请重试');
      }
      
      // 如果是API错误，提供更详细的信息
      if (error.response) {
        console.error('OpenAI API error:', error.response.data);
        throw new Error(`AI服务错误: ${error.response.data.error?.message || '未知错误'}`);
      }
      
      // 其他错误
      throw new Error(`生成工作流时出错: ${error.message || '未知错误'}`);
    }
  }

  // 验证并修复工作流
  private validateAndFixWorkflow(workflow: any): N8nWorkflow {
    // 确保有基本结构
    if (!workflow.name) {
      workflow.name = '自动生成的工作流';
    }
    
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      workflow.nodes = [];
    }
    
    if (!workflow.connections) {
      workflow.connections = {};
    }
    
    if (!workflow.settings) {
      workflow.settings = { executionOrder: 'v1' };
    }
    
    // 确保每个节点都有必要的字段
    workflow.nodes = workflow.nodes.map((node: any, index: number) => {
      if (!node.id) {
        node.id = this.generateNodeId();
      }
      if (!node.position || !Array.isArray(node.position)) {
        node.position = [250 + (index * 200), 300];
      }
      if (!node.typeVersion) {
        node.typeVersion = 1;
      }
      if (!node.parameters) {
        node.parameters = {};
      }
      return node;
    });
    
    workflow.active = false;
    workflow.createdAt = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();
    
    return workflow as N8nWorkflow;
  }

  // 增强的备用工作流生成
  private generateEnhancedFallbackWorkflow(requirement: string): N8nWorkflow {
    const workflowName = requirement.slice(0, 50) + '...';
    
    // 分析需求中的关键词
    const analysis = {
      isCron: /定时|每天|每周|每月|每小时|计划任务/i.test(requirement),
      isWebhook: /webhook|api|接收请求|监听/i.test(requirement),
      isEmail: /邮件|email|发送通知|通知/i.test(requirement),
      isDatabase: /数据库|mysql|postgres|mongodb|查询|sql/i.test(requirement),
      isHTTP: /api|http|请求|调用|获取数据|接口/i.test(requirement),
      isSlack: /slack|消息|即时通讯/i.test(requirement),
      isFile: /文件|csv|excel|json|读取|写入|导出/i.test(requirement),
      isCondition: /如果|判断|条件|筛选|过滤/i.test(requirement),
      isLoop: /循环|遍历|批量|处理每个/i.test(requirement),
      isDataTransform: /转换|格式化|处理|清洗|整理/i.test(requirement),
      isError: /错误|异常|失败|重试/i.test(requirement)
    };
    
    const nodes: N8nNode[] = [];
    const connections: any = {};
    let xPos = 250;
    let yPos = 300;
    
    // 添加触发节点
    let triggerNode: N8nNode;
    if (analysis.isCron) {
      triggerNode = {
        id: this.generateNodeId(),
        name: '定时触发器',
        type: 'n8n-nodes-base.cron',
        typeVersion: 1,
        position: [xPos, yPos],
        parameters: {
          triggerTimes: {
            item: [{
              mode: 'everyDay',
              hour: 9,
              minute: 0
            }]
          }
        }
      };
    } else if (analysis.isWebhook) {
      triggerNode = {
        id: this.generateNodeId(),
        name: 'Webhook 触发器',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [xPos, yPos],
        parameters: {
          httpMethod: 'POST',
          path: 'workflow-webhook',
          responseMode: 'onReceived',
          responseData: 'allEntries',
          options: {}
        }
      };
    } else {
      triggerNode = {
        id: this.generateNodeId(),
        name: '手动触发',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [xPos, yPos],
        parameters: {}
      };
    }
    
    nodes.push(triggerNode);
    let lastNodeName = triggerNode.name;
    xPos += 250;
    
    // 添加 HTTP 请求节点
    if (analysis.isHTTP) {
      const httpNode: N8nNode = {
        id: this.generateNodeId(),
        name: 'HTTP 请求',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [xPos, yPos],
        parameters: {
          method: 'GET',
          url: 'https://api.example.com/data',
          authentication: 'none',
          options: {
            timeout: 10000,
            response: {
              response: {
                responseFormat: 'json'
              }
            }
          }
        }
      };
      nodes.push(httpNode);
      
      connections[lastNodeName] = {
        main: [[{ node: httpNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = httpNode.name;
      xPos += 250;
    }
    
    // 添加数据库节点
    if (analysis.isDatabase) {
      const dbNode: N8nNode = {
        id: this.generateNodeId(),
        name: '数据库查询',
        type: 'n8n-nodes-base.postgres',
        typeVersion: 2,
        position: [xPos, yPos],
        parameters: {
          operation: 'executeQuery',
          query: 'SELECT * FROM users WHERE created_at > CURRENT_DATE - INTERVAL \'7 days\'',
          options: {}
        }
      };
      nodes.push(dbNode);
      
      connections[lastNodeName] = {
        main: [[{ node: dbNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = dbNode.name;
      xPos += 250;
    }
    
    // 添加数据处理节点
    if (analysis.isDataTransform || analysis.isCondition) {
      // 添加 Set 节点进行数据转换
      const setNode: N8nNode = {
        id: this.generateNodeId(),
        name: '数据处理',
        type: 'n8n-nodes-base.set',
        typeVersion: 3,
        position: [xPos, yPos],
        parameters: {
          mode: 'manual',
          duplicateItem: false,
          options: {},
          fields: {
            values: [
              {
                name: 'processed',
                type: 'boolean',
                value: true
              },
              {
                name: 'timestamp',
                type: 'dateTime',
                value: '={{ $now }}'
              }
            ]
          }
        }
      };
      nodes.push(setNode);
      
      connections[lastNodeName] = {
        main: [[{ node: setNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = setNode.name;
      xPos += 250;
    }
    
    // 添加条件节点
    if (analysis.isCondition) {
      const ifNode: N8nNode = {
        id: this.generateNodeId(),
        name: '条件判断',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [xPos, yPos],
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: '',
              typeValidation: 'strict'
            },
            conditions: [
              {
                id: this.generateNodeId(),
                leftValue: '={{ $json.status }}',
                rightValue: 'active',
                operator: {
                  type: 'string',
                  operation: 'equals'
                }
              }
            ],
            combinator: 'and'
          },
          options: {}
        }
      };
      nodes.push(ifNode);
      
      connections[lastNodeName] = {
        main: [[{ node: ifNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = ifNode.name;
      xPos += 250;
    }
    
    // 添加循环节点
    if (analysis.isLoop) {
      const loopNode: N8nNode = {
        id: this.generateNodeId(),
        name: '循环处理',
        type: 'n8n-nodes-base.splitInBatches',
        typeVersion: 3,
        position: [xPos, yPos],
        parameters: {
          batchSize: 10,
          options: {}
        }
      };
      nodes.push(loopNode);
      
      connections[lastNodeName] = {
        main: [[{ node: loopNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = loopNode.name;
      xPos += 250;
    }
    
    // 添加发送邮件节点
    if (analysis.isEmail) {
      const emailNode: N8nNode = {
        id: this.generateNodeId(),
        name: '发送邮件',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [xPos, yPos],
        parameters: {
          fromEmail: '={{ $env.SMTP_FROM_EMAIL }}',
          toEmail: 'recipient@example.com',
          subject: '工作流执行通知',
          emailType: 'html',
          message: '<h3>工作流执行完成</h3><p>处理了 {{ $items().length }} 条记录</p>',
          options: {}
        }
      };
      nodes.push(emailNode);
      
      connections[lastNodeName] = {
        main: [[{ node: emailNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = emailNode.name;
      xPos += 250;
    }
    
    // 添加 Slack 节点
    if (analysis.isSlack) {
      const slackNode: N8nNode = {
        id: this.generateNodeId(),
        name: '发送 Slack 消息',
        type: 'n8n-nodes-base.slack',
        typeVersion: 2.1,
        position: [xPos, yPos],
        parameters: {
          resource: 'message',
          operation: 'post',
          text: '工作流执行完成！处理了 {{ $items().length }} 条数据。',
          channel: '#notifications',
          username: 'n8n Bot',
          options: {}
        }
      };
      nodes.push(slackNode);
      
      connections[lastNodeName] = {
        main: [[{ node: slackNode.name, type: 'main', index: 0 }]]
      };
      lastNodeName = slackNode.name;
    }
    
    // 添加错误处理节点
    if (analysis.isError || nodes.length > 3) {
      const errorTriggerNode: N8nNode = {
        id: this.generateNodeId(),
        name: '错误触发器',
        type: 'n8n-nodes-base.errorTrigger',
        typeVersion: 1,
        position: [xPos - 500, yPos + 200],
        parameters: {}
      };
      
      const errorNotifyNode: N8nNode = {
        id: this.generateNodeId(),
        name: '错误通知',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [xPos - 250, yPos + 200],
        parameters: {
          fromEmail: '={{ $env.SMTP_FROM_EMAIL }}',
          toEmail: 'admin@example.com',
          subject: '工作流执行错误',
          emailType: 'text',
          message: '工作流 "{{ $workflow.name }}" 执行出错:\n\n{{ $json.error.message }}\n\n节点: {{ $json.error.node.name }}',
          options: {}
        }
      };
      
      nodes.push(errorTriggerNode, errorNotifyNode);
      
      connections[errorTriggerNode.name] = {
        main: [[{ node: errorNotifyNode.name, type: 'main', index: 0 }]]
      };
    }
    
    // 如果只有触发器，添加一个基本的 Code 节点
    if (nodes.length === 1) {
      const codeNode: N8nNode = {
        id: this.generateNodeId(),
        name: '代码处理',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [xPos, yPos],
        parameters: {
          language: 'javaScript',
          jsCode: `// 在这里编写您的处理逻辑
const items = $input.all();

return items.map(item => {
  return {
    json: {
      ...item.json,
      processed: true,
      processedAt: new Date().toISOString()
    }
  };
});`
        }
      };
      nodes.push(codeNode);
      
      connections[lastNodeName] = {
        main: [[{ node: codeNode.name, type: 'main', index: 0 }]]
      };
    }
    
    return {
      name: workflowName,
      active: false,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner',
        errorWorkflow: analysis.isError ? '' : undefined
      },
      staticData: undefined,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 验证工作流结构
  validateWorkflow(workflow: N8nWorkflow): boolean {
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      return false;
    }

    // 检查是否有开始节点
    const hasStartNode = workflow.nodes.some(
      node => node.type === 'n8n-nodes-base.start' || 
              node.type === 'n8n-nodes-base.webhook' ||
              node.type === 'n8n-nodes-base.cron'
    );

    if (!hasStartNode && workflow.nodes.length > 0) {
      console.warn('警告：工作流没有明确的触发节点');
    }

    return true;
  }

  // 生成示例工作流
  generateExampleWorkflow(): N8nWorkflow {
    return {
      name: '示例工作流 - HTTP 请求',
      active: false,
      nodes: [
        {
          id: '1',
          name: '开始',
          type: 'n8n-nodes-base.start',
          typeVersion: 1,
          position: [250, 300],
          parameters: {}
        },
        {
          id: '2',
          name: 'HTTP 请求',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com/data',
            options: {}
          }
        }
      ],
      connections: {
        '开始': {
          main: [
            [
              {
                node: 'HTTP 请求',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      },
      settings: {
        executionOrder: 'v1'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 提取描述
  private extractDescription(response: string): string | undefined {
    const descriptionMatch = response.match(/```description\s*([\s\S]*?)\s*```/);
    if (descriptionMatch) {
      return descriptionMatch[1].trim();
    }
    return undefined;
  }
}

// 更新GeneratedWorkflow接口
export interface GeneratedWorkflow {
  workflow: any;
  userGuide?: any;
  description?: string;
  usage?: any;
} 