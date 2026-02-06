/**
 * ThemeToggle Component
 *
 * Cycles through light → dark → system themes.
 * Uses React Aria Button for accessibility.
 */

import { Button } from 'react-aria-components';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import { cn } from '@/lib/utils/cn';

const themeOrder: Theme[] = ['light', 'dark', 'system'];

const themeLabels: Record<Theme, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
};

const ThemeIcon = ({ theme }: { theme: Theme }) => {
  switch (theme) {
    case 'light':
      return <Sun className="h-5 w-5" />;
    case 'dark':
      return <Moon className="h-5 w-5" />;
    case 'system':
      return <Monitor className="h-5 w-5" />;
  }
};

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = (): void => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <Button
      onPress={cycleTheme}
      aria-label={themeLabels[theme]}
      className={cn(
        'p-2 rounded-full transition-colors',
        'text-slate-500 hover:bg-slate-100',
        'dark:text-slate-400 dark:hover:bg-slate-700',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'dark:focus:ring-offset-surface-dark'
      )}
    >
      <ThemeIcon theme={theme} />
    </Button>
  );
}
