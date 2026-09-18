import * as cssExpandCollapse from "@moyarich/css-expand-collapse";
import * as ts from "typescript";

export interface ConsoleEntry {
  method: string;
  text: string;
  depth: number;
}

export interface RunOutput {
  entries: ConsoleEntry[];
  error: string;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return value.stack || value.message;

  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function formatValues(values: unknown[]): string {
  return values.map(formatValue).join(" ");
}

function createConsole(entries: ConsoleEntry[]): Console {
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();
  let depth = 0;

  const push = (method: string, values: unknown[]) => {
    entries.push({
      method,
      text: formatValues(values),
      depth,
    });
  };

  const elapsed = (label: string): number | null => {
    const startedAt = timers.get(label);
    return startedAt === undefined ? null : performance.now() - startedAt;
  };

  const baseConsole = {
    assert(condition?: boolean, ...values: unknown[]) {
      if (condition) return;
      push("assert", values.length ? ["Assertion failed:", ...values] : ["Assertion failed"]);
    },

    clear() {
      entries.length = 0;
    },

    count(label = "default") {
      const next = (counts.get(label) ?? 0) + 1;
      counts.set(label, next);
      push("count", [`${label}: ${next}`]);
    },

    countReset(label = "default") {
      counts.set(label, 0);
    },

    debug(...values: unknown[]) {
      push("debug", values);
    },

    dir(value: unknown) {
      push("dir", [value]);
    },

    dirxml(...values: unknown[]) {
      push("dirxml", values);
    },

    error(...values: unknown[]) {
      push("error", values);
    },

    group(...values: unknown[]) {
      if (values.length) push("group", values);
      depth += 1;
    },

    groupCollapsed(...values: unknown[]) {
      if (values.length) push("groupCollapsed", values);
      depth += 1;
    },

    groupEnd() {
      depth = Math.max(0, depth - 1);
    },

    info(...values: unknown[]) {
      push("info", values);
    },

    log(...values: unknown[]) {
      push("log", values);
    },

    table(data: unknown, columns?: string[]) {
      if (!columns?.length || !Array.isArray(data)) {
        push("table", [data]);
        return;
      }

      push("table", [
        data.map((row) => {
          if (!row || typeof row !== "object") return row;
          return Object.fromEntries(
            columns.map((column) => [
              column,
              (row as Record<string, unknown>)[column],
            ]),
          );
        }),
      ]);
    },

    time(label = "default") {
      timers.set(label, performance.now());
    },

    timeEnd(label = "default") {
      const duration = elapsed(label);
      if (duration === null) {
        push("warn", [`Timer "${label}" does not exist`]);
        return;
      }

      push("timeEnd", [`${label}: ${duration.toFixed(2)} ms`]);
      timers.delete(label);
    },

    timeLog(label = "default", ...values: unknown[]) {
      const duration = elapsed(label);
      if (duration === null) {
        push("warn", [`Timer "${label}" does not exist`]);
        return;
      }

      push("timeLog", [`${label}: ${duration.toFixed(2)} ms`, ...values]);
    },

    timeStamp(label = "default") {
      push("timeStamp", [label]);
    },

    trace(...values: unknown[]) {
      const stack = new Error().stack
        ?.split("\n")
        .slice(2)
        .join("\n");

      push("trace", stack ? [...values, stack] : values);
    },

    warn(...values: unknown[]) {
      push("warn", values);
    },
  };

  return new Proxy(baseConsole, {
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }

      if (typeof property === "string") {
        return (...values: unknown[]) => push(property, values);
      }

      return undefined;
    },
  }) as Console;
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start == null) return message;

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `${position.line + 1}:${position.character + 1} ${message}`;
}

export function runFunctionSource(source: string): RunOutput {
  const entries: ConsoleEntry[] = [];
  const consoleProxy = createConsole(entries);

  try {
    const compiled = ts.transpileModule(source, {
      fileName: "playground.ts",
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        esModuleInterop: true,
        strict: true,
      },
    });

    const errors = (compiled.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    );

    if (errors.length) {
      return {
        entries,
        error: errors.map(formatDiagnostic).join("\n"),
      };
    }

    const module = { exports: {} as Record<string, unknown> };
    const requirePackage = (id: string) => {
      if (id === "@moyarich/css-expand-collapse") return cssExpandCollapse;
      throw new Error(
        `The API playground only resolves @moyarich/css-expand-collapse. Cannot import: ${id}`,
      );
    };

    const execute = new Function(
      "require",
      "module",
      "exports",
      "console",
      `"use strict";\n${compiled.outputText}\n//# sourceURL=css-expand-collapse-playground.js`,
    );

    execute(requirePackage, module, module.exports, consoleProxy);

    return { entries, error: "" };
  } catch (error) {
    return {
      entries,
      error: error instanceof Error ? error.stack || error.message : String(error),
    };
  }
}
