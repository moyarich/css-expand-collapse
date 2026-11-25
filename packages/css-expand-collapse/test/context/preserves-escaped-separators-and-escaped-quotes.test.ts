import { expect, it } from "vitest";
import {
  splitTopLevelComma,
  splitTopLevelSlash,
  splitTopLevelWhitespace,
} from "../../src/registry/context.js";

it("preserves escaped separators and escaped quotes", () => {
  expect(splitTopLevelComma(String.raw`foo\,bar,baz`)).toEqual([
    String.raw`foo\,bar`,
    "baz",
  ]);
  expect(splitTopLevelComma(String.raw`"a\",b",c`)).toEqual([
    String.raw`"a\",b"`,
    "c",
  ]);
});
