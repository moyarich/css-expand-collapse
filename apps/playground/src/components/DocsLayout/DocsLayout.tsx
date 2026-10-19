import "./DocsLayout.css";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Layout primitives only; routing, search, registry and navigation belong to consumers. */
function Root({ children }: { children: ReactNode }) {
  return <div className="app-shell">{children}</div>;
}
function Header({ className = "", ...props }: ComponentPropsWithoutRef<"header">) {
  return <header className={`site-header ${className}`.trim()} {...props} />;
}
function Body({ collapsed = false, className = "", ...props }: ComponentPropsWithoutRef<"div"> & { collapsed?: boolean }) {
  return <div className={`docs-layout ${collapsed ? "sidebar-collapsed" : ""} ${className}`.trim()} {...props} />;
}
function Sidebar({ className = "", ...props }: ComponentPropsWithoutRef<"aside">) {
  return <aside className={`docs-sidebar ${className}`.trim()} {...props} />;
}
function Content({ className = "", ...props }: ComponentPropsWithoutRef<"main">) {
  return <main className={`docs-content ${className}`.trim()} {...props} />;
}
function Aside({ className = "", ...props }: ComponentPropsWithoutRef<"aside">) {
  return <aside className={`page-outline ${className}`.trim()} {...props} />;
}

export const DocsLayout = Object.assign(Root, { Header, Body, Sidebar, Content, Aside });
