import React, { useState, useEffect } from 'react';
import { History, Trash2, Eye, Download, Calendar, Search } from 'lucide-react';

interface WorkflowHistoryItem {
  id: string;
  requirement: string;
  workflow: any;
  userGuide: any;
  createdAt: Date;
}

interface WorkflowHistoryProps {
  onRestore: (item: WorkflowHistoryItem) => void;
}

const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<WorkflowHistoryItem | null>(null);

  // 从localStorage加载历史记录
  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem('workflow-history');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          setHistory(items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          })));
        } catch (error) {
          console.error('加载历史记录失败:', error);
        }
      }
    };
    
    loadHistory();
    // 监听存储变化
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  // 删除历史记录
  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('workflow-history', JSON.stringify(newHistory));
  };

  // 导出历史记录
  const exportItem = (item: WorkflowHistoryItem) => {
    const dataStr = JSON.stringify({
      requirement: item.requirement,
      workflow: item.workflow,
      userGuide: item.userGuide,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `workflow-${item.id}.json`);
    linkElement.click();
  };

  // 过滤历史记录
  const filteredHistory = history.filter(item =>
    item.requirement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="w-5 h-5" />
            历史记录
          </h3>
          <span className="text-sm text-gray-500">
            共 {history.length} 条记录
          </span>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无历史记录</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {item.requirement}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.createdAt.toLocaleString()}
                      </span>
                      <span>
                        {item.workflow.nodes?.length || 0} 个节点
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRestore(item)}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="恢复工作流"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportItem(item)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="导出"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="text-lg font-medium">工作流详情</h4>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-1">需求描述</h5>
                  <p className="text-sm text-gray-600">{selectedItem.requirement}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-1">创建时间</h5>
                  <p className="text-sm text-gray-600">{selectedItem.createdAt.toLocaleString()}</p>
                </div>
                
                <div>
                  <h5 className="font-medium mb-1">工作流结构</h5>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedItem.workflow, null, 2)}
                  </pre>
                </div>
                
                {selectedItem.userGuide && (
                  <div>
                    <h5 className="font-medium mb-1">用户指南</h5>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedItem.userGuide, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  onRestore(selectedItem);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                恢复此工作流
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowHistory; 