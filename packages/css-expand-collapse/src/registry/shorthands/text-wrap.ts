import { collapseComponents } from "../collapsers.js";
import { expandComponents } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["text-wrap-mode", "text-wrap-style"] as const;
const initialValues = ["wrap", "auto"] as const;
const expand = expandComponents(longhands, initialValues);

const collapse = collapseComponents(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
