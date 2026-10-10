import "./ResizableWorkspace.css";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";

const DEFAULT_HEIGHT = 488;
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 1200;
const clamp = (height: number) =>
  Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height));

export function ResizableWorkspace({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const drag = useRef<{ y: number; height: number } | null>(null);
  return (
    <div
      className="resizable-workspace"
      style={{ "--workspace-editor-height": `${height}px` } as CSSProperties}
    >
      {children}
      <div
        className="workspace-resize-handle"
        role="separator"
        aria-label="Resize playground workspace height"
        aria-orientation="horizontal"
        aria-valuemin={MIN_HEIGHT}
        aria-valuemax={MAX_HEIGHT}
        aria-valuenow={height}
        aria-valuetext={`${height} pixels`}
        tabIndex={0}
        title="Drag to resize. Use arrow keys, or double-click to reset."
        onPointerDown={(event) => {
          drag.current = { y: event.clientY, height };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          if (drag.current)
            setHeight(
              clamp(drag.current.height + event.clientY - drag.current.y),
            );
        }}
        onPointerUp={(event) => {
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onDoubleClick={() => setHeight(DEFAULT_HEIGHT)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 50 : 20;
          const next =
            event.key === "ArrowUp"
              ? height - step
              : event.key === "ArrowDown"
                ? height + step
                : event.key === "Home"
                  ? MIN_HEIGHT
                  : event.key === "End"
                    ? MAX_HEIGHT
                    : null;
          if (next === null) return;
          event.preventDefault();
          setHeight(clamp(next));
        }}
      >
        <span aria-hidden="true" />
      </div>
    </div>
  );
}
