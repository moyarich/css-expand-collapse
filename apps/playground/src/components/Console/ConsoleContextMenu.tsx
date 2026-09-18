import { Copy, Trash2 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "./ConsoleContextMenu.css";

export interface ConsoleContextMenuProps {
  children: ReactNode;
  disabled?: boolean;
  onClear: () => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

const MENU_WIDTH = 220;
const MENU_HEIGHT = 86;
const VIEWPORT_MARGIN = 8;

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function ConsoleContextMenu({
  children,
  disabled = false,
  onClear,
}: ConsoleContextMenuProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const closeMenu = () => setPosition(null);

  useEffect(() => {
    if (!position) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const handleViewportChange = () => closeMenu();

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    requestAnimationFrame(() => firstActionRef.current?.focus());

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [position]);

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    const maxX = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
    );
    const maxY = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - MENU_HEIGHT - VIEWPORT_MARGIN,
    );

    setPosition({
      x: Math.min(Math.max(VIEWPORT_MARGIN, event.clientX), maxX),
      y: Math.min(Math.max(VIEWPORT_MARGIN, event.clientY), maxY),
    });
  };

  const handleCopy = () => {
    const text = targetRef.current?.innerText.trim() ?? "";
    closeMenu();

    if (text) {
      void writeClipboardText(text);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const actions = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        ".console-context-menu-item:not(:disabled)",
      ) ?? [],
    );

    if (!actions.length) return;

    const currentIndex = actions.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    let nextIndex = 0;

    if (event.key === "End") {
      nextIndex = actions.length - 1;
    } else if (event.key === "ArrowUp") {
      nextIndex = currentIndex <= 0 ? actions.length - 1 : currentIndex - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex =
        currentIndex < 0 || currentIndex === actions.length - 1
          ? 0
          : currentIndex + 1;
    }

    event.preventDefault();
    actions[nextIndex]?.focus();
  };

  return (
    <>
      <div
        ref={targetRef}
        className="console-context-menu-target"
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>

      {position &&
        createPortal(
          <div
            ref={menuRef}
            className="console-context-menu"
            role="menu"
            aria-label="Console actions"
            style={{ left: position.x, top: position.y }}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={handleMenuKeyDown}
          >
            <button
              ref={firstActionRef}
              type="button"
              className="console-context-menu-item"
              role="menuitem"
              disabled={disabled}
              onClick={handleCopy}
            >
              <Copy size={15} aria-hidden="true" />
              <span>Copy console output</span>
            </button>

            <div className="console-context-menu-separator" role="separator" />

            <button
              type="button"
              className="console-context-menu-item console-context-menu-item-danger"
              role="menuitem"
              disabled={disabled}
              onClick={() => {
                closeMenu();
                onClear();
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              <span>Clear console</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
