import * as cssExpandCollapse from "@moyarich/css-expand-collapse";
import * as ts from "typescript";

export type ConsoleMethod =
  | "log"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "assert"
  | "dir"
  | "table"
  | "count"
  | "timeEnd"
  | "trace"
  | "group"
  | "groupCollapsed";

export interface ConsoleMessage {
  method: ConsoleMethod;
  data: unknown[];
  depth: number;
  columns?: string[];
  expandLevel?: number;
  showNonenumerable?: boolean;
}

export interface RunOutput {
  messages: ConsoleMessage[];
  error: string;
}

interface DirOptions {
  depth?: number | null;
  showHidden?: boolean;
}

function createConsole(messages: ConsoleMessage[]): Console {
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();
  let depth = 0;

  const push = (
    method: ConsoleMethod,
    data: unknown[],
    options: Partial<ConsoleMessage> = {},
  ) => {
    messages.push({
      method,
      data,
      depth,
      ...options,
    });
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
      messages.length = 0;
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

    dir(value: unknown, options?: DirOptions) {
      const requestedDepth = options?.depth;
      const expandLevel =
        requestedDepth === null
          ? 100
          : typeof requestedDepth === "number"
            ? Math.max(0, requestedDepth)
            : 1;

      push("dir", [value], {
        expandLevel,
        showNonenumerable: options?.showHidden === true,
      });
    },

    dirxml(...values: unknown[]) {
      push("dir", values, { expandLevel: 1 });
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
      push("table", [data], {
        columns: columns?.length ? columns : undefined,
      });
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

    timeStamp() {
      // Console timestamps target browser performance tooling rather than
      // printable console output. Supporting the method as a no-op mirrors
      // that behavior without leaking into the playground UI.
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
  const messages: ConsoleMessage[] = [];
  const consoleProxy = createConsole(messages);

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
        messages,
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

    return { messages, error: "" };
  } catch (error) {
    return {
      messages,
      error: error instanceof Error ? error.stack || error.message : String(error),
    };
  }
}
