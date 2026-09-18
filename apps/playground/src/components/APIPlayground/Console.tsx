import { Console as ConsoleFeed } from "console-feed";
import "./Console.css";
import type { ConsoleFeedMessage, RunOutput } from "./run";

export interface ConsoleProps {
  output: RunOutput;
  onClear: () => void;
}

export function Console({ output, onClear }: ConsoleProps) {
  const logs: ConsoleFeedMessage[] = output.error
    ? [...output.logs, { method: "error", data: [output.error] }]
    : output.logs;
  const isEmpty = logs.length === 0;

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
        {isEmpty ? (
          <div className="console-empty">Run the code to see console output.</div>
        ) : (
          <ConsoleFeed
            logs={logs as any}
            variant="dark"
            logGrouping={false}
          />
        )}
      </div>
    </article>
  );
}
