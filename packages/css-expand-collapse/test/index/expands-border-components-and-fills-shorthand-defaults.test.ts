import { expect, it } from "vitest";
import {
  collapseStyleDeclaration,
  collapseCss,
  collapseLonghands,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  getLonghands,
  getShorthands,
  isLonghand,
  isShorthand,
} from "../../src/index.js";

it("expands border components and fills shorthand defaults", () => {
  const result = expandShorthand("border", "2px solid red");
  expect(result?.declarations["border-top-width"]).toBe("2px");
  expect(result?.declarations["border-right-style"]).toBe("solid");
  expect(result?.declarations["border-bottom-color"]).toBe("red");
  expect(result?.declarations["border-left-width"]).toBe("2px");
});
