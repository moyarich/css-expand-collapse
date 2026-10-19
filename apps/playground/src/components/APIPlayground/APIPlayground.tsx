import { ResizableWorkspace } from "../ResizableWorkspace/ResizableWorkspace";
import "./APIPlayground.css";
import { APIRunner } from "../APIRunner";

export function APIPlayground({ source }: { source: string }) {
  return (
    <div className="api-playground">
      <h2 id="playground" className="workspace-title">
        Try it yourself
      </h2>
      <p className="workspace-description">
        Edit the example and press Run, ⌘ Enter, or Ctrl Enter.
      </p>
      <div className="api-playground-layout">
        <ResizableWorkspace key={source}>
          <APIRunner initialSource={source} />
        </ResizableWorkspace>
      </div>
    </div>
  );
}
