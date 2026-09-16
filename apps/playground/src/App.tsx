import { useMemo, useState } from "react";
import {
  collapseCss,
  collapseDeclarations,
  expandCss,
  expandDeclarations,
} from "@moyarich/css-expand-collapse";

type Mode = "expand" | "collapse";
type InputKind = "stylesheet" | "declarations";

const EXAMPLES = {
  shorthand: `.card {
  margin: 12px 24px;
  padding: 8px 16px 20px;
  border: 2px solid rebeccapurple;
  text-decoration: wavy underline purple 25%;
}`,
  longhand: `.card {
  margin-top: 12px;
  margin-right: 24px;
  margin-bottom: 12px;
  margin-left: 24px;
  padding-top: 8px;
  padding-right: 16px;
  padding-bottom: 20px;
  padding-left: 16px;
}`,
};

function transform(source: string, mode: Mode, inputKind: InputKind): string {
  if (inputKind === "declarations") {
    return mode === "expand"
      ? expandDeclarations(source)
      : collapseDeclarations(source);
  }

  return mode === "expand" ? expandCss(source) : collapseCss(source);
}

export function App() {
  const [mode, setMode] = useState<Mode>("expand");
  const [inputKind, setInputKind] = useState<InputKind>("stylesheet");
  const [source, setSource] = useState(EXAMPLES.shorthand);

  const result = useMemo(() => {
    try {
      return { css: transform(source, mode, inputKind), error: "" };
    } catch (error) {
      return {
        css: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [source, mode, inputKind]);

  const loadExample = (kind: keyof typeof EXAMPLES) => {
    setInputKind("stylesheet");
    setMode(kind === "shorthand" ? "expand" : "collapse");
    setSource(EXAMPLES[kind]);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">@moyarich/css-expand-collapse</p>
          <h1>CSS Expand / Collapse Playground</h1>
          <p className="hero-copy">
            Transform real CSS between shorthand and longhand declarations using the
            same package API you ship to npm.
          </p>
        </div>
        <a
          className="repo-link"
          href="https://github.com/moyarich/css-expand-collapse"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <section className="toolbar" aria-label="Transform controls">
        <div className="segmented" role="group" aria-label="Transform mode">
          <button
            type="button"
            className={mode === "expand" ? "active" : ""}
            onClick={() => setMode("expand")}
          >
            Expand
          </button>
          <button
            type="button"
            className={mode === "collapse" ? "active" : ""}
            onClick={() => setMode("collapse")}
          >
            Collapse
          </button>
        </div>

        <label className="select-field">
          <span>Input</span>
          <select
            value={inputKind}
            onChange={(event) => setInputKind(event.target.value as InputKind)}
          >
            <option value="stylesheet">Stylesheet</option>
            <option value="declarations">Declaration block</option>
          </select>
        </label>

        <div className="example-actions">
          <span>Examples</span>
          <button type="button" onClick={() => loadExample("shorthand")}>Shorthand</button>
          <button type="button" onClick={() => loadExample("longhand")}>Longhand</button>
        </div>
      </section>

      <section className="workspace">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Input</span>
              <h2>{inputKind === "stylesheet" ? "CSS" : "Declarations"}</h2>
            </div>
            <span className="status-badge">Live</span>
          </div>
          <textarea
            className="code-editor"
            aria-label="CSS input"
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Output</span>
              <h2>{mode === "expand" ? "Expanded CSS" : "Collapsed CSS"}</h2>
            </div>
            <button
              type="button"
              className="copy-button"
              disabled={!result.css}
              onClick={() => navigator.clipboard.writeText(result.css)}
            >
              Copy
            </button>
          </div>

          {result.error ? (
            <pre className="error-output">{result.error}</pre>
          ) : (
            <pre className="code-output">{result.css}</pre>
          )}
        </article>
      </section>

      <footer className="footer-note">
        The playground imports the workspace package source directly, while the package
        build still emits ESM, CommonJS, and TypeScript declarations from <code>dist</code>.
      </footer>
    </main>
  );
}
