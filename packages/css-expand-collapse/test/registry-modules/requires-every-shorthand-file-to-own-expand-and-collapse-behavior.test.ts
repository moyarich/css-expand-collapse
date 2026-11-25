import { expect, it } from "vitest";
import { SHORTHAND_MODULES } from "../../src/registry/index.js";

it("requires every shorthand file to own expand and collapse behavior", () => {
  for (const module of Object.values(SHORTHAND_MODULES)) {
    expect(module.longhands).toBeInstanceOf(Map);
    expect(
      [...module.longhands.keys()].every(
        (value) => typeof value === "string",
      ),
    ).toBe(true);
    expect(
      [...module.longhands.values()].every(
        (value) => typeof value === "string",
      ),
    ).toBe(true);
    expect("initialValues" in module).toBe(false);
    expect(typeof module.expand).toBe("function");
    expect(typeof module.collapse).toBe("function");
    expect("strategy" in module).toBe(false);
  }
});
