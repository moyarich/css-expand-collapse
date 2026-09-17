import { collapseSlashPair } from "../collapsers.js";
import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["container-name", "container-type"] as const;
const initialValues = ["none", "normal"] as const;
const expand = expandSlashPair(longhands, initialValues);

const collapse = collapseSlashPair(longhands, initialValues);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
