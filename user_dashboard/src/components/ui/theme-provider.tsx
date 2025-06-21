
import * as React from "react";

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: CustomThemeProviderProps) {
  React.useEffect(() => {
    const docRoot = document.documentElement;
    docRoot.classList.remove("dark"); // Ensure dark class is removed
    docRoot.classList.add("light");   // Add light class
    // Remove any theme-related item from localStorage if it exists from previous setup
    localStorage.removeItem('ui-theme'); 
  }, []);

  return <>{children}</>;
}
