import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', message }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-gray-200 dark:border-gray-700`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin`}></div>
        <div className={`absolute inset-2 ${size === 'small' ? 'h-4 w-4' : size === 'medium' ? 'h-6 w-6' : 'h-10 w-10'} rounded-full bg-blue-100 dark:bg-blue-900 animate-pulse`}></div>
      </div>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 