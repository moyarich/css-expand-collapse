import { expect, it } from "vitest";
import { toCamelCaseProperty, toKebabCaseProperty } from "../../src/index.js";

it("round trips CSS property names", () => {
  for (const property of ["margin-top", "-moz-appearance", "-ms-grid", "--MyValue", "float"]) {
    expect(toKebabCaseProperty(toCamelCaseProperty(property))).toBe(property);
  }
});
