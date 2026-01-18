import * as LucideIcons from 'lucide-react';

interface ObjectIconProps {
  icon?: string;
  color?: string;
  className?: string;
  size?: number;
}

export const ObjectIcon = ({
  icon = 'Box',
  color = '#6366f1',
  className = '',
  size = 20
}: ObjectIconProps) => {
  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Box;

  return (
    <div
      className={`inline-flex items-center justify-center rounded ${className}`}
      style={{ color }}
    >
      <IconComponent size={size} />
    </div>
  );
};
