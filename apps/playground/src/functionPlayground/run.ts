import * as cssExpandCollapse from "@moyarich/css-expand-collapse";
import * as ts from "typescript";

export interface RunOutput {
  lines: string[];
  error: string;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return value.stack || value.message;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start == null) return message;

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `${position.line + 1}:${position.character + 1} ${message}`;
}

export function runFunctionSource(source: string): RunOutput {
  const lines: string[] = [];
  const consoleProxy = {
    log: (...values: unknown[]) => lines.push(values.map(formatValue).join(" ")),
    info: (...values: unknown[]) => lines.push(values.map(formatValue).join(" ")),
    warn: (...values: unknown[]) => lines.push(`Warning: ${values.map(formatValue).join(" ")}`),
    error: (...values: unknown[]) => lines.push(`Error: ${values.map(formatValue).join(" ")}`),
  };

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
        lines,
        error: errors.map(formatDiagnostic).join("\n"),
      };
    }

    const module = { exports: {} as Record<string, unknown> };
    const requirePackage = (id: string) => {
      if (id === "@moyarich/css-expand-collapse") return cssExpandCollapse;
      throw new Error(`The API playground only resolves @moyarich/css-expand-collapse. Cannot import: ${id}`);
    };

    const execute = new Function(
      "require",
      "module",
      "exports",
      "console",
      `"use strict";\n${compiled.outputText}\n//# sourceURL=css-expand-collapse-playground.js`,
    );

    execute(requirePackage, module, module.exports, consoleProxy);

    return { lines, error: "" };
  } catch (error) {
    return {
      lines,
      error: error instanceof Error ? error.stack || error.message : String(error),
    };
  }
}
