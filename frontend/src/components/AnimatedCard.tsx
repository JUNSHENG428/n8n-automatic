import React, { useState } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white dark:bg-gray-800 
        rounded-xl shadow-sm 
        border border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-out
        ${hoverable ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 渐变背景效果 */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br 
          from-blue-500/5 to-purple-500/5 
          dark:from-blue-400/10 dark:to-purple-400/10
          opacity-0 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : ''}
        `}
      />
      
      {/* 光晕效果 */}
      {hoverable && (
        <div
          className={`
            absolute -inset-px bg-gradient-to-r 
            from-blue-500 to-purple-500 
            rounded-xl opacity-0 blur transition-opacity duration-300
            ${isHovered ? 'opacity-20' : ''}
          `}
        />
      )}
      
      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedCard; 