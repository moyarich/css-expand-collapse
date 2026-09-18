import * as cssExpandCollapse from "@moyarich/css-expand-collapse";
import * as ts from "typescript";

export type ConsoleFeedMethod =
  | "log"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "table"
  | "clear"
  | "time"
  | "timeEnd"
  | "count"
  | "assert"
  | "command"
  | "result"
  | "dir";

export interface ConsoleFeedMessage {
  method: ConsoleFeedMethod;
  data: unknown[];
}

export interface RunOutput {
  logs: ConsoleFeedMessage[];
  error: string;
}

function createConsole(logs: ConsoleFeedMessage[]): Console {
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();

  const push = (method: ConsoleFeedMethod, data: unknown[]) => {
    logs.push({ method, data });
  };

  const elapsed = (label: string): number | null => {
    const startedAt = timers.get(label);
    return startedAt === undefined ? null : performance.now() - startedAt;
  };

  const baseConsole = {
    assert(condition?: boolean, ...values: unknown[]) {
      if (condition) return;
      push("assert", values.length ? values : ["Assertion failed"]);
    },

    clear() {
      logs.length = 0;
    },

    count(label = "default") {
      const next = (counts.get(label) ?? 0) + 1;
      counts.set(label, next);
      push("count", [`${label}: ${next}`]);
    },

    countReset(label = "default") {
      counts.set(label, 0);
      push("debug", [`Count reset: ${label}`]);
    },

    debug(...values: unknown[]) {
      push("debug", values);
    },

    dir(value: unknown, _options?: unknown) {
      push("dir", [value]);
    },

    dirxml(...values: unknown[]) {
      push("dir", values);
    },

    error(...values: unknown[]) {
      push("error", values);
    },

    group(...values: unknown[]) {
      if (values.length) push("log", values);
    },

    groupCollapsed(...values: unknown[]) {
      if (values.length) push("log", values);
    },

    groupEnd() {},

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

      push("log", [`${label}: ${duration.toFixed(2)} ms`, ...values]);
    },

    timeStamp(label = "default") {
      push("debug", [`Timestamp: ${label}`]);
    },

    trace(...values: unknown[]) {
      const stack = new Error().stack
        ?.split("\n")
        .slice(2)
        .join("\n");

      push("debug", stack ? [...values, stack] : values);
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
        return (...values: unknown[]) => push("log", [`${property}:`, ...values]);
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
  const logs: ConsoleFeedMessage[] = [];
  const consoleProxy = createConsole(logs);

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
        logs,
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

    return { logs, error: "" };
  } catch (error) {
    return {
      logs,
      error: error instanceof Error ? error.stack || error.message : String(error),
    };
  }
}
