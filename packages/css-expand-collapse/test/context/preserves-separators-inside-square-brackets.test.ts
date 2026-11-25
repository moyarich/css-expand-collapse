import { expect, it } from "vitest";
import {
  splitTopLevelComma,
  splitTopLevelSlash,
  splitTopLevelWhitespace,
} from "../../src/registry/context.js";

it("preserves separators inside square brackets", () => {
  expect(splitTopLevelWhitespace("[a b] c")).toEqual(["[a b]", "c"]);
  expect(splitTopLevelComma("[a,b],c")).toEqual(["[a,b]", "c"]);
  expect(splitTopLevelSlash("[a/b]/c")).toEqual(["[a/b]", "c"]);
});
