import CodeContainersFixture from "./fixtures/code-containers.md";
import CodeTabsFixture from "./fixtures/code-tabs.mdx";
import MarkdownIcons from "./fixtures/icons.md";
import MdxIcons from "./fixtures/icons.mdx";
import { MarkdownProvider } from "../src/components/Markdown/MarkdownProvider";
import MarkdownFixture, {
  frontmatter,
  tableOfContents,
} from "./fixtures/markdown.mdx";
import { Outline } from "../src/components/Outline/Outline";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Rendering MDX on the server should not initialize Monaco (a browser editor).
vi.mock("../src/components/MonacoEditor", () => ({
  MonacoEditor: () => createElement("div", { "data-testid": "monaco-editor" }),
}));
import {
  FUNCTION_EXAMPLES,
  DEFAULT_FUNCTION_EXAMPLE,
} from "../../../examples/APIPlayground";
import {
  CSS_CONVERTER_EXAMPLES,
  DEFAULT_CSS_CONVERTER_EXAMPLE,
} from "../../../examples/CSSConverter";

describe("MDX example collections", () => {
  it("renders registered example pages without throwing", () => {
    const examples = [...FUNCTION_EXAMPLES, ...CSS_CONVERTER_EXAMPLES];
    expect(FUNCTION_EXAMPLES.length).toBeGreaterThan(0);
    expect(CSS_CONVERTER_EXAMPLES.length).toBeGreaterThan(0);
    for (const example of examples) {
      expect(() =>
        renderToStaticMarkup(
          createElement(MarkdownProvider, {
            children: createElement(example.Component),
          }),
        ),
      ).not.toThrow();
    }
  });

  it("resolves default selections and unique routes", () => {
    expect(
      FUNCTION_EXAMPLES.some(({ id }) => id === DEFAULT_FUNCTION_EXAMPLE.id),
    ).toBe(true);
    expect(
      CSS_CONVERTER_EXAMPLES.some(
        ({ key }) => key === DEFAULT_CSS_CONVERTER_EXAMPLE.key,
      ),
    ).toBe(true);
    expect(new Set(FUNCTION_EXAMPLES.map((example) => example.id)).size).toBe(
      FUNCTION_EXAMPLES.length,
    );
    expect(
      new Set(CSS_CONVERTER_EXAMPLES.map((example) => example.key)).size,
    ).toBe(CSS_CONVERTER_EXAMPLES.length);
  });
});

describe("MDX plugins", () => {
  it("exports YAML metadata and nested headings with matching slugs", () => {
    expect(frontmatter.title).toBe("Markdown support");
    expect(tableOfContents).toEqual([
      {
        value: "Markdown support",
        depth: 2,
        id: "markdown-support",
        children: [{ value: "Details", depth: 3, id: "details" }],
      },
    ]);
    const outline = renderToStaticMarkup(
      createElement(Outline, { headings: tableOfContents }),
    );
    expect(outline).toContain('href="#markdown-support"');
    expect(outline).toContain('href="#details"');
  });
  it("renders GFM tables, tasks, strikethrough, and autolinks", () => {
    const html = renderToStaticMarkup(createElement(MarkdownFixture));
    expect(html).toContain("<table>");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("<del>Old text</del>");
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain("title: Markdown support");
  });
});

it("renders Lucide components without imports in both Markdown and MDX", () => {
  for (const Page of [MarkdownIcons, MdxIcons]) {
    const html = renderToStaticMarkup(
      createElement(MarkdownProvider, { children: createElement(Page) }),
    );
    expect(html).toContain("<svg");
  }
});

it("highlights Markdown fences and renders accessible code tabs with copy controls", () => {
  const html = renderToStaticMarkup(
    createElement(MarkdownProvider, {
      children: createElement(CodeTabsFixture),
    }),
  );
  expect(html).toContain('role="tablist"');
  expect(html).toContain('role="tabpanel"');
  expect(html).toContain('aria-selected="true"');
  expect(html).toContain('aria-label="Copy code"');
  expect(html).toContain("hidden");
});

it("renders multiple Lucide-style code containers with fence labels in Markdown", () => {
  const html = renderToStaticMarkup(
    createElement(MarkdownProvider, {
      children: createElement(CodeContainersFixture),
    }),
  );
  expect(html.match(/role="tablist"/g)).toHaveLength(2);
  expect(html.match(/role="tabpanel"/g)).toHaveLength(4);
  expect(html.match(/aria-selected="true"/g)).toHaveLength(2);
  for (const label of ["npm", "pnpm", "JavaScript", "TypeScript"])
    expect(html).toContain(`>${label}</button>`);
});
