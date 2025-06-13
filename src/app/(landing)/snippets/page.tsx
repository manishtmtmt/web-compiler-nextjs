"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Clock, Tag, Plus } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import toast from "react-hot-toast";

interface Snippet {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  html: string;
  css: string;
  js: string;
  createdAt: string;
  updatedAt: string;
}

export default function MySavedSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { theme } = useTheme();

  // Fetch snippets
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchSnippets = async () => {
      try {
        const response = await fetch("/api/snippets");
        if (!response.ok) {
          throw new Error("Failed to fetch snippets");
        }
        const data = await response.json();
        setSnippets(data);
        setFilteredSnippets(data);
      } catch (err) {
        console.error("Error fetching snippets:", err);
        setError("Failed to load snippets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippets();
  }, [isSignedIn]);

  // Filter snippets based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSnippets(snippets);
      return;
    }

    const filtered = snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        snippet.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredSnippets(filtered);
  }, [searchQuery, snippets]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;

    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete snippet");
      }

      setSnippets(snippets.filter((snippet) => snippet.id !== id));
      setFilteredSnippets(
        filteredSnippets.filter((snippet) => snippet.id !== id)
      );
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast.error("Failed to delete snippet. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPreview = (html: string, css: string) => {
    const doc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>${html}</body>
      </html>
    `;
    return encodeURIComponent(doc);
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">
            Please sign in to view your snippets
          </h2>
          <p>You need to be signed in to access your saved code snippets.</p>
        </div>
      </div>
    );
  }

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
    <div className={"p-4 md:p-6 $"}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold">My Saved Snippets</h1>
          <button
            onClick={() => router.push("/")} // Assuming your editor is at the root path
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <Plus className="h-5 w-5" /> {/* Import Plus from lucide-react */}
            Create New Snippet
          </button>
        </div>

        {/* Search Bar */}
        <div
          className={`relative max-w-md ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search snippets by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                : "bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
        </div>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <p>No snippets found matching your search.</p>
          ) : (
            <p>You don't have any saved snippets yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className={`rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              {/* Preview iframe */}
              <div className="h-48 border-b relative">
                <iframe
                  src={`data:text/html;charset=utf-8,${getPreview(
                    snippet.html,
                    snippet.css
                  )}`}
                  className="w-full h-full"
                  sandbox="allow-same-origin"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate">
                    {snippet.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/snippets/${snippet.id}`)}
                      className={`p-1 rounded-full cursor-pointer ${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className={`p-1 rounded-full cursor-pointer ${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {snippet.description && (
                  <p
                    className={`text-sm mb-3 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {snippet.description}
                  </p>
                )}

                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {snippet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          theme === "dark"
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={`flex items-center text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Saved {formatDate(snippet.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
