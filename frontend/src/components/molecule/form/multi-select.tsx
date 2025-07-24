import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { Typography } from "../../atom/typography";
import Modal from "../modal";
import Input from "../form/input";
import { Button } from "../../atom/button";
import { useModal } from "../../../hooks/useModal";

interface Option<T extends string | number> {
  label: string;
  value: T;
}

interface AddNewField {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  description?: string;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'email' | 'tel' | 'url';
}

interface AddNewConfig {
  enabled: boolean;
  buttonText?: string;
  modalTitle?: string;
  modalDescription?: string;
  fields: AddNewField[];
  submitButtonText?: string;
  cancelButtonText?: string;
  loadingText?: string;
}

interface MultiSelectDropdownProps<T extends string | number> {
  label: string;
  options: readonly Option<T>[];
  selectedValues: Option<T>[];
  onChange: (selectedValues: Option<T>[], newTempOptions?: Option<T>[]) => void;
  placeholder: string;
  onClearAll: () => void;
  addNewConfig?: AddNewConfig;
  error?: string;
  className?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  maxHeight?: string;
  tempOptions?: Option<T>[];
}

const MultiSelectDropdown = <T extends string | number>({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  onClearAll,
  addNewConfig,
  error,
  className = "",
  searchPlaceholder = "Cari...",
  noResultsText = "Tidak ditemukan",
  maxHeight = "200px",
  tempOptions = [],
}: MultiSelectDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [addNewErrors, setAddNewErrors] = useState<Record<string, string>>({});
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isModalOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    if (addNewConfig?.fields) {
      const initialData: Record<string, string> = {};
      addNewConfig.fields.forEach(field => {
        initialData[field.name] = "";
      });
      setFormData(initialData);
    }
  }, [addNewConfig?.fields]);

  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    (option: Option<T>, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (option.value === "add_new") {
        setIsOpen(false);
        openModal();
        return;
      }

      const newValues = selectedValues.some((v) => v.value === option.value)
        ? selectedValues.filter((v) => v.value !== option.value)
        : [...selectedValues, option];
      onChange(newValues);
    },
    [onChange, selectedValues, openModal]
  );

  const handleRemoveItem = useCallback(
    (option: Option<T>, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selectedValues.filter((v) => v.value !== option.value));
    },
    [onChange, selectedValues]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNew = async () => {
    if (!addNewConfig) return;
    
    setAddNewErrors({});
    
    let errors: Record<string, string> = {};
    addNewConfig.fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} wajib diisi`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setAddNewErrors(errors);
      return;
    }

    try {
      const tempId = -(Date.now()) as T;
      const newTempOption: Option<T> = {
        label: `${formData.keahlian} / ${formData.expertise}`,
        value: tempId
      };

      const newSelectedValues = [...selectedValues, newTempOption];
      const newTempOptions = [...tempOptions, newTempOption];
      
      onChange(newSelectedValues, newTempOptions);

      const resetData: Record<string, string> = {};
      addNewConfig.fields.forEach(field => {
        resetData[field.name] = "";
      });
      setFormData(resetData);
      closeModal();
      
    } catch (error) {
      setAddNewErrors({ general: "Gagal menambah data baru" });
    }
  };

  const handleCancelAddNew = () => {
    const resetData: Record<string, string> = {};
    if (addNewConfig?.fields) {
      addNewConfig.fields.forEach(field => {
        resetData[field.name] = "";
      });
    }
    setFormData(resetData);
    setAddNewErrors({});
    closeModal();
  };

  const handleFormDataChange = (fieldName: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: e.target.value
    }));
    
    if (addNewErrors[fieldName]) {
      setAddNewErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  const allAvailableOptions = [...options, ...tempOptions];

  const filteredOptions = allAvailableOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewOption = addNewConfig?.enabled ? [{ 
    label: addNewConfig.buttonText || "+ Tambah Baru", 
    value: "add_new" as T 
  }] : [];

  const allOptions = [...filteredOptions, ...addNewOption];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <Typography type="caption1" font="dm-sans" className="mb-2">{label}</Typography>
        <div
          className={`flex items-center cursor-pointer p-2 w-full text-sm font-dm-sans border 
            ${isOpen || selectedValues.length > 0 ? "bg-typo-white2" : "bg-typo-white"}
            ${error ? "border-primary" : "border-typo-outline"}
            focus:outline-none focus:ring-1 focus:ring-primary rounded-md`}
          onClick={toggleDropdown}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex flex-wrap gap-2 flex-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((option, index) => (
                <span
                  key={`selected-${option.value}-${index}`}
                  className={`rounded-md px-2 py-1 flex items-center space-x-1 ${
                    typeof option.value === 'number' && option.value < 0 
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-primary-10 text-primary"
                  }`}
                >
                  <Typography type="caption1" font="dm-sans" weight="regular">
                    {option.label}
                    {typeof option.value === 'number' && option.value < 0 && (
                      <span className="ml-1 text-xs">(baru)</span>
                    )}
                  </Typography>
                  <button onClick={(e) => handleRemoveItem(option, e)} className="text-current hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              ))
            ) : (
              <Typography type="label" font="dm-sans" weight="regular" className="text-typo-secondary">
                {placeholder}
              </Typography>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedValues.length > 0 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onClearAll(); }} className="text-typo-secondary hover:text-red-700">
                <X size={16} />
              </button>
            )}
            <button type="button" onClick={toggleDropdown} className="text-typo-secondary">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className={`bg-white mt-1 shadow-md border border-typo-outline transition-all duration-200 overflow-hidden rounded-lg`}>
            {/* Search Input */}
            <div className="py-2 border-b border-typo-outline">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                onKeyDown={(e) => {
                  if (!isOpen) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                      prev < allOptions.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                      prev > 0 ? prev - 1 : allOptions.length - 1
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const selected = allOptions[highlightedIndex];
                    if (selected) {
                      handleSelect(selected, e as any);
                      setSearchTerm("");
                    }
                  } else if (e.key === "Escape") {
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                  }
                }}
                className="w-full px-3 py-1 text-sm rounded-md bg-transparent outline-none ring-0 border-none focus:outline-none focus:ring-0 focus:border-none"
              />
            </div>

            <ul className={`z-50 overflow-auto`} style={{ maxHeight }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={`option-${option.value}-${index}`}
                    onClick={(e) => handleSelect(option, e)}
                    className={`cursor-pointer p-2 text-typo 
                      hover:bg-primary hover:text-white
                      ${selectedValues.some((v) => v.value === option.value) ? "text-white bg-primary" : ""}
                      ${index === highlightedIndex ? "bg-primary text-white" : ""}
                      ${typeof option.value === 'number' && option.value < 0 ? "bg-yellow-50" : ""}
                    `}
                    role="option"
                    aria-selected={selectedValues.some((v) => v.value === option.value)}
                  >
                    <Typography type="label" font="dm-sans" weight="regular">
                      {option.label}
                      {typeof option.value === 'number' && option.value < 0 && (
                        <span className="ml-1 text-xs text-yellow-600">(baru)</span>
                      )}
                    </Typography>
                  </li>
                ))
              ) : (
                <li className="p-2 text-sm text-gray-400 italic">{noResultsText}</li>
              )}
              
              {addNewConfig?.enabled && (
                <li
                  key="add-new-option"
                  onClick={(e) => handleSelect({ label: addNewConfig.buttonText || "+ Tambah Baru", value: "add_new" as T }, e)}
                  className={`cursor-pointer p-2 text-typo border-t border-typo-outline bg-green-50 hover:bg-green-100 hover:text-green-700
                    ${filteredOptions.length === highlightedIndex ? "bg-green-100" : ""}
                  `}
                  role="option"
                  aria-selected={false}
                >
                  <div className="flex items-center gap-2">
                    <Plus size={16} />
                    <Typography type="label" font="dm-sans" weight="regular" className="text-green-700">
                      {addNewConfig.buttonText || "+ Tambah Baru"}
                    </Typography>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

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

      {addNewConfig?.enabled && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancelAddNew}
          title={addNewConfig.modalTitle || "Tambah Data Baru"}
          showFooter={false}
          sizeClass="md:w-3/5 lg:w-1/3"
        >
          <div className="space-y-4">
            {addNewConfig.modalDescription && (
              <Typography type="body" font="dm-sans" className="text-typo-secondary mb-4">
                {addNewConfig.modalDescription}
              </Typography>
            )}
            
            {addNewConfig.fields.map((field) => (
              <Input
                key={field.id}
                id={field.id}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                description={field.description}
                type={field.type || 'text'}
                value={formData[field.name] || ""}
                onChange={handleFormDataChange(field.name)}
                error={addNewErrors[field.name]}
                maxLength={field.maxLength || 255}
                showCharacterCount={field.maxLength ? true : false}
              />
            ))}

            {addNewErrors.general && (
              <Typography type="caption1" font="dm-sans" className="text-primary">
                {addNewErrors.general}
              </Typography>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
            <Button variant="outline2" onClick={handleCancelAddNew}>
              {addNewConfig.cancelButtonText || "Batal"}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddNew}
            >
              {addNewConfig.submitButtonText || "Tambah"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default MultiSelectDropdown;