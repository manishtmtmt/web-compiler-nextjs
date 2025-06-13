"use client";

import { useTheme } from "@/providers/theme-provider";
import Header from "../components/Header";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <main
      className={`h-screen flex flex-col ${
        theme === "dark"
          ? "bg-gray-900 text-white border-gray-800"
          : "bg-white text-gray-800"
      }`}
    >
      <Header />
      {children}
    </main>
  );
};

export default LandingLayout;
