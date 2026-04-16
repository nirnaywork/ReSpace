import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  id,
  className = '',
  required = false,
  helperText,
  prefix,
  suffix,
  ...props
}, ref) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-brand-dark mb-1.5">
          {label}
          {required && <span className="text-brand-error ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-brand-muted text-sm font-medium pointer-events-none z-10">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-10' : ''} ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-brand-muted text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-brand-error flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-1.5 text-xs text-brand-muted">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
