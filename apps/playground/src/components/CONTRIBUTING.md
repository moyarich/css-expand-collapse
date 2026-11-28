# Component conventions

Each component owns a `<Name>/` folder, its stylesheet import, public `index.ts`,
and any local helpers. `styles.css` contains only application defaults and resets.
Related internal pieces (such as Console's value renderers) stay with their owner.

CSS theme variables are public inputs. Components map those inputs to private
variables on their own root and use the private variables in declarations:

```css
.search-dialog {
  --_search-background: var(--search-background, #fff);
  background: var(--_search-background);
}
```

Set public variables on the component or an ancestor. Avoid assigning defaults to
public variables inside a component, since that would mask inherited overrides.
Console and its portalled context menu retain their existing `--console-*` public
names. Search, Markdown, CodeBlock, CodeGroup, DocsLayout, Outline, CSSConverter,
APIRunner, and ResizableWorkspace expose variables with their corresponding
hyphenated prefixes.

APIRunner owns TypeScript execution helpers and its panel styles. CSSConverter
owns CSS formatting helpers. MonacoEditor initializes its own runtime. Outline
owns its heading types. DocsLayout owns app routing and repository content wiring.

MarkdownProvider supplies Lucide icons, Outline, CodeGroup, CodeTab, and CodeBlock.
CodeBlock wraps compiled code fences and copies their rendered text. CodeGroup
provides keyboard-accessible tabs; Shiki highlighting is configured in Vite and
runs at build time, without loading a highlighter into the browser.

## Regular React usage

CodeGroup and CodeTab are ordinary React components. They require neither MDX nor
MarkdownProvider and load their own CSS. Each CodeTab accepts arbitrary React
children; use CodeBlock when you want a copy button around plain or pre-highlighted
code. Shiki highlighting applies to Markdown fences at build time; plain JSX code
is rendered as supplied.

```tsx
import { CodeGroup, CodeTab } from "./components/CodeGroup";
import { CodeBlock } from "./components/CodeBlock";

<CodeGroup>
  <CodeTab label="npm">
    <CodeBlock>
      <code>npm install my-package</code>
    </CodeBlock>
  </CodeTab>
  <CodeTab label="pnpm">
    <CodeBlock>
      <code>pnpm add my-package</code>
    </CodeBlock>
  </CodeTab>
</CodeGroup>;
```

See the CodeGroup / ReactUsage story for the npm, pnpm, yarn, and bun example.
