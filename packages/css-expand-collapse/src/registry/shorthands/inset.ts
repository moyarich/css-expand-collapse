import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["top", "right", "bottom", "left"] as const;
const initialValues = ["auto", "auto", "auto", "auto"] as const;
const expand = expandQuad(longhands);

const collapse = collapseQuad(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
