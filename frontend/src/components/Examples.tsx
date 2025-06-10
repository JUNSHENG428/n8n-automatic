import { useEffect, useState } from 'react'
import { LightBulbIcon, CircleStackIcon, BellIcon, ChartBarIcon, CloudIcon, CodeBracketIcon, CogIcon } from '@heroicons/react/24/outline'
import { getExamples } from '../api/workflow'
import AnimatedCard from './AnimatedCard'
import LoadingSpinner from './LoadingSpinner'

interface Example {
  name: string
  description: string
  requirement: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

interface ExamplesProps {
  onSelectExample: (requirement: string) => void
}

// 本地示例数据，以防API调用失败
const localExamples: Example[] = [
  // 数据处理类
  {
    name: '数据ETL处理',
    description: '从多个数据源提取、转换并加载数据',
    requirement: '创建一个工作流，每天凌晨3点从MySQL数据库读取前一天的销售订单数据，与产品信息表进行关联，计算每个产品的销售额和利润率，筛选出销售额前10的产品，生成Excel报表并通过邮件发送给销售经理，同时将汇总数据写入PostgreSQL数据仓库用于BI分析',
    category: 'data',
    difficulty: 'hard',
    tags: ['ETL', '数据库', '报表', '邮件']
  },
  {
    name: '实时数据同步',
    description: '监控数据变化并实时同步',
    requirement: '创建一个工作流，使用Webhook监听CRM系统的客户数据变更事件，当收到新客户注册或客户信息更新时，自动同步到邮件营销平台（如Mailchimp），根据客户标签分配到不同的邮件列表，并在Slack通知销售团队新客户信息',
    category: 'data',
    difficulty: 'medium',
    tags: ['Webhook', '实时同步', 'CRM', 'Slack']
  },
  
  // 监控告警类
  {
    name: '网站可用性监控',
    description: '定时检查网站状态并告警',
    requirement: '创建一个监控工作流，每5分钟检查公司网站和API服务的可用性，记录响应时间，当连续3次检查失败或响应时间超过5秒时，立即发送告警邮件给运维团队，同时在PagerDuty创建事件，并将监控数据存储到时序数据库用于分析',
    category: 'monitoring',
    difficulty: 'medium',
    tags: ['监控', '告警', 'API', '运维']
  },
  {
    name: '业务指标监控',
    description: '监控关键业务指标并预警',
    requirement: '创建一个工作流，每小时查询订单数据库，计算过去24小时的订单量、GMV、转化率等关键指标，与历史同期数据对比，当任何指标异常（如订单量下降超过20%）时，生成详细的分析报告，通过企业微信发送给相关负责人，并在Grafana更新监控面板',
    category: 'monitoring',
    difficulty: 'hard',
    tags: ['业务监控', '数据分析', '告警', '可视化']
  },
  
  // 自动化流程类
  {
    name: '发票自动处理',
    description: '自动化处理收到的发票',
    requirement: '创建一个工作流，监控指定邮箱收到的发票附件，自动下载PDF发票，使用OCR提取发票信息（金额、日期、供应商等），验证发票真伪，将数据录入财务系统，异常发票标记并通知财务人员手动处理，每月生成发票汇总报表',
    category: 'automation',
    difficulty: 'hard',
    tags: ['OCR', '财务', '自动化', '邮件']
  },
  {
    name: '内容发布自动化',
    description: '多平台内容同步发布',
    requirement: '创建一个工作流，当在内容管理系统发布新文章时，自动将内容同步发布到公司博客、微信公众号、LinkedIn和Twitter，根据不同平台的要求调整内容格式，生成适合的配图，安排最佳发布时间，并跟踪各平台的互动数据',
    category: 'automation',
    difficulty: 'medium',
    tags: ['内容发布', '社交媒体', '自动化']
  },
  
  // 数据分析类
  {
    name: '销售数据分析',
    description: '定期生成销售分析报告',
    requirement: '创建一个工作流，每周一早上从各个销售渠道（线上商城、线下门店、第三方平台）汇总上周销售数据，计算各渠道销售额、增长率、客单价等指标，识别畅销和滞销产品，生成可视化图表，创建PPT格式的周报并发送给管理层',
    category: 'analytics',
    difficulty: 'hard',
    tags: ['数据分析', '报表', '可视化', 'PPT']
  },
  {
    name: '用户行为分析',
    description: '分析用户行为并生成洞察',
    requirement: '创建一个工作流，每天从Google Analytics和自建埋点系统获取用户行为数据，分析用户访问路径、停留时间、转化漏斗，识别高价值用户群体，生成用户画像，将分析结果推送到数据看板，并为营销团队生成优化建议',
    category: 'analytics',
    difficulty: 'hard',
    tags: ['用户分析', 'GA', '数据挖掘', '营销']
  },
  
  // 集成同步类
  {
    name: '多系统数据集成',
    description: '整合多个业务系统数据',
    requirement: '创建一个工作流，定时从ERP系统读取产品信息，从WMS获取库存数据，从电商平台同步订单，将数据进行清洗和标准化，解决数据冲突，更新主数据管理系统，确保各系统数据一致性，记录同步日志并生成数据质量报告',
    category: 'integration',
    difficulty: 'hard',
    tags: ['系统集成', 'ERP', 'WMS', '主数据']
  },
  {
    name: 'API数据聚合',
    description: '聚合多个API数据源',
    requirement: '创建一个工作流，并行调用天气API、汇率API、股票API获取实时数据，对数据进行格式化和聚合，缓存常用数据减少API调用，通过统一的REST API对外提供服务，实现请求限流和认证，记录API使用情况',
    category: 'integration',
    difficulty: 'medium',
    tags: ['API', '数据聚合', '缓存', 'REST']
  }
];

const categoryIcons: Record<string, any> = {
  data: CircleStackIcon,
  monitoring: BellIcon,
  automation: CogIcon,
  analytics: ChartBarIcon,
  integration: CloudIcon,
  other: CodeBracketIcon
};

const categoryNames: Record<string, string> = {
  data: '数据处理',
  monitoring: '监控告警',
  automation: '流程自动化',
  analytics: '数据分析',
  integration: '系统集成',
  other: '其他'
};

export default function Examples({ onSelectExample }: ExamplesProps) {
  const [examples, setExamples] = useState<Example[]>(localExamples)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadExamples()
  }, [])

  const loadExamples = async () => {
    try {
      const data = await getExamples()
      // 合并API数据和本地数据
      const apiExamples = data.examples || []
      const mergedExamples = [...localExamples, ...apiExamples.filter((api: Example) => 
        !localExamples.some(local => local.name === api.name)
      )]
      setExamples(mergedExamples)
    } catch (error) {
      console.error('加载示例失败，使用本地数据:', error)
      // 如果API失败，使用本地示例
      setExamples(localExamples)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Object.keys(categoryNames)]
  
  const filteredExamples = selectedCategory === 'all' 
    ? examples 
    : examples.filter(ex => ex.category === selectedCategory)

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '复杂'
      default: return '一般'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" message="加载示例中..." />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">工作流示例库</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          探索各种场景的工作流示例，快速了解如何描述您的需求
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map(cat => {
          const Icon = categoryIcons[cat] || LightBulbIcon
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{cat === 'all' ? '全部' : categoryNames[cat]}</span>
              {cat !== 'all' && (
                <span className="ml-1 text-sm">
                  ({examples.filter(ex => ex.category === cat).length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 示例网格 */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {filteredExamples.map((example, index) => {
          const Icon = categoryIcons[example.category || 'other'] || LightBulbIcon
          return (
            <AnimatedCard
              key={index}
              onClick={() => {
                console.log('示例被点击:', example.requirement)
                onSelectExample(example.requirement)
              }}
              className="cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 rounded-lg shrink-0 shadow-md">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {example.name}
                      </h3>
                      {example.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(example.difficulty)}`}>
                          {getDifficultyText(example.difficulty)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {example.description}
                    </p>
                    
                    {/* 标签 */}
                    {example.tags && example.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {example.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                        {example.requirement}
                      </p>
                    </div>
                    <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 group">
                      使用此示例 
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )
        })}
      </div>

      {/* 提示区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
        <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-gray-100">💡 专业提示</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">描述需求的最佳实践：</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span>明确说明触发条件（定时、事件、手动）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span>详细描述数据来源和格式</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span>说明数据处理和转换逻辑</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span>指定输出方式和目标系统</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">常见的工作流模式：</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span><strong>ETL模式</strong>：提取→转换→加载</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span><strong>监控模式</strong>：检查→判断→告警</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span><strong>同步模式</strong>：监听→转换→更新</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span><strong>批处理模式</strong>：收集→处理→汇总</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}