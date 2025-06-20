"use client";
import Editor from "@monaco-editor/react";
import { useTheme } from "../providers/theme-provider";
import { useClerk } from "@clerk/nextjs";

export default function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { theme } = useTheme();
  const clerk = useClerk();

  return (
    <div className="h-full">
      {clerk.loaded && (
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={(value) => onChange(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      )}
    </div>
  );
}
