import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("removes computed transition longhands despite comma whitespace differences", () => {
  const css = collapseCss(`
    .bubble {
      transition: translate 0.2s ease-out, scale 0.2s ease-out;
      transition-property: translate, scale;
      transition-duration: 0.2s, 0.2s;
      transition-timing-function: ease-out, ease-out;
    }
  `);

  expect(css).toContain(
    "transition:translate 0.2s ease-out,scale 0.2s ease-out",
  );
  expect(css).not.toContain("transition-property");
  expect(css).not.toContain("transition-duration");
  expect(css).not.toContain("transition-timing-function");
});
