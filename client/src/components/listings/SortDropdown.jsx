import React from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from '../../utils/constants';

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-brand-border rounded-lg bg-brand-card px-3 h-11 focus-within:ring-2 focus-within:ring-brand-red/30 focus-within:border-brand-red transition-all">
        <ArrowUpDown className="w-4 h-4 text-brand-muted flex-shrink-0" />
        <select
          value={value || 'newest'}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-sm text-brand-dark focus:outline-none pr-4 cursor-pointer w-full"
          aria-label="Sort listings by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortDropdown;
