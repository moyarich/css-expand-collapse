import "./APIPlayground.css";
import { Navigate, useNavigate, useParams } from "react-router";
import { DEFAULT_FUNCTION_EXAMPLE, FUNCTION_EXAMPLES } from "../../examples/APIPlayground";
import { APIRunner } from "./APIRunner";

export function APIPlayground() {
  const navigate = useNavigate();
  const { exampleId } = useParams<{ exampleId: string }>();
  const example = FUNCTION_EXAMPLES.find((item) => item.id === exampleId);

  if (!example) {
    return <Navigate to={`/api/${DEFAULT_FUNCTION_EXAMPLE.id}`} replace />;
  }

  return (
    <div className="api-playground">
      <div className="api-playground-layout">
      <aside className="settings-sidebar api-sidebar" aria-label="API playground examples">
        <section className="sidebar-section example-section">
          <span className="sidebar-section-label">Load example</span>
          <select
            className="example-select"
            value={example.id}
            aria-label="Load function example"
            onChange={(event) => navigate(`/api/${event.target.value}`)}
          >
            {FUNCTION_EXAMPLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </section>

        <section className="sidebar-section">
          <span className="sidebar-section-label">Run</span>
          <p className="sidebar-help">
            Press <kbd>⌘ Enter</kbd> on macOS or <kbd>Ctrl Enter</kbd> on Windows/Linux.
            Output from <code>console.log()</code> appears in the console panel.
          </p>
        </section>
      </aside>

        <APIRunner key={example.id} initialSource={example.source} />
      </div>
    </div>
  );
}
