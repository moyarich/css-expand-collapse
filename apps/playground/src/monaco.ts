import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import TypeScriptWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { CSS_EXPAND_COLLAPSE_TYPES } from "./APIPlayground/packageTypes";

type MonacoEnvironment = {
  getWorker(moduleId: string, label: string): Worker;
};

const runtime = globalThis as typeof globalThis & {
  MonacoEnvironment?: MonacoEnvironment;
};

runtime.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === "css" || label === "scss" || label === "less") {
      return new CssWorker();
    }

    if (label === "typescript" || label === "javascript") {
      return new TypeScriptWorker();
    }

    return new EditorWorker();
  },
};

const typeScriptDefaults = monaco.languages.typescript.typescriptDefaults;
typeScriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowNonTsExtensions: true,
  esModuleInterop: true,
  strict: true,
});
typeScriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});
typeScriptDefaults.addExtraLib(
  CSS_EXPAND_COLLAPSE_TYPES,
  "file:///node_modules/@moyarich/css-expand-collapse/index.d.ts",
);

loader.config({ monaco });
