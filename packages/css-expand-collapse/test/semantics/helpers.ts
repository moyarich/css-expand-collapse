import { expect } from "vitest";
import { collapseCss, expandCss } from "../../src/index.js";

/** Capture the browser's computed CSS for identical, isolated fixtures. */
function computed(css: string, markup: string, selectors: string[]) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:absolute;width:800px;height:600px;border:0;visibility:hidden";
  document.body.append(frame);
  try {
    const doc = frame.contentDocument!;
    doc.body.innerHTML = markup;
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.append(style);
    return selectors.map((selector) => {
      const element = doc.querySelector(selector);
      if (!element) throw new Error(`Fixture selector not found: ${selector}`);
      const result = frame.contentWindow!.getComputedStyle(element);
      return Object.fromEntries(
        Array.from(result, (property) => [property, result.getPropertyValue(property)]),
      );
    });
  } finally {
    frame.remove();
  }
}

export function expectEquivalent(
  original: string,
  transformed: string,
  markup = '<div class="target">Example</div>',
  selectors = [".target"],
) {
  expect(computed(transformed, markup, selectors)).toEqual(
    computed(original, markup, selectors),
  );
}

export function expectRoundTrip(
  css: string,
  markup?: string,
  selectors?: string[],
) {
  const expanded = expandCss(css);
  const collapsed = collapseCss(expanded);
  expectEquivalent(css, expanded, markup, selectors);
  expectEquivalent(css, collapsed, markup, selectors);
  const directlyCollapsed = collapseCss(css);
  expectEquivalent(css, directlyCollapsed, markup, selectors);
  expectEquivalent(css, expandCss(directlyCollapsed), markup, selectors);
}
