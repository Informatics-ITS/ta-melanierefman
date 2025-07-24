import { useState, useEffect, useRef } from "react";
import { MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Typography } from "../../atom/typography";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  textClassName?: string;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  variant?: "default" | "icon" | "box";
  trigger?: React.ReactNode;
  position?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  variant = "default",
  trigger,
  position,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("Semua Pilihan");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleItemClick = (label: string, onClick: () => void) => {
    setSelectedOption(label);
    onClick();
    setIsOpen(false);
    setIsBoxOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsBoxOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {variant === "box" ? (
        <div
          className={`flex md:w-[382px] w-full items-center justify-between cursor-pointer px-4 py-2 border rounded-lg 
            ${isBoxOpen ? 'border-primary border-2' : 'border-gray-300'} 
            hover:border-primary hover:border-2 focus:border-primary focus:border-2 transition-all`}
          onClick={() => setIsBoxOpen((prev) => !prev)}
        >
            <Typography
              type="body"
              font="dm-sans"
              weight="regular"
              className="text-typo line-clamp-1"
            >
              {selectedOption}
            </Typography>
          
          {isBoxOpen ? (
            <ChevronUp className="ml-2 w-4 h-4" />
          ) : (
            <ChevronDown className="ml-2 w-4 h-4" />
          )}
        </div>
      ) : (
        <button
          className={`absolute ${position ?? "top-0 right-0"} ${
            variant === "icon"
              ? "text-white bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
              : "text-typo-secondary hover:text-primary"
          } ${trigger}`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      )}

      {(isOpen || isBoxOpen) && variant !== "box" && (
        <div className={`absolute ${position ?? "top-4 right-1"} mt-6 w-32 border bg-white shadow-md z-10 rounded-lg overflow-hidden`}>
          {items.map((item, index) => (
            <button
              key={index}
              className={`block w-full text-left text-sm px-3 py-2 rounded-sm transition-all 
                ${item.disabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-typo-outline"}`}
              onClick={() => {
                if (!item.disabled) {
                  handleItemClick(item.label, item.onClick);
                }
              }}
              disabled={item.disabled}
            >
              <Typography
                type="body"
                font="dm-sans"
                weight="regular"
                className={item.textClassName ?? "text-typo"}
              >
                {item.label}
              </Typography>
            </button>
          ))}
        </div>
      )}

      {isBoxOpen && variant === "box" && (
        <div className="absolute top-12 left-0 w-full max-h-64 overflow-y-auto border bg-white shadow-md z-10 rounded-lg">
          {items.map((item, index) => (
            <button
              key={index}
              className={`block w-full text-left text-sm px-3 py-2 rounded-sm transition-all 
                ${item.disabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-typo-outline"}`}
              onClick={() => {
                if (!item.disabled) {
                  handleItemClick(item.label, item.onClick);
                }
              }}
              disabled={item.disabled}
            >
              <Typography
                type="body"
                font="dm-sans"
                weight="regular"
                className={item.textClassName ?? "text-typo line-clamp-2"}
              >
                {item.label}
              </Typography>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;