"use client";

import { Maximize, Minimize } from "lucide-react";
import { useTheme } from "../providers/theme-provider";

export default function FullScreenToggle({
  isFullScreen,
  setIsFullScreen,
}: {
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
}) {
  const { theme } = useTheme();
  return (
    <button
      onClick={() => setIsFullScreen(!isFullScreen)}
      className={`p-2 rounded cursor-pointer transition-colors ${
        theme === "dark" ? "hover:bg-gray-700" : "bg-gray-200"
      }`}
      aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullScreen ? (
        <Minimize className="w-4 h-4" />
      ) : (
        <Maximize className="w-4 h-4" />
      )}
    </button>
  );
}
