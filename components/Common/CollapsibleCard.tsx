
import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from './Icons'; 

interface CollapsibleCardProps {
  title: ReactNode; // Changed from string to ReactNode
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`border border-border-subtle rounded-lg shadow-sm bg-card-bg ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center justify-between w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-link-active focus:ring-offset-1 rounded-t-lg"
        aria-expanded={isOpen}
      >
        {/* Title is now rendered directly, expecting styling from the passed node if default is not enough */}
        <h3 className="text-lg font-semibold text-black">{title}</h3> {/* text-headings changed to text-black */}
        <ChevronDownIcon
          className={`w-5 h-5 text-text-muted transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border-subtle">
          {children}
        </div>
      )}
    </div>
  );
};