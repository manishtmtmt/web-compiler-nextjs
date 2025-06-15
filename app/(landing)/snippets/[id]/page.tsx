// snippets/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { Save, Copy, Share2 } from "lucide-react";
import LanguageSelector from "@/app/components/LanguageSelector";
import CodeEditor from "@/app/components/CodeEditor";
import PreviewPane from "@/app/components/PreviewPane";
import FullScreenToggle from "@/app/components/FullScreenToggle";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import toast from "react-hot-toast";
import { useTheme } from "@/app/providers/theme-provider";

const LOCAL_STORAGE_KEY = "web-compiler-code";

export default function CodeSnippet() {
  const params = useParams();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [html, setHtml] = useState("<h1>Loading...</h1>");
  const [css, setCss] = useState("");
  const [javascript, setJavascript] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("html");
  const [title, setTitle] = useState("Untitled");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newSnippetTitle, setNewSnippetTitle] = useState("");

  const { isSignedIn, user } = useUser();
  const { theme } = useTheme();
  const router = useRouter();

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }
        const data = await response.json();
        setHtml(data.html || "");
        setCss(data.css || "");
        setJavascript(data.js || "");
        setTitle(data.title || "Untitled");
        setIsOwner(data.user.clerkId === user?.id);
      } catch (err) {
        console.error("Error fetching snippet:", err);
        setError("Failed to load snippet");
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn || user) {
      fetchSnippet();
    } else {
      // If not signed in, just fetch the snippet without owner check
      fetchSnippet();
    }
  }, [params.id, isSignedIn, user]);

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

  const handleSave = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save your code.");
      return;
    }

    if (isOwner) {
      // Directly update if owner
      await updateSnippet();
    } else {
      // Open modal to ask for new title if not owner
      setShowSaveModal(true);
    }
  };

  const updateSnippet = async (newTitle?: string) => {
    setIsSaving(true);
    try {
      const endpoint = isOwner ? `/api/snippets/${params.id}` : "/api/snippets";

      const method = isOwner ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle || title,
          html,
          css,
          js: javascript,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isOwner ? "update" : "save"} snippet`);
      }

      const data = await response.json();
      toast.success(`Snippet ${isOwner ? "updated" : "saved"} successfully!`);

      if (!isOwner) {
        // Redirect to the new snippet if it was a copy
        router.push(`/snippets/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`Error ${isOwner ? "updating" : "saving"} snippet:`, error);
      toast.error(
        `Failed to ${isOwner ? "update" : "save"} snippet. Please try again.`
      );
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
    }
  };

  const handleSaveAsCopy = async () => {
    if (!newSnippetTitle.trim()) {
      toast.error("Please enter a title for your snippet");
      return;
    }
    await updateSnippet(newSnippetTitle);
  };

  const handleClearCode = () => {
    if (confirm("Are you sure you want to clear all code?")) {
      setHtml("<h1>Hello World</h1>");
      setCss("body { background: #f0f0f0; }");
      setJavascript('console.log("Hello")');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleShare = async () => {
    try {
      // Create a shareable link
      // const shareableData = {
      //   html,
      //   css,
      //   javascript,
      //   title: title || "Untitled Snippet",
      // };

      if (!isOwner) {
        toast.error(
          "You can only share your own snippets. Please save a copy first."
        );
        return;
      }

      // For demo purposes, we'll just copy the current URL
      // In a real app, you might want to save this first and share the permalink
      const currentUrl = window.location.href;

      await navigator.clipboard.writeText(currentUrl);

      // Show feedback
      // toast.success("Link copied to clipboard! Share this with others.");

      // Alternatively, you could use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: title || "My Code Snippet",
          text: "Check out this code snippet I created!",
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to share:", err);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

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
            <h3 className="text-lg font-medium mb-4">Save as New Snippet</h3>
            <p className="mb-4">
              This snippet belongs to another user. Please enter a title to save
              your own copy.
            </p>
            <input
              type="text"
              placeholder="Enter snippet title"
              value={newSnippetTitle}
              onChange={(e) => setNewSnippetTitle(e.target.value)}
              className={`w-full p-2 mb-4 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`px-4 py-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } cursor-pointer`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Copy"}
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
                    onClick={handleSave}
                    className={`text-sm px-2 py-1 rounded ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    } flex gap-2 items-center cursor-pointer`}
                    title="Save snippet"

                  >
                    <Save size={16} /> Save
                  </button>
                  {isOwner && (
                    <button
                      onClick={handleShare}
                      className={`text-sm px-2 py-1 rounded ${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-200"
                      } flex gap-2 items-center cursor-pointer`}
                      title="Share snippet"
                    >
                      <Share2 size={16} /> Share
                    </button>
                  )}
                  <button
                    onClick={handleClearCode}
                    className={`text-sm px-2 py-1 rounded ${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-200"
                    } cursor-pointer`}
                    title="Clear code"
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
