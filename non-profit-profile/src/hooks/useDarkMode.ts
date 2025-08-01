import { useState, useEffect } from 'react';
import { netlifySettingsService } from '../services/netlifySettingsService';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to system preference initially
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load saved preference on mount
  useEffect(() => {
    const loadDarkMode = async () => {
      const saved = await netlifySettingsService.getDarkMode();
      if (saved !== null && saved !== undefined) {
        setIsDarkMode(saved);
      }
    };
    loadDarkMode();
  }, []);

  useEffect(() => {
    // Save preference to Netlify
    netlifySettingsService.setDarkMode(isDarkMode).catch(console.error);
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return { isDarkMode, toggleDarkMode };
};