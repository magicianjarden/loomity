import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeInstallButtonProps {
  themeId: string;
  className?: string;
}

export const ThemeInstallButton: React.FC<ThemeInstallButtonProps> = ({ 
  themeId, 
  className 
}) => {
  const { installTheme, isLoading, currentTheme } = useTheme();

  const isCurrentTheme = currentTheme?.id === themeId;

  return (
    <button
      onClick={() => installTheme(themeId)}
      disabled={isLoading || isCurrentTheme}
      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
        isCurrentTheme 
          ? 'bg-green-500 text-white cursor-default'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''} ${className}`}
    >
      {isLoading ? 'Installing...' : isCurrentTheme ? 'Active Theme' : 'Install Theme'}
    </button>
  );
};
