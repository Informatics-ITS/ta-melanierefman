import { useState } from 'react';
import { Search } from 'lucide-react';
import { Typography } from '../../atom/typography';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="relative">
        <Search
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
          size={20}
        />
        <Typography type="caption1" font="dm-sans" >
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`block w-full p-2 pr-10 text-sm
              placeholder:text-typo-secondary placeholder:font-dm-sans
              border border-typo-outline
              ${query.trim() !== '' ? 'bg-typo-white2' : 'bg-typo-white'} focus:bg-typo-white2
              focus:outline-none focus:ring-1 focus:ring-primary
              rounded-md`}
          />  
        </Typography>
      </div>
    </div>
  );
};

export default SearchBar;