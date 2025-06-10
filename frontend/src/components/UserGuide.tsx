import React from 'react';
import { AlertCircle, Key, Database, FileText, CheckCircle } from 'lucide-react';

interface UserGuideProps {
  guide: {
    credentials: Array<{
      service: string;
      type: string;
      steps: string[];
      requiredFields: string[];
    }>;
    parameters: Array<{
      name: string;
      description: string;
      example: string;
    }>;
    dataSources: Array<{
      type: string;
      format: string;
      requirements: string;
    }>;
    preparations: string[];
  };
}

export const UserGuide: React.FC<UserGuideProps> = ({ guide }) => {
  if (!guide || (!guide.credentials.length && !guide.parameters.length && !guide.dataSources.length)) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2 text-blue-800 font-semibold text-lg">
        <AlertCircle className="w-5 h-5" />
        准备指南
      </div>
      
      {/* 凭据准备 */}
      {guide.credentials.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-gray-800 font-medium">
            <Key className="w-4 h-4" />
            需要准备的凭据
          </h3>
          {guide.credentials.map((cred, index) => (
            <div key={index} className="bg-white rounded p-4 space-y-2">
              <div className="font-medium text-gray-900">{cred.service} - {cred.type}</div>
              <div className="text-sm text-gray-600">
                <div className="mb-2">准备步骤：</div>
                <ol className="list-decimal list-inside space-y-1">
                  {cred.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-medium">必需字段：</span> {cred.requiredFields.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 参数准备 */}
      {guide.parameters.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-gray-800 font-medium">
            <Database className="w-4 h-4" />
            需要准备的参数
          </h3>
          {guide.parameters.map((param, index) => (
            <div key={index} className="bg-white rounded p-4 space-y-1">
              <div className="font-medium text-gray-900">{param.name}</div>
              <div className="text-sm text-gray-600">{param.description}</div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">示例：</span> {param.example}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 数据源准备 */}
      {guide.dataSources.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-gray-800 font-medium">
            <FileText className="w-4 h-4" />
            数据源要求
          </h3>
          {guide.dataSources.map((source, index) => (
            <div key={index} className="bg-white rounded p-4 space-y-1">
              <div className="font-medium text-gray-900">{source.type} ({source.format})</div>
              <div className="text-sm text-gray-600">{source.requirements}</div>
            </div>
          ))}
        </div>
      )}

      {/* 通用准备事项 */}
      {guide.preparations.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-gray-800 font-medium">
            <CheckCircle className="w-4 h-4" />
            其他准备事项
          </h3>
          <ul className="bg-white rounded p-4 space-y-2">
            {guide.preparations.map((prep, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                {prep}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 