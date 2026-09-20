export type CustomPropertyMap = Readonly<Record<string, string>>;

export interface ResolveCustomPropertiesOptions {
  /**
   * When false, a missing custom property stays unresolved even if var() has a
   * fallback. Stylesheet transforms use this conservative mode because a value
   * missing from the current stylesheet may still be supplied by the cascade.
   */
  allowFallbackForMissing?: boolean;
  /** Guards recursive var() chains. */
  maxDepth?: number;
}

const CSS_WIDE_KEYWORDS = new Set([
  "initial",
  "inherit",
  "unset",
  "revert",
  "revert-layer",
]);

function isIdentifierCharacter(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z0-9_-]/.test(char));
}

function skipQuoted(source: string, index: number): number {
  const quote = source[index]!;
  for (let cursor = index + 1; cursor < source.length; cursor += 1) {
    if (source[cursor] === "\\") {
      cursor += 1;
      continue;
    }
    if (source[cursor] === quote) return cursor;
  }
  return source.length - 1;
}

function skipComment(source: string, index: number): number {
  const close = source.indexOf("*/", index + 2);
  return close === -1 ? source.length - 1 : close + 1;
}

function findVarFunction(source: string, start: number): number {
  for (let index = start; index <= source.length - 4; index += 1) {
    const char = source[index]!;
    if (char === "\"" || char === "'") {
      index = skipQuoted(source, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      index = skipComment(source, index);
      continue;
    }

    if (
      source.slice(index, index + 4).toLowerCase() === "var(" &&
      !isIdentifierCharacter(source[index - 1])
    ) {
      return index;
    }
  }
  return -1;
}

function findClosingParenthesis(source: string, openIndex: number): number {
  let depth = 1;

  for (let index = openIndex + 1; index < source.length; index += 1) {
    const char = source[index]!;
    if (char === "\"" || char === "'") {
      index = skipQuoted(source, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      index = skipComment(source, index);
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function splitVarArguments(source: string): {
  name: string;
  fallback: string | null;
} {
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]!;
    if (char === "\"" || char === "'") {
      index = skipQuoted(source, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      index = skipComment(source, index);
      continue;
    }
    if (char === "(") {
      depth += 1;
      continue;
    }
    if (char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (char === "," && depth === 0) {
      return {
        name: source.slice(0, index).trim(),
        fallback: source.slice(index + 1).trim(),
      };
    }
  }

  return { name: source.trim(), fallback: null };
}

export function isCustomProperty(property: string): boolean {
  return property.trim().startsWith("--");
}

export function hasCustomPropertyReference(value: string): boolean {
  return findVarFunction(value, 0) !== -1;
}

export function collectCustomProperties(
  declarations: Readonly<Record<string, string>>,
): Record<string, string> {
  const output: Record<string, string> = {};

  for (const [property, value] of Object.entries(declarations)) {
    const name = property.trim();
    if (isCustomProperty(name)) output[name] = value.trim();
  }

  return output;
}

export function mergeCustomProperties(
  ...maps: Array<CustomPropertyMap | undefined>
): Record<string, string> {
  const output: Record<string, string> = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [property, value] of Object.entries(map)) {
      if (isCustomProperty(property)) output[property.trim()] = value;
    }
  }
  return output;
}

function resolveText(
  source: string,
  customProperties: CustomPropertyMap,
  options: Required<ResolveCustomPropertiesOptions>,
  stack: Set<string>,
  depth: number,
): string | null {
  if (depth > options.maxDepth) return null;

  let output = "";
  let cursor = 0;

  while (cursor < source.length) {
    const start = findVarFunction(source, cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }

    output += source.slice(cursor, start);

    const close = findClosingParenthesis(source, start + 3);
    if (close === -1) return null;

    const { name, fallback } = splitVarArguments(source.slice(start + 4, close));
    if (!name.startsWith("--")) return null;

    const hasValue = Object.hasOwn(customProperties, name);
    let replacement: string | null = null;

    if (hasValue && !stack.has(name)) {
      const rawValue = customProperties[name]!;
      const isCssWideKeyword = CSS_WIDE_KEYWORDS.has(rawValue.trim().toLowerCase());

      if (!isCssWideKeyword) {
        stack.add(name);
        replacement = resolveText(
          rawValue,
          customProperties,
          options,
          stack,
          depth + 1,
        );
        stack.delete(name);
      }

      if (replacement === null && fallback !== null) {
        replacement = resolveText(
          fallback,
          customProperties,
          options,
          stack,
          depth + 1,
        );
      }
    } else if (hasValue && stack.has(name)) {
      if (fallback !== null) {
        replacement = resolveText(
          fallback,
          customProperties,
          options,
          stack,
          depth + 1,
        );
      }
    } else if (options.allowFallbackForMissing && fallback !== null) {
      replacement = resolveText(
        fallback,
        customProperties,
        options,
        stack,
        depth + 1,
      );
    }

    if (replacement === null) return null;

    output += replacement;
    cursor = close + 1;
  }

  return output;
}

/**
 * Resolves var() references against a known custom-property map.
 *
 * Custom-property names remain case-sensitive. Nested var() references and
 * fallbacks are supported; cycles without a usable fallback return null.
 */
export function resolveCustomProperties(
  value: string,
  customProperties: CustomPropertyMap,
  options: ResolveCustomPropertiesOptions = {},
): string | null {
  return resolveText(
    value,
    customProperties,
    {
      allowFallbackForMissing: options.allowFallbackForMissing ?? true,
      maxDepth: options.maxDepth ?? 64,
    },
    new Set(),
    0,
  );
}
