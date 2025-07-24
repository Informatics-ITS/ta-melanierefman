import { useEffect } from 'react';
import { HiCheckCircle, HiMiniXCircle } from "react-icons/hi2";

import { Typography } from '../../atom/typography';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-24 md:right-12 right-4 z-[9999] flex items-center justify-center w-full max-w-xs md:max-w-md p-4 rounded-sm shadow-md border-l-4 bg-typo-white2 
        ${type === 'success' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'} 
        animate-fade-in`}
      role="alert"
    >
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full">
        {type === 'success' ? (
          <HiCheckCircle size={20} className="text-green-600" />
        ) : (
          <HiMiniXCircle size={20} className="text-red-600" />
        )}
      </div>
      <div className="ms-3 flex-1 text-sm break-words whitespace-normal">
        <Typography
          type="caption1"
          font="dm-sans"
          weight="medium"
          className="break-words whitespace-normal"
        >
          {message}
        </Typography>
      </div>
      <button
        onClick={onClose}
        className="ms-auto -mx-1.5 -my-1.5 text-typo-icon hover:text-typo focus:outline-none p-1.5 rounded-lg"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;