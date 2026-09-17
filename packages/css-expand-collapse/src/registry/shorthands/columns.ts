import { expandComponents } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["column-width", "column-count"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandComponents(longhands, initialValues);

export default { longhands, strategy: "components", initialValues, expand } satisfies ShorthandModule;
