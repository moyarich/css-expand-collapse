import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["grid-column-start", "grid-column-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandSlashPair(longhands, initialValues);

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandModule;
