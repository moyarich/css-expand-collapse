import Editor from "@monaco-editor/react";
import { useState } from "react";
import { runFunctionSource, type RunOutput } from "./run";

export interface APIRunnerProps {
  initialSource: string;
}

export function APIRunner({ initialSource }: APIRunnerProps) {
  const [source, setSource] = useState(initialSource);
  const [output, setOutput] = useState<RunOutput>(() => runFunctionSource(initialSource));

  const run = (nextSource = source) => {
    setOutput(runFunctionSource(nextSource));
  };

  const clearOutput = () => setOutput({ lines: [], error: "" });

  return (
    <section className="api-workspace" aria-label="API runner">
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
  );
}
