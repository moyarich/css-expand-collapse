import gridTemplate from "./grid-template.js";
import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
] as const;
const initialValues = ["auto", "row", "auto", "none", "none", "none"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("grid", value)) return null;

  const template = gridTemplate.expand(value, context);
  if (template) {
    return {
      "grid-auto-columns": initialValues[0],
      "grid-auto-flow": initialValues[1],
      "grid-auto-rows": initialValues[2],
      "grid-template-areas": template["grid-template-areas"]!,
      "grid-template-columns": template["grid-template-columns"]!,
      "grid-template-rows": template["grid-template-rows"]!,
    };
  }

  const slash = context.splitSlash(value);
  if (slash.length !== 2 || slash.some((part) => !part)) return null;
  const left = context.splitWhitespace(slash[0]!);
  const right = context.splitWhitespace(slash[1]!);
  const leftFlow = left.includes("auto-flow");
  const rightFlow = right.includes("auto-flow");
  if (leftFlow === rightFlow) return null;

  if (leftFlow) {
    const dense = left.includes("dense");
    const autoRows = left.filter((token) => token !== "auto-flow" && token !== "dense").join(" ") || "auto";
    const columns = slash[1]!;
    const flow = dense ? "row dense" : "row";
    if (!context.matchProperty("grid-auto-flow", flow)) return null;
    if (!context.matchProperty("grid-auto-rows", autoRows)) return null;
    if (!context.matchProperty("grid-template-columns", columns)) return null;
    return {
      "grid-auto-columns": "auto",
      "grid-auto-flow": flow,
      "grid-auto-rows": autoRows,
      "grid-template-areas": "none",
      "grid-template-columns": columns,
      "grid-template-rows": "none",
    };
  }

  const dense = right.includes("dense");
  const autoColumns = right.filter((token) => token !== "auto-flow" && token !== "dense").join(" ") || "auto";
  const rows = slash[0]!;
  const flow = dense ? "column dense" : "column";
  if (!context.matchProperty("grid-auto-flow", flow)) return null;
  if (!context.matchProperty("grid-auto-columns", autoColumns)) return null;
  if (!context.matchProperty("grid-template-rows", rows)) return null;
  return {
    "grid-auto-columns": autoColumns,
    "grid-auto-flow": flow,
    "grid-auto-rows": "auto",
    "grid-template-areas": "none",
    "grid-template-columns": "none",
    "grid-template-rows": rows,
  };
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const autoColumns = declarations["grid-auto-columns"];
    const autoFlow = declarations["grid-auto-flow"];
    const autoRows = declarations["grid-auto-rows"];
    const areas = declarations["grid-template-areas"];
    const columns = declarations["grid-template-columns"];
    const rows = declarations["grid-template-rows"];
    if (!autoColumns || !autoFlow || !autoRows || !areas || !columns || !rows) return null;

    if (autoColumns === "auto" && autoRows === "auto" && autoFlow === "row") {
      const candidate = gridTemplate.collapse?.({
        "grid-template-areas": areas,
        "grid-template-columns": columns,
        "grid-template-rows": rows,
      }, context);
      if (candidate && context.matchProperty("grid", candidate)) return candidate;
    }

    if (areas !== "none") return null;

    if ((autoFlow === "row" || autoFlow === "row dense") && rows === "none" && autoColumns === "auto") {
      const dense = autoFlow.includes("dense") ? " dense" : "";
      const auto = autoRows === "auto" ? "" : ` ${autoRows}`;
      const candidate = `auto-flow${dense}${auto} / ${columns}`;
      return context.matchProperty("grid", candidate) ? candidate : null;
    }

    if ((autoFlow === "column" || autoFlow === "column dense") && columns === "none" && autoRows === "auto") {
      const dense = autoFlow.includes("dense") ? " dense" : "";
      const auto = autoColumns === "auto" ? "" : ` ${autoColumns}`;
      const candidate = `${rows} / auto-flow${dense}${auto}`;
      return context.matchProperty("grid", candidate) ? candidate : null;
    }

    return null;
  },
} satisfies ShorthandModule;
