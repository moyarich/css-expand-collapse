import { expandComponents } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["-webkit-text-stroke-width", "-webkit-text-stroke-color"] as const;
const initialValues = ["0", "currentcolor"] as const;
const expand = expandComponents(longhands, initialValues);

export default { longhands, strategy: "components", initialValues, expand } satisfies ShorthandModule;
