import { expect, it } from "vitest";
import { styleToDeclarations } from "../../src/index.js";

it.fails("custom property case", () => {
  const style = {
    length: 2,
    item: (index: number) => ["--Color", "--color"][index] ?? "",
    getPropertyValue: (property: string) => property === "--Color" ? "red" : "blue",
  };
  expect(styleToDeclarations(style)).toEqual({ "--Color": "red", "--color": "blue" });
});
