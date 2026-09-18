import {
  ObjectInspector,
  TableInspector,
} from "react-inspector";
import type { ConsoleMessage as ConsoleMessageData } from "./run";
import { normalizeConsoleTableData } from "./consoleTable";

export interface ConsoleMessageProps {
  message: ConsoleMessageData;
}

const INSPECTOR_THEME = "chromeDark" as const;

function isInspectable(value: unknown): value is object | Function {
  return (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  );
}

function renderPrimitive(value: unknown) {
  if (value instanceof Error) {
    return <pre className="console-stack">{value.stack || value.message}</pre>;
  }

  if (typeof value === "string") {
    return <span className="console-string">{value}</span>;
  }

  if (typeof value === "undefined") {
    return <span className="console-undefined">undefined</span>;
  }

  if (value === null) {
    return <span className="console-null">null</span>;
  }

  if (typeof value === "boolean") {
    return <span className="console-boolean">{String(value)}</span>;
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return <span className="console-number">{String(value)}</span>;
  }

  if (typeof value === "symbol") {
    return <span className="console-symbol">{String(value)}</span>;
  }

  return <span>{String(value)}</span>;
}

function Value({ value }: { value: unknown }) {
  return isInspectable(value) ? (
    <ObjectInspector
      data={value}
      theme={INSPECTOR_THEME}
      expandLevel={0}
    />
  ) : (
    renderPrimitive(value)
  );
}

export function ConsoleMessage({ message }: ConsoleMessageProps) {
  const style = {
    paddingLeft: 14 + message.depth * 16,
  };

  if (message.method === "table") {
    const value = message.data[0];

    if (typeof value === "object" && value !== null) {
      return (
        <div
          className="console-message console-message-table"
          data-method={message.method}
          style={style}
        >
          <TableInspector
            data={normalizeConsoleTableData(value)}
            columns={message.columns}
            theme={INSPECTOR_THEME}
          />
        </div>
      );
    }
  }

  if (message.method === "dir" && message.data.length === 1) {
    return (
      <div
        className="console-message"
        data-method={message.method}
        style={style}
      >
        <ObjectInspector
          data={message.data[0]}
          theme={INSPECTOR_THEME}
          expandLevel={message.expandLevel ?? 1}
          showNonenumerable={message.showNonenumerable}
        />
      </div>
    );
  }

  const isGroup =
    message.method === "group" || message.method === "groupCollapsed";

  return (
    <div
      className="console-message"
      data-method={message.method}
      style={style}
    >
      {isGroup && <span className="console-group-marker">▾</span>}
      <div className="console-values">
        {message.data.map((value, index) => (
          <Value key={index} value={value} />
        ))}
      </div>
    </div>
  );
}
