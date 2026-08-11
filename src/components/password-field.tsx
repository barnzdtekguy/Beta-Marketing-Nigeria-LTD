'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function PasswordField({
  id,
  name,
  label,
  placeholder,
  required,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-3 flex items-center text-text-faint hover:text-text"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
