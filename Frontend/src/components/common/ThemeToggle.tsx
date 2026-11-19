import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A44C]/40 bg-white/5 px-3 py-2 text-xs font-semibold text-current transition-colors hover:border-[#C9A44C]/70 hover:bg-white/10 ${className}`}
    >
      <Icon className="h-4 w-4 text-[#C9A44C]" />
      {showLabel && <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>}
    </button>
  );
};
