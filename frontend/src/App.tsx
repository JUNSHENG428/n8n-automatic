import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import WorkflowGenerator from './components/WorkflowGenerator'
import Header from './components/Header'
import Examples from './components/Examples'
import NodeTypesGuide from './components/NodeTypesGuide'
import WorkflowTemplates from './components/WorkflowTemplates'
import { CogIcon, BookOpenIcon, SparklesIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import UserGuideTab from './components/UserGuideTab'

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'templates' | 'examples' | 'node-types' | 'guide'>('generator')
  const [selectedRequirement, setSelectedRequirement] = useState('')

  const handleSelectExample = (requirement: string) => {
    setSelectedRequirement(requirement)
    setActiveTab('generator')
    toast.success('已选择示例需求', {
      duration: 2000,
      position: 'top-center'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster position="top-right" />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* 标签导航 */}
        <div className="flex space-x-1 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 transition-colors">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CogIcon className="h-5 w-5" />
            <span>工作流生成器</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>模板库</span>
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'examples'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <SparklesIcon className="h-5 w-5" />
            <span>示例</span>
          </button>
          <button
            onClick={() => setActiveTab('node-types')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'node-types'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>节点类型</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpenIcon className="h-5 w-5" />
            <span>使用指南</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="animate-fade-in">
          {activeTab === 'generator' ? (
            <WorkflowGenerator 
              initialRequirement={selectedRequirement}
              onRequirementUsed={() => setSelectedRequirement('')}
            />
          ) : activeTab === 'templates' ? (
            <WorkflowTemplates
              onSelectTemplate={(requirement) => {
                setSelectedRequirement(requirement);
                setActiveTab('generator');
              }}
            />
          ) : activeTab === 'examples' ? (
            <Examples onSelectExample={handleSelectExample} />
          ) : activeTab === 'node-types' ? (
            <NodeTypesGuide />
          ) : (
            <UserGuideTab />
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          <p>
            使用 AI 技术将您的需求转化为 n8n 工作流 • 
            <a 
              href="https://n8n.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-1 transition-colors"
            >
              了解更多关于 n8n
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App 