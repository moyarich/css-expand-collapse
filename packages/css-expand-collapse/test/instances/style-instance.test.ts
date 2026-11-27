import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("collapses style declarations using instance-local modules", () => {
  const css = createCssTransformer();
  css.addPlugin({ name: "example", grammars: { "example-size": (value) => value === "1px" }, shorthands: {
    "example-size": { longhands: new Map([["margin-top", "0px"]]), collapse: (values) => values["margin-top"] ?? null },
  } });
  const style = { length: 1, item: () => "margin-top", getPropertyValue: (property: string) => property === "margin-top" ? "1px" : "" };
  expect(css.collapseStyleDeclaration(style, "example-size")?.value).toBe("1px");
  expect(createCssTransformer().collapseStyleDeclaration(style, "example-size")).toBeNull();
});
