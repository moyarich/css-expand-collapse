import "./CodeGroup.css";
import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface CodeTabProps {
  label: string;
  children: ReactNode;
}
export function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
}

export function CodeGroup({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children).filter(
    (child) => isValidElement<CodeTabProps>(child) && child.type === CodeTab,
  );
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="code-group">
      <div
        role="tablist"
        aria-label="Code examples"
        className="code-group-tabs"
      >
        {tabs.map((tab, index) => {
          if (!isValidElement<CodeTabProps>(tab)) return null;
          return (
            <button
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel-${index}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              key={index}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? (index + 1) % tabs.length
                    : event.key === "ArrowLeft"
                      ? (index + tabs.length - 1) % tabs.length
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? tabs.length - 1
                          : null;
                if (next === null) return;
                event.preventDefault();
                setActive(next);
                buttons.current[next]?.focus();
              }}
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== index}
          tabIndex={0}
          key={index}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
