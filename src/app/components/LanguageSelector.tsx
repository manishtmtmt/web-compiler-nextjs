"use client";
import { useTheme } from "@/providers/theme-provider";
import { LANGUAGES } from "../lib/constants";

export default function LanguageSelector({
  activeLanguage,
  setActiveLanguage,
}: {
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center`}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.id}
          onClick={() => setActiveLanguage(lang.id)}
          className={`
            px-6 py-3 text-sm transition-colors cursor-pointer
            ${
              activeLanguage === lang.id
                ? "bg-black text-white shadow-lg"
                : theme === "dark"
                ? "text-gray-200 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
