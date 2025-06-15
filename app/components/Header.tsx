"use client";

import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { useTheme } from "../providers/theme-provider";

const Header = () => {
  const { theme } = useTheme();

  const { isSignedIn } = useUser();

  return (
    <header
      className={`p-4 border-b flex items-center justify-between ${
        theme === "dark"
          ? "bg-gray-900 text-white border-gray-800"
          : "bg-white text-foreground"
      }`}
    >
      <Link href={"/"} className="text-2xl font-bold">MTWebLab</Link>
      <div className="flex gap-4 items-center">
        {isSignedIn && <Link href={"/snippets"}>My  Snippets</Link>}
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
