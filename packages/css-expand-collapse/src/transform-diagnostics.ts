import type { CustomPropertyMap } from "./custom-properties.js";
import { validateProperty } from "./validation/validateProperty.js";
import type { ValidationLocation } from "./validation/types.js";

export interface TransformDiagnostic {
  code:
    | "unsupported-transform"
    | "unsafe-or-invalid-value"
    | "collapse-not-safe"
    | "invalid-syntax"
    | "invalid-property-value"
    | "unresolved-value"
    | "unknown-property"
    | "unsafe-transform";
  severity: "info" | "warning" | "error";
  message: string;
  property?: string;
  value?: string;
  location?: ValidationLocation;
}

/** Classify a failed expansion using the standalone validator, only on demand. */
export function describeExpansionFailure(
  property: string,
  value: string,
  supported: boolean,
  customProperties?: CustomPropertyMap,
): TransformDiagnostic {
  if (!supported) {
    return { code: "unsupported-transform", severity: "info", property, value,
      message: "Shorthand transformation is not supported." };
  }
  const result = validateProperty(property, value, { customProperties });
  const diagnostic = result.diagnostics[0];
  if (diagnostic && (
    diagnostic.code === "invalid-syntax" ||
    diagnostic.code === "invalid-property-value" ||
    diagnostic.code === "unresolved-value" ||
    diagnostic.code === "unknown-property"
  )) {
    return { ...diagnostic, code: diagnostic.code };
  }
  return { code: "unsafe-transform", severity: "warning", property, value,
    message: "The value could not be expanded safely." };
}
