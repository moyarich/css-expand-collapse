import { MarkdownProvider } from "../Markdown/MarkdownProvider";
import { ResizableWorkspace } from "../ResizableWorkspace/ResizableWorkspace";
import "./APIPlayground.css";
import { Navigate, useParams } from "react-router";
import {
  DEFAULT_FUNCTION_EXAMPLE,
  FUNCTION_EXAMPLES,
} from "../../../../../examples/APIPlayground";
import { APIRunner } from "../APIRunner";

export function APIPlayground() {
  const { exampleId } = useParams<{ exampleId: string }>();
  const example = FUNCTION_EXAMPLES.find((item) => item.id === exampleId);

  if (!example) {
    return <Navigate to={`/api/${DEFAULT_FUNCTION_EXAMPLE.id}`} replace />;
  }

  const ExamplePage = example.Component;

  return (
    <div className="api-playground">
      <article id="overview" className="example-documentation">
        <MarkdownProvider>
          <ExamplePage />
        </MarkdownProvider>
      </article>
      <h2 id="playground" className="workspace-title">
        Try it yourself
      </h2>
      <p className="workspace-description">
        Edit the example and press Run, ⌘ Enter, or Ctrl Enter.
      </p>
      <div className="api-playground-layout">
        <ResizableWorkspace key={example.id}>
          <APIRunner initialSource={example.source} />
        </ResizableWorkspace>
      </div>
    </div>
  );
}
