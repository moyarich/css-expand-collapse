import { collapseSlashPair } from "../collapsers.js";
import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["container-name", "none"],
  ["container-type", "normal"],
] as const);
const expand = expandSlashPair(longhands);

const collapse = collapseSlashPair(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
