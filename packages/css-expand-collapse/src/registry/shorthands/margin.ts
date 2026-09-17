import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = quad("margin");
const expand = expandQuad(longhands);

export default { longhands, strategy: "quad", expand } satisfies ShorthandModule;
