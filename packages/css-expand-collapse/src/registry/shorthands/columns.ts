import { collapseComponents } from "../collapsers.js";
import { expandComponents } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["column-width", "column-count"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = expandComponents(longhands, initialValues);

const collapse = collapseComponents(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
