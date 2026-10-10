import "./CodeBlock.css";
import { useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock(props: ComponentProps<"pre">) {
  const code = useRef<HTMLPreElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  return (
    <div className="code-block">
      <pre {...props} ref={code} />
      <button
        type="button"
        className="code-block-copy"
        aria-label={copyState === "copied" ? "Copied code" : "Copy code"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(
              code.current?.textContent ?? "",
            );
            setCopyState("copied");
          } catch {
            setCopyState("failed");
          }
        }}
        onBlur={() => setCopyState("idle")}
      >
        {copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <span className="code-block-status" role="status">
        {copyState === "copied"
          ? "Copied"
          : copyState === "failed"
            ? "Could not copy code"
            : ""}
      </span>
    </div>
  );
}
