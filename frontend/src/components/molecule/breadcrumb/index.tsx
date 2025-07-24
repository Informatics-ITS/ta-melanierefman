import { ChevronRight } from 'lucide-react';
import { Typography } from '../../atom/typography';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const truncateWords = (text: string, maxWords: number): string => {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => (
          <li key={index} className="flex items-center max-w-full">
            <div className="flex items-center space-x-1 max-w-full">
              <Typography
                type="caption1"
                className={`max-w-[300px] truncate text-sm leading-relaxed ${
                  index === items.length - 1
                    ? 'text-primary'
                    : 'text-typo-secondary hover:text-primary hover:underline'
                } max-w-full`}
              >
                {index === items.length - 1 ? (
                  truncateWords(item.label, 5)
                ) : (
                  <a href={item.path}>{truncateWords(item.label, 5)}</a>
                )}
              </Typography>
              {index < items.length - 1 && (
                <ChevronRight className="h-4 w-4 text-typo-secondary flex-shrink-0" />
              )}
            </div>
          </li>        
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;