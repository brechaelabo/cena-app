
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode; // Changed from string to ReactNode
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, actions }) => {
  const headerBorderColorClass = 'border-border-subtle'; 
  const defaultCardBgClass = 'bg-card-bg'; 

  const cardRootBgClass = className.includes('bg-') ? '' : defaultCardBgClass;

  return (
    <div className={`${cardRootBgClass} shadow-lg rounded-lg overflow-hidden border border-border-subtle ${className}`}>
      {(title || actions) && (
        <div className={`px-4 md:px-5 py-3 border-b ${headerBorderColorClass} flex justify-between items-center ${defaultCardBgClass}`}>
          {title && <h3 className="font-semibold text-black">{title}</h3>} {/* text-headings changed to text-black */}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 md:p-5">
        {children}
      </div>
    </div>
  );
};