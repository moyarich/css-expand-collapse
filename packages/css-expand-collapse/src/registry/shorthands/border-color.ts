import { quad } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

export default { longhands: quad("border").map((property) => `${property}-color`), strategy: "quad" } satisfies ShorthandDefinition;
