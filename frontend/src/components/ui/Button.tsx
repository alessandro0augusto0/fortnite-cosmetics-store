import type { ButtonHTMLAttributes } from 'react';

const baseStyles = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-60';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClasses =
    variant === 'ghost'
      ? 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      : 'bg-indigo-600 text-white hover:bg-indigo-500';

  return <button className={`${baseStyles} ${variantClasses} ${className}`.trim()} {...props} />;
}
