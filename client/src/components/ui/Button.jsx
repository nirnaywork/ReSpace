import React, { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-brand-error text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 min-h-[40px] inline-flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 min-h-[32px]',
    md: '',
    lg: 'text-base px-8 py-3 min-h-[48px]',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
