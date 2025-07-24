import { createContext, useContext, useState } from 'react';

type SelectedOptionType = {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
};

const SelectedOptionContext = createContext<SelectedOptionType | undefined>(undefined);

export const SelectedOptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState<string>('peneliti');

  return (
    <SelectedOptionContext.Provider value={{ selectedOption, setSelectedOption }}>
      {children}
    </SelectedOptionContext.Provider>
  );
};

export const useSelectedOption = () => {
  const context = useContext(SelectedOptionContext);
  if (!context) {
    throw new Error('useSelectedOption must be used within SelectedOptionProvider');
  }
  return context;
};
