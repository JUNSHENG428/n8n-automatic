import React, { useState } from 'react';
import { Book, Search, Tag, Clock, Database, Mail, Code, Webhook, Filter } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: React.ReactNode;
  requirement: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

interface WorkflowTemplatesProps {
  onSelectTemplate: (requirement: string) => void;
}

const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const templates: Template[] = [
    // 数据同步模板
    {
      id: 'data-sync-1',
      name: '数据库定时同步',
      description: '每天定时从源数据库同步数据到目标数据库',
      category: 'data-sync',
      tags: ['数据库', '定时', '同步'],
      icon: <Database className="w-5 h-5" />,
      requirement: '创建一个工作流，每天凌晨2点从MySQL生产数据库读取前一天的订单数据，进行数据清洗（去除测试订单、格式化日期），然后同步到PostgreSQL数据仓库，同步完成后发送邮件通知',
      complexity: 'intermediate'
    },
    {
      id: 'data-sync-2',
      name: 'API数据采集',
      description: '定时从外部API采集数据并存储',
      category: 'data-sync',
      tags: ['API', '采集', '存储'],
      icon: <Webhook className="w-5 h-5" />,
      requirement: '创建一个工作流，每小时从天气API获取城市天气数据，解析JSON响应，提取温度、湿度、风速等关键信息，存储到MongoDB数据库，并在极端天气时发送预警通知',
      complexity: 'intermediate'
    },
    
    // 数据处理模板
    {
      id: 'data-process-1',
      name: 'ETL数据处理',
      description: '提取、转换和加载数据的完整流程',
      category: 'data-processing',
      tags: ['ETL', '数据处理', '转换'],
      icon: <Filter className="w-5 h-5" />,
      requirement: '创建一个ETL工作流，从CSV文件读取销售数据，清洗数据（去除空值、标准化格式），计算销售指标（总额、平均值、增长率），按产品类别汇总，生成报表并发送给管理层',
      complexity: 'advanced'
    },
    {
      id: 'data-process-2',
      name: '批量数据验证',
      description: '批量验证和清洗数据',
      category: 'data-processing',
      tags: ['验证', '清洗', '批量'],
      icon: <Code className="w-5 h-5" />,
      requirement: '创建一个工作流，接收上传的客户数据Excel文件，验证邮箱格式、手机号格式、必填字段，标记无效数据，生成验证报告，将有效数据导入CRM系统，无效数据生成错误日志',
      complexity: 'intermediate'
    },
    
    // 通知告警模板
    {
      id: 'notification-1',
      name: '系统监控告警',
      description: '监控系统状态并发送告警',
      category: 'notification',
      tags: ['监控', '告警', '通知'],
      icon: <Mail className="w-5 h-5" />,
      requirement: '创建一个监控工作流，每5分钟检查服务器健康状态API，监控CPU使用率、内存使用率、磁盘空间，当任何指标超过阈值（CPU>80%、内存>90%、磁盘>95%）时，立即发送Slack消息和邮件告警，并记录到日志数据库',
      complexity: 'intermediate'
    },
    {
      id: 'notification-2',
      name: '业务异常通知',
      description: '检测业务异常并通知相关人员',
      category: 'notification',
      tags: ['异常检测', '业务监控', '通知'],
      icon: <Clock className="w-5 h-5" />,
      requirement: '创建一个工作流，每30分钟查询订单数据库，检测异常订单（金额异常、重复订单、长时间未处理），对异常订单进行分类，生成异常报告，通过企业微信通知相关负责人，并创建处理工单',
      complexity: 'advanced'
    },
    
    // 自动化流程模板
    {
      id: 'automation-1',
      name: '文件自动处理',
      description: '自动处理上传的文件',
      category: 'automation',
      tags: ['文件处理', '自动化', '批量'],
      icon: <Code className="w-5 h-5" />,
      requirement: '创建一个文件处理工作流，监控FTP文件夹新文件上传，自动下载文件，根据文件类型（PDF、Excel、图片）执行不同处理：PDF提取文本、Excel解析数据、图片压缩优化，处理完成后归档到云存储，发送处理报告',
      complexity: 'advanced'
    },
    {
      id: 'automation-2',
      name: '审批流程自动化',
      description: '自动化审批和流转流程',
      category: 'automation',
      tags: ['审批', '流程', '自动化'],
      icon: <Webhook className="w-5 h-5" />,
      requirement: '创建一个审批自动化工作流，接收审批申请Webhook，根据申请类型和金额自动分配审批人，发送审批通知邮件，设置超时提醒，记录审批日志，审批完成后更新系统状态并通知申请人',
      complexity: 'advanced'
    },
    
    // 集成同步模板
    {
      id: 'integration-1',
      name: 'CRM与邮件营销同步',
      description: '同步CRM客户数据到邮件营销平台',
      category: 'integration',
      tags: ['CRM', '邮件营销', '同步'],
      icon: <Database className="w-5 h-5" />,
      requirement: '创建一个集成工作流，每天从Salesforce CRM读取新增和更新的客户数据，根据客户标签和属性进行分组，同步到Mailchimp邮件列表，更新客户分组和标签，记录同步日志，发送同步报告',
      complexity: 'intermediate'
    },
    {
      id: 'integration-2',
      name: '多渠道订单汇总',
      description: '汇总多个销售渠道的订单数据',
      category: 'integration',
      tags: ['电商', '订单', '汇总'],
      icon: <Filter className="w-5 h-5" />,
      requirement: '创建一个订单汇总工作流，定时从淘宝、京东、自建商城等多个渠道API获取订单数据，统一订单格式，去重处理，计算各渠道销售额和占比，生成综合销售报表，推送到数据看板',
      complexity: 'advanced'
    }
  ];

  const categories = [
    { id: 'all', name: '全部', icon: <Book className="w-4 h-4" /> },
    { id: 'data-sync', name: '数据同步', icon: <Database className="w-4 h-4" /> },
    { id: 'data-processing', name: '数据处理', icon: <Filter className="w-4 h-4" /> },
    { id: 'notification', name: '通知告警', icon: <Mail className="w-4 h-4" /> },
    { id: 'automation', name: '自动化流程', icon: <Code className="w-4 h-4" /> },
    { id: 'integration', name: '系统集成', icon: <Webhook className="w-4 h-4" /> }
  ];

  const complexityLevels = [
    { id: 'all', name: '全部难度', color: 'gray' },
    { id: 'simple', name: '简单', color: 'green' },
    { id: 'intermediate', name: '中等', color: 'yellow' },
    { id: 'advanced', name: '高级', color: 'red' }
  ];

  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Book className="w-6 h-6" />
          工作流模板库
        </h2>
        
        {/* 搜索和筛选 */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* 难度筛选 */}
            <div className="flex gap-2">
              {complexityLevels.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedComplexity(level.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedComplexity === level.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 模板列表 */}
      <div className="p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Book className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>没有找到匹配的模板</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onSelectTemplate(template.requirement)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(template.complexity)}`}>
                    {complexityLevels.find(l => l.id === template.complexity)?.name}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  点击使用此模板 →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowTemplates; 