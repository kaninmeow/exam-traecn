import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-300 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500',
            'placeholder:text-gray-400 transition-colors duration-200',
            error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
