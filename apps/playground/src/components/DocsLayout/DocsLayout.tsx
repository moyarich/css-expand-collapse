import "./DocsLayout.css";
import { Search } from "../Search/Search";
import type { TocEntry } from "../../../../../examples/types";
import { Outline } from "../Outline/Outline";
import { useState, useEffect, type MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Braces,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { APIPlayground } from "../APIPlayground";
import { CSSConverter } from "../CSSConverter";
import {
  DEFAULT_FUNCTION_EXAMPLE,
  FUNCTION_EXAMPLES,
} from "../../../../../examples/APIPlayground";
import {
  DEFAULT_CSS_CONVERTER_EXAMPLE,
  CSS_CONVERTER_EXAMPLES,
  CSS_CONVERTER_GROUPS,
} from "../../../../../examples/CSSConverter";

function headingText(headings: TocEntry[]): string {
  return headings
    .map((heading) => `${heading.value} ${headingText(heading.children ?? [])}`)
    .join(" ");
}

const DEFAULT_CONVERTER_PATH = `/converter/${DEFAULT_CSS_CONVERTER_EXAMPLE.key}`;
const DEFAULT_API_PATH = `/api/${DEFAULT_FUNCTION_EXAMPLE.id}`;
const pages = [
  ...CSS_CONVERTER_EXAMPLES.map((example) => ({
    ...example,
    path: `/converter/${example.key}`,
  })),
  ...FUNCTION_EXAMPLES.map((example) => ({
    ...example,
    path: `/api/${example.id}`,
  })),
];

export function DocsLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("playground-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(
        "playground-sidebar-collapsed",
        String(sidebarCollapsed),
      );
    } catch {
      /* Storage may be unavailable. */
    }
  }, [sidebarCollapsed]);
  const isApi = pathname.startsWith("/api");
  const currentIndex = pages.findIndex((page) => page.path === pathname);
  const current = pages[currentIndex];
  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];
  const closeMenu = () => setMenuOpen(false);
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(event.currentTarget.hash.slice(1));
    target?.scrollIntoView({ behavior: "smooth" });
    if (target?.id === "main-content") {
      target.focus();
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={scrollToSection}>
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/" onClick={closeMenu}>
          <Braces size={24} aria-hidden="true" />{" "}
          <span>CSS Expand / Collapse</span>
        </Link>
        <Search
          pages={pages.map((page) => ({
            ...page,
            searchText: headingText(page.tableOfContents),
          }))}
          onNavigate={closeMenu}
        />
        <a
          className="github-link"
          href="https://github.com/moyarich/css-expand-collapse"
          target="_blank"
          rel="noreferrer"
          aria-label="View on GitHub"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="example-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <div
        className={`docs-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <aside
          id="example-navigation"
          className={`docs-sidebar ${menuOpen ? "is-open" : ""}`}
          aria-label="Example navigation"
        >
          <div className="sidebar-toolbar">
            <p className="sidebar-caption">Playground</p>
            <button
              type="button"
              className="sidebar-minimizer"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"
              }
              aria-expanded={!sidebarCollapsed}
              aria-controls="example-navigation"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>
          </div>
          <nav>
            <details className="sidebar-collection" open={!isApi}>
              <summary>CSS Converter</summary>
              {(["expand", "collapse"] as const).map((mode) => (
                <section key={mode} className="navigation-section">
                  <h2>{mode === "expand" ? "Expand CSS" : "Collapse CSS"}</h2>
                  {CSS_CONVERTER_GROUPS.filter((group) =>
                    CSS_CONVERTER_EXAMPLES.some(
                      (example) =>
                        example.mode === mode && example.group === group,
                    ),
                  ).map((group) => (
                    <div className="navigation-group" key={group}>
                      <h3 className="nav-group-heading">{group}</h3>
                      <div className="nav-group-items">
                        {CSS_CONVERTER_EXAMPLES.filter(
                          (example) =>
                            example.mode === mode && example.group === group,
                        ).map((example) => (
                          <NavLink
                            key={example.key}
                            to={`/converter/${example.key}`}
                            onClick={closeMenu}
                          >
                            {example.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </details>
            <details className="sidebar-collection" open={isApi}>
              <summary>API Playground</summary>
              <section className="navigation-group nav-group-items">
                {FUNCTION_EXAMPLES.map((example) => (
                  <NavLink
                    key={example.id}
                    to={`/api/${example.id}`}
                    onClick={closeMenu}
                  >
                    {example.label}
                  </NavLink>
                ))}
              </section>
            </details>
          </nav>
        </aside>
        <main
          id="main-content"
          tabIndex={-1}
          className="docs-content"
          key={pathname}
        >
          <div className="breadcrumbs">
            Examples <span>/</span> {isApi ? "API reference" : "CSS Converter"}{" "}
            <span>/</span> <strong>{current?.label ?? "Overview"}</strong>
          </div>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />}
            />
            <Route
              path="/converter"
              element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />}
            />
            <Route
              path="/converter/:mode/:exampleId"
              element={<CSSConverter />}
            />
            <Route
              path="/api"
              element={<Navigate to={DEFAULT_API_PATH} replace />}
            />
            <Route path="/api/:exampleId" element={<APIPlayground />} />
            <Route
              path="*"
              element={<Navigate to={DEFAULT_CONVERTER_PATH} replace />}
            />
          </Routes>
          {current && (
            <footer className="article-footer">
              <a
                className="edit-page"
                href={`https://github.com/moyarich/css-expand-collapse/edit/main/examples/${isApi ? `APIPlayground/${current.id}` : `CSSConverter/${pathname.slice("/converter/".length)}`}/${current.pageFile}`}
                target="_blank"
                rel="noreferrer"
              >
                Edit this page on GitHub
              </a>
              <nav className="page-pagination" aria-label="Adjacent examples">
                {previous ? (
                  <Link to={previous.path}>
                    <span>
                      <ArrowLeft size={14} /> Previous example
                    </span>
                    <strong>{previous.label}</strong>
                  </Link>
                ) : (
                  <div />
                )}
                {next && (
                  <Link to={next.path}>
                    <span>
                      Next example <ArrowRight size={14} />
                    </span>
                    <strong>{next.label}</strong>
                  </Link>
                )}
              </nav>
            </footer>
          )}
        </main>
        <aside className="page-outline" aria-label="On this page">
          <p>On this page</p>
          <Outline headings={current?.tableOfContents ?? []} />
        </aside>
      </div>
    </div>
  );
}
