import { formatCss, type InputKind } from "./formatCss";
import { ResizableWorkspace } from "../ResizableWorkspace/ResizableWorkspace";
import "./CSSConverter.css";
import { MonacoEditor } from "../MonacoEditor";
import { useMemo, useState } from "react";
import { createCssTransformer, type TransformDiagnostic } from "@moyarich/css-expand-collapse";
import { CopyButton } from "../ui/CopyButton";
import { CustomBlock } from "../ui/CustomBlock";
import { animationTriggerPlugin } from "../../../../../packages/css-experimental-shorthands/src/animation-trigger";
import { backgroundRepeatPlugin } from "../../../../../packages/css-experimental-shorthands/src/background-repeat";

type Mode = "expand" | "collapse";
type InputFormat = "auto" | InputKind;

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

export function CSSConverter({
  source: initialSource,
  initialMode,
  fillMissingLonghands: initialFillMissingLonghands = false,
}: {
  source: string;
  initialMode: Mode;
  fillMissingLonghands?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [source, setSource] = useState(initialSource);
  const [fillMissingLonghands, setFillMissingLonghands] = useState(
    initialFillMissingLonghands,
  );
  const [inputFormat, setInputFormat] = useState<InputFormat>("auto");
  const [experimentalRepeat, setExperimentalRepeat] = useState(false);
  const [draftReset, setDraftReset] = useState(false);
  const transformer = useMemo(() => {
    const css = createCssTransformer({ plugins: experimentalRepeat ? [backgroundRepeatPlugin] : [] });
    if (draftReset) css.addPlugin(animationTriggerPlugin, { override: true });
    return css;
  }, [experimentalRepeat, draftReset]);

  const meta = MODE_META[mode];
  const inputKind = useMemo<InputKind>(
    () => inputFormat === "auto" ? (source.indexOf("{") === -1 ? "declarations" : "stylesheet") : inputFormat,
    [source, inputFormat],
  );

  const result = useMemo(() => {
    try {
      const diagnostics: TransformDiagnostic[] = [];
      const options = {
        ...(fillMissingLonghands && mode === "collapse" ? { fillMissingLonghands: "initial" as const } : {}),
        onDiagnostic: (diagnostic: TransformDiagnostic) => diagnostics.push(diagnostic),
      };
      const validation = inputKind === "declarations" ? transformer.validateDeclarations(source) : transformer.validateCss(source);
      const css =
        inputKind === "declarations"
          ? mode === "expand"
            ? transformer.expandDeclarations(source, options)
            : transformer.collapseDeclarations(source, options)
          : mode === "expand"
            ? transformer.expandCss(source, options)
            : transformer.collapseCss(source, options);

      return { css: formatCss(css, inputKind), error: "", diagnostics, validation };
    } catch (error) {
      return {
        css: "",
        diagnostics: [],
        validation: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [source, mode, inputKind, fillMissingLonghands, transformer]);

  const changeMode = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
  };

  const useResultAsInput = () => {
    if (!result.css || result.error) return;
    setSource(result.css);
    changeMode(mode === "expand" ? "collapse" : "expand");
  };

  return (
    <div className="css-converter">
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

          <section className="sidebar-section">
            <label className="sidebar-section-label" htmlFor="input-format">Input format</label>
            <select id="input-format" className="example-select" value={inputFormat} onChange={(event) => setInputFormat(event.target.value as InputFormat)}>
              <option value="auto">Auto detect</option>
              <option value="stylesheet">Stylesheet</option>
              <option value="declarations">Declarations</option>
            </select>
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
          <section className="sidebar-section">
            <span className="sidebar-section-label">Experimental CSS</span>
            <label className="experimental-option"><input type="checkbox" checked={experimentalRepeat} onChange={(event) => setExperimentalRepeat(event.target.checked)} /> Physical background-repeat axes</label>
            <label className="experimental-option"><input type="checkbox" checked={draftReset} onChange={(event) => setDraftReset(event.target.checked)} /> Draft animation-trigger reset</label>
            {(experimentalRepeat || draftReset) && <CustomBlock type="warning" title="Experimental output">May change native browser behavior. Disable these options for ordinary website CSS.</CustomBlock>}
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
                <div className="result-actions">
                  <button type="button" className="converter-reset" onClick={() => setSource(initialSource)}>Reset</button>
                  <CopyButton className="copy-button" value={source} disabled={!source} aria-label="Copy source" />
                </div>
              </div>

              <div className="editor-surface">
                <MonacoEditor
                  path="input.css"
                  language="css"
                  value={source}
                  onChange={(value) => {
                    setSource(value ?? "");
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
                  <CopyButton className="copy-button" value={result.css} disabled={!result.css} aria-label="Copy result" />
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
      <section className="converter-diagnostics" aria-label="CSS diagnostics">
        <h3>Validation and transformation feedback</h3>
        <p role="status">{!source.trim() ? "Enter CSS to validate." : result.validation?.valid === true ? "CSS grammar is valid." : result.validation?.valid === false ? "CSS contains validation errors." : "Some values could not be validated statically."}</p>
        {[...(result.validation?.diagnostics ?? []), ...result.diagnostics].map((diagnostic, index) => <div className="converter-diagnostic" key={index}><strong>{diagnostic.severity}</strong> {diagnostic.message}</div>)}
      </section>
    </div>
  );
}
