import { expect, it } from "vitest";
import { expandPair, createShorthandExpandContext } from "../../src/index.js";

it("reuses the built-in expansion factory through public exports", () => {
  const expand = expandPair(new Map([["row-gap", "normal"], ["column-gap", "normal"]]));
  expect(expand("1px 2px", createShorthandExpandContext())).toEqual({ "row-gap": "1px", "column-gap": "2px" });
});
