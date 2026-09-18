import "./ConsolePanel.css";
import { ConsoleMessage } from "./ConsoleMessage";
import { ConsoleMessageData } from "./createConsoleProxy";

export interface RunOutput {
  messages: ConsoleMessageData[];
  error: string;
}

export interface ConsoleProps {
  output: RunOutput;
  onClear: () => void;
}

export function ConsolePanel({ output, onClear }: ConsoleProps) {
  const messages: ConsoleMessageData[] = output.error
    ? [
        ...output.messages,
        {
          method: "error",
          data: [output.error],
          depth: 0,
        },
      ]
    : output.messages;
  const isEmpty = messages.length === 0;

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
          <div className="console-empty">
            Run the code to see console output.
          </div>
        ) : (
          messages.map((message, index) => (
            <ConsoleMessage
              key={`${message.method}-${index}`}
              message={message}
            />
          ))
        )}
      </div>
    </article>
  );
}
