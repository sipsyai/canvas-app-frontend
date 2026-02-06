/**
 * Label Component
 *
 * Accessible label with React Aria
 * - Automatic htmlFor association
 * - aria-required support
 * - Proper semantic structure
 */

import type { ReactNode } from 'react';
import { Label as AriaLabel } from 'react-aria-components';
import type { LabelProps as AriaLabelProps } from 'react-aria-components';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends AriaLabelProps {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export const Label = ({
  children,
  required,
  className,
  ...props
}: LabelProps) => {
  return (
    <AriaLabel
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
    </AriaLabel>
  );
};
