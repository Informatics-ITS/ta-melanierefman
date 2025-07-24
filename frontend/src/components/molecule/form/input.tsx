import { useState, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Typography } from '../../atom/typography';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  name: string;
  isPassword?: boolean;
  prefix?: string;
  error?: string;
  description?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  name,
  isPassword = false,
  prefix,
  error,
  description,
  className,
  maxLength = 255,
  showCharacterCount = false,
  onChange,
  value,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue.length <= maxLength) {
      onChange?.(e);
    } else {
      const truncatedValue = inputValue.slice(0, maxLength);
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: truncatedValue
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(newEvent);
    }
  };

  const currentLength = value?.toString().length || 0;
  const isNearLimit = currentLength >= maxLength * 0.8;
  const isAtLimit = currentLength >= maxLength;

  return (
    <div className="relative">
      {label && (
        <div className="mb-2">
          <label htmlFor={id}>
            <Typography type="caption1" font="dm-sans">
              {label}
            </Typography>
          </label>
          {description && (
            <Typography type="caption1" font="dm-sans" className="text-typo-secondary">
              {description}
            </Typography>
          )}
        </div>
      )}
      
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-typo-secondary font-dm-sans">
            {prefix}
          </span>
        )}
        
        <input
          id={id}
          name={name}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          type={isPassword && !isPasswordVisible ? 'password' : 'text'}
          maxLength={maxLength}
          className={`block w-full p-2 pr-10 text-base font-dm-sans ${
            prefix ? 'pl-10' : ''
          } placeholder:text-typo-secondary placeholder:font-dm-sans border ${
            error ? 'border-primary' : isAtLimit ? 'border-yellow-500' : 'border-typo-outline'
          } ${
            error ? 'bg-white' : isFocused || value?.toString().trim() ? 'bg-typo-white2' : 'bg-typo-white'
          } focus:bg-typo-white2 focus:outline-none focus:ring-1 ${
            error ? 'focus:ring-primary' : isAtLimit ? 'focus:ring-yellow-500' : 'focus:ring-primary'
          } rounded-md ${className ?? ''}`}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} className="text-typo-icon" />
            ) : (
              <Eye size={20} className="text-typo-icon" />
            )}
          </button>
        )}
      </div>

      {showCharacterCount && (
        <div className="flex justify-end mt-1">
          <Typography 
            type="caption1" 
            font="dm-sans" 
            className={`text-xs ${
              isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : 'text-typo-secondary'
            }`}
          >
            {currentLength}/{maxLength}
          </Typography>
        </div>
      )}

      {isNearLimit && !error && !isAtLimit && (
        <Typography type="caption1" font="dm-sans" className="text-yellow-600 text-xs mt-1">
          Approaching the maximum character limit
        </Typography>
      )}

      {isAtLimit && !error && (
        <Typography type="caption1" font="dm-sans" className="text-red-500 text-xs mt-1">
          Maximum character limit reached (255 characters)
        </Typography>
      )}
      
      {error && (
        <Typography type="caption1" font="dm-sans" weight="regular" className="text-primary">
          {error}
        </Typography>
      )}
    </div>
  );
};

export default Input;