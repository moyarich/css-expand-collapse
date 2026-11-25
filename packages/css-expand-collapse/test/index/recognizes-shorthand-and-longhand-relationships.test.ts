import { expect, it } from "vitest";
import { getLonghands, getShorthands, isLonghand, isShorthand } from "../../src/index.js";

it("recognizes shorthand and longhand relationships", () => {
  expect(isShorthand("margin")).toBe(true);
  expect(isShorthand("text-decoration")).toBe(true);
  expect(isLonghand("margin-top")).toBe(true);
  expect(getLonghands("margin")).toEqual([
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
  ]);
  expect(getShorthands("margin-top")).toContain("margin");
});
