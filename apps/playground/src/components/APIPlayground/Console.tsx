import { Console as ConsoleFeed } from "console-feed";
import "./Console.css";
import type { ConsoleFeedMessage, RunOutput } from "./run";

export interface ConsoleProps {
  output: RunOutput;
  onClear: () => void;
}

const FEED_STYLES = {
  BASE_FONT_FAMILY:
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  BASE_FONT_SIZE: "14px",
  BASE_LINE_HEIGHT: 1.55,
  PADDING: "8px 14px 8px 10px",
  TREENODE_FONT_FAMILY:
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  TREENODE_FONT_SIZE: "14px",
  TREENODE_LINE_HEIGHT: 1.55,
  TREENODE_PADDING_LEFT: 14,
  ARROW_FONT_SIZE: "11px",
} as const;

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
            styles={FEED_STYLES}
          />
        )}
      </div>
    </article>
  );
}
