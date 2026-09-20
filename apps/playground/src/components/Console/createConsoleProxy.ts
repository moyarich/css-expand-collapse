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

export interface ConsoleMessageData {
  method: ConsoleMethod;
  data: unknown[];
  depth: number;
  columns?: string[];
  expandLevel?: number;
  showNonenumerable?: boolean;
}

export interface DirOptions {
  depth?: number | null;
  showHidden?: boolean;
}

/* ==========================================================================
   Console
   ========================================================================== */

export function createConsoleProxy(messages: ConsoleMessageData[]): Console {
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();

  let depth = 0;

  const getElapsedTime = (label: string) => {
    const startedAt = timers.get(label);

    return startedAt === undefined ? null : performance.now() - startedAt;
  };

  const getDirExpandLevel = (requestedDepth?: number | null) =>
    requestedDepth === null
      ? 100
      : typeof requestedDepth === "number"
        ? Math.max(0, requestedDepth)
        : 1;

  const messageMethods = {
    debug: "debug",
    error: "error",
    info: "info",
    log: "log",
    warn: "warn",
  } satisfies Record<string, ConsoleMethod>;

  const consoleMethods = {
    ...Object.fromEntries(
      Object.entries(messageMethods).map(([name, method]) => [
        name,
        (...data: unknown[]) => {
          messages.push({ method, data, depth });
        },
      ]),
    ),

    assert(condition?: boolean, ...data: unknown[]) {
      if (condition) return;

      messages.push({
        method: "assert",
        data: data.length ? data : ["Assertion failed"],
        depth,
      });
    },

    clear() {
      messages.length = 0;
    },

    count(label = "default") {
      const count = (counts.get(label) ?? 0) + 1;

      counts.set(label, count);

      messages.push({
        method: "count",
        data: [`${label}: ${count}`],
        depth,
      });
    },

    countReset(label = "default") {
      counts.set(label, 0);
    },

    dir(value: unknown, options?: DirOptions) {
      messages.push({
        method: "dir",
        data: [value],
        depth,
        expandLevel: getDirExpandLevel(options?.depth),
        showNonenumerable: options?.showHidden === true,
      });
    },

    dirxml(...data: unknown[]) {
      messages.push({
        method: "dir",
        data,
        depth,
        expandLevel: 1,
      });
    },

    group(...data: unknown[]) {
      if (data.length) {
        messages.push({
          method: "group",
          data,
          depth,
        });
      }

      depth += 1;
    },

    groupCollapsed(...data: unknown[]) {
      if (data.length) {
        messages.push({
          method: "groupCollapsed",
          data,
          depth,
        });
      }

      depth += 1;
    },

    groupEnd() {
      depth = Math.max(0, depth - 1);
    },

    table(data: unknown, columns?: string[]) {
      messages.push({
        method: "table",
        data: [data],
        depth,
        columns: columns?.length ? columns : undefined,
      });
    },

    time(label = "default") {
      timers.set(label, performance.now());
    },

    timeEnd(label = "default") {
      const duration = getElapsedTime(label);

      if (duration === null) {
        messages.push({
          method: "warn",
          data: [`Timer "${label}" does not exist`],
          depth,
        });
        return;
      }

      messages.push({
        method: "timeEnd",
        data: [`${label}: ${duration.toFixed(2)} ms`],
        depth,
      });

      timers.delete(label);
    },

    timeLog(label = "default", ...data: unknown[]) {
      const duration = getElapsedTime(label);

      if (duration === null) {
        messages.push({
          method: "warn",
          data: [`Timer "${label}" does not exist`],
          depth,
        });
        return;
      }

      messages.push({
        method: "log",
        data: [`${label}: ${duration.toFixed(2)} ms`, ...data],
        depth,
      });
    },

    timeStamp() {},

    trace(...data: unknown[]) {
      const stack = new Error().stack?.split("\n").slice(2).join("\n");

      messages.push({
        method: "trace",
        data: stack ? [...data, stack] : data,
        depth,
      });
    },
  };

  return new Proxy(consoleMethods, {
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }

      if (typeof property !== "string") {
        return undefined;
      }

      return (...data: unknown[]) => {
        messages.push({
          method: "log",
          data: [`${property}:`, ...data],
          depth,
        });
      };
    },
  }) as Console;
}
