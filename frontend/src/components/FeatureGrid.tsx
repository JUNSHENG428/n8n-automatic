import React from 'react';
import { Sparkles, Zap, Shield, Cloud, Cog, ChartBar } from 'lucide-react';
import AnimatedCard from './AnimatedCard';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureGrid: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI 智能生成',
      description: '使用先进的 AI 技术，自动理解您的需求并生成专业的 n8n 工作流配置',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '快速高效',
      description: '几秒钟内即可生成复杂的工作流，大幅提升自动化开发效率',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '质量保证',
      description: '自动验证生成的工作流，确保配置正确且可直接导入 n8n 使用',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: '云端支持',
      description: '支持各种云服务和 API 集成，轻松连接您的业务系统',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Cog className="w-6 h-6" />,
      title: '灵活定制',
      description: '生成的工作流完全可定制，您可以根据需要进一步调整和优化',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <ChartBar className="w-6 h-6" />,
      title: '智能分析',
      description: '自动分析您的需求，推荐最佳的节点组合和数据流设计',
      gradient: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {features.map((feature, index) => (
        <AnimatedCard key={index} hoverable={true}>
          <div className="p-6">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {feature.description}
            </p>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
};

export default FeatureGrid; 