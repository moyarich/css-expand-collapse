import "./Console.css";
import type { RunOutput } from "./run";

export interface ConsoleProps {
  output: RunOutput;
  onClear: () => void;
}

export function Console({ output, onClear }: ConsoleProps) {
  const isEmpty = !output.entries.length && !output.error;

  return (
    <article className="panel console-panel">
      <div className="panel-header">
        <div>
          <h2>Console</h2>
          <p>Runtime output from console.*()</p>
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="console-clear-button"
            disabled={isEmpty}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="console-surface" role="log" aria-live="polite">
        {output.entries.map((entry, index) => (
          <div
            key={`${entry.method}-${index}`}
            className="console-entry"
            data-method={entry.method}
            style={{ paddingLeft: 16 + entry.depth * 16 }}
          >
            <span className="console-method">{entry.method}</span>
            <pre>{entry.text}</pre>
          </div>
        ))}

        {output.error && (
          <div className="console-entry console-runtime-error" data-method="error">
            <span className="console-method">error</span>
            <pre>{output.error}</pre>
          </div>
        )}

        {isEmpty && (
          <div className="console-empty">
            Run the code to see console output.
          </div>
        )}
      </div>
    </article>
  );
}
