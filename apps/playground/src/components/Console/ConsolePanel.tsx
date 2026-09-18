import { SquareTerminal, Trash2 } from "lucide-react";
import "./ConsolePanel.css";
import { ConsoleContextMenu } from "./ConsoleContextMenu";
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
        <div className="console-heading">
          <SquareTerminal
            className="console-heading-icon"
            size={19}
            aria-hidden="true"
          />
          <div>
            <h2>Console</h2>
            <p>Runtime output from console.*()</p>
          </div>
        </div>
        <div className="result-actions">
          <button
            type="button"
            className="console-clear-button"
            disabled={isEmpty}
            onClick={onClear}
          >
            <Trash2 size={14} aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <ConsoleContextMenu disabled={isEmpty} onClear={onClear}>
        <div className="console-surface" role="log" aria-live="polite">
          {isEmpty ? (
            <div className="console-empty">
              <SquareTerminal
                className="console-empty-icon"
                size={28}
                aria-hidden="true"
              />
              <span>Run the code to see console output.</span>
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
      </ConsoleContextMenu>
    </article>
  );
}
