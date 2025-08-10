import React from 'react';
import clsx from 'clsx';

export default function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  disabled = false,
  error,
  className = '',
  inputClassName = '',
  maxLength,
  minLength,
  onBlur,
  ...rest
}) {
  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-blue-100 text-sm pl-1 font-medium tracking-tight">
          {label}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          'px-4 py-3 rounded-lg bg-[#181c2a] text-blue-100 border',
          'border-[#334067] focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]',
          'transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-400',
          inputClassName,
        )}
        {...rest}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs text-red-400 font-medium mt-[2px]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
