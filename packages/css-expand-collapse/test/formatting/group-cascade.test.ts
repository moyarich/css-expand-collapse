import { expect, it } from "vitest";
import { formatDeclarations } from "../../src/index.js";

it("keeps duplicates, priorities and overlapping declarations in authored order", () => {
  const source = "margin:1px;color:red!important;margin-left:2px;margin:3px;--Theme:  a  ;--theme:b";
  expect(formatDeclarations(source, { groupBy: "family", trailingSemicolon: false })).toBe(
    "margin: 1px;\n\ncolor: red!important;\n\nmargin-left: 2px;\nmargin: 3px;\n\n--Theme:  a  ;\n--theme:b",
  );
});
