import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = quad("border").map((property) => `${property}-width`);
const expand = expandQuad(longhands);

export default { longhands, strategy: "quad", expand } satisfies ShorthandModule;
