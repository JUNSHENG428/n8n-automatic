import React, { useState } from 'react';
import { Info, X, Maximize2, Minimize2 } from 'lucide-react';
import { ArrowRightIcon, PlayIcon, CircleStackIcon, EnvelopeIcon, CogIcon } from '@heroicons/react/24/outline';

interface WorkflowPreviewProps {
  workflow: any;
}

const nodeIcons: { [key: string]: React.ReactNode } = {
  'n8n-nodes-base.start': <PlayIcon className="h-5 w-5" />,
  'n8n-nodes-base.cron': <CogIcon className="h-5 w-5" />,
  'n8n-nodes-base.webhook': <CircleStackIcon className="h-5 w-5" />,
  'n8n-nodes-base.httpRequest': <ArrowRightIcon className="h-5 w-5" />,
  'n8n-nodes-base.emailSend': <EnvelopeIcon className="h-5 w-5" />,
  'n8n-nodes-base.mysql': <CircleStackIcon className="h-5 w-5" />,
};

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ workflow }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  if (!workflow || !workflow.nodes) {
    return null;
  }

  // 计算画布大小
  const nodes = workflow.nodes || [];
  const minX = Math.min(...nodes.map((n: any) => n.position[0])) - 100;
  const maxX = Math.max(...nodes.map((n: any) => n.position[0])) + 300;
  const minY = Math.min(...nodes.map((n: any) => n.position[1])) - 100;
  const maxY = Math.max(...nodes.map((n: any) => n.position[1])) + 200;
  
  const width = maxX - minX;
  const height = maxY - minY;
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  // 获取节点类型的显示名称和颜色
  const getNodeInfo = (type: string) => {
    const nodeTypes: { [key: string]: { name: string; color: string; icon: string } } = {
      'n8n-nodes-base.manualTrigger': { name: '手动触发', color: '#ef4444', icon: '▶' },
      'n8n-nodes-base.cron': { name: '定时触发', color: '#f59e0b', icon: '⏰' },
      'n8n-nodes-base.webhook': { name: 'Webhook', color: '#8b5cf6', icon: '🔗' },
      'n8n-nodes-base.httpRequest': { name: 'HTTP请求', color: '#3b82f6', icon: '🌐' },
      'n8n-nodes-base.postgres': { name: 'PostgreSQL', color: '#10b981', icon: '🐘' },
      'n8n-nodes-base.mysql': { name: 'MySQL', color: '#06b6d4', icon: '🐬' },
      'n8n-nodes-base.set': { name: '设置数据', color: '#6366f1', icon: '✏️' },
      'n8n-nodes-base.if': { name: '条件判断', color: '#ec4899', icon: '❓' },
      'n8n-nodes-base.code': { name: '代码', color: '#8b5cf6', icon: '💻' },
      'n8n-nodes-base.emailSend': { name: '发送邮件', color: '#f97316', icon: '📧' },
      'n8n-nodes-base.slack': { name: 'Slack', color: '#84cc16', icon: '💬' },
      'n8n-nodes-base.merge': { name: '合并数据', color: '#14b8a6', icon: '🔗' },
      'n8n-nodes-base.splitInBatches': { name: '批量处理', color: '#f59e0b', icon: '📦' },
      'n8n-nodes-base.filter': { name: '过滤', color: '#ef4444', icon: '🔍' },
      'n8n-nodes-base.errorTrigger': { name: '错误触发', color: '#dc2626', icon: '❌' }
    };
    
    return nodeTypes[type] || { name: type.split('.').pop(), color: '#6b7280', icon: '📦' };
  };

  // 渲染连接线
  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    
    Object.entries(workflow.connections || {}).forEach(([sourceName, connections]: [string, any]) => {
      const sourceNode = nodes.find((n: any) => n.name === sourceName);
      if (!sourceNode) return;
      
      Object.entries(connections).forEach(([outputType, outputs]: [string, any]) => {
        outputs.forEach((outputConnections: any[]) => {
          outputConnections.forEach((conn: any) => {
            const targetNode = nodes.find((n: any) => n.name === conn.node);
            if (!targetNode) return;
            
            const key = `${sourceName}-${conn.node}-${outputType}-${conn.index}`;
            const x1 = sourceNode.position[0] + 240;
            const y1 = sourceNode.position[1] + 40;
            const x2 = targetNode.position[0];
            const y2 = targetNode.position[1] + 40;
            
            // 贝塞尔曲线控制点
            const dx = x2 - x1;
            const cp1x = x1 + dx * 0.5;
            const cp2x = x2 - dx * 0.5;
            
            lines.push(
              <g key={key}>
                <path
                  d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="transition-all hover:stroke-blue-500"
                />
              </g>
            );
          });
        });
      });
    });
    
    return lines;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          工作流预览
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 hover:bg-gray-100 rounded"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="relative">
        <svg 
          className={isFullscreen ? 'w-full h-[calc(100vh-10rem)]' : 'w-full h-96'}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="#94a3b8"
              />
            </marker>
          </defs>
          
          {/* 渲染连接线 */}
          {renderConnections()}
          
          {/* 渲染节点 */}
          {nodes.map((node: any) => {
            const nodeInfo = getNodeInfo(node.type);
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <g 
                key={node.id}
                transform={`translate(${node.position[0]}, ${node.position[1]})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                <rect
                  width="240"
                  height="80"
                  rx="4"
                  fill="white"
                  stroke={isSelected ? nodeInfo.color : '#e5e7eb'}
                  strokeWidth={isSelected ? '3' : '1'}
                  className="transition-all hover:shadow-lg"
                  filter={isSelected ? 'url(#shadow)' : ''}
                />
                
                <rect
                  width="240"
                  height="24"
                  rx="4"
                  fill={nodeInfo.color}
                  opacity="0.1"
                />
                
                <text
                  x="12"
                  y="16"
                  fontSize="20"
                  fill={nodeInfo.color}
                >
                  {nodeInfo.icon}
                </text>
                
                <text
                  x="40"
                  y="16"
                  fontSize="12"
                  fill={nodeInfo.color}
                  fontWeight="500"
                >
                  {nodeInfo.name}
                </text>
                
                <text
                  x="12"
                  y="48"
                  fontSize="14"
                  fill="#1f2937"
                  fontWeight="500"
                >
                  {node.name}
                </text>
                
                <text
                  x="12"
                  y="66"
                  fontSize="11"
                  fill="#6b7280"
                >
                  {node.type.split('.').pop()}
                </text>
              </g>
            );
          })}
          
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
          </defs>
        </svg>
        
        {/* 选中节点的详细信息 */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{selectedNode.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">类型：</span>
                <span className="font-mono text-xs">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-gray-500">ID：</span>
                <span className="font-mono text-xs">{selectedNode.id}</span>
              </div>
              {selectedNode.parameters && Object.keys(selectedNode.parameters).length > 0 && (
                <div>
                  <span className="text-gray-500">参数：</span>
                  <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedNode.parameters, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>节点数：{nodes.length}</span>
          <span>连接数：{Object.keys(workflow.connections || {}).length}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPreview; 