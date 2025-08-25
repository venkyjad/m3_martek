import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  hint,
  maxLength,
  className = '',
  value,
  onChange,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
          {maxLength && (
            <span className="text-xs text-gray-400">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px] ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      {hint && !error && (
        <p className="text-sm text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default TextArea;

