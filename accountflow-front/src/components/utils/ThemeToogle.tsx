'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="px-6 py-2">
        <div className="bg-surface h-4 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  const isChecked = theme === 'dark';

  return (
    <label
      className="hover:bg-muted flex w-full cursor-pointer items-center justify-between rounded-md px-6 py-2 transition-colors duration-200"
      title={isChecked ? 'Tema escuro' : 'Tema claro'}
    >
      <span className="text-text text-sm font-medium">{isChecked ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</span>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={toggleTheme}
        className="peer sr-only"
        aria-label="Alternar tema"
      />
      <div
        className={`peer peer-focus:ring-primary/20 relative h-5 w-9 rounded-full transition-all duration-300 peer-focus:ring-1 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-[18px] hover:scale-105 ${isChecked ? 'bg-primary' : 'bg-muted-foreground'
          }`}
      />
    </label>
  );
}
