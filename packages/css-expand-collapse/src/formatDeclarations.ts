import { parse, type DeclarationList } from "css-tree";

export type DeclarationGrouping = "family" | "side";

export interface FormatDeclarationsOptions {
  /** Separate adjacent groups with blank lines, without reordering declarations. */
  groupBy?: DeclarationGrouping;
  indent?: string;
  separator?: string;
  trailingSemicolon?: boolean;
}

/**
 * Formats declaration fragments without changing declaration order or value tokens.
 * Invalid fragments are returned unchanged. Comments and whitespace inside values
 * are preserved; separators between declarations are controlled by the caller.
 */
export function formatDeclarations(
  css: string,
  options: FormatDeclarationsOptions = {},
): string {
  let invalid = false;
  try {
    const ast = parse(css, {
      context: "declarationList",
      positions: true,
      onParseError() {
        invalid = true;
      },
    }) as DeclarationList;
    if (invalid) return css;
    const declarations: { property: string; text: string }[] = [];
    let end = 0;
    for (const node of ast.children.toArray()) {
      if (node.type !== "Declaration" || !node.loc) return css;
      const start = node.loc.start.offset;
      const gap = css.slice(end, start);
      // Do not discard comments between declarations or other authored tokens.
      if (!/^[;\s]*$/.test(gap)) return css;
      const original = css.slice(start, node.loc.end.offset);
      const colon = original.indexOf(":");
      if (colon === -1) return css;
      const property = original.slice(0, colon).trim();
      // Preserve raw custom-property values, including significant whitespace.
      const value = original.slice(colon + 1);
      declarations.push({
        property,
        text: (options.indent ?? "") + (property.startsWith("--")
          ? original
          : property + ": " + value.trim()),
      });
      end = node.loc.end.offset;
    }
    if (!/^[;\s]*$/.test(css.slice(end))) return css;
    if (!declarations.length) return "";
    const separator = options.separator ?? "\n";
    return (
      declarations.map((entry, index) => {
        if (!index) return entry.text;
        const previous = declarations[index - 1]!;
        const separated = options.groupBy &&
          declarationGroup(previous.property, options.groupBy) !==
          declarationGroup(entry.property, options.groupBy);
        return ";" + separator + (separated ? separator : "") + entry.text;
      }).join("") +
      (options.trailingSemicolon === false ? "" : ";")
    );
  } catch {
    return css;
  }
}

/** Presentation-only grouping: never change declaration order. */
function declarationGroup(property: string, mode: DeclarationGrouping): string {
  if (property.startsWith("--")) return "custom";
  const name = property.toLowerCase().replace(/^-(?:webkit|moz|ms|o)-/, "");
  if (mode === "side") {
    return name.match(/(?:^|-)(top|right|bottom|left)(?:-|$)/)?.[1] ?? "other";
  }
  return name.split("-")[0]!;
}
