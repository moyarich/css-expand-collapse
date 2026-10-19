import { formatCss, type InputKind } from "./formatCss";
import { MarkdownProvider } from "../Markdown/MarkdownProvider";
import { ResizableWorkspace } from "../ResizableWorkspace/ResizableWorkspace";
import "./CSSConverter.css";
import { MonacoEditor } from "../MonacoEditor";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  collapseCss,
  collapseDeclarations,
  expandCss,
  expandDeclarations,
} from "@moyarich/css-expand-collapse";
import {
  CSS_CONVERTER_EXAMPLES,
  DEFAULT_CSS_CONVERTER_EXAMPLE,
} from "../../../../../examples/CSSConverter";

type Mode = "expand" | "collapse";

const MODE_META: Record<
  Mode,
  {
    label: string;
    inputLabel: string;
    outputLabel: string;
  }
> = {
  expand: {
    label: "Expand",
    inputLabel: "Shorthand CSS",
    outputLabel: "Longhand CSS",
  },
  collapse: {
    label: "Collapse",
    inputLabel: "Longhand CSS",
    outputLabel: "Shorthand CSS",
  },
};

export function CSSConverter() {
  const navigate = useNavigate();
  const { mode: routeMode, exampleId } = useParams<{
    mode: string;
    exampleId: string;
  }>();

  const routeExample = CSS_CONVERTER_EXAMPLES.find(
    (example) => example.mode === routeMode && example.id === exampleId,
  );
  const initialExample = routeExample ?? DEFAULT_CSS_CONVERTER_EXAMPLE;

  const [mode, setMode] = useState<Mode>(initialExample.mode);
  const [source, setSource] = useState(initialExample.source);
  const [fillMissingLonghands, setFillMissingLonghands] = useState(
    initialExample.fillMissingLonghands,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!routeExample) {
      navigate(`/converter/${DEFAULT_CSS_CONVERTER_EXAMPLE.key}`, {
        replace: true,
      });
      return;
    }

    setMode(routeExample.mode);
    setSource(routeExample.source);
    setFillMissingLonghands(routeExample.fillMissingLonghands);
    setCopied(false);
  }, [navigate, routeExample]);

  const ExamplePage = initialExample.Component;
  const meta = MODE_META[mode];
  const inputKind = useMemo<InputKind>(
    () => (source.indexOf("{") === -1 ? "declarations" : "stylesheet"),
    [source],
  );

  const result = useMemo(() => {
    try {
      const collapseOptions = fillMissingLonghands
        ? { fillMissingLonghands: "initial" as const }
        : undefined;
      const css =
        inputKind === "declarations"
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

  const copyResult = async () => {
    if (!result.css) return;
    await navigator.clipboard.writeText(result.css);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const changeMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    if (result.css && !result.error) setSource(result.css);
    setMode(nextMode);
    setCopied(false);
  };

  const useResultAsInput = () => {
    if (!result.css || result.error) return;
    changeMode(mode === "expand" ? "collapse" : "expand");
  };

  return (
    <div className="css-converter">
      <article id="overview" className="example-documentation">
        <MarkdownProvider>
          <ExamplePage />
        </MarkdownProvider>
      </article>
      <div className="playground-layout">
        <aside
          id="conversion-settings"
          className="settings-sidebar"
          aria-label="Conversion settings"
        >
          <section className="sidebar-section">
            <span className="sidebar-section-label">Conversion</span>
            <div
              className="segmented-control direction-options"
              role="group"
              aria-label="Conversion direction"
            >
              {(Object.keys(MODE_META) as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`direction-button ${mode === option ? "active" : ""}`}
                  aria-pressed={mode === option}
                  onClick={() => changeMode(option)}
                >
                  {MODE_META[option].label}
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section options-section">
            <span className="sidebar-section-label">Options</span>
            <label
              className={`switch-control ${mode !== "collapse" ? "disabled" : ""}`}
            >
              <input
                type="checkbox"
                role="switch"
                disabled={mode !== "collapse"}
                checked={fillMissingLonghands}
                onChange={(event) =>
                  setFillMissingLonghands(event.target.checked)
                }
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

        <ResizableWorkspace>
          <section
            id="playground"
            className="workspace"
            aria-label="CSS conversion workspace"
          >
            <article className="panel source-panel">
              <div className="panel-header">
                <div>
                  <h2>Source</h2>
                  <p>
                    {meta.inputLabel} ·{" "}
                    {inputKind === "stylesheet" ? "Stylesheet" : "Declarations"}
                  </p>
                </div>
              </div>

              <div className="editor-surface">
                <MonacoEditor
                  path="input.css"
                  language="css"
                  value={source}
                  onChange={(value) => {
                    setSource(value ?? "");
                    setCopied(false);
                  }}
                  loading={
                    <div className="editor-loading">Loading CSS editor…</div>
                  }
                  options={{
                    ariaLabel: `${meta.inputLabel} input`,
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
                  <MonacoEditor
                    path="output.css"
                    language="css"
                    value={result.css}
                    loading={
                      <div className="editor-loading">Loading CSS editor…</div>
                    }
                    options={{
                      ariaLabel: `${meta.outputLabel} output`,
                      readOnly: true,
                      domReadOnly: true,
                      renderLineHighlight: "none",
                    }}
                  />
                </div>
              ) : (
                <div className="empty-state">
                  Start typing CSS to see the transformed result.
                </div>
              )}
            </article>
          </section>
        </ResizableWorkspace>
      </div>
    </div>
  );
}
