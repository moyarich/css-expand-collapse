import { lexer, parse, walk } from "css-tree";
import {
  hasCustomPropertyReference,
  isCustomProperty,
  resolveCustomProperties,
} from "../custom-properties.js";
import { syntaxDiagnostic, validationResult } from "./diagnostics.js";
import type { ValidationOptions, ValidationResult } from "./types.js";

/** Validate a property value against the available CSS grammar, without transforming it. */
export function validateProperty(
  property: string,
  value: string,
  options: ValidationOptions = {},
): ValidationResult {
  const name = property.trim();
  const diagnostic = {
    property: name,
    value,
  };
  try {
    // Parse the value even for custom properties, so malformed syntax is not
    // silently accepted. Custom properties may contain arbitrary token streams.
    const ast = parse(value, { context: "value" });
    if (!name || !/^[-_a-zA-Z\u0080-\uFFFF][-_a-zA-Z0-9\u0080-\uFFFF]*$/.test(name)) {
      return validationResult([
        {
          ...diagnostic,
          code: "invalid-syntax",
          severity: "error",
          message: "Invalid CSS property name.",
        },
      ]);
    }
    if (isCustomProperty(name)) return validationResult([]);
    if (!value.trim()) {
      return validationResult([
        {
          ...diagnostic,
          code: "invalid-property-value",
          severity: "error",
          message: "A property value is required.",
        },
      ]);
    }
    const normalized = name.toLowerCase();
    if (!lexer.getProperty(normalized)) {
      return validationResult([
        {
          ...diagnostic,
          code: "unknown-property",
          severity: "warning",
          message: `No known CSS grammar for "${name}".`,
        },
      ]);
    }
    let resolved: string | null = value;
    if (hasCustomPropertyReference(value)) {
      resolved = resolveCustomProperties(value, options.customProperties ?? {}, {
        allowFallbackForMissing: false,
      });
    }
    let runtimeDependent = false;
    if (resolved !== null) {
      walk(resolved === value ? ast : parse(resolved, { context: "value" }), {
        visit: "Function",
        enter(node) {
          if (["var", "env", "attr"].includes(node.name.toLowerCase())) {
            runtimeDependent = true;
          }
        },
      });
    }
    if (resolved === null || runtimeDependent) {
      return validationResult([
        {
          ...diagnostic,
          code: "unresolved-value",
          severity: "info",
          message: "The value depends on runtime CSS information.",
        },
      ]);
    }
    const match = lexer.matchProperty(normalized, resolved);
    if (match.matched && !match.error) return validationResult([]);
    return validationResult([
      {
        ...diagnostic,
        code: "invalid-property-value",
        severity: "error",
        message: `Invalid value for "${name}" according to the available CSS grammar.`,
      },
    ]);
  } catch (error) {
    return validationResult([{ ...syntaxDiagnostic(error), ...diagnostic }]);
  }
}
