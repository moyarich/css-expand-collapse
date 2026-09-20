import { lexer } from "css-tree";
import {
  hasCustomPropertyReference,
  resolveCustomProperties,
  type CustomPropertyMap,
} from "../custom-properties.js";
import type {
  ShorthandCollapseContext,
  ShorthandExpandContext,
} from "./module.js";

const TAB = 0x0009;                // U+0009  -  \t
const LINEFEED = 0x000a;           // U+000A  -  \n
const FORMFEED = 0x000c;           // U+000C  -  \f
const CARRIAGERETURN = 0x000d;     // U+000D  -  \r
const SPACE = 0x0020;              // U+0020  -  space
const QUOTATIONMARK = 0x0022;      // U+0022  -  "
const APOSTROPHE = 0x0027;         // U+0027  -  '
const LEFTPARENTHESIS = 0x0028;    // U+0028  -  (
const RIGHTPARENTHESIS = 0x0029;   // U+0029  -  )
const COMMA = 0x002c;              // U+002C  -  ,
const SOLIDUS = 0x002f;            // U+002F  -  /
const LEFTSQUAREBRACKET = 0x005b;  // U+005B  -  [
const REVERSESOLIDUS = 0x005c;     // U+005C  -  \
const RIGHTSQUAREBRACKET = 0x005d; // U+005D  -  ]

/**
 * Returns whether a code point is one of the five whitespace characters
 * defined by CSS Syntax.
 */
function isCssWhitespace(code: number): boolean {
  switch (code) {
    case TAB:
    case LINEFEED:
    case FORMFEED:
    case CARRIAGERETURN:
    case SPACE:
      return true;

    default:
      return false;
  }
}

/**
 * Splits a CSS value on a separator that occurs at the top level.
 *
 * Separators inside quoted strings, parentheses, square brackets, or escaped
 * sequences are preserved. When `separatorCode` is `null`, CSS whitespace
 * is used as the separator.
 *
 * This is intentionally a lightweight structural scanner rather than a full
 * CSS parser; grammar validation remains the responsibility of CSSTree.
 */
function splitTopLevel(
  value: string,
  separatorCode: number | null,
  omitEmpty = false,
): string[] {
  const parts: string[] = [];
  const source = value.trim();

  let current = "";
  let quoteCode = 0;
  let escaped = false;
  let parenDepth = 0;
  let bracketDepth = 0;

  const pushCurrent = () => {
    const part = current.trim();

    if (!omitEmpty || part) {
      parts.push(part);
    }

    current = "";
  };

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    const char = source[index]!;

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (quoteCode) {
      current += char;

      switch (code) {
        case REVERSESOLIDUS:
          escaped = true;
          break;

        default:
          if (code === quoteCode) {
            quoteCode = 0;
          }
      }

      continue;
    }

    switch (code) {
      case REVERSESOLIDUS:
        current += char;
        escaped = true;
        continue;

      case APOSTROPHE:
      case QUOTATIONMARK:
        quoteCode = code;
        current += char;
        continue;

      case LEFTPARENTHESIS:
        parenDepth += 1;
        break;

      case RIGHTPARENTHESIS:
        parenDepth = Math.max(0, parenDepth - 1);
        break;

      case LEFTSQUAREBRACKET:
        bracketDepth += 1;
        break;

      case RIGHTSQUAREBRACKET:
        bracketDepth = Math.max(0, bracketDepth - 1);
        break;
    }

    const isSeparator =
      parenDepth === 0 &&
      bracketDepth === 0 &&
      (separatorCode === null
        ? isCssWhitespace(code)
        : code === separatorCode);

    if (isSeparator) {
      pushCurrent();
    } else {
      current += char;
    }
  }

  pushCurrent();

  return parts;
}

/**
 * Splits a CSS value on top-level CSS whitespace.
 *
 * Whitespace inside strings, functions, and square-bracket blocks is preserved.
 */
export const splitTopLevelWhitespace = (value: string): string[] =>
  splitTopLevel(value, null, true);

/**
 * Splits a CSS value on top-level `/` separators.
 *
 * Slashes inside strings, functions, and square-bracket blocks are preserved.
 */
export const splitTopLevelSlash = (value: string): string[] =>
  splitTopLevel(value, SOLIDUS);

/**
 * Splits a CSS value on top-level commas.
 *
 * Commas inside strings, functions, and square-bracket blocks are preserved.
 */
export const splitTopLevelComma = (value: string): string[] =>
  splitTopLevel(value, COMMA);

/**
 * Tests whether a value matches the CSSTree grammar for a CSS property.
 *
 * Invalid or unsupported property/value combinations return `false` instead
 * of propagating lexer errors to shorthand modules.
 */
export function matchProperty(property: string, value: string): boolean {
  try {
    const result = lexer.matchProperty(property, value) as unknown as {
      matched?: unknown;
      error?: unknown;
    };

    return Boolean(result.matched) && !result.error;
  } catch {
    return false;
  }
}

function createScopedMatchProperty(
  customProperties?: CustomPropertyMap,
): (property: string, value: string) => boolean {
  if (!customProperties || !Object.keys(customProperties).length) {
    return matchProperty;
  }

  return (property, value) => {
    if (!hasCustomPropertyReference(value)) {
      return matchProperty(property, value);
    }

    const resolved = resolveCustomProperties(value, customProperties, {
      // A missing source-level variable may still be supplied by another
      // stylesheet or a more specific rule, so do not infer its fallback.
      allowFallbackForMissing: false,
    });

    return resolved !== null && matchProperty(property, resolved);
  };
}

/**
 * Shared runtime-neutral services available while expanding shorthand values.
 */
export const shorthandExpandContext: ShorthandExpandContext = {
  matchProperty,
  splitWhitespace: splitTopLevelWhitespace,
  splitSlash: splitTopLevelSlash,
};

/**
 * Shared runtime-neutral services available while collapsing longhands.
 */
export const shorthandCollapseContext: ShorthandCollapseContext = {
  matchProperty,
};

export function createShorthandExpandContext(
  customProperties?: CustomPropertyMap,
): ShorthandExpandContext {
  return {
    matchProperty: createScopedMatchProperty(customProperties),
    splitWhitespace: splitTopLevelWhitespace,
    splitSlash: splitTopLevelSlash,
  };
}

export function createShorthandCollapseContext(
  customProperties?: CustomPropertyMap,
): ShorthandCollapseContext {
  return {
    matchProperty: createScopedMatchProperty(customProperties),
  };
}
