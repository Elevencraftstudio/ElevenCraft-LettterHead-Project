import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: externalId, ...props }, ref) => {
    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId ?? hintId}
          aria-required={props.required}
          className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition ${className}`}
          {...props}
        />
        {error && <p id={errorId} className="text-[10px] text-red-400" role="alert">{error}</p>}
        {hint && !error && <p id={hintId} className="text-[10px] text-slate-500">{hint}</p>}
      </div>
    );
  }
);