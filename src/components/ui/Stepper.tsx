import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Step {
  id: string | number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <nav className={cn('flex items-center', className)} aria-label="Progress">
      <ol className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-400 mx-2 flex-shrink-0" />
              )}
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || isPending}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  onStepClick && !isPending && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
                  !onStepClick && 'cursor-default',
                  isPending && 'cursor-not-allowed'
                )}
              >
                {/* Step indicator */}
                <span
                  className={cn(
                    'flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium transition-colors',
                    isCompleted && 'bg-primary text-white',
                    isCurrent && 'bg-primary text-white',
                    isPending && 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Step label */}
                <span
                  className={cn(
                    'text-sm font-medium whitespace-nowrap',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-slate-900 dark:text-white',
                    isPending && 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
