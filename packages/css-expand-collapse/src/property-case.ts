import type { DeclarationMap } from "./core.js";

/** Convert a CSS property name to its JavaScript CSSOM spelling. */
export function toCamelCaseProperty(property: string): string {
  if (property.startsWith("--")) return property;
  const name = property.toLowerCase();
  if (name === "float") return "cssFloat";
  return name
    .replace(/^-ms-/, "ms-")
    .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/** Convert a JavaScript CSSOM property name to CSS spelling. */
export function toKebabCaseProperty(property: string): string {
  if (property.startsWith("--")) return property;
  if (property === "cssFloat") return "float";
  if (property.includes("-")) return property.toLowerCase();
  return property
    .replace(/^(?=ms[A-Z])/, "-")
    .replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
}

/** Convert declaration keys to JavaScript spelling without changing values. */
export function toCamelCaseDeclarations(declarations: DeclarationMap): DeclarationMap {
  return Object.fromEntries(
    Object.entries(declarations).map(([property, value]) => [
      toCamelCaseProperty(property),
      value,
    ]),
  );
}

/** Convert declaration keys to CSS spelling without changing values. */
export function toKebabCaseDeclarations(declarations: DeclarationMap): DeclarationMap {
  return Object.fromEntries(
    Object.entries(declarations).map(([property, value]) => [
      toKebabCaseProperty(property),
      value,
    ]),
  );
}
