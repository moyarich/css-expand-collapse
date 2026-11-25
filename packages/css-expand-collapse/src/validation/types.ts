import type { CustomPropertyMap } from "../custom-properties.js";

export interface ValidationOptions {
  /** Known case-sensitive variable values. Missing variables remain indeterminate. */
  customProperties?: CustomPropertyMap;
}

export interface ValidationPosition {
  /** One-based line and column; zero-based UTF-16 offset. */
  line: number;
  column: number;
  offset: number;
}

export interface ValidationLocation {
  start: ValidationPosition;
  end: ValidationPosition;
}

export type ValidationDiagnosticCode =
  | "invalid-syntax"
  | "invalid-property-value"
  | "unknown-property"
  | "unresolved-value"
  | "unsupported-context";

export interface ValidationDiagnostic {
  code: ValidationDiagnosticCode;
  severity: "error" | "warning" | "info";
  message: string;
  property?: string;
  value?: string;
  location?: ValidationLocation;
}

export interface ValidationResult {
  /** False for errors, null for indeterminate checks, true otherwise. */
  valid: boolean | null;
  diagnostics: ValidationDiagnostic[];
}
