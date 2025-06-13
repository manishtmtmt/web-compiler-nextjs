"use client";

import { useEffect, useState } from "react";

export default function PreviewPane({
  html,
  css,
  javascript,
}: {
  html: string;
  css: string;
  javascript: string;
}) {
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{ type: string; message: string }>
  >([]);
  const [showConsole, setShowConsole] = useState(false);

  // Clear logs when inputs change
  useEffect(() => {
    setConsoleLogs([]);
  }, [html, css, javascript]);

  const combinedCode = `
    <html>
      <head>
        <style>${css}</style>
        <script>
          // Override console methods
          const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
          };
          
          function sendToParent(type, ...args) {
            const message = args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' ');
            
            window.parent.postMessage({
              type: 'console',
              data: { type, message }
            }, '*');
            
            // Call original console method
            originalConsole[type].apply(console, args);
          }
          
          console.log = (...args) => sendToParent('log', ...args);
          console.warn = (...args) => sendToParent('warn', ...args);
          console.error = (...args) => sendToParent('error', ...args);
        </script>
      </head>
      <body>${html}</body>
      <script>${javascript}</script>
    </html>
  `;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        setConsoleLogs((prev) => [...prev, event.data.data]);
        // Auto-show console when there are new logs
        if (!showConsole) {
          setShowConsole(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [showConsole]);

  const iframeCode = `data:text/html;charset=utf-8,${encodeURIComponent(
    combinedCode
  )}`;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow">
        <iframe
          key={iframeCode}
          src={iframeCode}
          className="w-full h-full border-0 bg-white"
          title="Preview"
        />
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="absolute bottom-0 right-0 bg-gray-800 text-white px-3 py-1 rounded-tl-md flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          title={showConsole ? "Hide console" : "Show console"}
        >
          <span
            className={`transform transition-transform ${
              showConsole ? "rotate-180" : ""
            }`}
          >
            ^
          </span>
        </button>
      </div>
      {showConsole && (
        <div className="bg-gray-900 text-white h-40 overflow-auto">
          <div className="font-mono text-sm p-2">
            {consoleLogs.length === 0 ? (
              <div className="text-gray-500">No console messages</div>
            ) : (
              consoleLogs.map((log, index) => (
                <div
                  key={index}
                  className={`border-l-4 pl-2 my-1 ${
                    log.type === "error"
                      ? "border-red-500 text-red-400"
                      : log.type === "warn"
                      ? "border-yellow-500 text-yellow-400"
                      : "border-gray-500 text-gray-300"
                  }`}
                >
                  [{log.type}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
