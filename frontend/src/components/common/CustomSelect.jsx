import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn tùy chọn...',
  className = '',
  icon: Icon = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Select Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 border transition-all duration-200 text-xs font-bold text-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between gap-2 shadow-sm ${
          isOpen
            ? 'border-amber-500 bg-white ring-4 ring-amber-500/10 shadow-md'
            : 'border-slate-200 hover:border-amber-400 hover:bg-slate-100/80'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />}
          <span className="truncate">{selectedOption.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-slate-950" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
