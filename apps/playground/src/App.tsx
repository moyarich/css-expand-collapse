import Editor from "@monaco-editor/react";
import { useMemo, useState } from "react";
import {
  collapseCss,
  collapseDeclarations,
  expandCss,
  expandDeclarations,
} from "@moyarich/css-expand-collapse";
import {
  COMPUTED_EXPORT_EXAMPLE,
  COMPUTED_EXPORT_EXAMPLE_ID,
  EXAMPLE_GROUPS,
  SHORTHAND_EXAMPLES,
  getShorthandExample,
  type ExampleProperty,
} from "./examples/CSSConverter";
import { APIPlayground } from "./APIPlayground";

type Mode = "expand" | "collapse";
type InputKind = "stylesheet" | "declarations";
type PlaygroundView = "converter" | "api";

const QUOTATIONMARK = 0x0022;     // U+0022  -  "
const APOSTROPHE = 0x0027;        // U+0027  -  '
const LEFTPARENTHESIS = 0x0028;   // U+0028  -  (
const RIGHTPARENTHESIS = 0x0029;  // U+0029  -  )
const COLON = 0x003A;             // U+003A  -  :
const SEMICOLON = 0x003B;         // U+003B  -  ;
const LEFTCURLYBRACKET = 0x007B;  // U+007B  -  {
const REVERSESOLIDUS = 0x005C;    // U+005C  -  \
const RIGHTCURLYBRACKET = 0x007D; // U+007D  -  }
const CSS_WHITESPACE = new Set([0x0009, 0x000A, 0x000C, 0x000D, 0x0020]);

const MODE_META: Record<Mode, {
  label: string;
  direction: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
}> = {
  expand: {
    label: "Expand",
    direction: "Shorthand → Longhand",
    description: "Turn compact shorthand declarations into their individual CSS properties.",
    inputLabel: "Shorthand CSS",
    outputLabel: "Longhand CSS",
  },
  collapse: {
    label: "Collapse",
    direction: "Longhand → Shorthand",
    description: "Combine compatible longhand declarations into concise CSS shorthands.",
    inputLabel: "Longhand CSS",
    outputLabel: "Shorthand CSS",
  },
};

const DEFAULT_EXAMPLE = getShorthandExample("text-decoration")!;

function formatCss(css: string, inputKind: InputKind): string {
  const source = css.trim();
  if (!source) return "";

  let output = "";
  let indent = 0;
  let quoteCode = 0;
  let escaped = false;
  let parenDepth = 0;
  let pendingSpace = false;

  const writeIndent = () => {
    output += "  ".repeat(Math.max(0, indent));
  };

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    const char = source[index]!;

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (code === REVERSESOLIDUS) {
      output += char;
      escaped = true;
      continue;
    }

    if (quoteCode) {
      output += char;
      if (code === quoteCode) quoteCode = 0;
      continue;
    }

    if (code === APOSTROPHE || code === QUOTATIONMARK) {
      if (pendingSpace) {
        output += " ";
        pendingSpace = false;
      }
      quoteCode = code;
      output += char;
      continue;
    }

    if (code === LEFTPARENTHESIS) parenDepth += 1;
    if (code === RIGHTPARENTHESIS) parenDepth = Math.max(0, parenDepth - 1);

    if (CSS_WHITESPACE.has(code) && parenDepth === 0) {
      pendingSpace = true;
      continue;
    }

    if (code === LEFTCURLYBRACKET && parenDepth === 0) {
      output = output.trimEnd();
      output += " {\n";
      indent += 1;
      writeIndent();
      pendingSpace = false;
      continue;
    }

    if (code === SEMICOLON && parenDepth === 0) {
      output = output.trimEnd();
      output += ";\n";
      writeIndent();
      pendingSpace = false;
      continue;
    }

    if (code === RIGHTCURLYBRACKET && parenDepth === 0) {
      output = output.trimEnd();
      indent = Math.max(0, indent - 1);
      output += "\n";
      writeIndent();
      output += "}";
      pendingSpace = false;
      continue;
    }

    if (
      code === COLON &&
      parenDepth === 0 &&
      (inputKind === "declarations" || indent > 0)
    ) {
      output = output.trimEnd();
      output += ": ";
      pendingSpace = false;
      continue;
    }

    if (pendingSpace && output && !output.endsWith("\n") && !output.endsWith(" ")) {
      output += " ";
    }
    pendingSpace = false;
    output += char;
  }

  const formatted = output
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  return inputKind === "declarations"
    ? formatted.replace(/^\s{2}/gm, "")
    : formatted;
}

export function App() {
  const [view, setView] = useState<PlaygroundView>("converter");
  const [mode, setMode] = useState<Mode>("expand");
  const [source, setSource] = useState(DEFAULT_EXAMPLE.source);
  const [fillMissingLonghands, setFillMissingLonghands] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = MODE_META[mode];
  const inputKind = useMemo<InputKind>(
    () => source.indexOf(String.fromCharCode(LEFTCURLYBRACKET)) === -1
      ? "declarations"
      : "stylesheet",
    [source],
  );

  const result = useMemo(() => {
    try {
      const collapseOptions = fillMissingLonghands
        ? { fillMissingLonghands: "initial" as const }
        : undefined;
      const css = inputKind === "declarations"
        ? mode === "expand"
          ? expandDeclarations(source)
          : collapseDeclarations(source, collapseOptions)
        : mode === "expand"
          ? expandCss(source)
          : collapseCss(source, collapseOptions);

      return { css: formatCss(css, inputKind), error: "" };
    } catch (error) {
      return {
        css: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [source, mode, inputKind, fillMissingLonghands]);

  const loadExample = (selection: string) => {
    if (selection === COMPUTED_EXPORT_EXAMPLE_ID) {
      setMode("collapse");
      setFillMissingLonghands(true);
      setSource(COMPUTED_EXPORT_EXAMPLE);
      setCopied(false);
      return;
    }

    const example = getShorthandExample(selection as ExampleProperty);
    if (!example) return;
    setMode("expand");
    setFillMissingLonghands(false);
    setSource(example.source);
    setCopied(false);
  };

  const copyResult = async () => {
    if (!result.css) return;
    await navigator.clipboard.writeText(result.css);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const useResultAsInput = () => {
    if (!result.css) return;
    setSource(result.css);
    setMode(mode === "expand" ? "collapse" : "expand");
    setCopied(false);
  };

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

      {isApiView ? (
        <APIPlayground />
      ) : (
        <>
          <div className="playground-layout">
            <aside className="settings-sidebar" aria-label="Conversion settings">
              <section className="sidebar-section example-section">
                <span className="sidebar-section-label">Load example</span>
                <select
                  className="example-select"
                  defaultValue=""
                  aria-label="Load example"
                  onChange={(event) => {
                    if (!event.target.value) return;
                    loadExample(event.target.value);
                    event.target.value = "";
                  }}
                >
                  <option value="" disabled>Choose an example…</option>
                  <optgroup label="Real-world CSS">
                    <option value={COMPUTED_EXPORT_EXAMPLE_ID}>
                      Computed/export CSS → compact shorthands
                    </option>
                  </optgroup>
                  {EXAMPLE_GROUPS.map((group) => (
                    <optgroup key={group} label={`MDN · ${group}`}>
                      {SHORTHAND_EXAMPLES
                        .filter((example) => example.group === group)
                        .map((example) => (
                          <option key={example.property} value={example.property}>
                            {example.property}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </section>

              <section className="sidebar-section">
                <span className="sidebar-section-label">Conversion</span>
                <div
                  className="segmented-control direction-options"
                  role="group"
                  aria-label="Conversion direction"
                >
                  {(Object.keys(MODE_META) as Mode[]).map((option) => {
                    const optionMeta = MODE_META[option];
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`direction-button ${mode === option ? "active" : ""}`}
                        aria-pressed={mode === option}
                        onClick={() => {
                          setMode(option);
                          setCopied(false);
                        }}
                      >
                        {optionMeta.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="sidebar-section options-section">
                <span className="sidebar-section-label">Options</span>
                <label className={`switch-control ${mode !== "collapse" ? "disabled" : ""}`}>
                  <input
                    type="checkbox"
                    role="switch"
                    disabled={mode !== "collapse"}
                    checked={fillMissingLonghands}
                    onChange={(event) => setFillMissingLonghands(event.target.checked)}
                  />
                  <span className="switch-track" aria-hidden="true">
                    <span className="switch-thumb" />
                  </span>
                  <span className="switch-copy">
                    <strong>Fill missing longhands</strong>
                    <small>
                      {mode === "collapse"
                        ? "Use CSS initial values for computed/export CSS."
                        : "Available when collapsing."}
                    </small>
                  </span>
                </label>
              </section>
            </aside>

            <section className="workspace" aria-label="CSS conversion workspace">
              <article className="panel source-panel">
                <div className="panel-header">
                  <div>
                    <h2>Source</h2>
                    <p>{meta.inputLabel} · {inputKind === "stylesheet" ? "Stylesheet" : "Declarations"}</p>
                  </div>
                </div>

                <div className="editor-surface">
                  <Editor
                    path="input.css"
                    language="css"
                    theme="vs-dark"
                    value={source}
                    onChange={(value) => {
                      setSource(value ?? "");
                      setCopied(false);
                    }}
                    loading={<div className="editor-loading">Loading CSS editor…</div>}
                    options={{
                      ariaLabel: `${meta.inputLabel} input`,
                      automaticLayout: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 22,
                      lineNumbersMinChars: 3,
                      tabSize: 2,
                      insertSpaces: true,
                      detectIndentation: false,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      folding: true,
                      glyphMargin: false,
                      stickyScroll: { enabled: false },
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      renderLineHighlight: "line",
                      padding: { top: 16, bottom: 16 },
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </article>

              <button
                type="button"
                className="conversion-arrow"
                disabled={!result.css}
                onClick={useResultAsInput}
                aria-label="Use result as input and reverse conversion"
                title="Use result as input and reverse conversion"
              >
                <span aria-hidden="true">⇄</span>
              </button>

              <article className="panel result-panel">
                <div className="panel-header">
                  <div>
                    <h2>Result</h2>
                    <p>{meta.outputLabel}</p>
                  </div>
                  <div className="result-actions">
                    <button
                      type="button"
                      className="copy-button"
                      disabled={!result.css}
                      onClick={copyResult}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {result.error ? (
                  <div className="error-state">
                    <strong>Couldn’t transform this CSS</strong>
                    <pre>{result.error}</pre>
                  </div>
                ) : result.css ? (
                  <div className="editor-surface">
                    <Editor
                      path="output.css"
                      language="css"
                      theme="vs-dark"
                      value={result.css}
                      loading={<div className="editor-loading">Loading CSS editor…</div>}
                      options={{
                        ariaLabel: `${meta.outputLabel} output`,
                        automaticLayout: true,
                        readOnly: true,
                        domReadOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 22,
                        lineNumbersMinChars: 3,
                        tabSize: 2,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        folding: true,
                        glyphMargin: false,
                        stickyScroll: { enabled: false },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        renderLineHighlight: "none",
                        padding: { top: 16, bottom: 16 },
                      }}
                    />
                  </div>
                ) : (
                  <div className="empty-state">Start typing CSS to see the transformed result.</div>
                )}
              </article>
            </section>
          </div>

          <footer className="footer-note">
            Powered by <code>@moyarich/css-expand-collapse</code>. {meta.description}
          </footer>
        </>
      )}

      {isApiView && (
        <footer className="footer-note">
          The API playground runs TypeScript locally in your browser against the bundled
          <code>@moyarich/css-expand-collapse</code> package.
        </footer>
      )}
    </main>
  );
}
