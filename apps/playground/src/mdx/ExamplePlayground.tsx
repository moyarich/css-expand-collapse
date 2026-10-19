import { createContext, useContext, type ReactNode } from "react";
const PlaygroundContext = createContext<ReactNode>(null);
export function ExamplePlaygroundProvider({ playground, children }: { playground: ReactNode; children: ReactNode }) {
  return <PlaygroundContext.Provider value={playground}>{children}</PlaygroundContext.Provider>;
}
/** Render the current example's interactive editor at this MDX location. */
export function ExamplePlayground() { return useContext(PlaygroundContext); }
/** Display source explicitly imported by an MDX page. */
export function ExampleSource({ source, language }: { source: string; language?: string }) {
  return <pre><code className={language ? `language-${language}` : undefined}>{source}</code></pre>;
}
