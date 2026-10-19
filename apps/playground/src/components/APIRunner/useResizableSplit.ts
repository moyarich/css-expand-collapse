import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

export interface UseResizableSplitOptions {
  /** Initial size of the first pane, as a percentage. */
  defaultSize?: number;
  min?: number;
  max?: number;
  /** Percentage change per arrow-key press. */
  step?: number;
  /** "horizontal" = panes side by side, "vertical" = panes stacked. */
  direction?: "horizontal" | "vertical";
  /** CSS custom property that receives the size. */
  cssVar?: string;
}

export function useResizableSplit<T extends HTMLElement = HTMLElement>({
  defaultSize = 50, min = 20, max = 80, step = 2,
  direction = "horizontal", cssVar = "--split-size",
}: UseResizableSplitOptions = {}) {
  const containerRef = useRef<T>(null);
  const resizingRef = useRef(false);
  const [size, setSizeState] = useState(defaultSize);
  const isHorizontal = direction === "horizontal";
  const clamp = (value: number) => Math.min(max, Math.max(min, value));
  const setSize = (value: number) => setSizeState(clamp(value));
  const reset = () => setSize(defaultSize);
  const resizeFromPointer = (event: PointerEvent<HTMLElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const total = isHorizontal ? bounds.width : bounds.height;
    if (!total) return;
    const offset = isHorizontal ? event.clientX - bounds.left : event.clientY - bounds.top;
    setSize((offset / total) * 100);
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    resizingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeFromPointer(event);
    event.preventDefault();
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (resizingRef.current) resizeFromPointer(event);
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    resizingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const decrease = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const increase = isHorizontal ? "ArrowRight" : "ArrowDown";
    let next = size;
    if (event.key === decrease) next -= step;
    else if (event.key === increase) next += step;
    else if (event.key === "Home") next = min;
    else if (event.key === "End") next = max;
    else return;
    event.preventDefault();
    setSize(next);
  };
  const separatorProps = {
    role: "separator" as const,
    "aria-orientation": (isHorizontal ? "vertical" : "horizontal") as "vertical" | "horizontal",
    "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": Math.round(size),
    tabIndex: 0, onDoubleClick: reset, onKeyDown,
    onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp,
  };
  const style = { [cssVar]: `${size}%` } as CSSProperties;
  return { containerRef, size, setSize, reset, separatorProps, style };
}
