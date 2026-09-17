import { collapseSlashPair } from "../collapsers.js";
import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["grid-row-start", "grid-row-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandSlashPair(longhands, initialValues);

const collapse = collapseSlashPair(longhands, initialValues);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
