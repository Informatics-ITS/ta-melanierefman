import { useState } from 'react';
import { Typography } from '../../atom/typography';

interface TextareaProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  name,
  placeholder = '',
  autoComplete = 'off',
  rows = 6,
  onChange = () => {},
  value = '',
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="sm:col-span-4 relative">
      <label htmlFor={id} className="block text-sm font-medium text-typo">
        <Typography type="caption1" font="dm-sans" weight="regular">
          {label}
        </Typography>
      </label>
      <div className="mt-2 relative">
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          rows={rows}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full p-2 resize-none text-md font-dm-sans rounded-md
            placeholder:text-typo-secondary placeholder:font-dm-sans
            focus:outline-none focus:ring-1 focus:ring-primary
            ${
              error
                ? 'border-primary bg-white'
                : isFocused || value.trim() !== ''
                ? 'border-typo-outline bg-typo-white2'
                : 'border-typo-outline bg-typo-white'
            }`}
        />
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
    </div>
  );
};

export default Textarea;