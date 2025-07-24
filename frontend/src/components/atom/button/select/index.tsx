import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Typography } from "../../typography";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Option {
  label: string;
  value: string;
  to?: string;
  onClick?: () => void;
}

interface ButtonSelectProps {
  options: Option[];
  placeholder?: string;
  className?: string;
  iconLeft?: React.ReactNode;
  variant?: "primary" | "outline";
  currentValue?: string;
  onChange?: (value: string) => void;
}

export const ButtonSelect: React.FC<ButtonSelectProps> = ({
  options,
  placeholder = "Select an option",
  className = "",
  iconLeft,
  variant = "primary",
  currentValue,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find((option) => option.value === currentValue) || null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOptionSelect = useCallback(
    (option: Option) => {
      setSelectedOption(option);
      setIsOpen(false);

      if (option.onClick) {
        option.onClick();
      }
      if (onChange) {
        onChange(option.value);
      }
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  const buttonClass =
    variant === "primary"
      ? "bg-primary text-typo-white hover:bg-primary-70"
      : "bg-white border-2 border-typo-inline text-black";

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        className={`flex rounded-md ${buttonClass}`}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex justify-between pl-2 pr-3 py-2 items-center space-x-1 border-r-2 border-white">
          {iconLeft && <span>{iconLeft}</span>}
          <Typography type="button" font="dm-sans" weight="semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </Typography>
        </div>
        <div className="flex items-center justify-between px-1 py-2">
          {isOpen ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </div>
      </button>

      {isOpen && (
        <ul
          className="absolute w-full mt-2 bg-white border shadow-md z-10 rounded-md"
          role="menu"
        >
          {options.map((option, index) => (
            <li
              key={index}
              className="last:border-none w-full"
              role="menuitem"
            >
              {option.to ? (
                <Link
                  to={option.to}
                  className="block p-3 w-full hover:bg-typo-outline"
                  onClick={() => handleOptionSelect(option)}
                >
                  <Typography type="label" font="dm-sans">{option.label}</Typography>
                </Link>
              ) : (
                <button
                  className="w-full p-3 text-left hover:bg-typo-surface"
                  onClick={() => handleOptionSelect(option)}
                >
                  <Typography type="label" font="dm-sans">{option.label}</Typography>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};