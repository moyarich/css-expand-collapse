import { Navigate, NavLink, Route, Routes, useLocation } from "react-router";
import { APIPlayground } from "./components/APIPlayground";
import { CSSConverter } from "./components/CSSConverter";
import { DEFAULT_FUNCTION_EXAMPLE } from "./examples/APIPlayground";
import { DEFAULT_CSS_CONVERTER_EXAMPLE } from "./examples/CSSConverter";

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

const DEFAULT_CONVERTER_PATH =
  `/converter/${DEFAULT_CSS_CONVERTER_EXAMPLE.key}`;
const DEFAULT_API_PATH = `/api/${DEFAULT_FUNCTION_EXAMPLE.id}`;

export function App() {
  const { pathname } = useLocation();
  const view = pathname.startsWith("/api") ? VIEW_COPY.api : VIEW_COPY.converter;

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
        <NavLink to="/converter">CSS Converter</NavLink>
        <NavLink to="/api">API Playground</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />} />
        <Route
          path="/converter"
          element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />}
        />
        <Route
          path="/converter/:mode/:exampleId"
          element={<CSSConverter />}
        />
        <Route path="/api" element={<Navigate to={DEFAULT_API_PATH} replace />} />
        <Route path="/api/:exampleId" element={<APIPlayground />} />
        <Route path="*" element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />} />
      </Routes>
    </main>
  );
}
