import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("uses plugin grammar extensions only in the owning transformer", () => {
  const plugin = {
    name: "example",
    grammars: { "example-size": (value: string) => value === "small", "example-axis": (value: string) => value === "small" },
    shorthands: {
      "example-size": {
        longhands: new Map([["example-axis", "small"]]),
        expand: (value: string, context: import("../../src/index.js").ShorthandExpandContext) =>
          context.matchProperty("example-axis", value) ? { "example-axis": value } : null,
        collapse: (values: Record<string, string>) => values["example-axis"] ?? null,
      },
    },
  };
  const css = createCssTransformer({ plugins: [plugin] });
  expect(css.expand({ "example-size": "small" })).toEqual({ "example-axis": "small" });
  expect(css.collapse({ "example-axis": "small" })).toEqual({ "example-size": "small" });
  expect(css.expand({ "example-size": "large" })).toEqual({ "example-size": "large" });
  expect(createCssTransformer().isShorthand("example-size")).toBe(false);
});
