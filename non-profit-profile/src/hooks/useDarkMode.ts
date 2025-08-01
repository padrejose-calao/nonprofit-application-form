import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved preference
    const saved = localStorage.getItem('calao-dark-mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    // Otherwise, check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('calao-dark-mode', JSON.stringify(isDarkMode));
    
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