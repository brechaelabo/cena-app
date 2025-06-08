
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  iconOnly = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: 'bg-action-primary-bg text-action-primary-text hover:bg-action-primary-hover focus:ring-action-primary-bg',
    secondary: 'bg-action-secondary-bg text-action-secondary-text hover:bg-action-secondary-hover focus:ring-action-secondary-bg',
    outline: 'border border-border-subtle text-text-body hover:bg-gray-50 focus:ring-action-primary-bg', // Usando text-body para texto escuro
    ghost: 'text-text-body hover:bg-gray-100 focus:ring-action-primary-bg', // Usando text-body para texto escuro
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const regularSizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base', // Padrão
    lg: 'px-6 py-3 text-lg',
  };

  const iconOnlySizeStyles = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  const currentSizeStyle = iconOnly ? iconOnlySizeStyles[size] : regularSizeStyles[size];

  const loadingStyles = isLoading ? 'opacity-75 cursor-not-allowed' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const spinnerColorClass = (variant === 'primary' || variant === 'danger') ? 'text-action-primary-text' : 'text-action-primary-bg';

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${currentSizeStyle} ${loadingStyles} ${disabledStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin h-5 w-5 ${children ? 'mr-2' : ''} ${spinnerColorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && iconOnly && children}
      {!isLoading && !iconOnly && (
        <>
          {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};