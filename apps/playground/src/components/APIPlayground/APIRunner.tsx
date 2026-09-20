import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Play } from "lucide-react";
import { MonacoEditor } from "../MonacoEditor";
import { ConsolePanel, RunOutput } from "../Console/ConsolePanel";
import { runFunctionSource } from "./run";

export interface APIRunnerProps {
  initialSource: string;
}

const DEFAULT_EDITOR_SIZE = 58;
const MIN_EDITOR_SIZE = 30;
const MAX_EDITOR_SIZE = 75;

function clampEditorSize(value: number): number {
  return Math.min(MAX_EDITOR_SIZE, Math.max(MIN_EDITOR_SIZE, value));
}

export function APIRunner({ initialSource }: APIRunnerProps) {
  const workspaceRef = useRef<HTMLElement>(null);
  const resizingRef = useRef(false);
  const [source, setSource] = useState(initialSource);
  const [output, setOutput] = useState<RunOutput>(() =>
    runFunctionSource(initialSource),
  );
  const [editorSize, setEditorSize] = useState(DEFAULT_EDITOR_SIZE);

  const run = (nextSource = source) => {
    setOutput(runFunctionSource(nextSource));
  };

  const clearOutput = () => setOutput({ messages: [], error: "" });

  const resizeFromPointer = (clientX: number) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const bounds = workspace.getBoundingClientRect();
    if (!bounds.width) return;

    const nextSize = ((clientX - bounds.left) / bounds.width) * 100;
    setEditorSize(clampEditorSize(nextSize));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    resizingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeFromPointer(event.clientX);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizeFromPointer(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    resizingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextSize = editorSize;

    switch (event.key) {
      case "ArrowLeft":
        nextSize -= 2;
        break;
      case "ArrowRight":
        nextSize += 2;
        break;
      case "Home":
        nextSize = MIN_EDITOR_SIZE;
        break;
      case "End":
        nextSize = MAX_EDITOR_SIZE;
        break;
      default:
        return;
    }

    event.preventDefault();
    setEditorSize(clampEditorSize(nextSize));
  };

  const workspaceStyle = {
    "--api-editor-size": `${editorSize}%`,
  } as CSSProperties;

  return (
    <section
      ref={workspaceRef}
      className="api-workspace"
      aria-label="API runner"
      style={workspaceStyle}
    >
      <article className="panel api-code-panel">
        <div className="panel-header">
          <div>
            <h2>TypeScript</h2>
            <p>Function usage</p>
          </div>
          <div className="result-actions">
            <button type="button" className="run-button" onClick={() => run()}>
              <Play size={14} aria-hidden="true" />
              Run
            </button>
          </div>
        </div>

        <div className="editor-surface api-editor-surface">
          <MonacoEditor
            path="playground.ts"
            language="typescript"
            value={source}
            onChange={(value) => setSource(value ?? "")}
            onMount={(editor, monaco) => {
              editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                () => run(editor.getValue()),
              );
            }}
            loading={
              <div className="editor-loading">Loading TypeScript editor…</div>
            }
            options={{
              ariaLabel: "TypeScript API playground",
              automaticLayout: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        </div>
      </article>

      <div
        className="api-resize-handle"
        role="separator"
        aria-label="Resize TypeScript editor and console"
        aria-orientation="vertical"
        aria-valuemin={MIN_EDITOR_SIZE}
        aria-valuemax={MAX_EDITOR_SIZE}
        aria-valuenow={Math.round(editorSize)}
        tabIndex={0}
        onDoubleClick={() => setEditorSize(DEFAULT_EDITOR_SIZE)}
        onKeyDown={handleResizeKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="api-resize-grip" aria-hidden="true" />
      </div>

      <ConsolePanel output={output} onClear={clearOutput} />
    </section>
  );
}
