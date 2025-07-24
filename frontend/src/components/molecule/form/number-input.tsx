import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { Typography } from '../../atom/typography';

interface NumberInputProps {
  label: string;
  id: string;
  name: string;
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  min?: number;
  description?: string;
  error?: string | number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  id,
  name,
  value = 0,
  onChange = () => {},
  placeholder = '',
  min = 0,
  description,
  error,
}) => {
  const [internalValue, setInternalValue] = useState<string | number>(value ?? '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInternalValue(value ?? '');
  }, [value]);

  const handleIncrement = () => {
    const newValue = (Number(internalValue) || 0) + 1;
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max((Number(internalValue) || 0) - 1, min);
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setInternalValue('');
      onChange(0);
      return;
    }

    const numericValue = parseInt(inputValue, 10);
    if (!isNaN(numericValue)) {
      setInternalValue(numericValue);
      onChange(Math.max(numericValue, min));
    }
  };

  return (
    <div className="relative">
      <label htmlFor={id}>
        <Typography type="caption1" font="dm-sans" weight="regular">
          {label}
        </Typography>
      </label>
      {description && (
        <Typography
          type="caption1"
          font="dm-sans"
          weight="regular"
          className="text-typo-secondary"
        >
          {description}
        </Typography>
      )}
      <div className="mt-2 relative flex items-center">
        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full p-2 resize-none text-md font-dm-sans rounded-md
            placeholder:text-typo-secondary placeholder:font-dm-sans
            focus:outline-none focus:ring-1 focus:ring-primary
            border ${error ? 'border-primary' : 'border-typo-outline'}
            ${isFocused || internalValue !== '' ? 'bg-typo-white2' : 'bg-typo-white'}
          `}
        />
        <div className="absolute right-2 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleIncrement}
            className="text-typo-icon hover:text-primary"
            aria-label="Increase value"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="text-typo-icon hover:text-primary"
            aria-label="Decrease value"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
      {error && (
        <Typography
          type="caption1"
          font="dm-sans"
          weight="regular"
          className="text-primary"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default NumberInput;