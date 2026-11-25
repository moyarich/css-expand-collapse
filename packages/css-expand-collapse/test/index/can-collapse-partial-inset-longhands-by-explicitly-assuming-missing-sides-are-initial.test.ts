import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("can collapse partial inset longhands by explicitly assuming missing sides are initial", () => {
  const css = collapseCss(
    `
    .example {
      top: 0;
      right: 0;
      bottom: 0;
    }
  `,
    {
      fillMissingLonghands: "initial",
    },
  );

  expect(css).toContain("inset:0 0 0 auto");
  expect(css).not.toContain("top:0");
  expect(css).not.toContain("right:0");
  expect(css).not.toContain("bottom:0");
});
