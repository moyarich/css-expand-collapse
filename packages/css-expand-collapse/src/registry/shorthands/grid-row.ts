import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["grid-row-start", "grid-row-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandSlashPair(longhands, initialValues);

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandModule;
