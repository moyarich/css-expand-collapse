import type { ConsoleMessage as ConsoleMessageData } from "./run";
import { ConsoleTable } from "./ConsoleTable";
import { ConsoleValue } from "./ConsoleValue";

export interface ConsoleMessageProps {
  message: ConsoleMessageData;
}

export function ConsoleMessage({ message }: ConsoleMessageProps) {
  const style = {
    paddingLeft: 14 + message.depth * 16,
  };

  if (message.method === "table") {
    return (
      <div
        className="console-message console-message-table"
        data-method={message.method}
        style={style}
      >
        <ConsoleTable
          data={message.data[0]}
          columns={message.columns}
        />
      </div>
    );
  }

  if (message.method === "dir" && message.data.length === 1) {
    return (
      <div
        className="console-message"
        data-method={message.method}
        style={style}
      >
        <ConsoleValue
          value={message.data[0]}
          expandLevel={message.expandLevel ?? 1}
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
          <ConsoleValue key={index} value={value} />
        ))}
      </div>
    </div>
  );
}
