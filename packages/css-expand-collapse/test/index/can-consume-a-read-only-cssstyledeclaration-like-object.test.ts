import { expect, it } from "vitest";
import { collapseStyleDeclaration } from "../../src/index.js";

it("can consume a read-only CSSStyleDeclaration-like object", () => {
  const values: Record<string, string> = {
    "margin-top": "10px",
    "margin-right": "20px",
    "margin-bottom": "10px",
    "margin-left": "20px",
  };
  const properties = Object.keys(values);
  const style = {
    length: properties.length,
    item: (index: number) => properties[index] ?? "",
    getPropertyValue: (property: string) => values[property] ?? "",
  };

  expect(collapseStyleDeclaration(style, "margin")).toMatchObject({
    property: "margin",
    value: "10px 20px",
  });
});
