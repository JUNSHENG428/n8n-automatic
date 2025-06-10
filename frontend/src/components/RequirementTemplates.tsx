import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface Template {
  category: string
  templates: {
    name: string
    template: string
    variables: string[]
  }[]
}

interface RequirementTemplatesProps {
  onSelectTemplate: (template: string) => void
}

const templates: Template[] = [
  {
    category: '数据同步',
    templates: [
      {
        name: '数据库定时同步',
        template: '每天 [时间] 从 [源数据库] 读取 [表名] 数据，同步到 [目标数据库]',
        variables: ['时间', '源数据库', '表名', '目标数据库']
      },
      {
        name: 'API 数据采集',
        template: '每隔 [时间间隔] 调用 [API地址]，将返回的数据保存到 [存储位置]',
        variables: ['时间间隔', 'API地址', '存储位置']
      }
    ]
  },
  {
    category: '通知自动化',
    templates: [
      {
        name: '邮件通知',
        template: '当 [触发条件] 时，发送邮件到 [收件人]，邮件标题为 [标题]，内容包含 [内容]',
        variables: ['触发条件', '收件人', '标题', '内容']
      },
      {
        name: 'Slack 消息',
        template: '监控 [数据源]，当 [条件] 时，发送消息到 Slack [频道名称]',
        variables: ['数据源', '条件', '频道名称']
      }
    ]
  },
  {
    category: '文件处理',
    templates: [
      {
        name: 'CSV 处理',
        template: '监控 [文件夹路径]，当有新的 CSV 文件时，[处理操作] 并将结果 [输出操作]',
        variables: ['文件夹路径', '处理操作', '输出操作']
      },
      {
        name: '文件备份',
        template: '每 [时间间隔] 将 [源文件夹] 的文件备份到 [目标位置]',
        variables: ['时间间隔', '源文件夹', '目标位置']
      }
    ]
  }
]

export default function RequirementTemplates({ onSelectTemplate }: RequirementTemplatesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [variables, setVariables] = useState<{ [key: string]: string }>({})

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    const initialVars: { [key: string]: string } = {}
    template.variables.forEach((v: string) => {
      initialVars[v] = ''
    })
    setVariables(initialVars)
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return
    
    let result = selectedTemplate.template
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(`[${key}]`, value || `[${key}]`)
    })
    
    onSelectTemplate(result)
    setSelectedTemplate(null)
    setVariables({})
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">需求模板</h3>
      
      {selectedTemplate ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
            <p className="text-sm text-blue-700 mt-1">{selectedTemplate.template}</p>
          </div>
          
          <div className="space-y-3">
            {selectedTemplate.variables.map((variable: string) => (
              <div key={variable}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {variable}
                </label>
                <input
                  type="text"
                  value={variables[variable] || ''}
                  onChange={(e) => setVariables({ ...variables, [variable]: e.target.value })}
                  className="input-field"
                  placeholder={`请输入${variable}`}
                />
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleApplyTemplate}
              className="btn-primary flex-1"
            >
              应用模板
            </button>
            <button
              onClick={() => {
                setSelectedTemplate(null)
                setVariables({})
              }}
              className="btn-secondary flex-1"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((category) => (
            <div key={category.category} className="border rounded-lg">
              <button
                onClick={() => setExpandedCategory(
                  expandedCategory === category.category ? null : category.category
                )}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="font-medium">{category.category}</span>
                {expandedCategory === category.category ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
              
              {expandedCategory === category.category && (
                <div className="border-t">
                  {category.templates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{template.template}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 