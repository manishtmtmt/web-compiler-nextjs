"use client";

import { useClerk } from "@clerk/nextjs";
import Header from "../components/Header";
import { useTheme } from "../providers/theme-provider";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  const clerk = useClerk();

  if (!clerk.loaded) return null;

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
