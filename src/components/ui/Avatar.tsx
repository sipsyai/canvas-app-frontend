import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback || alt?.charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      <div
        className={cn(
          'rounded-full bg-cover bg-center flex-shrink-0',
          sizeClasses[size],
          className
        )}
        style={{ backgroundImage: `url("${src}")` }}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0',
        sizeClasses[size],
        className
      )}
      role="img"
      aria-label={alt}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; alt?: string; fallback?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-white dark:ring-surface-dark"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium ring-2 ring-white dark:ring-surface-dark',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
