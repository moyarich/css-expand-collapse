import { useMemo, useState } from "react";
import { DEFAULT_FUNCTION_EXAMPLE, FUNCTION_EXAMPLES } from "../../examples/APIPlayground";
import { APIRunner } from "./APIRunner";

export function APIPlayground() {
  const [selectedExample, setSelectedExample] = useState(DEFAULT_FUNCTION_EXAMPLE.id);
  const example = useMemo(
    () => FUNCTION_EXAMPLES.find((item) => item.id === selectedExample) ?? DEFAULT_FUNCTION_EXAMPLE,
    [selectedExample],
  );

  return (
    <div className="api-playground-layout">
      <aside className="settings-sidebar api-sidebar" aria-label="API playground examples">
        <section className="sidebar-section example-section">
          <span className="sidebar-section-label">Load example</span>
          <select
            className="example-select"
            value={selectedExample}
            aria-label="Load function example"
            onChange={(event) => setSelectedExample(event.target.value)}
          >
            {FUNCTION_EXAMPLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </section>

        <section className="sidebar-section">
          <span className="sidebar-section-label">About</span>
          <p className="sidebar-help">
            Write TypeScript using the real package API. Imports from
            <code>@moyarich/css-expand-collapse</code> resolve directly to the bundled library.
          </p>
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
  );
}
