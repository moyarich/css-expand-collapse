import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = quad("margin");
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
