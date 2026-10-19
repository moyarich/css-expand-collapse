import "./APIRunner.css";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Play } from "lucide-react";
import { MonacoEditor } from "../MonacoEditor";
import { Console, type RunOutput } from "../Console/Console";
import { runFunctionSource } from "./run";
import { useResizableSplit, type UseResizableSplitOptions } from "./useResizableSplit";

const EMPTY_OUTPUT: RunOutput = { messages: [], error: "" };
type MonacoOptions = ComponentProps<typeof MonacoEditor>["options"];

export interface APIRunnerProps {
  initialSource: string;
  runSource?: (source: string) => RunOutput;
  runOnMount?: boolean;
  language?: string;
  path?: string;
  editorLoadingLabel?: string;
  editorOptions?: MonacoOptions;
  title?: string;
  subtitle?: string;
  ariaLabel?: string;
  editorAriaLabel?: string;
  resizeLabel?: string;
  runLabel?: string;
  actions?: ReactNode;
  split?: UseResizableSplitOptions;
}

export function APIRunner({
  initialSource, runSource = runFunctionSource, runOnMount = true,
  language = "typescript", path = "playground.ts",
  editorLoadingLabel = "Loading TypeScript editor…", editorOptions,
  title = "TypeScript", subtitle = "Function usage", ariaLabel = "API runner",
  resizeLabel = "Resize editor and console", runLabel = "Run", actions, split,
  editorAriaLabel = "TypeScript API playground",
}: APIRunnerProps) {
  const [source, setSource] = useState(initialSource);
  const [output, setOutput] = useState<RunOutput>(() => runOnMount ? runSource(initialSource) : EMPTY_OUTPUT);
  const runSourceRef = useRef(runSource);
  runSourceRef.current = runSource;
  const { containerRef, separatorProps, style } = useResizableSplit<HTMLElement>({
    defaultSize: 58, min: 30, max: 75, cssVar: "--api-editor-size", ...split,
  });
  const run = (nextSource = source) => setOutput(runSource(nextSource));
  const clearOutput = () => setOutput(EMPTY_OUTPUT);
  return (
    <section ref={containerRef} className="api-runner api-workspace" aria-label={ariaLabel} style={style}>
      <article className="panel api-code-panel">
        <div className="panel-header">
          <div><h2>{title}</h2><p>{subtitle}</p></div>
          <div className="result-actions">
            {actions}
            <button type="button" className="run-button" onClick={() => run()}>
              <Play size={14} aria-hidden="true" />{runLabel}
            </button>
          </div>
        </div>
        <div className="editor-surface api-editor-surface">
          <MonacoEditor
            path={path} language={language} value={source}
            onChange={(value) => setSource(value ?? "")}
            onMount={(editor, monaco) => {
              editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                () => setOutput(runSourceRef.current(editor.getValue())));
            }}
            loading={<div className="editor-loading">{editorLoadingLabel}</div>}
            options={{
              ariaLabel: editorAriaLabel,
              automaticLayout: true, quickSuggestions: true,
              suggestOnTriggerCharacters: true, ...editorOptions,
            }}
          />
        </div>
      </article>
      <div className="api-resize-handle" aria-label={resizeLabel} {...separatorProps}>
        <span className="api-resize-grip" aria-hidden="true" />
      </div>
      <Console output={output} onClear={clearOutput} />
    </section>
  );
}
