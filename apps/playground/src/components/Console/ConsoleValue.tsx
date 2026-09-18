import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface ConsoleValueProps {
  value: unknown;
  expandLevel?: number;
  ancestors?: ReadonlySet<object>;
}

function isObjectLike(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function typeClass(value: unknown): string {
  if (value === null) return "console-null";
  if (typeof value === "string") return "console-string";
  if (typeof value === "number" || typeof value === "bigint") return "console-number";
  if (typeof value === "boolean") return "console-boolean";
  if (typeof value === "undefined") return "console-undefined";
  if (typeof value === "symbol") return "console-symbol";
  return "";
}

function renderPrimitive(value: unknown): ReactNode {
  if (value instanceof Error) {
    return <pre className="console-stack">{value.stack || value.message}</pre>;
  }

  if (typeof value === "function") {
    return (
      <span className="console-function">
        ƒ {value.name || "anonymous"}()
      </span>
    );
  }

  if (typeof value === "string") {
    return <span className="console-string">{JSON.stringify(value)}</span>;
  }

  if (typeof value === "symbol") {
    return <span className="console-symbol">{String(value)}</span>;
  }

  if (value === null) {
    return <span className="console-null">null</span>;
  }

  if (typeof value === "undefined") {
    return <span className="console-undefined">undefined</span>;
  }

  return <span className={typeClass(value)}>{String(value)}</span>;
}

function objectLabel(value: object): string {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);

  const constructorName = value.constructor?.name;
  return constructorName && constructorName !== "Object"
    ? constructorName
    : "Object";
}

function preview(value: object): string {
  if (Array.isArray(value)) {
    const items = value.slice(0, 3).map((item) => {
      if (typeof item === "string") return JSON.stringify(item);
      if (isObjectLike(item)) return Array.isArray(item) ? "Array" : "Object";
      return String(item);
    });

    return `[${items.join(", ")}${value.length > 3 ? ", …" : ""}]`;
  }

  const entries = Object.entries(value).slice(0, 3);
  const parts = entries.map(([key, item]) => {
    if (typeof item === "string") return `${key}: ${JSON.stringify(item)}`;
    if (isObjectLike(item)) return `${key}: ${Array.isArray(item) ? "Array" : "Object"}`;
    return `${key}: ${String(item)}`;
  });

  return `{ ${parts.join(", ")}${Object.keys(value).length > 3 ? ", …" : ""} }`;
}

export function ConsoleValue({
  value,
  expandLevel = 0,
  ancestors = new Set<object>(),
}: ConsoleValueProps) {
  if (!isObjectLike(value)) return renderPrimitive(value);

  if (value instanceof Error || value instanceof Date || value instanceof RegExp) {
    return renderPrimitive(value);
  }

  if (ancestors.has(value)) {
    return <span className="console-circular">[Circular]</span>;
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(value);

  const entries = Object.entries(value);
  const open = expandLevel > 0;

  return (
    <details className="console-object" open={open}>
      <summary>
        <ChevronRight
          className="console-object-chevron"
          size={13}
          aria-hidden="true"
        />
        <span className="console-object-type">{objectLabel(value)}</span>
        <span className="console-object-preview">{preview(value)}</span>
      </summary>

      <div className="console-object-properties">
        {entries.length ? (
          entries.map(([key, child]) => (
            <div className="console-property" key={key}>
              <span className="console-property-key">{key}</span>
              <span className="console-property-separator">:</span>
              <ConsoleValue
                value={child}
                expandLevel={Math.max(0, expandLevel - 1)}
                ancestors={nextAncestors}
              />
            </div>
          ))
        ) : (
          <div className="console-object-empty">No enumerable properties</div>
        )}
      </div>
    </details>
  );
}
