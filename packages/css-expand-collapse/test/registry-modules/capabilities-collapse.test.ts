import { expect, it } from "vitest";
import { getModuleCapabilities, type ShorthandModule } from "../../src/index.js";

it("derives collapse capabilities from active constituents and handlers", () => {
  const module: ShorthandModule = {
    longhands: new Map([["margin-top", "0"]]),
    collapse: () => "1px",
  };
  expect(getModuleCapabilities(module)).toEqual({ expand: false, collapse: true });
});
