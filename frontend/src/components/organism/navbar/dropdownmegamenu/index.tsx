import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../../../atom/typography';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type DropdownMegaMenuProps = {
  label: string;
  to: string;
  items: {
    label: string;
    to: string;
    progressDropdown?: { label: string; to: string }[];
  }[];
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  isActive?: boolean;
};

export function DropdownMegaMenu({
  label,
  to,
  isOpen,
  onToggle,
  onNavigate,
  items,
  isActive,
}: DropdownMegaMenuProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const isWideLabel = t('penelitian').includes(label);

  const hasProgressDropdown = items.some(item => item.progressDropdown?.length);
  // const itemWithProgressCount = items.filter(item => item.progressDropdown?.length).length;

  const toggleProgress = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="relative z-50 dropdown-menu">
      <button
        onClick={onToggle}
        className={`nav-link block px-3 py-2 text-white rounded group relative ${isActive ? 'font-bold' : ''}`}
      >
        <Typography
          type="body"
          weight={isActive ? 'semibold' : 'medium'}
          className="uppercase group-hover:font-semibold"
        >
          {label}
        </Typography>
        <span
          className={`absolute left-0 right-0 bottom-0 h-1 bg-primary transition-transform duration-300 group-hover:scale-x-100 ${
            isActive ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-2 ${
            isWideLabel
              ? items.length < 4
                ? 'w-[28rem]'
                : 'w-[48rem]'
              : 'w-40'
          } max-h-[500px] overflow-y-auto bg-typo-white shadow-md rounded-xl p-4 dropdown-menu`}
        >
          <Link to={to} onClick={onNavigate}>
            <Typography
              type="paragraph"
              weight="semibold"
              className="mb-2 text-black hover:underline"
            >
              {label}
            </Typography>
          </Link>

          <ul
            className={
              isWideLabel
                ? items.length < 4
                  ? 'flex flex-col w-full'
                  : 'grid grid-cols-1 md:grid-cols-2 gap-x-8'
                : 'flex flex-col w-full'
                      }
          >
            {items.map((item, i) => (
              <li key={i}>
                <div className="flex items-center justify-between">
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={`block hover:underline hover:text-primary ${
                      hasProgressDropdown ? 'mb-2' : 'mb-1'
                    }`}
                  >
                    <Typography type="body" font="dm-sans" className="text-primary line-clamp-2">
                      {item.label}
                    </Typography>
                  </Link>
                  {item.progressDropdown && item.progressDropdown.length > 0 && (
                    <button onClick={() => toggleProgress(i)} className="ml-2 text-gray-500 hover:text-primary">
                      {openIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>

                {item.progressDropdown && item.progressDropdown.length > 0 && openIndex === i && (
                  <ul className="ml-2 pl-2 mb-2 border-l border-gray-200 space-y-2">
                    {item.progressDropdown.map((progress, j) => (
                      <li key={j}>
                        <Link
                          to={progress.to}
                          onClick={onNavigate}
                          className="block text-sm text-gray-700 hover:underline"
                        >
                          <Typography type="caption1" font="dm-sans" className="text-typo line-clamp-2">
                            {progress.label}
                          </Typography>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}