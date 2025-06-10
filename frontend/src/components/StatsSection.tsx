import React, { useEffect, useState } from 'react';
import { Workflow, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

const StatsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);

  const stats: StatItem[] = [
    {
      icon: <Workflow className="w-6 h-6" />,
      value: 1234,
      label: '工作流已生成',
      suffix: '+'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      value: 98,
      label: '生成准确率',
      suffix: '%'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      value: 5,
      label: '平均生成时间',
      suffix: 's'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      value: 567,
      label: '活跃用户',
      suffix: '+'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // 动画计数效果
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues(stats.map(stat => Math.floor(stat.value * progress)));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                {stat.icon}
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {animatedValues[index]}{stat.suffix}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;