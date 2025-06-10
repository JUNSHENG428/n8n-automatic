import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { SparklesIcon, DocumentArrowDownIcon, ClipboardDocumentIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import Editor from '@monaco-editor/react'
import { generateWorkflow } from '../api/workflow'
import WorkflowPreview from './WorkflowPreview'
import RequirementTemplates from './RequirementTemplates'
import { UserGuide } from './UserGuide'
import { AlertCircle, CheckCircle, Loader2, Copy, Download, Upload, Eye, History, Lightbulb, HelpCircle, Sparkles, Workflow, Code, BookOpen, FileJson } from 'lucide-react'
import WorkflowHistory from './WorkflowHistory'
import AnimatedCard from './AnimatedCard'
import LoadingSpinner from './LoadingSpinner'

interface WorkflowGeneratorProps {
  initialRequirement?: string
  onRequirementUsed?: () => void
}

interface WorkflowHistory {
  id: string
  requirement: string
  workflow: any
  createdAt: Date
  userGuide?: any
}

export default function WorkflowGenerator({ initialRequirement = '', onRequirementUsed }: WorkflowGeneratorProps) {
  const [requirement, setRequirement] = useState<string>(initialRequirement)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState('')
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [promptPreview, setPromptPreview] = useState('')
  const [history, setHistory] = useState<WorkflowHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)
  const [userGuide, setUserGuide] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [validation, setValidation] = useState<any>(null)
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false)

  // 保存到历史记录
  const saveToHistory = (requirement: string, workflow: any, userGuide: any) => {
    const historyItem: WorkflowHistory = {
      id: Date.now().toString(),
      requirement,
      workflow,
      userGuide,
      createdAt: new Date()
    };
    
    const newHistory = [historyItem, ...history.slice(0, 9)]; // 最多保存10条
    setHistory(newHistory);
    localStorage.setItem('workflow-history', JSON.stringify(newHistory));
  };

  // 恢复历史记录
  const restoreFromHistory = (item: WorkflowHistory) => {
    setRequirement(item.requirement);
    setWorkflow(item.workflow);
    setUserGuide(item.userGuide);
    if (item.workflow) {
      validateWorkflow(item.workflow);
    }
  };

  // 当收到初始需求时，更新输入框内容
  useEffect(() => {
    if (initialRequirement) {
      setRequirement(initialRequirement)
      // 清空之前的工作流结果
      setWorkflow(null)
      // 通知父组件已经使用了需求
      if (onRequirementUsed) {
        onRequirementUsed()
      }
    }
  }, [initialRequirement, onRequirementUsed])

  // 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('workflow-history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // 生成 prompt 预览
  const generatePromptPreview = useCallback((req: string) => {
    if (!req.trim()) return '';
    
    // 简单的前端 prompt 优化预览（实际优化在后端进行）
    const triggers = [];
    const actions = [];
    
    if (req.includes('定时') || req.includes('每天')) triggers.push('定时触发器');
    if (req.includes('webhook') || req.includes('API')) triggers.push('Webhook触发器');
    if (req.includes('邮件')) actions.push('邮件操作');
    if (req.includes('数据库')) actions.push('数据库操作');
    if (req.includes('通知')) actions.push('发送通知');
    
    return `系统将基于您的需求生成专业的 n8n 工作流：

📌 识别的触发器：${triggers.length > 0 ? triggers.join('、') : '手动触发'}
🔧 识别的操作：${actions.join('、') || '基础操作'}
📊 数据流：自动配置节点间的数据传递
⚡ 错误处理：自动添加重试和错误通知机制

系统会生成完整的工作流配置，包括所有必要的节点连接和参数设置。`;
  }, []);

  // 更新 prompt 预览
  useEffect(() => {
    const preview = generatePromptPreview(requirement);
    setPromptPreview(preview);
  }, [requirement, generatePromptPreview]);

  // 验证工作流
  const validateWorkflow = async (workflowData: any) => {
    try {
      const response = await fetch('/api/workflow/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflow: workflowData }),
      });

      const result = await response.json();
      if (result.success) {
        setValidation(result);
      }
    } catch (err) {
      console.error('验证工作流时出错:', err);
    }
  };

  const handleGenerate = async () => {
    if (!requirement.trim()) {
      setError('请输入工作流需求')
      return
    }

    if (!apiKey.trim()) {
      setError('请输入 OpenAI API 密钥')
      setShowApiKeyHelp(true)
      return
    }

    setLoading(true)
    setError('')
    setWorkflow(null)
    setUserGuide(null)
    setValidation(null)
    
    try {
      const response = await fetch('/api/workflow/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          requirement,
          apiKey 
        }),
      })
      
      // 检查响应是否为空
      const text = await response.text()
      if (!text) {
        throw new Error('服务器返回了空响应')
      }
      
      let result;
      try {
        result = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON解析错误:', parseError)
        console.error('响应文本:', text)
        throw new Error('服务器返回的数据格式有误')
      }
      
      if (!response.ok) {
        throw new Error(result.details || result.error || '生成失败')
      }
      
      if (result.success && result.workflow) {
        setWorkflow(result.workflow)
        setUserGuide(result.userGuide)
        
        // 验证生成的工作流
        await validateWorkflow(result.workflow)
        
        // 保存到历史记录
        saveToHistory(requirement, result.workflow, result.userGuide)
        
        // 通知父组件
        if (onRequirementUsed) {
          onRequirementUsed()
        }
      } else {
        throw new Error(result.error || '生成失败')
      }
    } catch (error: any) {
      console.error('生成工作流错误:', error)
      setError(error.message || '生成工作流时出错，请检查网络连接和API密钥')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    if (workflow) {
      navigator.clipboard.writeText(JSON.stringify(workflow, null, 2))
      toast.success('已复制到剪贴板')
    }
  }

  const handleDownload = () => {
    if (workflow) {
      const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflow.name || 'workflow'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('下载成功')
    }
  }

  // 导出工作流
  const exportWorkflow = () => {
    if (!workflow) return;
    
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `n8n-workflow-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // 导入工作流
  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setWorkflow(imported);
        validateWorkflow(imported);
      } catch (error) {
        setError('导入失败：文件格式无效');
      }
    };
    reader.readAsText(file);
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!workflow) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('复制失败');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：输入区域 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              需求描述
            </h2>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="请详细描述您的工作流需求，例如：
创建一个工作流，每天早上 9 点从 MySQL 数据库读取用户数据，筛选出最近注册的用户，并发送欢迎邮件..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[200px] resize-none transition-colors"
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                OpenAI API Key（可选）
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                如果不提供，将使用系统默认的 API Key
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !requirement.trim()}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>生成工作流</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt 预览 */}
          {requirement && (
            <AnimatedCard className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700 p-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">智能分析预览</h4>
                  <pre className="text-xs text-indigo-800 dark:text-indigo-200 whitespace-pre-wrap font-mono">{promptPreview}</pre>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* 右侧：提示和辅助信息 */}
        <div className="space-y-6">
          {/* 提示信息 */}
          <AnimatedCard className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              提示
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>尽可能详细地描述您的需求</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>说明触发条件（定时、Webhook、手动等）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>描述数据来源和处理步骤</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>说明最终的输出或动作</span>
              </li>
            </ul>
          </AnimatedCard>

          {/* API 密钥帮助 */}
          {showApiKeyHelp && (
            <AnimatedCard className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700 p-4">
              <p className="font-medium mb-1 text-yellow-900 dark:text-yellow-100">如何获取 OpenAI API 密钥：</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">OpenAI API Keys</a></li>
                <li>登录您的 OpenAI 账户</li>
                <li>点击 "Create new secret key"</li>
                <li>复制生成的密钥并粘贴到上方输入框</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                注意：API 密钥仅在本地使用，不会被存储或发送到除 OpenAI 外的任何服务器。
              </p>
            </AnimatedCard>
          )}

          {/* 错误提示 */}
          {error && (
            <AnimatedCard className={`${
              error.includes('地区') ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : 
              'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            } p-4`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-5 h-5 ${
                  error.includes('地区') ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                } mt-0.5`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    error.includes('地区') ? 'text-yellow-800 dark:text-yellow-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {error.includes('地区') ? '地区限制' : '错误'}
                  </p>
                  <p className={`text-sm ${
                    error.includes('地区') ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'
                  } mt-1`}>{error}</p>
                  
                  {/* 地区限制的解决方案 */}
                  {error.includes('地区') && (
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">解决方案：</p>
                      <div className="space-y-2 text-yellow-700 dark:text-yellow-300">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">1.</span>
                          <div>
                            <p className="font-medium">使用 API 代理服务</p>
                            <p className="text-xs mt-1">可以使用如 openai-proxy、cloudflare workers 等代理服务</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">2.</span>
                          <div>
                            <p className="font-medium">配置代理地址（推荐）</p>
                            <p className="text-xs mt-1">在环境变量中设置 OPENAI_API_BASE_URL 为代理地址</p>
                            <code className="text-xs bg-yellow-100 dark:bg-yellow-800/30 px-1 py-0.5 rounded mt-1 inline-block">
                              https://api.openai-proxy.com/v1
                            </code>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">3.</span>
                          <div>
                            <p className="font-medium">使用 Azure OpenAI</p>
                            <p className="text-xs mt-1">Azure 在更多地区可用，可考虑申请 Azure OpenAI 服务</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400">4.</span>
                          <div>
                            <p className="font-medium">暂时使用模板生成</p>
                            <p className="text-xs mt-1">系统会自动生成基于模板的工作流供您参考</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>

      {/* 生成结果区域 - 放在网格外部，占据整个宽度 */}
      {(workflow || userGuide) && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">生成结果</h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 左侧：工作流详情 */}
            <div className="space-y-6">
              {/* 用户准备指南 */}
              {userGuide && <UserGuide guide={userGuide} />}
              
              {/* 工作流JSON */}
              {workflow && (
                <AnimatedCard className="p-0" hoverable={false}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      工作流 JSON
                    </h3>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded overflow-x-auto max-h-96 border border-gray-200 dark:border-gray-700">
                      {JSON.stringify(workflow, null, 2)}
                    </pre>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                        title="复制工作流 JSON"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? '已复制' : '复制'}
                      </button>
                      
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded transition-colors"
                        title="导出工作流文件"
                      >
                        <Download className="w-4 h-4" />
                        导出文件
                      </button>
                      
                      <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300 rounded transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        导入文件
                        <input
                          type="file"
                          accept=".json"
                          onChange={importWorkflow}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </AnimatedCard>
              )}
            </div>
            
            {/* 右侧：可视化预览 */}
            <div className="space-y-6">
              {/* 工作流预览 */}
              {workflow && <WorkflowPreview workflow={workflow} />}
              
              {/* 验证结果 */}
              {validation && (
                <AnimatedCard className="p-4" hoverable={false}>
                  <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">验证结果</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {validation.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {validation.isValid ? '工作流结构有效' : '工作流存在问题'}
                      </span>
                    </div>
                    {validation.issues && validation.issues.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-yellow-600 dark:text-yellow-400">
                        {validation.issues.map((issue: string, index: number) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AnimatedCard>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 历史记录区域 */}
      {history.length > 0 && (
        <div className="mt-8">
          <WorkflowHistory onRestore={restoreFromHistory} />
        </div>
      )}
    </div>
  )
} 