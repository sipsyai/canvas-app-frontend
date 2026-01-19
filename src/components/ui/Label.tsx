/**
 * Label Component
 *
 * Simple label for form inputs
 */

import { cn } from '@/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label = ({ children, required, className, ...props }: LabelProps) => {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-gray-700 mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
