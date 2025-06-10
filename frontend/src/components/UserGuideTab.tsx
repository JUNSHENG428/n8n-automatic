import React from 'react';
import { BookOpen, CheckCircle, Code, Database, Mail, Zap, ArrowRight } from 'lucide-react';

const UserGuideTab: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          n8n 工作流生成器使用指南
        </h1>

        {/* 快速开始 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">🚀 快速开始</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">1. 获取 OpenAI API 密钥</p>
                <p className="text-sm text-gray-600 mt-1">
                  访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a> 创建您的 API 密钥
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">2. 描述您的需求</p>
                <p className="text-sm text-gray-600 mt-1">
                  在输入框中详细描述您想要创建的工作流，包括触发条件、数据处理步骤和最终输出
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">3. 生成并导出工作流</p>
                <p className="text-sm text-gray-600 mt-1">
                  点击"生成工作流"按钮，系统将自动创建专业的 n8n 工作流配置，您可以直接导入到 n8n 中使用
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 功能特点 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">✨ 功能特点</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium">智能生成</h3>
              </div>
              <p className="text-sm text-gray-600">
                基于 GPT-4 的智能分析，自动理解您的需求并生成最优的工作流配置
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">丰富模板</h3>
              </div>
              <p className="text-sm text-gray-600">
                提供多种预置模板，涵盖数据同步、ETL处理、通知告警等常见场景
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium">可视化预览</h3>
              </div>
              <p className="text-sm text-gray-600">
                实时预览工作流结构，支持节点详情查看和全屏展示
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-green-500" />
                <h3 className="font-medium">历史管理</h3>
              </div>
              <p className="text-sm text-gray-600">
                自动保存生成历史，支持搜索、恢复和导出历史工作流
              </p>
            </div>
          </div>
        </section>

        {/* 最佳实践 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">💡 最佳实践</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium mb-3">如何描述需求以获得最佳结果：</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <div>
                  <strong>明确触发条件</strong>：说明工作流何时执行（定时、Webhook、手动等）
                  <p className="text-gray-600 mt-1">
                    示例："每天早上9点"、"收到POST请求时"、"文件上传后"
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <div>
                  <strong>描述数据来源</strong>：说明数据从哪里获取
                  <p className="text-gray-600 mt-1">
                    示例："从MySQL数据库users表"、"调用REST API"、"读取CSV文件"
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <div>
                  <strong>说明处理步骤</strong>：详细描述数据如何处理
                  <p className="text-gray-600 mt-1">
                    示例："筛选活跃用户"、"计算总金额"、"格式化日期"
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <div>
                  <strong>指定输出方式</strong>：说明处理结果如何输出
                  <p className="text-gray-600 mt-1">
                    示例："发送邮件通知"、"更新数据库"、"生成Excel报表"
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">❓ 常见问题</h2>
          <div className="space-y-4">
            <details className="border rounded-lg">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium">
                生成的工作流如何导入 n8n？
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-600">
                <ol className="list-decimal list-inside space-y-1">
                  <li>点击"导出文件"按钮下载 JSON 文件</li>
                  <li>打开您的 n8n 实例</li>
                  <li>点击左侧菜单的"工作流" → "导入"</li>
                  <li>选择下载的 JSON 文件</li>
                  <li>根据提示完成导入</li>
                </ol>
              </div>
            </details>
            
            <details className="border rounded-lg">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium">
                如何处理凭据和认证？
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-600">
                生成的工作流使用占位符凭据。导入 n8n 后，您需要：
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>为需要认证的节点配置真实凭据</li>
                  <li>根据用户准备指南准备必要的 API 密钥</li>
                  <li>在 n8n 凭据管理中添加相应的认证信息</li>
                </ul>
              </div>
            </details>
            
            <details className="border rounded-lg">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium">
                生成失败怎么办？
              </summary>
              <div className="p-4 pt-0 text-sm text-gray-600">
                如果生成失败，请尝试：
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>检查 OpenAI API 密钥是否有效</li>
                  <li>确保网络连接正常</li>
                  <li>尝试更详细地描述您的需求</li>
                  <li>使用模板库中的预置模板</li>
                  <li>查看浏览器控制台是否有错误信息</li>
                </ul>
              </div>
            </details>
          </div>
        </section>

        {/* 提示 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            开始使用
          </h3>
          <p className="text-sm text-gray-700">
            现在就切换到"工作流生成器"标签页，开始创建您的第一个自动化工作流吧！
            如果您不确定从哪里开始，可以先浏览"模板库"中的示例。
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserGuideTab; 