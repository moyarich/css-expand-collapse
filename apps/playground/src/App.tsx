import { useState } from "react";
import { APIPlayground } from "./components/APIPlayground";
import { CSSConverter } from "./components/CSSConverter";

type PlaygroundView = "converter" | "api";

export function App() {
  const [view, setView] = useState<PlaygroundView>("converter");
  const isApiView = view === "api";

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">@moyarich/css-expand-collapse</p>
          <h1>{isApiView ? "API Playground" : "CSS Expand / Collapse"}</h1>
          <p className="hero-copy">
            {isApiView
              ? "Write and run TypeScript against the real package API directly in the browser."
              : "Convert real CSS between shorthand and longhand declarations and see the result instantly."}
          </p>
        </div>
        <a
          className="repo-link"
          href="https://github.com/moyarich/css-expand-collapse"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>
      </header>

      <nav className="playground-tabs" role="tablist" aria-label="Playground mode">
        <button
          type="button"
          role="tab"
          aria-selected={view === "converter"}
          className={view === "converter" ? "active" : ""}
          onClick={() => setView("converter")}
        >
          CSS Converter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "api"}
          className={view === "api" ? "active" : ""}
          onClick={() => setView("api")}
        >
          API Playground
        </button>
      </nav>

      {isApiView ? <APIPlayground /> : <CSSConverter />}
    </main>
  );
}
