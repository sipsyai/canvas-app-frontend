# Task: Dark Mode (Karanlık Tema)

**Priority:** 🟢 Low
**Estimated Time:** 2 gün
**Dependencies:** Tüm UI componentleri (Button, Input, Card, vb.)

---

## Objective

Kullanıcıların light ve dark tema arasında geçiş yapabilmesi için dark mode özelliği eklemek. Tema tercihi localStorage'da saklanacak ve sistem tercihi otomatik algılanacak.

---

## UI/UX Design

### Theme Toggle Button Locations
```
┌─────────────────────────────────────┐
│  [Logo]    [Nav]    [Profile] [🌙] │ ← Header'da
├─────────────────────────────────────┤
│                                     │
│  Settings Page:                     │
│  ┌────────────────────────────┐    │
│  │ Appearance                 │    │
│  │ ○ Light  ● Dark  ○ System  │    │ ← Settings'de
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Dark Theme Color Palette
```css
/* Light Theme (Default) */
--background: 0 0% 100%;           /* white */
--foreground: 222.2 84% 4.9%;      /* near black */
--card: 0 0% 100%;                 /* white */
--card-foreground: 222.2 84% 4.9%; /* near black */
--primary: 221.2 83.2% 53.3%;      /* blue-600 */
--primary-foreground: 210 40% 98%; /* blue-50 */
--secondary: 210 40% 96.1%;        /* gray-100 */
--secondary-foreground: 222.2 47.4% 11.2%; /* gray-900 */
--muted: 210 40% 96.1%;            /* gray-100 */
--muted-foreground: 215.4 16.3% 46.9%; /* gray-600 */
--accent: 210 40% 96.1%;           /* gray-100 */
--accent-foreground: 222.2 47.4% 11.2%; /* gray-900 */
--border: 214.3 31.8% 91.4%;       /* gray-200 */
--input: 214.3 31.8% 91.4%;        /* gray-200 */
--ring: 221.2 83.2% 53.3%;         /* blue-600 */

/* Dark Theme */
--background: 222.2 84% 4.9%;      /* near black */
--foreground: 210 40% 98%;         /* near white */
--card: 222.2 84% 4.9%;            /* dark gray */
--card-foreground: 210 40% 98%;    /* near white */
--primary: 217.2 91.2% 59.8%;      /* blue-500 */
--primary-foreground: 222.2 47.4% 11.2%; /* dark */
--secondary: 217.2 32.6% 17.5%;    /* dark blue */
--secondary-foreground: 210 40% 98%; /* near white */
--muted: 217.2 32.6% 17.5%;        /* dark blue */
--muted-foreground: 215 20.2% 65.1%; /* gray-400 */
--accent: 217.2 32.6% 17.5%;       /* dark blue */
--accent-foreground: 210 40% 98%;  /* near white */
--border: 217.2 32.6% 17.5%;       /* dark border */
--input: 217.2 32.6% 17.5%;        /* dark input */
--ring: 224.3 76.3% 48%;           /* blue-600 */
```

### Component Dark Mode Examples

**Button Component:**
```
Light:  [  Blue Background  ]
Dark:   [  Blue Background  ] (slightly lighter)
```

**Input Component:**
```
Light:  [ White bg, gray border     ]
Dark:   [ Dark bg, lighter border   ]
```

**Card Component:**
```
Light:  ┌─────────────────┐
        │ White card      │
        │ Gray text       │
        └─────────────────┘

Dark:   ┌─────────────────┐
        │ Dark card       │
        │ Light text      │
        └─────────────────┘
```

### Theme Transition Animation
```css
/* Smooth color transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

---

## Technical Details

### File Structure
```
src/
├── contexts/
│   └── ThemeContext.tsx              ⭐ Theme context provider
├── hooks/
│   └── useTheme.ts                   ⭐ useTheme hook
├── components/
│   └── theme/
│       └── ThemeToggle.tsx           ⭐ Toggle button component
├── styles/
│   └── themes.css                    ⭐ CSS variables (light/dark)
└── utils/
    └── theme.ts                       ⭐ Theme utilities
```

### Implementation Details

#### 1. Tailwind CSS 4 Dark Mode Configuration

**tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // ⭐ Class strategy (not 'media')
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variables approach for dynamic theming
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [],
};

export default config;
```

#### 2. CSS Variables (themes.css)

**src/styles/themes.css**
```css
@layer base {
  :root {
    /* Light Theme (Default) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    /* Dark Theme */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }

  * {
    @apply border-border;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

#### 3. Theme Context Provider

**src/contexts/ThemeContext.tsx**
```typescript
import { createContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // Resolved theme (system → light/dark)
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider = ({ children, defaultTheme = 'system' }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    return storedTheme || defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve actual theme based on user preference
  const resolveTheme = (selectedTheme: Theme): 'light' | 'dark' => {
    if (selectedTheme === 'system') {
      return getSystemTheme();
    }
    return selectedTheme;
  };

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const resolved = resolveTheme(theme);

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    setActualTheme(resolved);
  }, [theme]);

  // Listen to system theme changes (when theme is 'system')
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = resolveTheme('system');
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      setActualTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Persist theme to localStorage
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 4. useTheme Hook

**src/hooks/useTheme.ts**
```typescript
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
```

#### 5. Theme Toggle Component

**src/components/theme/ThemeToggle.tsx**
```typescript
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full"
    >
      {getIcon()}
    </Button>
  );
};
```

**Alternative: Dropdown Version**
```typescript
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggleDropdown = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-block">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
        <option value="system">💻 System</option>
      </select>
    </div>
  );
};
```

#### 6. Theme Utilities

**src/utils/theme.ts**
```typescript
export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'theme';

export const getStoredTheme = (): Theme | null => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return null;
};

export const setStoredTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme;
};
```

#### 7. App Integration

**src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import App from './App';
import './styles/themes.css'; // ⭐ Import theme CSS
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

#### 8. Component Dark Mode Examples

**Button Component (dark mode support)**
```typescript
export const Button = ({ className, variant = 'default', ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        // Base styles
        'px-4 py-2 rounded-lg font-medium transition-colors',
        // Variant styles (automatically switch with dark mode)
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
};
```

**Input Component (dark mode support)**
```typescript
export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 rounded-lg',
        'bg-background text-foreground',
        'border border-input',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        'placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
};
```

**Card Component (dark mode support)**
```typescript
export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

---

## Dependencies

### NPM Packages (Already Installed ✅)
- `tailwindcss` - CSS framework with dark mode support
- `lucide-react` - Icons (Sun, Moon, Monitor)

### New Dependencies (To Install)
```bash
# No new dependencies needed! Everything uses built-in features.
```

---

## Acceptance Criteria

- [ ] ThemeProvider context çalışıyor
- [ ] useTheme hook çalışıyor
- [ ] ThemeToggle component çalışıyor (header'da)
- [ ] Theme tercihi localStorage'da saklanıyor
- [ ] System preference otomatik algılanıyor
- [ ] System preference değişikliği algılanıyor (OS dark mode toggle)
- [ ] Light/Dark/System arasında geçiş sorunsuz
- [ ] Tüm UI componentleri dark mode'da doğru görünüyor
- [ ] Smooth transition animation çalışıyor (0.3s)
- [ ] Page reload sonrası tema korunuyor
- [ ] CSS variables doğru uygulanıyor
- [ ] Tailwind CSS dark: prefix çalışıyor
- [ ] Mobile responsive

---

## Testing Checklist

### Manual Testing
- [ ] Light theme → tüm componentler light
- [ ] Dark theme → tüm componentler dark
- [ ] System theme → OS preference'e göre değişiyor
- [ ] OS dark mode toggle → otomatik güncelleniyor (system modda)
- [ ] localStorage'da tema saklanıyor (`localStorage.getItem('theme')`)
- [ ] Page refresh → tema korunuyor
- [ ] Theme toggle button ikonları doğru (Sun/Moon/Monitor)
- [ ] Transition animation smooth (0.3s)
- [ ] Tüm sayfalar dark mode destekliyor
- [ ] Button, Input, Card, etc. dark mode'da düzgün

### Component Testing
- [ ] Login sayfası dark mode
- [ ] Dashboard dark mode
- [ ] Settings sayfası dark mode
- [ ] Modal/Dialog dark mode
- [ ] Toast/Alert dark mode
- [ ] Dropdown/Select dark mode

### Browser Testing
- [ ] Chrome (light/dark/system)
- [ ] Firefox (light/dark/system)
- [ ] Safari (light/dark/system)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Dark Theme Component Examples

### Login Page (Dark Mode)
```typescript
// Automatically works with theme context!
export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Canvas App
        </h1>
        {/* Rest of the component */}
      </div>
    </div>
  );
};
```

### Dashboard Header (with ThemeToggle)
```typescript
export const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle /> {/* ⭐ Add theme toggle */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
```

### Settings Page (Theme Selection)
```typescript
export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Appearance</h2>
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={() => setTheme('light')}
            className="w-4 h-4"
          />
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => setTheme('dark')}
            className="w-4 h-4"
          />
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="system"
            checked={theme === 'system'}
            onChange={() => setTheme('system')}
            className="w-4 h-4"
          />
          <Monitor className="h-5 w-5" />
          <span>System</span>
        </label>
      </div>
    </div>
  );
};
```

---

## Resources

### Tailwind CSS Dark Mode
- [Tailwind CSS Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS 4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### React Context API
- [React Context Docs](https://react.dev/reference/react/useContext)
- [Creating Context Providers](https://react.dev/reference/react/createContext)

### System Preferences
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [matchMedia API](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)

---

## 🤖 Claude Code Prompt

**Task dosyasını Claude Code'a vermek için bu promptu kullan:**

```
Please implement the Dark Mode task exactly as described in this file:
/Users/ali/Documents/Projects/canvas-app-frontend/tasks/10-advanced-features/03-dark-mode.md

Requirements:
1. Create src/contexts/ThemeContext.tsx - Theme context provider with light/dark/system support
2. Create src/hooks/useTheme.ts - useTheme hook for consuming theme context
3. Create src/components/theme/ThemeToggle.tsx - Theme toggle button component (Sun/Moon/Monitor icons)
4. Create src/styles/themes.css - CSS variables for light and dark themes
5. Update tailwind.config.ts - Enable dark mode with 'class' strategy
6. Update src/main.tsx - Wrap app with ThemeProvider
7. Update all UI components - Add dark mode support using CSS variables

CRITICAL REQUIREMENTS:
- Use Tailwind CSS 4 dark mode with 'class' strategy (NOT 'media')
- Store theme preference in localStorage (key: 'theme')
- Support three modes: 'light', 'dark', 'system'
- Detect system preference with window.matchMedia('(prefers-color-scheme: dark)')
- Listen to system preference changes (OS dark mode toggle)
- Apply smooth transitions (0.3s ease) for theme changes
- Use CSS variables approach (hsl(var(--background)), etc.)
- Add theme toggle button to header/navbar
- Ensure all components support dark mode (Button, Input, Card, etc.)

COLOR PALETTE:
Light theme: white backgrounds, gray borders, blue primary
Dark theme: near-black backgrounds, lighter borders, lighter blue primary

Follow the exact code examples and file structure provided in the task file. Test all three theme modes:
1. Light mode
2. Dark mode
3. System mode (sync with OS preference)
```

---

**Status:** 🟡 Pending
**Previous Task:** 02-advanced-validation.md
**Next Task:** 04-i18n.md
