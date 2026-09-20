import * as cssExpandCollapse from "@moyarich/css-expand-collapse";
import * as ts from "typescript";
import { RunOutput } from "../Console/ConsolePanel";
import {
  ConsoleMessageData,
  createConsoleProxy,
} from "../Console/createConsoleProxy";

interface CompileResult {
  code: string;
  error: string;
}

interface PlaygroundModule {
  exports: Record<string, unknown>;
}

/* ==========================================================================
   Constants
   ========================================================================== */

const PACKAGE_NAME = "@moyarich/css-expand-collapse";
const SOURCE_URL = "css-expand-collapse-api-playground.js";

const SUPPORTED_PACKAGES = new Map([[PACKAGE_NAME, cssExpandCollapse]]);

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  esModuleInterop: true,
  strict: true,
};

/* ==========================================================================
   TypeScript compilation
   ========================================================================== */
function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

  if (!diagnostic.file || diagnostic.start == null) {
    return message;
  }

  const position = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start,
  );

  return `${position.line + 1}:${position.character + 1} ${message}`;
}

function compileSource(source: string): CompileResult {
  const result = ts.transpileModule(source, {
    fileName: "playground.ts",
    reportDiagnostics: true,
    compilerOptions,
  });

  const errors = (result.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );

  return {
    code: result.outputText,
    error: errors.map(formatDiagnostic).join("\n"),
  };
}

function executeSource(code: string, consoleProxy: Console): void {
  const module: PlaygroundModule = {
    exports: {},
  };

  const props = {
    require(id: string) {
      const pkg = SUPPORTED_PACKAGES.get(id);

      if (!pkg) {
        throw new Error(
          `Unsupported package: ${id}. Supported packages: ${[
            ...SUPPORTED_PACKAGES.keys(),
          ].join(", ")}`,
        );
      }

      return pkg;
    },
    module,
    exports: module.exports,
    console: consoleProxy,
  };

  const functionBody = `
"use strict";

const { require, module, exports, console } = props;

${code}

//# sourceURL=${SOURCE_URL}
`;

  new Function("props", functionBody)(props);
}

/* ==========================================================================
   Public API
   ========================================================================== */

export function runFunctionSource(source: string): RunOutput {
  const messages: ConsoleMessageData[] = [];

  try {
    const compiled = compileSource(source);

    if (compiled.error) {
      return {
        messages,
        error: compiled.error,
      };
    }

    executeSource(compiled.code, createConsoleProxy(messages));

    return {
      messages,
      error: "",
    };
  } catch (error) {
    return {
      messages,
      error:
        error instanceof Error ? error.stack || error.message : String(error),
    };
  }
}
