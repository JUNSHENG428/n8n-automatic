import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface NodeType {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
}

interface NodeTypesResponse {
  nodeTypes: NodeType[];
  categories: string[];
}

const NodeTypesGuide: React.FC = () => {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 先设置默认数据，避免初始渲染错误
    setDefaultNodeTypes(false);
    setLoading(true);
    // 然后尝试从 API 获取数据
    fetchNodeTypes();
  }, []);

  const fetchNodeTypes = async () => {
    try {
      const response = await fetch('/api/workflow/node-types');
      if (!response.ok) {
        throw new Error('Failed to fetch node types');
      }
      const data: NodeTypesResponse = await response.json();
      if (Array.isArray(data.nodeTypes)) {
        setNodeTypes(data.nodeTypes);
        setCategories(['all', ...data.categories]);
      } else {
        throw new Error('Invalid response format');
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      // 如果获取失败，使用默认数据
      setDefaultNodeTypes();
    }
  };

  const setDefaultNodeTypes = (updateLoadingState: boolean = true) => {
    const defaultTypes: NodeType[] = [
      // 触发器
      { name: 'n8n-nodes-base.webhook', displayName: 'Webhook', description: '通过 HTTP 请求触发工作流', category: '触发器' },
      { name: 'n8n-nodes-base.scheduleTrigger', displayName: '定时触发器', description: '按计划定期触发工作流', category: '触发器' },
      { name: 'n8n-nodes-base.emailTrigger', displayName: '邮件触发器', description: '收到邮件时触发工作流', category: '触发器' },
      
      // 数据处理
      { name: 'n8n-nodes-base.set', displayName: '设置', description: '设置或修改数据值', category: '数据处理' },
      { name: 'n8n-nodes-base.code', displayName: 'JavaScript代码', description: '执行自定义 JavaScript 代码', category: '数据处理' },
      { name: 'n8n-nodes-base.function', displayName: '函数', description: '使用自定义函数处理数据', category: '数据处理' },
      { name: 'n8n-nodes-base.spreadsheetFile', displayName: '电子表格文件', description: '读取或写入电子表格文件', category: '数据处理' },
      
      // 流程控制
      { name: 'n8n-nodes-base.if', displayName: 'IF 条件', description: '基于条件分支执行', category: '流程控制' },
      { name: 'n8n-nodes-base.switch', displayName: 'Switch', description: '多路条件分支', category: '流程控制' },
      { name: 'n8n-nodes-base.splitInBatches', displayName: '批量拆分', description: '将数据拆分成批次处理', category: '流程控制' },
      
      // 操作
      { name: 'n8n-nodes-base.httpRequest', displayName: 'HTTP 请求', description: '发送 HTTP 请求到任何 API', category: '操作' },
      { name: 'n8n-nodes-base.emailSend', displayName: '发送邮件', description: '发送电子邮件', category: '操作' },
      { name: 'n8n-nodes-base.googleSheets', displayName: 'Google Sheets', description: '操作 Google 表格', category: '操作' },
      { name: 'n8n-nodes-base.mysql', displayName: 'MySQL', description: '连接和查询 MySQL 数据库', category: '操作' },
      { name: 'n8n-nodes-base.postgres', displayName: 'PostgreSQL', description: '连接和查询 PostgreSQL 数据库', category: '操作' },
      
      // 文件操作
      { name: 'n8n-nodes-base.readBinaryFile', displayName: '读取二进制文件', description: '从文件系统读取二进制文件', category: '文件操作' },
      { name: 'n8n-nodes-base.writeBinaryFile', displayName: '写入二进制文件', description: '将二进制数据写入文件', category: '文件操作' },
      { name: 'n8n-nodes-base.moveBinaryData', displayName: '移动二进制数据', description: '在节点间传递二进制数据', category: '文件操作' },
    ];
    
    const uniqueCategories = [...new Set(defaultTypes.map(node => node.category))];
    setNodeTypes(defaultTypes);
    setCategories(['all', ...uniqueCategories]);
    if (updateLoadingState) {
      setLoading(false);
    }
  };

  const filteredNodes = nodeTypes.filter(node => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '触发器': return '⚡';
      case '数据处理': return '🔄';
      case '流程控制': return '🔀';
      case '操作': return '⚙️';
      case '文件操作': return '📁';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">支持的节点类型</h2>
        <p className="text-gray-600">
          n8n 工作流生成器支持以下节点类型。这些节点可以组合使用来创建强大的自动化工作流。
        </p>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索节点类型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '全部' : `${getCategoryIcon(category)} ${category}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 节点列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{node.displayName}</h3>
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 mt-1">
                  {getCategoryIcon(node.category)} {node.category}
                </span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mb-3">{node.description}</p>
            <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {node.name}
            </code>
          </div>
        ))}
      </div>

      {filteredNodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">没有找到匹配的节点类型</p>
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 提示</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• 在生成工作流时，AI 会自动选择合适的节点类型</li>
          <li>• 你可以在需求描述中明确指定想要使用的节点</li>
          <li>• 每个节点都有特定的配置参数，生成后可以在 n8n 中进一步调整</li>
          <li>• 如果需要使用特定的服务（如 Google Sheets），请确保在 n8n 中配置了相应的凭据</li>
        </ul>
      </div>

      {error && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ 无法从服务器获取节点类型，显示的是默认节点列表
          </p>
        </div>
      )}
    </div>
  );
};

export default NodeTypesGuide;