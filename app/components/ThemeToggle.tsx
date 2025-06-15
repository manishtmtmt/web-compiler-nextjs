"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        rounded-lg p-2 text-sm
        ${
          isLight
            ? "text-gray-700 hover:bg-gray-100"
            : "text-gray-200 hover:bg-gray-700"
        }
        focus:outline-none focus:ring-2 transition-colors duration-200 cursor-pointer
      `}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
