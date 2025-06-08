
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  Icon?: React.ElementType;
}

export const Input: React.FC<InputProps> = ({ label, name, error, Icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-body mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`
            block w-full appearance-none rounded-lg border 
            bg-card-bg text-text-body placeholder-text-muted
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-link-active focus:border-link-active sm:text-sm
            ${Icon ? 'pl-10' : 'px-3 md:px-4'} py-2 md:py-2.5
            ${error ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500' : 'border-border-subtle'}
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, name, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-body mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={4}
        className={`
          block w-full appearance-none rounded-lg border px-3 md:px-4 py-2 md:py-2.5
          bg-card-bg text-text-body placeholder-text-muted
          focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-link-active focus:border-link-active sm:text-sm
          ${error ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500' : 'border-border-subtle'}
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};