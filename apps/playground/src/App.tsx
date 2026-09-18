import { Navigate, NavLink, Route, Routes, useLocation } from "react-router";
import { APIPlayground } from "./components/APIPlayground";
import { CSSConverter } from "./components/CSSConverter";

const VIEW_COPY = {
  converter: {
    title: "CSS Expand / Collapse",
    description:
      "Convert real CSS between shorthand and longhand declarations and see the result instantly.",
  },
  api: {
    title: "API Playground",
    description:
      "Write and run TypeScript against the real package API directly in the browser.",
  },
} as const;

export function App() {
  const { pathname } = useLocation();
  const view = pathname === "/api" ? VIEW_COPY.api : VIEW_COPY.converter;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">@moyarich/css-expand-collapse</p>
          <h1>{view.title}</h1>
          <p className="hero-copy">{view.description}</p>
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

      <nav className="playground-tabs" aria-label="Playground mode">
        <NavLink to="/" end>
          CSS Converter
        </NavLink>
        <NavLink to="/api">API Playground</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<CSSConverter />} />
        <Route path="/api" element={<APIPlayground />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
