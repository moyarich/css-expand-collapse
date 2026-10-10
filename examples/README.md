# Examples

Examples follow MoyaForge's repository-owned content pattern: each example folder
contains a `page.mdx` entry point. Its named `frontmatter` export holds navigation
metadata, and its default export is the compiled MDX React component. No MoyaForge
runtime dependency is required.

- `APIPlayground/<id>/page.mdx` pairs with `source.tsx`.
- `CSSConverter/<mode>/<id>/page.mdx` pairs with `source.css`.

Keep the folder name and `frontmatter.id` equal. The playground uses `order` for
example ordering and `group` / `groupOrder` for CSS converter groups. Source files
remain separate so the editors load their original text without executing it.

```mdx
---
id: my-example
label: My example
description: What this example demonstrates.
order: 100
---

## My example

{frontmatter.description}
```

The playground compiles MDX with `@mdx-js/rollup` and standard `@mdx-js/react`
provider support. Pages can use Markdown, JSX, and imported React components.
Another consumer can discover these same pages with
`import.meta.glob("./examples/**/page.mdx", { eager: true })` and provide its own
MDX components or MoyaForge content helpers.

YAML frontmatter is exported as `frontmatter`. GFM tables, task lists,
strikethrough, and autolinks are supported. Headings receive stable IDs from
`rehype-slug`; `tableOfContents` is exported by the TOC extraction plugin and
rendered by the playground’s `Outline` component. Use literal heading text so
it is available to the build-time extractor.

Both `page.md` and `page.mdx` are compiled with MDX syntax and the same plugins.
Choose one entry point per example folder. Lucide icons are available by their
PascalCase component name without imports, and accept normal Lucide props:

```mdx
<Info size={18} /> Helpful information

<ArrowRight size={16} color="currentColor" />
```

`Outline` is also available: `<Outline headings={tableOfContents} />`. Import
`tableOfContents` from a separate page module if embedding that page’s outline.

VitePress / Lucide code groups are also supported in both `.md` and `.mdx`:

````md
::: code-group

```sh [npm]
npm install @moyarich/css-expand-collapse
```

```sh [pnpm]
pnpm add @moyarich/css-expand-collapse
```

:::
````

Each fence’s bracketed label becomes a tab. Multiple groups on a page have
independent selection and unique accessible IDs. Unlabelled fences use their
language as the tab label. Code groups retain Shiki highlighting and copy controls.
