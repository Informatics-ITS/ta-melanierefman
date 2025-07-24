import { useState } from "react";

type SearchField<T> = keyof T | Array<keyof T> | ((item: T) => string);

const useSearch = <T,>(data: T[], searchField: SearchField<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (!Array.isArray(data)) {
    console.error("Data passed to useSearch is not an array:", data);
    return { searchQuery, handleSearch, filteredData: [] };
  }

  const filteredData = data.filter(item => {
    if (typeof searchField === "function") {
      const value = searchField(item);
      return String(value ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (Array.isArray(searchField)) {
      return searchField.some(field =>
        String(item[field] ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return String(item[searchField] ?? "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return { searchQuery, handleSearch, filteredData };
};

export default useSearch;