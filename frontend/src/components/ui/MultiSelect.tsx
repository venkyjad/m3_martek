import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelection?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  maxSelection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelection && value.length >= maxSelection) {
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full min-h-[48px] px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-200 cursor-pointer ${error ? 'border-red-500 focus-within:ring-red-500' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-2 items-center">
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500 text-white text-sm rounded-lg"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(option.value);
                  }}
                  className="hover:bg-primary-600 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {selectedOptions.length === 0 && (
              <span className="text-gray-400">{placeholder}</span>
            )}
            
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              const isDisabled = !!(maxSelection && !isSelected && value.length >= maxSelection);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors ${
                    isSelected ? 'bg-primary-500 text-white' : 'text-gray-300'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && handleToggleOption(option.value)}
                  disabled={isDisabled}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {maxSelection && value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length}/{maxSelection} selected
        </p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
