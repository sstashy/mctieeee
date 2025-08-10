import React, { useState } from 'react';
import AuthInput from './AuthInput';

export default function PasswordField({
  id = 'password',
  label = 'Şifre',
  value,
  onChange,
  error,
  autoComplete = 'current-password',
  minLength = 6,
  showToggle = true,
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AuthInput
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        error={error}
        autoComplete={autoComplete}
        minLength={minLength}
        {...rest}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-3 top-[39px] text-blue-300 text-xs px-1 py-0.5 rounded hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ea4ff]"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
        >
          {visible ? 'Gizle' : 'Göster'}
        </button>
      )}
    </div>
  );
}
