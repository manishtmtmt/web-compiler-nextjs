"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import PreviewPane from "./PreviewPane";
import FullScreenToggle from "./FullScreenToggle";
import LanguageSelector from "./LanguageSelector";
import { useUser } from "@clerk/nextjs";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "../providers/theme-provider";

type SavedCode = {
  html: string;
  css: string;
  javascript: string;
};

const LOCAL_STORAGE_KEY = "web-compiler-code";

export default function ResizablePanels() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [html, setHtml] = useState("<h1>Hello World</h1>");
  const [css, setCss] = useState("body { background: #f0f0f0; }");
  const [javascript, setJavascript] = useState('console.log("Hello")');
  const [activeLanguage, setActiveLanguage] = useState("html");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const { isSignedIn } = useUser();
  const { theme } = useTheme();

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCode) {
      try {
        const parsedCode: SavedCode = JSON.parse(savedCode);
        setHtml(parsedCode.html || "<h1>Hello World</h1>");
        setCss(parsedCode.css || "body { background: #f0f0f0; }");
        setJavascript(parsedCode.javascript || 'console.log("Hello")');
      } catch (error) {
        console.error("Failed to parse saved code", error);
      }
    }
    setHasHydrated(true);
  }, []);

  // Save code to localStorage
  useEffect(() => {
    if (!hasHydrated) return;

    const timer = setTimeout(() => {
      const codeToSave: SavedCode = {
        html,
        css,
        javascript,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(codeToSave));
    }, 500);

    return () => clearTimeout(timer);
  }, [html, css, javascript, hasHydrated]);

  const getActiveCode = () => {
    switch (activeLanguage) {
      case "html":
        return html;
      case "css":
        return css;
      case "javascript":
        return javascript;
      default:
        return html;
    }
  };

  const handleCodeChange = (value: string = "") => {
    switch (activeLanguage) {
      case "html":
        setHtml(value);
        break;
      case "css":
        setCss(value);
        break;
      case "javascript":
        setJavascript(value);
        break;
    }
  };

  const handleClearCode = () => {
    if (confirm("Are you sure you want to clear all code?")) {
      setHtml("<h1>Hello World</h1>");
      setCss("body { background: #f0f0f0; }");
      setJavascript('console.log("Hello")');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleSaveClick = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save your code.");
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!snippetTitle.trim()) {
      toast.error("Please enter a title for your snippet");
      return;
    }
    setIsSaving(true);

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: snippetTitle,
          html,
          css,
          js: javascript,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save snippet");
      }

      const data = await response.json();

      toast.success("Snippet saved successfully!");
      setShowSaveModal(false);
      setSnippetTitle("");
      router.push(`/snippets/${data.snippet.id}`);
    } catch (error) {
      console.error("Error saving snippet:", error);
      toast.error("Failed to save snippet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 relative">
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-md ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-medium mb-4">Save Your Snippet</h3>
            <input
              type="text"
              placeholder="Enter snippet title"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSnippetTitle("");
                }}
                className={`px-4 py-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } cursor-pointer`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor */}
      {isFullScreen ? (
        <div className="h-full flex flex-col">
          <div className="p-2 border-b flex justify-between items-center">
            <h3 className="font-medium">Preview (Fullscreen)</h3>
            <FullScreenToggle
              isFullScreen={isFullScreen}
              setIsFullScreen={setIsFullScreen}
            />
          </div>
          <PreviewPane html={html} css={css} javascript={javascript} />
        </div>
      ) : (
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div
                className={`border-b flex justify-between items-center ${
                  theme === "dark"
                    ? "bg-gray-900 text-white border-gray-800"
                    : "bg-white text-gray-800"
                }`}
              >
                <LanguageSelector
                  activeLanguage={activeLanguage}
                  setActiveLanguage={setActiveLanguage}
                />
                <div className="flex gap-3 items-center mr-3">
                  <button
                    onClick={handleSaveClick}
                    className={`text-sm px-2 py-1 rounded ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    } flex gap-2 items-center cursor-pointer`}
                    title="Save Code"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={handleClearCode}
                    className={`text-sm px-2 py-1 rounded ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    } cursor-pointer`}
                    title="Clear Code"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <CodeEditor
                language={activeLanguage}
                value={getActiveCode()}
                onChange={handleCodeChange}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-500 transition-colors" />
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div
                className={`p-2 border-b flex justify-between items-center ${
                  theme === "dark"
                    ? "bg-gray-900 text-white border-gray-800"
                    : "bg-white text-gray-800"
                }`}
              >
                <h3 className="font-medium">Preview</h3>
                <FullScreenToggle
                  isFullScreen={isFullScreen}
                  setIsFullScreen={setIsFullScreen}
                />
              </div>
              <PreviewPane html={html} css={css} javascript={javascript} />
            </div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
