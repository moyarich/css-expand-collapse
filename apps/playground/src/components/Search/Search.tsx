import "./Search.css";
import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export interface SearchPage {
  path: string;
  label: string;
  description: string;
  searchText: string;
}

export function Search({
  pages,
  onNavigate,
}: {
  pages: readonly SearchPage[];
  onNavigate: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = pages
    .filter((page) =>
      terms.every((term) =>
        `${page.label} ${page.description} ${page.searchText}`
          .toLowerCase()
          .includes(term),
      ),
    )
    .slice(0, 20);
  const open = () => {
    dialog.current?.showModal();
    input.current?.focus();
  };
  const choose = (page: SearchPage) => {
    dialog.current?.close();
    navigate(page.path);
    onNavigate();
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <>
      <button className="search-trigger" type="button" onClick={open}>
        <SearchIcon size={16} aria-hidden="true" />
        <span>Search examples…</span>
        <kbd>⌘ / Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label="Search examples"
        onClose={() => {
          setQuery("");
          setSelected(0);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className="search-input-row">
          <SearchIcon size={20} aria-hidden="true" />
          <input
            ref={input}
            value={query}
            placeholder="Search examples and API…"
            aria-label="Search examples"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length ? `search-result-${selected}` : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setSelected((value) =>
                  results.length
                    ? (value +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        results.length) %
                      results.length
                    : 0,
                );
              } else if (event.key === "Enter" && results[selected]) {
                event.preventDefault();
                choose(results[selected]);
              }
            }}
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <div
          id="search-results"
          role="listbox"
          aria-label="Matching examples"
          className="search-results"
        >
          {results.map((page, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === selected}
              id={`search-result-${index}`}
              key={page.path}
              onClick={() => choose(page)}
            >
              <span className="search-result-section">
                {page.path.startsWith("/api")
                  ? "API Playground"
                  : "CSS Converter"}
              </span>
              <strong>
                {page.label}
                <ArrowRight size={14} aria-hidden="true" />
              </strong>
              <span>{page.description}</span>
            </button>
          ))}
        </div>
        {!results.length && (
          <p className="search-empty" role="status">
            No examples found. Try another search.
          </p>
        )}
        <div className="search-footer">
          <span>↑ ↓ to navigate · Enter to open</span>
          <span>Esc to close</span>
        </div>
      </dialog>
    </>
  );
}
