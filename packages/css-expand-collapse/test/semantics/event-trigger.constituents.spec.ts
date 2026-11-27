import { it } from "vitest";
import { validateProperty } from "../../src/index.js";
import { expectEquivalent } from "./helpers.js";

it("audits event-trigger name and source against the native shorthand", ({ skip }) => {
  const value = "--reveal click()";
  const parts = [["event-trigger-name", "--reveal"], ["event-trigger-source", "click()"]] as const;
  const grammar = [validateProperty("event-trigger", value).valid, ...parts.map(([name, token]) => validateProperty(name, token).valid)];
  const supported = CSS.supports("event-trigger", value) && parts.every(([name, token]) => CSS.supports(name, token));
  console.info("shorthand constituent audit", JSON.stringify({ property: "event-trigger", grammar, supported }));
  if (!supported) {
    skip("Browser does not expose all specified constituents");
    return;
  }
  expectEquivalent(".target{event-trigger:" + value + "}", ".target{" + parts.map(([name, token]) => name + ":" + token).join(";") + "}");
});
