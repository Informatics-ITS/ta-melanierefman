import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Typography } from "../../atom/typography";

interface DropdownProps {
  label: string;
  options: { label: string; value: string }[];
  selectedValue: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  className?: string;
  variant?: "default" | "simple"; 
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  placeholder,
  error,
  className = "",
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleSelect = (event: React.MouseEvent | React.KeyboardEvent, value: string) => {
    event.preventDefault();
    if (selectedValue === value) {
      onChange("");
    } else {
      onChange(value);
    }
    closeDropdown();
  };

  const displayedOptions = variant === "default" ? filteredOptions : options;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Typography type="caption1" font="dm-sans" className="mb-2">
        {label}
      </Typography>

      <div className="relative">
        {variant === "default" ? (
          <input
            type="text"
            placeholder={placeholder}
            value={
              searchTerm ||
              (selectedValue ? options.find((opt) => opt.value === selectedValue)?.label ?? "" : "")
            }
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              setIsOpen(true);
              setHighlightedIndex(0);
              if (value === "") {
                onChange("");
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (!isOpen) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                  prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
              } else if (e.key === "Enter") {
                e.preventDefault();
                const selected = filteredOptions[highlightedIndex];
                if (selected) {
                  handleSelect(e, selected.value);
                }
              } else if (e.key === "Escape") {
                closeDropdown();
              }
            }}
            className={`w-full p-2 pr-8 text-base font-dm-sans rounded-md border
              ${error ? "border-primary bg-white" : selectedValue ? "bg-typo-white2 border-typo-outline" : "bg-typo-white border-typo-outline"}
              focus:outline-none focus:ring-1 focus:ring-primary
              placeholder:text-typo-secondary`}
          />
        ) : (
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className={`w-full p-2 pr-8 text-base font-dm-sans rounded-md border cursor-pointer
              ${error ? "border-primary bg-white" : selectedValue ? "bg-typo-white2 border-typo-outline" : "bg-typo-white border-typo-outline"}
              focus:outline-none focus:ring-1 focus:ring-primary
              placeholder:text-typo-secondary`}
          >
            {selectedValue ? options.find((opt) => opt.value === selectedValue)?.label : placeholder}
          </div>
        )}

        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-typo-secondary"
          aria-label="Toggle dropdown"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              closeDropdown();
            } else {
              setIsOpen(true);
            }
          }}
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full bg-white mt-1 border border-typo-outline rounded-lg overflow-hidden transition-all duration-200">
          <ul className="max-h-[200px] overflow-auto">
            {displayedOptions.length > 0 ? (
              displayedOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  onClick={(event) => handleSelect(event, option.value)}
                  className={`cursor-pointer p-2 text-typo hover:bg-primary hover:text-white
                    ${selectedValue === option.value ? "text-white bg-primary" : ""}
                    ${highlightedIndex === index ? "bg-primary text-white" : ""}
                  `}
                  role="option"
                  aria-selected={selectedValue === option.value}
                >
                  <Typography type="label" font="dm-sans" weight="regular">
                    {option.label}
                  </Typography>
                </li>
              ))
            ) : (
              <li className="p-2 text-sm text-typo-secondary italic">Tidak ada hasil</li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <Typography
          type="caption1"
          font="dm-sans"
          weight="regular"
          className="text-primary mt-1"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default Dropdown;