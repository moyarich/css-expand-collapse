import { MonacoEditor } from "../MonacoEditor";
import { useState } from "react";
import { Console } from "./Console";
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

  const clearOutput = () => setOutput({ messages: [], error: "" });

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
          <MonacoEditor
            path="playground.ts"
            language="typescript"
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
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>
      </article>

      <Console output={output} onClear={clearOutput} />
    </section>
  );
}
