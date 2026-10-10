import "./Outline.css";
import type { MouseEvent } from "react";
import type { TocEntry } from "./types";

export interface OutlineProps {
  headings: readonly TocEntry[];
}

function scrollToHeading(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document
    .getElementById(decodeURIComponent(event.currentTarget.hash.slice(1)))
    ?.scrollIntoView({ behavior: "smooth" });
}

export function Outline({ headings }: OutlineProps) {
  return (
    <nav aria-label="Page headings" className="outline-headings">
      <ul>
        {headings.map((heading, index) => (
          <li key={heading.id ?? index}>
            {heading.id ? (
              <a
                href={`#${encodeURIComponent(heading.id)}`}
                onClick={scrollToHeading}
              >
                {heading.value}
              </a>
            ) : (
              <span>{heading.value}</span>
            )}
            {!!heading.children?.length && (
              <Outline headings={heading.children} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
