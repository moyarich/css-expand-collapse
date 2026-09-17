import { expandSlashPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["container-name", "container-type"] as const;
const initialValues = ["none", "normal"] as const;
const expand = expandSlashPair(longhands, initialValues);

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandModule;
