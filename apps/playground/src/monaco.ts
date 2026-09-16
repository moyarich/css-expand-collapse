import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";

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

    return new EditorWorker();
  },
};

loader.config({ monaco });
