
import React, { useEffect } from 'react';
import { XMarkIcon } from './Icons'; // Certifique-se que XMarkIcon está exportado de Icons.tsx

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

// Updated styles for better visibility on a light theme page background
const toastTypeStyles = {
  success: {
    bg: 'bg-green-600', // Darker green
    iconColor: 'text-green-100', // Lighter icon for contrast
    borderColor: 'border-green-700', // Darker border
  },
  error: {
    bg: 'bg-red-600', // Darker red
    iconColor: 'text-red-100',
    borderColor: 'border-red-700',
  },
  info: {
    bg: 'bg-blue-600', // Darker blue
    iconColor: 'text-blue-100',
    borderColor: 'border-blue-700',
  },
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = toastTypeStyles[type];

  return (
    <div
      className={`
        ${styles.bg} border-l-4 ${styles.borderColor} text-white 
        p-4 shadow-lg rounded-md flex justify-between items-center 
        min-w-[250px] max-w-sm
      `}
      role="alert"
    >
      <div className="flex items-center">
        {/* Ícone opcional baseado no tipo */}
        {type === 'success' && (
          <svg className={`w-6 h-6 ${styles.iconColor} mr-2`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )}
        {type === 'error' && (
           <svg className={`w-6 h-6 ${styles.iconColor} mr-2`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )}
        {type === 'info' && (
          <svg className={`w-6 h-6 ${styles.iconColor} mr-2`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )}
        <span className="text-sm">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`ml-4 p-1 rounded-md text-gray-200 hover:text-white hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-gray-300`}
        aria-label="Fechar notificação"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
