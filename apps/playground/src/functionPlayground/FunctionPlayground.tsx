import Editor from "@monaco-editor/react";
import { useState } from "react";
import {
  DEFAULT_FUNCTION_EXAMPLE,
  FUNCTION_EXAMPLES,
  getFunctionExample,
} from "../examples";
import { runFunctionSource, type RunOutput } from "./run";

function initialOutput(): RunOutput {
  return runFunctionSource(DEFAULT_FUNCTION_EXAMPLE.source);
}

export function FunctionPlayground() {
  const [selectedExample, setSelectedExample] = useState(DEFAULT_FUNCTION_EXAMPLE.id);
  const [source, setSource] = useState(DEFAULT_FUNCTION_EXAMPLE.source);
  const [output, setOutput] = useState<RunOutput>(initialOutput);

  const run = (nextSource = source) => {
    setOutput(runFunctionSource(nextSource));
  };

  const loadExample = (id: string) => {
    const example = getFunctionExample(id);
    if (!example) return;
    setSelectedExample(id);
    setSource(example.source);
    setOutput(runFunctionSource(example.source));
  };

  const clearOutput = () => setOutput({ lines: [], error: "" });

  return (
    <div className="api-playground-layout">
      <aside className="settings-sidebar api-sidebar" aria-label="API playground examples">
        <section className="sidebar-section example-section">
          <span className="sidebar-section-label">Load example</span>
          <select
            className="example-select"
            value={selectedExample}
            aria-label="Load function example"
            onChange={(event) => loadExample(event.target.value)}
          >
            {FUNCTION_EXAMPLES.map((example) => (
              <option key={example.id} value={example.id}>
                {example.label}
              </option>
            ))}
          </select>
        </section>

        <section className="sidebar-section">
          <span className="sidebar-section-label">About</span>
          <p className="sidebar-help">
            Write TypeScript using the real package API. Imports from
            <code>@moyarich/css-expand-collapse</code> resolve directly to the bundled library.
          </p>
        </section>

        <section className="sidebar-section">
          <span className="sidebar-section-label">Run</span>
          <p className="sidebar-help">
            Press <kbd>⌘ Enter</kbd> on macOS or <kbd>Ctrl Enter</kbd> on Windows/Linux.
            Output from <code>console.log()</code> appears in the console panel.
          </p>
        </section>
      </aside>

      <section className="api-workspace" aria-label="Function API playground">
        <article className="panel api-code-panel">
          <div className="panel-header">
            <div>
              <h2>TypeScript</h2>
              <p>Function usage</p>
            </div>
            <div className="result-actions">
              <button type="button" className="run-button" onClick={() => run()}>
                <span aria-hidden="true">▶</span>
                Run
              </button>
            </div>
          </div>

          <div className="editor-surface api-editor-surface">
            <Editor
              path="playground.ts"
              language="typescript"
              theme="vs-dark"
              value={source}
              onChange={(value) => setSource(value ?? "")}
              onMount={(editor, monaco) => {
                editor.addCommand(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                  () => run(editor.getValue()),
                );
              }}
              loading={<div className="editor-loading">Loading TypeScript editor…</div>}
              options={{
                ariaLabel: "TypeScript API playground",
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
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
              }}
            />
          </div>
        </article>

        <article className="panel console-panel">
          <div className="panel-header">
            <div>
              <h2>Console</h2>
              <p>Runtime output</p>
            </div>
            <div className="result-actions">
              <button
                type="button"
                className="console-clear-button"
                disabled={!output.lines.length && !output.error}
                onClick={clearOutput}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="console-surface" role="log" aria-live="polite">
            {output.error ? (
              <pre className="console-error">{output.error}</pre>
            ) : output.lines.length ? (
              <pre>{output.lines.join("\n\n")}</pre>
            ) : (
              <div className="console-empty">Run the code to see console output.</div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
