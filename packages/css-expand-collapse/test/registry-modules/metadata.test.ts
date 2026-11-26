import { expect, it } from "vitest";
import { getShorthandMetadata, getLonghands } from "../../src/index.js";

it("exposes public metadata for a recognized shorthand", () => {
  expect(getShorthandMetadata("MARGIN")).toEqual({
    property: "margin",
    category: "spacing",
    longhands: getLonghands("margin"),
    transformable: true,
    capabilities: { expand: true, collapse: true },
    experimental: false,
  });
});
