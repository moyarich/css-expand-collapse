import { collapseSlashPair } from "../collapsers.js";
import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["grid-column-start", "auto"],
  ["grid-column-end", "auto"],
] as const);
const expand = expandSlashPair(longhands);

const collapse = collapseSlashPair(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
